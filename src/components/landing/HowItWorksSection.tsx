"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { LoadingLink } from "~/components/LoadingLink";
import { type Language } from "~/lib/i18n";

interface HowItWorksSectionProps {
  t: any;
  currentLang: Language;
}

// Helper to get localized path
function getLocalizedPath(path: string, lang: Language): string {
  if (lang === "en") return path;
  return `/${lang}${path}`;
}

export function HowItWorksSection({ t, currentLang }: HowItWorksSectionProps) {
  const localPath = (path: string) => getLocalizedPath(path, currentLang);
  
  return (
    <section className="py-24 px-6 lg:px-8 border-t border-white/10 bg-white/[0.02]">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="text-[2.75rem] leading-[1.15] font-semibold tracking-tight text-white max-w-xl lg:text-[3.25rem]">
          {t.professionalTemplatesTitle || "Professional templates for every presentation"}
        </h2>

        {/* Cards Showcase */}
        <div className="mt-12 relative">
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-hide">
            {/* Card 1 - Themes */}
            <SignedOut>
              <LoadingLink href="/sign-in" className="flex-shrink-0 w-64 bg-white/[0.06] border border-white/10 rounded-xl p-4 text-white hover:bg-white/10 transition text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-600 border-2 border-[#0b1120]"></div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">{t.themeCorporate || "Theme/Corporate"}</div>
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="text-slate-500">{t.layouts || "Layouts"}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-500">{t.colors || "Colors"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded bg-slate-700"></div>
                      <span className="text-slate-400">elegant-noir</span>
                    </div>
                  </div>
                </LoadingLink>
            </SignedOut>
            <SignedIn>
              <LoadingLink href="/dashboard/themes" className="flex-shrink-0 w-64 bg-white/[0.06] border border-white/10 rounded-xl p-4 text-white hover:bg-white/10 transition">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-600 border-2 border-[#0b1120]"></div>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-2">{t.themeCorporate || "Theme/Corporate"}</div>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="text-slate-500">{t.layouts || "Layouts"}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500">{t.colors || "Colors"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded bg-slate-700"></div>
                    <span className="text-slate-400">elegant-noir</span>
                  </div>
                </div>
              </LoadingLink>
            </SignedIn>

            {/* Card 2 */}
            <LoadingLink href={localPath("/inspiration")} className="flex-shrink-0 w-48 bg-emerald-800 rounded-xl overflow-hidden hover:opacity-90 transition">
              <div className="aspect-[3/4] bg-gradient-to-b from-emerald-700 to-emerald-900 p-4">
                <p className="text-white text-lg font-serif">{t.startupPitch || "Startup Pitch"}</p>
              </div>
            </LoadingLink>

            {/* Card 3 */}
            <LoadingLink href={localPath("/inspiration")} className="flex-shrink-0 w-48 bg-amber-100 rounded-xl overflow-hidden hover:opacity-90 transition">
              <div className="aspect-[3/4] p-4 flex flex-col justify-between">
                <p className="text-amber-900 text-2xl font-bold">{t.salesReport || "Sales Report"}</p>
                <div className="text-xs text-amber-700">{t.businessSeries || "Business Series"}</div>
              </div>
            </LoadingLink>

            {/* Card 4 */}
            <LoadingLink href={localPath("/inspiration")} className="flex-shrink-0 w-48 bg-white rounded-xl border border-white/20 overflow-hidden hover:border-white/40 transition">
              <div className="aspect-[3/4] p-4 flex flex-col justify-between">
                <div>
                  <p className="text-4xl font-bold text-zinc-900">Q4</p>
                  <p className="text-6xl font-bold text-zinc-900">2025</p>
                </div>
                <div className="text-xs text-slate-500">{t.quarterlyReview || "Quarterly Review"}</div>
              </div>
            </LoadingLink>

            {/* Card 5 */}
            <LoadingLink href={localPath("/inspiration")} className="flex-shrink-0 w-48 bg-rose-100 rounded-xl overflow-hidden hover:opacity-90 transition">
              <div className="aspect-[3/4] p-4">
                <p className="text-rose-900 text-lg font-medium">{t.marketingPlan || "Marketing Plan"}</p>
              </div>
            </LoadingLink>
          </div>
        </div>

        {/* Link */}
        <div className="mt-8">
          <SignedOut>
            <LoadingLink href="/sign-in" className="text-white font-medium underline underline-offset-4 hover:text-slate-300 transition">
                {t.exploreAllTemplates || "Explore all templates"}
              </LoadingLink>
          </SignedOut>
          <SignedIn>
            <LoadingLink href={localPath("/")} className="text-white font-medium underline underline-offset-4 hover:text-slate-300 transition">
              {t.exploreAllTemplates || "Explore all themes"}
            </LoadingLink>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}
