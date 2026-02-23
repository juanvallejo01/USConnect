"use client"

import { Trophy } from "lucide-react"

interface RankBadgeProps {
  rank: number
  size?: "sm" | "md" | "lg"
}

export function RankBadge({ rank, size = "md" }: RankBadgeProps) {
  const sizeClasses = {
    sm: "h-5 w-5 text-[10px]",
    md: "h-6 w-6 text-xs",
    lg: "h-8 w-8 text-sm",
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] shadow-sm`}
    >
      <Trophy size={size === "sm" ? 10 : size === "md" ? 12 : 14} className="text-white" />
    </div>
  )
}
