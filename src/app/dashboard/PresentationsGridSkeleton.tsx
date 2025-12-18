"use client";

import { Filter, Grid, List as ListIcon, Star } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

export default function PresentationsGridSkeleton() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  return (
    <>
      {/* Filters & View Toggle - Static, fully functional appearance */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3 sm:pb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
          <button className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-[#1e3a8a]/10 font-bold text-[#1e3a8a] dark:bg-[#1e3a8a]/30 dark:text-white">
            <Grid size={14} className="sm:hidden" />
            <Grid size={16} className="hidden sm:block" />
            {t.all || "All"}
          </button>
          <button className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a] dark:text-slate-300 dark:hover:bg-slate-700">
            <Star size={14} className="sm:hidden" />
            <Star size={16} className="hidden sm:block" />
            <span className="hidden xs:inline">{t.favorites || "Favorites"}</span>
            <span className="xs:hidden">{(t.favorites || "Favorites").slice(0, 3)}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <button className="p-1.5 sm:p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <Filter size={16} className="sm:hidden" />
              <Filter size={18} className="hidden sm:block" />
            </button>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg bg-slate-100 p-0.5 sm:p-1 dark:bg-slate-700">
            <button className="flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 bg-white text-[#1e3a8a] shadow-sm dark:bg-slate-600 dark:text-white">
              <Grid size={16} className="sm:hidden" />
              <Grid size={20} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">{t.grid || "Grid"}</span>
            </button>
            <button className="flex items-center gap-1 sm:gap-2 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <ListIcon size={16} className="sm:hidden" />
              <ListIcon size={20} className="hidden sm:block" />
              <span className="text-xs sm:text-sm font-medium hidden xs:inline">{t.list || "List"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Skeleton Grid */}
      <div className="min-h-[300px] sm:min-h-[400px] lg:min-h-[600px]">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <div className="aspect-[16/9] w-full bg-slate-200 dark:bg-slate-700" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
