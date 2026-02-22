export interface User {
  id: number
  name: string
  avatar: string
  major: string
  year: string
  bio: string
  interests: string[]
}

export interface Post {
  id: number
  userId: number
  content: string
  imageUrl?: string
  likes: number
  comments: number
  createdAt: string
}

export interface Like {
  id: number
  senderId: number
  receiverId: number
  createdAt: string
}

export interface Match {
  id: number
  userA: number
  userB: number
  createdAt: string
}

export interface Message {
  id: number
  senderId: number
  receiverId: number
  text: string
  createdAt: string
  read: boolean
}

export interface Notification {
  id: number
  userId: number
  type: "match"
  matchedWithId: number
  matchedWithName: string
  matchedWithAvatar: string
  read: boolean
  createdAt: string
}
