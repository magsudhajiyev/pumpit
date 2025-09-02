import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { twitterApi } from "@/lib/twitter-api"
import { getFirstNameOrEmail } from "@/lib/utils/name"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { promotionId, postUrl } = body

    if (!promotionId || !postUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get promotion details
    const promotion = await prisma.promotion.findFirst({
      where: {
        id: promotionId,
        promoterId: user.id,
        platform: "X",
        status: "PENDING"
      },
      include: {
        trackingLink: true,
        product: true
      }
    })

    if (!promotion) {
      return NextResponse.json(
        { error: "Promotion not found or already verified" },
        { status: 404 }
      )
    }

    // Extract tweet ID from URL
    const tweetId = twitterApi.extractTweetId(postUrl)
    if (!tweetId) {
      return NextResponse.json(
        { error: "Invalid Twitter URL. Please provide a valid tweet URL." },
        { status: 400 }
      )
    }

    // Fetch tweet from Twitter API
    let tweetData
    try {
      tweetData = await twitterApi.getTweetWithAuthor(tweetId)
    } catch (error: any) {
      console.error("Twitter API error:", error.message)
      
      // Handle specific API errors with user-friendly messages
      if (error.message.includes('Rate limit exceeded')) {
        return NextResponse.json(
          { 
            error: "Twitter API rate limit exceeded", 
            details: "Our system is temporarily limited by Twitter's API. Please try again in 15 minutes.",
            retryAfter: "15 minutes"
          },
          { status: 429 }
        )
      }
      
      if (error.message.includes('Tweet not found') || error.message.includes('private')) {
        return NextResponse.json(
          { 
            error: "Tweet not accessible",
            details: "The tweet was not found. It may be private, deleted, or the URL is incorrect."
          },
          { status: 404 }
        )
      }
      
      if (error.message.includes('authentication failed')) {
        return NextResponse.json(
          { 
            error: "API authentication issue",
            details: "There's a temporary issue with our Twitter integration. Please try again later."
          },
          { status: 503 }
        )
      }
      
      // Generic error fallback
      return NextResponse.json(
        { 
          error: "Unable to verify tweet",
          details: error.message || "There was an issue accessing the tweet. Please check the URL and try again."
        },
        { status: 400 }
      )
    }
    
    if (!tweetData) {
      return NextResponse.json(
        { error: "Tweet not found. Make sure the tweet is public and the URL is correct." },
        { status: 404 }
      )
    }

    // Verify tweet content contains promotion content
    const contentVerification = twitterApi.verifyTweetContent(
      tweetData.tweet,
      promotion.content,
      [promotion.product.name, 'PumpIt'] // Keywords to look for
    )

    if (!contentVerification.isValid) {
      return NextResponse.json(
        { 
          error: "Tweet verification failed",
          details: `Verification score: ${contentVerification.score}/100. Issues: ${contentVerification.reasons.join(', ')}`,
          suggestions: [
            "Make sure your tweet contains similar content to what you submitted",
            "Include the product name in your tweet",
            "Write substantial promotional content (at least 50 characters)",
            "Avoid just retweeting - create original content"
          ]
        },
        { status: 400 }
      )
    }

    // Get tweet analytics
    const analytics = twitterApi.getAnalytics(tweetData.tweet)

    const verificationResult = {
      success: true,
      verified: true,
      postId: tweetId,
      tweet: tweetData.tweet,
      author: tweetData.author,
      metrics: {
        likes: tweetData.tweet.public_metrics.like_count,
        retweets: tweetData.tweet.public_metrics.retweet_count,
        replies: tweetData.tweet.public_metrics.reply_count,
        quotes: tweetData.tweet.public_metrics.quote_count,
        bookmarks: tweetData.tweet.public_metrics.bookmark_count,
        impressions: tweetData.tweet.public_metrics.impression_count || 0
      },
      analytics,
      verification: contentVerification
    }

    // Update promotion status
    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        status: "VERIFIED",
        platformPostUrl: postUrl,
        verifiedAt: new Date(),
        creditsEarned: 10 // Award 10 credits for verified promotion
      }
    })

    // Award credits to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: {
          increment: 10
        }
      }
    })

    // Create notification for product owner
    await prisma.notification.create({
      data: {
        userId: promotion.product.userId,
        title: "New Promotion Verified!",
        content: `Your product "${promotion.product.name}" was promoted on X/Twitter by ${getFirstNameOrEmail(user.name, user.email)}`,
        type: "PROMOTION_VERIFIED",
        data: {
          promotionId: promotion.id,
          platform: "X",
          promoterName: getFirstNameOrEmail(user.name, user.email)
        }
      }
    })

    return NextResponse.json({
      success: true,
      promotion: updatedPromotion,
      creditsEarned: 10,
      metrics: verificationResult.metrics,
      analytics: verificationResult.analytics,
      verification: {
        score: contentVerification.score,
        reasons: contentVerification.reasons
      },
      tweet: {
        id: tweetId,
        text: tweetData.tweet.text,
        author: {
          name: tweetData.author.name,
          username: tweetData.author.username,
          verified: tweetData.author.verified
        },
        created_at: tweetData.tweet.created_at
      }
    })

  } catch (error) {
    console.error("X verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 