"use client"

import { useState } from "react"
import { Camera, LogOut, Shield } from "lucide-react"
import Image from "next/image"
import { GradientButton } from "@/components/layout/gradient-button"
import { useAuth } from "@/context/auth-context"
import { useSpark } from "@/context/spark-context"
import { DEFAULT_INTERESTS } from "@/utils/constants"

export function ProfilePage() {
  const { logout } = useAuth()
  const { openAdmin } = useSpark()
  const [bio, setBio] = useState("Film major who loves golden hour shots and exploring LA coffee shops.")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Photography", "Design", "Film", "Coffee",
  ])

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary transition-colors"
          aria-label="Log out"
        >
          <LogOut size={20} className="text-muted-foreground" />
        </button>
      </div>

      <div className="flex flex-col items-center px-6 py-6">
        <div className="relative mb-5">
          <div className="relative h-28 w-28 rounded-full overflow-hidden ring-4 ring-primary/10 ring-offset-4 ring-offset-background">
            <Image src="/images/swipe-profile.jpg" alt="Your profile photo" fill className="object-cover" />
          </div>
          <button
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-md transition-all active:scale-90"
            aria-label="Change profile photo"
          >
            <Camera size={16} className="text-primary-foreground" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-foreground">Sarah, 21</h2>
        <p className="text-sm text-muted-foreground mt-0.5">USC Film School</p>
      </div>

      <div className="px-6 pb-5">
        <label htmlFor="bio" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          About You
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-border bg-secondary px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
        />
      </div>

      <div className="px-6 pb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Interests</p>
        <div className="flex flex-wrap gap-2.5">
          {DEFAULT_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest)
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-muted-foreground border border-border hover:border-primary/30"
                }`}
              >
                {interest}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-6 pb-4">
        <GradientButton fullWidth size="lg">Save Changes</GradientButton>
      </div>

      <div className="px-6 pb-8">
        <GradientButton variant="outline" fullWidth size="lg" onClick={openAdmin}>
          <span className="flex items-center justify-center gap-2">
            <Shield size={16} />
            Admin Dashboard
          </span>
        </GradientButton>
      </div>
    </div>
  )
}
