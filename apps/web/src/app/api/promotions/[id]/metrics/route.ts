import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@pumpit/auth"
import { prisma } from "@pumpit/database"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        status: "VERIFIED"
      },
      include: {
        trackingLink: {
          include: {
            promotionClicks: {
              orderBy: { clickedAt: 'desc' },
              take: 100 // Last 100 clicks
            }
          }
        },
        product: {
          select: {
            name: true,
            userId: true
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

    // Check if user has access to view metrics
    const hasAccess = promotion.promoterId === user.id || promotion.product.userId === user.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Get real-time social media metrics
    let socialMetrics = null

    try {
      if (promotion.platform === 'X' && process.env.TWITTER_BEARER_TOKEN) {
        const { TwitterIntegration } = await import("../../../../../../../packages/social-integrations/src/twitter")
        const twitterClient = new TwitterIntegration(process.env.TWITTER_BEARER_TOKEN)
        
        if (promotion.platformPostUrl) {
          const tweetId = promotion.platformPostUrl.match(/status\/(\d+)/)?.[1]
          if (tweetId) {
            socialMetrics = await twitterClient.getPostMetrics(tweetId)
          }
        }
      } else if (promotion.platform === 'LINKEDIN' && process.env.LINKEDIN_ACCESS_TOKEN) {
        const { LinkedInIntegration } = await import("../../../../../../../packages/social-integrations/src/linkedin")
        const linkedInClient = new LinkedInIntegration(process.env.LINKEDIN_ACCESS_TOKEN)
        
        if (promotion.platformPostUrl) {
          const postId = promotion.platformPostUrl.match(/posts\/[^\/]+-(\d+)/)?.[1]
          if (postId) {
            socialMetrics = await linkedInClient.getPostMetrics(postId)
          }
        }
      } else if (promotion.platform === 'REDDIT' && process.env.REDDIT_CLIENT_ID) {
        const { RedditIntegration } = await import("../../../../../../../packages/social-integrations/src/reddit")
        const redditClient = new RedditIntegration(
          process.env.REDDIT_CLIENT_ID,
          process.env.REDDIT_CLIENT_SECRET!,
          process.env.REDDIT_REFRESH_TOKEN!
        )
        
        if (promotion.platformPostUrl) {
          const postId = promotion.platformPostUrl.match(/comments\/(\w+)/)?.[1]
          if (postId) {
            socialMetrics = await redditClient.getPostMetrics(postId)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching social media metrics:', error)
      // Continue without social metrics if API fails
    }

    // Calculate click analytics
    const totalClicks = promotion.trackingLink?.promotionClicks.length || 0
    const uniqueIPs = new Set(promotion.trackingLink?.promotionClicks.map(click => click.ipAddress)).size
    
    // Group clicks by date for chart data
    const clicksByDate = promotion.trackingLink?.promotionClicks.reduce((acc, click) => {
      const date = click.clickedAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Calculate conversion rate (clicks vs social engagement)
    const socialEngagement = socialMetrics ? 
      (socialMetrics.likes + socialMetrics.shares + socialMetrics.comments) : 0
    const conversionRate = socialEngagement > 0 ? (totalClicks / socialEngagement) * 100 : 0

    return NextResponse.json({
      promotion: {
        id: promotion.id,
        platform: promotion.platform,
        createdAt: promotion.createdAt,
        verifiedAt: promotion.verifiedAt,
        creditsEarned: promotion.creditsEarned,
        platformPostUrl: promotion.platformPostUrl
      },
      clickMetrics: {
        totalClicks,
        uniqueClicks: uniqueIPs,
        clicksByDate,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      socialMetrics: socialMetrics ? {
        likes: socialMetrics.likes,
        shares: socialMetrics.shares,
        comments: socialMetrics.comments,
        views: socialMetrics.views || 0,
        engagementRate: socialMetrics.engagementRate || 0,
        lastUpdated: socialMetrics.timestamp
      } : null,
      recentClicks: promotion.trackingLink?.promotionClicks.slice(0, 10).map(click => ({
        ipAddress: click.ipAddress.replace(/\d+$/, 'xxx'), // Anonymize IP
        userAgent: click.userAgent.substring(0, 50) + '...',
        referrer: click.referrer,
        clickedAt: click.clickedAt
      })) || []
    })

  } catch (error) {
    console.error("Metrics API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}