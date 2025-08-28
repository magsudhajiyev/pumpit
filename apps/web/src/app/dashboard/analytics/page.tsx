'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, TrendingUp, Users, Zap, Eye, MousePointer, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"

interface AnalyticsData {
  overview: {
    totalClicks: number
    totalPromotions: number
    totalCreditsEarned: number
    activeProducts: number
    clickThroughRate: number
    conversionRate: number
  }
  topProducts: Array<{
    id: string
    name: string
    clicks: number
    promotions: number
    ctr: number
  }>
  recentActivity: Array<{
    id: string
    type: 'click' | 'promotion' | 'product_created'
    description: string
    timestamp: string
  }>
  platformStats: Array<{
    platform: string
    promotions: number
    clicks: number
    ctr: number
  }>
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [session, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mock data for now (will be replaced with real API data)
  const mockAnalytics: AnalyticsData = analytics || {
    overview: {
      totalClicks: 1247,
      totalPromotions: 23,
      totalCreditsEarned: 230,
      activeProducts: 3,
      clickThroughRate: 3.2,
      conversionRate: 1.8
    },
    topProducts: [
      { id: "1", name: "My SaaS Tool", clicks: 486, promotions: 8, ctr: 3.8 },
      { id: "2", name: "Newsletter Pro", clicks: 324, promotions: 6, ctr: 2.9 },
      { id: "3", name: "Design Kit", clicks: 197, promotions: 4, ctr: 2.1 }
    ],
    recentActivity: [
      { id: "1", type: "click", description: "Someone clicked on My SaaS Tool from X", timestamp: "2 minutes ago" },
      { id: "2", type: "promotion", description: "New promotion created for Newsletter Pro", timestamp: "1 hour ago" },
      { id: "3", type: "click", description: "Click from LinkedIn promotion", timestamp: "3 hours ago" },
      { id: "4", type: "product_created", description: "Design Kit was submitted", timestamp: "2 days ago" }
    ],
    platformStats: [
      { platform: "X", promotions: 12, clicks: 624, ctr: 3.4 },
      { platform: "LinkedIn", promotions: 7, clicks: 398, ctr: 2.8 },
      { platform: "Reddit", promotions: 3, clicks: 156, ctr: 2.2 },
      { platform: "ProductHunt", promotions: 1, clicks: 69, ctr: 4.1 }
    ]
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="font-mono">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-3xl font-bold tracking-tight mb-2">
                Analytics Dashboard
              </h1>
              <p className="font-mono text-muted-foreground">
                Track your promotion performance and growth metrics
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={timeRange === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("7d")}
                className="font-mono"
              >
                7 Days
              </Button>
              <Button 
                variant={timeRange === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("30d")}
                className="font-mono"
              >
                30 Days
              </Button>
              <Button 
                variant={timeRange === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("90d")}
                className="font-mono"
              >
                90 Days
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <MousePointer className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <div className="text-lg font-bold">{mockAnalytics.overview.totalClicks}</div>
                <div className="text-xs text-muted-foreground">Total Clicks</div>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <Users className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <div className="text-lg font-bold">{mockAnalytics.overview.totalPromotions}</div>
                <div className="text-xs text-muted-foreground">Promotions</div>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <Zap className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <div className="text-lg font-bold">{mockAnalytics.overview.totalCreditsEarned}</div>
                <div className="text-xs text-muted-foreground">Credits Earned</div>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <Eye className="h-5 w-5 text-purple-500 mr-3" />
              <div>
                <div className="text-lg font-bold">{mockAnalytics.overview.activeProducts}</div>
                <div className="text-xs text-muted-foreground">Active Products</div>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <TrendingUp className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <div className="text-lg font-bold">{mockAnalytics.overview.clickThroughRate}%</div>
                <div className="text-xs text-muted-foreground">CTR</div>
              </div>
            </CardContent>
          </Card>

          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <BarChart3 className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <div className="text-lg font-bold">{mockAnalytics.overview.conversionRate}%</div>
                <div className="text-xs text-muted-foreground">Conversion</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <Card className="font-mono">
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Products</CardTitle>
              <CardDescription>Your most successful products by clicks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.promotions} promotions • {product.ctr}% CTR
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{product.clicks}</p>
                      <p className="text-xs text-muted-foreground">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Performance */}
          <Card className="font-mono">
            <CardHeader>
              <CardTitle className="text-lg">Platform Performance</CardTitle>
              <CardDescription>How your promotions perform across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.platformStats.map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold">{platform.platform.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{platform.platform}</p>
                        <p className="text-xs text-muted-foreground">
                          {platform.promotions} promotions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{platform.clicks} clicks</p>
                      <p className="text-xs text-muted-foreground">{platform.ctr}% CTR</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="font-mono">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest events across your products and promotions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'click' ? 'bg-blue-500' : 
                    activity.type === 'promotion' ? 'bg-green-500' : 
                    'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" className="font-mono">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}