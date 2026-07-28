"use client"

import { useState, useEffect, useRef } from "react"
import {
  Camera, LogOut, Moon, Sun, Plus, X,
  MapPin, CalendarDays, MessageSquare, Trophy,
  Settings, Ban, ChevronLeft, ChevronRight, Globe,
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
import { postsApi, usersApi, blocksApi, leaderboardApi } from "@/lib/api-client"
import { compressImageToDataUrl } from "@/lib/image-compression"

const DELETE_CONFIRM_PHRASE = "borrar cuenta"

const RANKED_USERS_LIMIT = 100
const RANKED_POSTS_LIMIT = 100

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
  // La bio la escribe cada usuario — no hay texto por defecto. Se guarda en
  // el backend (User.bio) al salir del modo edición.
  const [bioDraft, setBioDraft] = useState("")
  const [savingBio, setSavingBio] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { photos, maxPhotos, addPhoto, removePhoto } = useProfilePhotos()
  const [uploadingMainPhoto, setUploadingMainPhoto] = useState(false)
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const { banner, setBanner, clearBanner } = useBanner()
  const mainCameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [weeklyRank, setWeeklyRank] = useState<number | undefined>(undefined)
  const [postRanks, setPostRanks] = useState<Map<string, number>>(new Map())

  // ── Configuración (bloqueados, apodo, borrar cuenta) ──
  const [showSettings, setShowSettings] = useState(false)
  const [settingsView, setSettingsView] = useState<"main" | "blocked">("main")
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])
  const [loadingBlocked, setLoadingBlocked] = useState(false)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)
  const [nicknameDraft, setNicknameDraft] = useState("")
  const [savingNickname, setSavingNickname] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

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

  // Ranking de cada publicación (top #N), igual que en Inicio — el ranking
  // del usuario ya se muestra arriba en el perfil, así que aquí solo se
  // pasa el ranking por publicación (postRank), no el del autor.
  useEffect(() => {
    if (!user?.id) return
    leaderboardApi.getPostsRanking(RANKED_POSTS_LIMIT)
      .then((ranking: { id: string; rank: number }[]) => {
        setPostRanks(new Map(ranking.map((p) => [p.id, p.rank])))
      })
      .catch((error) => console.error("Failed to load post rankings:", error))
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

  const handleRemoveMainPhoto = async () => {
    setUploadingMainPhoto(true)
    try {
      await usersApi.updateProfile({ photoUrl: null })
      await refreshUser()
    } catch (error) {
      console.error("Failed to remove profile photo:", error)
      showToast(t("alerts.photoRemoveFailed"), "error")
    } finally {
      setUploadingMainPhoto(false)
    }
  }

  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !file.type.startsWith("image/")) return
    if (file.size > 15 * 1024 * 1024) {
      showToast(t("alerts.photoTooLarge"), "error")
      return
    }
    setUploadingBanner(true)
    try {
      const dataUrl = await compressImageToDataUrl(file, { maxDimension: 1600 })
      await setBanner(dataUrl)
    } catch (error) {
      console.error("Failed to save banner:", error)
      showToast(t("alerts.photoUploadFailed"), "error")
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleClearBanner = async () => {
    try {
      await clearBanner()
    } catch (error) {
      console.error("Failed to clear banner:", error)
      showToast(t("alerts.photoRemoveFailed"), "error")
    }
  }

  // Al entrar en modo edición se toma una copia de la bio actual para editar;
  // al salir (botón "Listo"), se guarda si cambió.
  const handleToggleEditing = async () => {
    if (!isEditing) {
      setBioDraft(user?.bio ?? "")
      setIsEditing(true)
      return
    }

    const nextBio = bioDraft.trim()
    if (nextBio !== (user?.bio ?? "")) {
      setSavingBio(true)
      try {
        await usersApi.updateProfile({ bio: nextBio })
        await refreshUser()
      } catch (error) {
        console.error("Failed to save bio:", error)
        showToast(t("alerts.bioSaveFailed"), "error")
      } finally {
        setSavingBio(false)
      }
    }
    setIsEditing(false)
  }

  const handleOpenSettings = () => {
    setNicknameDraft(user?.nickname ?? "")
    setSettingsView("main")
    setShowDeleteConfirm(false)
    setDeleteConfirmText("")
    setShowSettings(true)
  }

  const loadBlockedUsers = async () => {
    setLoadingBlocked(true)
    try {
      const data = await blocksApi.getBlockedUsers()
      setBlockedUsers(data)
    } catch (error) {
      console.error("Failed to load blocked users:", error)
      showToast(t("settings.loadBlockedFailed"), "error")
    } finally {
      setLoadingBlocked(false)
    }
  }

  const handleOpenBlockedList = () => {
    setSettingsView("blocked")
    loadBlockedUsers()
  }

  const handleUnblock = async (blockedUserId: string) => {
    setUnblockingId(blockedUserId)
    try {
      await blocksApi.unblockUser(blockedUserId)
      setBlockedUsers((prev) => prev.filter((u) => u.id !== blockedUserId))
    } catch (error) {
      console.error("Failed to unblock user:", error)
      showToast(t("settings.unblockFailed"), "error")
    } finally {
      setUnblockingId(null)
    }
  }

  const handleSaveNickname = async () => {
    const nextNickname = nicknameDraft.trim()
    if (nextNickname === (user?.nickname ?? "")) return
    setSavingNickname(true)
    try {
      await usersApi.updateProfile({ nickname: nextNickname })
      await refreshUser()
      showToast(t("settings.nicknameSaved"), "success")
    } catch (error) {
      console.error("Failed to save nickname:", error)
      showToast(t("settings.nicknameSaveFailed"), "error")
    } finally {
      setSavingNickname(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toLowerCase() !== DELETE_CONFIRM_PHRASE) return
    setDeletingAccount(true)
    try {
      await usersApi.deleteAccount()
      await logout()
    } catch (error) {
      console.error("Failed to delete account:", error)
      showToast(t("settings.deleteAccountFailed"), "error")
      setDeletingAccount(false)
    }
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
                onClick={handleClearBanner}
                aria-label={t("removeBanner")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all active:scale-90"
              >
                <X size={14} className="text-white" />
              </button>
            )}
            <button
              onClick={() => bannerInputRef.current?.click()}
              aria-label={t("editBanner")}
              disabled={uploadingBanner}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all active:scale-90 disabled:opacity-60"
            >
              {uploadingBanner ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
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
            <div className="h-full w-full rounded-full overflow-hidden border-4 border-black dark:border-white">
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
          <button
            onClick={handleToggleEditing}
            disabled={savingBio}
            className="h-9 px-5 rounded-full border border-[#EBEBF0] bg-white text-[13px] font-bold text-[#1A1A2E] transition-all active:scale-95 disabled:opacity-60"
          >
            {savingBio ? t("savingProfile") : isEditing ? t("doneEditing") : t("editProfile")}
          </button>
          <button
            onClick={handleOpenSettings}
            aria-label={t("settings.title")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EBEBF0] bg-white transition-all active:scale-90"
          >
            <Settings size={16} className="text-[#1A1A2E]" />
          </button>
        </div>

        {/* Info block — spacer pushes below avatar */}
        <div className="mt-10">
          <p className="text-[19px] font-extrabold text-[#1A1A2E] leading-tight">{user?.name || t("defaultUser")}</p>
          <p className="text-[14px] text-[#8E8E93] mt-0.5">@{username}</p>

          {isEditing ? (
            <textarea
              autoFocus
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              placeholder={t("addBio")}
              maxLength={300}
              rows={2}
              className="mt-2 w-full rounded-xl border border-[#EBEBF0] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none focus:border-[#000000] resize-none leading-relaxed"
            />
          ) : (
            <p className="mt-2 text-[14px] text-[#1A1A2E] leading-[1.5]">
              {user?.bio || <span className="text-[#C7C7CC]">{t("addBio")}</span>}
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
            <button onClick={() => setActiveTab(1)} className="flex items-center gap-1 active:opacity-70">
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
                  showRanking
                  postRank={postRanks.get(post.id)}
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

      {/* ── Fotos tab: profile photo + match/swipe gallery, managed inline ── */}
      {activeTab === 1 && (
        <div className="p-4">
          <p className="text-xs text-[#8E8E93] leading-snug mb-3">
            {t("photosExplainer")}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {/* Slot 0: the principal photo — backend-persisted, shown everywhere else.
                Empty ("primera publicación") shows a + tile just like the gallery slots. */}
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              {user?.photoUrl ? (
                <>
                  <ProfileAvatarImage photoUrl={user.photoUrl} name={user?.name || "?"} fill rounded="rounded-2xl" />
                  <div className="absolute inset-0 ring-2 ring-[#000000] ring-inset rounded-2xl pointer-events-none" />
                  <div className="absolute top-1.5 left-1.5 bg-[#000000] rounded-full px-1.5 py-0.5">
                    <span className="text-[9px] font-bold text-white">{t("main")}</span>
                  </div>
                  {uploadingMainPhoto ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    </div>
                  ) : (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      <button
                        onClick={handleRemoveMainPhoto}
                        aria-label={t("removeProfilePhoto")}
                        className="h-6 w-6 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all active:scale-90"
                      >
                        <X size={12} className="text-white" />
                      </button>
                      <button
                        onClick={() => mainCameraInputRef.current?.click()}
                        aria-label={t("editProfilePhoto")}
                        className="h-6 w-6 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all active:scale-90"
                      >
                        <Camera size={12} className="text-white" />
                      </button>
                    </div>
                  )}
                </>
              ) : uploadingMainPhoto ? (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-[#EBEBF0] bg-[#F8F8FA]">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8E8E93] border-t-transparent" />
                </div>
              ) : (
                <button
                  onClick={() => mainCameraInputRef.current?.click()}
                  aria-label={t("addFirstPhoto")}
                  className="w-full h-full flex items-center justify-center border-2 border-dashed border-[#EBEBF0] bg-[#F8F8FA] transition-all active:scale-95"
                >
                  <Plus size={22} className="text-[#C7C7CC]" />
                </button>
              )}
            </div>

            {/* Slots 1-8: the additional match/swipe gallery photos, shown on Descubrir cards */}
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
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
              </div>
            ))}

            {/* Next empty gallery slot — always visible up to maxPhotos */}
            {photos.length < maxPhotos && (
              <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-[#EBEBF0] bg-[#F8F8FA]">
                {uploadingGalleryPhoto ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#8E8E93] border-t-transparent" />
                  </div>
                ) : (
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full h-full flex items-center justify-center transition-all active:scale-95"
                  >
                    <Plus size={22} className="text-[#C7C7CC]" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Settings Sheet ── */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setShowSettings(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#EBEBF0] rounded-full mx-auto mt-4 mb-1" />
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#EBEBF0]">
              {settingsView === "blocked" && (
                <button
                  onClick={() => setSettingsView("main")}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-[#EBEBF0] transition-all active:scale-90 -ml-1"
                >
                  <ChevronLeft size={16} className="text-[#8E8E93]" />
                </button>
              )}
              <h3 className="text-base font-bold text-[#1A1A2E] flex-1">
                {settingsView === "blocked" ? t("settings.blockedTitle") : t("settings.title")}
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-[#EBEBF0] transition-all active:scale-90"
              >
                <X size={16} className="text-[#8E8E93]" />
              </button>
            </div>

            {settingsView === "blocked" ? (
              <div className="p-4 pb-8">
                {loadingBlocked ? (
                  <div className="flex justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#000000] border-t-transparent" />
                  </div>
                ) : blockedUsers.length === 0 ? (
                  <p className="text-[13px] text-[#8E8E93] text-center py-10">{t("settings.noBlockedUsers")}</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {blockedUsers.map((blockedUser) => (
                      <div key={blockedUser.id} className="flex items-center gap-3 py-2">
                        <ProfileAvatarImage photoUrl={blockedUser.photoUrl} name={blockedUser.name} size={40} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#1A1A2E] truncate">{blockedUser.name}</p>
                          <p className="text-[12px] text-[#8E8E93] truncate">{blockedUser.major}</p>
                        </div>
                        <button
                          onClick={() => handleUnblock(blockedUser.id)}
                          disabled={unblockingId === blockedUser.id}
                          className="h-8 px-3.5 rounded-full border border-[#EBEBF0] text-[12px] font-semibold text-[#1A1A2E] transition-all active:scale-95 disabled:opacity-50"
                        >
                          {unblockingId === blockedUser.id ? t("settings.unblocking") : t("settings.unblock")}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 pb-8 flex flex-col gap-5">
                {/* Idioma */}
                <button
                  onClick={() => setLocale(locale === "es" ? "en" : "es")}
                  className="flex items-center justify-between rounded-2xl border border-[#EBEBF0] px-4 py-3 transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-[#1A1A2E]">
                    <Globe size={15} />
                    {t("settings.language")}
                  </span>
                  <span className="text-[13px] font-semibold text-[#8E8E93] uppercase">{locale}</span>
                </button>

                {/* Bloqueados */}
                <button
                  onClick={handleOpenBlockedList}
                  className="flex items-center justify-between rounded-2xl border border-[#EBEBF0] px-4 py-3 transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-[#1A1A2E]">
                    <Ban size={15} />
                    {t("settings.blocked")}
                  </span>
                  <ChevronRight size={16} className="text-[#C7C7CC]" />
                </button>

                {/* Información personal */}
                <div>
                  <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">
                    {t("settings.personalInfo")}
                  </p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] text-[#8E8E93]">{t("nickname")}</label>
                      <div className="flex gap-2 mt-1">
                        <input
                          value={nicknameDraft}
                          onChange={(e) => setNicknameDraft(e.target.value)}
                          placeholder={t("nicknamePlaceholder")}
                          className="flex-1 min-w-0 rounded-xl border border-[#EBEBF0] bg-white px-3 py-2 text-[13px] text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none focus:border-[#000000]"
                        />
                        <button
                          onClick={handleSaveNickname}
                          disabled={savingNickname || nicknameDraft.trim() === (user?.nickname ?? "")}
                          className="px-4 rounded-xl bg-[#000000] text-white text-[12px] font-semibold transition-all active:scale-95 disabled:opacity-40"
                        >
                          {savingNickname ? t("settings.saving") : t("settings.save")}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#8E8E93] mt-1">{t("settings.nicknameHint")}</p>
                    </div>

                    <div>
                      <label className="text-[11px] text-[#8E8E93]">{t("fullName")}</label>
                      <p className="mt-1 rounded-xl bg-[#F8F8FA] px-3 py-2 text-[13px] text-[#8E8E93]">{user?.name}</p>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#8E8E93]">{t("email")}</label>
                      <p className="mt-1 rounded-xl bg-[#F8F8FA] px-3 py-2 text-[13px] text-[#8E8E93] truncate">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#8E8E93]">{t("major")}</label>
                      <p className="mt-1 rounded-xl bg-[#F8F8FA] px-3 py-2 text-[13px] text-[#8E8E93]">{user?.major}</p>
                    </div>
                  </div>
                </div>

                {/* Borrar cuenta */}
                <div className="border-t border-[#EBEBF0] pt-4">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-[13px] font-semibold text-[#FF3B30]"
                    >
                      {t("settings.deleteAccount")}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-[13px] font-semibold text-[#FF3B30]">{t("settings.deleteConfirmPrompt")}</p>
                      <p className="text-[12px] text-[#8E8E93] leading-snug">
                        {t("settings.deleteConfirmInstructions", { phrase: DELETE_CONFIRM_PHRASE })}
                      </p>
                      <input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder={DELETE_CONFIRM_PHRASE}
                        className="rounded-xl border border-[#FF3B30]/30 bg-white px-3 py-2 text-[13px] text-[#1A1A2E] outline-none focus:border-[#FF3B30]"
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText("") }}
                          className="flex-1 h-9 rounded-full border border-[#EBEBF0] text-[13px] font-semibold text-[#1A1A2E] transition-all active:scale-95"
                        >
                          {t("settings.cancel")}
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText.trim().toLowerCase() !== DELETE_CONFIRM_PHRASE || deletingAccount}
                          className="flex-1 h-9 rounded-full bg-[#FF3B30] text-white text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-40"
                        >
                          {deletingAccount ? t("settings.deleting") : t("settings.confirmDelete")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <input ref={mainCameraInputRef} type="file" accept="image/*" capture="user" onChange={handleMainPhotoFile} className="hidden" />
      <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoFile} className="hidden" />
    </div>
  )
}
