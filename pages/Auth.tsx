"use client"

import { useState } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { GradientButton } from "@/components/layout/gradient-button"

export function AuthPage() {
  const { login, register } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [major, setMajor] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async () => {
    setError("")
    setIsLoading(true)

    try {
      if (isRegistering) {
        // Validation for registration
        if (!name.trim()) {
          setError("Name is required")
          setIsLoading(false)
          return
        }
        if (!email.trim() || !email.includes("@")) {
          setError("Valid email is required")
          setIsLoading(false)
          return
        }
        if (!password || password.length < 6) {
          setError("Password must be at least 6 characters")
          setIsLoading(false)
          return
        }
        if (!major.trim()) {
          setError("Major is required")
          setIsLoading(false)
          return
        }

        await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          major: major.trim(),
        })
      } else {
        // Validation for login
        if (!email.trim() || !password) {
          setError("Email and password are required")
          setIsLoading(false)
          return
        }

        await login({
          email: email.trim().toLowerCase(),
          password,
        })
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      const message = err?.response?.data?.message || err?.message || "Authentication failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsRegistering(!isRegistering)
    setError("")
    setEmail("")
    setPassword("")
    setName("")
    setMajor("")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-[390px] flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#3C5E82] to-[#5E82AC] shadow-lg">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4L8 12V28L20 36L32 28V12L20 4Z" fill="white" fillOpacity="0.9" />
              <path d="M20 10L14 14V26L20 30L26 26V14L20 10Z" fill="#3C5E82" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {isRegistering ? "Create Account" : "Welcome to Campus Circle"}
            </h1>
            <p className="text-sm text-gray-500">
              {isRegistering ? "Join your campus community" : "Meet your campus community"}
            </p>
          </div>
        </div>

        <div className="w-full rounded-[28px] bg-white p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col gap-5">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Name field (only for registration) */}
            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-[#3C5E82] focus:ring-2 focus:ring-[#3C5E82]/20"
                />
              </div>
            )}

            {/* Email field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="yourname@usc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-[#3C5E82] focus:ring-2 focus:ring-[#3C5E82]/20"
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRegistering ? "At least 6 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3.5 pr-12 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-[#3C5E82] focus:ring-2 focus:ring-[#3C5E82]/20"
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

            {/* Major field (only for registration) */}
            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="major" className="text-xs font-medium text-gray-500 uppercase tracking-wider pl-1">
                  Major
                </label>
                <input
                  id="major"
                  type="text"
                  placeholder="Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-[#3C5E82] focus:ring-2 focus:ring-[#3C5E82]/20"
                />
              </div>
            )}

            {/* Submit button */}
            <GradientButton 
              fullWidth 
              size="lg" 
              onClick={handleSubmit} 
              className="mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : isRegistering ? "Create Account" : "Sign In"}
            </GradientButton>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-500">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Toggle button */}
            <GradientButton 
              variant="outline" 
              fullWidth 
              size="lg"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isRegistering ? "Already have an account? Sign In" : "Create Account"}
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
