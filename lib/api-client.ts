import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, ENDPOINTS } from './api-config';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Helper functions
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  
  // Store in localStorage for persistence
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
}

export function getAccessToken() {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

export function getRefreshToken() {
  if (!refreshToken && typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('refreshToken');
  }
  return refreshToken;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = getRefreshToken();
        
        if (!refresh) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh token
        const response = await axios.post(
          `${API_CONFIG.baseURL}${ENDPOINTS.refresh}`,
          { refreshToken: refresh },
          { withCredentials: true }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        
        setTokens(newAccessToken, newRefreshToken);
        onTokenRefreshed(newAccessToken);
        
        isRefreshing = false;

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        isRefreshing = false;
        clearTokens();
        
        // Trigger logout event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    major: string;
  }) => {
    const response = await api.post(ENDPOINTS.register, data);
    const { user, accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post(ENDPOINTS.login, data);
    const { user, accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);
    return { user, accessToken, refreshToken };
  },

  logout: async () => {
    try {
      const refresh = getRefreshToken();
      await api.post(ENDPOINTS.logout, { refreshToken: refresh });
    } finally {
      clearTokens();
    }
  },

  getCurrentUser: async () => {
    const response = await api.get(ENDPOINTS.me);
    return response.data;
  },
};

export const usersApi = {
  getProfile: async () => {
    const response = await api.get(ENDPOINTS.me);
    return response.data;
  },

  updateProfile: async (data: { name?: string; major?: string }) => {
    const response = await api.put(ENDPOINTS.updateProfile, data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete(ENDPOINTS.deleteAccount);
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(ENDPOINTS.getUser(id));
    return response.data;
  },

  getRandomUsers: async (limit?: number) => {
    const response = await api.get(ENDPOINTS.getRandomUsers, {
      params: { limit },
    });
    return response.data;
  },
};

export const likesApi = {
  createLike: async (receiverId: string) => {
    const response = await api.post(ENDPOINTS.createLike, { receiverId });
    return response.data;
  },

  getSentLikes: async () => {
    const response = await api.get(ENDPOINTS.sentLikes);
    return response.data;
  },

  getReceivedLikes: async () => {
    const response = await api.get(ENDPOINTS.receivedLikes);
    return response.data;
  },
};

export const matchesApi = {
  getMatches: async () => {
    const response = await api.get(ENDPOINTS.matches);
    return response.data;
  },
};

export const messagesApi = {
  sendMessage: async (data: { receiverId: string; content: string }) => {
    const response = await api.post(ENDPOINTS.sendMessage, data);
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get(ENDPOINTS.conversations);
    return response.data;
  },

  getConversation: async (userId: string) => {
    const response = await api.get(ENDPOINTS.getConversation(userId));
    return response.data;
  },
};

export const notificationsApi = {
  getNotifications: async () => {
    const response = await api.get(ENDPOINTS.notifications);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get(ENDPOINTS.unreadCount);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(ENDPOINTS.markAsRead(id));
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.patch(ENDPOINTS.markAllRead);
    return response.data;
  },
};

export const leaderboardApi = {
  getLeaderboard: async (limit?: number) => {
    const response = await api.get(ENDPOINTS.leaderboard, {
      params: { limit },
    });
    return response.data;
  },

  getMyRank: async () => {
    const response = await api.get(ENDPOINTS.myRank);
    return response.data;
  },
};

export const adminApi = {
  getStats: async () => {
    const response = await api.get(ENDPOINTS.adminStats);
    return response.data;
  },

  getUsers: async (page?: number, limit?: number) => {
    const response = await api.get(ENDPOINTS.adminUsers, {
      params: { page, limit },
    });
    return response.data;
  },

  getLeaderboard: async (limit?: number) => {
    const response = await api.get(ENDPOINTS.adminLeaderboard, {
      params: { limit },
    });
    return response.data;
  },

  resetLikes: async () => {
    const response = await api.post(ENDPOINTS.resetLikes);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(ENDPOINTS.deleteUser(id));
    return response.data;
  },
};

export default api;
