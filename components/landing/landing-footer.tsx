"use client"

import { useTranslations } from "next-intl"
import { Logo } from "@/components/layout/logo"

export function LandingFooter() {
  const t = useTranslations("landing.footer")
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <Logo size="sm" className="text-foreground" />
          <p className="mt-1.5 text-xs text-muted-foreground">{t("tagline")}</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">{t("terms")}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t("privacy")}</a>
          <a href="#" className="hover:text-foreground transition-colors">{t("contact")}</a>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-[11px] text-muted-foreground/70 sm:text-left">
        © {year} Ve! {t("rights")}
      </p>
    </footer>
  )
}
