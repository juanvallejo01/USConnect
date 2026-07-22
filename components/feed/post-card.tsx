"use client"

import { useState, useRef } from "react"
import { Heart, MessageSquare, Share2, Trash2 } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { postsApi } from "@/lib/api-client"
import { formatRelativeTime } from "@/utils/relative-time"

function parseImages(imageUrl?: string): string[] {
  if (!imageUrl) return []
  try {
    const parsed = JSON.parse(imageUrl)
    if (Array.isArray(parsed)) return parsed
  } catch { /* not JSON, single URL */ }
  return [imageUrl]
}

interface Post {
  id: string
  content: string
  imageUrl?: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  user: {
    id: string
    name: string
    major: string
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    major: string
  }
}

export function PostCard({ 
  post, 
  currentUserId,
  onLike,
  onUnlike,
  onComment,
  onDelete,
  onUserClick,
}: { 
  post: Post
  currentUserId: string
  onLike: (postId: string) => void
  onUnlike: (postId: string) => void
  onComment: (postId: string, content: string) => Promise<Comment>
  onDelete?: (postId: string) => void
  onUserClick?: (userId: string) => void
}) {
  const t = useTranslations("post")
  const tTime = useTranslations("time")
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const images = parseImages(post.imageUrl)

  const handleLike = () => {
    if (post.isLiked) {
      onUnlike(post.id)
    } else {
      onLike(post.id)
    }
  }

  const [postingComment, setPostingComment] = useState(false)

  const handleAddComment = async () => {
    if (!commentInput.trim() || postingComment) return
    const content = commentInput.trim()
    setCommentInput("")
    setPostingComment(true)
    try {
      const comment = await onComment(post.id, content)
      setComments((prev) => [...prev, comment])
    } catch (error) {
      console.error("Failed to add comment:", error)
      setCommentInput(content)
    } finally {
      setPostingComment(false)
    }
  }

  const loadComments = async () => {
    setLoadingComments(true)
    try {
      const data: Comment[] = await postsApi.getComments(post.id)
      // Backend returns newest-first; show oldest-first like a normal thread
      setComments([...data].reverse())
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postsApi.deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (error) {
      console.error("Failed to delete comment:", error)
    }
  }

  const toggleComments = () => {
    if (!showComments) {
      loadComments()
    }
    setShowComments(!showComments)
  }

  const getRelativeTime = (dateString: string) => formatRelativeTime(dateString, tTime)

  const isOwnPost = post.user.id === currentUserId

  return (
    <div className="bg-white border-b border-[#EBEBF0]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          onClick={() => onUserClick?.(post.user.id)}
          className="cursor-pointer"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#000000] to-[#404040] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-[#000000]/20 transition-transform duration-300 hover:scale-105">
            {post.user.name.charAt(0)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3
            onClick={() => onUserClick?.(post.user.id)}
            className="text-[13px] font-bold text-[#1A1A2E] cursor-pointer hover:text-[#000000] transition-colors duration-200 leading-tight"
          >
            {post.user.name}
          </h3>
          <p className="text-[11px] text-[#8E8E93] leading-tight mt-0.5">
            {post.user.major} &middot; {getRelativeTime(post.createdAt)}
          </p>
        </div>
        {isOwnPost && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-2 hover:bg-[#F8F8FA] rounded-full transition-colors duration-200"
            aria-label={t("deletePost")}
          >
            <Trash2 size={16} className="text-[#C7C7CC]" />
          </button>
        )}
      </div>

      {/* Image carousel — swipeable like Instagram */}
      {images.length > 0 && (
        <div className="relative w-full">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            onScroll={(e) => {
              const el = e.currentTarget
              const index = Math.round(el.scrollLeft / el.clientWidth)
              setActiveImageIndex(index)
            }}
          >
            {images.map((url, i) => (
              <div key={i} className="relative w-full aspect-square flex-shrink-0 snap-center bg-[#F0F0F5]">
                <Image src={url} alt={`Post image ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-[6px] rounded-full transition-all duration-200 ${
                    i === activeImageIndex
                      ? "w-[6px] bg-white shadow-[0_0_4px_rgba(0,0,0,0.3)]"
                      : "w-[6px] bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
          {/* Counter badge */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
              <span className="text-[11px] font-semibold text-white">{activeImageIndex + 1}/{images.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center px-4 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 micro-press focus-ring"
          >
            <Heart
              size={24}
              className={`transition-colors duration-200 ${
                post.isLiked ? "fill-[#000000] text-[#000000] dark:fill-white dark:text-white" : "text-[#262626] hover:text-[#8E8E93]"
              }`}
              strokeWidth={post.isLiked ? 0 : 1.8}
            />
          </button>

          <button
            onClick={toggleComments}
            className="micro-press focus-ring"
          >
            <MessageSquare size={22} className="text-[#262626] hover:text-[#8E8E93] transition-colors duration-200" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `${post.user.name} en Ve!`,
                text: post.content || t("shareText"),
                url: window.location.href,
              }).catch(() => {})
            }
          }}
          className="micro-press focus-ring"
          aria-label={t("share")}
        >
          <Share2 size={22} className="text-[#262626] hover:text-[#8E8E93] transition-colors duration-200" strokeWidth={1.8} />
        </button>
      </div>

      {/* Likes count */}
      {post.likesCount > 0 && (
        <div className="px-4 pb-1">
          <p className="text-[13px] font-bold text-[#1A1A2E]">{t("likes", { count: post.likesCount })}</p>
        </div>
      )}

      {/* Content */}
      {post.content && (
        <div className="px-4 pb-2">
          <p className="text-[13px] text-[#1A1A2E] leading-[1.4]">
            <span className="font-bold">{post.user.name}</span>{" "}
            <span className="whitespace-pre-wrap font-normal">{post.content}</span>
          </p>
        </div>
      )}

      {/* View comments link */}
      {post.commentsCount > 0 && !showComments && (
        <button onClick={toggleComments} className="px-4 pb-2">
          <p className="text-[13px] text-[#8E8E93]">{t("viewAllComments", { count: post.commentsCount })}</p>
        </button>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-3">
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#000000] border-t-transparent" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-2.5 mb-3">
              {comments.map((comment) => {
                const canDelete = comment.user.id === currentUserId || isOwnPost
                return (
                  <div key={comment.id} className="flex gap-2.5 items-start group">
                    <div className="h-7 w-7 rounded-full bg-[#000000]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-[#000000]">{comment.user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#1A1A2E] leading-[1.4]">
                        <span className="font-bold">{comment.user.name}</span>{" "}
                        <span className="font-normal">{comment.content}</span>
                      </p>
                      <span className="text-[11px] text-[#C7C7CC] mt-0.5 block">{getRelativeTime(comment.createdAt)}</span>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#C7C7CC] hover:text-[#FF3B30] transition-all duration-200 flex-shrink-0"
                        aria-label={t("deleteComment")}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[13px] text-[#8E8E93] mb-3">{t("noComments")}</p>
          )}

          <div className="flex items-center gap-3 border-t border-[#EBEBF0] pt-3">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
              placeholder={t("addComment")}
              className="flex-1 bg-transparent text-[13px] text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentInput.trim() || postingComment}
              className="text-[#000000] font-bold text-[13px] micro-press focus-ring disabled:opacity-30"
            >
              {t("post")}
            </button>
          </div>
        </div>
      )}

      {/* Timestamp at bottom */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-[#C7C7CC] uppercase tracking-wide">{getRelativeTime(post.createdAt)}</p>
      </div>
    </div>
  )
}
