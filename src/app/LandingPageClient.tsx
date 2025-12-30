"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { getTranslations, type Language } from "~/lib/i18n";
import {
  HeroSection,
  HowItWorksSection,
  TrustedBySection,
  FeaturesSection,
  TestimonialsSection,
  CTASection,
  TemplatesSection,
} from "~/components/landing";

interface LandingPageClientProps {
  currentLang: Language;
}

export function LandingPageClient({ currentLang }: LandingPageClientProps) {
  const t = getTranslations(currentLang);

  return (
    <div className="landing-page min-h-screen bg-white font-sans text-zinc-900 selection:bg-black selection:text-white overflow-x-hidden">
      <LandingNavbar currentLang={currentLang} />
      <main className="relative">
        <HeroSection t={t} />
        <TrustedBySection />
        <FeaturesSection t={t} />
        <HowItWorksSection t={t} />
        <TestimonialsSection t={t} />
        <CTASection t={t} />
        <TemplatesSection t={t} />
      </main>
      <LandingFooter currentLang={currentLang} />
    </div>
  );
}
