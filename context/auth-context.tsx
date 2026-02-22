"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authApi, clearTokens, getAccessToken } from "@/lib/api-client"
import type { User, LoginRequest, RegisterRequest } from "@/types"

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isLoggedIn = !!user

  // Check if user is logged in on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const token = getAccessToken()
        if (token) {
          const currentUser = await authApi.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for logout events
    const handleLogout = () => {
      setUser(null)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleLogout)
      return () => window.removeEventListener('auth:logout', handleLogout)
    }
  }, [])

  async function login(credentials: LoginRequest) {
    try {
      const { user: loggedInUser } = await authApi.login(credentials)
      setUser(loggedInUser)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function register(data: RegisterRequest) {
    try {
      const { user: newUser } = await authApi.register(data)
      setUser(newUser)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      clearTokens()
    }
  }

  async function refreshUser() {
    try {
      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoggedIn, 
        isLoading,
        login, 
        register,
        logout,
        refreshUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
