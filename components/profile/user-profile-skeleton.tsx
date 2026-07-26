import { Skeleton, SkeletonAvatar } from "@/components/ui/skeleton"

export function UserProfileSkeleton() {
  return (
    <div className="absolute inset-0 z-50 bg-[#F8F8FA] overflow-y-auto">
      {/* Banner */}
      <div className="relative w-full h-[110px] bg-gradient-to-br from-[#000000] via-[#171717] to-[#404040] flex-shrink-0" />

      {/* Avatar + info */}
      <div className="relative px-4 pb-3">
        <div className="absolute -top-[46px] left-4">
          <SkeletonAvatar className="h-[90px] w-[90px] border-4 border-[#F8F8FA]" />
        </div>
        <div className="h-9 pt-3" />
        <div className="mt-10 space-y-2">
          <Skeleton className="h-5 w-36 rounded-lg" />
          <Skeleton className="h-3.5 w-24 rounded-lg" />
          <Skeleton className="h-3.5 w-40 rounded-lg mt-2.5" />
          <Skeleton className="h-3.5 w-28 rounded-lg mt-2.5" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#EBEBF0] px-5 py-3">
        <Skeleton className="h-4 w-14 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-lg" />
      </div>

      {/* Posts skeleton */}
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl cloud-shadow p-4 space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonAvatar size="sm" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24 rounded-lg" />
                <Skeleton className="h-2.5 w-32 rounded-lg" />
              </div>
            </div>
            <Skeleton className="w-full aspect-square rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
