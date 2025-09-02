import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { twitterApi } from "@/lib/twitter-api"
import { getFirstNameOrEmail } from "@/lib/utils/name"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const promotionId = params.id

    // Get promotion details
    const promotion = await prisma.promotion.findFirst({
      where: {
        id: promotionId,
        promoterId: user.id,
        status: "VERIFIED"
      },
      include: {
        product: {
          select: {
            name: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!promotion) {
      return NextResponse.json(
        { error: "Promotion not found or not verified" },
        { status: 404 }
      )
    }

    // Only fetch analytics for X/Twitter promotions
    if (promotion.platform !== 'X') {
      return NextResponse.json(
        { error: "Analytics only available for X/Twitter promotions" },
        { status: 400 }
      )
    }

    if (!promotion.platformPostUrl) {
      return NextResponse.json(
        { error: "No post URL found for this promotion" },
        { status: 400 }
      )
    }

    // Extract tweet ID and fetch current analytics
    const tweetId = twitterApi.extractTweetId(promotion.platformPostUrl)
    if (!tweetId) {
      return NextResponse.json(
        { error: "Invalid post URL" },
        { status: 400 }
      )
    }

    const tweetData = await twitterApi.getTweet(tweetId)
    if (!tweetData) {
      return NextResponse.json(
        { error: "Tweet not found or no longer accessible" },
        { status: 404 }
      )
    }

    const analytics = twitterApi.getAnalytics(tweetData)

    // Calculate performance metrics
    const totalEngagement = tweetData.public_metrics.like_count + 
                           tweetData.public_metrics.retweet_count + 
                           tweetData.public_metrics.reply_count + 
                           tweetData.public_metrics.quote_count

    const performanceData = {
      promotion: {
        id: promotion.id,
        content: promotion.content,
        platform: promotion.platform,
        createdAt: promotion.createdAt,
        verifiedAt: promotion.verifiedAt,
        creditsEarned: promotion.creditsEarned
      },
      product: {
        name: promotion.product.name,
        owner: getFirstNameOrEmail(promotion.product.user.name, promotion.product.user.email)
      },
      tweet: {
        id: tweetId,
        text: tweetData.text,
        created_at: tweetData.created_at,
        url: promotion.platformPostUrl
      },
      metrics: {
        likes: tweetData.public_metrics.like_count,
        retweets: tweetData.public_metrics.retweet_count,
        replies: tweetData.public_metrics.reply_count,
        quotes: tweetData.public_metrics.quote_count,
        bookmarks: tweetData.public_metrics.bookmark_count,
        impressions: tweetData.public_metrics.impression_count || 0,
        totalEngagement,
        engagementRate: analytics.engagementRate
      },
      analytics: {
        engagement: analytics.engagement,
        engagementRate: analytics.engagementRate,
        lastUpdated: new Date().toISOString()
      },
      insights: {
        performance: totalEngagement > 10 ? 'High' : totalEngagement > 5 ? 'Medium' : 'Low',
        bestMetric: Object.entries(analytics.engagement).reduce((a, b) => 
          analytics.engagement[a[0] as keyof typeof analytics.engagement] > analytics.engagement[b[0] as keyof typeof analytics.engagement] ? a : b
        )[0],
        daysSincePosted: Math.floor((new Date().getTime() - new Date(tweetData.created_at).getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    return NextResponse.json(performanceData)

  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}