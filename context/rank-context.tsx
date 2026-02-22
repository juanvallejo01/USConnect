"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useMatch } from "./match-context"
import { User } from "@/types"
import { getTopUsers as getTopRankedUsers, getUserRank as calculateUserRank, type RankedUser } from "@/utils/rank"

interface RankState {
  getTopUsers: (limit: number) => RankedUser[]
  getUserRank: (userId: number) => { rank: number; likesReceived: number }
  averageLikes: number
}

const RankContext = createContext<RankState | null>(null)

// Base user data
const BASE_USERS: User[] = [
  { id: 1, name: "Sarah Miller", avatar: "/images/profile-1.jpg", major: "Film Production", year: "Junior", bio: "Film enthusiast", interests: ["Movies", "Photography"] },
  { id: 2, name: "James Chen", avatar: "/images/profile-2.jpg", major: "Computer Science", year: "Senior", bio: "Code lover", interests: ["Programming", "Gaming"] },
  { id: 3, name: "Emily Davis", avatar: "/images/profile-3.jpg", major: "Art History", year: "Sophomore", bio: "Art collector", interests: ["Art", "Museums"] },
  { id: 4, name: "Alex Rivera", avatar: "/images/profile-4.jpg", major: "Business Administration", year: "Junior", bio: "Entrepreneur", interests: ["Business", "Startups"] },
  { id: 5, name: "Jordan Lee", avatar: "/images/profile-5.jpg", major: "Psychology", year: "Senior", bio: "Mind explorer", interests: ["Psychology", "Reading"] },
  { id: 6, name: "Taylor Kim", avatar: "/images/profile-6.jpg", major: "Engineering", year: "Sophomore", bio: "Builder", interests: ["Engineering", "Robotics"] },
  { id: 7, name: "Morgan Blake", avatar: "/images/profile-7.jpg", major: "Communications", year: "Junior", bio: "Storyteller", interests: ["Writing", "Public Speaking"] },
  { id: 8, name: "Casey Park", avatar: "/images/profile-8.jpg", major: "Biology", year: "Senior", bio: "Nature lover", interests: ["Biology", "Hiking"] },
  { id: 9, name: "Riley Scott", avatar: "/images/profile-9.jpg", major: "Economics", year: "Sophomore", bio: "Market analyst", interests: ["Economics", "Finance"] },
  { id: 10, name: "Drew Martinez", avatar: "/images/profile-10.jpg", major: "Political Science", year: "Junior", bio: "Policy advocate", interests: ["Politics", "Debate"] },
  { id: 11, name: "Quinn Anderson", avatar: "/images/profile-11.jpg", major: "Mathematics", year: "Senior", bio: "Problem solver", interests: ["Math", "Chess"] },
  { id: 12, name: "Avery Thompson", avatar: "/images/profile-12.jpg", major: "Chemistry", year: "Sophomore", bio: "Lab enthusiast", interests: ["Chemistry", "Science"] },
]

export function RankProvider({ children }: { children: ReactNode }) {
  const { likes } = useMatch()

  const getTopUsers = (limit: number): RankedUser[] => {
    return getTopRankedUsers(BASE_USERS, likes, limit)
  }

  const getUserRank = (userId: number): { rank: number; likesReceived: number } => {
    return calculateUserRank(userId, BASE_USERS, likes)
  }

  const averageLikes = likes.length / BASE_USERS.length

  return (
    <RankContext.Provider
      value={{
        getTopUsers,
        getUserRank,
        averageLikes,
      }}
    >
      {children}
    </RankContext.Provider>
  )
}

export function useRank() {
  const ctx = useContext(RankContext)
  if (!ctx) throw new Error("useRank must be used within RankProvider")
  return ctx
}
