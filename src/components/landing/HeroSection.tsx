"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Play } from "lucide-react";
import { LoadingLink } from "~/components/LoadingLink";
import { HeroDemo } from "./HeroDemo";

interface HeroSectionProps {
  t: any;
}

export function HeroSection({ t }: HeroSectionProps) {
  return (
    <section
      className="relative pt-24 pb-16 px-4 overflow-hidden flex items-center sm:pt-32 sm:pb-24 md:pt-40 md:pb-32 sm:px-6"
      style={{ minHeight: "70vh" }}
    >
      <div className="mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center sm:gap-12">
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-start text-left animate-fade-in-up">
            <h1 className="relative z-10 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl animate-fade-in-up [animation-delay:200ms]">
              {t.heroTitle} <br />
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                {t.heroSubtitle}
              </span>{" "}
              {t.heroSubtitle2}
            </h1>

            <p className="mt-4 text-base text-slate-500 max-w-xl sm:mt-6 sm:text-lg md:mt-8 md:text-xl animate-fade-in-up [animation-delay:300ms]">
              {t.heroDescription}
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col items-start gap-3 w-full sm:mt-8 sm:flex-row sm:gap-4 md:mt-10 animate-fade-in-up [animation-delay:400ms]">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="h-12 w-full min-w-[180px] rounded-full bg-black px-8 text-base font-bold text-white shadow-xl shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-800 hover:shadow-2xl sm:w-auto">
                    {t.startForFree}
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <LoadingLink
                  href="/dashboard"
                  className="flex h-12 w-full min-w-[180px] items-center justify-center rounded-full bg-black px-8 text-base font-bold text-white shadow-xl shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-800 hover:shadow-2xl sm:w-auto"
                >
                  {t.goToDashboard}
                </LoadingLink>
              </SignedIn>

              <Link
                href="#demo"
                className="flex h-12 w-full min-w-[180px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 text-base font-bold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                <Play className="h-4 w-4 fill-current" />
                {t.seeHowItWorks}
              </Link>
            </div>
          </div>

          {/* Right Column - Hero Visual */}
          <div className="relative w-full perspective-1000 animate-fade-in-right [animation-delay:500ms]">
            <HeroDemo />
          </div>
        </div>
      </div>

      {/* Fade to White at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
    </section>
  );
}
