"use client"

import { useState } from "react"
import { AlertTriangle, Eye, Trash2, ShieldCheck } from "lucide-react"
import { REPORTED_POSTS } from "@/utils/constants"

export function ModerationTab() {
  const [posts, setPosts] = useState(REPORTED_POSTS)

  function handleRemove(id: number) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Reported Content</h3>
        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
          {posts.length} pending
        </span>
      </div>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-card border border-border">
          <ShieldCheck size={40} className="text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">All clear! No pending reports.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="rounded-xl bg-card border border-border cloud-shadow p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground">{post.user}</span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    {post.reports} reports
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{post.reason}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{post.time}</span>
            </div>
            <div className="rounded-lg bg-secondary p-3 mb-3">
              <p className="text-xs text-foreground/80 leading-relaxed">{post.content}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border active:scale-95">
                <Eye size={12} /> Review
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 active:scale-95">
                <AlertTriangle size={12} /> Warn User
              </button>
              <button
                onClick={() => handleRemove(post.id)}
                className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 active:scale-95"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
