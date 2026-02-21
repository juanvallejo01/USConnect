"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send } from "lucide-react"
import { UserAvatar } from "@/components/layout/user-avatar"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { useSpark } from "@/context/spark-context"

export function ChatPage() {
  const { activeSpark, messages, sendMessage, closeChat } = useSpark()
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  if (!activeSpark) {
    return null
  }

  function handleSend() {
    if (!input.trim()) return
    sendMessage(input.trim())
    setInput("")
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-card/80 backdrop-blur-xl">
        <button
          onClick={closeChat}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <UserAvatar src={activeSpark.avatar} alt={`${activeSpark.name}'s avatar`} size="sm" />
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-semibold text-foreground truncate">{activeSpark.name}</h2>
          <p className="text-xs text-muted-foreground">Active now</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2.5">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      <div className="border-t border-border px-4 py-3 bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="flex-1 rounded-full border border-border bg-secondary px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary shadow-md transition-all hover:shadow-lg active:scale-90 disabled:opacity-40 disabled:shadow-none"
            aria-label="Send message"
          >
            <Send size={18} className="text-primary-foreground ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
