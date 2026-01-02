export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-28 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
      </div>

      {/* Settings sections skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-slate-200 bg-white space-y-4"
          >
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-12 bg-slate-200 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
