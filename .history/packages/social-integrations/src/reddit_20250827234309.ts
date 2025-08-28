import Snoowrap from 'snoowrap'
import { PostVerificationResult, PlatformMetrics } from './types'

export class RedditIntegration {
  private client: Snoowrap

  constructor(clientId: string, clientSecret: string, refreshToken: string) {
    this.client = new Snoowrap({
      userAgent: 'PumpIt/1.0.0',
      clientId,
      clientSecret,
      refreshToken
    })
  }

  async verifyPost(postUrl: string, trackingLink: string): Promise<PostVerificationResult> {
    try {
      // Extract post ID from URL
      const postId = this.extractPostId(postUrl)
      if (!postId) {
        return {
          success: false,
          verified: false,
          error: 'Invalid Reddit post URL'
        }
      }

      // Get post details
      const post = await this.client.getSubmission(postId).fetch()
      
      // Check if post contains tracking link
      const containsTrackingLink = post.selftext.includes(trackingLink) || 
                                  post.title.includes(trackingLink)

      // Check if subreddit is allowed
      const allowedSubreddits = ['SideProject', 'entrepreneur', 'SaaS']
      const isAllowedSubreddit = allowedSubreddits.some(subreddit => 
        post.subreddit.display_name.toLowerCase() === subreddit.toLowerCase()
      )

      // Check if account is not too new (basic spam prevention)
      const accountAge = Date.now() - post.author.created_utc * 1000
      const minimumAge = 7 * 24 * 60 * 60 * 1000 // 7 days
      const isAccountOldEnough = accountAge > minimumAge

      const verified = containsTrackingLink && isAllowedSubreddit && isAccountOldEnough

      return {
        success: true,
        verified,
        postId: post.id,
        metrics: {
          likes: post.score,
          shares: 0, // Reddit doesn't have shares
          comments: post.num_comments,
          views: 0 // Reddit doesn't provide view count
        }
      }
    } catch (error) {
      console.error('Reddit verification error:', error)
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getPostMetrics(postId: string): Promise<PlatformMetrics | null> {
    try {
      const post = await this.client.getSubmission(postId).fetch()
      
      return {
        platform: 'REDDIT',
        postId: post.id,
        likes: post.score,
        shares: 0,
        comments: post.num_comments,
        views: 0,
        engagementRate: post.num_comments / Math.max(post.score, 1),
        timestamp: new Date(post.created_utc * 1000)
      }
    } catch (error) {
      console.error('Reddit metrics error:', error)
      return null
    }
  }

  async suggestSubreddits(category: string): Promise<string[]> {
    const categoryMap: Record<string, string[]> = {
      'SAAS': ['SideProject', 'entrepreneur', 'SaaS', 'startups'],
      'NEWSLETTER': ['SideProject', 'entrepreneur', 'newsletters'],
      'TOOL': ['SideProject', 'entrepreneur', 'webdev', 'programming'],
      'OTHER': ['SideProject', 'entrepreneur', 'indiebiz']
    }

    return categoryMap[category] || ['SideProject', 'entrepreneur']
  }

  generatePostTemplate(productName: string, description: string, trackingLink: string, subreddit: string): string {
    const templates: Record<string, string> = {
      'SideProject': `I just launched ${productName} - ${description}

I've been working on this for a while and would love to get some feedback from the community.

Check it out: ${trackingLink}

What do you think? Any suggestions for improvement?`,
      
      'entrepreneur': `New SaaS tool: ${productName}

${description}

This could be really useful for entrepreneurs and small businesses.

${trackingLink}

Has anyone tried something similar?`,
      
      'SaaS': `SaaS Spotlight: ${productName}

${description}

This looks promising for SaaS founders and developers.

${trackingLink}

What's your take on this?`
    }

    return templates[subreddit] || templates['SideProject']
  }

  private extractPostId(url: string): string | null {
    const match = url.match(/reddit\.com\/r\/\w+\/comments\/(\w+)/)
    return match ? match[1] : null
  }
} 