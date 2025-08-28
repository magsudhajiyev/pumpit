export interface SocialAccount {
  platform: 'X' | 'REDDIT' | 'LINKEDIN' | 'PRODUCTHUNT'
  accountId: string
  username: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: Date
}

export interface PostVerificationResult {
  success: boolean
  verified: boolean
  postId?: string
  metrics?: {
    likes?: number
    shares?: number
    comments?: number
    views?: number
  }
  error?: string
}

export interface PlatformMetrics {
  platform: 'X' | 'REDDIT' | 'LINKEDIN' | 'PRODUCTHUNT'
  postId: string
  likes: number
  shares: number
  comments: number
  views?: number
  engagementRate?: number
  timestamp: Date
}

export interface VerificationConfig {
  mustContainTrackingLink: boolean
  mustBeMention?: boolean
  mustUseHashtags?: string[]
  minimumFollowers?: number
  allowedSubreddits?: string[]
  mustBePublic?: boolean
  mustBeSupportive?: boolean
}

export const VERIFICATION_RULES: Record<string, VerificationConfig> = {
  X: {
    mustContainTrackingLink: true,
    mustUseHashtags: ['#IndieHacker', '#SaaS'],
    minimumFollowers: 0
  },
  REDDIT: {
    mustContainTrackingLink: true,
    allowedSubreddits: ['r/SideProject', 'r/entrepreneur', 'r/SaaS'],
    mustBePublic: true
  },
  LINKEDIN: {
    mustContainTrackingLink: true,
    mustBePublic: true
  },
  PRODUCTHUNT: {
    mustContainTrackingLink: true,
    mustBeSupportive: true
  }
} 