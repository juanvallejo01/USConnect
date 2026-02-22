"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useMatch } from "./match-context"

export interface ChatMessage {
  id: number
  text: string
  sent: boolean
  time: string
}

export interface ChatUser {
  id: number
  name: string
  avatar: string
  major: string
}

export interface Conversation {
  userId: number
  messages: ChatMessage[]
}

interface ChatState {
  conversations: Map<number, ChatMessage[]>
  activeUserId: number | null
  openChat: (user: ChatUser) => boolean
  closeChat: () => void
  sendMessage: (text: string) => boolean
  getMessages: (userId: number) => ChatMessage[]
  activeUser: ChatUser | null
  canChatWith: (userId: number) => boolean
}

const ChatContext = createContext<ChatState | null>(null)

// Initial chat data for matched users
const INITIAL_CHATS: Record<number, ChatMessage[]> = {
  2: [
    { id: 1, text: "Hey! I saw you're in the CS program too?", sent: false, time: "4:30 PM" },
    { id: 2, text: "Yeah! Loving it so far. What's your focus?", sent: true, time: "4:31 PM" },
  ],
  3: [
    { id: 1, text: "Did you finish the art history essay?", sent: false, time: "11:20 AM" },
    { id: 2, text: "Almost! Just need the conclusion", sent: true, time: "11:25 AM" },
  ],
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { canChat } = useMatch()
  const [conversations, setConversations] = useState<Map<number, ChatMessage[]>>(
    new Map(Object.entries(INITIAL_CHATS).map(([k, v]) => [Number(k), v]))
  )
  const [activeUserId, setActiveUserId] = useState<number | null>(null)
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null)

  const canChatWith = useCallback(
    (userId: number): boolean => {
      // Assuming current user is ID 1
      return canChat(1, userId)
    },
    [canChat]
  )

  const openChat = useCallback(
    (user: ChatUser): boolean => {
      // Check if users are matched
      if (!canChatWith(user.id)) {
        console.warn("Cannot chat - users are not matched")
        return false
      }

      setActiveUserId(user.id)
      setActiveUser(user)
      
      // Initialize conversation if it doesn't exist
      setConversations((prev) => {
        if (!prev.has(user.id)) {
          const newMap = new Map(prev)
          newMap.set(user.id, [])
          return newMap
        }
        return prev
      })

      return true
    },
    [canChatWith]
  )

  const closeChat = useCallback(() => {
    setActiveUserId(null)
    setActiveUser(null)
  }, [])

  const sendMessage = useCallback(
    (text: string): boolean => {
      if (!text.trim() || activeUserId === null) return false

      // Double-check match status
      if (!canChatWith(activeUserId)) {
        console.warn("Cannot send message - users are not matched")
        return false
      }

      setConversations((prev) => {
        const newMap = new Map(prev)
        const messages = newMap.get(activeUserId) || []
        const newMessage: ChatMessage = {
          id: messages.length + 1,
          text: text.trim(),
          sent: true,
          time: "Now",
        }
        newMap.set(activeUserId, [...messages, newMessage])
        return newMap
      })

      return true
    },
    [activeUserId, canChatWith]
  )

  const getMessages = useCallback(
    (userId: number): ChatMessage[] => {
      return conversations.get(userId) || []
    },
    [conversations]
  )

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeUserId,
        openChat,
        closeChat,
        sendMessage,
        getMessages,
        activeUser,
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
