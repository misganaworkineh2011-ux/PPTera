"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  FileText,
  Layers,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { cn, getPresentationUrl } from "~/lib/utils";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface AnalyticsData {
  overview: {
    totalPresentations: number;
    totalSlides: number;
    totalViews: number;
    recentPresentations: number;
    avgSlidesPerPresentation: number;
  };
  growth: {
    presentations: number;
  };
  activityBreakdown: Record<string, number>;
  dailyActivity: Array<{
    date: string;
    presentations: number;
    slides: number;
    views: number;
  }>;
  topPresentations: Array<{
    id: string;
    title: string;
    views: number;
    slides: number;
    createdAt: string;
  }>;
  period: {
    days: number;
    startDate: string;
  };
}

export default function AnalyticsPage() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analytics?days=${period}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch analytics");
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load analytics";
        setError(errorMessage);
        console.error("[Analytics] Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <>
        <style jsx global>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
        <div className="max-w-[1400px] mx-auto p-4 md:p-5 lg:px-6 lg:py-4">
          {/* Period selector skeleton */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <div className="h-4 w-4 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            <div className="h-10 w-32 bg-slate-200 dark:bg-zinc-800 rounded-2xl animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </div>

          {/* Overview Cards Skeleton */}
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-none p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
                  <div className="w-12 h-5 rounded-lg bg-slate-100 dark:bg-zinc-800" />
                </div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-zinc-800 rounded-lg mb-2" />
                <div className="h-4 w-28 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Activity Chart Skeleton */}
          <div className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-none p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="h-6 w-40 bg-slate-200 dark:bg-zinc-800 rounded-lg mb-6" />
            <div className="h-48 sm:h-64 flex items-end gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-[8px] bg-slate-200 dark:bg-zinc-800 rounded-t"
                  style={{ height: `${Math.random() * 80 + 10}%` }}
                />
              ))}
            </div>
          </div>

          {/* Bottom Section Skeleton */}
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
            {[1, 2].map((section) => (
              <div key={section} className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-none p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="h-6 w-36 bg-slate-200 dark:bg-zinc-800 rounded-lg mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
                        <div className="h-3 w-1/2 bg-slate-100 dark:bg-zinc-800 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[32px] border-2 border-dashed border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/50 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-slate-900/5 dark:ring-0">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
            {t.somethingWentWrong || "Something went wrong"}
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {error || t.failedToLoadAnalytics || "Failed to load analytics"}
          </p>
        </div>
      </div>
    );
  }

  const maxActivity = Math.max(
    ...data.dailyActivity.map((d) => d.presentations + d.slides / 10),
    1
  );

  // Debug: Log activity data
  console.log('[Analytics] Daily Activity:', data.dailyActivity);
  console.log('[Analytics] Max Activity:', maxActivity);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-5 lg:px-6 lg:py-4">
      {/* Period selector */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Calendar className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-slate-900 dark:text-white shadow-sm shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] transition-all"
        >
          <option value={7}>{t.last7Days || "Last 7 days"}</option>
          <option value={30}>{t.last30Days || "Last 30 days"}</option>
          <option value={90}>{t.last90Days || "Last 90 days"}</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-5">
        <div className="group bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <FileText className="h-5 w-5 text-white" />
            </div>
            {data.growth.presentations !== 0 && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-xl",
                data.growth.presentations > 0 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}>
                {data.growth.presentations > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(data.growth.presentations)}%
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {data.overview.totalPresentations}
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {t.totalPresentations || "Total Presentations"}
          </p>
        </div>

        <div className="group bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30">
              <Layers className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {data.overview.totalSlides}
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {t.totalSlides || "Total Slides"}
          </p>
        </div>

        <div className="group bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg shadow-teal-500/30">
              <Eye className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {data.overview.totalViews}
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {t.totalViews || "Total Views"}
          </p>
        </div>

        <div className="group bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/30">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {data.overview.avgSlidesPerPresentation}
          </p>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {t.avgSlidesPerPresentation || "Avg Slides/Presentation"}
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6 mb-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
          {t.activityOverTime || "Activity Over Time"}
        </h3>
        {data.dailyActivity && data.dailyActivity.length > 0 ? (
          <>
            <div className="h-56 sm:h-64 flex items-end gap-1.5 overflow-x-auto pb-2">
              {data.dailyActivity.map((day, idx) => {
                const activityValue = day.presentations + day.slides / 10;
                const height = maxActivity > 0 ? (activityValue / maxActivity) * 100 : 0;
                const hasActivity = day.presentations > 0 || day.slides > 0;
                
                // Ensure minimum visible height for bars with activity
                const displayHeight = hasActivity ? Math.max(height, 12) : 3;
                
                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[10px] sm:min-w-[12px] group relative"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        hasActivity 
                          ? "bg-gradient-to-t from-[#14b8a6] to-[#14b8a6] hover:from-[#0d9488] hover:to-[#0d9488] cursor-pointer" 
                          : "bg-slate-100 dark:bg-zinc-800/50"
                      )}
                      style={{ height: `${displayHeight}%` }}
                    />
                    {hasActivity && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-xl">
                        <div className="font-semibold mb-0.5">
                          {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                        <div className="text-white/80">
                          {day.presentations} presentations
                        </div>
                        <div className="text-white/80">
                          {day.slides} slides
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-3 text-xs font-medium text-slate-400 dark:text-zinc-500">
              <span>{new Date(data.dailyActivity[0]?.date || "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              <span>{new Date(data.dailyActivity[data.dailyActivity.length - 1]?.date || "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-56 sm:h-64">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
              <BarChart3 className="h-6 w-6 text-slate-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              {t.noActivityData || "No activity data available"}
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
              {t.createPresentationToSeeActivity || "Create presentations to see activity"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2 mb-5">
        {/* Top Presentations */}
        <div className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {t.topPresentations || "Top Presentations"}
          </h3>
          {data.topPresentations.length > 0 ? (
            <div className="space-y-2">
              {data.topPresentations.map((pres, idx) => (
                <Link
                  key={pres.id}
                  href={getPresentationUrl(pres.id, pres.title)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-zinc-800"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#14b8a6] text-white text-sm font-bold shrink-0 shadow-lg shadow-teal-500/30">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-[#14b8a6] transition-colors">
                      {pres.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      {pres.slides} {t.slides || "slides"} • {new Date(pres.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400 shrink-0 font-medium">
                    <Eye className="h-4 w-4" />
                    {pres.views}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                <FileText className="h-6 w-6 text-slate-400 dark:text-zinc-500" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                {t.noPresentationsYet || "No presentations yet"}
              </p>
            </div>
          )}
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white dark:bg-zinc-950 rounded-[20px] border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:shadow-none p-5 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {t.activityBreakdown || "Activity Breakdown"}
          </h3>
          {Object.keys(data.activityBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(data.activityBreakdown).map(([type, count]) => {
                const total = Object.values(data.activityBreakdown).reduce((a, b) => a + b, 0);
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300 capitalize">
                        {type.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {count} <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#14b8a6] to-[#14b8a6] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
                <BarChart3 className="h-6 w-6 text-slate-400 dark:text-zinc-500" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                {t.noActivityInPeriod || "No activity in this period"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-gradient-to-br from-[#14b8a6] via-[#14b8a6] to-[#10b981] rounded-[20px] p-6 sm:p-8 text-white shadow-xl shadow-teal-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">
              {data.overview.recentPresentations} {t.presentationsCreated || "presentations created"}
            </h3>
            <p className="text-white/80 text-sm font-medium">
              {t.inTheLast || "in the last"} {period} {t.daysAgo || "days"}
            </p>
          </div>
          <Link
            href="/createpresentation"
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#14b8a6] rounded-2xl font-bold hover:bg-slate-50 hover:shadow-lg transition-all text-sm sm:text-base w-full sm:w-auto active:scale-95"
          >
            <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {t.createNew || "Create New"}
          </Link>
        </div>
      </div>
    </div>
  );
}
