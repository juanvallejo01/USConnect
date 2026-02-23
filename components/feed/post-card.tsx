"use client"

import { useState } from "react"
import { Heart, MessageSquare, Send, Share2, Trash2 } from "lucide-react"
import Image from "next/image"
import { UserAvatar } from "@/components/layout/user-avatar"

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
}: { 
  post: Post
  currentUserId: string
  onLike: (postId: string) => void
  onUnlike: (postId: string) => void
  onComment: (postId: string, content: string) => void
  onDelete?: (postId: string) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  const handleLike = () => {
    if (post.isLiked) {
      onUnlike(post.id)
    } else {
      onLike(post.id)
    }
  }

  const handleAddComment = () => {
    if (!commentInput.trim()) return
    onComment(post.id, commentInput.trim())
    setCommentInput("")
  }

  const loadComments = async () => {
    if (comments.length > 0) return
    setLoadingComments(true)
    // Load comments from API
    // For now, empty
    setLoadingComments(false)
  }

  const toggleComments = () => {
    if (!showComments) {
      loadComments()
    }
    setShowComments(!showComments)
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const isOwnPost = post.user.id === currentUserId

  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <UserAvatar src="/images/swipe-profile.jpg" alt={`${post.user.name}'s avatar`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{post.user.name}</h3>
          <p className="text-xs text-gray-500">
            {post.user.major} &middot; {getRelativeTime(post.createdAt)}
          </p>
        </div>
        {isOwnPost && onDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Delete post"
          >
            <Trash2 size={16} className="text-gray-400" />
          </button>
        )}
      </div>

      <div className="px-5 pb-3">
        <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.imageUrl && (
        <div className="relative w-full aspect-[4/3]">
          <Image src={post.imageUrl} alt="Post image" fill className="object-cover" />
        </div>
      )}

      <div className="flex items-center gap-1 px-5 py-3 border-t border-gray-200">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all active:scale-95 ${
            post.isLiked
              ? "bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600"
              : "hover:bg-gray-50 text-gray-600"
          }`}
        >
          <Heart
            size={18}
            className={post.isLiked ? "fill-pink-600" : ""}
            strokeWidth={post.isLiked ? 0 : 2}
          />
          <span className="text-sm font-medium">{post.likesCount}</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-gray-50 text-gray-600 transition-all active:scale-95"
        >
          <MessageSquare size={18} />
          <span className="text-sm font-medium">{post.commentsCount}</span>
        </button>

        <div className="flex-1" />

        <button
          className="flex items-center gap-2 rounded-full px-4 py-2 hover:bg-gray-50 text-gray-600 transition-all active:scale-95"
          aria-label="Share"
        >
          <Share2 size={18} />
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-200 px-5 py-4 bg-gray-50">
          {comments.length > 0 ? (
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <UserAvatar src="/images/swipe-profile.jpg" alt={comment.user.name} size="xs" />
                  <div className="flex-1 bg-white rounded-2xl px-4 py-2 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-900">{comment.user.name}</span>
                      <span className="text-xs text-gray-400">{getRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center mb-4">No comments yet. Be the first!</p>
          )}

          <div className="flex items-center gap-2">
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
              placeholder="Add a comment..."
              className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentInput.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
