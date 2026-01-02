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
} from "lucide-react";
import Link from "next/link";
import { cn, getPresentationUrl } from "~/lib/utils";
import DashboardStickyHeader from "~/components/dashboard/DashboardStickyHeader";

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
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?days=${period}`);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError("Failed to load analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header - static with sticky behavior */}
        <DashboardStickyHeader
          icon={<BarChart3 size={22} />}
          title="Analytics"
          subtitle="Track your presentation performance"
          stickyIcon={<BarChart3 size={18} />}
          stickyTitle="Analytics"
          actions={
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          }
        />

        {/* Overview Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />
                <div className="w-12 h-5 rounded bg-slate-100 dark:bg-neutral-800 animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-28 bg-slate-100 dark:bg-neutral-800 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Activity Chart Skeleton */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <div className="h-5 w-32 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse mb-6" />
          <div className="h-48 flex items-end gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-slate-200 dark:bg-neutral-800 rounded-t animate-pulse"
                style={{ height: `${Math.random() * 80 + 10}%` }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
            <div className="h-5 w-36 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-neutral-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-neutral-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
            <div className="h-5 w-36 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-slate-100 dark:bg-neutral-800 rounded animate-pulse" />
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-neutral-800 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-slate-600">{error || "Something went wrong"}</p>
      </div>
    );
  }

  const maxActivity = Math.max(
    ...data.dailyActivity.map((d) => d.presentations + d.slides / 10),
    1
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header with sticky behavior */}
      <DashboardStickyHeader
        icon={<BarChart3 size={22} />}
        title="Analytics"
        subtitle="Track your presentation performance"
        stickyIcon={<BarChart3 size={18} />}
        stickyTitle="Analytics"
        actions={
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            {data.growth.presentations !== 0 && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                data.growth.presentations > 0 ? "text-green-600" : "text-red-600"
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
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.overview.totalPresentations}
          </p>
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            Total Presentations
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.overview.totalSlides}
          </p>
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            Total Slides
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
              <Eye className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.overview.totalViews}
          </p>
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            Total Views
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {data.overview.avgSlidesPerPresentation}
          </p>
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            Avg Slides/Presentation
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-6">
          Activity Over Time
        </h3>
        <div className="h-48 flex items-end gap-1">
          {data.dailyActivity.map((day, idx) => {
            const height = ((day.presentations + day.slides / 10) / maxActivity) * 100;
            return (
              <div
                key={idx}
                className="flex-1 group relative"
              >
                <div
                  className="w-full bg-gradient-to-t from-[#1e3a8a] to-[#06b6d4] rounded-t transition-all hover:opacity-80"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                  {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  <br />
                  {day.presentations} presentations, {day.slides} slides
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{new Date(data.dailyActivity[0]?.date || "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span>{new Date(data.dailyActivity[data.dailyActivity.length - 1]?.date || "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Presentations */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Top Presentations
          </h3>
          {data.topPresentations.length > 0 ? (
            <div className="space-y-3">
              {data.topPresentations.map((pres, idx) => (
                <Link
                  key={pres.id}
                  href={getPresentationUrl(pres.id, pres.title)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 text-sm font-bold text-slate-600 dark:text-neutral-300">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {pres.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {pres.slides} slides • {new Date(pres.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Eye className="h-4 w-4" />
                    {pres.views}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              No presentations yet
            </p>
          )}
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Activity Breakdown
          </h3>
          {Object.keys(data.activityBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(data.activityBreakdown).map(([type, count]) => {
                const total = Object.values(data.activityBreakdown).reduce((a, b) => a + b, 0);
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-neutral-300 capitalize">
                        {type.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-slate-500">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              No activity in this period
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {data.overview.recentPresentations} presentations created
            </h3>
            <p className="text-white/70 text-sm">
              in the last {period} days
            </p>
          </div>
          <Link
            href="/createpresentation"
            className="px-4 py-2 bg-white text-[#1e3a8a] rounded-xl font-semibold hover:bg-slate-100 transition"
          >
            Create New
          </Link>
        </div>
      </div>
    </div>
  );
}
