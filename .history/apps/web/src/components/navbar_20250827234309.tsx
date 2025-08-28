'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { NotificationCenter } from "./notification-center"

export function Navbar() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const handleGetStarted = () => {
    router.push('/auth/signup')
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
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
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Features
                </button>
                <button 
                  onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
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

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
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
            {session ? (
              <Button 
                onClick={handleSignOut}
                size="sm" 
                variant="outline"
                className="font-mono text-xs px-3 py-1"
              >
                Sign out
              </Button>
            ) : (
              <Button 
                onClick={handleGetStarted}
                size="sm" 
                className="font-mono text-xs px-3 py-1"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}