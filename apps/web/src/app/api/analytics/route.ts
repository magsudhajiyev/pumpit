import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/database"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (range) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get overview stats
    const [
      totalClicks,
      totalPromotions,
      totalCreditsEarned,
      activeProducts,
      userProducts,
      userPromotions
    ] = await Promise.all([
      // Total clicks on user's promotions in date range
      prisma.promotionClick.count({
        where: {
          trackingLink: {
            promotion: {
              promoterId: user.id,
            },
          },
          clickedAt: {
            gte: startDate,
          },
        },
      }),

      // Total promotions by user in date range
      prisma.promotion.count({
        where: {
          promoterId: user.id,
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Total credits earned (promotions * 10)
      prisma.promotion.count({
        where: {
          promoterId: user.id,
          status: "VERIFIED",
          verifiedAt: {
            gte: startDate,
          },
        },
      }),

      // Active products by user
      prisma.product.count({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
      }),

      // User's products for top products analysis
      prisma.product.findMany({
        where: {
          userId: user.id,
        },
        include: {
          promotions: {
            include: {
              trackingLink: {
                include: {
                  promotionClicks: {
                    where: {
                      clickedAt: {
                        gte: startDate,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),

      // User's promotions for platform stats
      prisma.promotion.findMany({
        where: {
          promoterId: user.id,
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          trackingLink: {
            include: {
              promotionClicks: {
                where: {
                  clickedAt: {
                    gte: startDate,
                  },
                },
              },
            },
          },
        },
      }),
    ])

    // Calculate top products
    const topProducts = userProducts
      .map(product => {
        const clicks = product.promotions.reduce((acc, promotion) => 
          acc + (promotion.trackingLink?.promotionClicks?.length || 0), 0
        )
        const promotions = product.promotions.length
        const ctr = promotions > 0 ? (clicks / promotions) : 0

        return {
          id: product.id,
          name: product.name,
          clicks,
          promotions,
          ctr: Math.round(ctr * 100) / 100,
        }
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 3)

    // Calculate platform stats
    const platformStats = userPromotions.reduce((acc, promotion) => {
      const platform = promotion.platform
      const clicks = promotion.trackingLink?.promotionClicks?.length || 0
      
      if (!acc[platform]) {
        acc[platform] = { promotions: 0, clicks: 0 }
      }
      
      acc[platform].promotions += 1
      acc[platform].clicks += clicks
      
      return acc
    }, {} as Record<string, { promotions: number; clicks: number }>)

    const platformStatsArray = Object.entries(platformStats).map(([platform, stats]) => ({
      platform,
      promotions: stats.promotions,
      clicks: stats.clicks,
      ctr: stats.promotions > 0 ? Math.round((stats.clicks / stats.promotions) * 100) / 100 : 0,
    }))

    // Mock recent activity for now (would need additional tables for full implementation)
    const recentActivity = [
      { id: "1", type: "click" as const, description: "Someone clicked on your product link", timestamp: "2 minutes ago" },
      { id: "2", type: "promotion" as const, description: "New promotion created", timestamp: "1 hour ago" },
      { id: "3", type: "product_created" as const, description: "Product submitted successfully", timestamp: "2 days ago" }
    ]

    const analytics = {
      overview: {
        totalClicks,
        totalPromotions,
        totalCreditsEarned: totalCreditsEarned * 10, // 10 credits per verified promotion
        activeProducts,
        clickThroughRate: totalPromotions > 0 ? Math.round((totalClicks / totalPromotions) * 100) / 100 : 0,
        conversionRate: totalClicks > 0 ? Math.round((totalCreditsEarned / totalClicks) * 100 * 100) / 100 : 0,
      },
      topProducts,
      recentActivity,
      platformStats: platformStatsArray,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}