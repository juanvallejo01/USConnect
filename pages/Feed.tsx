"use client"

import { GradientHeader } from "@/components/layout/gradient-header"
import { PostCard } from "@/components/feed/post-card"
import { FEED_POSTS } from "@/utils/constants"

export function FeedPage() {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <GradientHeader
        title="Campus Feed"
        subtitle="What's happening at USC"
        rightAction={
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm"
            aria-label="Create post"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {FEED_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
