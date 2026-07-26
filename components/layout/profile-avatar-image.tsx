"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"

/**
 * Resolves a user's real photo, or the theme-appropriate placeholder path
 * when they don't have one. Use this when handing a `src` to a generic
 * avatar component (e.g. one with a decorative ring) instead of rendering
 * the photo directly.
 */
export function useThemedAvatarSrc(photoUrl?: string | null): string {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const fallback = mounted && resolvedTheme === "dark" ? "/imageprofile.png" : "/imageprofile1.png"
  return photoUrl || fallback
}

/**
 * A user's actual profile photo when they have one; otherwise a themed
 * placeholder silhouette (dark/light artwork, not a plain initial letter).
 * This is the single rendering used everywhere a real user's "principal"
 * photo appears: feed, search, ranking, chat, and profile screens.
 */
export function ProfileAvatarImage({
  photoUrl,
  name,
  size,
  className = "",
  rounded = "rounded-full",
}: {
  photoUrl?: string | null
  name: string
  /** Pixel size for a fixed-size circle. Omit (with `fill`) to stretch to the parent instead. */
  size?: number
  className?: string
  /** Fill the parent element instead of using a fixed pixel size — parent must be positioned and sized. */
  fill?: boolean
  rounded?: string
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const fallback = mounted && resolvedTheme === "dark" ? "/imageprofile.png" : "/imageprofile1.png"

  return (
    <div
      className={`relative ${rounded} overflow-hidden flex-shrink-0 bg-[#F2F2F7] ${size ? "" : "w-full h-full"} ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <Image src={photoUrl || fallback} alt={name} fill className="object-cover" sizes={size ? `${size}px` : "100%"} />
    </div>
  )
}
