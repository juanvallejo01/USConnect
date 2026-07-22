"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useNotification } from "@/context/notification-context"
import { useChat } from "@/context/chat-context"
import { useMatch } from "@/context/match-context"
import { GradientHeader } from "@/components/layout/gradient-header"
import { UserAvatar } from "@/components/layout/user-avatar"
import { LikeReviewModal } from "@/components/explore/like-review-modal"
import { formatRelativeTime } from "@/utils/relative-time"
import { Bell, MessageCircle, Heart } from "lucide-react"
import type { Notification } from "@/types"

export function NotificationsPage() {
  const t = useTranslations("notificationsPage")
  const tTime = useTranslations("time")
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotification()
  const { openChat } = useChat()
  const { likeUser } = useMatch()
  const [reviewing, setReviewing] = useState<Notification | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [justMatchedWith, setJustMatchedWith] = useState<string | null>(null)

  const handleStartChat = (notification: Notification) => {
    if (!notification.fromUser) return
    markAsRead(notification.id)
    openChat({
      id: notification.fromUser.id,
      name: notification.fromUser.name,
      major: notification.fromUser.major,
    })
  }

  const handleLikeBack = async () => {
    if (!reviewing?.fromUser) return
    setSubmitting(true)
    const result = await likeUser(reviewing.fromUser.id)
    setSubmitting(false)
    markAsRead(reviewing.id)
    if (result.success && result.matched) {
      setJustMatchedWith(reviewing.fromUser.name)
    }
    setReviewing(null)
  }

  const handleReject = () => {
    if (!reviewing) return
    markAsRead(reviewing.id)
    setReviewing(null)
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F8FA]">
      <GradientHeader
        title={t("title")}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Header actions */}
        {unreadCount > 0 && (
          <div className="p-4 flex justify-end">
            <button
              onClick={markAllAsRead}
              className="text-sm text-[#000000] hover:text-[#000000]/80 font-medium transition-colors"
            >
              {t("markAllAsRead")}
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="px-4 pb-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#F2F2F7] rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-[#C7C7CC]" />
              </div>
              <p className="text-[#8E8E93] text-sm">{t("noNotificationsYet")}</p>
              <p className="text-[#C7C7CC] text-xs mt-1">
                {t("hint")}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-3xl p-5 cloud-shadow border border-[#EBEBF0] transition-all duration-300 ${
                  !notification.read
                    ? "ring-2 ring-[#000000]/30 bg-[#000000]/5"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <UserAvatar alt={notification.fromUser?.name ?? "?"} size="lg" />
                    {!notification.read && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#000000] rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-[#1A1A2E]">
                        {notification.type === "MATCH"
                          ? t("matchedWith", { name: notification.fromUser?.name ?? t("someone") })
                          : <><span className="font-bold">{notification.fromUser?.name ?? t("someone")}</span> {t("likedYourProfile")}</>
                        }
                      </h3>
                      <span className="text-xs text-[#C7C7CC] whitespace-nowrap">
                        {formatRelativeTime(notification.createdAt, tTime)}
                      </span>
                    </div>

                    <p className="text-sm text-[#8E8E93] mb-3">
                      {notification.type === "MATCH" ? t("matchSubtitle") : t("likeSubtitle")}
                    </p>

                    {/* Action button */}
                    {notification.type === "MATCH" ? (
                      <button
                        onClick={() => handleStartChat(notification)}
                        disabled={!notification.fromUser}
                        className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 cloud-shadow-blue transition-all duration-300 active:scale-95 disabled:opacity-50"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t("startChat")}
                      </button>
                    ) : (
                      <button
                        onClick={() => { markAsRead(notification.id); setReviewing(notification) }}
                        disabled={!notification.fromUser}
                        className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 cloud-shadow-blue transition-all duration-300 active:scale-95 disabled:opacity-50"
                      >
                        <Heart className="w-4 h-4" fill="currentColor" />
                        {t("reviewProfile")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review a received like */}
      {reviewing?.fromUser && (
        <LikeReviewModal
          user={reviewing.fromUser}
          isSubmitting={submitting}
          onLikeBack={handleLikeBack}
          onReject={handleReject}
          onClose={() => setReviewing(null)}
        />
      )}

      {/* Instant match celebration when liking back results in a match */}
      {justMatchedWith && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-5"
          onClick={() => setJustMatchedWith(null)}
        >
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t("itsAMatch")}</h2>
            <p className="text-white/90 mb-6">{t("likedEachOther", { name: justMatchedWith })}</p>
            <button
              onClick={() => setJustMatchedWith(null)}
              className="py-3 px-6 rounded-2xl bg-white text-black font-semibold cloud-shadow-blue transition-all active:scale-95"
            >
              {t("nice")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
