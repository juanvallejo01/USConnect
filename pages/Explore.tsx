"use client"

import { useState, useEffect } from "react"
import { X, Heart, Sparkles, MessageCircle } from "lucide-react"
import { GradientHeader } from "@/components/layout/gradient-header"
import { SwipeCard } from "@/components/explore/swipe-card"
import { PROFILES } from "@/utils/constants"
import { useMatch } from "@/context/match-context"
import { useChat } from "@/context/chat-context"
import { useNotification } from "@/context/notification-context"

export function ExplorePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<typeof PROFILES[0] | null>(null)
  const { likeUser, hasLiked, isMatched } = useMatch()
  const { openChat } = useChat()
  const { addMatchNotification } = useNotification()
  
  // Assume current user is ID 1
  const currentUserId = 1

  const profile = PROFILES[currentIndex % PROFILES.length]
  const alreadyLiked = hasLiked(currentUserId, profile.id)
  const matched = isMatched(currentUserId, profile.id)

  function handleSwipe(direction: "left" | "right") {
    setSwipeDirection(direction)

    if (direction === "right" && !alreadyLiked) {
      const result = likeUser(currentUserId, profile.id)
      if (result.success && result.matched) {
        // It's a match! Show celebration
        setMatchedProfile(profile)
        setShowMatchModal(true)
        
        // Create notification
        addMatchNotification(currentUserId, profile.id, profile.name, profile.image)
        addMatchNotification(profile.id, currentUserId, "You", "/default-avatar.png")
      }
    }

    setTimeout(() => {
      setSwipeDirection(null)
      setCurrentIndex((prev) => prev + 1)
    }, 300)
  }

  function handleOpenChat() {
    if (matched) {
      openChat({
        id: profile.id,
        name: profile.name,
        avatar: profile.image,
        major: profile.bio,
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <GradientHeader
        title="Explore"
        rightAction={
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Sparkles size={18} className="text-white" />
          </div>
        }
      />

      <div className="flex-1 flex items-center justify-center px-5 pb-2">
        <div className="relative w-full max-w-[350px] aspect-[3/4]">
          <div
            className="absolute inset-0 transition-all"
            style={{
              transform: `translateX(${swipeDirection === "left" ? -400 : swipeDirection === "right" ? 400 : 0}px)`,
              opacity: swipeDirection ? 0 : 1,
              transitionDuration: "300ms",
            }}
          >
            <SwipeCard profile={profile} onSwipe={handleSwipe} />
          </div>

          {/* Match Status Badge */}
          {matched && (
            <div className="absolute top-4 left-4 right-4 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-2 shadow-lg">
                <p className="text-xs font-bold text-white">✨ Matched!</p>
              </div>
            </div>
          )}

          {alreadyLiked && !matched && (
            <div className="absolute top-4 left-4 right-4 flex justify-center">
              <div className="rounded-full bg-white/90 px-4 py-2 shadow-md">
                <p className="text-xs font-medium text-gray-700">❤️ Liked</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pb-6 pt-2">
        <button
          onClick={() => handleSwipe("left")}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all active:scale-90 hover:shadow-xl"
          aria-label="Pass"
        >
          <X size={28} className="text-gray-500" />
        </button>

        {matched && (
          <button
            onClick={handleOpenChat}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white border-2 border-[#8B5CF6] shadow-lg transition-all active:scale-90 hover:shadow-xl"
            aria-label="Open chat"
          >
            <MessageCircle size={24} className="text-[#8B5CF6]" fill="#8B5CF6" />
          </button>
        )}

        <button
          onClick={() => handleSwipe("right")}
          disabled={alreadyLiked}
          className={`flex h-[72px] w-[72px] items-center justify-center rounded-full shadow-xl transition-all active:scale-90 hover:shadow-2xl ${
            alreadyLiked
              ? "bg-gray-300 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]"
          }`}
          aria-label="Like"
        >
          <Heart size={32} className="text-white" fill="white" />
        </button>
      </div>

      {matched && (
        <div className="px-5 pb-4">
          <div className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm">
            <p className="text-xs text-center text-gray-600">
              You and {profile.name} liked each other! Start chatting now.
            </p>
          </div>
        </div>
      )}

      {/* Match Celebration Modal */}
      {showMatchModal && matchedProfile && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative mx-5 w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl animate-scaleIn">
            {/* Confetti effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'][Math.floor(Math.random() * 4)],
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${2 + Math.random()}s`,
                  }}
                />
              ))}
            </div>

            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                It's a Match!
              </h2>
              <p className="text-gray-600 mb-6">
                You and {matchedProfile.name} liked each other
              </p>

              <div className="flex gap-3 mb-6">
                <div className="flex-1 flex justify-end">
                  <img
                    src={matchedProfile.image}
                    alt={matchedProfile.name}
                    className="w-20 h-20 rounded-full border-4 border-purple-500 object-cover"
                  />
                </div>
                <div className="flex-1 flex justify-start">
                  <img
                    src="/default-avatar.png"
                    alt="You"
                    className="w-20 h-20 rounded-full border-4 border-pink-500 object-cover"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMatchModal(false)}
                  className="flex-1 py-3 px-4 rounded-full border-2 border-gray-300 text-gray-700 font-semibold transition-all duration-300 hover:bg-gray-50 active:scale-95"
                >
                  Keep Swiping
                </button>
                <button
                  onClick={() => {
                    setShowMatchModal(false)
                    handleOpenChat()
                  }}
                  className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold transition-all duration-300 hover:from-purple-700 hover:to-pink-700 active:scale-95 shadow-lg"
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
