"use client"

import { useState, useEffect } from "react"
import {
  Camera, LogOut, Heart, Plus, X, Moon, Sun, Grid3X3, Bookmark, RefreshCw, Tag,
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useAuth } from "@/context/auth-context"
import { useRank } from "@/context/rank-context"
import { DEFAULT_INTERESTS } from "@/utils/constants"
import { useProfilePhotos, AVAILABLE_PHOTOS as PHOTO_OPTIONS } from "@/context/profile-photos-context"

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { getUserRank } = useRank()
  const { likesReceived } = getUserRank(1)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const [bio, setBio] = useState("Film major who loves golden hour shots and exploring LA coffee shops.")
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Photography", "Design", "Film", "Coffee"])
  const [showPhotoManager, setShowPhotoManager] = useState(false)
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const { photos, addPhoto, removePhoto } = useProfilePhotos()

  useEffect(() => { setMounted(true) }, [])

  const isDark = resolvedTheme === "dark"

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const tabs = [
    { icon: Grid3X3, label: "Grid" },
    { icon: Bookmark, label: "Saved" },
    { icon: RefreshCw, label: "Shared" },
    { icon: Tag, label: "Tagged" },
  ]

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-y-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-base font-bold text-[#1A1A2E] tracking-tight">
          {user?.name?.toLowerCase().replace(/\s+/g, "_") || "username"}
        </span>
        <div className="flex items-center gap-0.5">
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#EBEBF0] transition-all active:scale-90"
            >
              {isDark
                ? <Sun size={18} className="text-[#9898AA]" />
                : <Moon size={18} className="text-[#8E8E93]" />}
            </button>
          )}
          <button onClick={logout} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#EBEBF0] transition-all active:scale-90">
            <LogOut size={19} className="text-[#8E8E93]" />
          </button>
        </div>
      </div>

      {/* ── Avatar + Stats row ── */}
      <div className="flex items-center px-5 pt-2 pb-4 gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-[86px] w-[86px] rounded-full overflow-hidden ring-2 ring-[#4A90D9]/30 ring-offset-2 ring-offset-[#F8F8FA]">
            <Image src={photos[0] ?? "/images/swipe-profile.jpg"} alt="Profile" fill className="object-cover" />
          </div>
          <button
            onClick={() => setShowPhotoManager(true)}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#4A90D9] border-2 border-[#F8F8FA] shadow-sm transition-all active:scale-90"
          >
            <Camera size={12} className="text-white" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-1 justify-around">
          <button onClick={() => setShowPhotoManager(true)} className="flex flex-col items-center gap-0.5 active:opacity-70">
            <span className="text-[17px] font-bold text-[#1A1A2E] leading-none">{photos.length}</span>
            <span className="text-[12px] text-[#8E8E93]">fotos</span>
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[17px] font-bold text-[#1A1A2E] leading-none">{likesReceived}</span>
            <span className="text-[12px] text-[#8E8E93]">likes</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[17px] font-bold text-[#1A1A2E] leading-none">{selectedInterests.length}</span>
            <span className="text-[12px] text-[#8E8E93]">intereses</span>
          </div>
        </div>
      </div>

      {/* ── Name / Major / Bio ── */}
      <div className="px-5 pb-3">
        <p className="text-[14px] font-bold text-[#1A1A2E] leading-snug">{user?.name || "User"}</p>
        <p className="text-[13px] text-[#8E8E93] mt-0.5">{user?.major || "USC Student"}</p>
        {editingBio ? (
          <textarea
            autoFocus
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onBlur={() => setEditingBio(false)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-[#EBEBF0] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 resize-none leading-relaxed"
          />
        ) : (
          <p
            onClick={() => setEditingBio(true)}
            className="mt-1.5 text-[13px] text-[#1A1A2E] leading-[1.5] cursor-text"
          >
            {bio || <span className="text-[#C7C7CC]">Añade una bio…</span>}
          </p>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div className="flex gap-2.5 px-5 pb-4">
        <button
          onClick={() => setEditingBio(true)}
          className="flex-1 py-[7px] rounded-lg bg-[#EBEBF0] text-[13px] font-semibold text-[#1A1A2E] transition-all active:scale-95"
        >
          Editar perfil
        </button>
        <button
          onClick={() => setShowPhotoManager(true)}
          className="flex-1 py-[7px] rounded-lg bg-[#EBEBF0] text-[13px] font-semibold text-[#1A1A2E] transition-all active:scale-95"
        >
          Ver archivo
        </button>
      </div>

      {/* ── Highlights / Stories row ── */}
      <div className="flex items-center gap-4 px-5 pb-5 overflow-x-auto scrollbar-none">
        {/* Existing photos as story circles */}
        {photos.slice(0, 5).map((photo, i) => (
          <button key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 active:opacity-80">
            <div className="h-[62px] w-[62px] rounded-full overflow-hidden ring-2 ring-[#4A90D9]/60 ring-offset-2 ring-offset-[#F8F8FA]">
              <Image src={photo} alt={`Story ${i + 1}`} width={62} height={62} className="object-cover w-full h-full" />
            </div>
            <span className="text-[11px] text-[#1A1A2E] font-medium">
              {i === 0 ? "🔥" : `Foto ${i + 1}`}
            </span>
          </button>
        ))}
        {/* Add new */}
        <button
          onClick={() => setShowPhotoManager(true)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 active:opacity-80"
        >
          <div className="h-[62px] w-[62px] rounded-full border-2 border-dashed border-[#C7C7CC] flex items-center justify-center">
            <Plus size={22} className="text-[#C7C7CC]" />
          </div>
          <span className="text-[11px] text-[#8E8E93]">New</span>
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-t border-[#EBEBF0]">
        {tabs.map((tab, i) => {
          const Icon = tab.icon
          const active = activeTab === i
          return (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 flex items-center justify-center py-3 border-b-[2px] transition-colors ${
                active ? "border-[#1A1A2E]" : "border-transparent"
              }`}
            >
              <Icon size={22} className={active ? "text-[#1A1A2E]" : "text-[#C7C7CC]"} />
            </button>
          )
        })}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 0 && (
        /* Photos grid */
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
                <p className="text-[16px] font-bold text-[#1A1A2E]">Share Photos</p>
                <p className="text-[13px] text-[#8E8E93] mt-1 leading-snug">When you share photos, they will appear on your profile.</p>
              </div>
              <button
                onClick={() => setShowPhotoManager(true)}
                className="text-[13px] font-semibold text-[#4A90D9]"
              >
                Share your first photo
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 1 && (
        /* Interests grid */
        <div className="px-5 pt-5 pb-6">
          <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Intereses guardados</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest)
              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all active:scale-95 ${
                    isSelected
                      ? "bg-[#4A90D9] text-white shadow-[0_4px_12px_rgba(74,144,217,0.2)]"
                      : "bg-[#EBEBF0] text-[#8E8E93]"
                  }`}
                >
                  {interest}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {(activeTab === 2 || activeTab === 3) && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 px-8">
          <div className="h-16 w-16 rounded-full border-2 border-[#C7C7CC] flex items-center justify-center">
            {activeTab === 2
              ? <RefreshCw size={26} className="text-[#C7C7CC]" />
              : <Tag size={26} className="text-[#C7C7CC]" />}
          </div>
          <p className="text-[14px] font-semibold text-[#1A1A2E]">{activeTab === 2 ? "Nada compartido" : "Sin etiquetas"}</p>
          <p className="text-[12px] text-[#8E8E93] text-center">Aquí aparecerán las publicaciones.</p>
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
            <div className="w-10 h-1 bg-[#EBEBF0] rounded-full mx-auto mt-4 mb-1" />
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#EBEBF0]">
              <h3 className="text-base font-bold text-[#1A1A2E]">Mis fotos</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#C7C7CC]">{photos.length}/9</span>
                <button
                  onClick={() => { setShowPhotoManager(false); setShowPhotoPicker(false) }}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-[#EBEBF0] transition-all active:scale-90"
                >
                  <X size={16} className="text-[#8E8E93]" />
                </button>
              </div>
            </div>
            <div className="p-4 pb-8">
              {!showPhotoPicker ? (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {Array.from({ length: 9 }).map((_, i) => {
                      const photo = photos[i]
                      const isMain = i === 0
                      return (
                        <div
                          key={i}
                          className={`relative aspect-square rounded-2xl overflow-hidden ${
                            photo ? "" : "border-2 border-dashed border-[#EBEBF0] bg-[#F8F8FA]"
                          } ${isMain && photo ? "ring-2 ring-[#4A90D9] ring-offset-1" : ""}`}
                        >
                          {photo ? (
                            <>
                              <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" />
                              {isMain && (
                                <div className="absolute top-1.5 left-1.5 bg-[#4A90D9] rounded-full px-1.5 py-0.5">
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
                              <Plus size={22} className="text-[#C7C7CC]" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-[11px] text-center text-[#C7C7CC]">La primera foto aparece en Explore · toca ✕ para eliminar</p>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowPhotoPicker(false)}
                    className="flex items-center gap-1.5 text-sm text-[#4A90D9] font-medium mb-4"
                  >
                    ← Volver
                  </button>
                  <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Selecciona una foto</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {PHOTO_OPTIONS.filter((p) => !photos.includes(p)).map((url) => (
                      <button
                        key={url}
                        onClick={() => { addPhoto(url); setShowPhotoPicker(false) }}
                        className="relative aspect-square rounded-xl overflow-hidden ring-2 ring-transparent active:ring-[#4A90D9] transition-all active:scale-95"
                      >
                        <Image src={url} alt="" fill className="object-cover" />
                      </button>
                    ))}
                    {PHOTO_OPTIONS.filter((p) => !photos.includes(p)).length === 0 && (
                      <p className="col-span-3 text-center text-sm text-[#C7C7CC] py-6">No hay más fotos disponibles</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

