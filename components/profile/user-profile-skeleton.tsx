import { Skeleton, SkeletonAvatar, SkeletonText } from "@/components/ui/skeleton"

export function UserProfileSkeleton() {
  return (
    <div className="absolute inset-0 z-50 bg-[#F8F8FA] flex flex-col">
      {/* Header with back button */}
      <div className="bg-white border-b border-[#EBEBF0] px-4 py-3 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-lg" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile header */}
        <div className="bg-white px-6 py-6 border-b border-[#EBEBF0]">
          <div className="flex items-start gap-4 mb-4">
            <SkeletonAvatar size="xl" className="h-20 w-20" />
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36 rounded-lg" />
                <Skeleton className="h-3 w-28 rounded-lg" />
              </div>
              <Skeleton className="h-9 w-full rounded-2xl" />
            </div>
          </div>
          <SkeletonText lines={2} className="mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white px-6 py-4 border-b border-[#EBEBF0]">
          <div className="flex justify-around">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-6 w-12 rounded-lg" />
                <Skeleton className="h-3 w-16 rounded-lg" />
              </div>
            ))}
          </div>
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
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-lg" />
                <SkeletonText lines={2} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
