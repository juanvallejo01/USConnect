"use client"

import { useState, useEffect, useRef } from "react"
import {
  Camera, LogOut, Moon, Sun, Plus, ImagePlus, X,
  MapPin, CalendarDays, Heart,
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { useAuth } from "@/context/auth-context"
import { useLocale } from "@/context/locale-context"
import { DEFAULT_INTERESTS } from "@/utils/constants"
import { useProfilePhotos } from "@/context/profile-photos-context"

export function ProfilePage() {
  const t = useTranslations("profile")
  const { locale, setLocale } = useLocale()
  const tInterests = useTranslations("profile.interests")
  const TABS = [t("tabs.posts"), t("tabs.interests"), t("tabs.highlights"), t("tabs.photos")]
  const { user, logout } = useAuth()
  const likesReceived = user?.likesCount ?? 0
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [bio, setBio] = useState(t("defaultBio"))
  const [editingBio, setEditingBio] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Photography", "Design", "Film", "Coffee"])
  const [showPhotoManager, setShowPhotoManager] = useState(false)
  const { photos, addPhoto, removePhoto } = useProfilePhotos()
  const mainCameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onloadend = () => addPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  useEffect(() => { setMounted(true) }, [])

  const isDark = resolvedTheme === "dark"

  function toggleInterest(i: string) {
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  const username = user?.name?.toLowerCase().replace(/\s+/g, "_") ?? "username"

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-y-auto">

      {/* ── Banner ── */}
      <div className="relative w-full h-[110px] bg-gradient-to-br from-[#000000] via-[#171717] to-[#404040] flex-shrink-0">
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={() => setLocale(locale === "es" ? "en" : "es")}
            className="flex h-8 px-2.5 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all active:scale-90"
            aria-label={t("switchLanguage")}
          >
            <span className="text-[11px] font-bold text-white uppercase tracking-wide">{locale}</span>
          </button>
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all active:scale-90"
            >
              {isDark ? <Sun size={15} className="text-white" /> : <Moon size={15} className="text-white" />}
            </button>
          )}
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all active:scale-90"
          >
            <LogOut size={15} className="text-white" />
          </button>
        </div>
      </div>

      {/* ── Avatar + action buttons ── */}
      <div className="relative px-4 pb-3">
        {/* Avatar overlaps banner */}
        <div className="absolute -top-[46px] left-4">
          <div className="h-[90px] w-[90px] rounded-full overflow-hidden border-4 border-[#F8F8FA]">
            <Image
              src={photos[0] ?? "/images/swipe-profile.jpg"}
              alt="Profile"
              width={90}
              height={90}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Right-side action buttons */}
        <div className="flex justify-end gap-2 pt-3">
          <button
            onClick={() => setShowPhotoManager(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBEBF0] bg-white transition-all active:scale-90"
          >
            <Camera size={16} className="text-[#1A1A2E]" />
          </button>
          <button
            onClick={() => setEditingBio(true)}
            className="h-9 px-5 rounded-full border border-[#EBEBF0] bg-white text-[13px] font-bold text-[#1A1A2E] transition-all active:scale-95"
          >
            {t("editProfile")}
          </button>
        </div>

        {/* Info block — spacer pushes below avatar */}
        <div className="mt-10">
          <p className="text-[19px] font-extrabold text-[#1A1A2E] leading-tight">{user?.name || t("defaultUser")}</p>
          <p className="text-[14px] text-[#8E8E93] mt-0.5">@{username}</p>

          {editingBio ? (
            <textarea
              autoFocus
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onBlur={() => setEditingBio(false)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-[#EBEBF0] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none focus:border-[#000000] resize-none leading-relaxed"
            />
          ) : (
            <p onClick={() => setEditingBio(true)} className="mt-2 text-[14px] text-[#1A1A2E] leading-[1.5] cursor-text">
              {bio || <span className="text-[#C7C7CC]">{t("addBio")}</span>}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
            <span className="flex items-center gap-1 text-[13px] text-[#8E8E93]">
              <MapPin size={13} />
              {user?.major || t("defaultMajorLocation")}
            </span>
            <span className="flex items-center gap-1 text-[13px] text-[#8E8E93]">
              <CalendarDays size={13} />
              {t("joinedIn")}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2.5">
            <button onClick={() => setActiveTab(1)} className="flex items-center gap-1 active:opacity-70">
              <span className="text-[14px] font-bold text-[#1A1A2E]">{selectedInterests.length}</span>
              <span className="text-[14px] text-[#8E8E93]">{t("interestsCount")}</span>
            </button>
            <div className="flex items-center gap-1">
              <span className="text-[14px] font-bold text-[#1A1A2E]">{likesReceived}</span>
              <span className="text-[14px] text-[#8E8E93]">{t("likesCount")}</span>
            </div>
            <button onClick={() => setShowPhotoManager(true)} className="flex items-center gap-1 active:opacity-70">
              <span className="text-[14px] font-bold text-[#1A1A2E]">{photos.length}</span>
              <span className="text-[14px] text-[#8E8E93]">{t("photosCount")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-[#EBEBF0] mt-1">
        {TABS.map((label, i) => {
          const active = activeTab === i
          return (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-5 py-3 text-[14px] font-semibold transition-colors border-b-[2px] ${
                active ? "border-[#000000] text-[#000000]" : "border-transparent text-[#8E8E93]"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Posts tab: photo grid ── */}
      {activeTab === 0 && (
        <div className="grid grid-cols-3 gap-[1.5px]">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-square">
              <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
          {photos.length === 0 && (
            <div className="col-span-3 flex flex-col items-center justify-center py-16 gap-4 px-8">
              <div className="h-16 w-16 rounded-full border-2 border-[#C7C7CC] flex items-center justify-center">
                <Camera size={28} className="text-[#C7C7CC]" />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-bold text-[#1A1A2E]">{t("sharePhotos")}</p>
                <p className="text-[13px] text-[#8E8E93] mt-1 leading-snug">{t("sharePhotosHint")}</p>
              </div>
              <button onClick={() => setShowPhotoManager(true)} className="text-[13px] font-semibold text-[#000000]">
                {t("addFirstPhoto")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Intereses tab ── */}
      {activeTab === 1 && (
        <div className="px-4 pt-4 pb-6">
          <div className="flex flex-wrap gap-2">
            {DEFAULT_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest)
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all active:scale-95 ${
                    isSelected ? "bg-[#000000] text-white" : "bg-[#EBEBF0] text-[#8E8E93]"
                  }`}
                >
                  {tInterests(interest)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Destacados tab ── */}
      {activeTab === 2 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 px-8">
          <div className="h-16 w-16 rounded-full border-2 border-[#C7C7CC] flex items-center justify-center">
            <Heart size={26} className="text-[#C7C7CC]" />
          </div>
          <p className="text-[15px] font-bold text-[#1A1A2E]">{t("noHighlightsYet")}</p>
          <p className="text-[13px] text-[#8E8E93] text-center leading-snug">{t("noHighlightsHint")}</p>
        </div>
      )}

      {/* ── Fotos tab ── */}
      {activeTab === 3 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 px-8">
          <button onClick={() => setShowPhotoManager(true)} className="flex flex-col items-center gap-3 active:opacity-70">
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-[#000000]/40 flex items-center justify-center bg-[#000000]/5">
              <Plus size={26} className="text-[#000000]" />
            </div>
            <p className="text-[13px] font-semibold text-[#000000]">{t("managePhotos")}</p>
          </button>
        </div>
      )}

      {/* ── Photo Manager Sheet ── */}
      {showPhotoManager && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowPhotoManager(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#EBEBF0] rounded-full mx-auto mt-4 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#EBEBF0]">
              <h3 className="text-base font-bold text-[#1A1A2E]">{t("myPhotos")}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#C7C7CC]">{photos.length}/9</span>
                <button
                  onClick={() => setShowPhotoManager(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-[#EBEBF0] transition-all active:scale-90"
                >
                  <X size={16} className="text-[#8E8E93]" />
                </button>
              </div>
            </div>
            <div className="p-4 pb-8">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Array.from({ length: 9 }).map((_, i) => {
                  const photo = photos[i]
                  const isMain = i === 0
                  return (
                    <div
                      key={i}
                      className={`relative aspect-square rounded-2xl overflow-hidden ${
                        photo ? "" : "border-2 border-dashed border-[#EBEBF0] bg-[#F8F8FA]"
                      } ${isMain && photo ? "ring-2 ring-[#000000] ring-offset-1" : ""}`}
                    >
                      {photo ? (
                        <>
                          <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" />
                          {isMain && (
                            <div className="absolute top-1.5 left-1.5 bg-[#000000] rounded-full px-1.5 py-0.5">
                              <span className="text-[9px] font-bold text-white">{t("main")}</span>
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
                          onClick={() => (isMain ? mainCameraInputRef : galleryInputRef).current?.click()}
                          className="w-full h-full flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
                        >
                          {isMain ? (
                            <Camera size={20} className="text-[#C7C7CC]" />
                          ) : (
                            <ImagePlus size={20} className="text-[#C7C7CC]" />
                          )}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <input ref={mainCameraInputRef} type="file" accept="image/*" capture="user" onChange={handlePhotoFile} className="hidden" />
      <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
    </div>
  )
}
