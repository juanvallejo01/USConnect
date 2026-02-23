"use client"

import { UserAvatar } from "@/components/layout/user-avatar"
import { RankBadge } from "./rank-badge"

interface LeaderboardRowProps {
  rank: number
  name: string
  avatar: string
  major: string
  campusRank: number
  isTopThree?: boolean
}

export function LeaderboardRow({
  rank,
  name,
  avatar,
  major,
  campusRank,
  isTopThree = false,
}: LeaderboardRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl p-4 ${
        isTopThree
          ? "bg-gradient-to-r from-[#3C5E82]/10 to-[#5E82AC]/10 border border-[#5E82AC]/30 shadow-md"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        {isTopThree ? (
          <RankBadge rank={rank} size="lg" />
        ) : (
          <span className="text-sm font-bold text-gray-400">#{rank}</span>
        )}
      </div>
      <UserAvatar src={avatar} alt={name} size="md" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
        <p className="text-xs text-gray-500 truncate">{major}</p>
      </div>
      <div
        className={`rounded-full px-3 py-1.5 ${
          isTopThree
            ? "bg-gradient-to-r from-[#3C5E82] to-[#5E82AC]"
            : "bg-gray-100"
        }`}
      >
        <p
          className={`text-xs font-bold ${
            isTopThree ? "text-white" : "text-gray-700"
          }`}
        >
          {campusRank.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
