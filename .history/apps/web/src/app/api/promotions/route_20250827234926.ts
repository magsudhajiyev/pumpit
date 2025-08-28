import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@pumpit/auth"
import { prisma } from "@pumpit/database"
import { nanoid } from "nanoid"

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
    const { productId, platform, content } = body

    // Validate required fields
    if (!productId || !platform || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate platform
    if (!['X', 'REDDIT', 'LINKEDIN', 'PRODUCTHUNT'].includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      )
    }

    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        status: "ACTIVE",
        userId: {
          not: user.id, // Can't promote own products
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or not available for promotion" },
        { status: 404 }
      )
    }

    // Check if user has already promoted this product on this platform
    const existingPromotion = await prisma.promotion.findFirst({
      where: {
        promoterId: user.id,
        productId,
        platform,
      },
    })

    if (existingPromotion) {
      return NextResponse.json(
        { error: "You have already promoted this product on this platform" },
        { status: 400 }
      )
    }

    // Create promotion
    const promotion = await prisma.promotion.create({
      data: {
        promoterId: user.id,
        productId,
        platform,
        content: content.trim(),
        status: "PENDING",
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            websiteUrl: true,
            logoUrl: true,
            category: true,
          },
        },
        trackingLink: true,
      },
    })

    // Generate tracking link
    const trackingCode = nanoid(12) // Generate 12-character random string
    const trackingLink = await prisma.trackingLink.create({
      data: {
        promotionId: promotion.id,
        trackingCode,
        originalUrl: product.websiteUrl,
        trackedUrl: `${process.env.NEXTAUTH_URL}/track/${trackingCode}`,
      },
    })

    // Return the full promotion object with product and tracking link
    return NextResponse.json({
      ...promotion,
      trackingLink,
    }, { status: 201 })

  } catch (error) {
    console.error("Promotion creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}