import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const dummyProducts = [
  {
    name: "TaskFlow Pro",
    description: "A powerful task management tool designed for teams and individuals. Features include real-time collaboration, time tracking, and smart automation.",
    websiteUrl: "https://taskflowpro.com",
    logoUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop&crop=center",
    category: "SAAS" as const,
    trackType: "RECIPROCAL" as const,
    user: {
      email: "founder@taskflowpro.com",
      name: "Sarah Chen",
      username: "sarahchen"
    }
  },
  {
    name: "Newsletter Ninja",
    description: "The ultimate newsletter management platform. Create, send, and analyze newsletters with advanced segmentation and automation.",
    websiteUrl: "https://newsletterninja.io",
    logoUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop&crop=center",
    category: "NEWSLETTER" as const,
    trackType: "RECIPROCAL" as const,
    user: {
      email: "hello@newsletterninja.io",
      name: "Mike Rodriguez",
      username: "mikerodriguez"
    }
  },
  {
    name: "CodeCraft Studio",
    description: "An AI-powered code generation tool that helps developers write better code faster. Supports multiple programming languages.",
    websiteUrl: "https://codecraftstudio.dev",
    logoUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=64&h=64&fit=crop&crop=center",
    category: "TOOL" as const,
    trackType: "RECIPROCAL" as const,
    user: {
      email: "dev@codecraftstudio.dev",
      name: "Alex Thompson",
      username: "alexthompson"
    }
  },
  {
    name: "DesignHub",
    description: "Collaborative design platform for teams. Create, share, and iterate on designs with real-time feedback and version control.",
    websiteUrl: "https://designhub.app",
    logoUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=64&h=64&fit=crop&crop=center",
    category: "SAAS" as const,
    trackType: "RECIPROCAL" as const,
    user: {
      email: "team@designhub.app",
      name: "Emma Wilson",
      username: "emmawilson"
    }
  },
  {
    name: "Startup Weekly",
    description: "A curated newsletter featuring the latest startup news, funding rounds, and insights from the tech industry.",
    websiteUrl: "https://startupweekly.co",
    logoUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=64&h=64&fit=crop&crop=center",
    category: "NEWSLETTER" as const,
    trackType: "RECIPROCAL" as const,
    user: {
      email: "editor@startupweekly.co",
      name: "David Park",
      username: "davidpark"
    }
  },
  {
    name: "Analytics Pro",
    description: "Advanced analytics dashboard for businesses. Track KPIs, create custom reports, and get actionable insights.",
    websiteUrl: "https://analyticspro.com",
    logoUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=64&h=64&fit=crop&crop=center",
    category: "SAAS" as const,
    trackType: "PAID" as const,
    paidAmount: 99.99,
    user: {
      email: "sales@analyticspro.com",
      name: "Lisa Zhang",
      username: "lisazhang"
    }
  },
  {
    name: "DevTools Kit",
    description: "Collection of essential developer tools including API testing, database management, and deployment automation.",
    websiteUrl: "https://devtoolskit.com",
    logoUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=64&h=64&fit=crop&crop=center",
    category: "TOOL" as const,
    trackType: "RECIPROCAL" as const,
    user: {
      email: "dev@devtoolskit.com",
      name: "Chris Johnson",
      username: "chrisjohnson"
    }
  },
  {
    name: "Growth Hacker",
    description: "Weekly newsletter sharing growth hacking strategies, case studies, and actionable tips for scaling businesses.",
    websiteUrl: "https://growthhacker.news",
    logoUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=64&h=64&fit=crop&crop=center",
    category: "NEWSLETTER" as const,
    trackType: "RECIPROCAL" as const,
    user: {
      email: "growth@growthhacker.news",
      name: "Rachel Green",
      username: "rachelgreen"
    }
  },
  {
    name: "CloudSync",
    description: "Secure cloud storage solution with advanced encryption, file sharing, and collaboration features.",
    websiteUrl: "https://cloudsync.io",
    logoUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop&crop=center",
    category: "SAAS" as const,
    trackType: "RECIPROCAL" as const,
    user: {
      email: "support@cloudsync.io",
      name: "Tom Anderson",
      username: "tomanderson"
    }
  },
  {
    name: "Product Hunt Daily",
    description: "Daily digest of the best new products launched on Product Hunt, curated by industry experts.",
    websiteUrl: "https://producthuntdaily.com",
    logoUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=64&h=64&fit=crop&crop=center",
    category: "NEWSLETTER" as const,
    trackType: "RECIPROCAL" as const,
    user: {
      email: "daily@producthuntdaily.com",
      name: "Maria Garcia",
      username: "mariagarcia"
    }
  }
]

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create users and products
  for (const productData of dummyProducts) {
    // Create or find user
    const user = await prisma.user.upsert({
      where: { email: productData.user.email },
      update: {},
      create: {
        email: productData.user.email,
        name: productData.user.name,
        username: productData.user.username,
        credits: 50, // Give them some starting credits
      },
    })

    // Create product
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name: productData.name,
        description: productData.description,
        websiteUrl: productData.websiteUrl,
        logoUrl: productData.logoUrl,
        category: productData.category,
        trackType: productData.trackType,
        paidAmount: productData.paidAmount,
        status: "ACTIVE", // Make all products active for testing
      },
    })

    // Create product submission for reciprocal products
    if (productData.trackType === "RECIPROCAL") {
      await prisma.productSubmission.create({
        data: {
          productId: product.id,
          requiredPromotions: 2,
          completedPromotions: 0,
          status: "ACTIVE", // Make them active for testing
        },
      })
    }

    console.log(`✅ Created product: ${product.name} by ${user.name}`)
  }

  // Create some sample promotions for testing
  const users = await prisma.user.findMany()
  const products = await prisma.product.findMany()

  if (users.length > 0 && products.length > 0) {
    // Create a few sample promotions
    const samplePromotions = [
      {
        promoterId: users[0].id,
        productId: products[1].id,
        platform: "X" as const,
        content: "Just discovered Newsletter Ninja! 🚀 This newsletter management platform is a game-changer for content creators. The automation features are incredible! #Newsletter #SaaS #Productivity",
        status: "VERIFIED" as const,
        creditsEarned: 10,
        verifiedAt: new Date(),
      },
      {
        promoterId: users[1].id,
        productId: products[2].id,
        platform: "REDDIT" as const,
        content: "I've been using CodeCraft Studio for the past month and it's seriously improved my development workflow. The AI code suggestions are spot-on!",
        status: "VERIFIED" as const,
        creditsEarned: 10,
        verifiedAt: new Date(),
      },
      {
        promoterId: users[2].id,
        productId: products[0].id,
        platform: "LINKEDIN" as const,
        content: "TaskFlow Pro has transformed how our team collaborates. The real-time features and smart automation have increased our productivity by 40%!",
        status: "PENDING" as const,
        creditsEarned: 0,
      },
    ]

    for (const promotionData of samplePromotions) {
      const promotion = await prisma.promotion.create({
        data: promotionData,
      })

      // Create tracking link for verified promotions
      if (promotionData.status === "VERIFIED") {
        await prisma.trackingLink.create({
          data: {
            promotionId: promotion.id,
            trackingCode: `track_${promotion.id.slice(-8)}`,
            originalUrl: products.find(p => p.id === promotionData.productId)?.websiteUrl || "",
            trackedUrl: `https://pumpit.com/track/track_${promotion.id.slice(-8)}`,
          },
        })
      }

      console.log(`✅ Created promotion: ${promotion.platform} promotion for product`)
    }
  }

  console.log('🎉 Database seeding completed!')
  console.log(`📊 Created ${dummyProducts.length} products and ${users.length} users`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 