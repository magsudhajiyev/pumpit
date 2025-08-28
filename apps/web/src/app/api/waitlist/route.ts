import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@pumpit/database"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: email.toLowerCase().trim(),
      },
    })

    return NextResponse.json(
      { 
        message: "Successfully joined waitlist",
        id: waitlistEntry.id
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Waitlist API error:", error)
    
    // Handle duplicate email error
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists in waitlist" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}