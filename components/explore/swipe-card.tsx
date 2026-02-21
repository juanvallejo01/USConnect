"use client"

import { useRef, useState } from "react"
import Image from "next/image"

interface SwipeProfile {
  id: number
  name: string
  age: number
  image: string
  interests: readonly string[]
  bio: string
}

export function SwipeCard({
  profile,
  onSwipe,
}: {
  profile: SwipeProfile
  onSwipe: (direction: "left" | "right") => void
}) {
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)

  function handlePointerDown(e: React.PointerEvent) {
    setIsDragging(true)
    startXRef.current = e.clientX
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    setDragX(e.clientX - startXRef.current)
  }

  function handlePointerUp() {
    if (!isDragging) return
    setIsDragging(false)
    if (dragX > 80) {
      onSwipe("right")
    } else if (dragX < -80) {
      onSwipe("left")
    }
    setDragX(0)
  }

  const cardRotation = isDragging ? dragX * 0.08 : 0

  return (
    <div
      className="absolute inset-0 rounded-[28px] overflow-hidden shadow-xl cursor-grab active:cursor-grabbing touch-none select-none"
      style={{
        transform: `translateX(${dragX}px) rotate(${cardRotation}deg)`,
        transitionDuration: isDragging ? "0ms" : "300ms",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Image
        src={profile.image}
        alt={`${profile.name}'s profile photo`}
        fill
        className="object-cover"
        priority
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {dragX > 40 && (
        <div className="absolute top-8 left-6 rounded-xl border-4 border-green-500 px-4 py-2 -rotate-12">
          <span className="text-2xl font-black text-green-500">LIKE</span>
        </div>
      )}
      {dragX < -40 && (
        <div className="absolute top-8 right-6 rounded-xl border-4 border-primary px-4 py-2 rotate-12">
          <span className="text-2xl font-black text-primary">NOPE</span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-2">
            <h2 className="text-3xl font-bold text-white">{profile.name}</h2>
            <span className="text-xl font-light text-white/80 mb-0.5">{profile.age}</span>
          </div>
          <p className="text-sm text-white/70">{profile.bio}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {profile.interests.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
