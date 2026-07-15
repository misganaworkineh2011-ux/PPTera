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
    <div className="landing-page landing-page-container relative min-h-screen bg-[#070b14] font-sans text-slate-100 selection:bg-cyan-400 selection:text-[#070b14] overflow-x-hidden">
      {/* Global atmosphere: one aurora the whole page floats over */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-48 left-[6%] h-[560px] w-[560px] rounded-full bg-violet-600/[0.16] blur-[150px]" />
        <div className="absolute top-[28%] right-[-160px] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.13] blur-[150px]" />
        <div className="absolute bottom-[-200px] left-[30%] h-[560px] w-[560px] rounded-full bg-fuchsia-600/[0.10] blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 68%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 68%)",
          }}
        />
      </div>
      <LandingNavbar currentLang={currentLang} />
      <main className="relative z-10">
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
