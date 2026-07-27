import type { ReactNode } from "react"

interface GradientHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  rightAction?: ReactNode
}

export function GradientHeader({ title, subtitle, rightAction }: GradientHeaderProps) {
  return (
    <div className="relative px-6 pt-4 pb-4 bg-background border-b border-border/60">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xl font-bold text-foreground tracking-tight">{title}</div>
          {subtitle && (
            typeof subtitle === "string"
              ? <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              : <div className="mt-2">{subtitle}</div>
          )}
        </div>
        {rightAction}
      </div>
    </div>
  )
}
