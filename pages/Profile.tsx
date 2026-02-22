"use client"

import { useState } from "react"
import { Camera, LogOut, Heart } from "lucide-react"
import Image from "next/image"
import { GradientButton } from "@/components/layout/gradient-button"
import { useAuth } from "@/context/auth-context"
import { useRank } from "@/context/rank-context"
import { DEFAULT_INTERESTS } from "@/utils/constants"

export function ProfilePage() {
  const { logout } = useAuth()
  const { getUserRank } = useRank()
  const { likesReceived } = getUserRank(1) // Assuming current user is ID 1
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
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={logout}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Log out"
        >
          <LogOut size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex flex-col items-center px-6 py-6">
        <div className="relative mb-5">
          <div className="relative h-28 w-28 rounded-full overflow-hidden ring-4 ring-[#8B5CF6]/10 ring-offset-4 ring-offset-gray-50">
            <Image src="/images/swipe-profile.jpg" alt="Your profile photo" fill className="object-cover" />
          </div>
          <button
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] shadow-md transition-all active:scale-90"
            aria-label="Change profile photo"
          >
            <Camera size={16} className="text-white" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Sarah, 21</h2>
        <p className="text-sm text-gray-500 mt-0.5">USC Film School</p>
        
        {/* Likes Received Badge */}
        <div className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-4 py-2 shadow-lg">
          <Heart size={16} className="text-white" fill="white" />
          <span className="text-sm font-bold text-white">{likesReceived} {likesReceived === 1 ? 'Like' : 'Likes'}</span>
        </div>
      </div>

      <div className="px-6 pb-5">
        <label htmlFor="bio" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          About You
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 resize-none leading-relaxed"
        />
      </div>

      <div className="px-6 pb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Interests</p>
        <div className="flex flex-wrap gap-2.5">
          {DEFAULT_INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest)
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                  isSelected
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-md"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-[#8B5CF6]/30"
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
    </div>
  )
}
