'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Zap, BarChart3, Clock, ExternalLink, Star } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  website_url: string
  logo_url?: string
  category: string
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED'
  created_at: string
  _count?: {
    promotions: number
  }
}

interface DashboardStats {
  totalCredits: number
  totalPromotions: number
  totalProducts: number
  totalClicks: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCredits: 0,
    totalPromotions: 0,
    totalProducts: 0,
    totalClicks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/dashboard/stats")
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-3xl font-bold tracking-tight mb-2">
            Welcome back, {session.user?.name || 'Maker'}
          </h1>
          <p className="font-mono text-muted-foreground">
            Manage your products and track your cross-promotion performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="font-mono">
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-lg font-bold">{stats.totalCredits}</div>
                <p className="text-xs text-muted-foreground">Credits</p>
              </div>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-lg font-bold">{stats.totalPromotions}</div>
                <p className="text-xs text-muted-foreground">Promotions</p>
              </div>
              <Users className="h-4 w-4 text-blue-500" />
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-lg font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <Star className="h-4 w-4 text-green-500" />
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-lg font-bold">{stats.totalClicks}</div>
                <p className="text-xs text-muted-foreground">Clicks</p>
              </div>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/products/new">
              <Button className="font-mono">
                <Plus className="mr-2 h-4 w-4" />
                Submit Product
              </Button>
            </Link>
            <Link href="/dashboard/promote">
              <Button variant="outline" className="font-mono">
                <Users className="mr-2 h-4 w-4" />
                Find Products to Promote
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="font-mono">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Products Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Products */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-xl font-semibold">Your Products</h2>
              <Link href="/dashboard/products">
                <Button variant="ghost" size="sm" className="font-mono">
                  View All
                </Button>
              </Link>
            </div>

            {products.length === 0 ? (
              <Card className="font-mono">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Submit your first product to start getting promotions from the community
                  </p>
                  <Link href="/dashboard/products/new">
                    <Button className="font-mono">
                      <Plus className="mr-2 h-4 w-4" />
                      Submit Your First Product
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 3).map((product) => (
                  <Card key={product.id} className="font-mono">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {product.description}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className="ml-4"
                        >
                          {product.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="mr-1 h-3 w-3" />
                            {product._count?.promotions || 0} promotions
                          </span>
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(product.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a 
                              href={product.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-mono"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/products/${product.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="font-mono">
              <CardHeader>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <CardDescription>Complete these steps to maximize your success</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${products.length > 0 ? 'bg-green-500' : 'bg-muted'}`} />
                  <span className="text-sm">Submit your first product</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${stats.totalPromotions > 0 ? 'bg-green-500' : 'bg-muted'}`} />
                  <span className="text-sm">Complete your first promotion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${stats.totalCredits > 0 ? 'bg-green-500' : 'bg-muted'}`} />
                  <span className="text-sm">Earn your first credits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-muted" />
                  <span className="text-sm">Link your social accounts</span>
                </div>
              </CardContent>
            </Card>

            <Card className="font-mono mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Community Feed</CardTitle>
                <CardDescription>Latest products from the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Community feed coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}