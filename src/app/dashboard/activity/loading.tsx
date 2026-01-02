"use client";

import { RefreshCw, History } from "lucide-react";

// Shimmer effect component
function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  );
}

export default function ActivityLoading() {
  const activityTypes = ["All", "Created", "Edited", "Shared", "Exported", "Deleted"];

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="space-y-6 h-full">
        {/* Header - static, no skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
              <History size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-white">Activity</h1>
              <p className="text-sm text-slate-500 dark:text-neutral-400">Track your recent actions and changes</p>
            </div>
          </div>
          <button
            disabled
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400 dark:border-neutral-700"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Filter buttons - static */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {activityTypes.map((type, i) => (
            <button
              key={type}
              disabled
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                i === 0
                  ? "bg-[#1e3a8a] text-white"
                  : "bg-slate-100 text-slate-400 dark:bg-neutral-800 dark:text-neutral-500"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Activity list skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 p-6">
          <div className="space-y-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="relative flex gap-4"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {i !== 7 && (
                  <div className="absolute left-[19px] top-10 h-full w-0.5 bg-slate-100 dark:bg-neutral-800"></div>
                )}
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-neutral-800 shrink-0 relative overflow-hidden">
                  <Shimmer />
                </div>
                <div className="flex-1 pt-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-16 bg-slate-100 dark:bg-neutral-800 rounded relative overflow-hidden">
                      <Shimmer />
                    </div>
                    <div className="h-3 w-20 bg-slate-100 dark:bg-neutral-800 rounded relative overflow-hidden">
                      <Shimmer />
                    </div>
                    <div className="h-3 w-32 bg-slate-100 dark:bg-neutral-800 rounded relative overflow-hidden">
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
