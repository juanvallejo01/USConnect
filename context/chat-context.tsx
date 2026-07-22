"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { messagesApi } from "@/lib/api-client"
import { useAuth } from "./auth-context"
import { useMatch } from "./match-context"

export interface ChatMessage {
  id: string
  text: string
  sent: boolean
  time: string
}

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  major: string
}

interface ChatState {
  activeUser: ChatUser | null
  activeUserId: string | null
  messages: ChatMessage[]
  sending: boolean
  loadingMessages: boolean
  openChat: (user: ChatUser) => boolean
  closeChat: () => void
  sendMessage: (text: string) => Promise<boolean>
  canChatWith: (userId: string) => boolean
}

const ChatContext = createContext<ChatState | null>(null)

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { canChat } = useMatch()
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const canChatWith = useCallback((userId: string) => canChat(userId), [canChat])

  const loadMessages = useCallback(
    async (otherUserId: string) => {
      if (!user) return
      setLoadingMessages(true)
      try {
        const data = await messagesApi.getConversation(otherUserId)
        setMessages(
          data.map((m: { id: string; content: string; senderId: string; createdAt: string }) => ({
            id: m.id,
            text: m.content,
            sent: m.senderId === user.id,
            time: formatTime(m.createdAt),
          }))
        )
      } catch (error) {
        console.error("Failed to load conversation:", error)
        setMessages([])
      } finally {
        setLoadingMessages(false)
      }
    },
    [user]
  )

  const openChat = useCallback(
    (chatUser: ChatUser): boolean => {
      if (!canChatWith(chatUser.id)) {
        console.warn("Cannot chat - users are not matched")
        return false
      }
      setActiveUser(chatUser)
      setMessages([])
      loadMessages(chatUser.id)
      return true
    },
    [canChatWith, loadMessages]
  )

  const closeChat = useCallback(() => {
    setActiveUser(null)
    setMessages([])
  }, [])

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text.trim() || !activeUser || !canChatWith(activeUser.id)) return false
      setSending(true)
      try {
        const message = await messagesApi.sendMessage({ receiverId: activeUser.id, content: text.trim() })
        setMessages((prev) => [
          ...prev,
          { id: message.id, text: message.content, sent: true, time: formatTime(message.createdAt) },
        ])
        return true
      } catch (error) {
        console.error("Failed to send message:", error)
        return false
      } finally {
        setSending(false)
      }
    },
    [activeUser, canChatWith]
  )

  return (
    <ChatContext.Provider
      value={{
        activeUser,
        activeUserId: activeUser?.id ?? null,
        messages,
        sending,
        loadingMessages,
        openChat,
        closeChat,
        sendMessage,
        canChatWith,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}
