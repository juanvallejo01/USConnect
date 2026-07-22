"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { notificationsApi } from "@/lib/api-client"
import { useAuth } from "./auth-context"
import type { Notification } from "@/types"

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  refresh: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationState | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isLoggedIn) return
    setLoading(true)
    try {
      const [list, unread] = await Promise.all([
        notificationsApi.getNotifications(),
        notificationsApi.getUnreadCount(),
      ])
      setNotifications(list)
      setUnreadCount(unread.count)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      refresh()
      // Light polling so likes/matches from other users show up without a manual refresh
      const interval = setInterval(refresh, 15000)
      return () => clearInterval(interval)
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isLoggedIn, refresh])

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
    try {
      await notificationsApi.markAsRead(notificationId)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await notificationsApi.markAllRead()
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refresh,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider")
  return ctx
}
