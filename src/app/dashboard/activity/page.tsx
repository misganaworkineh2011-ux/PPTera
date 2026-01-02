"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileEdit,
  Plus,
  UserPlus,
  Trash2,
  History,
  Eye,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { getPresentationUrl } from "~/lib/utils";
import DashboardStickyHeader from "~/components/dashboard/DashboardStickyHeader";

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  presentation?: {
    id: string;
    title: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

const ITEMS_PER_PAGE = 12;

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const fetchActivities = useCallback(
    async (page: number, type: string, isInitial = false) => {
      try {
        if (isInitial) {
          setIsLoading(true);
        } else {
          setIsPageLoading(true);
        }

        const typeParam = type !== "all" ? `&type=${type}` : "";
        const res = await fetch(
          `/api/activities?page=${page}&limit=${ITEMS_PER_PAGE}${typeParam}`
        );
        const data = await res.json();

        setActivities(data.activities || []);
        setPagination(data.pagination || null);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
        setIsPageLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchActivities(1, filter, true);
  }, []);

  // Handle filter change - reset to page 1
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
    fetchActivities(1, newFilter, false);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchActivities(newPage, filter, false);
    // Scroll to top of activity list
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getActivityConfig = (type: string) => {
    switch (type) {
      case "create":
        return {
          icon: Plus,
          color:
            "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
          label: t.created,
        };
      case "edit":
        return {
          icon: FileEdit,
          color: "bg-[#e0f2fe] text-[#06b6d4] dark:bg-[#06b6d4]/20",
          label: t.edited,
        };
      case "view":
        return {
          icon: Eye,
          color:
            "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
          label: t.viewed,
        };
      case "share":
      case "collaborate":
        return {
          icon: UserPlus,
          color:
            "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
          label: t.shared,
        };
      case "export":
        return {
          icon: Download,
          color:
            "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
          label: t.exported,
        };
      case "delete":
        return {
          icon: Trash2,
          color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
          label: t.deleted,
        };
      default:
        return {
          icon: History,
          color:
            "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300",
          label: t.activity,
        };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t.justNow;
    if (minutes < 60) return `${minutes} ${t.minAgo}`;
    if (hours < 24) return `${hours} ${hours > 1 ? t.hoursAgo : t.hourAgo}`;
    if (days < 7) return `${days} ${days > 1 ? t.daysAgo : t.dayAgo}`;
    return date.toLocaleDateString();
  };

  const activityTypes = ["all", "create", "edit", "share", "export", "delete"];

  const getFilterLabel = (type: string) => {
    const labels: Record<string, string> = {
      all: t.all || "All",
      create: t.created || "Created",
      edit: t.edited || "Edited",
      share: t.shared || "Shared",
      export: t.exported || "Exported",
      delete: t.deleted || "Deleted",
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 h-full">
        {/* Header - static with sticky behavior */}
        <DashboardStickyHeader
          icon={
            <>
              <History size={18} className="sm:hidden" />
              <History size={22} className="hidden sm:block" />
            </>
          }
          title={t.activityTitle || "Activity"}
          stickyIcon={<History size={18} />}
          stickyTitle={t.activityTitle || "Activity"}
          actions={
            <button
              disabled
              className="flex items-center gap-1.5 md:gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-slate-400 dark:border-neutral-700 dark:bg-neutral-800 whitespace-nowrap"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">{t.refresh}</span>
            </button>
          }
        />

        {/* Filter buttons - static */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {activityTypes.map((type) => (
            <button
              key={type}
              disabled
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                type === "all"
                  ? "bg-[#1e3a8a] text-white"
                  : "bg-slate-100 text-slate-400 dark:bg-neutral-800 dark:text-neutral-500"
              }`}
            >
              {getFilterLabel(type)}
            </button>
          ))}
        </div>

        {/* Activity list skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 p-6">
          <div className="space-y-6">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div key={i} className="relative flex gap-4">
                {i !== ITEMS_PER_PAGE - 1 && (
                  <div className="absolute left-[19px] top-10 h-full w-0.5 bg-slate-100 dark:bg-neutral-800"></div>
                )}
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-neutral-800 animate-pulse shrink-0" />
                <div className="flex-1 pt-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-16 bg-slate-100 dark:bg-neutral-800 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-slate-100 dark:bg-neutral-800 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-slate-100 dark:bg-neutral-800 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      <DashboardStickyHeader
        icon={
          <>
            <History size={18} className="sm:hidden" />
            <History size={22} className="hidden sm:block" />
          </>
        }
        title={t.activityTitle || "Activity"}
        stickyIcon={<History size={18} />}
        stickyTitle={t.activityTitle || "Activity"}
        actions={
          <button
            onClick={() => fetchActivities(currentPage, filter, false)}
            disabled={isPageLoading}
            className="flex items-center gap-1.5 md:gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-[#1e3a8a] hover:border-[#1e3a8a]/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw size={14} className={isPageLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{t.refresh}</span>
          </button>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {activityTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleFilterChange(type)}
            disabled={isPageLoading}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              filter === type
                ? "bg-[#1e3a8a] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            } disabled:opacity-50`}
          >
            {getFilterLabel(type)}
          </button>
        ))}
      </div>

      <div
        className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-opacity ${isPageLoading ? "opacity-60" : ""}`}
      >
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#1e3a8a] dark:text-white">
              {t.noActivity}
            </h3>
            <p className="text-sm text-slate-500 mt-1 dark:text-neutral-400">
              {t.activityEmpty}
            </p>
          </div>
        ) : (
          <div className="p-6">
            {isPageLoading && (
              <div className="flex items-center justify-center py-4 mb-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#06b6d4]" />
              </div>
            )}
            <div className="space-y-6">
              {activities.map((activity, index) => {
                const config = getActivityConfig(activity.type);
                const IconComponent = config.icon;
                return (
                  <div
                    key={activity.id}
                    className="relative flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {index !== activities.length - 1 && (
                      <div className="absolute left-[19px] top-10 h-full w-0.5 bg-slate-100 dark:bg-neutral-800"></div>
                    )}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.color}`}
                    >
                      <IconComponent size={18} />
                    </div>
                    <div className="flex flex-1 flex-col pt-1">
                      <p className="text-sm font-semibold text-[#1e3a8a] dark:text-white">
                        {activity.description}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
                        <span className={`px-1.5 py-0.5 rounded ${config.color}`}>
                          {config.label}
                        </span>
                        <span>•</span>
                        <span>{formatDate(activity.createdAt)}</span>
                        {activity.presentation && (
                          <>
                            <span>•</span>
                            <Link
                              href={getPresentationUrl(
                                activity.presentation.id,
                                activity.presentation.title
                              )}
                              className="text-[#06b6d4] hover:underline"
                            >
                              {activity.presentation.title}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-8">
          {/* Info */}
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            {t.showing || "Showing"}{" "}
            <span className="font-medium text-slate-700 dark:text-neutral-200">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            -{" "}
            <span className="font-medium text-slate-700 dark:text-neutral-200">
              {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)}
            </span>{" "}
            {t.of || "of"}{" "}
            <span className="font-medium text-slate-700 dark:text-neutral-200">
              {pagination.total}
            </span>{" "}
            {t.activities || "activities"}
          </p>

          {/* Page buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPageLoading}
              className="p-2 rounded-lg border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={18} />
            </button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-slate-400 dark:text-neutral-500"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  disabled={isPageLoading}
                  className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? "bg-[#1e3a8a] text-white"
                      : "border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800"
                  } disabled:opacity-50`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPageLoading}
              className="p-2 rounded-lg border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
