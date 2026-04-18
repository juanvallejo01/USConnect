"use client"

import { useState, useEffect } from "react"
import {
  Camera, LogOut, Heart, Plus, X,
} from "lucide-react"
import Image from "next/image"
import { GradientButton } from "@/components/layout/gradient-button"
import { useAuth } from "@/context/auth-context"
import { useRank } from "@/context/rank-context"
import { DEFAULT_INTERESTS } from "@/utils/constants"
import { useProfilePhotos, AVAILABLE_PHOTOS as PHOTO_OPTIONS } from "@/context/profile-photos-context"

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { getUserRank } = useRank()
  const { likesReceived } = getUserRank(1)

  const [bio, setBio] = useState("Film major who loves golden hour shots and exploring LA coffee shops.")
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Photography", "Design", "Film", "Coffee"])
  const [showPhotoManager, setShowPhotoManager] = useState(false)
  const [showPhotoPicker, setShowPhotoPicker] = useState(false)
  const { photos, addPhoto, removePhoto } = useProfilePhotos()

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Profile</h1>
        <button onClick={logout} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#EBEBF0] transition-colors">
          <LogOut size={20} className="text-[#8E8E93]" />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center px-6 py-4">
        <div className="relative mb-4">
          <div className="relative h-24 w-24 rounded-full overflow-hidden ring-4 ring-[#4A90D9]/10 ring-offset-4 ring-offset-[#F8F8FA]">
            <Image src={photos[0] ?? "/images/swipe-profile.jpg"} alt="Your profile photo" fill className="object-cover" />
          </div>
          <button
            onClick={() => setShowPhotoManager(true)}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#4A90D9] shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all active:scale-90"
          >
            <Camera size={14} className="text-white" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#1A1A2E]">{user?.name || "User"}</h2>
        </div>
        <p className="text-sm text-[#8E8E93] mt-0.5">{user?.major || "USC Student"}</p>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-[#4A90D9] px-4 py-1.5 shadow-[0_4px_16px_rgba(74,144,217,0.2)]">
          <Heart size={14} className="text-white" fill="white" />
          <span className="text-sm font-bold text-white">{likesReceived} {likesReceived === 1 ? "Like" : "Likes"}</span>
        </div>
      </div>

      {/* ── ACCOUNT ── */}
      <div className="px-6 pt-4 pb-6 flex flex-col gap-4">
          <div>
            <label htmlFor="bio" className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">About You</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-[#EBEBF0] bg-white px-5 py-4 text-sm text-[#1A1A2E] outline-none transition-all focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20 resize-none leading-relaxed"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-3">Interests</p>
            <div className="flex flex-wrap gap-2.5">
              {DEFAULT_INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest)
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                      isSelected
                        ? "bg-[#4A90D9] text-white shadow-[0_4px_16px_rgba(74,144,217,0.2)]"
                        : "bg-white text-[#8E8E93] border border-[#EBEBF0] hover:border-[#4A90D9]/30"
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
            className="flex items-center gap-3 w-full rounded-2xl border border-dashed border-[#4A90D9]/30 bg-[#4A90D9]/5 px-5 py-4 transition-all active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#4A90D9]">
              <Camera size={16} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#1A1A2E]">Editar fotos</p>
              <p className="text-xs text-[#C7C7CC]">{photos.length} foto{photos.length !== 1 ? "s" : ""} · toca para gestionar</p>
            </div>
          </button>
          <GradientButton fullWidth size="lg">Save Changes</GradientButton>
        </div>

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
            <div className="w-10 h-1 bg-[#EBEBF0] rounded-full mx-auto mt-4 mb-1" />

            {/* Header */}
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
                  {/* 3×3 grid */}
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
                  {/* Photo picker */}
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
