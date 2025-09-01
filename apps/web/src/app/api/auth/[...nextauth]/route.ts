import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth/config"

// Ensure NEXTAUTH_URL is set for monorepo deployment
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
}

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }