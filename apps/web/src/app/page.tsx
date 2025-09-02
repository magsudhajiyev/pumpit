'use client'

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Users, Zap, BarChart3, Star, ArrowRight } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedPath, setSelectedPath] = useState<'promote' | 'submit' | null>(null)
  
  // Navigation functions
  const handleBrowseProducts = () => {
    if (session) {
      router.push('/dashboard/promote')
    } else {
      router.push('/auth/signin?callbackUrl=/dashboard/promote')
    }
  }

  const handleSubmitSaas = () => {
    if (session) {
      router.push('/dashboard/products/new')
    } else {
      router.push('/auth/signin?callbackUrl=/dashboard/products/new')
    }
  }
  
  // Animation refs
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const benefitsRef = useRef(null)
  const testimonialsRef = useRef(null)

  // GSAP Animations
  useEffect(() => {
    if (typeof window === 'undefined') return


    const ctx = gsap.context(() => {
      // Hero animations
      const tl = gsap.timeline()
      
      tl.fromTo('.hero-title', 
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" }
      )
      .fromTo('.hero-subtitle', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5"
      )
      .add(() => {
        // Trigger marker highlight animation
        const highlightElement = document.querySelector('.highlight-text')
        if (highlightElement) {
          highlightElement.classList.add('animate')
        }
        
      }, "-=0.2")
      .fromTo('.hero-card', 
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.3"
      )

      // Floating animation for hero elements
      gsap.to('.floating-1', {
        y: -20,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.2
      })
      
      gsap.to('.floating-2', {
        y: -15,
        x: 10,
        duration: 2.5,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.5
      })
      
      gsap.to('.floating-3', {
        y: -25,
        x: -5,
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      })

      // Testimonials scroll animations and continuous sliding
      gsap.fromTo('.testimonial-card', 
        { opacity: 0, y: 30 },
        {
          opacity: 1, 
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      )

      // Continuous sliding animation for testimonials
      const testimonialsTrack = document.querySelector('.testimonials-track')
      if (testimonialsTrack) {
        const testimonialCards = testimonialsTrack.querySelectorAll('.testimonial-card')
        const cardWidth = 320 + 24 // card width + gap
        const totalOriginalWidth = cardWidth * 6 // 6 original testimonials
        
        gsap.set(testimonialsTrack, { x: 0 })
        
        // Infinite loop animation - slides from right to left continuously
        gsap.to(testimonialsTrack, {
          x: -totalOriginalWidth,
          duration: 30,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: function(x) {
              return gsap.utils.wrap(-totalOriginalWidth, 0, parseFloat(x)) + "px"
            }
          },
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: "top 80%",
            toggleActions: "play pause resume pause"
          }
        })

        // Add hover pause effect
        testimonialsTrack.addEventListener('mouseenter', () => {
          gsap.globalTimeline.pause()
        })
        
        testimonialsTrack.addEventListener('mouseleave', () => {
          gsap.globalTimeline.resume()
        })
      }

      // Benefits animations
      gsap.fromTo('.benefit-item', 
        { opacity: 0, x: -50 },
        {
          opacity: 1, 
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      )

      // Parallax effect for background elements
      gsap.to('.parallax-slow', {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      })

      gsap.to('.parallax-fast', {
        yPercent: -100,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top bottom", 
          end: "bottom top",
          scrub: true
        }
      })

    })

    return () => ctx.revert()
  }, [])

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setEmail("")
        
        // Success animation
        gsap.fromTo('.success-animation', 
          { scale: 0, rotation: -180 },
          { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" }
        )
      } else {
        alert("Failed to join waitlist. Please try again.")
      }
    } catch (error) {
      console.error("Waitlist error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 pt-16 relative overflow-hidden">
      {/* Premium Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}></div>
      </div>

      {/* Refined Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/8 to-primary/2 rounded-full blur-3xl"></div>
        <div className="floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-500/6 to-purple-500/2 rounded-full blur-2xl"></div>
        <div className="floating-3 absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-green-500/4 to-blue-500/2 rounded-full blur-3xl"></div>
        <div className="parallax-slow absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/3 rounded-full blur-xl"></div>
        <div className="parallax-fast absolute bottom-20 right-1/3 w-20 h-20 bg-gradient-to-br from-yellow-500/6 to-orange-500/3 rounded-full blur-2xl"></div>
        
        {/* Premium Accent Lines */}
        <div className="absolute top-1/4 left-0 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>
        <div className="absolute top-1/3 right-0 w-px h-24 bg-gradient-to-b from-transparent via-blue-500/15 to-transparent"></div>
        <div className="absolute bottom-1/4 left-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/5 border border-primary/10 backdrop-blur-sm mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="font-mono text-sm font-medium text-primary">Now Live - Join the Community</span>
          </div>
          
          <h1 className="hero-title font-mono text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter mb-6 sm:mb-8 leading-[0.9] px-2">
            Welcome to{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                PumpIt
              </span>
              <div className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary/30 via-blue-600/30 to-purple-600/30 blur-sm"></div>
            </span>
          </h1>
          
          <p className="hero-subtitle font-mono text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground/80 mb-16 sm:mb-20 max-w-4xl mx-auto leading-relaxed font-light px-4">
            The ultimate{" "}
            <span className="highlight-text relative inline-block font-medium text-foreground">
              cross-promotion
            </span>{" "}
            platform where indie makers help indie makers grow
          </p>

          {/* Three-Step Process */}
          <div className="max-w-7xl mx-auto mb-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted/50 border border-border/50 mb-4">
                <span className="font-mono text-xs font-medium text-muted-foreground">PROCESS</span>
              </div>
              <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                How It Works in{" "}
                <span className="text-primary">3 Simple Steps</span>
              </h2>
              <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
                From setup to success in minutes, not months
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative px-4">
              {/* Step 1 */}
              <div className="step-card group relative">
                <Card className="font-mono h-full transition-all duration-700 hover:-translate-y-3 hover:scale-[1.02] bg-gradient-to-b from-card/90 via-card/95 to-card backdrop-blur-md border border-border/50 hover:border-blue-200/50 dark:hover:border-blue-800/50 hover:shadow-2xl hover:shadow-blue-500/10">
                  <CardHeader className="text-center pb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="step-number w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10 flex-shrink-0">
                      <span className="relative">
                        1
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-700/30 to-transparent rounded-2xl"></div>
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-300 mb-2">
                      Set Up Your Launch Page
                    </CardTitle>
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  </CardHeader>
                  <CardContent className="text-center px-6 pb-8 relative">
                    <div className="step-icon mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 filter drop-shadow-lg">
                      <div className="w-32 h-32 mx-auto">
                        <DotLottieReact
                          src="https://lottie.host/ebc3e934-7e17-4d69-808a-a1c3afb4ff4f/0w6KSwuZGN.lottie"
                          loop
                          autoplay
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      Submit your product with compelling details. Create your launch page that showcases what makes your product special and worth promoting.
                    </p>
                    <div className="mt-6 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <div className="text-xs text-blue-600 font-semibold flex items-center justify-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        Professional launch page in minutes
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Premium Arrow */}
                <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-20">
                  <div className="arrow-bounce relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                    <div className="relative bg-gradient-to-r from-primary to-blue-600 p-3 rounded-full shadow-2xl border border-white/20">
                      <ArrowRight className="h-6 w-6 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="step-card group relative">
                <Card className="font-mono h-full transition-all duration-700 hover:-translate-y-3 hover:scale-[1.02] bg-gradient-to-b from-card/90 via-card/95 to-card backdrop-blur-md border border-border/50 hover:border-green-200/50 dark:hover:border-green-800/50 hover:shadow-2xl hover:shadow-green-500/10">
                  <CardHeader className="text-center pb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="step-number w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10 flex-shrink-0">
                      <span className="relative">
                        2
                        <div className="absolute inset-0 bg-gradient-to-t from-green-700/30 to-transparent rounded-2xl"></div>
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-green-600 transition-colors duration-300 mb-2">
                      Promote Other Products
                    </CardTitle>
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  </CardHeader>
                  <CardContent className="text-center px-6 pb-8 relative">
                    <div className="step-icon text-5xl mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 filter drop-shadow-lg">
                      🤝
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      Share products you genuinely love on X, LinkedIn, Reddit, or ProductHunt. Earn credits for each authentic promotion that drives real engagement.
                    </p>
                    <div className="mt-6 p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <div className="text-xs text-green-600 font-semibold flex items-center justify-center gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        Earn credits for helping others succeed
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Premium Arrow */}
                <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-20">
                  <div className="arrow-bounce relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                    <div className="relative bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-full shadow-2xl border border-white/20">
                      <ArrowRight className="h-6 w-6 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="step-card group relative">
                <Card className="font-mono h-full transition-all duration-700 hover:-translate-y-3 hover:scale-[1.02] bg-gradient-to-b from-card/90 via-card/95 to-card backdrop-blur-md border border-border/50 hover:border-purple-200/50 dark:hover:border-purple-800/50 hover:shadow-2xl hover:shadow-purple-500/10">
                  <CardHeader className="text-center pb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="step-number w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10 flex-shrink-0">
                      <span className="relative">
                        3
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-700/30 to-transparent rounded-2xl"></div>
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-purple-600 transition-colors duration-300 mb-2">
                      Enjoy Organic Growth
                    </CardTitle>
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mx-auto opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  </CardHeader>
                  <CardContent className="text-center px-6 pb-8 relative">
                    <div className="step-icon text-5xl mb-6 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 filter drop-shadow-lg">
                      📈
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      Watch as fellow makers promote your product to their audiences. Get authentic traffic, real users, and genuine feedback from people who care.
                    </p>
                    <div className="mt-6 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                      <div className="text-xs text-purple-600 font-semibold flex items-center justify-center gap-2">
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                        Real users, real growth, real results
                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <p className="font-mono text-lg text-muted-foreground mb-6">
                Ready to grow your product the right way?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted/50 border border-border/50 mb-4">
              <span className="font-mono text-xs font-medium text-muted-foreground">TESTIMONIALS</span>
            </div>
            <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              What Makers Are Saying
            </h2>
            <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
              Real feedback from indie makers who've grown their products with PumpIt
            </p>
          </div>
          
          {/* Testimonials Container */}
          <div className="testimonials-container relative">
            <div className="testimonials-track flex gap-6" style={{ width: 'max-content' }}>
              {/* First set of testimonials */}
              {/* Testimonial 1 */}
              <Card className="testimonial-card font-mono w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "PumpIt helped me get my first 1,000 users in just 2 weeks. The community is incredibly supportive, and the promotions feel authentic, not spammy."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      S
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Sarah Chen</div>
                      <div className="text-xs text-muted-foreground">Founder, TaskFlow</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 2 */}
              <Card className="testimonial-card font-mono w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "I've tried many promotion platforms, but PumpIt's community-driven approach is refreshing. Real makers promoting products they actually believe in."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      M
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Marcus Rodriguez</div>
                      <div className="text-xs text-muted-foreground">Creator, DevToolbox</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 3 */}
              <Card className="testimonial-card font-mono w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "The analytics are incredible. I can see exactly which promotions drive the most engaged users. It's like having a growth team for free."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Alex Thompson</div>
                      <div className="text-xs text-muted-foreground">Founder, CodeSnippet Generator</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 4 */}
              <Card className="testimonial-card font-mono w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "As someone who struggles with marketing, PumpIt made it so easy to get genuine exposure. The credit system is genius – everyone wins."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      J
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Jamie Park</div>
                      <div className="text-xs text-muted-foreground">Solo Developer, WriteAssist</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 5 */}
              <Card className="testimonial-card font-mono w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "I went from 0 to 5,000 users in 3 months thanks to the PumpIt community. The quality of users is outstanding – they actually convert."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      L
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Lisa Wang</div>
                      <div className="text-xs text-muted-foreground">Founder, DesignSync</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 6 */}
              <Card className="testimonial-card font-mono w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "The platform feels like having a network of co-founders promoting each other. It's collaboration, not competition. Exactly what indie makers need."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      D
                    </div>
                    <div>
                      <div className="font-semibold text-sm">David Kumar</div>
                      <div className="text-xs text-muted-foreground">Creator, APIMonitor</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Duplicate testimonials for seamless loop */}
              {/* Testimonial 1 - Duplicate */}
              <Card className="testimonial-card font-mono w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "PumpIt helped me get my first 1,000 users in just 2 weeks. The community is incredibly supportive, and the promotions feel authentic, not spammy."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      S
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Sarah Chen</div>
                      <div className="text-xs text-muted-foreground">Founder, TaskFlow</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 2 - Duplicate */}
              <Card className="testimonial-card font-mono w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "I've tried many promotion platforms, but PumpIt's community-driven approach is refreshing. Real makers promoting products they actually believe in."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      M
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Marcus Rodriguez</div>
                      <div className="text-xs text-muted-foreground">Creator, DevToolbox</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonial 3 - Duplicate */}
              <Card className="testimonial-card font-mono w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "The analytics are incredible. I can see exactly which promotions drive the most engaged users. It's like having a growth team for free."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Alex Thompson</div>
                      <div className="text-xs text-muted-foreground">Founder, CodeSnippet Generator</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Gamified Value Proposition Widget */}
      <section ref={benefitsRef} id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted/50 border border-border/50 mb-4">
              <span className="font-mono text-xs font-medium text-muted-foreground">CHOOSE YOUR PATH</span>
            </div>
            <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              What Brings You to{" "}
              <span className="text-primary">PumpIt</span>?
            </h2>
            <p className="font-mono text-muted-foreground max-w-2xl mx-auto">
              Different goals, tailored benefits. Choose your journey.
            </p>
          </div>

          {/* Path Selection */}
          {!selectedPath && (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 mb-12 px-4">
              <Card 
                className="font-mono cursor-pointer group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] premium-card border-2 hover:border-blue-200/50 dark:hover:border-blue-800/50"
                onClick={() => setSelectedPath('promote')}
              >
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    I want to promote SaaS products
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Earn credits by promoting products you genuinely love and help fellow makers grow
                  </p>
                  <div className="text-sm text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500">
                    👆 Click to see your benefits
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="font-mono cursor-pointer group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] premium-card border-2 hover:border-green-200/50 dark:hover:border-green-800/50"
                onClick={() => setSelectedPath('submit')}
              >
                <CardHeader className="text-center pb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-green-600 transition-colors">
                    I want to submit my SaaS for promotion
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Get your product in front of a community of engaged makers and potential customers
                  </p>
                  <div className="text-sm text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500">
                    👆 Click to see your benefits
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Value Proposition for Promoters */}
          {selectedPath === 'promote' && (
            <div className="animate-in slide-in-from-bottom duration-500">
              <Card className="font-mono bg-gradient-to-br from-blue-50/50 via-blue-50/30 to-transparent dark:from-blue-900/20 dark:via-blue-900/10 dark:to-transparent border-blue-200/30 dark:border-blue-800/30">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-blue-700 dark:text-blue-300 mb-2">
                    Become a PumpIt Promoter
                  </CardTitle>
                  <p className="text-muted-foreground">Here's what you get for helping others succeed</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">💰</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300">Earn 10 Credits per Promotion</h4>
                          <p className="text-sm text-muted-foreground">Each verified promotion earns you credits to promote your own products</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">🎯</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300">Choose Products You Love</h4>
                          <p className="text-sm text-muted-foreground">Only promote SaaS tools you genuinely find valuable</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">📊</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300">Track Your Impact</h4>
                          <p className="text-sm text-muted-foreground">See real metrics: clicks, engagement, and conversion rates</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">🌟</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300">Build Your Reputation</h4>
                          <p className="text-sm text-muted-foreground">Become a trusted voice in the maker community</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 pt-6">
                    <Button 
                      className="font-mono bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      onClick={handleBrowseProducts}
                    >
                      Browse Products to Promote
                    </Button>
                    <Button 
                      variant="outline" 
                      className="font-mono"
                      onClick={() => setSelectedPath(null)}
                    >
                      ← Back to Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Value Proposition for SaaS Submitters */}
          {selectedPath === 'submit' && (
            <div className="animate-in slide-in-from-bottom duration-500">
              <Card className="font-mono bg-gradient-to-br from-green-50/50 via-green-50/30 to-transparent dark:from-green-900/20 dark:via-green-900/10 dark:to-transparent border-green-200/30 dark:border-green-800/30">
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-700 rounded-3xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-green-700 dark:text-green-300 mb-2">
                    Submit Your SaaS for Promotion
                  </CardTitle>
                  <p className="text-muted-foreground">Here's what you get when the community promotes your product</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">👥</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-300">Authentic User Acquisition</h4>
                          <p className="text-sm text-muted-foreground">Real makers promoting to their genuine networks</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">💬</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-300">Genuine Reviews & Feedback</h4>
                          <p className="text-sm text-muted-foreground">Get honest feedback from actual potential customers</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">📈</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-300">Multi-Platform Exposure</h4>
                          <p className="text-sm text-muted-foreground">Get promoted on X, LinkedIn, Reddit, and ProductHunt</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">🎯</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-700 dark:text-green-300">Targeted Audience</h4>
                          <p className="text-sm text-muted-foreground">Reach makers and entrepreneurs who need your solution</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-100/50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-700 dark:text-green-300">Fair Exchange Model</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your promoters earn credits that they can use to promote their own products, creating a thriving ecosystem of mutual support.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4 pt-6">
                    <Button 
                      className="font-mono bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      onClick={handleSubmitSaas}
                    >
                      Submit My SaaS Product
                    </Button>
                    <Button 
                      variant="outline" 
                      className="font-mono"
                      onClick={() => setSelectedPath(null)}
                    >
                      ← Back to Selection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-mono text-3xl md:text-4xl font-bold mb-8 tracking-tight">
            About PumpIt
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              <strong className="text-foreground">PumpIt Technologies</strong> is the ultimate cross-promotion platform designed specifically for indie makers, solo developers, and small teams who want to grow their products through strategic partnerships.
            </p>
            <p>
              Our mission is simple: help indie creators help each other. Instead of competing for attention in a crowded market, we believe in the power of collaboration and mutual support within the indie community.
            </p>
            <p>
              Built by indie makers, for indie makers, PumpIt provides the tools, analytics, and community you need to discover relevant partners, create successful cross-promotion campaigns, and grow your reach authentically.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Indie Products</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Cross-Promotions</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">2M+</div>
              <div className="text-sm text-muted-foreground">Referral Visits</div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-blue-500/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-mono text-3xl font-bold mb-6">
            Ready to Transform Your Product Launch?
          </h2>
          <p className="font-mono text-lg text-muted-foreground mb-12">
            Join thousands of indie makers who are growing together through authentic cross-promotion
          </p>
          
          {/* Waitlist Form */}
          <Card className="hero-card max-w-md mx-auto font-mono shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Join the Waitlist</CardTitle>
              <CardDescription>Be the first to know when we launch</CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="success-animation text-center py-4">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-green-600 font-medium">Thanks for joining! We'll be in touch.</p>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1 transition-all duration-300 focus:scale-105"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Joining..." : "Join Waitlist"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-60 px-4">
            <div className="font-mono text-xs sm:text-sm">🚀 Launch Ready</div>
            <div className="font-mono text-xs sm:text-sm">⚡ Fast Setup</div>
            <div className="font-mono text-xs sm:text-sm">🤝 Community Driven</div>
            <div className="font-mono text-xs sm:text-sm">📈 Real Results</div>
          </div>
        </div>
      </section>
    </main>
  )
}