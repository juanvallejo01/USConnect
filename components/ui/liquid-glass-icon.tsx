"use client"

import { type LucideIcon } from "lucide-react"
import { type ReactNode } from "react"

interface LiquidGlassIconProps {
  icon: LucideIcon
  label?: string
  isActive?: boolean
  size?: number
  badge?: ReactNode
  onClick?: () => void
  className?: string
}

export function LiquidGlassIcon({
  icon: Icon,
  label,
  isActive = false,
  size = 24,
  badge,
  onClick,
  className = "",
}: LiquidGlassIconProps) {
  return (
    <button
      onClick={onClick}
      className={`relative group ${className}`}
      aria-pressed={isActive}
      aria-label={label}
    >
      {/* Liquid glass container */}
      <div className="relative">
        {/* Animated blob background - only visible when active */}
        {isActive && (
          <div className="absolute inset-0 -m-1.5">
            <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-black/10 to-black/8 dark:from-white/15 dark:via-white/10 dark:to-white/8 rounded-[18px] animate-blob-morph" />
            <div className="absolute inset-0 bg-gradient-to-tl from-black/10 via-transparent to-black/8 dark:from-white/10 dark:to-white/8 rounded-[18px] animate-blob-morph-reverse"
                 style={{ animationDelay: "0.3s" }} />
          </div>
        )}

        {/* Glass backdrop with shimmer */}
        <div className={`relative p-2 rounded-[16px] transition-all duration-500 ${
          isActive
            ? "bg-white/90 dark:bg-white/12 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.15),inset_0_-1px_4px_rgba(0,0,0,0.2)]"
            : "bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] group-hover:bg-white/60 dark:group-hover:bg-white/10 group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.6)] dark:group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
        }`}>
          {/* Shimmer effect overlay */}
          {isActive && (
            <div className="absolute inset-0 rounded-[16px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 dark:via-white/15 to-transparent -translate-x-full animate-shimmer-slide" />
            </div>
          )}

          {/* Icon with liquid glow */}
          <div className="relative">
            <Icon
              size={size}
              strokeWidth={isActive ? 2.5 : 2}
              className={`relative z-10 transition-all duration-500 ${
                isActive
                  ? "text-black dark:text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                  : "text-[#8E8E93] dark:text-[#8A8A8E] group-hover:text-black dark:group-hover:text-white group-hover:drop-shadow-[0_0_6px_rgba(0,0,0,0.3)] dark:group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.25)]"
              }`}
            />
            {/* Liquid pulse glow when active */}
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-black/15 dark:bg-white/20 rounded-full blur-md animate-liquid-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Badge overlay */}
        {badge && (
          <div className="absolute -top-1 -right-1 z-20">
            {badge}
          </div>
        )}
      </div>

      {/* Press interaction feedback */}
      <div className={`absolute inset-0 -m-1.5 rounded-[18px] transition-opacity duration-200 ${
        isActive ? "opacity-0" : "opacity-0 group-active:opacity-100"
      } bg-gradient-radial from-black/10 dark:from-white/15 to-transparent`} />
    </button>
  )
}
