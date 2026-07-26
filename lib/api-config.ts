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
  getUserProfile: (id: string) => `/users/${id}/profile`,
  getRandomUsers: '/users/random',
  searchUsers: '/users/search',
  
  // Likes
  createLike: '/likes',
  sentLikes: '/likes/sent',
  receivedLikes: '/likes/received',
  
  // Matches
  matches: '/matches',
  unmatch: (userId: string) => `/matches/user/${userId}`,
  ephemeral: (userId: string) => `/matches/user/${userId}/ephemeral`,

  // Blocks
  blockUser: '/blocks',
  unblockUser: (userId: string) => `/blocks/${userId}`,

  // Reports
  createReport: '/reports',
  adminReports: '/admin/reports',
  resolveReport: (id: string) => `/admin/reports/${id}`,
  
  // Messages
  sendMessage: '/messages',
  conversations: '/messages/conversations',
  getConversation: (userId: string) => `/messages/conversation/${userId}`,
  reportScreenshot: (userId: string) => `/messages/screenshot/${userId}`,
  typing: (userId: string) => `/messages/typing/${userId}`,
  
  // Notifications
  notifications: '/notifications',
  unreadCount: '/notifications/unread-count',
  markAsRead: (id: string) => `/notifications/${id}/read`,
  markAllRead: '/notifications/read-all',
  
  // Leaderboard
  leaderboard: '/leaderboard',
  usersRanking: '/leaderboard/users',
  postsRanking: '/leaderboard/posts',
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
