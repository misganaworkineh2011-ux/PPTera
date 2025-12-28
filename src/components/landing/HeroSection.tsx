"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight, Play } from "lucide-react";
import { LoadingLink } from "~/components/LoadingLink";
import { HeroDemo } from "./HeroDemo";

interface HeroSectionProps {
  t: any;
}

export function HeroSection({ t }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-[1400px]">
        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text */}
          <div className="max-w-xl">
            <h1 className="text-[3.5rem] leading-[1.1] font-semibold tracking-tight text-zinc-900 lg:text-[4rem]">
              {t.heroTitle}
              <br />
              <span className="text-zinc-900">{t.heroSubtitle}</span>
            </h1>
            
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              {t.heroDescription}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition">
                    {t.getStarted}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <LoadingLink 
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition"
                >
                  {t.goToDashboard}
                  <ArrowRight className="w-4 h-4" />
                </LoadingLink>
              </SignedIn>

              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition">
                <Play className="w-4 h-4 fill-current" />
                {t.seeHowItWorks}
              </button>
            </div>
          </div>

          {/* Right - Demo Visual */}
          <div className="relative">
            <HeroDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
