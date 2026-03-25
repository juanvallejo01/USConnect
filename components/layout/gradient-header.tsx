import type { ReactNode } from "react"

interface GradientHeaderProps {
  title: string
  subtitle?: string
  rightAction?: ReactNode
}

export function GradientHeader({ title, subtitle, rightAction }: GradientHeaderProps) {
  return (
    <div className="relative px-6 pt-4 pb-4 bg-background border-b border-border/60">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {rightAction}
      </div>
    </div>
  )
}
