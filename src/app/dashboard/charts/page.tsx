"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  Grid,
  List as ListIcon,
  Loader2,
  Check,
  X,
  Pencil,
} from "lucide-react";
import ChartModal from "~/components/charts/ChartModal";
import InteractiveChart from "~/components/charts/InteractiveChart";
import { type ChartData } from "~/lib/charts/types";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import DashboardStickyHeader from "~/components/dashboard/DashboardStickyHeader";

interface SavedChart extends ChartData {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

type ViewMode = "grid" | "list";
type FilterType = "all" | "bar" | "pie" | "line" | "kpi" | "other";

export default function ChartsPage() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showChartModal, setShowChartModal] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartData | null>(null);
  const [editingChartId, setEditingChartId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Fetch charts on mount
  useEffect(() => {
    fetchCharts();
  }, []);

  // Focus rename input when renaming
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const fetchCharts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/charts");
      if (!res.ok) throw new Error("Failed to fetch charts");
      const data = await res.json();
      setCharts(
        data.charts.map((c: SavedChart) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
        }))
      );
    } catch (error) {
      console.error("Error fetching charts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter charts
  const filteredCharts = charts.filter((chart) => {
    const matchesSearch =
      chart.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chart.data.some((d) => d.label.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === "all") return matchesSearch;
    if (filterType === "other") {
      return matchesSearch && !["bar", "pie", "line", "kpi"].includes(chart.type);
    }
    return matchesSearch && chart.type === filterType;
  });

  const handleCreateChart = async (chart: ChartData) => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: chart.title || "Untitled Chart",
          type: chart.type,
          data: chart.data,
          config: chart.config,
        }),
      });

      if (!res.ok) throw new Error("Failed to create chart");
      const data = await res.json();
      
      const newChart: SavedChart = {
        ...data.chart,
        createdAt: new Date(data.chart.createdAt),
        updatedAt: data.chart.updatedAt ? new Date(data.chart.updatedAt) : undefined,
      };
      
      setCharts((prev) => [newChart, ...prev]);
      setShowChartModal(false);
      setEditingChart(null);
      setEditingChartId(null);
    } catch (error) {
      console.error("Error creating chart:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateChart = async (chart: ChartData) => {
    if (!editingChartId) return;
    
    try {
      setIsSaving(true);
      const res = await fetch(`/api/charts/${editingChartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: chart.title,
          type: chart.type,
          data: chart.data,
          config: chart.config,
        }),
      });

      if (!res.ok) throw new Error("Failed to update chart");
      const data = await res.json();
      
      setCharts((prev) =>
        prev.map((c) =>
          c.id === editingChartId
            ? {
                ...data.chart,
                createdAt: new Date(data.chart.createdAt),
                updatedAt: data.chart.updatedAt ? new Date(data.chart.updatedAt) : undefined,
              }
            : c
        )
      );
      setShowChartModal(false);
      setEditingChart(null);
      setEditingChartId(null);
    } catch (error) {
      console.error("Error updating chart:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditChart = (chartId: string) => {
    const chart = charts.find((c) => c.id === chartId);
    if (chart) {
      setEditingChart(chart);
      setEditingChartId(chartId);
      setShowChartModal(true);
    }
    setActiveMenu(null);
  };

  const handleDeleteChart = async (chartId: string) => {
    try {
      const res = await fetch(`/api/charts/${chartId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete chart");
      setCharts((prev) => prev.filter((c) => c.id !== chartId));
    } catch (error) {
      console.error("Error deleting chart:", error);
    }
    setActiveMenu(null);
  };

  const handleDuplicateChart = async (chartId: string) => {
    const chart = charts.find((c) => c.id === chartId);
    if (!chart) return;

    try {
      setIsSaving(true);
      const res = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${chart.title} (Copy)`,
          type: chart.type,
          data: chart.data,
          config: chart.config,
        }),
      });

      if (!res.ok) throw new Error("Failed to duplicate chart");
      const data = await res.json();
      
      const newChart: SavedChart = {
        ...data.chart,
        createdAt: new Date(data.chart.createdAt),
        updatedAt: data.chart.updatedAt ? new Date(data.chart.updatedAt) : undefined,
      };
      
      setCharts((prev) => [newChart, ...prev]);
    } catch (error) {
      console.error("Error duplicating chart:", error);
    } finally {
      setIsSaving(false);
    }
    setActiveMenu(null);
  };

  const startRename = (chartId: string, currentTitle: string) => {
    setRenamingId(chartId);
    setRenameValue(currentTitle || "Untitled Chart");
    setActiveMenu(null);
  };

  const handleRename = async () => {
    if (!renamingId || !renameValue.trim()) {
      setRenamingId(null);
      return;
    }

    try {
      const res = await fetch(`/api/charts/${renamingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue.trim() }),
      });

      if (!res.ok) throw new Error("Failed to rename chart");
      
      setCharts((prev) =>
        prev.map((c) =>
          c.id === renamingId ? { ...c, title: renameValue.trim() } : c
        )
      );
    } catch (error) {
      console.error("Error renaming chart:", error);
    }
    setRenamingId(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case "bar":
      case "horizontal-bar":
        return <BarChart3 size={16} />;
      case "pie":
      case "donut":
        return <PieChart size={16} />;
      case "line":
      case "area":
        return <LineChart size={16} />;
      case "kpi":
      case "comparison":
        return <TrendingUp size={16} />;
      default:
        return <BarChart3 size={16} />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <style jsx global>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
        <div className="mx-auto max-w-[1400px] w-full p-4 md:p-5 lg:px-6 lg:py-4">
          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-zinc-800/60 pb-3">
              <div className="h-10 w-full sm:max-w-xs md:max-w-md bg-slate-200 dark:bg-zinc-800 rounded-2xl relative overflow-hidden">
                 <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              <div className="flex items-center gap-3">
                 <div className="h-9 w-[180px] bg-slate-200 dark:bg-zinc-800 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                 </div>
                 <div className="h-9 w-[100px] bg-slate-200 dark:bg-zinc-800 rounded-2xl relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                 </div>
              </div>
            </div>
          </div>
          <div className="min-h-[400px] pb-16">
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-[20px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white dark:bg-zinc-950"
                >
                  <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 relative overflow-hidden">
                     <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-zinc-800 rounded relative overflow-hidden">
                       <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                    <div className="h-3 w-1/4 bg-slate-200 dark:bg-zinc-800 rounded relative overflow-hidden">
                       <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] w-full p-4 md:p-5 lg:px-6 lg:py-4">
      {/* Quick Actions & Controls Bar */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-zinc-800/60 pb-3">
          <div className="relative w-full sm:max-w-xs md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchCharts || "Search charts..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 shadow-sm shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/50 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none p-1">
              {[
                { id: "all", label: "All" },
                { id: "bar", label: "Bar", icon: <BarChart3 size={14} /> },
                { id: "pie", label: "Pie", icon: <PieChart size={14} /> },
                { id: "line", label: "Line", icon: <LineChart size={14} /> },
                { id: "kpi", label: "KPI", icon: <TrendingUp size={14} /> },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id as FilterType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all outline-none text-xs font-bold uppercase tracking-wider ${
                    filterType === filter.id
                      ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {filter.icon}
                  <span className="hidden sm:inline">{filter.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-2xl bg-white border border-slate-200 shadow-sm shadow-slate-200/50 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-none p-1">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all outline-none ${
                  viewMode === "grid"
                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Grid size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:block">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all outline-none ${
                  viewMode === "list"
                    ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <ListIcon size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:block">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid/List */}
      <div className="min-h-[400px]">
        {filteredCharts.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/50 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-slate-900/5 dark:ring-0">
              <BarChart3 size={28} className="text-[#06b6d4]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
              {searchQuery ? (t.noChartsFound || "No charts found") : (t.noChartsYet || "No charts yet")}
            </h3>
            <p className="mb-6 max-w-md text-center text-sm font-medium text-slate-500 dark:text-zinc-400">
              {searchQuery
                ? (t.tryAdjustingSearch || "Try adjusting your search or filters")
                : (t.createFirstChart || "Create your first chart to visualize data in your presentations")}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowChartModal(true)}
                className="group flex items-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-5 py-3 text-[13px] font-bold text-white dark:text-black hover:bg-slate-800 hover:shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-all outline-none focus:ring-4 focus:ring-slate-900/10 active:scale-95"
              >
                <Plus size={16} className="group-hover:scale-110 transition-transform" />
                {t.createYourFirstChart || "Create Your First Chart"}
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-16">
          {filteredCharts.map((chart) => (
            <div
              key={chart.id}
              className="group relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white transition-all duration-300 hover:border-[#06b6d4]/50 hover:-translate-y-1 dark:bg-zinc-950"
            >
              {/* Chart Preview */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900">
                <div className="absolute inset-3">
                  <InteractiveChart chart={chart} compact={true} interactive={false} />
                </div>
                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <button
                    onClick={() => handleEditChart(chart.id)}
                    className="rounded-full bg-white p-2.5 text-slate-700 shadow-lg transition-transform hover:scale-110 hover:bg-[#06b6d4] hover:text-white"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDuplicateChart(chart.id)}
                    className="rounded-full bg-white p-2.5 text-slate-700 shadow-lg transition-transform hover:scale-110 hover:bg-[#06b6d4] hover:text-white"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {/* Chart type badge */}
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#06b6d4] shadow-sm backdrop-blur-sm dark:bg-neutral-900/90">
                  {getChartIcon(chart.type)}
                  <span className="capitalize">{chart.type}</span>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {renamingId === chart.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          className="flex-1 rounded border border-[#06b6d4] bg-white px-2 py-0.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:bg-neutral-800 dark:text-white"
                        />
                        <button
                          onClick={handleRename}
                          className="rounded p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelRename}
                          className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <h3
                        className="mb-1 truncate text-sm font-bold text-slate-800 dark:text-white cursor-pointer hover:text-[#06b6d4] transition-colors"
                        title="Click to rename"
                        onClick={() => startRename(chart.id, chart.title || "Untitled Chart")}
                      >
                        {chart.title || "Untitled Chart"}
                      </h3>
                    )}
                    <p className="text-xs text-slate-500 dark:text-neutral-500">
                      {new Date(chart.createdAt).toLocaleDateString()} • {chart.data.length} data points
                    </p>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === chart.id ? null : chart.id);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {activeMenu === chart.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-44 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800 z-50">
                        <div className="p-1.5">
                          <button
                            onClick={() => startRename(chart.id, chart.title || "Untitled Chart")}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          >
                            <Pencil size={15} /> {t.rename || "Rename"}
                          </button>
                          <button
                            onClick={() => handleEditChart(chart.id)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          >
                            <Edit3 size={15} /> {t.editChart || "Edit Chart"}
                          </button>
                          <button
                            onClick={() => handleDuplicateChart(chart.id)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          >
                            <Copy size={15} /> {t.duplicate || "Duplicate"}
                          </button>
                          <div className="my-1.5 border-t border-slate-100 dark:border-neutral-700" />
                          <button
                            onClick={() => handleDeleteChart(chart.id)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                          >
                            <Trash2 size={15} /> {t.delete || "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 pb-16">
          {filteredCharts.map((chart) => (
            <div
              key={chart.id}
              className="group flex items-center gap-5 rounded-[20px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-slate-900/5 dark:ring-0 dark:border-white/10 dark:shadow-none bg-white transition-all duration-300 hover:border-[#06b6d4]/50 p-4 dark:bg-zinc-950 cursor-pointer"
            >
              <div className="h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-2 dark:from-neutral-800 dark:to-neutral-900">
                <InteractiveChart chart={chart} compact={true} interactive={false} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-[#06b6d4]/10 px-2 py-0.5 text-xs font-medium text-[#06b6d4]">
                    {getChartIcon(chart.type)}
                    <span className="capitalize">{chart.type}</span>
                  </div>
                </div>
                {renamingId === chart.id ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename();
                        if (e.key === "Escape") cancelRename();
                      }}
                      className="flex-1 max-w-xs rounded border border-[#06b6d4] bg-white px-2 py-1 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:bg-neutral-800 dark:text-white"
                    />
                    <button
                      onClick={handleRename}
                      className="rounded p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelRename}
                      className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <h3
                    className="mb-1 truncate text-base font-bold text-slate-800 dark:text-white cursor-pointer hover:text-[#06b6d4] transition-colors"
                    onClick={() => startRename(chart.id, chart.title || "Untitled Chart")}
                  >
                    {chart.title || "Untitled Chart"}
                  </h3>
                )}
                <p className="text-xs text-slate-500 dark:text-neutral-500">
                  Created {new Date(chart.createdAt).toLocaleDateString()} • {chart.data.length} data points
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startRename(chart.id, chart.title || "Untitled Chart")}
                  className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-[#06b6d4]/10 hover:text-[#06b6d4]"
                  title="Rename"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleEditChart(chart.id)}
                  className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-[#06b6d4]/10 hover:text-[#06b6d4]"
                  title="Edit"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDuplicateChart(chart.id)}
                  className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-[#06b6d4]/10 hover:text-[#06b6d4]"
                  title="Duplicate"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={() => handleDeleteChart(chart.id)}
                  className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Chart Modal */}
      <ChartModal
        isOpen={showChartModal}
        onClose={() => {
          setShowChartModal(false);
          setEditingChart(null);
          setEditingChartId(null);
        }}
        onInsert={editingChartId ? handleUpdateChart : handleCreateChart}
        existingChart={editingChart}
      />
    </div>
  );
}
