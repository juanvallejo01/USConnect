"use client"

import { useState, useEffect } from "react"
import { X, Heart, MessageSquare, MapPin, Calendar, Award } from "lucide-react"
import { PostCard } from "@/components/feed/post-card"
import { UserProfileSkeleton } from "@/components/profile/user-profile-skeleton"

interface UserProfileProps {
  userId: string
  onClose: () => void
}

interface UserData {
  id: string
  name: string
  email: string
  major: string
  createdAt: string
  posts: any[]
  _count: {
    posts: number
    receivedLikes: number
  }
}

export function UserProfile({ userId, onClose }: UserProfileProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'stats'>('posts')

  useEffect(() => {
    loadUserProfile()
  }, [userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error("Failed to load user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    // Optimistic update
    if (user) {
      setUser({
        ...user,
        posts: user.posts.map(p =>
          p.id === postId ? { ...p, isLiked: true, likesCount: p.likesCount + 1 } : p
        ),
      })
    }

    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
    } catch (error) {
      console.error("Failed to like post:", error)
    }
  }

  const handleUnlike = async (postId: string) => {
    if (user) {
      setUser({
        ...user,
        posts: user.posts.map(p =>
          p.id === postId ? { ...p, isLiked: false, likesCount: p.likesCount - 1 } : p
        ),
      })
    }

    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
    } catch (error) {
      console.error("Failed to unlike post:", error)
    }
  }

  const handleComment = async (postId: string, content: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  if (loading) {
    return <UserProfileSkeleton />
  }

  if (!user) {
    return null
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <div className="absolute inset-0 z-50 bg-[#F8F8FA] overflow-y-auto page-enter">
      {/* Header */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-32 bg-[#4A90D9]"></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/25 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <X size={20} className="text-white" />
        </button>

        {/* Profile info */}
        <div className="px-5 pb-5">
          <div className="flex items-end -mt-12">
            <div className="h-24 w-24 rounded-full bg-[#4A90D9] flex items-center justify-center text-white font-bold text-3xl border-4 border-white cloud-shadow-lg">
              {user.name.charAt(0)}
            </div>
          </div>

          <div className="mt-3">
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{user.name}</h1>
            <p className="text-sm text-[#8E8E93] mt-1">{user.major}</p>
            
            <div className="flex items-center gap-4 mt-3 text-sm text-[#8E8E93]">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>USC</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 pb-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-3xl p-4 cloud-shadow border border-[#EBEBF0]">
              <div className="text-2xl font-bold text-[#1A1A2E]">{user._count.posts}</div>
              <div className="text-xs text-[#8E8E93] mt-1">Posts</div>
            </div>
            <div className="bg-white rounded-3xl p-4 cloud-shadow border border-[#EBEBF0]">
              <div className="text-2xl font-bold bg-[#4A90D9] bg-clip-text text-transparent">
                {user._count.receivedLikes}
              </div>
              <div className="text-xs text-[#8E8E93] mt-1">Likes</div>
            </div>
            <div className="bg-white rounded-3xl p-4 cloud-shadow border border-[#EBEBF0]">
              <div className="flex items-center justify-center h-8">
                <Award size={20} className="text-[#4A90D9]" />
              </div>
              <div className="text-xs text-[#8E8E93] mt-1">Trojan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#EBEBF0]">
        <div className="flex px-5">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'posts'
                ? 'text-[#4A90D9]'
                : 'text-[#8E8E93] hover:text-[#1A1A2E]'
            }`}
          >
            Posts
            {activeTab === 'posts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A90D9]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'stats'
                ? 'text-[#4A90D9]'
                : 'text-[#8E8E93] hover:text-[#1A1A2E]'
            }`}
          >
            Activity
            {activeTab === 'stats' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4A90D9]"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {activeTab === 'posts' ? (
          <div className="pt-4">
            {user.posts.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {user.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={userId}
                    onLike={handleLike}
                    onUnlike={handleUnlike}
                    onComment={handleComment}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-5">
                <div className="w-16 h-16 bg-[#F2F2F7] rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare size={32} className="text-[#C7C7CC]" />
                </div>
                <p className="text-[#8E8E93] text-sm">No posts yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-4 cloud-shadow border border-[#EBEBF0]">
              <h3 className="font-semibold text-[#1A1A2E] mb-3">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Heart size={14} className="text-white" fill="white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1A1A2E]">Received {user._count.receivedLikes} likes</p>
                    <p className="text-xs text-[#8E8E93]">This week</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4A90D9] flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1A1A2E]">Posted {user._count.posts} times</p>
                    <p className="text-xs text-[#8E8E93]">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement */}
            {user._count.posts > 0 && (
              <div className="bg-white rounded-3xl p-4 cloud-shadow border border-[#EBEBF0]">
                <h3 className="font-semibold text-[#1A1A2E] mb-3">Engagement</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8E8E93]">Avg. likes per post</span>
                    <span className="text-sm font-semibold text-[#1A1A2E]">
                      {Math.round(user._count.receivedLikes / user._count.posts)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
