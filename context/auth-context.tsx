"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authApi, clearTokens, getAccessToken } from "@/lib/api-client"
import type { User, LoginRequest, RegisterRequest, LoginResponse, VerifyOtpRequest } from "@/types"

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  // Paso 1: valida credenciales. Devuelve el reto de 2FA (requiresTwoFactor)
  // en vez de dejar la sesión iniciada — el llamador debe pasar a verifyOtp.
  login: (credentials: LoginRequest) => Promise<LoginResponse>
  // Paso 2: valida el código OTP recibido por correo y sí abre la sesión.
  verifyOtp: (data: VerifyOtpRequest) => Promise<void>
  // La cuenta recién creada también pasa por el 2FA (igual que login) antes
  // de abrir sesión.
  register: (data: RegisterRequest) => Promise<LoginResponse>
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

  async function login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await authApi.login(credentials)
      // Solo hay sesión iniciada si la respuesta trae tokens (2FA saltado);
      // con el flujo normal, la respuesta es { requiresTwoFactor: true, email }
      // y el componente que llama debe continuar con verifyOtp().
      if ('accessToken' in response) {
        setUser(response.user)
      }
      return response as LoginResponse
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async function verifyOtp(data: VerifyOtpRequest) {
    try {
      const { user: verifiedUser } = await authApi.verifyOtp(data)
      setUser(verifiedUser)
    } catch (error) {
      console.error('OTP verification failed:', error)
      throw error
    }
  }

  async function register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await authApi.register(data)
      if ('accessToken' in response) {
        setUser(response.user)
      }
      return response as LoginResponse
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
        verifyOtp,
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
