"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Heart, RotateCcw, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { SwipeCard } from "@/components/explore/swipe-card"
import { PhotoGallery } from "@/components/explore/photo-gallery"
import { useMatch } from "@/context/match-context"
import { useChat } from "@/context/chat-context"
import { useNotification } from "@/context/notification-context"
import { usersApi, leaderboardApi } from "@/lib/api-client"
import { getDisplayPhotos } from "@/lib/photos"

const RANKED_USERS_LIMIT = 100

interface ExploreUser {
  id: string
  name: string
  major: string
  likesCount: number
  photoUrl?: string | null
  photos?: string[]
}

export function ExplorePage() {
  const t = useTranslations("explore")
  const [profiles, setProfiles] = useState<ExploreUser[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [userRanks, setUserRanks] = useState<Map<string, number>>(new Map())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<ExploreUser | null>(null)
  const { likeUser, hasLiked, isMatched } = useMatch()
  const { openChat } = useChat()
  const { refresh: refreshNotifications } = useNotification()

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
    loadUserRanks()
  }, [loadProfiles])

  async function loadUserRanks() {
    try {
      const ranking = await leaderboardApi.getUsersRanking(RANKED_USERS_LIMIT)
      setUserRanks(new Map(ranking.map((u: { id: string; rank: number }) => [u.id, u.rank])))
    } catch (error) {
      console.error("Failed to load user rankings:", error)
    }
  }

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
              overridePhotos={getDisplayPhotos(profile.photoUrl, profile.photos)}
              rank={userRanks.get(profile.id)}
            />
          </div>
        )}

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

        {/* Nope — primary action */}
        <button
          onClick={() => handleSwipe("left")}
          disabled={outOfProfiles || loadingProfiles}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-[28px] bg-white dark:bg-[#1C1C1E] transition-all active:scale-90 disabled:opacity-30"
          style={{ boxShadow: "0 2px 16px rgba(255,68,88,0.2)" }}
        >
          <X size={28} className="text-[#FF4458]" strokeWidth={2.8} />
        </button>

        {/* Undo — small, tertiary */}
        <button
          onClick={handleUndo}
          disabled={currentIndex === 0 || !canUndo}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-[28px] bg-white dark:bg-[#1C1C1E] transition-all active:scale-90 disabled:opacity-30"
          style={{ boxShadow: "0 2px 16px rgba(245,167,66,0.2)" }}
        >
          <RotateCcw size={22} className="text-[#F5A742]" strokeWidth={2.2} />
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
              <div className="mb-6 flex justify-center">
                <PhotoGallery
                  photos={getDisplayPhotos(matchedProfile.photoUrl, matchedProfile.photos)}
                  alt={matchedProfile.name}
                  className="w-full max-w-[220px] aspect-[3/4] rounded-3xl"
                />
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
