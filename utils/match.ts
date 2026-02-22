import { Like, Match } from "@/types"

/**
 * Check if a match exists between two users
 */
export function findMatch(
  matches: Match[],
  userA: number,
  userB: number
): Match | undefined {
  return matches.find(
    (m) =>
      (m.userA === userA && m.userB === userB) ||
      (m.userA === userB && m.userB === userA)
  )
}

/**
 * Check if both users have liked each other
 */
export function hasMutualLikes(
  likes: Like[],
  userA: number,
  userB: number
): boolean {
  const userALikesB = likes.some((l) => l.senderId === userA && l.receiverId === userB)
  const userBLikesA = likes.some((l) => l.senderId === userB && l.receiverId === userA)
  return userALikesB && userBLikesA
}

/**
 * Create a new match between two users
 */
export function createMatch(userA: number, userB: number): Match {
  return {
    id: Date.now(),
    userA,
    userB,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Validate if a user can like another user
 */
export function canLikeUser(
  likes: Like[],
  senderId: number,
  receiverId: number
): { valid: boolean; reason?: string } {
  // Cannot like yourself
  if (senderId === receiverId) {
    return { valid: false, reason: "Cannot like yourself" }
  }

  // Check if already liked
  const alreadyLiked = likes.some(
    (l) => l.senderId === senderId && l.receiverId === receiverId
  )
  if (alreadyLiked) {
    return { valid: false, reason: "Already liked this user" }
  }

  return { valid: true }
}
