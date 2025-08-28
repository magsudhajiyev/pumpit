import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { WebSocketEvents, SocketUser, NotificationEvent, AnalyticsUpdate } from './types'

export function useSocket(user: SocketUser | null) {
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<NotificationEvent[]>([])
  const [analyticsUpdates, setAnalyticsUpdates] = useState<AnalyticsUpdate[]>([])
  const socketRef = useRef<Socket<WebSocketEvents> | null>(null)

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setIsConnected(false)
      return
    }

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      withCredentials: true
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      
      // Join user room
      socket.emit('user:join', user)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
    })

    // Notification events
    socket.on('notification:new', (notification: NotificationEvent) => {
      setNotifications(prev => [notification, ...prev])
    })

    // Analytics events
    socket.on('analytics:update', (update: AnalyticsUpdate) => {
      setAnalyticsUpdates(prev => [update, ...prev])
    })

    // Promotion verification events
    socket.on('promotion:verified', (data) => {
      console.log('Promotion verified:', data)
      // Handle promotion verification (e.g., show toast, update UI)
    })

    // New product events
    socket.on('product:new', (product) => {
      console.log('New product available:', product)
      // Handle new product (e.g., show notification, update product list)
    })

    return () => {
      if (socket) {
        socket.emit('user:leave', user.userId)
        socket.disconnect()
      }
    }
  }, [user])

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('notification:mark-read', notificationId)
    }
  }

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([])
  }

  // Clear analytics updates
  const clearAnalyticsUpdates = () => {
    setAnalyticsUpdates([])
  }

  return {
    isConnected,
    notifications,
    analyticsUpdates,
    markNotificationAsRead,
    clearNotifications,
    clearAnalyticsUpdates
  }
} 