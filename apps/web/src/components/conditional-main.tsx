'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Auth pages don't need navbar padding
  const isAuthPage = mounted && pathname.startsWith('/auth/')
  
  return (
    <main className={isAuthPage ? "flex-1" : "flex-1 pt-16"}>
      {children}
    </main>
  )
}