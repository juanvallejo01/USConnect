"use client"

import { Heart, X, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { UserAvatar } from "@/components/layout/user-avatar"

interface LikeReviewUser {
  id: string
  name: string
  major: string
}

export function LikeReviewModal({
  user,
  onLikeBack,
  onReject,
  onClose,
  isSubmitting,
}: {
  user: LikeReviewUser
  onLikeBack: () => void
  onReject: () => void
  onClose: () => void
  isSubmitting: boolean
}) {
  const t = useTranslations("likeReview")
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-5" onClick={onClose}>
      <div
        className="relative w-full max-w-sm bg-white dark:bg-[#141416] rounded-[32px] p-8 cloud-shadow-lg animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-[#F2F2F7] dark:bg-[#1C1C1E] transition-all active:scale-90"
        >
          <X size={16} className="text-[#8E8E93]" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-[#000000]/10 p-1">
            <UserAvatar alt={user.name} size="xl" gradientRing />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A2E] dark:text-white">{user.name}</h2>
          <p className="text-sm text-[#8E8E93] mt-0.5">{user.major}</p>
          <p className="text-sm text-[#8E8E93] mt-4">
            💛 <span className="font-semibold text-[#1A1A2E] dark:text-white">{user.name}</span> {t("likedYourProfile")}
          </p>

          <div className="flex gap-3 mt-6 w-full">
            <button
              onClick={onReject}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-2xl border-2 border-[#EBEBF0] dark:border-[#262622] text-[#1A1A2E] dark:text-white font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <X size={16} /> {t("reject")}
            </button>
            <button
              onClick={onLikeBack}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-semibold cloud-shadow-blue transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} fill="currentColor" />}
              {t("like")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
