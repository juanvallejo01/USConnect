"use client"

import { useTranslations } from "next-intl"
import { Logo } from "@/components/layout/logo"

export function LandingNav({ onSignIn }: { onSignIn: () => void }) {
  const t = useTranslations("landing.nav")

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 px-6 py-4 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo size="sm" className="text-foreground" />
        <button
          onClick={onSignIn}
          className="text-sm font-semibold text-foreground/80 transition-all duration-300 hover:text-foreground hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
        >
          {t("signIn")}
        </button>
      </div>
    </header>
  )
}
