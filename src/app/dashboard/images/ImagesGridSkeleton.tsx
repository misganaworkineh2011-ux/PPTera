"use client";

import { Grid, List as ListIcon, Search, Sparkles, Zap } from "lucide-react";

export default function ImagesGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] dark:text-white">
            Images
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your images and generate new ones with AI
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Credits Display Skeleton */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Zap className="h-4 w-4 text-amber-500" />
            <div className="h-4 w-16 bg-amber-200 dark:bg-amber-700 rounded animate-pulse" />
          </div>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-xl font-medium opacity-80"
          >
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </button>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search images..."
            disabled
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button className="p-2 rounded-md bg-white dark:bg-slate-700 shadow-sm text-[#06b6d4]">
            <Grid className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-md text-slate-500">
            <ListIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Skeleton Grid */}
      <div className="min-h-[400px]">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-pulse">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              {/* Image Thumbnail Skeleton */}
              <div className="aspect-square w-full bg-slate-200 dark:bg-slate-700" />
              {/* Content Section */}
              <div className="p-3">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
