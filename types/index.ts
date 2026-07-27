// Backend API Types
export interface User {
  id: string;
  name: string;
  email: string;
  major: string;
  role: 'USER' | 'ADMIN';
  likesCount: number;
  photoUrl?: string | null;
  photos?: string[];
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
  type: 'MATCH' | 'LIKE_RECEIVED';
  referenceId: string;
  read: boolean;
  createdAt: string;
  fromUser: { id: string; name: string; major: string; photoUrl?: string | null } | null;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  major: string;
  likesCount: number;
}

export type ReportReason = 'SPAM' | 'HARASSMENT' | 'FAKE_PROFILE' | 'INAPPROPRIATE_CONTENT' | 'OTHER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';
export type ReportAction = 'dismiss' | 'resolve' | 'suspend_1w' | 'suspend_1m' | 'ban';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  reportedTotalCount?: number;
  reporter?: { id: string; name: string; major: string };
  reported?: { id: string; name: string; major: string; accountStatus?: AccountStatus; suspendedUntil?: string | null };
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
