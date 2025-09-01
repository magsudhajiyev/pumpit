'use client'

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NotificationCenter } from "./notification-center"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleGetStarted = () => {
    router.push('/auth/signup')
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleNavigateToSection = (sectionId: string) => {
    if (pathname === '/') {
      // If on homepage, just scroll to section
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // If on another page, navigate to homepage with hash
      router.push(`/#${sectionId}`)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="font-mono text-xl font-bold">
              PumpIt
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 font-mono text-sm">
            {session ? (
              // Authenticated navigation
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/promote" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Promote
                </Link>
                <Link 
                  href="/dashboard/analytics" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Analytics
                </Link>
                <Link 
                  href="/community" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Community
                </Link>
              </>
            ) : (
              // Public navigation
              <>
                <button 
                  onClick={() => handleNavigateToSection('features')}
                  className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Features
                </button>
                <button 
                  onClick={() => handleNavigateToSection('benefits')}
                  className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Benefits
                </button>
                <Link 
                  href="/pricing" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Pricing
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <NotificationCenter />
                <span className="font-mono text-sm text-gray-600">
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <Button 
                  onClick={handleSignOut}
                  size="sm" 
                  variant="outline"
                  className="font-mono text-sm px-4 py-2"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin"
                  className="font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Button 
                  onClick={handleGetStarted}
                  size="sm" 
                  className="font-mono text-sm px-4 py-2"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-background/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-3">
              {session ? (
                <>
                  {/* Mobile Navigation Links */}
                  <Link 
                    href="/dashboard" 
                    className="block font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/dashboard/promote" 
                    className="block font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    Promote
                  </Link>
                  <Link 
                    href="/dashboard/analytics" 
                    className="block font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    Analytics
                  </Link>
                  <Link 
                    href="/community" 
                    className="block font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    Community
                  </Link>
                  
                  {/* Mobile User Info */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="font-mono text-sm text-gray-600 mb-3">
                      Welcome, {session.user?.name || session.user?.email}
                    </p>
                    <Button 
                      onClick={handleSignOut}
                      size="sm" 
                      variant="outline"
                      className="font-mono text-sm w-full"
                    >
                      Sign out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile Public Navigation */}
                  <button 
                    onClick={() => {
                      handleNavigateToSection('features')
                      closeMobileMenu()
                    }}
                    className="block font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors py-2 w-full text-left"
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => {
                      handleNavigateToSection('benefits')
                      closeMobileMenu()
                    }}
                    className="block font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors py-2 w-full text-left"
                  >
                    Benefits
                  </button>
                  <Link 
                    href="/pricing" 
                    className="block font-mono text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
                    onClick={closeMobileMenu}
                  >
                    Pricing
                  </Link>
                  
                  {/* Mobile Auth Buttons */}
                  <div className="pt-3 border-t border-gray-200 space-y-3">
                    <Link 
                      href="/auth/signin"
                      className="block font-mono text-sm text-center py-2 text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Sign in
                    </Link>
                    <Button 
                      onClick={() => {
                        handleGetStarted()
                        closeMobileMenu()
                      }}
                      size="sm" 
                      className="font-mono text-sm w-full"
                    >
                      Get Started
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}