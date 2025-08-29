import axios from 'axios'
import { PostVerificationResult, PlatformMetrics } from './types'

export class LinkedInIntegration {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async verifyPost(postUrl: string, trackingLink: string): Promise<PostVerificationResult> {
    try {
      // Extract post ID from URL
      const postId = this.extractPostId(postUrl)
      if (!postId) {
        return {
          success: false,
          verified: false,
          error: 'Invalid LinkedIn post URL'
        }
      }

      // Get post details using LinkedIn API
      const response = await axios.get(`https://api.linkedin.com/v2/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })

      const post = response.data
      
      // Check if post contains tracking link
      const containsTrackingLink = post.specificContent?.['com.linkedin.ugc.ShareContent']?.text?.includes(trackingLink)

      // Check if post is public
      const isPublic = post.visibility?.['com.linkedin.ugc.MemberNetworkVisibility'] === 'PUBLIC'

      const verified = containsTrackingLink && isPublic

      return {
        success: true,
        verified,
        postId,
        metrics: {
          likes: post.totalShareStatistics?.totalShareStatistics?.likes || 0,
          shares: post.totalShareStatistics?.totalShareStatistics?.shares || 0,
          comments: post.totalShareStatistics?.totalShareStatistics?.comments || 0,
          views: 0 // LinkedIn doesn't provide view count in basic API
        }
      }
    } catch (error) {
      console.error('LinkedIn verification error:', error)
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getPostMetrics(postId: string): Promise<PlatformMetrics | null> {
    try {
      const response = await axios.get(`https://api.linkedin.com/v2/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })

      const post = response.data
      const stats = post.totalShareStatistics?.totalShareStatistics
      const totalEngagement = (stats?.likes || 0) + (stats?.shares || 0) + (stats?.comments || 0)

      return {
        platform: 'LINKEDIN',
        postId,
        likes: stats?.likes || 0,
        shares: stats?.shares || 0,
        comments: stats?.comments || 0,
        views: 0,
        engagementRate: totalEngagement / Math.max(stats?.likes || 1, 1),
        timestamp: new Date(post.created?.time || Date.now())
      }
    } catch (error) {
      console.error('LinkedIn metrics error:', error)
      return null
    }
  }

  generateBusinessPost(productName: string, description: string, trackingLink: string): string {
    return `🚀 Excited to share a valuable tool I discovered: ${productName}

${description}

This could be a game-changer for businesses looking to streamline their operations and boost productivity.

Key benefits:
• Professional-grade solution
• Easy integration
• Cost-effective pricing

Check it out: ${trackingLink}

#BusinessTools #Productivity #Innovation #SaaS`
  }

  private extractPostId(url: string): string | null {
    const match = url.match(/linkedin\.com\/posts\/[^\/]+-(\d+)/)
    return match ? match[1] : null
  }
} 