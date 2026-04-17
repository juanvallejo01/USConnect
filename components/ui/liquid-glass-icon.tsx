"use client"

import { type LucideIcon } from "lucide-react"
import { type ReactNode } from "react"

interface LiquidGlassIconProps {
  icon: LucideIcon
  isActive?: boolean
  size?: number
  badge?: ReactNode
  onClick?: () => void
  className?: string
}

export function LiquidGlassIcon({
  icon: Icon,
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
    >
      {/* Liquid glass container */}
      <div className="relative">
        {/* Animated blob background - only visible when active */}
        {isActive && (
          <div className="absolute inset-0 -m-1.5">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4A90D9]/15 via-[#5BA3E8]/10 to-[#4A90D9]/8 rounded-[18px] animate-blob-morph" />
            <div className="absolute inset-0 bg-gradient-to-tl from-[#6BB5F5]/10 via-transparent to-[#4A90D9]/8 rounded-[18px] animate-blob-morph-reverse" 
                 style={{ animationDelay: "0.3s" }} />
          </div>
        )}

        {/* Glass backdrop with shimmer */}
        <div className={`relative p-2 rounded-[16px] transition-all duration-500 ${
          isActive 
            ? "bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(74,144,217,0.12),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-1px_4px_rgba(74,144,217,0.08)]" 
            : "bg-white/40 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.5)] group-hover:bg-white/60 group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.6)]"
        }`}>
          {/* Shimmer effect overlay */}
          {isActive && (
            <div className="absolute inset-0 rounded-[16px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-shimmer-slide" />
            </div>
          )}

          {/* Icon with liquid glow */}
          <div className="relative">
            <Icon
              size={size}
              strokeWidth={isActive ? 2.5 : 2}
              className={`relative z-10 transition-all duration-500 ${
                isActive 
                  ? "text-[#4A90D9] drop-shadow-[0_0_8px_rgba(74,144,217,0.4)]" 
                  : "text-[#8E8E93] group-hover:text-[#4A90D9] group-hover:drop-shadow-[0_0_6px_rgba(74,144,217,0.3)]"
              }`}
            />
            {/* Liquid pulse glow when active */}
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#4A90D9]/15 rounded-full blur-md animate-liquid-pulse" />
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
      } bg-gradient-radial from-[#4A90D9]/10 to-transparent`} />
    </button>
  )
}
