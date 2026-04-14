"use client";

import { Grid, List as ListIcon, Search, Sparkles } from "lucide-react";

// Shimmer effect component
function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  );
}

export default function ImagesGridSkeleton() {
  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      
      <div className="mx-auto max-w-[1400px] w-full p-4 md:p-5 lg:px-6 lg:py-4">
        {/* Quick Actions & Controls Bar completely simulated to match actual UI */}
        <div className="mb-4 flex flex-col gap-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-zinc-800/60 pb-3">
            <div className="h-10 w-[200px] sm:w-[320px] bg-slate-200 dark:bg-zinc-800 rounded-2xl relative overflow-hidden">
               <Shimmer />
            </div>
            <div className="h-9 w-[140px] bg-slate-200 dark:bg-zinc-800 rounded-2xl relative overflow-hidden">
               <Shimmer />
            </div>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="min-h-[400px] pb-16">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-[20px] border border-slate-200/80 shadow-md ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white dark:bg-zinc-950"
              >
                {/* Image Thumbnail Skeleton */}
                <div className="aspect-square w-full bg-slate-100 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 relative overflow-hidden">
                   <Shimmer />
                </div>
                {/* Content Section */}
                <div className="p-4 lg:p-5">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded relative overflow-hidden">
                     <Shimmer />
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
