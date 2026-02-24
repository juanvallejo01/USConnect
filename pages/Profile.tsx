"use client"

import { useState, useEffect } from "react"
import {
  Camera, LogOut, Heart, Star, Crown, Lock,
  ExternalLink, CheckCircle, AlertCircle, Loader2,
  Users, DollarSign, TrendingUp, Plus, X,
} from "lucide-react"
import Image from "next/image"
import { GradientButton } from "@/components/layout/gradient-button"
import { useAuth } from "@/context/auth-context"
import { useRank } from "@/context/rank-context"
import { DEFAULT_INTERESTS } from "@/utils/constants"
import { useProfilePhotos, AVAILABLE_PHOTOS as PHOTO_OPTIONS } from "@/context/profile-photos-context"

type TabId = "account" | "subscriptions" | "creator"

interface ActiveSub {
  id: string
  tier: string
  status: string
  currentPeriodEnd: string
  creator: { id: string; name: string; major: string; creatorMonthlyPrice: number }
}

interface CreatorDashboard {
  subscriberCount: number
  monthlyRevenue: number
  totalEarnings: number
}

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { getUserRank } = useRank()
  const { likesReceived } = getUserRank(1)

  const [activeTab, setActiveTab] = useState<TabId>("account")
  const [bio, setBio] = useState("Film major who loves golden hour shots and exploring LA coffee shops.")
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Photography", "Design", "Film", "Coffee"])
  const [showPhotoManager, setShowPhotoManager] = useState(false)
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)
  const { photos, addPhoto, removePhoto } = useProfilePhotos()

  const [monthlyPrice, setMonthlyPrice] = useState("9.99")
  const [activating, setActivating] = useState(false)
  const [activateError, setActivateError] = useState<string | null>(null)

  const [dashboard, setDashboard] = useState<CreatorDashboard | null>(null)
  const [dashLoading, setDashLoading] = useState(false)

  const [subs, setSubs] = useState<ActiveSub[]>([])
  const [subsLoading, setSubsLoading] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  useEffect(() => {
    if (activeTab === "creator" && user?.isCreator && !dashboard) loadDashboard()
    if (activeTab === "subscriptions") loadSubscriptions()
  }, [activeTab, user?.isCreator])

  async function loadDashboard() {
    try {
      setDashLoading(true)
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creator/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setDashboard(await res.json())
    } finally { setDashLoading(false) }
  }

  async function loadSubscriptions() {
    try {
      setSubsLoading(true)
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setSubs(await res.json())
    } finally { setSubsLoading(false) }
  }

  async function handleActivateCreator() {
    const price = parseFloat(monthlyPrice)
    if (isNaN(price) || price < 1 || price > 200) {
      setActivateError("Price must be between $1 and $200")
      return
    }
    try {
      setActivating(true)
      setActivateError(null)
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creator/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monthlyPrice: price }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Activation failed")
      window.location.href = data.onboardingUrl
    } catch (err: any) {
      setActivateError(err.message)
    } finally {
      setActivating(false)
    }
  }

  async function handleRefreshOnboarding() {
    try {
      setActivating(true)
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creator/onboarding/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) window.location.href = data.onboardingUrl
    } finally { setActivating(false) }
  }

  async function handleGetStripeDashboard() {
    const token = localStorage.getItem("accessToken")
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creator/stripe-dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (res.ok) window.open(data.url, "_blank")
  }

  async function handleCancelSub(subId: string) {
    if (!confirm("Cancel subscription? You'll keep access until the billing period ends.")) return
    try {
      setCancellingId(subId)
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${subId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setSubs((prev) => prev.map((s) => s.id === subId ? { ...s, status: "canceling" } : s))
    } finally { setCancellingId(null) }
  }

  const tierLabel: Record<string, string> = { BASIC: "Basic", GOLD: "⭐ Gold", PREMIUM: "👑 Premium" }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "account", label: "Account", icon: <Camera size={14} /> },
    { id: "subscriptions", label: "Subscriptions", icon: <Star size={14} /> },
    { id: "creator", label: "Creator", icon: <Crown size={14} /> },
  ]

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <button onClick={logout} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <LogOut size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center px-6 py-4">
        <div className="relative mb-4">
          <div className="relative h-24 w-24 rounded-full overflow-hidden ring-4 ring-[#3C5E82]/10 ring-offset-4 ring-offset-gray-50">
            <Image src={photos[0] ?? "/images/swipe-profile.jpg"} alt="Your profile photo" fill className="object-cover" />
          </div>
          <button
            onClick={() => setShowPhotoManager(true)}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] shadow-md transition-all active:scale-90"
          >
            <Camera size={14} className="text-white" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">{user?.name || "User"}</h2>
          {user?.isCreator && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              <Crown size={10} /> Creator
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{user?.major || "USC Student"}</p>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] px-4 py-1.5 shadow">
          <Heart size={14} className="text-white" fill="white" />
          <span className="text-sm font-bold text-white">{likesReceived} {likesReceived === 1 ? "Like" : "Likes"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mx-4 mb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === tab.id ? "border-[#3C5E82] text-[#3C5E82]" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ACCOUNT TAB ── */}
      {activeTab === "account" && (
        <div className="px-6 pt-4 pb-6 flex flex-col gap-4">
          <div>
            <label htmlFor="bio" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About You</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-900 outline-none transition-all focus:border-[#3C5E82] focus:ring-2 focus:ring-[#3C5E82]/20 resize-none leading-relaxed"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Interests</p>
            <div className="flex flex-wrap gap-2.5">
              {DEFAULT_INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest)
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                      isSelected
                        ? "bg-gradient-to-r from-[#3C5E82] to-[#5E82AC] text-white shadow-md"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-[#3C5E82]/30"
                    }`}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Photos hint */}
          <button
            onClick={() => setShowPhotoManager(true)}
            className="flex items-center gap-3 w-full rounded-2xl border border-dashed border-[#3C5E82]/30 bg-[#3C5E82]/5 px-5 py-4 transition-all active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#3C5E82] to-[#5E82AC]">
              <Camera size={16} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">Editar fotos</p>
              <p className="text-xs text-gray-400">{photos.length} foto{photos.length !== 1 ? "s" : ""} · toca para gestionar</p>
            </div>
          </button>
          <GradientButton fullWidth size="lg">Save Changes</GradientButton>
        </div>
      )}

      {/* ── PHOTO MANAGER SHEET ── */}
      {showPhotoManager && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => { setShowPhotoManager(false); setShowPhotoPicker(false) }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-4 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Mis fotos</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{photos.length}/9</span>
                <button
                  onClick={() => { setShowPhotoManager(false); setShowPhotoPicker(false) }}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 transition-all active:scale-90"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-4 pb-8">
              {!showPhotoPicker ? (
                <>
                  {/* 3×3 grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {Array.from({ length: 9 }).map((_, i) => {
                      const photo = photos[i]
                      const isMain = i === 0
                      return (
                        <div
                          key={i}
                          className={`relative aspect-square rounded-2xl overflow-hidden ${
                            photo ? "" : "border-2 border-dashed border-gray-200 bg-gray-50"
                          } ${isMain && photo ? "ring-2 ring-[#3C5E82] ring-offset-1" : ""}`}
                        >
                          {photo ? (
                            <>
                              <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" />
                              {isMain && (
                                <div className="absolute top-1.5 left-1.5 bg-[#3C5E82] rounded-full px-1.5 py-0.5">
                                  <span className="text-[9px] font-bold text-white">MAIN</span>
                                </div>
                              )}
                              {!isMain && (
                                <button
                                  onClick={() => removePhoto(i)}
                                  className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all active:scale-90"
                                >
                                  <X size={12} className="text-white" />
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => setShowPhotoPicker(true)}
                              className="w-full h-full flex items-center justify-center transition-all active:scale-95"
                            >
                              <Plus size={22} className="text-gray-300" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-center text-gray-400">La primera foto aparece en Explore · toca ✕ para eliminar</p>
                </>
              ) : (
                <>
                  {/* Photo picker */}
                  <button
                    onClick={() => setShowPhotoPicker(false)}
                    className="flex items-center gap-1.5 text-sm text-[#3C5E82] font-medium mb-4"
                  >
                    ← Volver
                  </button>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Selecciona una foto</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {PHOTO_OPTIONS.filter((p) => !photos.includes(p)).map((url) => (
                      <button
                        key={url}
                        onClick={() => { addPhoto(url); setShowPhotoPicker(false) }}
                        className="relative aspect-square rounded-xl overflow-hidden ring-2 ring-transparent active:ring-[#3C5E82] transition-all active:scale-95"
                      >
                        <Image src={url} alt="" fill className="object-cover" />
                      </button>
                    ))}
                    {PHOTO_OPTIONS.filter((p) => !photos.includes(p)).length === 0 && (
                      <p className="col-span-3 text-center text-sm text-gray-400 py-6">No hay más fotos disponibles</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTIONS TAB ── */}
      {activeTab === "subscriptions" && (
        <div className="px-4 pt-4 pb-6 flex flex-col gap-3">
          {subsLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-[#3C5E82]" /></div>
          ) : subs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gradient-to-br from-[#3C5E82]/10 to-[#5E82AC]/10 p-5 mb-4">
                <Star size={28} className="text-[#3C5E82]" />
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">No active subscriptions</p>
              <p className="text-sm text-gray-500 max-w-[260px]">Subscribe to creators on the Feed to unlock exclusive content.</p>
            </div>
          ) : (
            subs.map((sub) => (
              <div key={sub.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3C5E82] to-[#5E82AC] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{sub.creator.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900 truncate">{sub.creator.name}</p>
                      <Crown size={12} className="text-amber-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500 truncate">{sub.creator.major}</p>
                  </div>
                  <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                    sub.status === "ACTIVE" ? "bg-green-50 text-green-600" :
                    sub.status === "canceling" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
                  }`}>
                    {sub.status === "canceling" ? "Canceling" : sub.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{tierLabel[sub.tier] || sub.tier} · ${sub.creator.creatorMonthlyPrice}/mo</span>
                  <span>Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
                </div>
                {sub.status === "ACTIVE" && (
                  <button
                    onClick={() => handleCancelSub(sub.id)}
                    disabled={cancellingId === sub.id}
                    className="w-full py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold transition-all active:scale-95 hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancellingId === sub.id ? "Canceling..." : "Cancel Subscription"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── CREATOR TAB ── */}
      {activeTab === "creator" && (
        <div className="px-4 pt-4 pb-6 flex flex-col gap-4">

          {/* Not yet a creator */}
          {!user?.isCreator && !user?.creatorOnboardingStatus && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20">
                  <Crown size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Become a Creator</p>
                  <p className="text-xs text-gray-500">Earn money sharing exclusive content</p>
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                {["Post exclusive content for subscribers", "Set your own monthly price ($1–$200)", "Get paid directly via Stripe", "Only 15% platform fee"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Monthly Subscription Price</label>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden focus-within:border-[#3C5E82] focus-within:ring-2 focus-within:ring-[#3C5E82]/20">
                  <span className="px-3 text-gray-500 font-medium text-sm">$</span>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    step={0.01}
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="flex-1 bg-transparent py-3 pr-4 text-sm text-gray-900 outline-none"
                    placeholder="9.99"
                  />
                  <span className="px-3 text-gray-400 text-xs">/mo</span>
                </div>
              </div>
              {activateError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600">{activateError}</p>
                </div>
              )}
              <GradientButton fullWidth onClick={handleActivateCreator} disabled={activating}>
                {activating
                  ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Setting up...</span>
                  : <span className="flex items-center gap-2"><ExternalLink size={14} /> Continue to Stripe</span>
                }
              </GradientButton>
              <p className="text-[11px] text-gray-400 text-center mt-2">You'll be redirected to Stripe to connect your bank account</p>
            </div>
          )}

          {/* Onboarding pending / incomplete */}
          {!user?.isCreator && (user?.creatorOnboardingStatus === "PENDING" || user?.creatorOnboardingStatus === "INCOMPLETE") && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Complete your Stripe setup</p>
                  <p className="text-xs text-amber-600">Your account is pending — finish onboarding to go live</p>
                </div>
              </div>
              <button
                onClick={handleRefreshOnboarding}
                disabled={activating}
                className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-amber-600 disabled:opacity-50"
              >
                {activating ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                Continue Stripe Onboarding
              </button>
            </div>
          )}

          {/* Active creator dashboard */}
          {user?.isCreator && (
            dashLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={28} className="animate-spin text-[#3C5E82]" /></div>
            ) : dashboard ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Users size={16} className="text-[#3C5E82]" />, label: "Subscribers", value: String(dashboard.subscriberCount) },
                    { icon: <DollarSign size={16} className="text-green-600" />, label: "This Month", value: `$${dashboard.monthlyRevenue.toFixed(2)}` },
                    { icon: <TrendingUp size={16} className="text-amber-500" />, label: "All Time", value: `$${dashboard.totalEarnings.toFixed(2)}` },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
                      <div className="flex justify-center mb-1">{stat.icon}</div>
                      <p className="text-base font-bold text-gray-900">{stat.value}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Subscription Tiers</p>
                  {[
                    { tier: "Basic", price: user.creatorMonthlyPrice ?? 0, desc: "Subscriber-only posts" },
                    { tier: "⭐ Gold", price: (user.creatorMonthlyPrice ?? 0) * 2, desc: "Basic + Gold-tier exclusives" },
                    { tier: "👑 Premium", price: (user.creatorMonthlyPrice ?? 0) * 5, desc: "Gold + Premium-only content" },
                  ].map((t) => (
                    <div key={t.tier} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t.tier}</p>
                        <p className="text-xs text-gray-400">{t.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-[#3C5E82]">${t.price.toFixed(2)}/mo</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGetStripeDashboard}
                  className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all active:scale-95 hover:border-[#3C5E82]/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#635BFF]/10">
                      <DollarSign size={16} className="text-[#635BFF]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Stripe Dashboard</p>
                      <p className="text-xs text-gray-500">View payouts & manage banking</p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-gray-400" />
                </button>
              </>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
