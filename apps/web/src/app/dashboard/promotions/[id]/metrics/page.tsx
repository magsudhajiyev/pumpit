'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Heart, MessageCircle, Share, Eye, TrendingUp, Users, MousePointer, Zap } from "lucide-react"
import Link from "next/link"

interface PromotionMetrics {
  promotion: {
    id: string
    platform: string
    createdAt: string
    verifiedAt: string
    creditsEarned: number
    platformPostUrl: string
  }
  clickMetrics: {
    totalClicks: number
    uniqueClicks: number
    clicksByDate: Record<string, number>
    conversionRate: number
  }
  socialMetrics: {
    likes: number
    shares: number
    comments: number
    views: number
    engagementRate: number
    lastUpdated: string
  } | null
  recentClicks: Array<{
    ipAddress: string
    userAgent: string
    referrer: string | null
    clickedAt: string
  }>
}

export default function PromotionMetricsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metrics, setMetrics] = useState<PromotionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchMetrics()
    }
  }, [session, params.id])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/promotions/${params.id}/metrics`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch metrics')
      }
      
      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error("Failed to fetch promotion metrics:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'X': return '𝕏'
      case 'LINKEDIN': return 'in'
      case 'REDDIT': return '📺'
      case 'PRODUCTHUNT': return '🚀'
      default: return '📱'
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
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

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="font-mono">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <Card className="font-mono">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-4">Error Loading Metrics</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchMetrics}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
                Promotion Metrics
              </h1>
              <div className="flex items-center gap-4 font-mono text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPlatformIcon(metrics.promotion.platform)}</span>
                  {metrics.promotion.platform}
                </div>
                <div>Verified {formatDate(metrics.promotion.verifiedAt)}</div>
                <Badge variant="outline">{metrics.promotion.creditsEarned} credits</Badge>
              </div>
            </div>
            {metrics.promotion.platformPostUrl && (
              <Button asChild variant="outline" className="font-mono">
                <Link href={metrics.promotion.platformPostUrl} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Post
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="font-mono">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Link Clicks</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{metrics.clickMetrics.totalClicks}</div>
                  <div className="text-sm text-muted-foreground">
                    {metrics.clickMetrics.uniqueClicks} unique
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Conversion rate: {metrics.clickMetrics.conversionRate}%
              </div>
            </CardContent>
          </Card>

          {metrics.socialMetrics && (
            <>
              <Card className="font-mono">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <h3 className="font-semibold">Social Engagement</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {metrics.socialMetrics.likes + metrics.socialMetrics.shares + metrics.socialMetrics.comments}
                      </div>
                      <div className="text-sm text-muted-foreground">total</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rate: {(metrics.socialMetrics.engagementRate * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card className="font-mono">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold">Performance</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {metrics.socialMetrics.views > 0 ? 
                          Math.round((metrics.clickMetrics.totalClicks / metrics.socialMetrics.views) * 100) / 100 : 
                          'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">click rate</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metrics.socialMetrics.views > 0 ? `${metrics.socialMetrics.views} views` : 'Views not available'}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Social Media Metrics */}
          {metrics.socialMetrics ? (
            <Card className="font-mono">
              <CardHeader>
                <CardTitle className="text-lg">Social Media Statistics</CardTitle>
                <CardDescription>
                  Real-time data from {metrics.promotion.platform}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Likes</span>
                    </div>
                    <span className="font-bold">{metrics.socialMetrics.likes}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Share className="h-4 w-4 text-blue-500" />
                      <span>Shares/Retweets</span>
                    </div>
                    <span className="font-bold">{metrics.socialMetrics.shares}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      <span>Comments</span>
                    </div>
                    <span className="font-bold">{metrics.socialMetrics.comments}</span>
                  </div>

                  {metrics.socialMetrics.views > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Eye className="h-4 w-4 text-purple-500" />
                        <span>Views</span>
                      </div>
                      <span className="font-bold">{metrics.socialMetrics.views}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  Last updated: {formatDate(metrics.socialMetrics.lastUpdated)}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="font-mono">
              <CardHeader>
                <CardTitle className="text-lg">Social Media Statistics</CardTitle>
                <CardDescription>
                  Social media metrics are not available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Social media API not configured for {metrics.promotion.platform}</p>
                  <p className="text-sm mt-2">Configure API credentials to see real-time metrics</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Clicks */}
          <Card className="font-mono">
            <CardHeader>
              <CardTitle className="text-lg">Recent Link Clicks</CardTitle>
              <CardDescription>Latest clicks on your tracking link</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.recentClicks.length > 0 ? (
                <div className="space-y-3">
                  {metrics.recentClicks.map((click, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Click #{metrics.recentClicks.length - index}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(click.clickedAt)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>IP: {click.ipAddress}</div>
                        <div>Agent: {click.userAgent}</div>
                        {click.referrer && <div>From: {click.referrer}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No clicks recorded yet</p>
                  <p className="text-sm mt-2">Share your promotion to start getting clicks!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Refresh Data Button */}
        <div className="text-center">
          <Button onClick={fetchMetrics} variant="outline" className="font-mono">
            <TrendingUp className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  )
}