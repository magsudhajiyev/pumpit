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

    // Get user stats
    const [totalProducts, totalPromotions, totalClicks, userWithCredits] = await Promise.all([
      // Count user's products
      prisma.product.count({
        where: { userId: user.id },
      }),
      
      // Count user's promotions
      prisma.promotion.count({
        where: { promoterId: user.id },
      }),
      
      // Count total clicks on user's promotions
      prisma.promotionClick.count({
        where: {
          trackingLink: {
            promotion: {
              promoterId: user.id,
            },
          },
        },
      }),

      // Get user with credits
      prisma.user.findUnique({
        where: { id: user.id },
        select: { credits: true },
      }),
    ])

    const totalCredits = userWithCredits?.credits || 0

    const stats = {
      totalCredits,
      totalPromotions,
      totalProducts,
      totalClicks,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}