"use client"

import { Trophy, Medal, Award, Heart } from "lucide-react"
import { useRank } from "@/context/rank-context"
import { UserAvatar } from "@/components/layout/user-avatar"

export function LeaderboardPage() {
  const { getTopUsers } = useRank()
  const topUsers = getTopUsers(10)

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Trophy size={20} className="text-yellow-500" />
      case 2:
        return <Medal size={20} className="text-gray-400" />
      case 3:
        return <Award size={20} className="text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-400">#{rank}</span>
    }
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-5 pt-12 pb-6 animate-slideUp">
        <h1 className="text-2xl font-bold text-white">Campus Rank</h1>
        <p className="text-sm text-white/80 mt-1">Top students by likes received</p>
      </div>

      {/* Podium - Top 3 */}
      <div className="px-5 py-6 bg-white border-b border-gray-200 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-end justify-center gap-3">
          {/* 2nd Place */}
          {topUsers[1] && (
            <div className="flex flex-col items-center flex-1 transition-all duration-300 hover:scale-105">
              <div className="relative">
                <UserAvatar src={topUsers[1].avatar} alt={topUsers[1].name} size="lg" />
                <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-gray-300 to-gray-500 shadow-lg">
                  <Medal size={14} className="text-white" />
                </div>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 truncate max-w-full">{topUsers[1].name}</h3>
              <p className="text-xs text-gray-500 truncate max-w-full">{topUsers[1].major}</p>
              <div className="mt-1.5 rounded-full bg-gray-100 px-3 py-1 flex items-center gap-1">
                <Heart size={10} className="text-gray-600" fill="currentColor" />
                <p className="text-xs font-bold text-gray-700">{topUsers[1].likesReceived} Likes</p>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topUsers[0] && (
            <div className="flex flex-col items-center flex-1 -mt-4 transition-all duration-300 hover:scale-105">
              <div className="relative animate-pulse">
                <UserAvatar src={topUsers[0].avatar} alt={topUsers[0].name} size="xl" />
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg">
                  <Trophy size={16} className="text-white" />
                </div>
              </div>
              <h3 className="mt-2 text-sm font-bold text-gray-900 truncate max-w-full">{topUsers[0].name}</h3>
              <p className="text-xs text-gray-500 truncate max-w-full">{topUsers[0].major}</p>
              <div className="mt-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 shadow-md flex items-center gap-1">
                <Heart size={10} className="text-white" fill="currentColor" />
                <p className="text-xs font-bold text-white">{topUsers[0].likesReceived} Likes</p>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topUsers[2] && (
            <div className="flex flex-col items-center flex-1 transition-all duration-300 hover:scale-105">
              <div className="relative">
                <UserAvatar src={topUsers[2].avatar} alt={topUsers[2].name} size="lg" />
                <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg">
                  <Award size={14} className="text-white" />
                </div>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900 truncate max-w-full">{topUsers[2].name}</h3>
              <p className="text-xs text-gray-500 truncate max-w-full">{topUsers[2].major}</p>
              <div className="mt-1.5 rounded-full bg-gray-100 px-3 py-1 flex items-center gap-1">
                <Heart size={10} className="text-gray-600" fill="currentColor" />
                <p className="text-xs font-bold text-gray-700">{topUsers[2].likesReceived} Likes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rest of Rankings */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-2">
          {topUsers.slice(3).map((user, index) => {
            const rank = index + 4
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-fadeIn"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                  {getRankIcon(rank)}
                </div>
                <UserAvatar src={user.avatar} alt={user.name} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{user.major}</p>
                </div>
                <div className="rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-3 py-1.5 flex items-center gap-1">
                  <Heart size={10} className="text-white" fill="currentColor" />
                  <p className="text-xs font-bold text-white">{user.likesReceived}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info Footer */}
      <div className="border-t border-gray-200 bg-white px-5 py-3">
        <p className="text-xs text-center text-gray-500">
          Campus Rank is based on likes received from other students
        </p>
      </div>
    </div>
  )
}
