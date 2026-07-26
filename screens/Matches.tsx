"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Heart } from "lucide-react"
import { useTranslations } from "next-intl"
import { useChat } from "@/context/chat-context"
import { useMatch } from "@/context/match-context"
import { useNotification } from "@/context/notification-context"
import { GradientHeader } from "@/components/layout/gradient-header"
import { UserAvatar } from "@/components/layout/user-avatar"
import { ProfileAvatarImage, useThemedAvatarSrc } from "@/components/layout/profile-avatar-image"
import { LikeReviewModal } from "@/components/explore/like-review-modal"
import { messagesApi } from "@/lib/api-client"
import { formatRelativeTime } from "@/utils/relative-time"
import type { Notification } from "@/types"

interface ConversationEntry {
  matchId: string
  matchedUser: { id: string; name: string; major: string; likesCount: number; photoUrl?: string | null }
  lastMessage: { content: string; createdAt: string; senderId: string } | null
  matchedAt: string
}

function ConversationRow({ entry, onOpen }: { entry: ConversationEntry; onOpen: () => void }) {
  const t = useTranslations("matches")
  const tTime = useTranslations("time")
  const avatarSrc = useThemedAvatarSrc(entry.matchedUser.photoUrl)

  return (
    <button
      onClick={onOpen}
      className="w-full bg-white rounded-3xl p-4 border border-[#EBEBF0] hover:border-[#000000] hover:cloud-shadow-md transition-all duration-300 active:scale-98"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <UserAvatar src={avatarSrc} alt={entry.matchedUser.name} size="lg" gradientRing />

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[#1A1A2E] truncate">
              {entry.matchedUser.name}
            </h3>
            <span className="text-xs text-[#C7C7CC] whitespace-nowrap">
              {formatRelativeTime(entry.lastMessage?.createdAt ?? entry.matchedAt, tTime)}
            </span>
          </div>

          <p className="text-xs text-[#8E8E93] mb-1.5">{entry.matchedUser.major}</p>

          {entry.lastMessage ? (
            <p className="text-sm truncate text-[#8E8E93]">
              {entry.lastMessage.content}
            </p>
          ) : (
            <div className="flex items-center gap-1.5 text-[#000000]">
              <MessageCircle size={14} />
              <span className="text-sm font-medium">{t("startChatting")}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function PendingLikeCircle({ notification, onOpen }: { notification: Notification; onOpen: () => void }) {
  if (!notification.fromUser) return null
  return (
    <button onClick={onOpen} className="flex flex-col items-center gap-1.5 w-[68px] flex-shrink-0 active:scale-95 transition-transform">
      <div className="rounded-full p-[2.5px] bg-gradient-to-br from-[#FF4458] to-[#FF9F0A]">
        <div className="rounded-full border-2 border-white dark:border-[#0A0A0C] overflow-hidden">
          <ProfileAvatarImage photoUrl={notification.fromUser.photoUrl} name={notification.fromUser.name} size={60} />
        </div>
      </div>
      <span className="text-xs font-medium text-[#1A1A2E] dark:text-white truncate max-w-full">
        {notification.fromUser.name.split(" ")[0]}
      </span>
    </button>
  )
}

export function MatchesPage() {
  const t = useTranslations("matches")
  const { openChat } = useChat()
  const { likeUser, isMatched } = useMatch()
  const { notifications, markAsRead, refresh: refreshNotifications } = useNotification()
  const [conversations, setConversations] = useState<ConversationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<Notification | null>(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [justMatchedWith, setJustMatchedWith] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await messagesApi.getConversations()
        if (!cancelled) setConversations(data)
      } catch (error) {
        console.error("Failed to load conversations:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const pendingLikes = notifications.filter(
    (n) => n.type === "LIKE_RECEIVED" && !n.read && n.fromUser && !isMatched(n.fromUser.id)
  )

  const handleOpenChat = (entry: ConversationEntry) => {
    openChat({
      id: entry.matchedUser.id,
      name: entry.matchedUser.name,
      major: entry.matchedUser.major,
      photoUrl: entry.matchedUser.photoUrl,
    })
  }

  const handleLikeBack = async () => {
    if (!reviewing?.fromUser) return
    setReviewSubmitting(true)
    const result = await likeUser(reviewing.fromUser.id)
    setReviewSubmitting(false)
    markAsRead(reviewing.id)
    const name = reviewing.fromUser.name
    setReviewing(null)
    if (result.success && result.matched) {
      setJustMatchedWith(name)
      const data = await messagesApi.getConversations()
      setConversations(data)
    }
  }

  const handleRejectReview = () => {
    if (!reviewing) return
    markAsRead(reviewing.id)
    setReviewing(null)
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F8FA]">
      <GradientHeader
        title={t("title")}
        subtitle={loading ? t("loading") : t("matchCount", { count: conversations.length })}
      />

      <div className="flex-1 overflow-y-auto">
        {pendingLikes.length > 0 && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">
              {t("newLikes")}
            </p>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
              {pendingLikes.map((n) => (
                <PendingLikeCircle key={n.id} notification={n} onOpen={() => setReviewing(n)} />
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#000000] border-t-transparent" />
          </div>
        ) : conversations.length === 0 && pendingLikes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="rounded-full bg-[#000000]/20 p-6 mb-4">
              <Heart size={48} className="text-[#000000]" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{t("noMatchesYet")}</h3>
            <p className="text-sm text-[#8E8E93] text-center max-w-[280px]">
              {t("startExploring")}
            </p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            {conversations.map((entry) => (
              <ConversationRow key={entry.matchId} entry={entry} onOpen={() => handleOpenChat(entry)} />
            ))}
          </div>
        )}
      </div>

      {/* Review an incoming like — full "Discover" style photo card */}
      {reviewing?.fromUser && (
        <LikeReviewModal
          user={reviewing.fromUser}
          isSubmitting={reviewSubmitting}
          onLikeBack={handleLikeBack}
          onReject={handleRejectReview}
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
