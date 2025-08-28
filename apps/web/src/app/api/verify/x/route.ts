import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@pumpit/auth"
import { prisma } from "@pumpit/database"

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

    // TODO: Implement Twitter verification when social-integrations package is ready
    // For now, simulate verification
    const verificationResult = {
      success: true,
      verified: true,
      postId: 'mock-tweet-id',
      metrics: {
        likes: 5,
        shares: 2,
        comments: 1,
        views: 100
      }
    }

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error || "Verification failed" },
        { status: 400 }
      )
    }

    if (!verificationResult.verified) {
      return NextResponse.json(
        { 
          error: "Post verification failed",
          details: "Make sure your post contains the tracking link and required hashtags (#IndieHacker, #SaaS)"
        },
        { status: 400 }
      )
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
        content: `Your product "${promotion.product.name}" was promoted on X/Twitter by ${user.name || user.email}`,
        type: "PROMOTION_VERIFIED",
        data: {
          promotionId: promotion.id,
          platform: "X",
          promoterName: user.name || user.email
        }
      }
    })

    return NextResponse.json({
      success: true,
      promotion: updatedPromotion,
      creditsEarned: 10,
      metrics: verificationResult.metrics
    })

  } catch (error) {
    console.error("X verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 