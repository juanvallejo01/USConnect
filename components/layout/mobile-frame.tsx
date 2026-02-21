import type { ReactNode } from "react"
import { StatusBar } from "./status-bar"

interface MobileFrameProps {
  children: ReactNode
  showStatusBar?: boolean
}

export function MobileFrame({ children, showStatusBar = true }: MobileFrameProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="relative flex h-[844px] w-full max-w-[390px] flex-col overflow-hidden rounded-none sm:rounded-[44px] sm:shadow-2xl sm:ring-1 sm:ring-border bg-background">
        {showStatusBar && <StatusBar />}
        {children}
        <div className="flex justify-center pb-2 bg-card/80">
          <div className="h-1 w-32 rounded-full bg-foreground/20" />
        </div>
      </div>
    </div>
  )
}
