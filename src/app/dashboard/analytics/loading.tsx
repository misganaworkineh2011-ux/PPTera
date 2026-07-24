"use client";

import { Calendar, BarChart3 } from "lucide-react";

// Shimmer effect component
function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  );
}

export default function AnalyticsLoading() {
  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header - static, no skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white shadow-md">
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0f766e] dark:text-white">
                Analytics
              </h1>
              <p className="text-slate-500 dark:text-neutral-400 text-sm">
                Track your presentation performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              disabled
              defaultValue={30}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm opacity-70"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Overview Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-neutral-800 relative overflow-hidden">
                  <Shimmer />
                </div>
                <div className="w-12 h-5 rounded bg-slate-100 dark:bg-neutral-800 relative overflow-hidden">
                  <Shimmer />
                </div>
              </div>
              <div className="h-8 w-16 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden mb-2">
                <Shimmer />
              </div>
              <div className="h-4 w-28 bg-slate-100 dark:bg-neutral-800 rounded relative overflow-hidden">
                <Shimmer />
              </div>
            </div>
          ))}
        </div>

        {/* Activity Chart Skeleton */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <div className="h-5 w-32 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden mb-6">
            <Shimmer />
          </div>
          <div className="h-48 flex items-end gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-slate-200 dark:bg-neutral-800 rounded-t relative overflow-hidden"
                style={{ height: `${Math.random() * 80 + 10}%` }}
              >
                <Shimmer />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
            <div className="h-5 w-36 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden mb-4">
              <Shimmer />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-neutral-800 relative overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
                      <Shimmer />
                    </div>
                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-neutral-800 rounded relative overflow-hidden">
                      <Shimmer />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
            <div className="h-5 w-36 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden mb-4">
              <Shimmer />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
                      <Shimmer />
                    </div>
                    <div className="h-4 w-16 bg-slate-100 dark:bg-neutral-800 rounded relative overflow-hidden">
                      <Shimmer />
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-neutral-800 rounded-full relative overflow-hidden">
                    <Shimmer />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
