"use client"

import { useState } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/context/auth-context"
import { GradientButton } from "@/components/layout/gradient-button"
import { Logo } from "@/components/layout/logo"

export function AuthPage({ initialMode = "login" }: { initialMode?: "login" | "register" } = {}) {
  const t = useTranslations("auth")
  const { login, register } = useAuth()
  const [isRegistering, setIsRegistering] = useState(initialMode === "register")
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
        if (!name.trim()) { setError(t("errors.nameRequired")); setIsLoading(false); return }
        if (!email.trim() || !email.includes("@")) { setError(t("errors.validEmailRequired")); setIsLoading(false); return }
        if (!password || password.length < 6) { setError(t("errors.passwordLength")); setIsLoading(false); return }
        if (!major.trim()) { setError(t("errors.majorRequired")); setIsLoading(false); return }

        await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          major: major.trim(),
        })
      } else {
        if (!email.trim() || !password) { setError(t("errors.emailPasswordRequired")); setIsLoading(false); return }
        await login({ email: email.trim().toLowerCase(), password })
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      const message = err?.response?.data?.message || err?.message || t("errors.authFailed")
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

  const fillTestCredentials = () => {
    setError("")
    setEmail("student1@usc.edu")
    setPassword("UserUSC2026!")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8FA] px-6">
      <div className="w-full max-w-[390px] flex flex-col items-center gap-10 animate-fadeIn">

        {/* Logo & brand */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#0A0A0C] cloud-shadow-lg">
              <Logo size="sm" className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#34C759] border-[3px] border-[#F8F8FA]" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-[26px] font-bold tracking-tight text-[#1A1A2E]">
              {isRegistering ? t("joinTitle") : t("welcomeBackTitle")}
            </h1>
            <p className="text-sm text-[#8E8E93]">
              {isRegistering ? t("joinSubtitle") : t("welcomeBackSubtitle")}
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
                  {t("fullName")}
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder={t("fullNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#000000] focus:ring-4 focus:ring-[#000000]/10 focus:bg-white"
                />
              </div>
            )}

            {/* Quick test login */}
            {!isRegistering && (
              <button
                type="button"
                onClick={fillTestCredentials}
                className="flex items-center justify-between rounded-2xl border border-[#000000]/20 bg-[#000000]/6 px-4 py-3 text-left transition-colors duration-300 hover:bg-[#000000]/10"
              >
                <span className="text-xs font-semibold text-[#000000]">
                  {t("useTestAccount")}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#000000]/70">
                  {t("fill")}
                </span>
              </button>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#000000] focus:ring-4 focus:ring-[#000000]/10 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRegistering ? t("passwordPlaceholderRegister") : t("passwordPlaceholderLogin")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 pr-12 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#000000] focus:ring-4 focus:ring-[#000000]/10 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C7C7CC] hover:text-[#8E8E93] transition-colors duration-300"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Major */}
            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="major" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                  {t("major")}
                </label>
                <input
                  id="major"
                  type="text"
                  placeholder={t("majorPlaceholder")}
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#000000] focus:ring-4 focus:ring-[#000000]/10 focus:bg-white"
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
              {isLoading ? t("loading") : isRegistering ? t("createAccount") : t("signIn")}
            </GradientButton>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#EBEBF0]" />
              <span className="text-xs text-[#C7C7CC] font-medium">{t("or")}</span>
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
              {isRegistering ? t("toggleToSignIn") : t("createAccount")}
            </GradientButton>
          </div>
        </div>

        <p className="text-xs text-[#C7C7CC] text-center">
          {t("termsNotice")}
        </p>
      </div>
    </div>
  )
}
