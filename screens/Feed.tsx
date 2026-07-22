"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, X, Image as ImageIcon, Trash2, Camera, Search } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { GradientHeader } from "@/components/layout/gradient-header"
import { Logo } from "@/components/layout/logo"
import { PostCard } from "@/components/feed/post-card"
import { PostCardSkeletonList } from "@/components/feed/post-card-skeleton"
import { UserProfile } from "./UserProfile"
import { useAuth } from "@/context/auth-context"
import { postsApi, usersApi } from "@/lib/api-client"
import { FEED_POSTS } from "@/utils/constants"

interface Post {
  id: string
  content: string
  imageUrl?: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  user: {
    id: string
    name: string
    major: string
  }
}

interface SearchResult {
  id: string
  name: string
  major: string
}

export function FeedPage() {
  const t = useTranslations("feed")
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFeed()
  }, [])

  useEffect(() => {
    const query = searchQuery.trim()
    if (!query) {
      setSearchResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const timeout = setTimeout(async () => {
      try {
        const data = await usersApi.searchUsers(query)
        setSearchResults(data)
      } catch (error) {
        console.error("Failed to search users:", error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  const handleSelectSearchResult = (id: string) => {
    setSelectedUserId(id)
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  const loadFeed = async () => {
    try {
      setLoading(true)
      const data = await postsApi.getFeed()
      setPosts(data)
    } catch (error) {
      console.error("Failed to load feed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (selectedImages.length + files.length > 10) {
      alert(t("alerts.maxImages"))
      return
    }
    const validFiles: File[] = []
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue
      if (file.size > 5 * 1024 * 1024) continue
      validFiles.push(file)
    }
    if (validFiles.length === 0) return
    setSelectedImages([...selectedImages, ...validFiles])
    const newPreviews: string[] = []
    let completed = 0
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        completed++
        if (completed === validFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
    if (currentPreviewIndex >= newPreviews.length && newPreviews.length > 0) {
      setCurrentPreviewIndex(newPreviews.length - 1)
    } else if (newPreviews.length === 0) {
      setCurrentPreviewIndex(0)
    }
  }

  const handleRemoveAllImages = () => {
    setSelectedImages([])
    setImagePreviews([])
    setCurrentPreviewIndex(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCreatePost = async () => {
    if (creating) return
    
    // Debe haber al menos una imagen
    if (selectedImages.length === 0) {
      alert(t("alerts.needImage"))
      return
    }
    
    try {
      setCreating(true)

      const newPost = await postsApi.createPost({
        content: newPostContent.trim(),
        imageUrl: imagePreviews.length > 1
          ? JSON.stringify(imagePreviews)
          : imagePreviews.length === 1
            ? imagePreviews[0]
            : undefined,
      })

      setPosts([newPost, ...posts])
      setNewPostContent("")
      setSelectedImages([])
      setImagePreviews([])
      setCurrentPreviewIndex(0)
      setShowCreatePost(false)
    } catch (error: any) {
      console.error("Failed to create post:", error)
      alert(error?.response?.data?.message || t("alerts.createFailed"))
    } finally {
      setCreating(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      setPosts(posts.map((p) =>
        p.id === postId ? { ...p, isLiked: true, likesCount: p.likesCount + 1 } : p
      ))
      await postsApi.likePost(postId)
    } catch (error) {
      console.error("Failed to like post:", error)
      setPosts(posts.map((p) =>
        p.id === postId ? { ...p, isLiked: false, likesCount: p.likesCount - 1 } : p
      ))
    }
  }

  const handleUnlike = async (postId: string) => {
    try {
      setPosts(posts.map((p) =>
        p.id === postId ? { ...p, isLiked: false, likesCount: p.likesCount - 1 } : p
      ))
      await postsApi.unlikePost(postId)
    } catch (error) {
      console.error("Failed to unlike post:", error)
      setPosts(posts.map((p) =>
        p.id === postId ? { ...p, isLiked: true, likesCount: p.likesCount + 1 } : p
      ))
    }
  }

  const handleComment = async (postId: string, content: string) => {
    const comment = await postsApi.addComment(postId, content)
    setPosts(posts.map((p) =>
      p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    ))
    return comment
  }

  const handleDelete = async (postId: string) => {
    if (!confirm(t("alerts.deleteConfirm"))) return
    try {
      await postsApi.deletePost(postId)
      setPosts(posts.filter((p) => p.id !== postId))
    } catch (error) {
      console.error("Failed to delete post:", error)
      alert(t("alerts.deleteFailed"))
    }
  }

  if (selectedUserId) {
    return <UserProfile userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      <GradientHeader
        title={<Logo size="md" className="text-black dark:text-white" />}
        subtitle={
          <div className="relative">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true) }}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-full border border-[#EBEBF0] bg-white pl-9 pr-3 py-2 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none focus:border-[#000000] transition-colors duration-300"
              />
            </div>

            {showSearchResults && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-[#EBEBF0] shadow-lg overflow-hidden z-20 max-h-72 overflow-y-auto">
                {searching ? (
                  <p className="px-4 py-3 text-sm text-[#8E8E93]">{t("searching")}</p>
                ) : searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-[#8E8E93]">{t("noPeopleFound")}</p>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      onMouseDown={() => handleSelectSearchResult(result.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8F8FA] transition-colors duration-200 text-left"
                    >
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#000000] to-[#404040] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">
                          {result.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A2E] truncate">{result.name}</p>
                        <p className="text-xs text-[#8E8E93] truncate">{result.major}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        }
        rightAction={
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all active:scale-90"
            aria-label={t("createPost")}
          >
            <Plus size={20} className="text-white" strokeWidth={2.5} />
          </button>
        }
      />

      {/* Create Post Button - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#EBEBF0] px-4 py-3">
        <button
          onClick={() => setShowCreatePost(true)}
          className="w-full flex items-center gap-3 micro-press"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#000000] to-[#404040] flex items-center justify-center flex-shrink-0 ring-2 ring-[#000000]/20">
            <span className="text-white font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 text-left border border-[#DBDBDB] rounded-full px-4 py-2">
            <span className="text-[#8E8E93] text-[13px]">{t("whatsOnYourMind")}</span>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <PostCardSkeletonList count={4} />
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-[#000000]/10 p-6 mb-4">
              <Plus size={32} className="text-[#000000]" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{t("noPostsYet")}</h3>
            <p className="text-sm text-[#8E8E93] text-center max-w-[280px] mb-4">
              {t("beFirstToShare")}
            </p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm cloud-shadow micro-press micro-hover focus-ring"
            >
              {t("createPost")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col fade-in-up">
            {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id || ""}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onComment={handleComment}
                  onDelete={handleDelete}
                  onUserClick={setSelectedUserId}
                />
            ))}
          </div>
        )}
      </div>

      {showCreatePost && (
        <div 
          className="absolute inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreatePost(false)
              setNewPostContent("")
              handleRemoveAllImages()
            }
          }}
        >
          <div className="w-full bg-white rounded-t-[32px] max-h-[90vh] flex flex-col modal-enter">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBF0]">
              <button
                onClick={() => {
                  setShowCreatePost(false)
                  setNewPostContent("")
                  handleRemoveAllImages()
                }}
                className="p-2 hover:bg-[#F8F8FA] rounded-full micro-press micro-hover"
              >
                <X size={20} className="text-[#8E8E93]" />
              </button>
              <h2 className="text-base font-bold text-[#1A1A2E]">{t("newPost")}</h2>
              <button
                onClick={handleCreatePost}
                disabled={creating || selectedImages.length === 0}
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm cloud-shadow micro-press focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? t("posting") : t("share")}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-[#000000] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A1A2E]">{user?.name || t("defaultUser")}</p>
                  <p className="text-xs text-[#8E8E93]">{(user as any)?.major || t("defaultMajor")}</p>
                </div>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={selectedImages.length > 0 ? t("writeCaption") : t("addImageFirst")}
                rows={imagePreviews.length > 0 ? 3 : 5}
                className="w-full border-none bg-transparent px-0 py-2 text-sm text-[#1A1A2E] placeholder:text-[#C7C7CC] outline-none resize-none"
                autoFocus
                disabled={selectedImages.length === 0}
              />

              {selectedImages.length === 0 && newPostContent.trim() && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2">
                  <p className="text-xs text-amber-800">
                    {t("addImageNotice")}
                  </p>
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div className="relative w-full rounded-2xl overflow-hidden mt-4 bg-[#EBEBF0]">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={imagePreviews[currentPreviewIndex]}
                      alt={`Preview ${currentPreviewIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(currentPreviewIndex)}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                    >
                      <Trash2 size={16} className="text-white" />
                    </button>
                    {imagePreviews.length > 1 && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 rounded-full">
                        <span className="text-xs font-medium text-white">
                          {currentPreviewIndex + 1} / {imagePreviews.length}
                        </span>
                      </div>
                    )}
                    {imagePreviews.length > 1 && currentPreviewIndex > 0 && (
                      <button
                        onClick={() => setCurrentPreviewIndex(currentPreviewIndex - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                    {imagePreviews.length > 1 && currentPreviewIndex < imagePreviews.length - 1 && (
                      <button
                        onClick={() => setCurrentPreviewIndex(currentPreviewIndex + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M7.5 15L12.5 10L7.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {imagePreviews.length > 1 && (
                    <div className="flex gap-2 p-3 bg-white overflow-x-auto">
                      {imagePreviews.map((preview, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPreviewIndex(index)}
                          className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                            index === currentPreviewIndex ? "ring-2 ring-[#000000] scale-105" : "opacity-60"
                          }`}
                        >
                          <Image src={preview} alt={`Thumb ${index + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {imagePreviews.length < 10 && (
                    <div className="flex border-t border-[#EBEBF0]">
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white text-sm font-medium text-[#000000] hover:bg-[#000000]/8 transition-colors duration-300 border-r border-[#EBEBF0]"
                      >
                        <Camera size={16} /> {t("takePhoto")}
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white text-sm font-medium text-[#000000] hover:bg-[#000000]/8 transition-colors duration-300"
                      >
                        <ImageIcon size={16} /> {t("gallery")} ({imagePreviews.length}/10)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {imagePreviews.length === 0 && (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-[#C7C7CC] bg-[#F8F8FA] px-4 py-8 transition-all duration-300">
                  <div className="flex flex-col items-center gap-1 mb-5">
                    <p className="text-sm font-medium text-[#1A1A2E]">{t("addPhotos")}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 rounded-xl border border-[#000000]/30 bg-white py-4 hover:border-[#000000] hover:bg-[#000000]/5 transition-all duration-300"
                    >
                      <div className="p-2.5 rounded-full bg-[#000000]/10">
                        <Camera size={20} className="text-[#000000]" />
                      </div>
                      <span className="text-xs font-semibold text-[#1A1A2E]">{t("takePhoto")}</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex flex-col items-center gap-2 rounded-xl border border-[#000000]/30 bg-white py-4 hover:border-[#000000] hover:bg-[#000000]/5 transition-all duration-300"
                    >
                      <div className="p-2.5 rounded-full bg-[#000000]/10">
                        <ImageIcon size={20} className="text-[#000000]" />
                      </div>
                      <span className="text-xs font-semibold text-[#1A1A2E]">{t("chooseFromGallery")}</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
