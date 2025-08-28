'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, ExternalLink, Check, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  website_url: string
  logo_url?: string
  category: string
  user: {
    name?: string
    email: string
  }
}

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
  }
  product?: Product
}

export default function PromotePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [platform, setPlatform] = useState<string>('')
  const [content, setContent] = useState('')
  const [postUrl, setPostUrl] = useState('')
  const [verifying, setVerifying] = useState<string | null>(null)

  // Get product ID from URL query parameter if present
  const [productIdFromUrl, setProductIdFromUrl] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const productParam = urlParams.get('product')
      if (productParam) {
        setProductIdFromUrl(productParam)
      }
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  // Set selected product when products are loaded and we have a product ID from URL
  useEffect(() => {
    if (products.length > 0 && productIdFromUrl && productIdFromUrl !== 'promote') {
      // Check if the product ID from URL exists in our products list
      const productExists = products.find(p => p.id === productIdFromUrl)
      if (productExists) {
        setSelectedProduct(productIdFromUrl)
      }
    }
  }, [products, productIdFromUrl])

  const fetchData = async () => {
    try {
      const [productsRes, promotionsRes] = await Promise.all([
        fetch("/api/products/public"),
        fetch("/api/promotions")
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (promotionsRes.ok) {
        const promotionsData = await promotionsRes.json()
        setPromotions(promotionsData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePromotion = async () => {
    if (!selectedProduct || !platform || !content.trim()) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct,
          platform,
          content: content.trim(),
        }),
      })

      if (response.ok) {
        const promotion = await response.json()
        setPromotions(prev => [promotion, ...prev])
        setSelectedProduct('')
        setPlatform('')
        setContent('')
        alert("Promotion created successfully! Please post it on social media and then verify it.")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create promotion")
      }
    } catch (error) {
      console.error("Failed to create promotion:", error)
      alert("Failed to create promotion")
    }
  }

  const handleVerifyPromotion = async (promotionId: string) => {
    if (!postUrl.trim()) {
      alert("Please enter the post URL")
      return
    }

    setVerifying(promotionId)

    try {
      const platform = promotions.find(p => p.id === promotionId)?.platform
      const endpoint = `/api/verify/${platform.toLowerCase()}`
      
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
        setPostUrl('')
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div className="h-96 bg-muted rounded-lg"></div>
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
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Promote Products</h1>
            <p className="text-gray-600 mt-1">Earn credits by promoting other products</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Promotion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Promotion
              </CardTitle>
              <CardDescription>
                Choose a product to promote and earn credits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product">Product to Promote</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center gap-2">
                          {product.logo_url && (
                            <img src={product.logo_url} alt="" className="w-4 h-4 rounded" />
                          )}
                          <span>{product.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X">X (Twitter)</SelectItem>
                    <SelectItem value="REDDIT">Reddit</SelectItem>
                    <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                    <SelectItem value="PRODUCTHUNT">ProductHunt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Promotion Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your promotion content here..."
                  rows={4}
                />
              </div>

              <Button onClick={handleCreatePromotion} className="w-full">
                Create Promotion
              </Button>
            </CardContent>
          </Card>

          {/* My Promotions */}
          <Card>
            <CardHeader>
              <CardTitle>My Promotions</CardTitle>
              <CardDescription>
                Track your promotion status and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promotions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No promotions yet</p>
                  </div>
                ) : (
                  promotions.map((promotion) => (
                    <div key={promotion.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                                               <div className="flex items-center gap-2">
                         <span className="text-lg">{getPlatformIcon(promotion.platform)}</span>
                         <div>
                           <h3 className="font-medium">{promotion.product?.name || 'Unknown Product'}</h3>
                           <p className="text-sm text-gray-600">{promotion.platform}</p>
                         </div>
                       </div>
                        {getStatusBadge(promotion.status)}
                      </div>

                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {promotion.content}
                      </p>

                                             {promotion.trackingLink?.trackedUrl && (
                         <div className="flex items-center gap-2 mb-3">
                           <ExternalLink className="h-3 w-3 text-gray-400" />
                           <a
                             href={promotion.trackingLink.trackedUrl}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-xs text-blue-600 hover:underline"
                           >
                             {promotion.trackingLink.trackedUrl}
                           </a>
                         </div>
                       )}

                      {promotion.status === 'PENDING' && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Enter your post URL"
                            value={postUrl}
                            onChange={(e) => setPostUrl(e.target.value)}
                          />
                          <Button
                            onClick={() => handleVerifyPromotion(promotion.id)}
                            disabled={verifying === promotion.id}
                            size="sm"
                            className="w-full"
                          >
                            {verifying === promotion.id ? (
                              <>Verifying...</>
                            ) : (
                              <>Verify Promotion</>
                            )}
                          </Button>
                        </div>
                      )}

                      {promotion.status === 'VERIFIED' && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Check className="h-4 w-4" />
                          <span>Earned {promotion.creditsEarned} credits</span>
                        </div>
                      )}

                      <div className="text-xs text-gray-400 mt-2">
                        Created {new Date(promotion.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}