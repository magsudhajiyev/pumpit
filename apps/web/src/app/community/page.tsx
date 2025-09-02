'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Star, ExternalLink, Search, Filter, TrendingUp, Clock, MessageSquare } from "lucide-react"
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

export default function CommunityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchProducts()
    }
  }, [session])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchQuery, categoryFilter, sortBy])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products/community")
      if (response.ok) {
        const productsData = await response.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
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

    // Sort
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b._count.promotions - a._count.promotions)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
    }

    setFilteredProducts(filtered)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono text-3xl font-bold tracking-tight mb-2">
            Community Feed
          </h1>
          <p className="font-mono text-muted-foreground">
            Discover amazing products from indie makers around the world
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <Star className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <div className="text-lg font-bold">{products.length}</div>
                <div className="text-xs text-muted-foreground">Active Products</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <Users className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <div className="text-lg font-bold">
                  {products.reduce((acc, p) => acc + p._count.promotions, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Promotions</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <TrendingUp className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <div className="text-lg font-bold">
                  {new Set(products.map(p => p.user.email)).size}
                </div>
                <div className="text-xs text-muted-foreground">Makers</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="font-mono">
            <CardContent className="flex items-center p-4">
              <MessageSquare className="h-5 w-5 text-purple-500 mr-3" />
              <div>
                <div className="text-lg font-bold">Live</div>
                <div className="text-xs text-muted-foreground">Community Status</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="font-mono mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Search</label>
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
                <label className="text-sm font-medium mb-1 block">Category</label>
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

              <div>
                <label className="text-sm font-medium mb-1 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="font-mono text-sm text-muted-foreground">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="font-mono">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || categoryFilter !== "all" 
                  ? "Try adjusting your filters to see more products"
                  : "Be the first to submit a product to the community!"
                }
              </p>
              {!searchQuery && categoryFilter === "all" && (
                <Button asChild className="font-mono">
                  <Link href="/dashboard/products/new">Submit Product</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      asChild
                    >
                      <Link href={`/dashboard/promote?product=${product.id}`}>
                        Promote
                      </Link>
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

        {/* Add bottom padding to prevent footer overlap */}
        <div className="pb-12"></div>
      </div>
    </div>
  )
}