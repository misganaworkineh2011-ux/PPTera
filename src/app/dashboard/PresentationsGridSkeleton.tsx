"use client";

import { Filter, Grid, List as ListIcon, Star } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

// Shimmer effect component
function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  );
}

export default function PresentationsGridSkeleton() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  return (
    <>
      {/* Add shimmer animation keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {/* Skeleton Grid with shimmer effect */}
      <div className="mx-auto max-w-[1400px] w-full p-4 md:p-5 lg:px-6 lg:py-4">
        {/* Quick Actions & Controls Bar completely simulated to match actual UI */}
        <div className="mb-4 flex flex-col gap-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-zinc-800/60 pb-3">
            <div className="h-10 w-[100px] bg-slate-200 dark:bg-zinc-800 rounded-2xl relative overflow-hidden">
               <Shimmer />
            </div>
            <div className="h-9 w-[140px] bg-slate-200 dark:bg-zinc-800 rounded-2xl relative overflow-hidden">
               <Shimmer />
            </div>
          </div>
        </div>

        <div className="min-h-[400px] pb-16">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-[20px] border border-slate-200/80 shadow-md ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white dark:bg-zinc-950 animate-in fade-in duration-500"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "backwards" }}
              >
                {/* Thumbnail skeleton with shimmer */}
                <div className="aspect-[16/10] w-full bg-slate-100 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 relative overflow-hidden">
                  <Shimmer />
                </div>
                {/* Content skeleton */}
                <div className="flex flex-col flex-1 p-4 lg:p-5 space-y-4">
                  <div className="h-4 w-4/5 bg-slate-200 dark:bg-zinc-800 rounded relative overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-12 bg-slate-200 dark:bg-zinc-800 rounded relative overflow-hidden">
                        <Shimmer />
                      </div>
                      <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded relative overflow-hidden">
                        <Shimmer />
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-xl bg-slate-200 dark:bg-zinc-800 relative overflow-hidden">
                      <Shimmer />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
