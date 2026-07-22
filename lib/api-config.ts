// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
  timeout: 30000,
  withCredentials: true,
};

export const ENDPOINTS = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  
  // Users
  me: '/users/me',
  updateProfile: '/users/me',
  deleteAccount: '/users/me',
  getUser: (id: string) => `/users/${id}`,
  getRandomUsers: '/users/random',
  searchUsers: '/users/search',
  
  // Likes
  createLike: '/likes',
  sentLikes: '/likes/sent',
  receivedLikes: '/likes/received',
  
  // Matches
  matches: '/matches',
  
  // Messages
  sendMessage: '/messages',
  conversations: '/messages/conversations',
  getConversation: (userId: string) => `/messages/conversation/${userId}`,
  
  // Notifications
  notifications: '/notifications',
  unreadCount: '/notifications/unread-count',
  markAsRead: (id: string) => `/notifications/${id}/read`,
  markAllRead: '/notifications/read-all',
  
  // Leaderboard
  leaderboard: '/leaderboard',
  myRank: '/leaderboard/my-rank',
  
  // Admin
  adminStats: '/admin/stats',
  adminUsers: '/admin/users',
  adminLeaderboard: '/admin/leaderboard',
  resetLikes: '/admin/reset-likes',
  deleteUser: (id: string) => `/admin/users/${id}`,
  
  // Health
  health: '/health',
};
