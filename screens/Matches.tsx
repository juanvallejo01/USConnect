"use client"

import { MessageCircle, Heart } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { useMatch } from "@/context/match-context"
import { GradientHeader } from "@/components/layout/gradient-header"

// Mock data - in real app this would come from backend
const MOCK_MATCHES = [
  {
    id: 2,
    name: "James Chen",
    avatar: "/images/swipe-profile.jpg",
    major: "Computer Science",
    matchedAt: "2026-02-20T15:30:00Z",
    lastMessage: "Hey! Are you going to the event?",
    lastMessageTime: "2026-02-20T16:00:00Z",
    unread: true,
  },
  {
    id: 3,
    name: "Emma Wilson",
    avatar: "/images/swipe-profile.jpg",
    major: "Art History",
    matchedAt: "2026-02-19T10:20:00Z",
    lastMessage: "Did you finish the essay?",
    lastMessageTime: "2026-02-19T11:00:00Z",
    unread: false,
  },
  {
    id: 4,
    name: "Marcus Johnson",
    avatar: "/images/swipe-profile.jpg",
    major: "Business",
    matchedAt: "2026-02-18T14:15:00Z",
    lastMessage: null,
    lastMessageTime: null,
    unread: false,
  },
]

function getRelativeTime(dateString: string): string {
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

export function MatchesPage() {
  const { openChat } = useChat()
  const { matches } = useMatch()

  const handleOpenChat = (match: typeof MOCK_MATCHES[0]) => {
    openChat({
      id: match.id,
      name: match.name,
      avatar: match.avatar,
      major: match.major,
    })
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F8FA]">
      <GradientHeader 
        title="Matches"
        subtitle={`${MOCK_MATCHES.length} ${MOCK_MATCHES.length === 1 ? 'match' : 'matches'}`}
      />

      <div className="flex-1 overflow-y-auto">
        {MOCK_MATCHES.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="rounded-full bg-[#4A90D9]/20 p-6 mb-4">
              <Heart size={48} className="text-[#4A90D9]" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">No matches yet</h3>
            <p className="text-sm text-[#8E8E93] text-center max-w-[280px]">
              Start exploring and liking profiles to find your matches!
            </p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            {MOCK_MATCHES.map((match) => (
              <button
                key={match.id}
                onClick={() => handleOpenChat(match)}
                className="w-full bg-white rounded-3xl p-4 border border-[#EBEBF0] hover:border-[#4A90D9] hover:cloud-shadow-md transition-all duration-300 active:scale-98"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={match.avatar}
                      alt={match.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-[#4A90D9]/20"
                    />
                    {match.unread && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4A90D9] rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">!</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-[#1A1A2E] truncate">
                        {match.name}
                      </h3>
                      {match.lastMessageTime && (
                        <span className="text-xs text-[#C7C7CC] whitespace-nowrap">
                          {getRelativeTime(match.lastMessageTime)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#8E8E93] mb-1.5">{match.major}</p>

                    {match.lastMessage ? (
                      <p className={`text-sm truncate ${match.unread ? 'font-semibold text-[#1A1A2E]' : 'text-[#8E8E93]'}`}>
                        {match.lastMessage}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[#4A90D9]">
                        <MessageCircle size={14} />
                        <span className="text-sm font-medium">Start chatting</span>
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
