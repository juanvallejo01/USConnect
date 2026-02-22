"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { GradientButton } from "@/components/layout/gradient-button"

export function AuthPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-[390px] flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] shadow-lg">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4L8 12V28L20 36L32 28V12L20 4Z" fill="white" fillOpacity="0.9" />
              <path d="M20 10L14 14V26L20 30L26 26V14L20 10Z" fill="#8B5CF6" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome to Campus Circle</h1>
            <p className="text-sm text-gray-500">Meet your campus community</p>
          </div>
        </div>

        <div className="w-full rounded-[28px] bg-white p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">Email</label>
              <input
                id="email"
                type="email"
                placeholder="yourname@usc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3.5 pr-12 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <GradientButton fullWidth size="lg" onClick={login} className="mt-2">
              Sign In
            </GradientButton>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-500">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <GradientButton variant="outline" fullWidth size="lg">
              Create Account
            </GradientButton>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {"By continuing, you agree to our Terms of Service"}
        </p>
      </div>
    </div>
  )
}
