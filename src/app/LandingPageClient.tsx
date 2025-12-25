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
} from "~/components/landing";

export function LandingPageClient() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white overflow-x-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

      <LandingNavbar />
      <HeroSection t={t} />
      <HowItWorksSection t={t} />
      <TrustedBySection />
      <FeaturesSection t={t} />
      <TestimonialsSection t={t} />
      <CTASection t={t} />
      <LandingFooter />
    </div>
  );
}
