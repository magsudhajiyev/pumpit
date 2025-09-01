'use client'

import { signIn, getSession } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Mail, Eye, EyeOff } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result?.ok) {
        toast.success("Welcome back! Redirecting to dashboard...")
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1000)
      } else {
        if (result?.error === "CredentialsSignin") {
          toast.error("Invalid email or password. Please try again.")
        } else {
          toast.error("Sign in failed. Please try again.")
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center font-mono">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-gray-600 mt-2 text-sm">
              Sign in to your PumpIt account
            </p>
          </div>


          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6 font-mono">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-muted-foreground">
                  Remember me
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-12 font-mono text-sm" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 font-mono">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Amplify your product's reach with authentic promotions
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of indie makers who trust PumpIt to grow their audience through genuine community support.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-3xl font-bold">10,000+</div>
                <div className="text-sm opacity-80">Active Promoters</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50,000+</div>
                <div className="text-sm opacity-80">Products Promoted</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm"></div>
      </div>
    </div>
  )
}