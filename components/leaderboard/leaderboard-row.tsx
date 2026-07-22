"use client"

import { Heart } from "lucide-react"
import { UserAvatar } from "@/components/layout/user-avatar"
import { RankBadge } from "./rank-badge"

interface LeaderboardRowProps {
  rank: number
  name: string
  avatar: string
  major: string
  campusRank: number
  isTopThree?: boolean
  onClick?: () => void
  delay?: number
}

export function LeaderboardRow({
  rank,
  name,
  avatar,
  major,
  campusRank,
  isTopThree = false,
  onClick,
  delay = 0,
}: LeaderboardRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl p-3.5 transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-rankSlideIn ${
        isTopThree
          ? "bg-gradient-to-r from-[#000000]/[0.06] to-[#404040]/[0.06] border border-[#000000]/15"
          : "bg-white dark:bg-[#1A1A1C] border border-[#EBEBF0]/80 dark:border-[#1C1C1E] hover:border-[#000000]/20 hover:cloud-shadow-md"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
        {isTopThree ? (
          <RankBadge rank={rank} size="md" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#1C1C1E]">
            <span className="text-xs font-bold text-[#8E8E93] dark:text-[#A8A398]">#{rank}</span>
          </div>
        )}
      </div>
      <UserAvatar src={avatar} alt={name} size="md" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#1A1A2E] truncate">{name}</h3>
        <p className="text-xs text-[#8E8E93] truncate">{major}</p>
      </div>
      <div
        className={`rounded-xl px-3 py-1.5 flex items-center gap-1.5 transition-all ${
          isTopThree
            ? "bg-gradient-to-r from-[#000000] to-[#404040] cloud-shadow-blue"
            : "bg-[#F2F2F7] dark:bg-[#1C1C1E]"
        }`}
      >
        <Heart size={10} className={isTopThree ? "text-white" : "text-[#171717]"} fill="currentColor" />
        <p
          className={`text-xs font-bold ${
            isTopThree ? "text-white" : "text-[#1A1A2E] dark:text-white"
          }`}
        >
          {campusRank.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
