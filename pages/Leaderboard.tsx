"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Award, Heart, TrendingUp, Users } from "lucide-react"
import { UserProfile } from "./UserProfile"
import { UserAvatar } from "@/components/layout/user-avatar"

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

type RankingType = 'users' | 'posts'

export function LeaderboardPage() {
  const [rankingType, setRankingType] = useState<RankingType>('users')
  const [usersRanking, setUsersRanking] = useState<UserRanking[]>([])
  const [postsRanking, setPostsRanking] = useState<PostRanking[]>([])
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

      const [usersRes, postsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaderboard/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaderboard/posts`, {
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
    } catch (error) {
      console.error("Failed to load rankings:", error)
    } finally {
      setLoading(false)
    }
  }

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

  const currentRanking = rankingType === 'users' ? usersRanking : []
  const topThree = currentRanking.slice(0, 3)
  const restRanking = currentRanking.slice(3)

  if (viewingProfile) {
    return <UserProfile userId={viewingProfile} onClose={() => setViewingProfile(null)} />
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] px-5 pt-12 pb-6 animate-slideUp">
        <h1 className="text-2xl font-bold text-white">Campus Rank</h1>
        <p className="text-sm text-white/80 mt-1">This week's top performers</p>
        
        {/* Toggle Tabs */}
        <div className="mt-4 flex gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1">
          <button
            onClick={() => setRankingType('users')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              rankingType === 'users'
                ? 'bg-white text-[#3C5E82] shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Users size={16} />
            Accounts
          </button>
          <button
            onClick={() => setRankingType('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              rankingType === 'posts'
                ? 'bg-white text-[#3C5E82] shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <TrendingUp size={16} />
            Top Posts
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3C5E82]"></div>
        </div>
      ) : rankingType === 'users' ? (
        <>
          {/* Users Ranking - Podium Top 3 */}
          {topThree.length > 0 && (
            <div className="px-5 py-6 bg-white border-b border-gray-200 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-end justify-center gap-3">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div 
                    onClick={() => setSelectedUser(topThree[1])}
                    className="flex flex-col items-center flex-1 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#3C5E82] to-[#5E82AC] flex items-center justify-center text-white font-bold text-lg">
                        {topThree[1].name.charAt(0)}
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-gray-300 to-gray-500 shadow-lg">
                        <Medal size={14} className="text-white" />
                      </div>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 truncate max-w-full">{topThree[1].name}</h3>
                    <p className="text-xs text-gray-500 truncate max-w-full">{topThree[1].major}</p>
                    <div className="mt-1.5 rounded-full bg-gray-100 px-3 py-1 flex items-center gap-1">
                      <Heart size={10} className="text-gray-600" fill="currentColor" />
                      <p className="text-xs font-bold text-gray-700">{topThree[1].weeklyLikes} Likes</p>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <div 
                    onClick={() => setSelectedUser(topThree[0])}
                    className="flex flex-col items-center flex-1 -mt-4 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-2xl animate-pulse">
                        {topThree[0].name.charAt(0)}
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg">
                        <Trophy size={16} className="text-white" />
                      </div>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-gray-900 truncate max-w-full">{topThree[0].name}</h3>
                    <p className="text-xs text-gray-500 truncate max-w-full">{topThree[0].major}</p>
                    <div className="mt-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 shadow-md flex items-center gap-1">
                      <Heart size={10} className="text-white" fill="currentColor" />
                      <p className="text-xs font-bold text-white">{topThree[0].weeklyLikes} Likes</p>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div 
                    onClick={() => setSelectedUser(topThree[2])}
                    className="flex flex-col items-center flex-1 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#3C5E82] to-[#5E82AC] flex items-center justify-center text-white font-bold text-lg">
                        {topThree[2].name.charAt(0)}
                      </div>
                      <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg">
                        <Award size={14} className="text-white" />
                      </div>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 truncate max-w-full">{topThree[2].name}</h3>
                    <p className="text-xs text-gray-500 truncate max-w-full">{topThree[2].major}</p>
                    <div className="mt-1.5 rounded-full bg-gray-100 px-3 py-1 flex items-center gap-1">
                      <Heart size={10} className="text-gray-600" fill="currentColor" />
                      <p className="text-xs font-bold text-gray-700">{topThree[2].weeklyLikes} Likes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rest of Users Rankings */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-2">
              {restRanking.map((user, index) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer animate-fadeIn"
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3C5E82] to-[#5E82AC] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{user.major}</p>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] px-3 py-1.5 flex items-center gap-1">
                    <Heart size={10} className="text-white" fill="currentColor" />
                    <p className="text-xs font-bold text-white">{user.weeklyLikes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Posts Ranking */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {postsRanking.map((post, index) => (
                <div
                  key={post.id}
                  className="bg-white p-4 transition-all duration-300 hover:bg-gray-50 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                      {getRankIcon(post.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="flex items-center gap-2 mb-2 cursor-pointer"
                        onClick={() => setViewingProfile(post.user.id)}
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#3C5E82] to-[#5E82AC] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {post.user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 hover:underline">{post.user.name}</h3>
                          <p className="text-xs text-gray-500">{post.user.major}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-900 leading-relaxed line-clamp-3">{post.content}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="rounded-full bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] px-3 py-1 flex items-center gap-1">
                          <Heart size={10} className="text-white" fill="currentColor" />
                          <p className="text-xs font-bold text-white">{post.likesCount} Likes</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* User's Winning Post Modal */}
      {selectedUser && selectedUser.topPost && (
        <div 
          onClick={() => setSelectedUser(null)}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative mx-5 w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-scaleIn"
          >
            <div className="bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-[#3C5E82] font-bold text-xl flex-shrink-0">
                  {selectedUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-white/80">{selectedUser.major}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl py-2">
                <Trophy size={16} className="text-yellow-300" />
                <p className="text-sm font-bold text-white">Winning Post - {selectedUser.topPost.likesCount} Likes</p>
              </div>
            </div>
            
            <div className="p-5">
              {selectedUser.topPost.imageUrl && (
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4">
                  <img 
                    src={selectedUser.topPost.imageUrl} 
                    alt="Post" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {selectedUser.topPost.content}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(selectedUser.topPost.createdAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <Heart size={12} className="text-red-500" fill="currentColor" />
                  <span className="font-semibold">{selectedUser.topPost.likesCount} likes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="border-t border-gray-200 bg-white px-5 py-3">
        <p className="text-xs text-center text-gray-500">
          {rankingType === 'users' 
            ? 'Rankings based on total likes received this week'
            : 'Top posts by likes this week'}
        </p>
      </div>
    </div>
  )
}
