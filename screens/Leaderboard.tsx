"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Award, Heart, TrendingUp, Users, Crown, Flame, Sparkles, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { UserProfile } from "./UserProfile"
import { UserAvatar } from "@/components/layout/user-avatar"
import { LeaderboardSkeletonList } from "@/components/leaderboard/leaderboard-skeleton"
import { useLocale } from "@/context/locale-context"

interface UserRanking {
  rank: number
  id: string
  name: string
  major: string
  weeklyLikes: number
  topPost: {
    id: string
    content: string
    imageUrl: string | null
    likesCount: number
    createdAt: string
  } | null
}

interface PostRanking {
  rank: number
  id: string
  content: string
  imageUrl: string | null
  createdAt: string
  likesCount: number
  user: {
    id: string
    name: string
    major: string
  }
}

interface MyRank {
  rank: number
  id: string
  name: string
  major: string
  weeklyLikes: number
}

type RankingType = 'users' | 'posts'

export function LeaderboardPage() {
  const t = useTranslations("leaderboard")
  const { locale } = useLocale()
  const dateLocale = locale === "es" ? "es-ES" : "en-US"
  const [rankingType, setRankingType] = useState<RankingType>('users')
  const [usersRanking, setUsersRanking] = useState<UserRanking[]>([])
  const [postsRanking, setPostsRanking] = useState<PostRanking[]>([])
  const [myRank, setMyRank] = useState<MyRank | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserRanking | null>(null)
  const [viewingProfile, setViewingProfile] = useState<string | null>(null)

  useEffect(() => {
    loadRankings()
  }, [])

  const loadRankings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const [usersRes, postsRes, myRankRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaderboard/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaderboard/posts`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaderboard/my-rank`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ])

      if (usersRes.ok) {
        const users = await usersRes.json()
        setUsersRanking(users)
      }

      if (postsRes.ok) {
        const posts = await postsRes.json()
        setPostsRanking(posts)
      }

      if (myRankRes.ok) {
        const rank = await myRankRes.json()
        setMyRank(rank)
      }
    } catch (error) {
      console.error("Failed to load rankings:", error)
    } finally {
      setLoading(false)
    }
  }

  function getRankDisplay(rank: number) {
    switch (rank) {
      case 1:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500"
            style={{ boxShadow: '0 3px 12px rgba(255,215,0,0.35)' }}>
            <Trophy size={15} className="text-yellow-900" />
          </div>
        )
      case 2:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 via-gray-200 to-slate-400"
            style={{ boxShadow: '0 3px 12px rgba(148,163,184,0.3)' }}>
            <Medal size={15} className="text-slate-600" />
          </div>
        )
      case 3:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-orange-400 to-amber-600"
            style={{ boxShadow: '0 3px 12px rgba(217,119,6,0.3)' }}>
            <Award size={15} className="text-amber-900" />
          </div>
        )
      default:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#1C1C1E]">
            <span className="text-xs font-bold text-[#8E8E93] dark:text-[#A8A398]">#{rank}</span>
          </div>
        )
    }
  }

  const currentRanking = rankingType === 'users' ? usersRanking : []
  const topThree = currentRanking.slice(0, 3)
  const restRanking = currentRanking.slice(3)
  const isInTop10 = myRank && myRank.rank <= 10

  if (viewingProfile) {
    return <UserProfile userId={viewingProfile} onClose={() => setViewingProfile(null)} />
  }

  return (
    <div className="flex h-full flex-col bg-[#F8F8FA] dark:bg-[#0A0A0C]">
      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#000000] via-[#171717] to-[#404040] px-5 pt-14 pb-6">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-white/[0.06]" />
        <div className="absolute top-16 -left-10 h-20 w-20 rounded-full bg-white/[0.04]" />
        <div className="absolute bottom-2 right-12 h-12 w-12 rounded-full bg-white/[0.05]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{t("title")}</h1>
              <p className="text-[13px] text-white/70 font-medium">{t("subtitle")}</p>
            </div>
          </div>

          {/* Segmented Toggle */}
          <div className="flex gap-1.5 bg-white/[0.12] backdrop-blur-md rounded-2xl p-1.5">
            <button
              onClick={() => setRankingType('users')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                rankingType === 'users'
                  ? 'bg-white text-[#000000] shadow-lg shadow-black/[0.08]'
                  : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Users size={15} />
              {t("topUsers")}
            </button>
            <button
              onClick={() => setRankingType('posts')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                rankingType === 'posts'
                  ? 'bg-white text-[#000000] shadow-lg shadow-black/[0.08]'
                  : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Flame size={15} />
              {t("hotPosts")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <LeaderboardSkeletonList count={7} />
        </div>
      ) : rankingType === 'users' ? (
        <div className="fade-in-up flex-1 flex flex-col overflow-hidden">
          {/* ── Podium — Top 3 ── */}
          {topThree.length > 0 && (
            <div className="px-4 pt-6 pb-4 bg-white dark:bg-[#141416] border-b border-[#EBEBF0]/60 dark:border-[#262622]">
              <div className="flex items-end justify-center gap-2">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div
                    onClick={() => setSelectedUser(topThree[1])}
                    className="flex flex-col items-center flex-1 cursor-pointer animate-podiumRise"
                    style={{ animationDelay: '0.2s' }}
                  >
                    <div className="relative mb-2">
                      <div className="h-[60px] w-[60px] rounded-full bg-gradient-to-br from-slate-200 to-slate-400 p-[2.5px]">
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-slate-500 to-slate-700 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white font-bold text-lg">
                          {topThree[1].name.charAt(0)}
                        </div>
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 animate-crownBounce" style={{ animationDelay: '0.5s' }}>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500"
                          style={{ boxShadow: '0 2px 10px rgba(148,163,184,0.4)' }}>
                          <Medal size={13} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[13px] font-bold text-[#1A1A2E] dark:text-white truncate max-w-[90px] text-center">{topThree[1].name.split(' ')[0]}</h3>
                    <p className="text-[10px] text-[#8E8E93] dark:text-[#A8A398] truncate max-w-[80px] text-center mt-0.5">{topThree[1].major}</p>
                    <div className="mt-2 rounded-xl bg-[#F2F2F7] dark:bg-[#1C1C1E] px-3 py-1 flex items-center gap-1">
                      <Heart size={9} className="text-[#171717]" fill="currentColor" />
                      <span className="text-[11px] font-bold text-[#1A1A2E] dark:text-white">{topThree[1].weeklyLikes}</span>
                    </div>
                    {/* Podium block */}
                    <div className="mt-3 w-full h-16 bg-gradient-to-t from-slate-600/40 to-slate-500/20 dark:from-slate-700 dark:to-slate-600/40 rounded-t-2xl flex items-center justify-center border border-slate-300/30 dark:border-slate-600/40">
                      <span className="text-2xl font-black text-slate-400 dark:text-slate-300">2</span>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <div
                    onClick={() => setSelectedUser(topThree[0])}
                    className="flex flex-col items-center flex-1 cursor-pointer animate-podiumRise"
                    style={{ animationDelay: '0.1s' }}
                  >
                    <div className="mb-1.5 animate-crownBounce" style={{ animationDelay: '0.7s' }}>
                      <Crown size={22} className="text-yellow-500 mx-auto" fill="currentColor" />
                    </div>
                    <div className="relative mb-2">
                      <div className="h-[72px] w-[72px] rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 p-[3px] animate-glowPulse">
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl">
                          {topThree[0].name.charAt(0)}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 animate-crownBounce" style={{ animationDelay: '0.6s' }}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500"
                          style={{ boxShadow: '0 3px 14px rgba(255,215,0,0.45)' }}>
                          <Trophy size={15} className="text-yellow-900" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[14px] font-extrabold text-[#1A1A2E] dark:text-white truncate max-w-[100px] text-center">{topThree[0].name.split(' ')[0]}</h3>
                    <p className="text-[10px] text-[#8E8E93] dark:text-[#A8A398] truncate max-w-[90px] text-center mt-0.5">{topThree[0].major}</p>
                    <div className="mt-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-3.5 py-1.5 flex items-center gap-1.5"
                      style={{ boxShadow: '0 3px 12px rgba(255,215,0,0.3)' }}>
                      <Heart size={10} className="text-white" fill="currentColor" />
                      <span className="text-[12px] font-bold text-white">{topThree[0].weeklyLikes}</span>
                    </div>
                    {/* Podium block — tallest */}
                    <div className="mt-3 w-full h-24 bg-gradient-to-t from-yellow-500/30 to-yellow-400/10 dark:from-yellow-600/30 dark:to-yellow-500/10 rounded-t-2xl flex items-center justify-center border border-yellow-300/30 dark:border-yellow-500/20">
                      <span className="text-3xl font-black text-yellow-500">1</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div
                    onClick={() => setSelectedUser(topThree[2])}
                    className="flex flex-col items-center flex-1 cursor-pointer animate-podiumRise"
                    style={{ animationDelay: '0.3s' }}
                  >
                    <div className="relative mb-2">
                      <div className="h-[56px] w-[56px] rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-[2.5px]">
                        <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-600 to-orange-700 dark:from-amber-700 dark:to-orange-800 flex items-center justify-center text-white font-bold text-base">
                          {topThree[2].name.charAt(0)}
                        </div>
                      </div>
                      <div className="absolute -top-1.5 -right-1.5 animate-crownBounce" style={{ animationDelay: '0.55s' }}>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500"
                          style={{ boxShadow: '0 2px 10px rgba(217,119,6,0.4)' }}>
                          <Award size={12} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[13px] font-bold text-[#1A1A2E] dark:text-white truncate max-w-[85px] text-center">{topThree[2].name.split(' ')[0]}</h3>
                    <p className="text-[10px] text-[#8E8E93] dark:text-[#A8A398] truncate max-w-[75px] text-center mt-0.5">{topThree[2].major}</p>
                    <div className="mt-2 rounded-xl bg-[#F2F2F7] dark:bg-[#1C1C1E] px-3 py-1 flex items-center gap-1">
                      <Heart size={9} className="text-[#171717]" fill="currentColor" />
                      <span className="text-[11px] font-bold text-[#1A1A2E] dark:text-white">{topThree[2].weeklyLikes}</span>
                    </div>
                    {/* Podium block */}
                    <div className="mt-3 w-full h-12 bg-gradient-to-t from-amber-500/30 to-amber-400/10 dark:from-amber-700/30 dark:to-amber-600/10 rounded-t-2xl flex items-center justify-center border border-amber-300/30 dark:border-amber-500/20">
                      <span className="text-xl font-black text-amber-400 dark:text-amber-300">3</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Rest of Rankings ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {restRanking.length > 0 && (
              <div className="flex items-center gap-2 mb-3 px-1">
                <Sparkles size={14} className="text-[#404040]" />
                <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">{t("leaderboardLabel")}</p>
              </div>
            )}
            <div className="space-y-2">
              {restRanking.map((user, index) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#141416] p-3.5 border border-[#EBEBF0]/80 dark:border-[#262622] transition-all duration-300 hover:border-[#000000]/20 hover:shadow-[0_4px_20px_rgba(0, 0, 0,0.08)] hover:scale-[1.01] cursor-pointer animate-rankSlideIn"
                  style={{ animationDelay: `${200 + index * 60}ms` }}
                >
                  {getRankDisplay(user.rank)}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#000000] to-[#404040] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#1A1A2E] dark:text-white truncate">{user.name}</h3>
                    <p className="text-[11px] text-[#8E8E93] dark:text-[#A8A398] truncate">{user.major}</p>
                  </div>
                  <div className="rounded-xl bg-[#F2F2F7] dark:bg-[#1C1C1E] px-3 py-1.5 flex items-center gap-1.5">
                    <Heart size={10} className="text-[#171717]" fill="currentColor" />
                    <span className="text-xs font-bold text-[#1A1A2E] dark:text-white">{user.weeklyLikes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="fade-in-up flex-1 flex flex-col overflow-hidden">
          {/* ── Posts Ranking ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Flame size={14} className="text-[#171717]" />
              <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">{t("trendingPosts")}</p>
            </div>
            <div className="space-y-3">
              {postsRanking.map((post, index) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#141416] rounded-2xl border border-[#EBEBF0]/80 dark:border-[#262622] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] animate-rankSlideIn"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Post header */}
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <div className="flex items-center gap-2">
                      {getRankDisplay(post.rank)}
                    </div>
                    <div
                      className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      onClick={() => setViewingProfile(post.user.id)}
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#000000] to-[#404040] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                        {post.user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-semibold text-[#1A1A2E] dark:text-white truncate hover:text-[#000000] transition-colors">{post.user.name}</h3>
                        <p className="text-[10px] text-[#8E8E93] dark:text-[#A8A398]">{post.user.major}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Post content */}
                  <div className="px-4 pb-3">
                    <p className="text-[13px] text-[#1A1A2E] dark:text-[#E0E0F0] leading-relaxed line-clamp-3">{post.content}</p>
                  </div>

                  {/* Post image */}
                  {post.imageUrl && (
                    <div className="px-4 pb-3">
                      <div className="w-full aspect-[16/10] rounded-xl overflow-hidden">
                        <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                  
                  {/* Post footer */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] dark:bg-[#1A1A1C] border-t border-[#EBEBF0]/50 dark:border-[#262622]">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#000000] to-[#404040] rounded-xl px-3 py-1.5"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                      <Heart size={11} className="text-white" fill="currentColor" />
                      <span className="text-[11px] font-bold text-white">{t("likesCount", { count: post.likesCount })}</span>
                    </div>
                    <span className="text-[11px] text-[#C7C7CC] font-medium">
                      {new Date(post.createdAt).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Winning Post Modal ── */}
      {selectedUser && selectedUser.topPost && (
        <div
          onClick={() => setSelectedUser(null)}
          className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md modal-backdrop"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-[#141416] rounded-t-[28px] sm:rounded-[28px] sm:mx-5 overflow-hidden modal-enter"
            style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
          >
            {/* Modal header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#000000] via-[#171717] to-[#404040] px-5 py-5">
              <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/[0.06]" />
              <div className="absolute bottom-0 left-8 h-12 w-12 rounded-full bg-white/[0.04]" />
              
              <div className="relative z-10 flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{selectedUser.name}</h3>
                  <p className="text-[13px] text-white/70 font-medium">{selectedUser.major}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition-colors backdrop-blur-sm"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>

              <div className="relative z-10 mt-4 flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm rounded-2xl py-2.5">
                <Trophy size={15} className="text-yellow-300" />
                <p className="text-[13px] font-bold text-white">{t("bestPost", { count: selectedUser.topPost.likesCount })}</p>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-5">
              {selectedUser.topPost.imageUrl && (
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <img
                    src={selectedUser.topPost.imageUrl}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-[14px] text-[#1A1A2E] dark:text-[#E0E0F0] leading-relaxed whitespace-pre-wrap">
                {selectedUser.topPost.content}
              </p>
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#EBEBF0]/60 dark:border-[#262622]">
                <span className="text-[12px] text-[#C7C7CC] font-medium">
                  {new Date(selectedUser.topPost.createdAt).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#000000] to-[#404040] rounded-xl px-3 py-1.5"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                  <Heart size={12} className="text-white" fill="currentColor" />
                  <span className="text-[12px] font-bold text-white">{selectedUser.topPost.likesCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── My Rank Footer ── */}
      {rankingType === 'users' && myRank && !isInTop10 && (
        <div className="relative overflow-hidden border-t border-[#EBEBF0]/40 bg-gradient-to-r from-[#000000] to-[#404040] px-5 py-3.5">
          <div className="absolute -top-3 right-8 h-10 w-10 rounded-full bg-white/[0.06]" />
          <div className="flex items-center justify-center gap-3">
            <p className="text-[13px] text-white/80 font-medium">{t("yourRank")}</p>
            <div className="rounded-xl bg-white/20 backdrop-blur-sm px-4 py-1.5 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-white" />
              <span className="text-lg font-extrabold text-white">#{myRank.rank}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Info Footer ── */}
      <div className="border-t border-[#EBEBF0]/50 dark:border-[#262622] bg-white/80 dark:bg-[#141416]/90 backdrop-blur-sm px-5 py-2.5">
        <p className="text-[10px] text-center text-[#C7C7CC] font-medium">
          {rankingType === 'users' ? t("resetNotice") : t("trendingNotice")}
        </p>
      </div>
    </div>
  )
}
