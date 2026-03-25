"use client"

import { useState } from "react"
import { Heart, MessageSquare, Send, Share2, Trash2 } from "lucide-react"
import Image from "next/image"

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
  onComment: (postId: string, content: string) => void
  onDelete?: (postId: string) => void
  onUserClick?: (userId: string) => void
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
    <div className="bg-white border-b border-[#EBEBF0]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          onClick={() => onUserClick?.(post.user.id)}
          className="cursor-pointer"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4A90D9] to-[#357ABD] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-[#4A90D9]/20 transition-transform duration-300 hover:scale-105">
            {post.user.name.charAt(0)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3
            onClick={() => onUserClick?.(post.user.id)}
            className="text-[13px] font-bold text-[#1A1A2E] cursor-pointer hover:text-[#4A90D9] transition-colors duration-200 leading-tight"
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
            aria-label="Delete post"
          >
            <Trash2 size={16} className="text-[#C7C7CC]" />
          </button>
        )}
      </div>

      {/* Image — edge to edge */}
      {post.imageUrl && (
        <div className="relative w-full aspect-square bg-[#F0F0F5]">
          <Image src={post.imageUrl} alt="Post image" fill className="object-cover" />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center px-4 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 transition-all duration-200 active:scale-90"
          >
            <Heart
              size={24}
              className={`transition-colors duration-200 ${
                post.isLiked ? "fill-[#FF3B5C] text-[#FF3B5C]" : "text-[#262626] hover:text-[#8E8E93]"
              }`}
              strokeWidth={post.isLiked ? 0 : 1.8}
            />
          </button>

          <button
            onClick={toggleComments}
            className="transition-all duration-200 active:scale-90"
          >
            <MessageSquare size={22} className="text-[#262626] hover:text-[#8E8E93] transition-colors duration-200" strokeWidth={1.8} />
          </button>

          <button
            className="transition-all duration-200 active:scale-90"
            aria-label="Share"
          >
            <Send size={22} className="text-[#262626] hover:text-[#8E8E93] transition-colors duration-200 -rotate-12" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1" />

        <button
          className="transition-all duration-200 active:scale-90"
          aria-label="Save"
        >
          <Share2 size={22} className="text-[#262626] hover:text-[#8E8E93] transition-colors duration-200" strokeWidth={1.8} />
        </button>
      </div>

      {/* Likes count */}
      {post.likesCount > 0 && (
        <div className="px-4 pb-1">
          <p className="text-[13px] font-bold text-[#1A1A2E]">{post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'like' : 'likes'}</p>
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
          <p className="text-[13px] text-[#8E8E93]">View all {post.commentsCount} comments</p>
        </button>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="px-4 pb-3">
          {comments.length > 0 ? (
            <div className="space-y-2.5 mb-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 items-start">
                  <div className="h-7 w-7 rounded-full bg-[#4A90D9]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[#4A90D9]">{comment.user.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1A1A2E] leading-[1.4]">
                      <span className="font-bold">{comment.user.name}</span>{" "}
                      <span className="font-normal">{comment.content}</span>
                    </p>
                    <span className="text-[11px] text-[#C7C7CC] mt-0.5 block">{getRelativeTime(comment.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#8E8E93] mb-3">No comments yet. Be the first!</p>
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
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-[13px] text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentInput.trim()}
              className="text-[#4A90D9] font-bold text-[13px] transition-opacity duration-200 disabled:opacity-30"
            >
              Post
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
