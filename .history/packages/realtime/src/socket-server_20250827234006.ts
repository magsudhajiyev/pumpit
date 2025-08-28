import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { SocketUser, WebSocketEvents, NotificationEvent, AnalyticsUpdate } from './types'

export class SocketServer {
  private io: SocketIOServer<WebSocketEvents>
  private userSockets: Map<string, string> = new Map() // userId -> socketId

  constructor(httpServer: HTTPServer, config?: any) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        credentials: true
      },
      ...config
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`)

      // Handle user joining
      socket.on('user:join', (user: SocketUser) => {
        this.userSockets.set(user.userId, socket.id)
        socket.join(`user:${user.userId}`)
        console.log(`User ${user.email} joined`)
      })

      // Handle user leaving
      socket.on('user:leave', (userId: string) => {
        this.userSockets.delete(userId)
        socket.leave(`user:${userId}`)
        console.log(`User ${userId} left`)
      })

      // Handle notification read
      socket.on('notification:mark-read', (notificationId: string) => {
        // This would typically update the database
        console.log(`Notification ${notificationId} marked as read`)
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        // Remove user from tracking
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId)
            break
          }
        }
        console.log(`User disconnected: ${socket.id}`)
      })
    })
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: NotificationEvent) {
    const socketId = this.userSockets.get(userId)
    if (socketId) {
      this.io.to(socketId).emit('notification:new', notification)
    }
  }

  // Send analytics update to specific user
  sendAnalyticsUpdate(userId: string, update: AnalyticsUpdate) {
    const socketId = this.userSockets.get(userId)
    if (socketId) {
      this.io.to(socketId).emit('analytics:update', update)
    }
  }

  // Send promotion verification to user
  sendPromotionVerified(userId: string, promotionId: string, creditsEarned: number) {
    const socketId = this.userSockets.get(userId)
    if (socketId) {
      this.io.to(socketId).emit('promotion:verified', { promotionId, creditsEarned })
    }
  }

  // Broadcast new product to all users
  broadcastNewProduct(product: any) {
    this.io.emit('product:new', product)
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size
  }

  // Get server instance
  getIO(): SocketIOServer<WebSocketEvents> {
    return this.io
  }
} 