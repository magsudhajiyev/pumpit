'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Footer } from "./footer"

export function ConditionalFooter() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't show footer on auth pages
  if (!mounted || pathname.startsWith('/auth/')) {
    return null
  }
  
  return <Footer />
}