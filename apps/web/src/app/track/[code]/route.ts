import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/database"

interface RouteParams {
  params: {
    code: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { code } = params
    
    // Find tracking link
    const trackingLink = await prisma.trackingLink.findUnique({
      where: { trackingCode: code },
      include: {
        promotion: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!trackingLink) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Log the click
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwarded?.split(',')[0] || realIp || 'unknown'

    // Create click record (don't await to avoid slowing down redirect)
    prisma.promotionClick.create({
      data: {
        trackingLinkId: trackingLink.id,
        ipAddress,
        userAgent,
        referrer: referer || null,
      },
    }).catch(error => {
      console.error('Failed to log click:', error)
    })

    // Redirect to the original URL
    return NextResponse.redirect(trackingLink.originalUrl)
    
  } catch (error) {
    console.error('Tracking redirect error:', error)
    // Redirect to home page on error
    return NextResponse.redirect(new URL('/', request.url))
  }
}