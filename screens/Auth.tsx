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
        if (!name.trim()) { setError("Name is required"); setIsLoading(false); return }
        if (!email.trim() || !email.includes("@")) { setError("Valid email is required"); setIsLoading(false); return }
        if (!password || password.length < 6) { setError("Password must be at least 6 characters"); setIsLoading(false); return }
        if (!major.trim()) { setError("Major is required"); setIsLoading(false); return }

        await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          major: major.trim(),
        })
      } else {
        if (!email.trim() || !password) { setError("Email and password are required"); setIsLoading(false); return }
        await login({ email: email.trim().toLowerCase(), password })
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8FA] px-6">
      <div className="w-full max-w-[390px] flex flex-col items-center gap-10 animate-fadeIn">
        
        {/* Logo & brand */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#4A90D9] cloud-shadow-blue">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4L8 12V28L20 36L32 28V12L20 4Z" fill="white" fillOpacity="0.9" />
                <path d="M20 10L14 14V26L20 30L26 26V14L20 10Z" fill="#4A90D9" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#34C759] border-[3px] border-[#F8F8FA]" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-[26px] font-bold tracking-tight text-[#1A1A2E]">
              {isRegistering ? "Join Campus Circle" : "Welcome back"}
            </h1>
            <p className="text-sm text-[#8E8E93]">
              {isRegistering ? "Create your account to get started" : "Sign in to your campus community"}
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="w-full rounded-[28px] bg-white p-7 cloud-shadow-md">
          <div className="flex flex-col gap-5">
            
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-[#FF3B30]/8 border border-[#FF3B30]/15 px-4 py-3 text-sm text-[#FF3B30] animate-fadeIn">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 focus:bg-white"
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="yourname@usc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRegistering ? "At least 6 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 pr-12 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C7C7CC] hover:text-[#8E8E93] transition-colors duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Major */}
            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="major" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                  Major
                </label>
                <input
                  id="major"
                  type="text"
                  placeholder="Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#4A90D9] focus:ring-4 focus:ring-[#4A90D9]/10 focus:bg-white"
                />
              </div>
            )}

            {/* Submit */}
            <GradientButton 
              fullWidth 
              size="lg" 
              onClick={handleSubmit} 
              className="mt-1"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : isRegistering ? "Create Account" : "Sign In"}
            </GradientButton>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#EBEBF0]" />
              <span className="text-xs text-[#C7C7CC] font-medium">or</span>
              <div className="h-px flex-1 bg-[#EBEBF0]" />
            </div>

            {/* Toggle */}
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

        <p className="text-xs text-[#C7C7CC] text-center">
          {"By continuing, you agree to our Terms of Service"}
        </p>
      </div>
    </div>
  )
}
