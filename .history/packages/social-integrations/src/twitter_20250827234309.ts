import { TwitterApi } from 'twitter-api-v2'
import { PostVerificationResult, PlatformMetrics } from './types'

export class TwitterIntegration {
  private client: TwitterApi

  constructor(bearerToken: string) {
    this.client = new TwitterApi(bearerToken)
  }

  async verifyPost(postUrl: string, trackingLink: string): Promise<PostVerificationResult> {
    try {
      // Extract tweet ID from URL
      const tweetId = this.extractTweetId(postUrl)
      if (!tweetId) {
        return {
          success: false,
          verified: false,
          error: 'Invalid tweet URL'
        }
      }

      // Get tweet details
      const tweet = await this.client.v2.singleTweet(tweetId, {
        'tweet.fields': ['public_metrics', 'created_at', 'text'],
        'user.fields': ['public_metrics']
      })

      if (!tweet.data) {
        return {
          success: false,
          verified: false,
          error: 'Tweet not found'
        }
      }

      // Check if tweet contains tracking link
      const containsTrackingLink = tweet.data.text.includes(trackingLink)
      
      // Check if tweet uses required hashtags
      const requiredHashtags = ['#IndieHacker', '#SaaS']
      const hasRequiredHashtags = requiredHashtags.some(hashtag => 
        tweet.data.text.toLowerCase().includes(hashtag.toLowerCase())
      )

      const verified = containsTrackingLink && hasRequiredHashtags

      return {
        success: true,
        verified,
        postId: tweetId,
        metrics: {
          likes: tweet.data.public_metrics?.like_count || 0,
          shares: tweet.data.public_metrics?.retweet_count || 0,
          comments: tweet.data.public_metrics?.reply_count || 0,
          views: tweet.data.public_metrics?.impression_count || 0
        }
      }
    } catch (error) {
      console.error('Twitter verification error:', error)
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getPostMetrics(postId: string): Promise<PlatformMetrics | null> {
    try {
      const tweet = await this.client.v2.singleTweet(postId, {
        'tweet.fields': ['public_metrics', 'created_at']
      })

      if (!tweet.data) return null

      const metrics = tweet.data.public_metrics
      const totalEngagement = (metrics?.like_count || 0) + 
                             (metrics?.retweet_count || 0) + 
                             (metrics?.reply_count || 0)

      return {
        platform: 'X',
        postId,
        likes: metrics?.like_count || 0,
        shares: metrics?.retweet_count || 0,
        comments: metrics?.reply_count || 0,
        views: metrics?.impression_count || 0,
        engagementRate: totalEngagement / (metrics?.impression_count || 1),
        timestamp: new Date(tweet.data.created_at!)
      }
    } catch (error) {
      console.error('Twitter metrics error:', error)
      return null
    }
  }

  generatePostTemplate(productName: string, description: string, trackingLink: string): string {
    return `🚀 Just discovered ${productName} - ${description}

This looks promising for indie hackers and SaaS founders!

${trackingLink}

#IndieHacker #SaaS #ProductHunt`
  }

  private extractTweetId(url: string): string | null {
    const match = url.match(/twitter\.com\/\w+\/status\/(\d+)/)
    return match ? match[1] : null
  }
} 