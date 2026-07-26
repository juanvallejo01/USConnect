"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Send, Lock, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { UserAvatar } from "@/components/layout/user-avatar"
import { useThemedAvatarSrc } from "@/components/layout/profile-avatar-image"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { UserProfile } from "./UserProfile"
import { useChat } from "@/context/chat-context"

export function ChatPage() {
  const t = useTranslations("chat")
  const {
    activeUser, sendMessage, closeChat, messages, activeUserId, canChatWith,
    loadingMessages, sending, ephemeralActive, ephemeralMine, togglingEphemeral, toggleEphemeral,
    otherIsTyping, notifyTyping, reportScreenshot,
  } = useChat()
  const [input, setInput] = useState("")
  const [showProfile, setShowProfile] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const avatarSrc = useThemedAvatarSrc(activeUser?.photoUrl)

  const canSend = activeUserId ? canChatWith(activeUserId) : false

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  // Best-effort screenshot heuristic: only catches the OS shortcuts that still
  // reach the page as a keydown (Windows PrintScreen, macOS Cmd+Shift+3/4/5).
  // It cannot see phone-camera photos, other capture tools, or macOS shortcuts
  // that some window managers intercept before the browser gets the event —
  // this is not equivalent to a native app's OS-level screenshot notification.
  useEffect(() => {
    if (!activeUserId) return
    let lastTrigger = 0
    function handleKeyDown(e: KeyboardEvent) {
      const isPrintScreen = e.key === "PrintScreen"
      const isMacShortcut = e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)
      if (!isPrintScreen && !isMacShortcut) return
      const now = Date.now()
      if (now - lastTrigger < 3000) return
      lastTrigger = now
      reportScreenshot()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeUserId, reportScreenshot])

  if (!activeUser) {
    return null
  }

  if (showProfile && activeUserId) {
    return <UserProfile userId={activeUserId} onClose={() => setShowProfile(false)} />
  }

  async function handleSend() {
    if (!input.trim() || !canSend || sending) return
    const text = input.trim()
    setInput("")
    const success = await sendMessage(text)
    if (!success) {
      setInput(text)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA]">
      <div className="flex items-center gap-3 border-b border-[#EBEBF0] px-4 py-3 glass animate-slideUp">
        <button
          onClick={closeChat}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F2F2F7] transition-all duration-300 active:scale-90"
          aria-label={t("goBack")}
        >
          <ArrowLeft size={20} className="text-[#1A1A2E]" />
        </button>
        <button onClick={() => setShowProfile(true)} className="shrink-0 transition-transform active:scale-90" aria-label={t("viewProfile")}>
          <UserAvatar src={avatarSrc} alt={`${activeUser.name}'s avatar`} size="sm" />
        </button>
        <div
          onClick={() => setShowProfile(true)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A2E] truncate">{activeUser.name}</h2>
          <p className={`text-xs ${otherIsTyping ? "text-[#000000] font-medium" : "text-[#8E8E93]"}`}>
            {otherIsTyping ? t("typing") : canSend ? t("activeNow") : t("notMatchedYet")}
          </p>
        </div>
        {canSend && (
          <button
            onClick={toggleEphemeral}
            disabled={togglingEphemeral}
            aria-label={t("ephemeralToggle")}
            title={t("ephemeralToggle")}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 active:scale-90 disabled:opacity-50 ${
              ephemeralActive ? "bg-[#000000] text-white" : "hover:bg-[#F2F2F7] text-[#8E8E93]"
            }`}
          >
            <Clock size={17} />
          </button>
        )}
      </div>

      {ephemeralActive && (
        <div className="px-4 pt-2">
          <div className="flex items-center gap-2 rounded-full bg-[#000000]/5 px-4 py-2">
            <Clock size={12} className="text-[#8E8E93] shrink-0" />
            <p className="text-xs text-[#8E8E93]">
              {ephemeralMine ? t("ephemeralActiveMine") : t("ephemeralActiveOther")}
            </p>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {!canSend ? (
          <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
            <div className="rounded-full bg-[#F2F2F7] p-4 mb-4">
              <Lock size={32} className="text-[#C7C7CC]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">{t("matchRequiredTitle")}</h3>
            <p className="text-sm text-[#8E8E93] text-center max-w-[240px]">
              {t("matchRequiredBody", { name: activeUser.name })}
            </p>
          </div>
        ) : loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#000000] border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <p className="text-sm text-[#8E8E93]">{t("youMatched", { name: activeUser.name })}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {messages.map((msg, index) => (
              <div key={msg.id} className="animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                <ChatBubble message={msg} otherUserName={activeUser.name} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[#EBEBF0] px-4 py-3 glass">
        {!canSend && (
          <div className="mb-2 rounded-full bg-[#FF9F0A]/8 border border-[#FF9F0A]/20 px-4 py-2 animate-pulse">
            <p className="text-xs text-amber-800 text-center">
              {t("matchRequiredBanner")}
            </p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={canSend ? t("messagePlaceholder") : t("matchRequiredPlaceholder")}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (canSend && e.target.value) notifyTyping()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && canSend) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={!canSend}
            className={`flex-1 rounded-full border px-5 py-3 text-sm outline-none transition-all duration-300 ${
              canSend
                ? "border-[#EBEBF0] bg-[#F2F2F7] text-[#1A1A2E] placeholder:text-[#8E8E93] focus:border-[#000000] focus:ring-2 focus:ring-[#000000]/20 focus:bg-white"
                : "border-[#EBEBF0] bg-[#F2F2F7] text-[#C7C7CC] placeholder:text-[#C7C7CC] cursor-not-allowed"
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !canSend || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary cloud-shadow-blue transition-all duration-300 hover:shadow-lg active:scale-90 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
            aria-label={t("sendMessage")}
          >
            <Send size={18} className="text-primary-foreground ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
