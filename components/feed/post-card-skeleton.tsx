import { Skeleton, SkeletonAvatar, SkeletonText } from "@/components/ui/skeleton"

export function PostCardSkeleton() {
  return (
    <div className="bg-white border-b border-[#EBEBF0]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28 rounded-lg" />
          <Skeleton className="h-2.5 w-40 rounded-lg" />
        </div>
      </div>

      {/* Image placeholder */}
      <Skeleton className="w-full aspect-square rounded-none" />

      {/* Action buttons */}
      <div className="flex items-center gap-4 px-4 py-3">
        <Skeleton className="h-6 w-6 rounded-lg" />
        <Skeleton className="h-6 w-6 rounded-lg" />
        <Skeleton className="h-6 w-6 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>

      {/* Content placeholder */}
      <div className="px-4 pb-3 space-y-2">
        <Skeleton className="h-3 w-16 rounded-lg" />
        <SkeletonText lines={2} />
      </div>

      {/* Timestamp */}
      <div className="px-4 pb-3">
        <Skeleton className="h-2 w-20 rounded-lg" />
      </div>
    </div>
  )
}

export function PostCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
