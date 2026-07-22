"use client"

import { LandingNav } from "@/components/landing/landing-nav"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingBenefits } from "@/components/landing/landing-benefits"
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works"
import { LandingFaq } from "@/components/landing/landing-faq"
import { LandingFooter } from "@/components/landing/landing-footer"

export function LandingPage({
  onSignIn,
  onCreateAccount,
}: {
  onSignIn: () => void
  onCreateAccount: () => void
}) {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav onSignIn={onSignIn} />
      <main>
        <LandingHero onSignIn={onSignIn} onCreateAccount={onCreateAccount} />
        <LandingBenefits />
        <LandingHowItWorks />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  )
}
