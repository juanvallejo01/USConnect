// Backend API Types
export interface User {
  id: string;
  name: string;
  email: string;
  major: string;
  role: 'USER' | 'ADMIN';
  likesCount: number;
  createdAt: string;
  avatar?: string; // For frontend display
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  major: string;
}

export interface Like {
  id: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export interface Match {
  id: string;
  matchedUser: User;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
  };
}

export interface Conversation {
  matchId: string;
  matchedUser: User;
  lastMessage?: Message;
  matchedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'MATCH';
  referenceId: string;
  read: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  major: string;
  likesCount: number;
}

export interface AdminStats {
  totalUsers: number;
  totalLikes: number;
  totalMatches: number;
  totalMessages: number;
  activeUsers: number;
  matchRate: number;
}

// Legacy types for backwards compatibility (if needed)
export interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
}
