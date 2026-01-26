"use client";

import Shimmer from "./Shimmer";

export default function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-md border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
    >
      <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-neutral-800 relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="p-3 space-y-2.5">
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="h-3 w-2/3 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-neutral-800 relative overflow-hidden">
              <Shimmer />
            </div>
            <div className="h-2.5 w-16 bg-slate-200 dark:bg-neutral-800 rounded relative overflow-hidden">
              <Shimmer />
            </div>
          </div>
          <div className="w-6 h-6 rounded bg-slate-200 dark:bg-neutral-800 relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  );
}
