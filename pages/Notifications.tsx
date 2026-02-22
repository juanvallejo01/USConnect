"use client"

import { useNotification } from "@/context/notification-context"
import { useChat } from "@/context/chat-context"
import { GradientHeader } from "@/components/layout/gradient-header"
import { Bell, MessageCircle } from "lucide-react"

export function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotification()
  const { openChat } = useChat()

  const handleStartChat = (matchedWithId: number, notificationId: number) => {
    markAsRead(notificationId)
    openChat({ 
      id: matchedWithId, 
      name: "", 
      avatar: "", 
      major: ""
    })
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <GradientHeader 
        title="Notifications"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Header actions */}
        {unreadCount > 0 && (
          <div className="p-4 flex justify-end">
            <button
              onClick={markAllAsRead}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="px-4 pb-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No notifications yet</p>
              <p className="text-gray-400 text-xs mt-1">
                You'll be notified when you get a match
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-3xl p-5 shadow-sm border border-gray-100 transition-all duration-300 ${
                  !notification.read 
                    ? "ring-2 ring-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50" 
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={notification.matchedWithAvatar}
                      alt={notification.matchedWithName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {!notification.read && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        You matched with {notification.matchedWithName} 🎉
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {getRelativeTime(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      Start a conversation and get to know each other!
                    </p>

                    {/* Action button */}
                    <button
                      onClick={() => handleStartChat(notification.matchedWithId, notification.id)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 px-4 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
