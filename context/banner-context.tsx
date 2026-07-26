"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const STORAGE_KEY = "usc_profile_banner"

interface BannerContextType {
  banner: string | null
  setBanner: (url: string) => void
  clearBanner: () => void
}

const BannerContext = createContext<BannerContextType>({
  banner: null,
  setBanner: () => {},
  clearBanner: () => {},
})

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banner, setBannerState] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setBannerState(stored)
    } catch {}
  }, [])

  function setBanner(url: string) {
    setBannerState(url)
    localStorage.setItem(STORAGE_KEY, url)
  }

  function clearBanner() {
    setBannerState(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <BannerContext.Provider value={{ banner, setBanner, clearBanner }}>
      {children}
    </BannerContext.Provider>
  )
}

export function useBanner() {
  return useContext(BannerContext)
}
