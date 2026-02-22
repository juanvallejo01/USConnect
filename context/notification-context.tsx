"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Notification } from "@/types"

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addMatchNotification: (userId: number, matchedWithId: number, matchedWithName: string, matchedWithAvatar: string) => void
  markAsRead: (notificationId: number) => void
  markAllAsRead: () => void
  getUnreadNotifications: () => Notification[]
}

const NotificationContext = createContext<NotificationState | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addMatchNotification = useCallback(
    (userId: number, matchedWithId: number, matchedWithName: string, matchedWithAvatar: string) => {
      const newNotification: Notification = {
        id: Date.now(),
        userId,
        type: "match",
        matchedWithId,
        matchedWithName,
        matchedWithAvatar,
        read: false,
        createdAt: new Date().toISOString(),
      }
      setNotifications((prev) => [newNotification, ...prev])
    },
    []
  )

  const markAsRead = useCallback((notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }, [])

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((notif) => !notif.read)
  }, [notifications])

  const unreadCount = notifications.filter((notif) => !notif.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addMatchNotification,
        markAsRead,
        markAllAsRead,
        getUnreadNotifications,
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
