'use client'

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ArrowLeft, Search, Zap } from "lucide-react"
import { gsap } from "gsap"
import Link from "next/link"

export default function NotFound() {
  const router = useRouter()
  const containerRef = useRef(null)
  const numbersRef = useRef(null)
  const messageRef = useRef(null)

  // GSAP Animations
  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      // Animate the 404 numbers with bouncy entrance
      gsap.fromTo('.error-number', 
        { 
          opacity: 0, 
          y: -50, 
          scale: 0.5,
          rotation: -10 
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          stagger: 0.2
        }
      )

      // Animate message elements
      gsap.fromTo('.error-message', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          delay: 0.8, 
          ease: "power2.out" 
        }
      )

      gsap.fromTo('.error-buttons', 
        { opacity: 0, y: 20, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6, 
          delay: 1.2, 
          ease: "back.out(1.7)" 
        }
      )

      // Floating animation for background elements
      gsap.to('.floating-element-1', {
        y: -20,
        x: 10,
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      })
      
      gsap.to('.floating-element-2', {
        y: -15,
        x: -10,
        duration: 2.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.5
      })

      gsap.to('.floating-element-3', {
        y: -25,
        duration: 4,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1
      })

      // Subtle pulse animation for the main card
      gsap.to('.error-card', {
        scale: 1.02,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      })

    })

    return () => ctx.revert()
  }, [])

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden flex items-center justify-center px-4">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-element-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/8 to-primary/2 rounded-full blur-3xl"></div>
        <div className="floating-element-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-500/6 to-purple-500/2 rounded-full blur-2xl"></div>
        <div className="floating-element-3 absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-green-500/4 to-blue-500/2 rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="max-w-2xl mx-auto text-center relative z-10">
        {/* 404 Numbers */}
        <div ref={numbersRef} className="mb-8">
          <div className="flex justify-center items-center gap-4 mb-6">
            <span className="error-number font-mono text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              4
            </span>
            <div className="error-number w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
              <Zap className="h-10 w-10 md:h-12 md:w-12 text-primary animate-pulse" />
            </div>
            <span className="error-number font-mono text-8xl md:text-9xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              4
            </span>
          </div>
        </div>

        {/* Error Card */}
        <Card ref={messageRef} className="error-card font-mono shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            <div className="error-message space-y-6">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Oops! Page Not Found
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Looks like you've ventured into uncharted territory. The page you're looking for doesn't exist in our promotion universe.
              </p>
              
              {/* Quick Stats */}
              <div className="flex justify-center gap-8 py-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">404</div>
                  <div className="text-xs text-muted-foreground">Error Code</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">∞</div>
                  <div className="text-xs text-muted-foreground">Pages Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">1</div>
                  <div className="text-xs text-muted-foreground">Solution</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="error-buttons flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleGoBack}
                  className="font-mono bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="font-mono w-full sm:w-auto hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home Page
                  </Button>
                </Link>
                
                <Link href="/community">
                  <Button 
                    variant="outline" 
                    className="font-mono w-full sm:w-auto hover:bg-green-500/10 transition-all duration-300 hover:scale-105"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            Need help? Contact us at{" "}
            <a 
              href="mailto:support@pumpit.com" 
              className="text-primary hover:underline font-medium"
            >
              support@pumpit.com
            </a>
          </p>
        </div>

        {/* Easter Egg */}
        <div className="mt-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs text-muted-foreground font-mono">
            🚀 Fun fact: Even rockets sometimes miss their target, but they always find their way back to launch!
          </p>
        </div>
      </div>
    </main>
  )
}