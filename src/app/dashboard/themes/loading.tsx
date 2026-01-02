"use client";

import { Palette, Plus, Grid, List as ListIcon } from "lucide-react";

// Shimmer effect component
function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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

      <div className="space-y-6">
        {/* Header - static, no skeleton */}
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
              <Palette size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1e3a8a] dark:text-white">My Themes</h1>
              <p className="text-sm text-slate-500 dark:text-neutral-400">Create and manage your custom presentation themes</p>
            </div>
          </div>
          <button
            disabled
            className="flex items-center gap-1.5 md:gap-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-white shadow-lg shadow-[#06b6d4]/20 opacity-70 whitespace-nowrap"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden sm:inline">Create Custom Theme</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Filters & View Toggle - static */}
        <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-neutral-800 pb-3 sm:pb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
            <button
              disabled
              className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-[#1e3a8a]/10 dark:bg-[#1e3a8a]/30 font-bold text-[#1e3a8a] dark:text-white"
            >
              <Grid size={14} className="sm:hidden" />
              <Grid size={16} className="hidden sm:block" />
              All
            </button>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg bg-slate-100 dark:bg-neutral-800 p-0.5 sm:p-1">
            <button
              disabled
              className="flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-neutral-700 text-[#1e3a8a] dark:text-white shadow-sm"
            >
              <Grid size={16} className="sm:hidden" />
              <Grid size={20} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">Grid</span>
            </button>
            <button
              disabled
              className="flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-slate-500 dark:text-neutral-400"
            >
              <ListIcon size={16} className="sm:hidden" />
              <ListIcon size={20} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">List</span>
            </button>
          </div>
        </div>

        {/* Themes grid skeleton */}
        <div className="min-h-[300px] sm:min-h-[400px] lg:min-h-[600px]">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Color Preview skeleton */}
                <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-neutral-800 relative overflow-hidden">
                  <Shimmer />
                </div>
                {/* Content skeleton */}
                <div className="p-2 sm:p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="h-3 w-1/2 bg-slate-100 dark:bg-neutral-800 rounded relative overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-50 dark:border-neutral-800">
                    <div className="h-2.5 w-20 bg-slate-100 dark:bg-neutral-800 rounded relative overflow-hidden">
                      <Shimmer />
                    </div>
                    <div className="w-4 h-4 bg-slate-100 dark:bg-neutral-800 rounded relative overflow-hidden">
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
