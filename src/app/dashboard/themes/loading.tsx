
"use client";

import { Palette, Plus, Grid, List as ListIcon } from "lucide-react";

// Shimmer effect component
function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
  );
}

export default function ThemesLoading() {
  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1400px] w-full p-4 md:p-5 lg:px-6 lg:py-4 space-y-4 sm:space-y-6 lg:space-y-8 h-full">
        {/* Sticky Header Simulation */}
        <div className="flex flex-row items-center justify-between gap-4 transition-all duration-300 opacity-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white shadow-md">
              <Palette size={18} className="sm:hidden" />
              <Palette size={22} className="hidden sm:block" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#0f766e] dark:text-white">My Themes</h1>
          </div>
          <button
            disabled
            className="flex items-center gap-1.5 md:gap-2 rounded-full bg-gradient-to-r from-[#0f766e] to-[#14b8a6] px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-white shadow-lg shadow-[#14b8a6]/20 opacity-70 whitespace-nowrap"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden sm:inline">Create Custom Theme</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Content Simulation */}
        <div className="w-full">
          {/* Controls layout mimicking ThemesContent */}
          <div className="mb-4 sm:mb-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/50 p-2 sm:p-3 backdrop-blur-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              {/* Type Filters (All vs Custom) */}
              <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
                 <div className="h-8 sm:h-10 w-16 sm:w-20 bg-slate-200/50 dark:bg-zinc-800/50 rounded-[10px] relative overflow-hidden"><Shimmer /></div>
                 <div className="h-8 sm:h-10 w-20 sm:w-24 bg-slate-200/50 dark:bg-zinc-800/50 rounded-[10px] relative overflow-hidden"><Shimmer /></div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 self-end sm:self-auto border-t sm:border-l sm:border-t-0 border-slate-200 dark:border-zinc-800 pt-3 sm:pt-0 sm:pl-4 min-w-0 flex-shrink-0">
                <div className="flex items-center gap-1 rounded-xl bg-slate-100/50 dark:bg-zinc-800/50 p-1">
                  <div className="h-8 sm:h-9 w-16 sm:w-20 bg-white dark:bg-zinc-700 rounded-lg shadow-sm relative overflow-hidden flex items-center justify-center">
                    <Grid size={16} className="text-slate-400" />
                    <Shimmer />
                  </div>
                  <div className="h-8 sm:h-9 w-16 sm:w-20 bg-slate-200/30 dark:bg-zinc-800/30 rounded-lg relative overflow-hidden flex items-center justify-center">
                    <ListIcon size={16} className="text-slate-400" />
                    <Shimmer />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid View Array */}
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white transition-all duration-300 dark:bg-zinc-950"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Theme Preview */}
                <div className="aspect-[16/10] w-full relative overflow-hidden border-b border-slate-100 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900/80">
                  <Shimmer />
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10 w-16 h-5 rounded-lg bg-slate-200/50 dark:bg-zinc-800/50">
                    <Shimmer />
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col p-4 bg-white dark:bg-zinc-950 gap-2">
                  <div className="h-4 w-3/4 bg-slate-200/60 dark:bg-zinc-800/60 rounded-lg relative overflow-hidden"><Shimmer /></div>
                  <div className="h-2.5 w-1/3 bg-slate-100 dark:bg-zinc-800/40 rounded-full relative overflow-hidden"><Shimmer /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
