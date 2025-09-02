'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ExternalLink, Check, Clock, AlertCircle, Users, Star, TrendingUp, Calendar, BarChart3, Heart, Repeat, MessageCircle } from "lucide-react"
import Link from "next/link"
import { getFirstName } from "@/lib/utils/name"

interface Promotion {
  id: string
  productId: string
  platform: string
  content: string
  status: 'PENDING' | 'VERIFIED' | 'COMPLETED'
  createdAt: string
  verifiedAt?: string
  creditsEarned: number
  trackingLink?: {
    trackedUrl: string
    clicks?: number
  }
  product?: {
    id: string
    name: string
    description: string
    websiteUrl: string
    logoUrl?: string
    category: string
    user: {
      name?: string
      email: string
    }
  }
}

export default function PromotionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [postUrls, setPostUrls] = useState<Record<string, string>>({})
  const [verifying, setVerifying] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<Record<string, any>>({})
  const [loadingAnalytics, setLoadingAnalytics] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchPromotions()
    }
  }, [session])

  useEffect(() => {
    filterPromotions()
  }, [promotions, statusFilter, platformFilter])

  const fetchPromotions = async () => {
    try {
      const response = await fetch("/api/promotions")
      if (response.ok) {
        const promotionsData = await response.json()
        setPromotions(promotionsData)
      }
    } catch (error) {
      console.error("Failed to fetch promotions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterPromotions = () => {
    let filtered = promotions

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(promo => promo.status === statusFilter)
    }

    // Platform filter
    if (platformFilter !== "all") {
      filtered = filtered.filter(promo => promo.platform === platformFilter)
    }

    setFilteredPromotions(filtered)
  }

  const handleVerifyPromotion = async (promotionId: string) => {
    const postUrl = postUrls[promotionId]
    if (!postUrl?.trim()) {
      alert("Please enter the post URL")
      return
    }

    setVerifying(promotionId)

    try {
      const platform = promotions.find(p => p.id === promotionId)?.platform
      const endpoint = `/api/verify/${platform?.toLowerCase()}`
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promotionId,
          postUrl: postUrl.trim(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setPromotions(prev => prev.map(p => 
          p.id === promotionId 
            ? { ...p, status: 'VERIFIED', verifiedAt: new Date().toISOString(), creditsEarned: result.creditsEarned }
            : p
        ))
        // Clear the postUrl for this specific promotion
        setPostUrls(prev => ({ ...prev, [promotionId]: '' }))
        alert(`Promotion verified! You earned ${result.creditsEarned} credits.`)
      } else {
        const error = await response.json()
        alert(error.error || "Verification failed")
      }
    } catch (error) {
      console.error("Failed to verify promotion:", error)
      alert("Failed to verify promotion")
    } finally {
      setVerifying(null)
    }
  }

  const fetchAnalytics = async (promotionId: string) => {
    try {
      setLoadingAnalytics(promotionId)
      const response = await fetch(`/api/promotions/${promotionId}/analytics`)
      
      if (response.ok) {
        const analytics = await response.json()
        setAnalyticsData(prev => ({ ...prev, [promotionId]: analytics }))
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoadingAnalytics(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'X':
        return '𝕏'
      case 'REDDIT':
        return '📱'
      case 'LINKEDIN':
        return '💼'
      case 'PRODUCTHUNT':
        return '🚀'
      default:
        return '📝'
    }
  }

  const getStats = () => {
    const totalCredits = promotions.reduce((sum, p) => sum + (p.creditsEarned || 0), 0)
    const verifiedCount = promotions.filter(p => p.status === 'VERIFIED').length
    const pendingCount = promotions.filter(p => p.status === 'PENDING').length
    return { totalCredits, verifiedCount, pendingCount }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
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

  const stats = getStats()

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="font-mono">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-mono text-3xl font-bold tracking-tight">
              My Promotions
            </h1>
            <p className="font-mono text-muted-foreground mt-1">
              Track and verify your product promotions
            </p>
          </div>
          <Link href="/dashboard/promote">
            <Button className="font-mono">
              Create New Promotion
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <Star className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{promotions.length}</div>
                <div className="text-xs text-muted-foreground">Total Promotions</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <Check className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{stats.verifiedCount}</div>
                <div className="text-xs text-muted-foreground">Verified</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <Clock className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{stats.pendingCount}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{stats.totalCredits}</div>
                <div className="text-xs text-muted-foreground">Credits Earned</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="font-mono mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Filter Promotions</CardTitle>
            <CardDescription>
              Filter by status and platform to find specific promotions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Platform</label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="X">𝕏 (Twitter)</SelectItem>
                    <SelectItem value="REDDIT">📱 Reddit</SelectItem>
                    <SelectItem value="LINKEDIN">💼 LinkedIn</SelectItem>
                    <SelectItem value="PRODUCTHUNT">🚀 ProductHunt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="font-mono text-sm text-muted-foreground">
            Showing {filteredPromotions.length} of {promotions.length} promotions
          </p>
        </div>

        {/* Promotions List */}
        {filteredPromotions.length === 0 ? (
          <Card className="font-mono">
            <CardContent className="flex flex-col items-center justify-center py-12">
              {promotions.length === 0 ? (
                <>
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No promotions yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start promoting products to earn credits and build your reputation
                  </p>
                  <Link href="/dashboard/promote">
                    <Button className="font-mono">
                      Create Your First Promotion
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No promotions match your filters</h3>
                  <p className="text-muted-foreground text-center">
                    Try adjusting your filters to see more promotions
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 pb-12">
            {filteredPromotions.map((promotion) => (
              <Card key={promotion.id} className="font-mono">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getPlatformIcon(promotion.platform)}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{promotion.product?.name || 'Unknown Product'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {promotion.platform} • by {getFirstName(promotion.product?.user?.name) || 'Anonymous'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(promotion.status)}
                      <Badge variant="outline" className="text-xs">
                        {promotion.product?.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Promotion Content:</p>
                    <p className="text-sm text-muted-foreground">{promotion.content}</p>
                  </div>

                  {/* Tracking Link */}
                  {promotion.trackingLink?.trackedUrl && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Tracking Link:</p>
                        <a
                          href={promotion.trackingLink.trackedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                        >
                          {promotion.trackingLink.trackedUrl}
                        </a>
                        {promotion.trackingLink.clicks !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {promotion.trackingLink.clicks} clicks
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Verification Section */}
                  {promotion.status === 'PENDING' && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                          Verification Required
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Post this content on {promotion.platform} and paste the URL below to verify your promotion.
                      </p>
                      <div className="space-y-2">
                        <Input
                          placeholder={`Enter your ${promotion.platform} post URL`}
                          value={postUrls[promotion.id] || ''}
                          onChange={(e) => setPostUrls(prev => ({ 
                            ...prev, 
                            [promotion.id]: e.target.value 
                          }))}
                        />
                        <Button
                          onClick={() => handleVerifyPromotion(promotion.id)}
                          disabled={verifying === promotion.id}
                          size="sm"
                          className="w-full"
                        >
                          {verifying === promotion.id ? 'Verifying...' : 'Verify Promotion'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Success Section */}
                  {promotion.status === 'VERIFIED' && (
                    <div className="space-y-4">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            Verified Successfully!
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          You earned <strong>{promotion.creditsEarned} credits</strong> for this promotion
                          {promotion.verifiedAt && (
                            <span className="block text-xs mt-1">
                              Verified on {new Date(promotion.verifiedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Analytics Section for X/Twitter promotions */}
                      {promotion.platform === 'X' && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                Tweet Analytics
                              </span>
                            </div>
                            {!analyticsData[promotion.id] && (
                              <Button
                                onClick={() => fetchAnalytics(promotion.id)}
                                disabled={loadingAnalytics === promotion.id}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                {loadingAnalytics === promotion.id ? 'Loading...' : 'Fetch Analytics'}
                              </Button>
                            )}
                          </div>

                          {analyticsData[promotion.id] ? (
                            <div className="space-y-3">
                              {/* Metrics Grid */}
                              <div className="grid grid-cols-4 gap-3">
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                                    <Heart className="h-3 w-3" />
                                    <span className="text-xs font-medium">Likes</span>
                                  </div>
                                  <div className="text-lg font-bold">
                                    {analyticsData[promotion.id].metrics.likes}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                    <Repeat className="h-3 w-3" />
                                    <span className="text-xs font-medium">RTs</span>
                                  </div>
                                  <div className="text-lg font-bold">
                                    {analyticsData[promotion.id].metrics.retweets}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span className="text-xs font-medium">Replies</span>
                                  </div>
                                  <div className="text-lg font-bold">
                                    {analyticsData[promotion.id].metrics.replies}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="text-xs font-medium">Total</span>
                                  </div>
                                  <div className="text-lg font-bold">
                                    {analyticsData[promotion.id].metrics.totalEngagement}
                                  </div>
                                </div>
                              </div>

                              {/* Performance Indicators */}
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="text-xs text-muted-foreground">
                                  Performance: 
                                  <Badge 
                                    variant={
                                      analyticsData[promotion.id].insights.performance === 'High' ? 'default' :
                                      analyticsData[promotion.id].insights.performance === 'Medium' ? 'secondary' : 'outline'
                                    }
                                    className="ml-1 text-xs"
                                  >
                                    {analyticsData[promotion.id].insights.performance}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Engagement Rate: {analyticsData[promotion.id].metrics.engagementRate.toFixed(2)}%
                                </div>
                              </div>

                              {/* Impressions */}
                              {analyticsData[promotion.id].metrics.impressions > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {analyticsData[promotion.id].metrics.impressions.toLocaleString()} impressions
                                </div>
                              )}

                              <div className="text-xs text-muted-foreground">
                                Updated: {new Date(analyticsData[promotion.id].analytics.lastUpdated).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Click "Fetch Analytics" to see real-time Twitter metrics for this promotion
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {new Date(promotion.createdAt).toLocaleDateString()}
                      </span>
                      {promotion.product?.websiteUrl && (
                        <a
                          href={promotion.product.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit Product
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}