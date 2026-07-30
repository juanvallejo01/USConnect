"use client"

import { useState } from "react"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/context/auth-context"
import { authApi } from "@/lib/api-client"
import { GradientButton } from "@/components/layout/gradient-button"
import { Logo } from "@/components/layout/logo"
import { FACULTIES, FACULTY_NAMES } from "@/utils/faculties"

export function AuthPage({ initialMode = "login" }: { initialMode?: "login" | "register" } = {}) {
  const t = useTranslations("auth")
  const { login, verifyOtp, register } = useAuth()
  const [isRegistering, setIsRegistering] = useState(initialMode === "register")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [nickname, setNickname] = useState("")
  const [faculty, setFaculty] = useState("")
  const [major, setMajor] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Paso 2FA y recuperación de contraseña
  const [step, setStep] = useState<"credentials" | "otp" | "forgot" | "reset">("credentials")
  const [otpEmail, setOtpEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [otpMessage, setOtpMessage] = useState("")
  const [isResending, setIsResending] = useState(false)

  // Tanto login como register (cuenta recién creada) pasan por el mismo
  // reto de 2FA — si la respuesta lo pide, se muestra el paso de código.
  const goToOtpStepIfNeeded = (response: Awaited<ReturnType<typeof login>>) => {
    if ("requiresTwoFactor" in response) {
      setOtpEmail(response.email)
      setOtpMessage(response.message)
      setOtpCode("")
      setStep("otp")
    }
  }

  const handleSubmit = async () => {
    setError("")
    setIsLoading(true)

    try {
      if (isRegistering) {
        if (!name.trim()) { setError(t("errors.nameRequired")); setIsLoading(false); return }
        if (!email.trim() || !email.includes("@")) { setError(t("errors.validEmailRequired")); setIsLoading(false); return }
        if (!password || password.length < 6) { setError(t("errors.passwordLength")); setIsLoading(false); return }
        if (!major.trim()) { setError(t("errors.majorRequired")); setIsLoading(false); return }

        const response = await register({
          name: name.trim(),
          nickname: nickname.trim() || undefined,
          email: email.trim().toLowerCase(),
          password,
          major: major.trim(),
        })
        goToOtpStepIfNeeded(response)
      } else {
        if (!email.trim() || !password) { setError(t("errors.emailPasswordRequired")); setIsLoading(false); return }
        const response = await login({ email: email.trim().toLowerCase(), password })
        goToOtpStepIfNeeded(response)
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      const message = err?.response?.data?.message || err?.message || t("errors.authFailed")
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError("")
    const code = otpCode.trim()
    if (!/^\d{6}$/.test(code)) { setError(t("errors.otpInvalid")); return }

    setIsLoading(true)
    try {
      await verifyOtp({ email: otpEmail, code })
    } catch (err: any) {
      console.error("OTP verification error:", err)
      const message = err?.response?.data?.message || err?.message || t("errors.authFailed")
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError("")
    setIsResending(true)
    try {
      // Volver a llamar a login con las mismas credenciales genera y envía
      // un código nuevo (el backend invalida el anterior automáticamente).
      const response = await login({ email: otpEmail, password })
      if ("requiresTwoFactor" in response) {
        setOtpCode("")
        setOtpMessage(t("otp.resendSuccess"))
      }
    } catch (err: any) {
      console.error("Resend OTP error:", err)
      const message = err?.response?.data?.message || err?.message || t("errors.authFailed")
      setError(message)
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToCredentials = () => {
    setStep("credentials")
    setOtpCode("")
    setError("")
    setOtpMessage("")
  }

  const handleForgotPassword = async () => {
    setError("")
    if (!email.trim() || !email.includes("@")) { setError(t("errors.validEmailRequired") || "Correo inválido"); return }
    setIsLoading(true)
    try {
      const res = await authApi.forgotPassword({ email: email.trim().toLowerCase() })
      setOtpEmail(email.trim().toLowerCase())
      setOtpMessage(res.message || "Revisa tu correo para obtener el código.")
      setStep("reset")
    } catch (err: any) {
      console.error("Forgot password error:", err)
      const message = err?.response?.data?.message || err?.message || "Ocurrió un error al solicitar el restablecimiento."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError("")
    const code = otpCode.trim()
    if (!/^\d{6}$/.test(code)) { setError(t("errors.otpInvalid") || "Código inválido"); return }
    if (!password || password.length < 6) { setError(t("errors.passwordLength") || "La contraseña debe tener al menos 6 caracteres"); return }

    setIsLoading(true)
    try {
      const res = await authApi.resetPassword({ email: otpEmail, code, newPassword: password })
      setError("")
      setOtpMessage(res.message || "Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.")
      setTimeout(() => {
        handleBackToCredentials()
      }, 3000)
    } catch (err: any) {
      console.error("Reset password error:", err)
      const message = err?.response?.data?.message || err?.message || "Ocurrió un error al restablecer la contraseña."
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
    setNickname("")
    setFaculty("")
    setMajor("")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8FA] px-6">
      <div className="w-full max-w-[390px] flex flex-col items-center gap-10 animate-fadeIn">

        {/* Logo & brand */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#0A0A0C] shadow-[0_8px_30px_rgb(251,191,36,0.15)]">
              <Logo size="sm" className="text-[#fbbf24]" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#fbbf24] border-[3px] border-[#F8F8FA] shadow-[0_0_10px_rgb(251,191,36,0.4)]" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-[26px] font-bold tracking-tight text-[#1A1A2E]">
              {step === "otp" ? t("otp.title") 
               : step === "forgot" ? "Recuperar contraseña"
               : step === "reset" ? "Restablecer contraseña"
               : isRegistering ? t("joinTitle") : t("welcomeBackTitle")}
            </h1>
            <p className="text-sm text-[#8E8E93] text-center">
              {step === "otp" || step === "reset"
                ? (otpMessage || t("otp.subtitleFallback", { email: otpEmail }))
                : step === "forgot" ? "Ingresa tu correo para recibir un código de recuperación."
                : isRegistering ? t("joinSubtitle") : t("welcomeBackSubtitle")}
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

            {step === "otp" ? (
              <>
                {/* Código OTP */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="otp" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                    {t("otp.codeLabel")}
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder={t("otp.codePlaceholder")}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => { if (e.key === "Enter") handleVerifyOtp() }}
                    autoFocus
                    className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-center text-2xl font-bold tracking-[0.4em] text-[#1A1A2E] placeholder:text-[#C7C7CC] placeholder:tracking-[0.4em] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
                  />
                </div>

                <GradientButton
                  fullWidth
                  size="lg"
                  onClick={handleVerifyOtp}
                  className="mt-1 !from-[#fbbf24] !to-[#f59e0b] !text-[#0A0A0C] hover:!from-[#f59e0b] hover:!to-[#d97706] shadow-[0_8px_20px_rgb(251,191,36,0.3)]"
                  disabled={isLoading}
                >
                  {isLoading ? t("otp.verifying") : t("otp.verifyButton")}
                </GradientButton>

                <div className="flex items-center justify-center gap-4 text-sm">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending || isLoading}
                    className="font-semibold text-[#d97706] transition-colors hover:text-[#b45309] disabled:opacity-50"
                  >
                    {isResending ? t("otp.resending") : t("otp.resendButton")}
                  </button>
                  <span className="text-[#EBEBF0]">•</span>
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    disabled={isLoading}
                    className="font-semibold text-[#8E8E93] transition-colors hover:text-[#1A1A2E]"
                  >
                    {t("otp.back")}
                  </button>
                </div>
              </>
            ) : step === "reset" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="resetCode" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                    Código de recuperación
                  </label>
                  <input
                    id="resetCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    autoFocus
                    className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-center text-2xl font-bold tracking-[0.4em] text-[#1A1A2E] placeholder:text-[#C7C7CC] placeholder:tracking-[0.4em] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="newPassword" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nueva contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleResetPassword() }}
                      className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 pr-12 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C7C7CC] hover:text-[#8E8E93] transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <GradientButton
                  fullWidth
                  size="lg"
                  onClick={handleResetPassword}
                  className="mt-1 !from-[#fbbf24] !to-[#f59e0b] !text-[#0A0A0C]"
                  disabled={isLoading}
                >
                  {isLoading ? t("loading") : "Restablecer contraseña"}
                </GradientButton>
                <div className="flex items-center justify-center gap-4 text-sm mt-2">
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    disabled={isLoading}
                    className="font-semibold text-[#8E8E93] transition-colors hover:text-[#1A1A2E]"
                  >
                    Volver a iniciar sesión
                  </button>
                </div>
              </>
            ) : step === "forgot" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="forgotEmail" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                    {t("email")}
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleForgotPassword() }}
                    className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
                  />
                </div>
                <GradientButton
                  fullWidth
                  size="lg"
                  onClick={handleForgotPassword}
                  className="mt-1 !from-[#fbbf24] !to-[#f59e0b] !text-[#0A0A0C]"
                  disabled={isLoading}
                >
                  {isLoading ? t("loading") : "Enviar código de recuperación"}
                </GradientButton>
                <div className="flex items-center justify-center gap-4 text-sm mt-2">
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    disabled={isLoading}
                    className="font-semibold text-[#8E8E93] transition-colors hover:text-[#1A1A2E]"
                  >
                    Volver a iniciar sesión
                  </button>
                </div>
              </>
            ) : (
            <>
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
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
                />
              </div>
            )}

            {/* Nickname (optional) */}
            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="nickname" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                  {t("nickname")}
                </label>
                <input
                  id="nickname"
                  type="text"
                  placeholder={t("nicknamePlaceholder")}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
                />
              </div>
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
                className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
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
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 pr-12 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
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
              
              {!isRegistering && (
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("forgot");
                      setError("");
                    }}
                    className="text-xs font-medium text-[#8E8E93] hover:text-[#fbbf24] transition-colors duration-300"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}
            </div>

            {/* Facultad */}
            {isRegistering && (
              <div className="flex flex-col gap-2">
                <label htmlFor="faculty" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                  {t("faculty")}
                </label>
                <select
                  id="faculty"
                  value={faculty}
                  onChange={(e) => { setFaculty(e.target.value); setMajor("") }}
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
                >
                  <option value="" disabled>{t("facultyPlaceholder")}</option>
                  {FACULTY_NAMES.map((facultyName) => (
                    <option key={facultyName} value={facultyName}>{facultyName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Carrera — solo aparece una vez elegida la facultad */}
            {isRegistering && faculty && (
              <div className="flex flex-col gap-2">
                <label htmlFor="major" className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider pl-1">
                  {t("major")}
                </label>
                <select
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full rounded-2xl border border-[#EBEBF0] bg-[#F8F8FA] px-5 py-3.5 text-sm text-[#1A1A2E] outline-none transition-all duration-300 focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/15 focus:bg-white"
                >
                  <option value="" disabled>{t("majorPlaceholder")}</option>
                  {FACULTIES[faculty].map((careerName) => (
                    <option key={careerName} value={careerName}>{careerName}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit */}
            <GradientButton
              fullWidth
              size="lg"
              onClick={handleSubmit}
              className="mt-1 !from-[#fbbf24] !to-[#f59e0b] !text-[#0A0A0C] hover:!from-[#f59e0b] hover:!to-[#d97706] shadow-[0_8px_20px_rgb(251,191,36,0.3)]"
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
            </>
            )}
          </div>
        </div>

        <p className="text-xs text-[#C7C7CC] text-center">
          {t("termsNotice")}
        </p>
      </div>
    </div>
  )
}
