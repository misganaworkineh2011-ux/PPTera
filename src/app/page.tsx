"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
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

export default function HomePage() {
  const { t } = useLanguage();
  const { isSignedIn, isLoaded } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setShouldRedirect(true);
      window.location.href = "/dashboard";
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (shouldRedirect) {
    return <LoadingScreen message="Redirecting to dashboard..." />;
  }

  if (!isSignedIn) {
    return <LandingPageContent t={t} />;
  }

  return null;
}

function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-[#1e3a8a] border-r-[#06b6d4] rounded-full animate-spin"></div>
        </div>
        {message && <p className="text-slate-600">{message}</p>}
      </div>
    </div>
  );
}

function LandingPageContent({ t }: { t: any }) {
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
