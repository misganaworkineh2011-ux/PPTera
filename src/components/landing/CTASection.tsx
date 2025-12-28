"use client";

import Image from "next/image";
import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import { LoadingLink } from "~/components/LoadingLink";

interface CTASectionProps {
  t: any;
}

export function CTASection({ t }: CTASectionProps) {
  return (
    <section className="relative">
      {/* Button at the very top - no padding, aligned with image top, responsive */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -translate-y-1/2 px-4">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="group relative inline-flex items-center gap-2 sm:gap-4 px-6 sm:px-10 md:px-16 py-4 sm:py-6 md:py-8 text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white bg-zinc-900 rounded-xl sm:rounded-2xl md:rounded-3xl hover:rounded-none hover:scale-105 md:hover:scale-110 transition-all duration-300 shadow-xl sm:shadow-2xl cursor-pointer overflow-hidden">
              {/* Arrow */}
              <span className="absolute left-4 sm:left-6 md:left-8 opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-emerald-400 text-2xl sm:text-3xl md:text-4xl">
                ›
              </span>
              {/* Text */}
              <span className="relative z-10">
                Get started for free
              </span>
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <LoadingLink 
            href="/dashboard"
            className="inline-flex items-center gap-2 sm:gap-4 px-6 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white bg-zinc-900 rounded-xl sm:rounded-2xl hover:bg-zinc-800 transition shadow-xl sm:shadow-2xl"
          >
            <span className="text-emerald-400 text-xl sm:text-2xl md:text-3xl lg:text-4xl">›</span>
            Go to Dashboard
          </LoadingLink>
        </SignedIn>
      </div>

      {/* Full Image - no padding */}
      <Image
        src="/background.png"
        alt="Get started"
        width={1920}
        height={1080}
        className="w-full h-auto block"
        priority
      />
    </section>
  );
}
