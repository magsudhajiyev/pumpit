import { PostVerificationResult, PlatformMetrics } from './types'

export class ProductHuntIntegration {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async verifyComment(commentUrl: string, trackingLink: string): Promise<PostVerificationResult> {
    try {
      // Extract comment ID from URL
      const commentId = this.extractCommentId(commentUrl)
      if (!commentId) {
        return {
          success: false,
          verified: false,
          error: 'Invalid ProductHunt comment URL'
        }
      }

      // Get comment details using ProductHunt API
      const response = await fetch(`https://api.producthunt.com/v2/api/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetComment($id: ID!) {
              comment(id: $id) {
                id
                body
                user {
                  username
                }
                post {
                  name
                  tagline
                }
                votes {
                  totalCount
                }
              }
            }
          `,
          variables: { id: commentId }
        })
      })

      const data = await response.json()
      const comment = data.data?.comment

      if (!comment) {
        return {
          success: false,
          verified: false,
          error: 'Comment not found'
        }
      }

      // Check if comment contains tracking link
      const containsTrackingLink = comment.body.includes(trackingLink)

      // Basic sentiment analysis (check for supportive keywords)
      const supportiveKeywords = ['great', 'awesome', 'love', 'amazing', 'useful', 'helpful', 'recommend']
      const isSupportive = supportiveKeywords.some(keyword => 
        comment.body.toLowerCase().includes(keyword)
      )

      const verified = containsTrackingLink && isSupportive

      return {
        success: true,
        verified,
        postId: commentId,
        metrics: {
          likes: comment.votes?.totalCount || 0,
          shares: 0, // ProductHunt doesn't have shares
          comments: 0, // Comments don't have sub-comments
          views: 0
        }
      }
    } catch (error) {
      console.error('ProductHunt verification error:', error)
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getCommentMetrics(commentId: string): Promise<PlatformMetrics | null> {
    try {
      const response = await fetch(`https://api.producthunt.com/v2/api/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetComment($id: ID!) {
              comment(id: $id) {
                id
                votes {
                  totalCount
                }
                createdAt
              }
            }
          `,
          variables: { id: commentId }
        })
      })

      const data = await response.json()
      const comment = data.data?.comment

      if (!comment) return null

      return {
        platform: 'PRODUCTHUNT',
        postId: comment.id,
        likes: comment.votes?.totalCount || 0,
        shares: 0,
        comments: 0,
        views: 0,
        engagementRate: 0,
        timestamp: new Date(comment.createdAt)
      }
    } catch (error) {
      console.error('ProductHunt metrics error:', error)
      return null
    }
  }

  async findRelevantProducts(category: string): Promise<any[]> {
    try {
      const response = await fetch(`https://api.producthunt.com/v2/api/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetPosts($first: Int!, $after: String) {
              posts(first: $first, after: $after) {
                edges {
                  node {
                    id
                    name
                    tagline
                    url
                    thumbnail {
                      url
                    }
                    topics {
                      edges {
                        node {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { first: 20 }
        })
      })

      const data = await response.json()
      const posts = data.data?.posts?.edges || []

      // Filter by category if specified
      if (category) {
        return posts.filter((post: any) => {
          const topics = post.node.topics.edges.map((t: any) => t.node.name.toLowerCase())
          return topics.some((topic: string) => topic.includes(category.toLowerCase()))
        })
      }

      return posts
    } catch (error) {
      console.error('ProductHunt products error:', error)
      return []
    }
  }

  generateSupportComment(productName: string, description: string, trackingLink: string): string {
    return `This looks great! ${productName} seems like a really useful tool for ${description}.

I love how it solves real problems that many of us face. The interface looks clean and the features are exactly what I've been looking for.

Definitely going to check this out: ${trackingLink}

Thanks for building this! 🚀`
  }

  private extractCommentId(url: string): string | null {
    const match = url.match(/producthunt\.com\/posts\/[^\/]+\/comments\/(\d+)/)
    return match ? match[1] : null
  }
} 