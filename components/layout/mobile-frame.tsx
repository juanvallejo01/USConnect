import type { ReactNode } from "react"
import { StatusBar } from "./status-bar"

interface MobileFrameProps {
  children: ReactNode
  showStatusBar?: boolean
}

export function MobileFrame({ children, showStatusBar = true }: MobileFrameProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F0F5] outer-frame-bg transition-colors duration-300">
      <div className="relative flex h-[844px] w-full max-w-[390px] flex-col overflow-hidden rounded-none sm:rounded-[48px] sm:ring-1 sm:ring-black/5 dark:sm:ring-white/[0.04] bg-background cloud-shadow-lg dark:shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {showStatusBar && <StatusBar />}
        {children}
        <div className="flex justify-center pb-2 bg-background">
          <div className="h-[5px] w-[134px] rounded-full bg-foreground/15" />
        </div>
      </div>
    </div>
  )
}
