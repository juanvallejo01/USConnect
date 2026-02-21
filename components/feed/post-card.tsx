"use client"

import { useState } from "react"
import { Zap, MessageSquare, ChevronDown, ChevronUp, Send } from "lucide-react"
import Image from "next/image"
import { UserAvatar } from "@/components/layout/user-avatar"
import type { FeedPost } from "@/utils/constants"

export function PostCard({ post }: { post: FeedPost }) {
  const [sparked, setSparked] = useState(false)
  const [sparkCount, setSparkCount] = useState(post.sparks)
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const [comments, setComments] = useState(post.comments)

  function handleSpark() {
    setSparked(!sparked)
    setSparkCount((prev) => (sparked ? prev - 1 : prev + 1))
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
    <div className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <UserAvatar src={post.user.avatar} alt={`${post.user.name}'s avatar`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{post.user.name}</h3>
          <p className="text-xs text-muted-foreground">
            {post.user.major} &middot; {post.timestamp}
          </p>
        </div>
      </div>

      <div className="px-5 pb-3">
        <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
      </div>

      {post.image && (
        <div className="relative w-full aspect-[4/3]">
          <Image src={post.image} alt="Post image" fill className="object-cover" />
        </div>
      )}

      <InteractionRow
        sparked={sparked}
        sparkCount={sparkCount}
        connects={post.connects}
        commentCount={comments.length}
        showComments={showComments}
        onSpark={handleSpark}
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
  sparked,
  sparkCount,
  connects,
  commentCount,
  showComments,
  onSpark,
  onToggleComments,
}: {
  sparked: boolean
  sparkCount: number
  connects: number
  commentCount: number
  showComments: boolean
  onSpark: () => void
  onToggleComments: () => void
}) {
  return (
    <div className="flex items-center gap-1 px-5 py-3 border-t border-border">
      <button
        onClick={onSpark}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
          sparked
            ? "bg-gradient-to-r from-[#C62828] to-[#1565C0] text-white"
            : "bg-secondary text-muted-foreground hover:text-foreground"
        }`}
      >
        <Zap size={14} fill={sparked ? "currentColor" : "none"} />
        {sparkCount}
      </button>
      <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
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
        className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors active:scale-95"
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
    <div className="border-t border-border px-5 py-3">
      <div className="flex flex-col gap-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2.5">
            <UserAvatar src={comment.avatar} alt={`${comment.name}'s avatar`} size="xs" />
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl bg-secondary px-3.5 py-2.5">
                <p className="text-xs font-semibold text-foreground">{comment.name}</p>
                <p className="text-xs text-foreground/80 leading-relaxed mt-0.5">{comment.text}</p>
              </div>
              <span className="text-[10px] text-muted-foreground ml-3 mt-1">{comment.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-border">
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
          className="flex-1 rounded-full border border-border bg-secondary px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        <button
          onClick={onSubmit}
          disabled={!commentInput.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#C62828] to-[#1565C0] shadow-sm transition-all active:scale-90 disabled:opacity-40"
          aria-label="Send comment"
        >
          <Send size={12} className="text-white ml-0.5" />
        </button>
      </div>
    </div>
  )
}
