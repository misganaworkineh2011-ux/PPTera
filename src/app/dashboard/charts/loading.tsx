export default function ChartsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl animate-pulse" />
      </div>

      {/* Charts grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-40 bg-slate-100 rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-100 rounded animate-pulse" />
              <div className="h-6 w-16 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
