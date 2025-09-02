require('dotenv').config({ path: '.env.development.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // First clear existing seeded products (only those from test users)
  console.log('Clearing existing seeded products...')
  const testEmails = ['alice@example.com', 'bob@example.com', 'charlie@example.com']
  const testUsers = await prisma.user.findMany({
    where: { email: { in: testEmails } }
  })
  
  if (testUsers.length > 0) {
    await prisma.product.deleteMany({
      where: { userId: { in: testUsers.map(u => u.id) } }
    })
    await prisma.user.deleteMany({
      where: { email: { in: testEmails } }
    })
    console.log('✅ Cleared existing test data')
  }

  // Create test users for community products
  console.log('Creating test users...')
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      username: 'alice_maker',
      credits: 50,
      socialAccounts: {
        x: '@alice_maker',
        linkedin: 'alice-johnson'
      }
    }
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      username: 'bob_creator',
      credits: 75,
      socialAccounts: {
        x: '@bob_creator',
        reddit: 'u/bob_creator'
      }
    }
  })

  const user3 = await prisma.user.create({
    data: {
      name: 'Charlie Wilson',
      email: 'charlie@example.com',
      username: 'charlie_dev',
      credits: 120,
      socialAccounts: {
        x: '@charlie_dev',
        linkedin: 'charlie-wilson-dev'
      }
    }
  })

  console.log('✅ Created 3 test users for community products')

  // Create sample products for community section
  console.log('Creating products for community...')
  const products = await Promise.all([
    prisma.product.create({
      data: {
        userId: user1.id,
        name: 'TaskMaster Pro',
        description: 'A powerful task management SaaS that helps teams organize, prioritize, and track their work efficiently. Features include real-time collaboration, time tracking, and advanced analytics.',
        websiteUrl: 'https://taskmaster-pro.example.com',
        logoUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=200&fit=crop',
        category: 'SAAS',
        status: 'ACTIVE',
        trackType: 'RECIPROCAL'
      }
    }),
    
    prisma.product.create({
      data: {
        userId: user2.id,
        name: 'Developer Weekly',
        description: 'A curated newsletter featuring the latest in web development, programming tips, and industry insights. Delivered every Tuesday to 10,000+ subscribers.',
        websiteUrl: 'https://developer-weekly.example.com',
        logoUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=200&h=200&fit=crop',
        category: 'NEWSLETTER',
        status: 'ACTIVE',
        trackType: 'RECIPROCAL'
      }
    }),
    
    prisma.product.create({
      data: {
        userId: user3.id,
        name: 'CodeSnippet Generator',
        description: 'An AI-powered tool that generates clean, optimized code snippets in multiple programming languages. Perfect for developers looking to speed up their workflow.',
        websiteUrl: 'https://codesnippet-gen.example.com',
        logoUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=200&fit=crop',
        category: 'TOOL',
        status: 'ACTIVE',
        trackType: 'PAID',
        paidAmount: 25.00
      }
    }),
    
    prisma.product.create({
      data: {
        userId: user1.id,
        name: 'StartupLaunch Kit',
        description: 'Complete guide and resources for launching your startup. Includes legal templates, marketing strategies, and funding tips from successful entrepreneurs.',
        websiteUrl: 'https://startup-launch-kit.example.com',
        logoUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop',
        category: 'OTHER',
        status: 'ACTIVE',
        trackType: 'RECIPROCAL'
      }
    }),
    
    prisma.product.create({
      data: {
        userId: user2.id,
        name: 'Social Media Scheduler',
        description: 'Schedule and automate your social media posts across multiple platforms. Built-in analytics and engagement tracking to maximize your reach.',
        websiteUrl: 'https://social-scheduler.example.com',
        logoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
        category: 'SAAS',
        status: 'ACTIVE',
        trackType: 'RECIPROCAL'
      }
    }),
    
    prisma.product.create({
      data: {
        userId: user3.id,
        name: 'Crypto Portfolio Tracker',
        description: 'Track your cryptocurrency investments with real-time prices, portfolio analytics, and profit/loss calculations. Supports 500+ coins and tokens.',
        websiteUrl: 'https://crypto-tracker.example.com',
        logoUrl: 'https://images.unsplash.com/photo-1518804665052-a35db8e3b9e1?w=200&h=200&fit=crop',
        category: 'TOOL',
        status: 'ACTIVE',
        trackType: 'PAID',
        paidAmount: 15.00
      }
    }),
    
    // Add more products for better community variety
    prisma.product.create({
      data: {
        userId: user1.id,
        name: 'Email Marketing Pro',
        description: 'Advanced email marketing platform with automation, segmentation, and analytics. Perfect for growing businesses looking to scale their email campaigns.',
        websiteUrl: 'https://email-marketing-pro.example.com',
        logoUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=200&h=200&fit=crop',
        category: 'SAAS',
        status: 'ACTIVE',
        trackType: 'RECIPROCAL'
      }
    }),
    
    prisma.product.create({
      data: {
        userId: user2.id,
        name: 'Design System Builder',
        description: 'Create consistent design systems with automated component generation, style guides, and team collaboration features.',
        websiteUrl: 'https://design-system-builder.example.com',
        logoUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=200&h=200&fit=crop',
        category: 'TOOL',
        status: 'ACTIVE',
        trackType: 'RECIPROCAL'
      }
    }),
    
    prisma.product.create({
      data: {
        userId: user3.id,
        name: 'Startup Success Stories',
        description: 'Weekly newsletter featuring inspiring startup journeys, funding announcements, and practical lessons from successful entrepreneurs.',
        websiteUrl: 'https://startup-stories.example.com',
        logoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        category: 'NEWSLETTER',
        status: 'ACTIVE',
        trackType: 'RECIPROCAL'
      }
    })
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log('\n📊 Seeded data summary:')
  console.log(`👥 Test users: 3`)
  console.log(`📦 Community products: ${products.length} (${products.filter(p => p.status === 'ACTIVE').length} active)`)
  console.log('\n📋 Sample products created for community:')
  products.forEach(product => {
    const owner = product.userId === user1.id ? 'Alice' : product.userId === user2.id ? 'Bob' : 'Charlie'
    console.log(`• ${product.name} (${product.category}) by ${owner}`)
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })