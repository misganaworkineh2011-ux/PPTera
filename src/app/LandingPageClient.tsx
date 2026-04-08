"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { DiscountTopBanner } from "~/components/DiscountTopBanner";
import { getTranslations, type Language } from "~/lib/i18n";
import {
  HeroSection,
  HowItWorksSection,
  TrustedBySection,
  FeaturesSection,
  TestimonialsSection,
  CTASection,
  TemplatesSection,
  PricingSection,
} from "~/components/landing";

interface LandingPageClientProps {
  currentLang: Language;
}

export function LandingPageClient({ currentLang }: LandingPageClientProps) {
  const t = getTranslations(currentLang);

  return (
    <div className="landing-page landing-page-container min-h-screen bg-white font-sans text-zinc-900 selection:bg-black selection:text-white overflow-x-hidden">
      <LandingNavbar currentLang={currentLang} />
      <main className="relative">
        <HeroSection t={t} currentLang={currentLang} />
        <TrustedBySection />
        <FeaturesSection t={t} currentLang={currentLang} />
        <HowItWorksSection t={t} currentLang={currentLang} />
        <PricingSection t={t} currentLang={currentLang} />
        <TestimonialsSection t={t} />
        <CTASection t={t} currentLang={currentLang} />
        <TemplatesSection t={t} currentLang={currentLang} />
      </main>
      <LandingFooter currentLang={currentLang} />
    </div>
  );
}
