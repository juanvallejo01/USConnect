"use client"

import { useState } from "react"
import { X, Heart, Sparkles } from "lucide-react"
import { GradientHeader } from "@/components/layout/gradient-header"
import { SwipeCard } from "@/components/explore/swipe-card"
import { PROFILES } from "@/utils/constants"

export function ExplorePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)

  const profile = PROFILES[currentIndex % PROFILES.length]

  function handleSwipe(direction: "left" | "right") {
    setSwipeDirection(direction)
    setTimeout(() => {
      setSwipeDirection(null)
      setCurrentIndex((prev) => prev + 1)
    }, 300)
  }

  return (
    <div className="flex flex-col h-full bg-background">
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
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pb-6 pt-2">
        <button
          onClick={() => handleSwipe("left")}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-all active:scale-90 hover:shadow-xl"
          aria-label="Dislike"
        >
          <X size={28} className="text-muted-foreground" />
        </button>
        <button
          onClick={() => handleSwipe("right")}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary shadow-xl transition-all active:scale-90 hover:shadow-2xl"
          aria-label="Like"
        >
          <Heart size={32} className="text-primary-foreground" fill="white" />
        </button>
      </div>
    </div>
  )
}
