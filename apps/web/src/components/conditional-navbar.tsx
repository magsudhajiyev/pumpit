'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "./navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't show navbar on auth pages
  if (!mounted || pathname.startsWith('/auth/')) {
    return null
  }
  
  return <Navbar />
}