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

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.product.count({
      where: {
        userId: user.id,
      },
    })

    // Get paginated products
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
      skip,
      take: limit,
    })

    // If no pagination parameters provided, return simple array (for backward compatibility)
    if (!searchParams.has('page') && !searchParams.has('limit')) {
      return NextResponse.json(products)
    }

    // Return paginated response
    const totalPages = Math.ceil(totalCount / limit)
    
    return NextResponse.json({
      products,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    })
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