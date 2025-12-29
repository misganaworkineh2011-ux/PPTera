"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import {
  HeroSection,
  HowItWorksSection,
  TrustedBySection,
  FeaturesSection,
  TestimonialsSection,
  CTASection,
  TemplatesSection,
} from "~/components/landing";

export function LandingPageClient() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-black selection:text-white overflow-x-hidden">
      <LandingNavbar />
      <main className="relative">
        <HeroSection t={t} />
        <TrustedBySection />
        <FeaturesSection t={t} />
        <HowItWorksSection t={t} />
        <TestimonialsSection t={t} />
        <CTASection t={t} />
        <TemplatesSection t={t} />
      </main>
      <LandingFooter />
    </div>
  );
}
