"use client"

import { useState, useEffect } from "react"
import { X, Heart, MessageSquare, MapPin, CalendarDays, Flag, Ban, UserX, Trophy } from "lucide-react"
import { useTranslations } from "next-intl"
import { PostCard } from "@/components/feed/post-card"
import { ProfileAvatarImage } from "@/components/layout/profile-avatar-image"
import { UserProfileSkeleton } from "@/components/profile/user-profile-skeleton"
import { postsApi, usersApi, matchesApi, blocksApi, reportsApi, leaderboardApi } from "@/lib/api-client"
import { useLocale } from "@/context/locale-context"
import { useMatch } from "@/context/match-context"
import { useChat } from "@/context/chat-context"
import type { ReportReason } from "@/types"

const RANKED_USERS_LIMIT = 100

interface UserProfileProps {
  userId: string
  onClose: () => void
}

interface UserData {
  id: string
  name: string
  email: string
  major: string
  photoUrl?: string | null
  createdAt: string
  posts: any[]
  isMatched: boolean
  blockedByMe: boolean
  blockedMe: boolean
  _count: {
    posts: number
    receivedLikes: number
  }
}

const REPORT_REASONS: ReportReason[] = ["SPAM", "HARASSMENT", "FAKE_PROFILE", "INAPPROPRIATE_CONTENT", "OTHER"]

export function UserProfile({ userId, onClose }: UserProfileProps) {
  const t = useTranslations("userProfile")
  const { locale } = useLocale()
  const { hasLiked, isMatched, likeUser, refresh: refreshMatches } = useMatch()
  const { openChat } = useChat()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'stats'>('posts')
  const [actionLoading, setActionLoading] = useState(false)
  const [showReportSheet, setShowReportSheet] = useState(false)
  const [reportReason, setReportReason] = useState<ReportReason | null>(null)
  const [reportDetails, setReportDetails] = useState("")
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportDone, setReportDone] = useState(false)
  const [weeklyRank, setWeeklyRank] = useState<number | undefined>(undefined)

  useEffect(() => {
    loadUserProfile()
  }, [userId])

  useEffect(() => {
    leaderboardApi.getUsersRanking(RANKED_USERS_LIMIT)
      .then((ranking: { id: string; rank: number }[]) => {
        setWeeklyRank(ranking.find((u) => u.id === userId)?.rank)
      })
      .catch((error) => console.error("Failed to load weekly rank:", error))
  }, [userId])

  const matched = isMatched(userId)
  const pending = !matched && hasLiked(userId)

  const handleSendMatch = async () => {
    setActionLoading(true)
    try {
      await likeUser(userId)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnmatch = async () => {
    if (!user || !confirm(t("unmatchConfirm", { name: user.name }))) return
    setActionLoading(true)
    try {
      await matchesApi.unmatch(userId)
      await refreshMatches()
    } catch (error) {
      console.error("Failed to unmatch:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (!user) return
    if (openChat({ id: user.id, name: user.name, major: user.major, photoUrl: user.photoUrl })) {
      onClose()
    }
  }

  const handleBlock = async () => {
    if (!user || !confirm(t("blockConfirm", { name: user.name }))) return
    setActionLoading(true)
    try {
      await blocksApi.blockUser(userId)
      await Promise.all([refreshMatches(), loadUserProfile()])
    } catch (error) {
      console.error("Failed to block user:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnblock = async () => {
    setActionLoading(true)
    try {
      await blocksApi.unblockUser(userId)
      await loadUserProfile()
    } catch (error) {
      console.error("Failed to unblock user:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const closeReportSheet = () => {
    if (reportSubmitting) return
    setShowReportSheet(false)
    setReportReason(null)
    setReportDetails("")
    setReportDone(false)
  }

  const handleSubmitReport = async () => {
    if (!reportReason) return
    setReportSubmitting(true)
    try {
      await reportsApi.createReport({
        reportedId: userId,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      })
      setReportDone(true)
    } catch (error) {
      console.error("Failed to submit report:", error)
    } finally {
      setReportSubmitting(false)
    }
  }

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const data = await usersApi.getUserProfile(userId)
      setUser(data)
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
    const comment = await postsApi.addComment(postId, content)
    setUser((prev) =>
      prev
        ? {
            ...prev,
            posts: prev.posts.map((p) =>
              p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
            ),
          }
        : prev
    )
    return comment
  }

  if (loading) {
    return <UserProfileSkeleton />
  }

  if (!user) {
    return null
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", { month: 'short', year: 'numeric' })
  const username = user.name.toLowerCase().replace(/\s+/g, "_")

  return (
    <div className="absolute inset-0 z-50 bg-[#F8F8FA] overflow-y-auto page-enter">
      {/* ── Banner ── */}
      <div className="relative w-full h-[110px] bg-gradient-to-br from-[#000000] via-[#171717] to-[#404040] flex-shrink-0">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all active:scale-90"
        >
          <X size={15} className="text-white" />
        </button>
      </div>

      {/* ── Avatar + info ── */}
      <div className="relative px-4 pb-3">
        {/* Avatar overlaps banner */}
        <div className="absolute -top-[46px] left-4">
          <div className="h-[90px] w-[90px] rounded-full overflow-hidden border-4 border-[#F8F8FA] cloud-shadow-lg">
            <ProfileAvatarImage photoUrl={user.photoUrl} name={user.name} size={90} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-3">
          {user.blockedByMe ? (
            <button
              onClick={handleUnblock}
              disabled={actionLoading}
              className="h-9 px-5 rounded-full border border-[#EBEBF0] bg-white text-[13px] font-bold text-[#1A1A2E] transition-all active:scale-95 disabled:opacity-50"
            >
              {t("unblock")}
            </button>
          ) : user.blockedMe ? null : (
            <>
              {matched ? (
                <>
                  <button
                    onClick={handleUnmatch}
                    disabled={actionLoading}
                    aria-label={t("unmatch")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBEBF0] bg-white transition-all active:scale-90 disabled:opacity-50"
                  >
                    <UserX size={16} className="text-[#1A1A2E]" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="h-9 px-5 rounded-full bg-primary text-primary-foreground text-[13px] font-bold transition-all active:scale-95"
                  >
                    {t("sendMessage")}
                  </button>
                </>
              ) : pending ? (
                <button
                  disabled
                  className="h-9 px-5 rounded-full border border-[#EBEBF0] bg-white text-[13px] font-bold text-[#8E8E93] opacity-70"
                >
                  {t("matchPending")}
                </button>
              ) : (
                <button
                  onClick={handleSendMatch}
                  disabled={actionLoading}
                  className="h-9 px-5 rounded-full bg-primary text-primary-foreground text-[13px] font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                  {t("sendMatch")}
                </button>
              )}
              <button
                onClick={() => setShowReportSheet(true)}
                aria-label={t("report")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBEBF0] bg-white transition-all active:scale-90"
              >
                <Flag size={15} className="text-[#1A1A2E]" />
              </button>
              <button
                onClick={handleBlock}
                disabled={actionLoading}
                aria-label={t("block")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBEBF0] bg-white transition-all active:scale-90 disabled:opacity-50"
              >
                <Ban size={15} className="text-[#1A1A2E]" />
              </button>
            </>
          )}
        </div>

        {(user.blockedByMe || user.blockedMe) && (
          <div className="mt-2 rounded-2xl bg-[#F2F2F7] px-4 py-2.5">
            <p className="text-[12px] text-[#8E8E93]">
              {user.blockedByMe ? t("blockedByMeNotice") : t("blockedMeNotice")}
            </p>
          </div>
        )}

        <div className="mt-10">
          <p className="text-[19px] font-extrabold text-[#1A1A2E] leading-tight">{user.name}</p>
          <p className="text-[14px] text-[#8E8E93] mt-0.5">@{username}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
            <span className="flex items-center gap-1 text-[13px] text-[#8E8E93]">
              <MapPin size={13} />
              {user.major}
            </span>
            <span className="flex items-center gap-1 text-[13px] text-[#8E8E93]">
              <CalendarDays size={13} />
              {t("joined", { date: joinDate })}
            </span>
            {weeklyRank && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-1"
                style={{ boxShadow: "0 2px 8px rgba(255,215,0,0.3)" }}
              >
                <Trophy size={11} className="text-yellow-900" />
                <span className="text-[11px] font-bold text-yellow-900">{t("weeklyRank", { rank: weeklyRank })}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2.5">
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-bold text-[#1A1A2E]">{user._count.posts}</span>
              <span className="text-[14px] text-[#8E8E93]">{t("posts")}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-bold text-[#1A1A2E]">{user._count.receivedLikes}</span>
              <span className="text-[14px] text-[#8E8E93]">{t("likes")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-[#EBEBF0] mt-1">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-shrink-0 px-5 py-3 text-[14px] font-semibold transition-colors border-b-[2px] ${
            activeTab === 'posts' ? "border-[#000000] text-[#000000]" : "border-transparent text-[#8E8E93]"
          }`}
        >
          {t("postsTab")}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-shrink-0 px-5 py-3 text-[14px] font-semibold transition-colors border-b-[2px] ${
            activeTab === 'stats' ? "border-[#000000] text-[#000000]" : "border-transparent text-[#8E8E93]"
          }`}
        >
          {t("activityTab")}
        </button>
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
                <p className="text-[#8E8E93] text-sm">{t("noPostsYet")}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-4 cloud-shadow border border-[#EBEBF0]">
              <h3 className="font-semibold text-[#1A1A2E] mb-3">{t("recentActivity")}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Heart size={14} className="text-white" fill="white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1A1A2E]">{t("receivedLikes", { count: user._count.receivedLikes })}</p>
                    <p className="text-xs text-[#8E8E93]">{t("thisWeek")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1A1A2E]">{t("postedTimes", { count: user._count.posts })}</p>
                    <p className="text-xs text-[#8E8E93]">{t("total")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement */}
            {user._count.posts > 0 && (
              <div className="bg-white rounded-3xl p-4 cloud-shadow border border-[#EBEBF0]">
                <h3 className="font-semibold text-[#1A1A2E] mb-3">{t("engagement")}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8E8E93]">{t("avgLikesPerPost")}</span>
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

      {/* ── Report sheet ── */}
      {showReportSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={closeReportSheet}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#EBEBF0] rounded-full mx-auto mt-4 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#EBEBF0]">
              <h3 className="text-base font-bold text-[#1A1A2E]">{t("reportTitle", { name: user.name })}</h3>
              <button
                onClick={closeReportSheet}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-[#EBEBF0] transition-all active:scale-90"
              >
                <X size={16} className="text-[#8E8E93]" />
              </button>
            </div>
            <div className="p-5 pb-8">
              {reportDone ? (
                <p className="text-sm text-[#1A1A2E] text-center py-4">{t("reportSubmitted")}</p>
              ) : (
                <>
                  <p className="text-[13px] text-[#8E8E93] mb-3">{t("reportPrompt")}</p>
                  <div className="space-y-2 mb-4">
                    {REPORT_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setReportReason(reason)}
                        className={`w-full text-left px-4 py-2.5 rounded-2xl border text-[13px] font-medium transition-all ${
                          reportReason === reason
                            ? "border-[#000000] bg-[#000000]/5 text-[#000000]"
                            : "border-[#EBEBF0] text-[#1A1A2E]"
                        }`}
                      >
                        {t(`reportReasons.${reason}`)}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmitReport}
                    disabled={!reportReason || reportSubmitting}
                    className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm transition-all active:scale-95 disabled:opacity-40"
                  >
                    {reportSubmitting ? t("reportSubmitting") : t("reportSubmit")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
