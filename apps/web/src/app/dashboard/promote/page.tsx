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
import { ArrowLeft, Plus, ExternalLink, Check, Clock, AlertCircle, Search, Filter, Users, Star } from "lucide-react"
import Link from "next/link"
import { getFirstName } from "@/lib/utils/name"

interface Product {
  id: string
  name: string
  description: string
  websiteUrl: string
  logoUrl?: string
  category: string
  trackType: string
  paidAmount?: number
  createdAt: string
  user: {
    name?: string
    email: string
  }
  _count: {
    promotions: number
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [platform, setPlatform] = useState<string>('')
  const [content, setContent] = useState('')
  const [postUrls, setPostUrls] = useState<Record<string, string>>({})
  const [verifying, setVerifying] = useState<string | null>(null)
  const [showPromotionForm, setShowPromotionForm] = useState(false)

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

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery, categoryFilter])

  // Set selected product when products are loaded and we have a product ID from URL
  useEffect(() => {
    if (products.length > 0 && productIdFromUrl) {
      // Check if the product ID from URL exists in our products list
      const productExists = products.find(p => p.id === productIdFromUrl)
      if (productExists) {
        setSelectedProduct(productExists)
        setShowPromotionForm(true)
      }
    }
  }, [products, productIdFromUrl])

  const fetchData = async () => {
    try {
      const [productsRes, promotionsRes] = await Promise.all([
        fetch("/api/products/community"),
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

  const filterProducts = () => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter)
    }

    setFilteredProducts(filtered)
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
          productId: selectedProduct.id,
          platform,
          content: content.trim(),
        }),
      })

      if (response.ok) {
        const promotion = await response.json()
        setPromotions(prev => [promotion, ...prev])
        setSelectedProduct(null)
        setPlatform('')
        setContent('')
        setShowPromotionForm(false)
        alert("Promotion created successfully! Redirecting to track your promotion...")
        setTimeout(() => {
          router.push("/dashboard/promotions")
        }, 1500)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create promotion")
      }
    } catch (error) {
      console.error("Failed to create promotion:", error)
      alert("Failed to create promotion")
    }
  }

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowPromotionForm(true)
  }

  const handleBackToProducts = () => {
    setSelectedProduct(null)
    setShowPromotionForm(false)
    setPlatform('')
    setContent('')
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
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight">
              {showPromotionForm ? 'Create Promotion' : 'Promote Products'}
            </h1>
            <p className="font-mono text-muted-foreground mt-1">
              {showPromotionForm 
                ? `Promoting "${selectedProduct?.name}"`
                : 'Choose a product to promote and earn credits'
              }
            </p>
          </div>
        </div>

        {showPromotionForm ? (
          /* Promotion Form */
          <div className="max-w-2xl mx-auto">
            <Card className="font-mono">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create Promotion
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleBackToProducts}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </div>
                <CardDescription>
                  You're promoting "{selectedProduct?.name}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Product Preview */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-start gap-3">
                    {selectedProduct?.logoUrl && (
                      <img 
                        src={selectedProduct.logoUrl} 
                        alt={selectedProduct.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedProduct?.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {selectedProduct?.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {selectedProduct?.category}
                        </Badge>
                        <Badge 
                          variant={selectedProduct?.trackType === 'PAID' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {selectedProduct?.trackType === 'PAID' 
                            ? `$${selectedProduct?.paidAmount}` 
                            : 'Credits'
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="X">𝕏 (Twitter)</SelectItem>
                      <SelectItem value="REDDIT">📱 Reddit</SelectItem>
                      <SelectItem value="LINKEDIN">💼 LinkedIn</SelectItem>
                      <SelectItem value="PRODUCTHUNT">🚀 ProductHunt</SelectItem>
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
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Write an authentic, engaging post about this product
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleCreatePromotion} className="flex-1 font-mono">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Promotion
                  </Button>
                  <Link href="/dashboard/promotions">
                    <Button variant="outline" className="font-mono">
                      View My Promotions
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Products Grid */
          <div>
            {/* Filters */}
            <Card className="font-mono mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Find Products to Promote
                </CardTitle>
                <CardDescription>
                  Browse and filter community products to promote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Search Products</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products or makers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Category</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="SAAS">SaaS</SelectItem>
                        <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                        <SelectItem value="TOOL">Tool</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Count */}
            <div className="mb-6">
              <p className="font-mono text-sm text-muted-foreground">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} to promote
              </p>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <Card className="font-mono">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchQuery || categoryFilter !== "all" 
                      ? "Try adjusting your filters to see more products"
                      : "No products available for promotion at the moment"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="font-mono hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {product.logoUrl && (
                              <img 
                                src={product.logoUrl} 
                                alt={product.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                              <p className="text-xs text-muted-foreground">
                                by {getFirstName(product.user.name) || 'Anonymous'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            <Badge 
                              variant={product.trackType === 'PAID' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {product.trackType === 'PAID' ? `$${product.paidAmount}` : 'Credits'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-sm line-clamp-3">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="mr-1 h-3 w-3" />
                          {product._count.promotions} promotions
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 font-mono"
                          onClick={() => handleSelectProduct(product)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Promote
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={product.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}