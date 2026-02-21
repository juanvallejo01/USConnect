"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { SPARKS_DATA, CHAT_DATA, type SparkUser, type ChatMessage } from "@/utils/constants"

type Tab = "explore" | "feed" | "sparks" | "profile"

interface SparkState {
  activeTab: Tab
  setActiveTab: (tab: Tab) => void
  sparks: SparkUser[]
  activeSparkId: number | null
  openChat: (sparkId: number) => void
  closeChat: () => void
  messages: ChatMessage[]
  sendMessage: (text: string) => void
  activeSpark: SparkUser | null
  showAdmin: boolean
  openAdmin: () => void
  closeAdmin: () => void
}

const SparkContext = createContext<SparkState | null>(null)

function buildInitialMessages(): Record<number, ChatMessage[]> {
  const map: Record<number, ChatMessage[]> = {}
  for (const [id, data] of Object.entries(CHAT_DATA)) {
    map[Number(id)] = [...data.messages]
  }
  return map
}

export function SparkProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("explore")
  const [activeSparkId, setActiveSparkId] = useState<number | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [messagesMap, setMessagesMap] = useState<Record<number, ChatMessage[]>>(buildInitialMessages)

  const openChat = useCallback((sparkId: number) => {
    const sparkExists = SPARKS_DATA.some((s) => s.id === sparkId)
    if (!sparkExists) return
    setActiveSparkId(sparkId)
  }, [])

  const closeChat = useCallback(() => {
    setActiveSparkId(null)
  }, [])

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return
    setActiveSparkId((currentId) => {
      if (currentId === null) return null
      setMessagesMap((prev) => {
        const existing = prev[currentId] || []
        const newMsg: ChatMessage = {
          id: existing.length + 1,
          text: text.trim(),
          sent: true,
          time: "Now",
        }
        return { ...prev, [currentId]: [...existing, newMsg] }
      })
      return currentId
    })
  }, [])

  const activeSpark = activeSparkId !== null
    ? SPARKS_DATA.find((s) => s.id === activeSparkId) ?? null
    : null

  const messages = activeSparkId !== null
    ? messagesMap[activeSparkId] || []
    : []

  return (
    <SparkContext.Provider
      value={{
        activeTab,
        setActiveTab,
        sparks: SPARKS_DATA,
        activeSparkId,
        openChat,
        closeChat,
        messages,
        sendMessage,
        activeSpark,
        showAdmin,
        openAdmin: () => setShowAdmin(true),
        closeAdmin: () => setShowAdmin(false),
      }}
    >
      {children}
    </SparkContext.Provider>
  )
}

export function useSpark() {
  const ctx = useContext(SparkContext)
  if (!ctx) throw new Error("useSpark must be used within SparkProvider")
  return ctx
}
