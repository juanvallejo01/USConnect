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
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-xl animate-slideUp">
        <button
          onClick={closeChat}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-300 active:scale-90"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-gray-900" />
        </button>
        <UserAvatar src={activeUser.avatar} alt={`${activeUser.name}'s avatar`} size="sm" />
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-semibold text-gray-900 truncate">{activeUser.name}</h2>
          <p className="text-xs text-gray-500">
            {canSend ? "Active now" : "Not matched yet"}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {!canSend ? (
          <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Lock size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Match Required</h3>
            <p className="text-sm text-gray-500 text-center max-w-[240px]">
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

      <div className="border-t border-gray-200 px-4 py-3 bg-white/80 backdrop-blur-xl">
        {!canSend && (
          <div className="mb-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-2 animate-pulse">
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
                ? "border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:border-[#3C5E82] focus:ring-2 focus:ring-[#3C5E82]/20 focus:bg-white"
                : "border-gray-200 bg-gray-100 text-gray-400 placeholder:text-gray-400 cursor-not-allowed"
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !canSend}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] shadow-md transition-all duration-300 hover:shadow-lg active:scale-90 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
            aria-label="Send message"
          >
            <Send size={18} className="text-white ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
