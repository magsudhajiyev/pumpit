import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authConfig } from "@/lib/auth"
import { prisma } from "@/lib/database"

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

    const products = await prisma.product.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            promotions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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
    const { name, description, websiteUrl, logoUrl, category, trackType, paidAmount } = body

    // Validate required fields
    if (!name || !description || !websiteUrl || !category || !trackType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(websiteUrl)
      if (logoUrl) new URL(logoUrl)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description.trim(),
        websiteUrl: websiteUrl.trim(),
        logoUrl: logoUrl?.trim() || null,
        category,
        trackType,
        paidAmount: paidAmount ? parseFloat(paidAmount) : null,
      },
    })

    // Create product submission for reciprocal tracks
    if (trackType === "RECIPROCAL") {
      await prisma.productSubmission.create({
        data: {
          productId: product.id,
          requiredPromotions: 2, // Default: need 2 promotions to activate
          completedPromotions: 0,
          status: "PENDING",
        },
      })
    } else {
      // Paid products are active immediately (subject to review)
      await prisma.product.update({
        where: { id: product.id },
        data: { status: "ACTIVE" },
      })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}