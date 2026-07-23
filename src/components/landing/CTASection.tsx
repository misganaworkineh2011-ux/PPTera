"use client";

import { useState } from "react";
import Image from "next/image";
import { SignedOut, SignedIn } from "~/lib/auth-compat";
import { LoadingLink } from "~/components/LoadingLink";
import { type Language } from "~/lib/i18n";

interface CTASectionProps {
  t: any;
  currentLang: Language;
}

// Helper to get localized path
function getLocalizedPath(path: string, lang: Language): string {
  if (lang === "en") return path;
  return `/${lang}${path}`;
}

export function CTASection({ t, currentLang }: CTASectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const localPath = (path: string) => getLocalizedPath(path, currentLang);

  // Shared classes for consistent styling - responsive text size
  const buttonClasses =
    "group relative inline-flex items-center justify-center gap-2 px-4 py-2 text-base sm:px-6 sm:py-2.5 sm:text-xl md:px-8 md:py-3 md:text-3xl font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 overflow-hidden shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-xl hover:scale-105";

  // The animation layer that expands from top-left
  const hoverEffectLayer = (
    <span className="absolute inset-0 w-full h-full bg-white origin-top scale-0 transition-transform duration-500 group-hover:scale-[2.5]" />
  );

  return (
    <section className="relative">
      {/* Animated Background Layer - Behind the image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Radial pulse rings */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`absolute rounded-full border-2 border-white/15 ${
                isHovered ? "animate-ping" : ""
              }`}
              style={{
                width: `${i * 200}px`,
                height: `${i * 200}px`,
                left: `${-i * 100}px`,
                top: `${-i * 100}px`,
                animationDelay: `${i * 150}ms`,
                animationDuration: "2s",
              }}
            />
          ))}
        </div>

        {/* Floating particles */}
        {isHovered && (
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-cyan-300/40 animate-float"
                style={{
                  left: `${10 + (i * 7)}%`,
                  top: `${5 + (i % 3) * 10}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: `${2 + (i % 3)}s`,
                }}
              />
            ))}
          </>
        )}

        {/* Gradient sweep */}
        <div
          className={`absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {/* Button Container - Centered at the top edge of the image */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -translate-y-1/2 px-4">
        <SignedOut>
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <LoadingLink href="/sign-in" className={buttonClasses}>
              {/* White Background Layer */}
              {hoverEffectLayer}

              {/* Text & Content (z-10 to sit on top of background) */}
              <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors duration-300">
                {t.startNow || "Start Now"}
                <span className="text-sm sm:text-lg md:text-xl leading-none">›</span>
              </span>
            </LoadingLink>
          </div>
        </SignedOut>

        <SignedIn>
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <LoadingLink href={localPath("/")} className={buttonClasses}>
              {/* White Background Layer */}
              {hoverEffectLayer}

              {/* Text & Content */}
              <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors duration-300">
                <span className="text-sm sm:text-lg md:text-xl leading-none text-emerald-400 group-hover:text-black transition-colors duration-300">
                  ›
                </span>
                {t.goToDashboard || "Go to Dashboard"}
              </span>
            </LoadingLink>
          </div>
        </SignedIn>
      </div>

      {/* Full Image - Responsive sizes for better performance */}
      <Image
        src="/background.png"
        alt="Get started with PPTera"
        width={1920}
        height={1080}
        sizes="100vw"
        quality={75}
        className="w-full h-auto block relative z-[1]"
        priority
      />

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.6;
          }
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}