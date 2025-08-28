'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ExternalLink, Copy, Check, Twitter, Linkedin, MessageSquare, Trophy } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  websiteUrl: string
  logoUrl?: string
  category: string
  trackType: string
  paidAmount?: number
  user: {
    name?: string
    email: string
  }
}

interface PromotePageProps {
  params: {
    id: string
  }
}

export default function PromoteProductPage({ params }: PromotePageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState<string>("")
  const [content, setContent] = useState("")
  const [trackingLink, setTrackingLink] = useState("")
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false)
  const [copiedTracking, setCopiedTracking] = useState(false)
  const [copiedContent, setCopiedContent] = useState(false)

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
      const response = await fetch(`/api/products/public/${params.id}`)
      if (response.ok) {
        const productData = await response.json()
        setProduct(productData)
        generateContent(productData)
      } else {
        router.push("/dashboard/promote")
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
      router.push("/dashboard/promote")
    } finally {
      setLoading(false)
    }
  }

  const generateContent = (product: Product) => {
    const templates = {
      X: `Just discovered ${product.name}! 🚀\n\n${product.description.slice(0, 150)}${product.description.length > 150 ? '...' : ''}\n\nCheck it out: [TRACKING_LINK]\n\n#IndieHacker #${product.category.toLowerCase()}`,
      REDDIT: `I found this amazing ${product.category.toLowerCase()} called ${product.name}\n\n${product.description}\n\nDefinitely worth checking out: [TRACKING_LINK]\n\nWhat do you think?`,
      LINKEDIN: `Excited to share ${product.name} with my network! 💼\n\n${product.description}\n\nIf you're looking for a ${product.category.toLowerCase()} solution, this might be exactly what you need.\n\nLearn more: [TRACKING_LINK]`,
      PRODUCTHUNT: `Congrats on the launch! ${product.name} looks like a fantastic ${product.category.toLowerCase()}.\n\n${product.description.slice(0, 100)}${product.description.length > 100 ? '...' : ''}\n\nGreat work! [TRACKING_LINK]`
    }
    
    setContent(templates[platform as keyof typeof templates] || "")
  }

  const handleCreatePromotion = async () => {
    if (!platform || !content) return

    setIsCreatingPromotion(true)

    try {
      const response = await fetch("/api/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: params.id,
          platform,
          content,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTrackingLink(data.trackingLink)
        const contentWithLink = content.replace("[TRACKING_LINK]", data.trackingLink)
        setContent(contentWithLink)
      } else {
        alert(data.error || "Failed to create promotion")
      }
    } catch (error) {
      console.error("Promotion creation error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsCreatingPromotion(false)
    }
  }

  const copyTrackingLink = () => {
    navigator.clipboard.writeText(trackingLink)
    setCopiedTracking(true)
    setTimeout(() => setCopiedTracking(false), 2000)
  }

  const copyContent = () => {
    navigator.clipboard.writeText(content)
    setCopiedContent(true)
    setTimeout(() => setCopiedContent(false), 2000)
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'X': return <Twitter className="h-4 w-4" />
      case 'LINKEDIN': return <Linkedin className="h-4 w-4" />
      case 'REDDIT': return <MessageSquare className="h-4 w-4" />
      case 'PRODUCTHUNT': return <Trophy className="h-4 w-4" />
      default: return null
    }
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

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/dashboard/promote">
              <Button variant="ghost" size="sm" className="font-mono">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
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
                    Promote {product.name}
                  </h1>
                  <p className="font-mono text-muted-foreground text-sm">
                    by {product.user.name || 'Anonymous'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {product.category}
                </Badge>
                <Badge 
                  variant={product.trackType === 'PAID' ? 'default' : 'secondary'}
                  className="font-mono text-xs"
                >
                  {product.trackType === 'PAID' ? `$${product.paidAmount}` : 'Credits'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-mono">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Site
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info */}
            <Card className="font-mono">
              <CardHeader>
                <CardTitle>About This Product</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>

            {/* Platform Selection */}
            <Card className="font-mono">
              <CardHeader>
                <CardTitle>Choose Platform</CardTitle>
                <CardDescription>Select where you want to promote this product</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={platform} onValueChange={(value) => {
                  setPlatform(value)
                  generateContent(product)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X">
                      <div className="flex items-center">
                        <Twitter className="mr-2 h-4 w-4" />
                        X (Twitter)
                      </div>
                    </SelectItem>
                    <SelectItem value="LINKEDIN">
                      <div className="flex items-center">
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                      </div>
                    </SelectItem>
                    <SelectItem value="REDDIT">
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Reddit
                      </div>
                    </SelectItem>
                    <SelectItem value="PRODUCTHUNT">
                      <div className="flex items-center">
                        <Trophy className="mr-2 h-4 w-4" />
                        Product Hunt
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Content Creation */}
            {platform && (
              <Card className="font-mono">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getPlatformIcon(platform)}
                    <span className="ml-2">Promotion Content</span>
                  </CardTitle>
                  <CardDescription>
                    Customize your promotion post below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your promotion content..."
                      className="min-h-[120px]"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-muted-foreground">
                        {content.includes("[TRACKING_LINK]") 
                          ? "Tracking link will be generated after creating promotion"
                          : "Tracking link included"
                        }
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyContent}
                        disabled={!content}
                      >
                        {copiedContent ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedContent ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  {!trackingLink ? (
                    <Button 
                      onClick={handleCreatePromotion} 
                      disabled={!content || isCreatingPromotion}
                      className="w-full font-mono"
                    >
                      {isCreatingPromotion ? "Creating Promotion..." : "Create Promotion & Get Tracking Link"}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-2">
                          ✅ Promotion Created Successfully!
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white p-1 rounded flex-1 break-all">
                            {trackingLink}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyTrackingLink}
                          >
                            {copiedTracking ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            {trackingLink && (
              <Card className="font-mono">
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>Complete your promotion to earn credits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Post on {platform}</p>
                      <p className="text-xs text-muted-foreground">Copy your content and post it on {platform.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">2</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Submit for verification</p>
                      <p className="text-xs text-muted-foreground">Come back and submit your post URL for verification</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">3</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Earn credits</p>
                      <p className="text-xs text-muted-foreground">Get credits once your promotion is verified</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Earnings Info */}
            <Card className="font-mono">
              <CardHeader>
                <CardTitle className="text-lg">Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {product.trackType === 'PAID' ? `$${product.paidAmount}` : '10 Credits'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.trackType === 'PAID' ? 'Payment per verified promotion' : 'Credits per verified promotion'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Platform Guidelines */}
            {platform && (
              <Card className="font-mono">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    {getPlatformIcon(platform)}
                    <span className="ml-2">{platform} Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {platform === 'X' && (
                    <>
                      <p>• Keep it under 280 characters</p>
                      <p>• Use relevant hashtags</p>
                      <p>• Engage with replies</p>
                      <p>• Post during peak hours</p>
                    </>
                  )}
                  {platform === 'LINKEDIN' && (
                    <>
                      <p>• Write in a professional tone</p>
                      <p>• Share your experience</p>
                      <p>• Tag relevant connections</p>
                      <p>• Use industry hashtags</p>
                    </>
                  )}
                  {platform === 'REDDIT' && (
                    <>
                      <p>• Follow subreddit rules</p>
                      <p>• Be genuine and helpful</p>
                      <p>• Engage with comments</p>
                      <p>• Don't spam</p>
                    </>
                  )}
                  {platform === 'PRODUCTHUNT' && (
                    <>
                      <p>• Be supportive and positive</p>
                      <p>• Ask thoughtful questions</p>
                      <p>• Share genuine feedback</p>
                      <p>• Engage with the maker</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}