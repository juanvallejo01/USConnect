"use client"

import { GradientHeader } from "@/components/layout/gradient-header"
import { SparkCard } from "@/components/sparks/spark-card"
import { UserAvatar } from "@/components/layout/user-avatar"
import { useSpark } from "@/context/spark-context"

export function SparksPage() {
  const { sparks, openChat } = useSpark()

  const unreadSparks = sparks.filter((s) => s.unread)

  return (
    <div className="flex flex-col h-full bg-background">
      <GradientHeader
        title="Sparks"
        subtitle={`${sparks.length} connections waiting`}
      />

      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          New Sparks
        </p>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1" role="list">
          {unreadSparks.map((spark) => (
            <button
              key={spark.id}
              onClick={() => openChat(spark.id)}
              className="flex flex-col items-center gap-2 shrink-0"
              aria-label={`Open chat with ${spark.name}`}
            >
              <UserAvatar
                src={spark.avatar}
                alt={`${spark.name}'s avatar`}
                size="xl"
                gradientRing
              />
              <span className="text-xs font-medium text-foreground max-w-[64px] truncate">
                {spark.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px mx-5 bg-border" />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {sparks.map((spark) => (
            <SparkCard key={spark.id} spark={spark} onStartChat={openChat} />
          ))}
        </div>
      </div>
    </div>
  )
}
