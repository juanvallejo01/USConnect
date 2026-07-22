"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Info, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

interface SwipeProfile {
  id: string
  name: string
  major: string
  age?: number
  image?: string
  photos?: readonly string[]
  interests?: readonly string[]
  bio?: string
}

export function SwipeCard({
  profile,
  onSwipe,
  overridePhotos,
}: {
  profile: SwipeProfile
  onSwipe: (direction: "left" | "right") => void
  overridePhotos?: string[]
}) {
  const t = useTranslations("swipeCard")
  const photos = overridePhotos?.length
    ? overridePhotos
    : profile.photos?.length
      ? (profile.photos as string[])
      : profile.image
        ? [profile.image]
        : []
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const startXRef = useRef(0)
  const startTimeRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  function handlePointerDown(e: React.PointerEvent) {
    setIsDragging(true)
    startXRef.current = e.clientX
    startTimeRef.current = Date.now()
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    setDragX(e.clientX - startXRef.current)
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!isDragging) return
    setIsDragging(false)
    const dx = dragX
    const elapsed = Date.now() - startTimeRef.current
    if (Math.abs(dx) > 80) {
      // Swipe gesture
      onSwipe(dx > 0 ? "right" : "left")
    } else if (Math.abs(dx) < 10 && elapsed < 300 && containerRef.current) {
      // Tap: navigate photos
      const rect = containerRef.current.getBoundingClientRect()
      const tapX = e.clientX - rect.left
      if (tapX < rect.width / 3) {
        setPhotoIndex((i) => Math.max(0, i - 1))
      } else {
        setPhotoIndex((i) => Math.min(photos.length - 1, i + 1))
      }
    }
    setDragX(0)
  }

  const cardRotation = isDragging ? dragX * 0.05 : 0
  const likeOpacity = Math.max(0, Math.min(dragX / 80, 1))
  const nopeOpacity = Math.max(0, Math.min(-dragX / 80, 1))

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
      style={{
        transform: `translateX(${dragX}px) rotate(${cardRotation}deg)`,
        transitionDuration: isDragging ? "0ms" : "300ms",
        transformOrigin: "bottom center",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background photo (or initials fallback when no photo exists) */}
      {photos.length > 0 ? (
        <Image
          src={photos[photoIndex] ?? photos[0]}
          alt={profile.name}
          fill
          className="object-cover transition-opacity duration-200"
          priority
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#000000] to-[#404040]">
          <span className="text-8xl font-black text-white/90">{profile.name.charAt(0).toUpperCase()}</span>
        </div>
      )}

      {/* Top-to-bottom gradient (for overlay bar readability) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />

      {/* Bottom-to-top gradient (for profile info readability) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Photo progress bars — below the top overlay bar */}
      {photos.length > 1 && (
        <div className="absolute top-[50px] left-3 right-3 flex gap-[5px] z-10">
          {photos.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full bg-white/35">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: i <= photoIndex ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* LIKE stamp */}
      <div
        className="absolute top-24 left-5 rounded-xl border-[3px] border-[#4CD964] px-4 py-1.5 -rotate-12 z-20 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <span className="text-2xl font-black text-[#4CD964] tracking-[0.15em] drop-shadow-sm">
          {t("like")}
        </span>
      </div>

      {/* NOPE stamp */}
      <div
        className="absolute top-24 right-5 rounded-xl border-[3px] border-[#FF4458] px-4 py-1.5 rotate-12 z-20 pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        <span className="text-2xl font-black text-[#FF4458] tracking-[0.15em] drop-shadow-sm">
          {t("nope")}
        </span>
      </div>

      {/* Bottom profile info */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10">
        {/* Nearby badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#1DA462] px-3 py-1.5 shadow-sm">
            <MapPin size={11} className="text-white" fill="white" />
            <span className="text-xs font-bold text-white">{t("nearby")}</span>
          </span>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1 min-w-0">
            {/* Name + Age */}
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h2 className="text-[28px] font-bold text-white leading-none drop-shadow">
                {profile.name}
              </h2>
              {profile.age && <span className="text-[22px] font-light text-white/90">{profile.age}</span>}
            </div>

            {/* Bio (falls back to major when there's no real bio) */}
            <p className="text-sm text-white/72 mt-1.5 line-clamp-2 leading-snug">
              {profile.bio || profile.major}
            </p>

            {/* Interest chips (falls back to major when there are no real interests) */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(profile.interests?.length ? profile.interests.slice(0, 3) : [profile.major]).map((tag) => (
                <span
                  key={tag}
                  className="rounded-xl bg-white/25 backdrop-blur-lg px-3 py-1 text-xs font-medium text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Info / expand button */}
          <button
            className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-white/50 bg-white/20 backdrop-blur-lg transition-all active:scale-90"
            onClick={(e) => e.stopPropagation()}
          >
            <Info size={17} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
