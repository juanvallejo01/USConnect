"use client"

import { useState } from "react"
import { X, Heart, RotateCcw, Sparkles, MessageCircle } from "lucide-react"
import { SwipeCard } from "@/components/explore/swipe-card"
import { PROFILES } from "@/utils/constants"
import { useMatch } from "@/context/match-context"
import { useChat } from "@/context/chat-context"
import { useNotification } from "@/context/notification-context"
import { useProfilePhotos } from "@/context/profile-photos-context"

type ProfileType = (typeof PROFILES)[number]

export function ExplorePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<ProfileType | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isClosingNotifications, setIsClosingNotifications] = useState(false)
  const { likeUser, hasLiked, isMatched } = useMatch()
  const { openChat } = useChat()
  const { addMatchNotification, notifications, markAsRead, markAllAsRead, unreadCount } = useNotification()
  const { photos: myPhotos } = useProfilePhotos()

  const currentUserId = 1
  const profile = PROFILES[currentIndex % PROFILES.length]
  // For the current user's own profile, use the live context photos; for others use their PROFILES photos
  const profilePhotos: string[] = profile.id === currentUserId
    ? myPhotos
    : ((profile as unknown as { photos?: string[] }).photos ?? [profile.image])
  const alreadyLiked = hasLiked(currentUserId, profile.id)
  const matched = isMatched(currentUserId, profile.id)

  function handleSwipe(direction: "left" | "right") {
    setSwipeDirection(direction)
    if (direction === "right" && !alreadyLiked) {
      const result = likeUser(currentUserId, profile.id)
      if (result.success && result.matched) {
        setMatchedProfile(profile as ProfileType)
        setShowMatchModal(true)
        addMatchNotification(currentUserId, profile.id, profile.name, profile.image)
        addMatchNotification(profile.id, currentUserId, "You", "/default-avatar.png")
      }
    }
    setTimeout(() => {
      setSwipeDirection(null)
      setCurrentIndex((prev) => prev + 1)
    }, 300)
  }

  function handleUndo() {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1)
  }

  function handleOpenChat() {
    if (matched) {
      openChat({ id: profile.id, name: profile.name, avatar: profile.image, major: profile.bio })
    }
  }

  const handleCloseNotifications = () => {
    setIsClosingNotifications(true)
    setTimeout(() => {
      setShowNotifications(false)
      setIsClosingNotifications(false)
    }, 300)
  }

  return (
    <div className="flex flex-col h-full bg-black relative">

      {/* ── CARD AREA (flex-1) ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Card with swipe-exit animation */}
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
            overridePhotos={profilePhotos}
          />
        </div>

        {/* ── TOP BAR OVERLAY ── */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-3.5 pointer-events-none">
          {/* Logo */}
          <span className="text-[17px] font-bold text-white drop-shadow-sm tracking-tight pointer-events-auto">
            Explore
          </span>

          {/* Notification bell */}
          <button
            className="relative pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-md transition-all active:scale-90"
            onClick={() => showNotifications ? handleCloseNotifications() : setShowNotifications(true)}
          >
            <Sparkles size={18} className="text-white" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 h-[18px] min-w-[18px] bg-red-500 rounded-full flex items-center justify-center px-1">
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
            <div className="rounded-full bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] px-5 py-2 shadow-xl">
              <p className="text-sm font-bold text-white">✨ It's a match! Tap 💬 to message</p>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTION BUTTONS ROW ── */}
      <div className="bg-white flex items-center justify-center gap-8 px-8 py-5 border-t border-gray-100/80">

        {/* Undo — small, tertiary */}
        <button
          onClick={handleUndo}
          disabled={currentIndex === 0}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white transition-all active:scale-90 disabled:opacity-30"
          style={{ boxShadow: "0 2px 12px rgba(245,167,66,0.25), 0 1px 4px rgba(0,0,0,0.08)" }}
        >
          <RotateCcw size={22} className="text-[#F5A742]" strokeWidth={2.2} />
        </button>

        {/* Nope — primary action */}
        <button
          onClick={() => handleSwipe("left")}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-white transition-all active:scale-90"
          style={{ boxShadow: "0 4px 18px rgba(255,68,88,0.30), 0 1px 6px rgba(0,0,0,0.08)" }}
        >
          <X size={28} className="text-[#FF4458]" strokeWidth={2.8} />
        </button>

        {/* Like — hero action, biggest */}
        <button
          onClick={() => handleSwipe("right")}
          disabled={alreadyLiked}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white transition-all active:scale-90 disabled:opacity-35"
          style={{ boxShadow: "0 6px 24px rgba(76,217,100,0.35), 0 1px 6px rgba(0,0,0,0.08)" }}
        >
          <Heart size={32} className="text-[#4CD964]" fill="#4CD964" />
        </button>
      </div>

      {/* ── NOTIFICATIONS PANEL ── */}
      {showNotifications && (
        <div className={`absolute inset-0 bg-white z-40 overflow-hidden ${isClosingNotifications ? "animate-slideOut" : "animate-slideDown"}`}>
          <div className="h-full overflow-y-auto">
            <div className="p-5 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <button onClick={handleCloseNotifications} className="p-1 text-gray-500">
                  <X size={24} />
                </button>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">{unreadCount} unread</p>
                  <button onClick={markAllAsRead} className="text-sm font-medium text-[#3C5E82]">
                    Mark all as read
                  </button>
                </div>
              )}
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles size={32} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                    <p className="text-gray-400 text-xs mt-1">When you get matches, they'll appear here</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-2xl border ${notification.read ? "bg-white border-gray-200" : "bg-[#3C5E82]/5 border-[#3C5E82]/20"}`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={(notification as any).avatar}
                          alt={(notification as any).userName}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-bold">{(notification as any).userName}</span>{" "}
                            {notification.type === "MATCH" ? "matched with you!" : (notification as any).message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{(notification as any).timestamp}</p>
                          {notification.type === "MATCH" && (
                            <button
                              onClick={() => {
                                markAsRead(Number(notification.id))
                                handleCloseNotifications()
                                setTimeout(() => {
                                  openChat({
                                    id: Number((notification as any).matchedWithId),
                                    name: (notification as any).userName,
                                    avatar: (notification as any).avatar,
                                    major: "",
                                  })
                                }, 300)
                              }}
                              className="mt-2 text-xs font-medium text-[#3C5E82] flex items-center gap-1"
                            >
                              <MessageCircle size={14} /> Send message
                            </button>
                          )}
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-[#3C5E82] flex-shrink-0 mt-1" />
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

      {/* ── MATCH MODAL ── */}
      {showMatchModal && matchedProfile && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative mx-5 w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl">
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: "-10%",
                    backgroundColor: ["#3C5E82", "#5E82AC", "#F59E0B", "#10B981"][Math.floor(Math.random() * 4)],
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${2 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] bg-clip-text text-transparent mb-2">
                It's a Match!
              </h2>
              <p className="text-gray-600 mb-6">You and {matchedProfile.name} liked each other</p>
              <div className="flex gap-3 mb-6">
                <div className="flex-1 flex justify-end">
                  <img src={matchedProfile.image} alt={matchedProfile.name} className="w-20 h-20 rounded-full border-4 border-[#3C5E82] object-cover" />
                </div>
                <div className="flex-1 flex justify-start">
                  <img src="/default-avatar.png" alt="You" className="w-20 h-20 rounded-full border-4 border-[#5E82AC] object-cover" />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="flex-1 py-3 px-4 rounded-full border-2 border-gray-300 text-gray-700 font-semibold transition-all active:scale-95"
                >
                  Keep Swiping
                </button>
                <button
                  onClick={() => { setShowMatchModal(false); handleOpenChat() }}
                  className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] text-white font-semibold shadow-lg transition-all active:scale-95"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
