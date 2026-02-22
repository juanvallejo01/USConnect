import { User, Like } from "@/types"

export interface RankedUser {
  user: User
  likesReceived: number
  rank: number
  // Flatten user properties for easier access
  id: number
  name: string
  avatar: string
  major: string
}

/**
 * Calculate likes received for a specific user
 */
export function calculateLikesReceived(userId: number, likes: Like[]): number {
  return likes.filter((like) => like.receiverId === userId).length
}

/**
 * Get top users sorted by likes received
 */
export function getTopUsers(
  users: User[],
  likes: Like[],
  limit: number = 10
): RankedUser[] {
  const rankedUsers = users.map((user) => ({
    user,
    likesReceived: calculateLikesReceived(user.id, likes),
    rank: 0,
    // Flatten properties
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    major: user.major,
  }))

  // Sort by likes received (descending)
  rankedUsers.sort((a, b) => b.likesReceived - a.likesReceived)

  // Assign ranks
  rankedUsers.forEach((rankedUser, index) => {
    rankedUser.rank = index + 1
  })

  return rankedUsers.slice(0, limit)
}

/**
 * Get rank for a specific user
 */
export function getUserRank(
  userId: number,
  users: User[],
  likes: Like[]
): { rank: number; likesReceived: number } {
  const allRanked = getTopUsers(users, likes, users.length)
  const userRank = allRanked.find((r) => r.user.id === userId)

  return {
    rank: userRank?.rank ?? users.length,
    likesReceived: userRank?.likesReceived ?? 0,
  }
}
