'use client'

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Clock, ExternalLink, Star, ChevronLeft, ChevronRight } from "lucide-react"
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

interface ProductsResponse {
  products: Product[]
  totalCount: number
  currentPage: number
  totalPages: number
}

const PRODUCTS_PER_PAGE = 6

function ProductsPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = parseInt(searchParams?.get('page') || '1')
  
  const [data, setData] = useState<ProductsResponse>({
    products: [],
    totalCount: 0,
    currentPage: 1,
    totalPages: 1
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchProducts()
    }
  }, [session, currentPage])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`)
      
      if (response.ok) {
        const productsData = await response.json()
        setData(productsData)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    router.push(url.pathname + url.search)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-7xl mx-auto">
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

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-3xl font-bold tracking-tight mb-2">
                Your Products
              </h1>
              <p className="font-mono text-muted-foreground">
                Manage and track all your submitted products
              </p>
            </div>
            <Link href="/dashboard/products/new">
              <Button className="font-mono">
                <Plus className="mr-2 h-4 w-4" />
                Submit Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-6">
          <p className="font-mono text-sm text-muted-foreground">
            Showing {data.products.length} of {data.totalCount} products
          </p>
        </div>

        {/* Products Grid */}
        {data.products.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.products.map((product) => (
                <Card key={product.id} className="font-mono">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {product.description.length > 100 
                            ? `${product.description.substring(0, 100)}...` 
                            : product.description
                          }
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
                    <div className="space-y-4">
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
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a 
                            href={product.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-mono"
                          >
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Visit
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link href={`/dashboard/products/${product.id}`}>
                            Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="font-mono"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="font-mono min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= data.totalPages}
                  className="font-mono"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
        
        {/* Add bottom padding to prevent footer overlap */}
        <div className="pb-12"></div>
      </div>
    </div>
  )
}

function ProductsPageLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsPageContent />
    </Suspense>
  )
}