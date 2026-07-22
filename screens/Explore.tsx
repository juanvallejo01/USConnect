"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Heart, RotateCcw, Sparkles, MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { SwipeCard } from "@/components/explore/swipe-card"
import { LikeReviewModal } from "@/components/explore/like-review-modal"
import { UserAvatar } from "@/components/layout/user-avatar"
import { useMatch } from "@/context/match-context"
import { useChat } from "@/context/chat-context"
import { useNotification } from "@/context/notification-context"
import { useAuth } from "@/context/auth-context"
import { usersApi } from "@/lib/api-client"
import { formatRelativeTime } from "@/utils/relative-time"
import type { Notification } from "@/types"

interface ExploreUser {
  id: string
  name: string
  major: string
  likesCount: number
}

export function ExplorePage() {
  const t = useTranslations("explore")
  const tTime = useTranslations("time")
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<ExploreUser[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<ExploreUser | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isClosingNotifications, setIsClosingNotifications] = useState(false)
  const [reviewing, setReviewing] = useState<Notification | null>(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const { likeUser, hasLiked, isMatched } = useMatch()
  const { openChat } = useChat()
  const { notifications, markAsRead, markAllAsRead, unreadCount, refresh: refreshNotifications } = useNotification()

  const loadProfiles = useCallback(async () => {
    setLoadingProfiles(true)
    try {
      const data = await usersApi.getRandomUsers(20)
      setProfiles(data)
      setCurrentIndex(0)
    } catch (error) {
      console.error("Failed to load explore profiles:", error)
      setProfiles([])
    } finally {
      setLoadingProfiles(false)
    }
  }, [])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const profile = profiles[currentIndex]
  const alreadyLiked = profile ? hasLiked(profile.id) : false
  const matched = profile ? isMatched(profile.id) : false

  function handleSwipe(direction: "left" | "right") {
    if (!profile) return
    setSwipeDirection(direction)

    if (direction === "right" && !alreadyLiked) {
      likeUser(profile.id).then((result) => {
        if (result.success && result.matched) {
          setMatchedProfile(profile)
          setShowMatchModal(true)
        }
        refreshNotifications()
      })
    }

    setTimeout(() => {
      setSwipeDirection(null)
      setCurrentIndex((prev) => prev + 1)
      setCanUndo(true)
    }, 300)
  }

  function handleUndo() {
    if (currentIndex > 0 && canUndo) {
      setCurrentIndex((prev) => prev - 1)
      setCanUndo(false)
    }
  }

  function handleOpenChat() {
    if (matchedProfile) {
      openChat({ id: matchedProfile.id, name: matchedProfile.name, major: matchedProfile.major })
    }
  }

  const handleCloseNotifications = () => {
    setIsClosingNotifications(true)
    setTimeout(() => {
      setShowNotifications(false)
      setIsClosingNotifications(false)
    }, 300)
  }

  const handleStartChatFromNotification = (notification: Notification) => {
    if (!notification.fromUser) return
    markAsRead(notification.id)
    handleCloseNotifications()
    setTimeout(() => {
      openChat({ id: notification.fromUser!.id, name: notification.fromUser!.name, major: notification.fromUser!.major })
    }, 300)
  }

  const handleLikeBack = async () => {
    if (!reviewing?.fromUser) return
    setReviewSubmitting(true)
    const result = await likeUser(reviewing.fromUser.id)
    setReviewSubmitting(false)
    markAsRead(reviewing.id)
    setReviewing(null)
    if (result.success && result.matched) {
      setMatchedProfile({ id: reviewing.fromUser.id, name: reviewing.fromUser.name, major: reviewing.fromUser.major, likesCount: 0 })
      setShowMatchModal(true)
    }
  }

  const handleRejectReview = () => {
    if (!reviewing) return
    markAsRead(reviewing.id)
    setReviewing(null)
  }

  const outOfProfiles = !loadingProfiles && (!profile || currentIndex >= profiles.length)

  return (
    <div className="flex flex-col h-full bg-black relative">

      {/* ── CARD AREA (flex-1) ── */}
      <div className="flex-1 relative overflow-hidden">

        {loadingProfiles ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#000000] border-t-transparent" />
          </div>
        ) : outOfProfiles ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div className="rounded-full bg-[#000000]/15 p-6 mb-4">
              <Sparkles size={40} className="text-[#000000]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t("allCaughtUpTitle")}</h3>
            <p className="text-sm text-white/60 mb-6">{t("allCaughtUpSubtitle")}</p>
            <button
              onClick={loadProfiles}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm active:scale-95 transition-all"
            >
              {t("refresh")}
            </button>
          </div>
        ) : (
          /* Card with swipe-exit animation */
          <div
            className="absolute inset-0"
            style={{
              transform: swipeDirection
                ? `translateX(${swipeDirection === "left" ? -520 : 520}px) rotate(${swipeDirection === "left" ? -18 : 18}deg)`
                : "none",
              opacity: swipeDirection ? 0 : 1,
              transition: swipeDirection ? "transform 280ms ease-out, opacity 200ms" : "none",
            }}
          >
            <SwipeCard
              key={`${profile.id}-${currentIndex}`}
              profile={profile}
              onSwipe={handleSwipe}
            />
          </div>
        )}

        {/* ── TOP BAR OVERLAY ── */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3.5 pointer-events-none">
          {/* Logo */}
          <span className="text-[17px] font-bold text-white drop-shadow-sm tracking-tight pointer-events-auto">
            {t("title")}
          </span>

          {/* Notification bell */}
          <button
            className="relative pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-all active:scale-90"
            onClick={() => showNotifications ? handleCloseNotifications() : setShowNotifications(true)}
          >
            <Sparkles size={18} className="text-white" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 h-[18px] min-w-[18px] bg-[#000000] rounded-full flex items-center justify-center px-1">
                <span className="text-[9px] font-bold text-white leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Match banner */}
        {matched && !swipeDirection && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center">
            <div className="rounded-full bg-[#000000] px-5 py-2 cloud-shadow-blue">
              <p className="text-sm font-bold text-white">{t("matchBanner")}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTION BUTTONS ROW ── */}
      <div className="bg-[#F8F8FA] dark:bg-[#141416] flex items-center justify-center gap-8 px-8 py-5 border-t border-[#EBEBF0] dark:border-[#262622] cloud-shadow">

        {/* Undo — small, tertiary */}
        <button
          onClick={handleUndo}
          disabled={currentIndex === 0 || !canUndo}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-[28px] bg-white dark:bg-[#1C1C1E] transition-all active:scale-90 disabled:opacity-30"
          style={{ boxShadow: "0 2px 16px rgba(245,167,66,0.2)" }}
        >
          <RotateCcw size={22} className="text-[#F5A742]" strokeWidth={2.2} />
        </button>

        {/* Nope — primary action */}
        <button
          onClick={() => handleSwipe("left")}
          disabled={outOfProfiles || loadingProfiles}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-[28px] bg-white dark:bg-[#1C1C1E] transition-all active:scale-90 disabled:opacity-30"
          style={{ boxShadow: "0 2px 16px rgba(255,68,88,0.2)" }}
        >
          <X size={28} className="text-[#FF4458]" strokeWidth={2.8} />
        </button>

        {/* Like — hero action, biggest */}
        <button
          onClick={() => handleSwipe("right")}
          disabled={alreadyLiked || outOfProfiles || loadingProfiles}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-[28px] bg-white dark:bg-[#1C1C1E] transition-all active:scale-90 disabled:opacity-35"
          style={{ boxShadow: "0 4px 20px rgba(76,217,100,0.25)" }}
        >
          <Heart size={32} className="text-[#4CD964]" fill="#4CD964" />
        </button>
      </div>

      {/* ── NOTIFICATIONS PANEL ── */}
      {showNotifications && (
        <div className={`absolute inset-0 bg-[#F8F8FA] dark:bg-[#0A0A0C] z-40 overflow-hidden ${isClosingNotifications ? "animate-slideOut" : "animate-slideDown"}`}>
          <div className="h-full overflow-y-auto">
            <div className="p-5 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1A1A2E] dark:text-white">{t("notifications")}</h2>
                <button onClick={handleCloseNotifications} className="p-1 text-[#8E8E93]">
                  <X size={24} />
                </button>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#EBEBF0]">
                  <p className="text-sm text-[#8E8E93]">{t("unreadCount", { count: unreadCount })}</p>
                  <button onClick={markAllAsRead} className="text-sm font-medium text-[#000000]">
                    {t("markAllAsRead")}
                  </button>
                </div>
              )}
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#EBEBF0] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles size={32} className="text-[#C7C7CC]" />
                    </div>
                    <p className="text-[#8E8E93] text-sm">{t("noNotificationsYet")}</p>
                    <p className="text-[#C7C7CC] text-xs mt-1">{t("notificationsHint")}</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-2xl border ${notification.read ? "bg-white dark:bg-[#141416] border-[#EBEBF0] dark:border-[#262622]" : "bg-[#000000]/5 dark:bg-[#000000]/10 border-[#000000]/20"}`}
                    >
                      <div className="flex items-start gap-3">
                        <UserAvatar alt={notification.fromUser?.name ?? "?"} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#1A1A2E] dark:text-[#E0E0F0]">
                            <span className="font-bold">{notification.fromUser?.name ?? t("someone")}</span>{" "}
                            {notification.type === "MATCH" ? t("matchedWithYou") : t("likedYourProfile")}
                          </p>
                          <p className="text-xs text-[#8E8E93] mt-1">{formatRelativeTime(notification.createdAt, tTime)}</p>
                          {notification.type === "MATCH" ? (
                            <button
                              onClick={() => handleStartChatFromNotification(notification)}
                              className="mt-2 text-xs font-medium text-[#000000] flex items-center gap-1"
                            >
                              <MessageCircle size={14} /> {t("sendMessage")}
                            </button>
                          ) : (
                            <button
                              onClick={() => { markAsRead(notification.id); setReviewing(notification) }}
                              className="mt-2 text-xs font-medium text-[#000000] flex items-center gap-1"
                            >
                              <Heart size={14} fill="currentColor" /> {t("reviewProfile")}
                            </button>
                          )}
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#000000] flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review a received like */}
      {reviewing?.fromUser && (
        <LikeReviewModal
          user={reviewing.fromUser}
          isSubmitting={reviewSubmitting}
          onLikeBack={handleLikeBack}
          onReject={handleRejectReview}
          onClose={() => setReviewing(null)}
        />
      )}

      {/* ── MATCH MODAL ── */}
      {showMatchModal && matchedProfile && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative mx-5 w-full max-w-sm bg-white dark:bg-[#141416] rounded-[32px] p-8 cloud-shadow-lg">
            <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: "-10%",
                    backgroundColor: ["#000000", "#171717", "#F59E0B", "#10B981"][Math.floor(Math.random() * 4)],
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${2 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-2xl font-bold text-[#000000] mb-2">
                {t("itsAMatch")}
              </h2>
              <p className="text-[#8E8E93] mb-6">{t("likedEachOther", { name: matchedProfile.name })}</p>
              <div className="flex gap-3 mb-6 justify-center">
                <UserAvatar alt={matchedProfile.name} size="xl" gradientRing />
                <UserAvatar alt={user?.name ?? t("you")} size="xl" gradientRing />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="flex-1 py-3 px-4 rounded-2xl border-2 border-[#EBEBF0] dark:border-[#262622] text-[#1A1A2E] dark:text-white font-semibold transition-all active:scale-95"
                >
                  {t("keepSwiping")}
                </button>
                <button
                  onClick={() => { setShowMatchModal(false); handleOpenChat() }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-semibold cloud-shadow-blue transition-all active:scale-95"
                >
                  {t("sendMessage")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
