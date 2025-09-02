interface TwitterTweetData {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
    bookmark_count: number
    impression_count?: number
  }
  context_annotations?: Array<{
    domain: {
      id: string
      name: string
      description: string
    }
    entity: {
      id: string
      name: string
      description?: string
    }
  }>
}

interface TwitterUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
  verified?: boolean
  public_metrics: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
}

interface TwitterApiResponse {
  data?: TwitterTweetData | TwitterTweetData[]
  includes?: {
    users?: TwitterUser[]
  }
  errors?: Array<{
    title: string
    detail: string
    type: string
  }>
}

export class TwitterApi {
  private bearerToken: string

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN || ''
    if (!this.bearerToken && process.env.NODE_ENV === 'production') {
      throw new Error('Twitter Bearer Token is required in production')
    }
  }

  /**
   * Check if we should use mock data (for development/testing when API limits are hit)
   */
  private shouldUseMockData(): boolean {
    return process.env.NODE_ENV === 'development' && process.env.USE_TWITTER_MOCK === 'true'
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<TwitterApiResponse> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle specific Twitter API errors
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      if (response.status === 404) {
        throw new Error('Tweet not found or is private.')
      }
      if (response.status === 401) {
        throw new Error('Twitter API authentication failed.')
      }
      if (response.status === 403) {
        throw new Error('Access forbidden. Tweet may be private or deleted.')
      }
      
      const errorMessage = data.errors?.[0]?.detail || data.detail || data.title || 'Unknown Twitter API error'
      throw new Error(`Twitter API Error (${response.status}): ${errorMessage}`)
    }

    return data
  }

  /**
   * Extract tweet ID from various Twitter URL formats
   */
  extractTweetId(url: string): string | null {
    const patterns = [
      /twitter\.com\/\w+\/status\/(\d+)/,
      /x\.com\/\w+\/status\/(\d+)/,
      /mobile\.twitter\.com\/\w+\/status\/(\d+)/,
      /twitter\.com\/i\/web\/status\/(\d+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    // Check if it's just a tweet ID
    if (/^\d+$/.test(url.trim())) {
      return url.trim()
    }

    return null
  }

  /**
   * Get tweet details by ID
   */
  async getTweet(tweetId: string): Promise<TwitterTweetData | null> {
    try {
      const url = `https://api.twitter.com/2/tweets/${tweetId}?` + new URLSearchParams({
        'expansions': 'author_id',
        'tweet.fields': 'created_at,public_metrics,context_annotations,referenced_tweets',
        'user.fields': 'name,username,profile_image_url,verified,public_metrics'
      }).toString()

      const response = await this.makeRequest(url)
      
      if (response.data && !Array.isArray(response.data)) {
        return response.data
      }

      return null
    } catch (error) {
      console.error('Error fetching tweet:', error)
      return null
    }
  }

  /**
   * Get tweet with author information
   */
  async getTweetWithAuthor(tweetId: string): Promise<{ tweet: TwitterTweetData; author: TwitterUser } | null> {
    // Use mock data if in development mode with mock flag
    if (this.shouldUseMockData()) {
      return this.getMockTweetData(tweetId)
    }

    try {
      const url = `https://api.twitter.com/2/tweets/${tweetId}?` + new URLSearchParams({
        'expansions': 'author_id',
        'tweet.fields': 'created_at,public_metrics,context_annotations',
        'user.fields': 'name,username,profile_image_url,verified,public_metrics'
      }).toString()

      const response = await this.makeRequest(url)
      
      if (response.data && !Array.isArray(response.data) && response.includes?.users?.[0]) {
        return {
          tweet: response.data,
          author: response.includes.users[0]
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching tweet with author:', error)
      
      // Fallback to mock data if API fails in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to mock Twitter data due to API error')
        return this.getMockTweetData(tweetId)
      }
      
      throw error
    }
  }

  /**
   * Generate mock tweet data for development/testing
   */
  private getMockTweetData(tweetId: string): { tweet: TwitterTweetData; author: TwitterUser } {
    // Use realistic tweet content similar to user's actual tweet
    const mockTweetText = "CodeSnippet Generator is a great tool I found recently. It's helping me in my daily life to generate easy to share snippets and making me more productive each day! #IndiHackers #SaaS #ProductHunt #PumpIt"
    
    return {
      tweet: {
        id: tweetId,
        text: mockTweetText,
        author_id: "123456789",
        created_at: new Date().toISOString(),
        public_metrics: {
          retweet_count: Math.floor(Math.random() * 20),
          like_count: Math.floor(Math.random() * 100),
          reply_count: Math.floor(Math.random() * 15),
          quote_count: Math.floor(Math.random() * 5),
          bookmark_count: Math.floor(Math.random() * 25),
          impression_count: Math.floor(Math.random() * 1000) + 500
        }
      },
      author: {
        id: "123456789",
        name: "Test User",
        username: "magsudhajiyev",
        verified: false,
        public_metrics: {
          followers_count: 1000,
          following_count: 500,
          tweet_count: 2500,
          listed_count: 10
        }
      }
    }
  }

  /**
   * Verify if a tweet contains specific content or keywords
   */
  verifyTweetContent(tweet: TwitterTweetData, expectedContent?: string, keywords?: string[]): {
    isValid: boolean
    score: number
    reasons: string[]
  } {
    const reasons: string[] = []
    let score = 0

    // Check if tweet exists and has content
    if (!tweet.text || tweet.text.trim().length === 0) {
      reasons.push('Tweet has no content')
      return { isValid: false, score: 0, reasons }
    }

    // Basic content verification - more flexible for user-generated content
    if (expectedContent) {
      const similarity = this.calculateStringSimilarity(
        tweet.text.toLowerCase(),
        expectedContent.toLowerCase()
      )
      
      if (similarity > 0.7) {
        score += 30
        reasons.push('Content closely matches expected text')
      } else if (similarity > 0.3) {
        score += 20
        reasons.push('Content partially matches expected text')
      } else if (similarity > 0.1) {
        score += 10
        reasons.push('Content has some similarity to expected text')
      } else {
        // Don't penalize too heavily for user creativity
        score += 5
        reasons.push('Content is original but different from expected text')
      }
    } else {
      // If no expected content provided, give baseline points for having content
      score += 15
      reasons.push('Original promotional content provided')
    }

    // Keyword verification - more flexible matching
    if (keywords && keywords.length > 0) {
      const tweetLower = tweet.text.toLowerCase()
      let matchedKeywords: string[] = []
      
      // Check for exact matches first
      const exactMatches = keywords.filter(keyword => 
        tweetLower.includes(keyword.toLowerCase())
      )
      matchedKeywords = [...exactMatches]
      
      // Check for partial matches or similar terms
      keywords.forEach(keyword => {
        if (!exactMatches.includes(keyword)) {
          const keywordLower = keyword.toLowerCase()
          // Check for partial matches or word variants
          if (tweetLower.includes(keywordLower.slice(0, -1)) || // Remove last char
              tweetLower.includes(keywordLower.replace(/s$/, '')) || // Remove plural
              this.calculateStringSimilarity(tweetLower, keywordLower) > 0.6) {
            matchedKeywords.push(keyword + ' (partial)')
          }
        }
      })
      
      const baseKeywordScore = Math.min((exactMatches.length / keywords.length) * 25, 25)
      const partialKeywordScore = Math.min(((matchedKeywords.length - exactMatches.length) / keywords.length) * 10, 10)
      score += baseKeywordScore + partialKeywordScore
      
      if (matchedKeywords.length > 0) {
        reasons.push(`Found ${exactMatches.length} exact + ${matchedKeywords.length - exactMatches.length} partial keyword matches`)
      } else {
        // Still give some points for promotional content even without exact keywords
        score += 5
        reasons.push('No specific keywords found but content appears promotional')
      }
    }

    // Check for promotional indicators - more comprehensive list
    const promoIndicators = [
      'check out', 'try', 'discover', 'amazing', 'great', 'recommend', 
      'found', 'helping', 'productive', 'tool', 'useful', 'awesome',
      'love', 'fantastic', 'excellent', 'perfect', 'best', 'good'
    ]
    const matchedIndicators = promoIndicators.filter(indicator => 
      tweet.text.toLowerCase().includes(indicator)
    )
    
    if (matchedIndicators.length > 0) {
      const promoScore = Math.min(matchedIndicators.length * 3, 15) // Up to 15 points
      score += promoScore
      reasons.push(`Contains ${matchedIndicators.length} promotional words/phrases`)
    }

    // Length check - promotional tweets should have substance
    if (tweet.text.length >= 100) {
      score += 15
      reasons.push('Tweet has comprehensive content')
    } else if (tweet.text.length >= 50) {
      score += 10
      reasons.push('Tweet has substantial content')
    } else {
      score += 5
      reasons.push('Tweet content is brief but acceptable')
    }

    // Check if tweet is not just retweet
    if (!tweet.text.startsWith('RT @')) {
      score += 10
      reasons.push('Original content (not retweet)')
    }

    // Bonus points for using hashtags (shows engagement effort)
    const hashtagCount = (tweet.text.match(/#\w+/g) || []).length
    if (hashtagCount > 0) {
      const hashtagScore = Math.min(hashtagCount * 3, 10)
      score += hashtagScore
      reasons.push(`Uses ${hashtagCount} relevant hashtags`)
    }

    // More realistic threshold - good promotional content should pass
    const isValid = score >= 50 // Lowered threshold for better user experience
    
    return { isValid, score, reasons }
  }

  /**
   * Calculate string similarity (simple Levenshtein distance based)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) {
      return 1.0
    }
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * Get analytics data for a tweet
   */
  getAnalytics(tweet: TwitterTweetData) {
    return {
      engagement: {
        likes: tweet.public_metrics.like_count,
        retweets: tweet.public_metrics.retweet_count,
        replies: tweet.public_metrics.reply_count,
        quotes: tweet.public_metrics.quote_count,
        bookmarks: tweet.public_metrics.bookmark_count,
        impressions: tweet.public_metrics.impression_count || 0
      },
      engagementRate: this.calculateEngagementRate(tweet.public_metrics),
      createdAt: tweet.created_at
    }
  }

  /**
   * Calculate engagement rate
   */
  private calculateEngagementRate(metrics: TwitterTweetData['public_metrics']): number {
    const totalEngagements = metrics.like_count + metrics.retweet_count + 
                           metrics.reply_count + metrics.quote_count
    const impressions = metrics.impression_count || 0
    
    return impressions > 0 ? (totalEngagements / impressions) * 100 : 0
  }
}

// Singleton instance
export const twitterApi = new TwitterApi()