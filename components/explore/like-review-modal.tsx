"use client"

import { Heart, X, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { PhotoGallery } from "@/components/explore/photo-gallery"
import { getDisplayPhotos } from "@/lib/photos"

interface LikeReviewUser {
  id: string
  name: string
  major: string
  photoUrl?: string | null
  photos?: string[] | null
}

/**
 * Full-bleed "as if you were inside Discover" review card: the same photo +
 * bottom-gradient treatment as the swipe deck, but for a single incoming like
 * with accept/reject actions instead of swipe gestures.
 */
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
    <div className="fixed inset-0 z-50 bg-black animate-fadeIn" onClick={onClose}>
      <div className="relative h-full w-full" onClick={(e) => e.stopPropagation()}>
        <PhotoGallery
          photos={getDisplayPhotos(user.photoUrl, user.photos)}
          alt={user.name}
          className="h-full w-full"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/90 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-all active:scale-90 z-10"
        >
          <X size={18} className="text-white" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-16">
          <h2 className="text-[32px] font-bold text-white leading-tight drop-shadow">{user.name}</h2>
          <p className="text-base text-white/80 mt-1">{user.major}</p>
          <p className="text-sm text-white/90 mt-4">
            💛 {t("likedYourProfile")}
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onReject}
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <X size={18} /> {t("reject")}
            </button>
            <button
              onClick={onLikeBack}
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-semibold cloud-shadow-blue transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill="currentColor" />}
              {t("like")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
