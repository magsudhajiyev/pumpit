'use client'

import { usePathname } from "next/navigation"
import { Footer } from "./footer"

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Don't show footer on auth pages
  if (pathname.startsWith('/auth/')) {
    return null
  }
  
  return <Footer />
}