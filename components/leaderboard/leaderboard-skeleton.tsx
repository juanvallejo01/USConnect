import { Skeleton, SkeletonAvatar } from "@/components/ui/skeleton"

export function LeaderboardRowSkeleton() {
  return (
    <div className="bg-white rounded-3xl cloud-shadow p-5">
      <div className="flex items-center gap-4">
        {/* Rank badge */}
        <Skeleton className="h-11 w-11 rounded-2xl flex-shrink-0" />

        {/* Avatar */}
        <SkeletonAvatar size="lg" />

        {/* User info */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-lg" />
        </div>

        {/* Stats */}
        <div className="text-right space-y-2">
          <Skeleton className="h-5 w-16 ml-auto rounded-lg" />
          <Skeleton className="h-3 w-12 ml-auto rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function LeaderboardPodiumSkeleton() {
  return (
    <div className="relative h-[280px] mb-8">
      {/* Second place */}
      <div className="absolute left-0 bottom-0 w-[30%]">
        <div className="flex flex-col items-center gap-3 mb-3">
          <SkeletonAvatar size="lg" />
          <div className="space-y-1.5 w-full">
            <Skeleton className="h-3 w-20 mx-auto rounded-lg" />
            <Skeleton className="h-2.5 w-16 mx-auto rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-t-3xl" />
      </div>

      {/* First place */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[35%]">
        <div className="flex flex-col items-center gap-3 mb-3">
          <SkeletonAvatar size="xl" />
          <div className="space-y-1.5 w-full">
            <Skeleton className="h-4 w-24 mx-auto rounded-lg" />
            <Skeleton className="h-3 w-20 mx-auto rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-t-3xl" />
      </div>

      {/* Third place */}
      <div className="absolute right-0 bottom-0 w-[30%]">
        <div className="flex flex-col items-center gap-3 mb-3">
          <SkeletonAvatar size="lg" />
          <div className="space-y-1.5 w-full">
            <Skeleton className="h-3 w-20 mx-auto rounded-lg" />
            <Skeleton className="h-2.5 w-16 mx-auto rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-t-3xl" />
      </div>
    </div>
  )
}

export function LeaderboardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <>
      <LeaderboardPodiumSkeleton />
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <LeaderboardRowSkeleton key={i} />
        ))}
      </div>
    </>
  )
}
