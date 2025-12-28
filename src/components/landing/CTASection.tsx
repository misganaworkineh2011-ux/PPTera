"use client";

import Image from "next/image";
import { SignedOut, SignedIn, SignInButton } from "@clerk/nextjs";
import { LoadingLink } from "~/components/LoadingLink";

interface CTASectionProps {
  t: any;
}

export function CTASection({ t }: CTASectionProps) {
  // Shared classes for consistent styling
  const buttonClasses =
    "group relative inline-flex items-center justify-center gap-2 px-8 py-3 text-3xl font-semibold text-white bg-zinc-900 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105";
  
  // The animation layer that expands from top-left
  const hoverEffectLayer = (
    <span className="absolute inset-0 w-full h-full bg-white origin-top-left scale-0 transition-transform duration-500 ease-out group-hover:scale-[2.5]" />
  );

  return (
    <section className="relative">
      {/* Button Container - Centered at the top edge of the image */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -translate-y-1/2 px-4">
        
        <SignedOut>
          <SignInButton mode="modal">
            <button className={buttonClasses}>
              {/* White Background Layer */}
              {hoverEffectLayer}
              
              {/* Text & Content (z-10 to sit on top of background) */}
              <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors duration-300">
                Get started for free
                <span className="text-xl leading-none">›</span>
              </span>
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <LoadingLink href="/dashboard" className={buttonClasses}>
            {/* White Background Layer */}
            {hoverEffectLayer}

            {/* Text & Content */}
            <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors duration-300">
              <span className="text-xl leading-none text-emerald-400 group-hover:text-black transition-colors duration-300">›</span>
              Go to Dashboard
            </span>
          </LoadingLink>
        </SignedIn>

      </div>

      {/* Full Image */}
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