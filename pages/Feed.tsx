"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, X, Image as ImageIcon, Trash2 } from "lucide-react"
import Image from "next/image"
import { GradientHeader } from "@/components/layout/gradient-header"
import { PostCard } from "@/components/feed/post-card"
import { useAuth } from "@/context/auth-context"

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

export function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [creating, setCreating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFeed()
  }, [])

  const loadFeed = async () => {
    try {
      setLoading(true)
      setPosts([])
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
      alert("You can only upload up to 10 images per post")
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
    if ((!newPostContent.trim() && selectedImages.length === 0) || creating) return
    try {
      setCreating(true)
      setNewPostContent("")
      setSelectedImages([])
      setImagePreviews([])
      setCurrentPreviewIndex(0)
      setShowCreatePost(false)
    } catch (error) {
      console.error("Failed to create post:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleLike = async (postId: string) => {
    setPosts(posts.map((p) =>
      p.id === postId ? { ...p, isLiked: true, likesCount: p.likesCount + 1 } : p
    ))
  }

  const handleUnlike = async (postId: string) => {
    setPosts(posts.map((p) =>
      p.id === postId ? { ...p, isLiked: false, likesCount: p.likesCount - 1 } : p
    ))
  }

  const handleComment = async (postId: string, content: string) => {
    setPosts(posts.map((p) =>
      p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
    ))
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return
    setPosts(posts.filter((p) => p.id !== postId))
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <GradientHeader
        title="Campus Feed"
        subtitle="What's happening at USC"
        rightAction={
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all active:scale-90"
            aria-label="Create post"
          >
            <Plus size={20} className="text-white" strokeWidth={2.5} />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gradient-to-br from-purple-100 to-pink-100 p-6 mb-4">
              <Plus size={32} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-sm text-gray-500 text-center max-w-[280px] mb-4">
              Be the first to share something with the campus community!
            </p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium text-sm transition-all active:scale-95"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id || ""}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onComment={handleComment}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {showCreatePost && (
        <div className="absolute inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm">
          <div className="w-full bg-white rounded-t-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <button
                onClick={() => {
                  setShowCreatePost(false)
                  setNewPostContent("")
                  handleRemoveAllImages()
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
              <h2 className="text-base font-bold text-gray-900">New Post</h2>
              <button
                onClick={handleCreatePost}
                disabled={(!newPostContent.trim() && selectedImages.length === 0) || creating}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Posting..." : "Share"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500">{(user as any)?.major || "USC Student"}</p>
                </div>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Write a caption..."
                rows={imagePreviews.length > 0 ? 3 : 5}
                className="w-full border-none bg-transparent px-0 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none"
                autoFocus
              />

              {imagePreviews.length > 0 && (
                <div className="relative w-full rounded-2xl overflow-hidden mt-4 bg-gray-100">
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
                            index === currentPreviewIndex ? "ring-2 ring-purple-600 scale-105" : "opacity-60"
                          }`}
                        >
                          <Image src={preview} alt={`Thumb ${index + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {imagePreviews.length < 10 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-white border-t border-gray-200 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      + Add More Photos ({imagePreviews.length}/10)
                    </button>
                  )}
                </div>
              )}

              {imagePreviews.length === 0 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                      <ImageIcon size={24} className="text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Add Photos</p>
                    <p className="text-xs text-gray-500">JPG, PNG • Up to 10 photos • Max 5MB each</p>
                  </div>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
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
