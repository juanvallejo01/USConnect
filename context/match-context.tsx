"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Like, Match } from "@/types"
import { canLikeUser, hasMutualLikes, createMatch } from "@/utils/match"

interface MatchState {
  likes: Like[]
  matches: Match[]
  likeUser: (senderId: number, receiverId: number) => { success: boolean; matched?: boolean }
  hasLiked: (senderId: number, receiverId: number) => boolean
  canChat: (userA: number, userB: number) => boolean
  isMatched: (userA: number, userB: number) => boolean
  getLikesReceived: (userId: number) => number
  getLikesSent: (userId: number) => number
}

const MatchContext = createContext<MatchState | null>(null)

// Initial likes data for demo
const INITIAL_LIKES: Like[] = [
  { id: 1, senderId: 1, receiverId: 2, createdAt: new Date().toISOString() },
  { id: 2, senderId: 2, receiverId: 1, createdAt: new Date().toISOString() },
  { id: 3, senderId: 1, receiverId: 3, createdAt: new Date().toISOString() },
  { id: 4, senderId: 3, receiverId: 1, createdAt: new Date().toISOString() },
  { id: 5, senderId: 4, receiverId: 1, createdAt: new Date().toISOString() },
  { id: 6, senderId: 5, receiverId: 1, createdAt: new Date().toISOString() },
]

export function MatchProvider({ children }: { children: ReactNode }) {
  const [likes, setLikes] = useState<Like[]>(INITIAL_LIKES)
  const [matches, setMatches] = useState<Match[]>([])

  // Initialize matches from existing likes
  useState(() => {
    const initialMatches: Match[] = []
    INITIAL_LIKES.forEach((like) => {
      const mutualLike = INITIAL_LIKES.find(
        (l) => l.senderId === like.receiverId && l.receiverId === like.senderId
      )
      if (mutualLike) {
        const matchExists = initialMatches.some(
          (m) =>
            (m.userA === like.senderId && m.userB === like.receiverId) ||
            (m.userA === like.receiverId && m.userB === like.senderId)
        )
        if (!matchExists) {
          initialMatches.push({
            id: Date.now() + initialMatches.length,
            userA: Math.min(like.senderId, like.receiverId),
            userB: Math.max(like.senderId, like.receiverId),
            createdAt: new Date().toISOString(),
          })
        }
      }
    })
    setMatches(initialMatches)
  })

  const hasLiked = useCallback(
    (senderId: number, receiverId: number): boolean => {
      return likes.some((like) => like.senderId === senderId && like.receiverId === receiverId)
    },
    [likes]
  )

  const likeUser = useCallback(
    (senderId: number, receiverId: number): { success: boolean; matched?: boolean } => {
      // Validate like
      const validation = canLikeUser(likes, senderId, receiverId)
      if (!validation.valid) {
        console.warn(validation.reason)
        return { success: false }
      }

      const newLike: Like = {
        id: Date.now(),
        senderId,
        receiverId,
        createdAt: new Date().toISOString(),
      }

      setLikes((prev) => [...prev, newLike])

      // Check if this creates a match
      const updatedLikes = [...likes, newLike]
      const shouldMatch = hasMutualLikes(updatedLikes, senderId, receiverId)

      if (shouldMatch) {
        const newMatch = createMatch(senderId, receiverId)
        setMatches((prev) => [...prev, newMatch])
        return { success: true, matched: true }
      }

      return { success: true, matched: false }
    },
    [likes]
  )

  const isMatched = useCallback(
    (userA: number, userB: number): boolean => {
      return matches.some(
        (match) =>
          (match.userA === Math.min(userA, userB) && match.userB === Math.max(userA, userB))
      )
    },
    [matches]
  )

  const canChat = useCallback(
    (userA: number, userB: number): boolean => {
      return isMatched(userA, userB)
    },
    [isMatched]
  )

  const getLikesReceived = useCallback(
    (userId: number): number => {
      return likes.filter((like) => like.receiverId === userId).length
    },
    [likes]
  )

  const getLikesSent = useCallback(
    (userId: number): number => {
      return likes.filter((like) => like.senderId === userId).length
    },
    [likes]
  )

  return (
    <MatchContext.Provider
      value={{
        likes,
        matches,
        likeUser,
        hasLiked,
        canChat,
        isMatched,
        getLikesReceived,
        getLikesSent,
      }}
    >
      {children}
    </MatchContext.Provider>
  )
}

export function useMatch() {
  const ctx = useContext(MatchContext)
  if (!ctx) throw new Error("useMatch must be used within MatchProvider")
  return ctx
}
