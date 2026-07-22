"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Heart } from "lucide-react"
import { useTranslations } from "next-intl"
import { useChat } from "@/context/chat-context"
import { GradientHeader } from "@/components/layout/gradient-header"
import { UserAvatar } from "@/components/layout/user-avatar"
import { messagesApi } from "@/lib/api-client"
import { formatRelativeTime } from "@/utils/relative-time"

interface ConversationEntry {
  matchId: string
  matchedUser: { id: string; name: string; major: string; likesCount: number }
  lastMessage: { content: string; createdAt: string; senderId: string } | null
  matchedAt: string
}

export function MatchesPage() {
  const t = useTranslations("matches")
  const tTime = useTranslations("time")
  const { openChat } = useChat()
  const [conversations, setConversations] = useState<ConversationEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await messagesApi.getConversations()
        if (!cancelled) setConversations(data)
      } catch (error) {
        console.error("Failed to load conversations:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleOpenChat = (entry: ConversationEntry) => {
    openChat({
      id: entry.matchedUser.id,
      name: entry.matchedUser.name,
      major: entry.matchedUser.major,
    })
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F8FA]">
      <GradientHeader
        title={t("title")}
        subtitle={loading ? t("loading") : t("matchCount", { count: conversations.length })}
      />

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#000000] border-t-transparent" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="rounded-full bg-[#000000]/20 p-6 mb-4">
              <Heart size={48} className="text-[#000000]" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{t("noMatchesYet")}</h3>
            <p className="text-sm text-[#8E8E93] text-center max-w-[280px]">
              {t("startExploring")}
            </p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            {conversations.map((entry) => (
              <button
                key={entry.matchId}
                onClick={() => handleOpenChat(entry)}
                className="w-full bg-white rounded-3xl p-4 border border-[#EBEBF0] hover:border-[#000000] hover:cloud-shadow-md transition-all duration-300 active:scale-98"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <UserAvatar alt={entry.matchedUser.name} size="lg" gradientRing />

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-[#1A1A2E] truncate">
                        {entry.matchedUser.name}
                      </h3>
                      <span className="text-xs text-[#C7C7CC] whitespace-nowrap">
                        {formatRelativeTime(entry.lastMessage?.createdAt ?? entry.matchedAt, tTime)}
                      </span>
                    </div>

                    <p className="text-xs text-[#8E8E93] mb-1.5">{entry.matchedUser.major}</p>

                    {entry.lastMessage ? (
                      <p className="text-sm truncate text-[#8E8E93]">
                        {entry.lastMessage.content}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[#000000]">
                        <MessageCircle size={14} />
                        <span className="text-sm font-medium">{t("startChatting")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
