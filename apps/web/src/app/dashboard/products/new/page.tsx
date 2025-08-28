'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ProductFormData {
  name: string
  description: string
  websiteUrl: string
  logoUrl: string
  category: string
  trackType: string
  paidAmount: string
}

export default function NewProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    websiteUrl: "",
    logoUrl: "",
    category: "OTHER",
    trackType: "RECIPROCAL",
    paidAmount: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-8"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          paidAmount: formData.trackType === "PAID" && formData.paidAmount ? parseFloat(formData.paidAmount) : null
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/dashboard/products/${data.id}`)
      } else {
        alert(data.error || "Failed to create product")
      }
    } catch (error) {
      console.error("Product creation error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = 
    formData.name && 
    formData.description && 
    formData.websiteUrl && 
    formData.category &&
    formData.trackType &&
    (formData.trackType === "RECIPROCAL" || (formData.trackType === "PAID" && formData.paidAmount))

  return (
    <div className="min-h-screen bg-background pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
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
          <h1 className="font-mono text-3xl font-bold tracking-tight mb-2">
            Submit Your Product
          </h1>
          <p className="font-mono text-muted-foreground">
            Get authentic promotions from the PumpIt community
          </p>
        </div>

        {/* Product Form */}
        <Card className="font-mono">
          <CardHeader>
            <CardTitle className="text-xl">Product Details</CardTitle>
            <CardDescription>
              Tell the community about your amazing product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., PumpIt - Cross-Promotion Platform"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product in detail. What problem does it solve? What makes it unique?"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    required
                    className="mt-1 min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be used by promoters to understand and promote your product
                  </p>
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Website URL *</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://yourproduct.com"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://yourproduct.com/logo.png"
                    value={formData.logoUrl}
                    onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A logo helps your product stand out in the community feed
                  </p>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAAS">SaaS</SelectItem>
                    <SelectItem value="NEWSLETTER">Newsletter</SelectItem>
                    <SelectItem value="TOOL">Tool</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Track Type */}
              <div>
                <Label htmlFor="trackType">Promotion Type *</Label>
                <Select value={formData.trackType} onValueChange={(value) => handleInputChange("trackType", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select promotion type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECIPROCAL">Reciprocal (Credit-based)</SelectItem>
                    <SelectItem value="PAID">Paid Promotions</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.trackType === "RECIPROCAL" 
                    ? "Promoters earn credits that they can use for their own products"
                    : "You pay promoters directly for promoting your product"
                  }
                </p>
              </div>

              {/* Paid Amount (conditional) */}
              {formData.trackType === "PAID" && (
                <div>
                  <Label htmlFor="paidAmount">Payment per Promotion ($) *</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10.00"
                    value={formData.paidAmount}
                    onChange={(e) => handleInputChange("paidAmount", e.target.value)}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Amount you'll pay for each verified promotion
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full font-mono" 
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? "Creating Product..." : "Submit Product"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {formData.trackType === "RECIPROCAL" 
                    ? "Your product will be active once you complete 2 promotions"
                    : "Your product will be reviewed and activated within 24 hours"
                  }
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}