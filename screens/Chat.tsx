"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, Lock } from "lucide-react"
import { UserAvatar } from "@/components/layout/user-avatar"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { useChat } from "@/context/chat-context"

export function ChatPage() {
  const { activeUser, sendMessage, closeChat, getMessages, activeUserId, canChatWith } = useChat()
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const messages = activeUserId ? getMessages(activeUserId) : []
  const canSend = activeUserId ? canChatWith(activeUserId) : false

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  if (!activeUser) {
    return null
  }

  function handleSend() {
    if (!input.trim() || !canSend) return
    const success = sendMessage(input.trim())
    if (success) {
      setInput("")
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA]">
      <div className="flex items-center gap-3 border-b border-[#EBEBF0] px-4 py-3 glass animate-slideUp">
        <button
          onClick={closeChat}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F2F2F7] transition-all duration-300 active:scale-90"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-[#1A1A2E]" />
        </button>
        <UserAvatar src={activeUser.avatar} alt={`${activeUser.name}'s avatar`} size="sm" />
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-semibold text-[#1A1A2E] truncate">{activeUser.name}</h2>
          <p className="text-xs text-[#8E8E93]">
            {canSend ? "Active now" : "Not matched yet"}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {!canSend ? (
          <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
            <div className="rounded-full bg-[#F2F2F7] p-4 mb-4">
              <Lock size={32} className="text-[#C7C7CC]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">Match Required</h3>
            <p className="text-sm text-[#8E8E93] text-center max-w-[240px]">
              You need to match with {activeUser.name} to start chatting. Both users must like each other.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {messages.map((msg, index) => (
              <div key={msg.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                <ChatBubble message={msg} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#EBEBF0] px-4 py-3 glass">
        {!canSend && (
          <div className="mb-2 rounded-full bg-[#FF9F0A]/8 border border-[#FF9F0A]/20 px-4 py-2 animate-pulse">
            <p className="text-xs text-amber-800 text-center">
              Match required to start chat
            </p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={canSend ? "Message..." : "Match required..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && canSend) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={!canSend}
            className={`flex-1 rounded-full border px-5 py-3 text-sm outline-none transition-all duration-300 ${
              canSend
                ? "border-[#EBEBF0] bg-[#F2F2F7] text-[#1A1A2E] placeholder:text-[#8E8E93] focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 focus:bg-white"
                : "border-[#EBEBF0] bg-[#F2F2F7] text-[#C7C7CC] placeholder:text-[#C7C7CC] cursor-not-allowed"
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !canSend}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4A90D9] cloud-shadow-blue transition-all duration-300 hover:shadow-lg active:scale-90 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
            aria-label="Send message"
          >
            <Send size={18} className="text-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
