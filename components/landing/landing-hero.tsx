"use client"

import { useTranslations } from "next-intl"
import { PhoneMockup } from "./phone-mockup"

export function LandingHero({
  onSignIn,
  onCreateAccount,
}: {
  onSignIn: () => void
  onCreateAccount: () => void
}) {
  const t = useTranslations("landing.hero")

  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* Ambient decorative circles */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-black/[0.03] dark:bg-white/[0.04] blur-3xl" />

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div className="animate-fadeIn text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground">
            {t("badge")}
          </span>

          <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            {t("title")}
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground sm:text-lg lg:mx-0">
            {t("subtitle")}
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button
              onClick={onCreateAccount}
              className="w-full rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.03] active:scale-95 sm:w-auto"
            >
              {t("createAccount")}
            </button>
            <button
              onClick={onSignIn}
              className="w-full rounded-full border border-border bg-transparent px-7 py-3.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-card sm:w-auto"
            >
              {t("signIn")}
            </button>
          </div>
        </div>

        <div className="animate-scaleIn">
          <PhoneMockup />
        </div>
      </div>
    </section>
  )
}
