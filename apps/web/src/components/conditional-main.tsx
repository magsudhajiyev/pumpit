'use client'

import { usePathname } from "next/navigation"

export function ConditionalMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Auth pages don't need navbar padding
  const isAuthPage = pathname.startsWith('/auth/')
  
  return (
    <main className={isAuthPage ? "flex-1" : "flex-1 pt-16"}>
      {children}
    </main>
  )
}