import { Skeleton, SkeletonAvatar } from "@/components/ui/skeleton"

export function UserCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl cloud-shadow p-6 space-y-4">
      {/* Avatar */}
      <div className="flex justify-center">
        <SkeletonAvatar size="xl" className="h-28 w-28" />
      </div>

      {/* Name and major */}
      <div className="text-center space-y-2">
        <Skeleton className="h-5 w-32 mx-auto rounded-lg" />
        <Skeleton className="h-3 w-40 mx-auto rounded-lg" />
      </div>

      {/* Interests tags */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
    </div>
  )
}

export function UserCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  )
}
