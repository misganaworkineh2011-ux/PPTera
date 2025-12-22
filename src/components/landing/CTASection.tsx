"use client";

import { SignedOut, SignInButton } from "@clerk/nextjs";

interface CTASectionProps {
  t: any;
}

export function CTASection({ t }: CTASectionProps) {
  return (
    <section className="relative w-full min-h-[35vh] sm:min-h-[45vh] md:min-h-[55vh] lg:min-h-[70vh] xl:min-h-[85vh] 2xl:min-h-screen bg-gradient-to-t from-[#ff9a9e] via-[#ffd1d5] to-white flex flex-col pt-6 sm:pt-8 md:pt-10 lg:pt-14 xl:pt-18 2xl:pt-18">
      {/* Background Image - Full image shown at bottom */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://res.cloudinary.com/di76ibrro/image/upload/v1766157051/B3ackground-min_1_dyfstu.png"
          alt="Background"
          className="h-full w-full object-contain object-bottom "
        />
      </div>

      {/* Text + Button - Starts at top, scales proportionally */}
      <div className="relative z-10 mx-auto max-w-4xl text-center px-4 sm:px-6 flex-shrink-0">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl sm:mb-3 md:text-3xl md:mb-4 lg:text-4xl lg:mb-5 xl:text-5xl xl:mb-6 2xl:text-4xl 2xl:mb-8">
          {t.footerCtaTitle}
        </h2>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="h-10 w-full min-w-[140px] rounded-full bg-white px-5 text-sm font-bold text-black shadow-xl shadow-slate-900/10 transition hover:scale-105 hover:bg-slate-100 hover:shadow-2xl sm:h-12 sm:min-w-[180px] sm:px-8 sm:text-base sm:w-auto">
              {t.tryForFree}
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Spacer to push content to top */}
      <div className="flex-grow"></div>
    </section>
  );
}
