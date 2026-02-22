"use client"

import { useState } from "react"
import { Heart, MessageSquare, ChevronDown, ChevronUp, Send } from "lucide-react"
import Image from "next/image"
import { UserAvatar } from "@/components/layout/user-avatar"
import type { FeedPost } from "@/utils/constants"

export function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const [comments, setComments] = useState(post.comments)

  function handleLike() {
    setLiked(!liked)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))
  }

  function handleAddComment() {
    if (!commentInput.trim()) return
    setComments((prev) => [
      ...prev,
      {
        id: prev.length + 10,
        name: "You",
        avatar: "/images/swipe-profile.jpg",
        text: commentInput.trim(),
        time: "Just now",
      },
    ])
    setCommentInput("")
  }

  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <UserAvatar src={post.user.avatar} alt={`${post.user.name}'s avatar`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{post.user.name}</h3>
          <p className="text-xs text-gray-500">
            {post.user.major} &middot; {post.timestamp}
          </p>
        </div>
      </div>

      <div className="px-5 pb-3">
        <p className="text-sm text-gray-900 leading-relaxed">{post.content}</p>
      </div>

      {post.image && (
        <div className="relative w-full aspect-[4/3]">
          <Image src={post.image} alt="Post image" fill className="object-cover" />
        </div>
      )}

      <InteractionRow
        liked={liked}
        likeCount={likeCount}
        connects={post.connects}
        commentCount={comments.length}
        showComments={showComments}
        onLike={handleLike}
        onToggleComments={() => setShowComments(!showComments)}
      />

      {showComments && (
        <CommentSection
          comments={comments}
          commentInput={commentInput}
          onInputChange={setCommentInput}
          onSubmit={handleAddComment}
        />
      )}
    </div>
  )
}

function InteractionRow({
  liked,
  likeCount,
  connects,
  commentCount,
  showComments,
  onLike,
  onToggleComments,
}: {
  liked: boolean
  likeCount: number
  connects: number
  commentCount: number
  showComments: boolean
  onLike: () => void
  onToggleComments: () => void
}) {
  return (
    <div className="flex items-center gap-1 px-5 py-3 border-t border-gray-200">
      <button
        onClick={onLike}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
          liked
            ? "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white"
            : "bg-gray-100 text-gray-500 hover:text-gray-900"
        }`}
      >
        <Heart size={14} fill={liked ? "currentColor" : "none"} />
        {likeCount}
      </button>
      <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
        {connects}
      </div>
      <button
        onClick={onToggleComments}
        className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors active:scale-95"
      >
        <MessageSquare size={14} />
        {commentCount}
        {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
    </div>
  )
}

function CommentSection({
  comments,
  commentInput,
  onInputChange,
  onSubmit,
}: {
  comments: { id: number; name: string; avatar: string; text: string; time: string }[]
  commentInput: string
  onInputChange: (val: string) => void
  onSubmit: () => void
}) {
  return (
    <div className="border-t border-gray-200 px-5 py-3">
      <div className="flex flex-col gap-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2.5">
            <UserAvatar src={comment.avatar} alt={`${comment.name}'s avatar`} size="xs" />
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl bg-gray-100 px-3.5 py-2.5">
                <p className="text-xs font-semibold text-gray-900">{comment.name}</p>
                <p className="text-xs text-gray-700 leading-relaxed mt-0.5">{comment.text}</p>
              </div>
              <span className="text-[10px] text-gray-500 ml-3 mt-1">{comment.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-gray-200">
        <UserAvatar src="/images/swipe-profile.jpg" alt="Your avatar" size="xs" />
        <input
          type="text"
          placeholder="Start a discussion..."
          value={commentInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onSubmit()
            }
          }}
          className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/20"
        />
        <button
          onClick={onSubmit}
          disabled={!commentInput.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] shadow-sm transition-all active:scale-90 disabled:opacity-40"
          aria-label="Send comment"
        >
          <Send size={12} className="text-white ml-0.5" />
        </button>
      </div>
    </div>
  )
}
