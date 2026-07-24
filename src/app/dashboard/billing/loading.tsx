"use client";

import { CreditCard, TrendingUp, Zap, Clock, ChevronRight } from "lucide-react";

// Shimmer effect component
function Shimmer() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  );
}

export default function BillingLoading() {
  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 py-6">
        {/* Header - static */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white shadow-md">
            <CreditCard size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#0f766e] dark:text-white">Billing</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage your subscription and credits
            </p>
          </div>
        </div>

        {/* Current Plan Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500/10 to-blue-900/10 dark:from-teal-500/20 dark:to-blue-900/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Current Plan</p>
                <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded relative overflow-hidden mt-1">
                  <Shimmer />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Credits", "Monthly Limit", "Billing", "Resets"].map((label, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
                <div className="h-7 w-16 bg-zinc-200 dark:bg-zinc-600 rounded relative overflow-hidden">
                  <Shimmer />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Usage Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-zinc-900 dark:text-white">Credit Usage</h2>
            <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded relative overflow-hidden">
              <Shimmer />
            </div>
          </div>

          <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden mb-4">
            <div className="h-full w-1/3 bg-zinc-200 dark:bg-zinc-600 rounded-full relative overflow-hidden">
              <Shimmer />
            </div>
          </div>

          <div className="flex justify-between">
            <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded relative overflow-hidden">
              <Shimmer />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-700">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Estimated remaining:</p>
            <div className="grid grid-cols-2 gap-4">
              {["slides", "AI images"].map((label, i) => (
                <div key={i}>
                  <div className="h-8 w-12 bg-zinc-200 dark:bg-zinc-700 rounded relative overflow-hidden mb-1">
                    <Shimmer />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions - static */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <TrendingUp className="h-5 w-5 text-teal-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Upgrade</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">More credits</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>

          <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Zap className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Buy Credits</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">One-time</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>

          <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Clock className="h-5 w-5 text-zinc-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">History</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">All activity</p>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>
        </div>

        {/* Plan Features Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="font-medium text-zinc-900 dark:text-white mb-4">Plan Features</h2>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 relative overflow-hidden">
                  <Shimmer />
                </div>
                <div
                  className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded relative overflow-hidden"
                  style={{ width: `${60 + Math.random() * 30}%` }}
                >
                  <Shimmer />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-zinc-900 dark:text-white">Recent Activity</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">View all</span>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded relative overflow-hidden">
                    <Shimmer />
                  </div>
                  <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-700 rounded relative overflow-hidden">
                    <Shimmer />
                  </div>
                </div>
                <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-700 rounded relative overflow-hidden">
                  <Shimmer />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
