"use client"

import { useState, useEffect, useRef } from "react"
import {
  Camera, LogOut, Moon, Sun, Plus, ImagePlus, X,
  MapPin, CalendarDays, MessageSquare, Trophy,
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { PostCard } from "@/components/feed/post-card"
import { ProfileAvatarImage } from "@/components/layout/profile-avatar-image"
import { useAuth } from "@/context/auth-context"
import { useLocale } from "@/context/locale-context"
import { useProfilePhotos } from "@/context/profile-photos-context"
import { useBanner } from "@/context/banner-context"
import { useToast } from "@/context/toast-context"
import { postsApi, usersApi, leaderboardApi } from "@/lib/api-client"
import { compressImageToDataUrl } from "@/lib/image-compression"

const RANKED_USERS_LIMIT = 100

export function ProfilePage() {
  const t = useTranslations("profile")
  const { locale, setLocale } = useLocale()
  const TABS = [t("tabs.posts"), t("tabs.photos")]
  const { user, logout, refreshUser } = useAuth()
  const likesReceived = user?.likesCount ?? 0
  const { setTheme, resolvedTheme } = useTheme()
  const { showToast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [bio, setBio] = useState(t("defaultBio"))
  const [isEditing, setIsEditing] = useState(false)
  const [showPhotoManager, setShowPhotoManager] = useState(false)
  const { photos, maxPhotos, addPhoto, removePhoto } = useProfilePhotos()
  const [uploadingMainPhoto, setUploadingMainPhoto] = useState(false)
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false)
  const { banner, setBanner, clearBanner } = useBanner()
  const mainCameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [weeklyRank, setWeeklyRank] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!user?.id) return
    usersApi.getUserProfile(user.id)
      .then((data) => setPosts(data.posts))
      .catch((error) => console.error("Failed to load posts:", error))
      .finally(() => setLoadingPosts(false))
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    leaderboardApi.getUsersRanking(RANKED_USERS_LIMIT)
      .then((ranking: { id: string; rank: number }[]) => {
        setWeeklyRank(ranking.find((u) => u.id === user.id)?.rank)
      })
      .catch((error) => console.error("Failed to load weekly rank:", error))
  }, [user?.id])

  const handleLikePost = async (postId: string) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isLiked: true, likesCount: p.likesCount + 1 } : p))
    try {
      await postsApi.likePost(postId)
    } catch (error) {
      console.error("Failed to like post:", error)
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isLiked: false, likesCount: p.likesCount - 1 } : p))
    }
  }

  const handleUnlikePost = async (postId: string) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isLiked: false, likesCount: p.likesCount - 1 } : p))
    try {
      await postsApi.unlikePost(postId)
    } catch (error) {
      console.error("Failed to unlike post:", error)
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isLiked: true, likesCount: p.likesCount + 1 } : p))
    }
  }

  const handleCommentPost = async (postId: string, content: string) => {
    const comment = await postsApi.addComment(postId, content)
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    return comment
  }

  const handleDeletePost = async (postId: string) => {
    await postsApi.deletePost(postId)
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !file.type.startsWith("image/")) return
    if (file.size > 15 * 1024 * 1024) {
      showToast(t("alerts.photoTooLarge"), "error")
      return
    }
    if (photos.length >= maxPhotos) {
      showToast(t("alerts.photosLimitReached", { max: maxPhotos }), "error")
      return
    }
    setUploadingGalleryPhoto(true)
    try {
      const dataUrl = await compressImageToDataUrl(file)
      await addPhoto(dataUrl)
    } catch (error: any) {
      console.error("Failed to add gallery photo:", error)
      const message = error?.message === "PHOTOS_LIMIT_REACHED"
        ? t("alerts.photosLimitReached", { max: maxPhotos })
        : t("alerts.photoUploadFailed")
      showToast(message, "error")
    } finally {
      setUploadingGalleryPhoto(false)
    }
  }

  const handleMainPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !file.type.startsWith("image/")) return
    if (file.size > 15 * 1024 * 1024) {
      showToast(t("alerts.photoTooLarge"), "error")
      return
    }
    setUploadingMainPhoto(true)
    try {
      const dataUrl = await compressImageToDataUrl(file)
      await usersApi.updateProfile({ photoUrl: dataUrl })
      await refreshUser()
    } catch (error) {
      console.error("Failed to save profile photo:", error)
      showToast(t("alerts.photoUploadFailed"), "error")
    } finally {
      setUploadingMainPhoto(false)
    }
  }

  const handleBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onloadend = () => setBanner(reader.result as string)
    reader.readAsDataURL(file)
  }

  useEffect(() => { setMounted(true) }, [])

  const isDark = resolvedTheme === "dark"

  const username = user?.name?.toLowerCase().replace(/\s+/g, "_") ?? "username"

  return (
    <div className="flex flex-col h-full bg-[#F8F8FA] overflow-y-auto">

      {/* ── Banner ── */}
      <div className="relative w-full h-[110px] flex-shrink-0 overflow-hidden">
        {banner ? (
          <>
            <Image src={banner} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-black/25" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#171717] to-[#404040]" />
        )}

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

        {isEditing && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            {banner && (
              <button
                onClick={clearBanner}
                aria-label={t("removeBanner")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all active:scale-90"
              >
                <X size={14} className="text-white" />
              </button>
            )}
            <button
              onClick={() => bannerInputRef.current?.click()}
              aria-label={t("editBanner")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all active:scale-90"
            >
              <Camera size={14} className="text-white" />
            </button>
          </div>
        )}
      </div>
      <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerFile} className="hidden" />

      {/* ── Avatar + action buttons ── */}
      <div className="relative px-4 pb-3">
        {/* Avatar overlaps banner */}
        <div className="absolute -top-[46px] left-4">
          <div className="relative h-[90px] w-[90px]">
            <div className="h-full w-full rounded-full overflow-hidden border-4 border-[#F8F8FA]">
              <ProfileAvatarImage photoUrl={user?.photoUrl} name={user?.name || "?"} size={90} />
            </div>
            {isEditing && (
              <button
                onClick={() => mainCameraInputRef.current?.click()}
                aria-label={t("editProfilePhoto")}
                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#000000] border-2 border-[#F8F8FA] transition-all active:scale-90"
              >
                <Camera size={12} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Right-side action buttons */}
        <div className="flex justify-end gap-2 pt-3">
          {isEditing && (
            <button
              onClick={() => setShowPhotoManager(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBEBF0] bg-white transition-all active:scale-90"
            >
              <Camera size={16} className="text-[#1A1A2E]" />
            </button>
          )}
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="h-9 px-5 rounded-full border border-[#EBEBF0] bg-white text-[13px] font-bold text-[#1A1A2E] transition-all active:scale-95"
          >
            {isEditing ? t("doneEditing") : t("editProfile")}
          </button>
        </div>

        {/* Info block — spacer pushes below avatar */}
        <div className="mt-10">
          <p className="text-[19px] font-extrabold text-[#1A1A2E] leading-tight">{user?.name || t("defaultUser")}</p>
          <p className="text-[14px] text-[#8E8E93] mt-0.5">@{username}</p>

          {isEditing ? (
            <textarea
              autoFocus
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-[#EBEBF0] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none focus:border-[#000000] resize-none leading-relaxed"
            />
          ) : (
            <p className="mt-2 text-[14px] text-[#1A1A2E] leading-[1.5]">
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
            {weeklyRank && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-1"
                style={{ boxShadow: "0 2px 8px rgba(255,215,0,0.3)" }}
              >
                <Trophy size={11} className="text-yellow-900" />
                <span className="text-[11px] font-bold text-yellow-900">{t("weeklyRank", { rank: weeklyRank })}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2.5">
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
      <div className="flex flex-shrink-0 overflow-x-auto scrollbar-none border-b border-[#EBEBF0] mt-1">
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

      {/* ── Posts tab: real publications, X/Twitter-style cards ── */}
      {activeTab === 0 && (
        <div>
          {loadingPosts ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000000] border-t-transparent" />
            </div>
          ) : posts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id || ""}
                  onLike={handleLikePost}
                  onUnlike={handleUnlikePost}
                  onComment={handleCommentPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3 px-8">
              <div className="h-16 w-16 rounded-full border-2 border-[#C7C7CC] flex items-center justify-center">
                <MessageSquare size={26} className="text-[#C7C7CC]" />
              </div>
              <p className="text-[15px] font-bold text-[#1A1A2E]">{t("noPostsYet")}</p>
              <p className="text-[13px] text-[#8E8E93] text-center leading-snug">{t("noPostsHint")}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Fotos tab: photos used for matching/swiping ── */}
      {activeTab === 1 && (
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
          {photos.length > 0 && (
            <button
              onClick={() => setShowPhotoManager(true)}
              className="col-span-3 flex items-center justify-center gap-2 py-4 text-[13px] font-semibold text-[#000000]"
            >
              <Plus size={16} />
              {t("managePhotos")}
            </button>
          )}
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
                <span className="text-xs text-[#C7C7CC]">{photos.length}/{maxPhotos}</span>
                <button
                  onClick={() => setShowPhotoManager(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-[#EBEBF0] transition-all active:scale-90"
                >
                  <X size={16} className="text-[#8E8E93]" />
                </button>
              </div>
            </div>
            <div className="p-4 pb-8">
              <p className="text-xs text-[#8E8E93] leading-snug mb-3">
                {t("photosExplainer")}
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {/* Slot 0: the principal photo — backend-persisted, shown everywhere else */}
                <div className="relative aspect-square rounded-2xl overflow-hidden ring-2 ring-[#000000] ring-offset-1">
                  <ProfileAvatarImage photoUrl={user?.photoUrl} name={user?.name || "?"} fill rounded="rounded-2xl" />
                  <div className="absolute top-1.5 left-1.5 bg-[#000000] rounded-full px-1.5 py-0.5">
                    <span className="text-[9px] font-bold text-white">{t("main")}</span>
                  </div>
                  {uploadingMainPhoto ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  ) : (
                    <button
                      onClick={() => mainCameraInputRef.current?.click()}
                      aria-label={t("editProfilePhoto")}
                      className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all active:scale-90"
                    >
                      <Camera size={12} className="text-white" />
                    </button>
                  )}
                </div>

                {/* Slots 1-8: the additional match/swipe gallery photos, shown on Descubrir cards */}
                {Array.from({ length: maxPhotos }).map((_, i) => {
                  const photo = photos[i]
                  return (
                    <div
                      key={i}
                      className={`relative aspect-square rounded-2xl overflow-hidden ${
                        photo ? "" : "border-2 border-dashed border-[#EBEBF0] bg-[#F8F8FA]"
                      }`}
                    >
                      {photo ? (
                        <>
                          <Image src={photo} alt={`Photo ${i + 2}`} fill className="object-cover" />
                          <button
                            onClick={async () => {
                              try {
                                await removePhoto(i)
                              } catch (error) {
                                console.error("Failed to remove photo:", error)
                                showToast(t("alerts.photoRemoveFailed"), "error")
                              }
                            }}
                            className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all active:scale-90"
                          >
                            <X size={12} className="text-white" />
                          </button>
                        </>
                      ) : i === photos.length && uploadingGalleryPhoto ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8E8E93] border-t-transparent" />
                        </div>
                      ) : (
                        <button
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={uploadingGalleryPhoto}
                          className="w-full h-full flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-40"
                        >
                          <ImagePlus size={20} className="text-[#C7C7CC]" />
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

      <input ref={mainCameraInputRef} type="file" accept="image/*" capture="user" onChange={handleMainPhotoFile} className="hidden" />
      <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
    </div>
  )
}
