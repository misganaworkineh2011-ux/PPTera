import PresentationsGridSkeleton from "./PresentationsGridSkeleton";
import StickyHeader from "./StickyHeader";

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-full animate-pulse" />
      </div>
      <PresentationsGridSkeleton />
    </div>
  );
}
