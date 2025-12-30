"use client";

import { LoadingLink } from "~/components/LoadingLink";

interface HowItWorksSectionProps {
  t: any;
}

export function HowItWorksSection({ t }: HowItWorksSectionProps) {
  return (
    <section className="py-24 px-6 lg:px-8 bg-lime-50">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="text-[2.75rem] leading-[1.15] font-semibold tracking-tight text-zinc-900 max-w-xl lg:text-[3.25rem]">
          {t.professionalTemplatesTitle || "Professional templates for every presentation"}
        </h2>

        {/* Cards Showcase */}
        <div className="mt-12 relative">
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-hide">
            {/* Card 1 */}
            <LoadingLink href="/dashboard/themes" className="flex-shrink-0 w-64 bg-zinc-900 rounded-xl p-4 text-white hover:bg-zinc-800 transition">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900"></div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-zinc-400 mb-2">{t.themeCorporate || "Theme/Corporate"}</div>
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="text-zinc-500">{t.layouts || "Layouts"}</span>
                </div>
                <div className="text-xs">
                  <span className="text-zinc-500">{t.colors || "Colors"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-zinc-800"></div>
                  <span className="text-zinc-400">elegant-noir</span>
                </div>
              </div>
            </LoadingLink>

            {/* Card 2 */}
            <LoadingLink href="/inspiration" className="flex-shrink-0 w-48 bg-emerald-800 rounded-xl overflow-hidden hover:opacity-90 transition">
              <div className="aspect-[3/4] bg-gradient-to-b from-emerald-700 to-emerald-900 p-4">
                <p className="text-white text-lg font-serif">{t.startupPitch || "Startup Pitch"}</p>
              </div>
            </LoadingLink>

            {/* Card 3 */}
            <LoadingLink href="/inspiration" className="flex-shrink-0 w-48 bg-amber-100 rounded-xl overflow-hidden hover:opacity-90 transition">
              <div className="aspect-[3/4] p-4 flex flex-col justify-between">
                <p className="text-amber-900 text-2xl font-bold">{t.salesReport || "Sales Report"}</p>
                <div className="text-xs text-amber-700">{t.businessSeries || "Business Series"}</div>
              </div>
            </LoadingLink>

            {/* Card 4 */}
            <LoadingLink href="/inspiration" className="flex-shrink-0 w-48 bg-white rounded-xl border border-zinc-200 overflow-hidden hover:border-zinc-300 transition">
              <div className="aspect-[3/4] p-4 flex flex-col justify-between">
                <div>
                  <p className="text-4xl font-bold text-zinc-900">Q4</p>
                  <p className="text-6xl font-bold text-zinc-900">2025</p>
                </div>
                <div className="text-xs text-zinc-500">{t.quarterlyReview || "Quarterly Review"}</div>
              </div>
            </LoadingLink>

            {/* Card 5 */}
            <LoadingLink href="/inspiration" className="flex-shrink-0 w-48 bg-rose-100 rounded-xl overflow-hidden hover:opacity-90 transition">
              <div className="aspect-[3/4] p-4">
                <p className="text-rose-900 text-lg font-medium">{t.marketingPlan || "Marketing Plan"}</p>
              </div>
            </LoadingLink>
          </div>
        </div>

        {/* Link */}
        <div className="mt-8">
          <LoadingLink href="/inspiration" className="text-zinc-900 font-medium underline underline-offset-4 hover:text-zinc-600 transition">
            {t.exploreAllTemplates || "Explore all templates"}
          </LoadingLink>
        </div>
      </div>
    </section>
  );
}
