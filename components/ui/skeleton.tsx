import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-[#E8E8ED] skeleton-shimmer rounded-xl', className)}
      aria-live="polite"
      aria-busy="true"
      {...props}
    />
  )
}

// Specialized skeleton components
function SkeletonText({ 
  lines = 1, 
  className = "" 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3 w-full rounded-lg",
            i === lines - 1 && lines > 1 && "w-4/5"
          )}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ 
  size = "md",
  className = ""
}: { 
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const sizeClasses = {
    xs: "h-7 w-7",
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  )
}

export { Skeleton, SkeletonText, SkeletonAvatar }
