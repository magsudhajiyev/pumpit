import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

// This endpoint can be called by a cron job to sync metrics
export async function POST(request: NextRequest) {
  try {
    // Basic auth check for cron jobs
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'default-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all verified promotions from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const promotions = await prisma.promotion.findMany({
      where: {
        status: "VERIFIED",
        verifiedAt: {
          gte: thirtyDaysAgo
        },
        platformPostUrl: {
          not: null
        }
      },
      select: {
        id: true,
        platform: true,
        platformPostUrl: true,
        verifiedAt: true
      }
    })

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const promotion of promotions) {
      try {
        let metrics = null

        // TODO: Re-enable social integrations after fixing dependency issues
        // Social metrics integration temporarily disabled for deployment
        /*
        if (promotion.platform === 'X' && process.env.TWITTER_BEARER_TOKEN) {
          const { TwitterIntegration } = await import("@/lib/social-integrations/twitter")
          const twitterClient = new TwitterIntegration(process.env.TWITTER_BEARER_TOKEN)
          
          const tweetId = promotion.platformPostUrl?.match(/status\/(\d+)/)?.[1]
          if (tweetId) {
            metrics = await twitterClient.getPostMetrics(tweetId)
          }
        } else if (promotion.platform === 'LINKEDIN' && process.env.LINKEDIN_ACCESS_TOKEN) {
          const { LinkedInIntegration } = await import("@/lib/social-integrations/linkedin")
          const linkedInClient = new LinkedInIntegration(process.env.LINKEDIN_ACCESS_TOKEN)
          
          const postId = promotion.platformPostUrl?.match(/posts\/[^\/]+-(\d+)/)?.[1]
          if (postId) {
            metrics = await linkedInClient.getPostMetrics(postId)
          }
        } else if (promotion.platform === 'REDDIT' && process.env.REDDIT_CLIENT_ID) {
          const { RedditIntegration } = await import("@/lib/social-integrations/reddit")
          const redditClient = new RedditIntegration(
            process.env.REDDIT_CLIENT_ID,
            process.env.REDDIT_CLIENT_SECRET!,
            process.env.REDDIT_REFRESH_TOKEN!
          )
          
          const postId = promotion.platformPostUrl?.match(/comments\/(\w+)/)?.[1]
          if (postId) {
            metrics = await redditClient.getPostMetrics(postId)
          }
        }
        */

        if (metrics) {
          // Store metrics in database (we'll need to create a metrics table)
          // For now, just log them
          console.log(`Updated metrics for promotion ${promotion.id}:`, metrics)
          successCount++
        }

        results.push({
          promotionId: promotion.id,
          platform: promotion.platform,
          success: !!metrics,
          metrics: metrics
        })

        // Rate limiting - wait 100ms between API calls
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error updating metrics for promotion ${promotion.id}:`, error)
        errorCount++
        results.push({
          promotionId: promotion.id,
          platform: promotion.platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalPromotions: promotions.length,
      successCount,
      errorCount,
      results: results.slice(0, 10) // Return first 10 results for debugging
    })

  } catch (error) {
    console.error("Metrics sync error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint for manual testing
export async function GET() {
  try {
    const stats = await prisma.promotion.groupBy({
      by: ['platform', 'status'],
      _count: {
        id: true
      }
    })

    const totalClicks = await prisma.promotionClick.count()

    return NextResponse.json({
      promotionStats: stats,
      totalClicks,
      message: "Use POST with proper authorization to sync metrics"
    })

  } catch (error) {
    console.error("Metrics stats error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}