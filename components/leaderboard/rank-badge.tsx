"use client"

import { Trophy, Medal, Award } from "lucide-react"

interface RankBadgeProps {
  rank: number
  size?: "sm" | "md" | "lg"
}

export function RankBadge({ rank, size = "md" }: RankBadgeProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const iconSize = {
    sm: 12,
    md: 14,
    lg: 18,
  }

  const config: Record<number, { gradient: string; shadow: string; Icon: typeof Trophy }> = {
    1: {
      gradient: "from-yellow-400 via-amber-400 to-yellow-500",
      shadow: "0 4px 16px rgba(255, 215, 0, 0.4), 0 2px 6px rgba(255, 165, 0, 0.2)",
      Icon: Trophy,
    },
    2: {
      gradient: "from-slate-300 via-gray-200 to-slate-400",
      shadow: "0 4px 16px rgba(148, 163, 184, 0.35), 0 2px 6px rgba(100, 116, 139, 0.15)",
      Icon: Medal,
    },
    3: {
      gradient: "from-amber-500 via-orange-400 to-amber-600",
      shadow: "0 4px 16px rgba(217, 119, 6, 0.35), 0 2px 6px rgba(180, 83, 9, 0.15)",
      Icon: Award,
    },
  }

  const rankConfig = config[rank]

  if (!rankConfig) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#1C1C1E]`}>
        <span className="text-xs font-extrabold text-[#8E8E93] dark:text-[#A8A398]">
          {rank}
        </span>
      </div>
    )
  }

  const { gradient, shadow, Icon } = rankConfig

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} animate-crownBounce`}
      style={{ boxShadow: shadow }}
    >
      <Icon size={iconSize[size]} className={rank === 1 ? "text-yellow-900" : rank === 2 ? "text-slate-600" : "text-amber-900"} />
    </div>
  )
}
