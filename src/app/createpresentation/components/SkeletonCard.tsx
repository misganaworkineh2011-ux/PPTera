"use client";

export default function SkeletonCard({ index }: { index: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/90 backdrop-blur-sm p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200">
          <span className="text-xs font-bold text-slate-400">{index + 1}</span>
        </div>
        <div className="h-4 bg-slate-200 rounded flex-1" />
      </div>
      <div className="space-y-2 pl-10">
        <div className="h-2.5 bg-slate-100 rounded w-full" />
        <div className="h-2.5 bg-slate-100 rounded w-5/6" />
        <div className="h-2.5 bg-slate-100 rounded w-4/6" />
      </div>
    </div>
  );
}
