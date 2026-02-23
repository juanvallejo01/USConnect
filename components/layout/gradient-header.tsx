import type { ReactNode } from "react"

interface GradientHeaderProps {
  title: string
  subtitle?: string
  rightAction?: ReactNode
}

export function GradientHeader({ title, subtitle, rightAction }: GradientHeaderProps) {
  return (
    <div className="relative px-6 pt-4 pb-4 bg-gradient-to-r from-[#3C5E82] to-[#5E82AC]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>}
        </div>
        {rightAction}
      </div>
    </div>
  )
}
