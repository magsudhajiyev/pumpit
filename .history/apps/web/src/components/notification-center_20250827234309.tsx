'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from '@pumpit/realtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, X, Check, Zap, Users, BarChart3 } from 'lucide-react'

export function NotificationCenter() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  
  const user = session?.user ? {
    userId: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name || undefined
  } : null

  const {
    isConnected,
    notifications,
    markNotificationAsRead,
    clearNotifications
  } = useSocket(user)

  const unreadCount = notifications.filter(n => !n.data?.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROMOTION_VERIFIED':
        return <Check className="h-4 w-4 text-green-500" />
      case 'CREDITS_EARNED':
        return <Zap className="h-4 w-4 text-yellow-500" />
      case 'NEW_PRODUCT':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'ANALYTICS_UPDATE':
        return <BarChart3 className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'PROMOTION_VERIFIED':
        return 'bg-green-50 border-green-200'
      case 'CREDITS_EARNED':
        return 'bg-yellow-50 border-yellow-200'
      case 'NEW_PRODUCT':
        return 'bg-blue-50 border-blue-200'
      case 'ANALYTICS_UPDATE':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 z-50">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {isConnected && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {isConnected ? 'Real-time updates' : 'Connecting...'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification, index) => (
                      <div
                        key={index}
                        className={`p-3 border-l-4 ${getNotificationColor(notification.type)} hover:bg-gray-50 transition-colors`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.data?.id || index.toString())}
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 