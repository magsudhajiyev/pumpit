import { NotificationEvent, AnalyticsUpdate } from './types'

export class NotificationService {
  private static instance: NotificationService
  private socketServer: any

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  setSocketServer(socketServer: any) {
    this.socketServer = socketServer
  }

  // Send promotion verification notification
  sendPromotionVerified(userId: string, productName: string, promoterName: string, platform: string) {
    const notification: NotificationEvent = {
      type: 'PROMOTION_VERIFIED',
      userId,
      title: 'New Promotion Verified!',
      content: `Your product "${productName}" was promoted on ${platform} by ${promoterName}`,
      data: {
        productName,
        promoterName,
        platform,
        timestamp: new Date()
      },
      timestamp: new Date()
    }

    if (this.socketServer) {
      this.socketServer.sendNotification(userId, notification)
    }
  }

  // Send credits earned notification
  sendCreditsEarned(userId: string, creditsEarned: number, source: string) {
    const notification: NotificationEvent = {
      type: 'CREDITS_EARNED',
      userId,
      title: 'Credits Earned!',
      content: `You earned ${creditsEarned} credits for ${source}`,
      data: {
        creditsEarned,
        source,
        timestamp: new Date()
      },
      timestamp: new Date()
    }

    if (this.socketServer) {
      this.socketServer.sendNotification(userId, notification)
    }
  }

  // Send new product notification
  sendNewProduct(userId: string, productName: string, category: string) {
    const notification: NotificationEvent = {
      type: 'NEW_PRODUCT',
      userId,
      title: 'New Product Available!',
      content: `A new ${category.toLowerCase()} product "${productName}" is available for promotion`,
      data: {
        productName,
        category,
        timestamp: new Date()
      },
      timestamp: new Date()
    }

    if (this.socketServer) {
      this.socketServer.sendNotification(userId, notification)
    }
  }

  // Send analytics update
  sendAnalyticsUpdate(userId: string, type: 'CLICK_INCREMENT' | 'PROMOTION_UPDATE' | 'CREDITS_UPDATE', data: any) {
    const update: AnalyticsUpdate = {
      type,
      userId,
      data: {
        ...data,
        timestamp: new Date()
      }
    }

    if (this.socketServer) {
      this.socketServer.sendAnalyticsUpdate(userId, update)
    }
  }

  // Send click increment update
  sendClickIncrement(userId: string, promotionId: string, clicks: number) {
    this.sendAnalyticsUpdate(userId, 'CLICK_INCREMENT', {
      promotionId,
      clicks
    })
  }

  // Send promotion update
  sendPromotionUpdate(userId: string, promotionId: string, status: string) {
    this.sendAnalyticsUpdate(userId, 'PROMOTION_UPDATE', {
      promotionId,
      status
    })
  }

  // Send credits update
  sendCreditsUpdate(userId: string, credits: number) {
    this.sendAnalyticsUpdate(userId, 'CREDITS_UPDATE', {
      credits
    })
  }
} 