"use client"

import { useRef, useState } from "react"
import Image from "next/image"

/**
 * Galería de fotos con barras de progreso y navegación por toque, con el
 * mismo look que la tarjeta de Descubrir (SwipeCard) — usada donde se debe
 * ver el set completo de fotos de alguien "tal cual como en Descubrir"
 * (p. ej. la celebración de match).
 */
export function PhotoGallery({
  photos,
  alt,
  className,
}: {
  photos: string[]
  alt: string
  className?: string
}) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  function handleTap(e: React.MouseEvent) {
    if (!containerRef.current || photos.length < 2) return
    const rect = containerRef.current.getBoundingClientRect()
    const tapX = e.clientX - rect.left
    if (tapX < rect.width / 2) {
      setIndex((i) => Math.max(0, i - 1))
    } else {
      setIndex((i) => Math.min(photos.length - 1, i + 1))
    }
  }

  if (photos.length === 0) {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#000000] to-[#404040] ${className ?? ""}`}>
        <span className="text-5xl font-black text-white/90">{alt.charAt(0).toUpperCase()}</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onClick={handleTap}
      className={`relative overflow-hidden select-none ${photos.length > 1 ? "cursor-pointer" : ""} ${className ?? ""}`}
    >
      <Image src={photos[index]} alt={alt} fill className="object-cover" priority draggable={false} />

      {photos.length > 1 && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex gap-[5px] z-10">
          {photos.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full bg-white/35">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: i <= index ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
