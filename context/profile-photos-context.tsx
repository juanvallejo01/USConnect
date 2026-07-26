"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const STORAGE_KEY = "usc_profile_photos"

/**
 * The additional photos used for match/swipe cards — separate from the
 * "principal" profile photo, which is backend-persisted on `User.photoUrl`
 * and shown everywhere else (feed, search, ranking, chat, profile).
 */
interface ProfilePhotosContextType {
  photos: string[]
  addPhoto: (url: string) => void
  removePhoto: (index: number) => void
}

const ProfilePhotosContext = createContext<ProfilePhotosContextType>({
  photos: [],
  addPhoto: () => {},
  removePhoto: () => {},
})

export function ProfilePhotosProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<string[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setPhotos(JSON.parse(stored))
    } catch {}
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos))
  }, [photos])

  function addPhoto(url: string) {
    setPhotos((prev) => (prev.includes(url) ? prev : [...prev, url]))
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <ProfilePhotosContext.Provider value={{ photos, addPhoto, removePhoto }}>
      {children}
    </ProfilePhotosContext.Provider>
  )
}

export function useProfilePhotos() {
  return useContext(ProfilePhotosContext)
}
