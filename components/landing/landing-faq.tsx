"use client"

import { useTranslations } from "next-intl"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Reveal } from "./reveal"

const questions = ["who", "privacy", "otherUniversities"] as const

export function LandingFaq() {
  const t = useTranslations("landing.faq")

  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("kicker")}</p>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{t("title")}</h2>
        </Reveal>

        <Reveal delay={100} className="mt-10">
          <Accordion type="single" collapsible className="rounded-3xl border border-border bg-card px-6">
            {questions.map((key) => (
              <AccordionItem key={key} value={key} className="border-border">
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                  {t(`items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {t(`items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
