"use client"

import { useTranslations } from "next-intl"
import { GraduationCap, Users, Compass } from "lucide-react"
import { Reveal } from "./reveal"

const items = [
  { key: "onlyStudents", icon: GraduationCap },
  { key: "connect", icon: Users },
  { key: "discover", icon: Compass },
] as const

export function LandingBenefits() {
  const t = useTranslations("landing.benefits")

  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("kicker")}</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {items.map(({ key, icon: Icon }, i) => (
            <Reveal key={key} delay={i * 100}>
              <div className="landing-glass-card group h-full rounded-3xl border border-border/40 bg-card/50 p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-blue-500/25 hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="mt-5 text-base font-bold text-foreground">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
