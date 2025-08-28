export interface SocketUser {
  userId: string
  email: string
  name?: string
}

export interface NotificationEvent {
  type: 'NEW_PRODUCT' | 'PROMOTION_VERIFIED' | 'CREDITS_EARNED' | 'ANALYTICS_UPDATE'
  userId: string
  title: string
  content: string
  data?: any
  timestamp: Date
}

export interface AnalyticsUpdate {
  type: 'CLICK_INCREMENT' | 'PROMOTION_UPDATE' | 'CREDITS_UPDATE'
  userId: string
  data: {
    promotionId?: string
    productId?: string
    clicks?: number
    credits?: number
    timestamp: Date
  }
}

export interface WebSocketEvents {
  // Client to Server
  'user:join': (user: SocketUser) => void
  'user:leave': (userId: string) => void
  'notification:mark-read': (notificationId: string) => void
  
  // Server to Client
  'notification:new': (notification: NotificationEvent) => void
  'analytics:update': (update: AnalyticsUpdate) => void
  'promotion:verified': (data: { promotionId: string; creditsEarned: number }) => void
  'product:new': (product: any) => void
}

export interface RedisConfig {
  host: string
  port: number
  password?: string
  db?: number
}

export interface SocketConfig {
  cors: {
    origin: string | string[]
    credentials: boolean
  }
  redis?: RedisConfig
} 