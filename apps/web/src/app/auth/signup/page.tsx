'use client'

import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Mail, Eye, EyeOff, Check } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful, show success message with smooth transition
        alert("Account created successfully! Redirecting to sign in...")
        
        // Add a smooth transition delay before redirect
        setTimeout(() => {
          window.location.href = "/auth/signin"
        }, 1500)
      } else {
        // Registration failed
        alert(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/" })
  }

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
    { met: /[0-9]/.test(formData.password), text: "One number" },
  ]

  const isFormValid = 
    formData.name && 
    formData.email && 
    formData.password.length >= 8 && 
    formData.password === formData.confirmPassword &&
    agreedToTerms

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-green-500 via-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Start your cross-promotion journey today
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Connect with like-minded makers, promote amazing products, and grow your own audience organically.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4" />
                </div>
                <span>Authentic promotions from real users</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4" />
                </div>
                <span>Earn credits by promoting others</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <Check className="w-4 h-4" />
                </div>
                <span>Real-time analytics and tracking</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-32 left-20 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute bottom-40 left-32 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center font-mono">
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-gray-600 mt-2 text-sm">
              Join the PumpIt community
            </p>
          </div>


          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6 font-mono">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="mt-1 h-12"
                />
              </div>

              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="mt-1 h-12"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <Check className={`h-3 w-3 mr-2 ${req.met ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary mt-1"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-muted-foreground">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 font-mono text-sm" 
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 font-mono">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}