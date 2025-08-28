'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Users, BarChart3, Calendar, Copy, Check } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  websiteUrl: string
  logoUrl?: string
  category: string
  status: string
  trackType: string
  paidAmount?: number
  createdAt: string
  productSubmission?: {
    requiredPromotions: number
    completedPromotions: number
    status: string
  }
  _count?: {
    promotions: number
  }
}

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session && params.id) {
      fetchProduct()
    }
  }, [session, params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const copyProductUrl = () => {
    const url = `${window.location.origin}/products/${params.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-mono text-2xl font-bold">Product not found</h1>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'DRAFT': return 'bg-yellow-500'
      case 'EXPIRED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {product.logoUrl && (
                  <img 
                    src={product.logoUrl} 
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h1 className="font-mono text-3xl font-bold tracking-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {product.category}
                    </Badge>
                    <Badge className={`font-mono text-xs ${getStatusColor(product.status)}`}>
                      {product.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyProductUrl} className="font-mono">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Share"}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-mono">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Site
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="font-mono">
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              </CardContent>
            </Card>

            {/* Promotion Status */}
            {product.productSubmission && (
              <Card className="font-mono">
                <CardHeader>
                  <CardTitle>Promotion Progress</CardTitle>
                  <CardDescription>
                    Complete {product.productSubmission.requiredPromotions} promotions to activate your product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{product.productSubmission.completedPromotions} / {product.productSubmission.requiredPromotions}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ 
                          width: `${(product.productSubmission.completedPromotions / product.productSubmission.requiredPromotions) * 100}%` 
                        }}
                      />
                    </div>
                    {product.productSubmission.completedPromotions < product.productSubmission.requiredPromotions ? (
                      <div className="text-sm text-muted-foreground">
                        You need {product.productSubmission.requiredPromotions - product.productSubmission.completedPromotions} more promotions to activate your product.
                        <Link href="/dashboard/promote" className="text-primary hover:underline ml-1">
                          Start promoting other products
                        </Link>
                      </div>
                    ) : (
                      <div className="text-sm text-green-600">
                        🎉 Congratulations! Your product is now active and visible to the community.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="font-mono">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest promotions and clicks for your product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity yet</p>
                  <p className="text-xs">Activity will appear here once people start promoting your product</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="font-mono">
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Promotions</span>
                  </div>
                  <span className="font-semibold">{product._count?.promotions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Total Clicks</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Promotion Type */}
            <Card className="font-mono">
              <CardHeader>
                <CardTitle className="text-lg">Promotion Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Type</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {product.trackType.toLowerCase()} {product.trackType === 'PAID' ? 'Promotions' : 'Credits'}
                  </div>
                </div>
                {product.trackType === 'PAID' && product.paidAmount && (
                  <div>
                    <div className="text-sm font-medium">Payment per Promotion</div>
                    <div className="text-lg font-bold text-green-600">
                      ${product.paidAmount.toFixed(2)}
                    </div>
                  </div>
                )}
                {product.trackType === 'RECIPROCAL' && (
                  <div className="text-xs text-muted-foreground">
                    Promoters earn credits they can use for their own products
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="font-mono">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full font-mono">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                <Button variant="outline" size="sm" className="w-full font-mono">
                  Edit Product
                </Button>
                <Button variant="outline" size="sm" className="w-full font-mono">
                  Manage Promotions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}