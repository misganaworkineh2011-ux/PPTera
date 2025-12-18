"use client";

import { useState } from "react";
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
  Sparkles,
} from "lucide-react";
import ChartModal from "~/components/charts/ChartModal";
import InteractiveChart from "~/components/charts/InteractiveChart";
import { type ChartData, CHART_TEMPLATES } from "~/lib/charts/types";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

// Sample saved charts for demo
const SAMPLE_CHARTS: (ChartData & { id: string; createdAt: Date })[] = [
  {
    id: "1",
    type: "bar",
    title: "Q4 Sales Performance",
    data: [
      { label: "Product A", value: 45000, color: "#06b6d4" },
      { label: "Product B", value: 38000, color: "#1e3a8a" },
      { label: "Product C", value: 52000, color: "#10b981" },
      { label: "Product D", value: 31000, color: "#f59e0b" },
    ],
    config: { showValues: true, showLabels: true, colorScheme: "default" },
    createdAt: new Date("2024-12-15"),
  },
  {
    id: "2",
    type: "pie",
    title: "Market Share Distribution",
    data: [
      { label: "Our Company", value: 35, color: "#06b6d4" },
      { label: "Competitor A", value: 28, color: "#1e3a8a" },
      { label: "Competitor B", value: 22, color: "#10b981" },
      { label: "Others", value: 15, color: "#f59e0b" },
    ],
    config: { showLegend: true, showValues: true },
    createdAt: new Date("2024-12-14"),
  },
  {
    id: "3",
    type: "line",
    title: "Monthly Revenue Trend",
    data: [
      { label: "Jan", value: 120000 },
      { label: "Feb", value: 135000 },
      { label: "Mar", value: 128000 },
      { label: "Apr", value: 145000 },
      { label: "May", value: 162000 },
      { label: "Jun", value: 178000 },
    ],
    config: { showGrid: true, lineSmooth: true, showLabels: true },
    createdAt: new Date("2024-12-13"),
  },
  {
    id: "4",
    type: "kpi",
    title: "Total Revenue",
    data: [{ label: "Revenue", value: 2450000 }],
    config: { showValues: true, target: 3000000, trend: "up", trendValue: 15, prefix: "$" },
    createdAt: new Date("2024-12-12"),
  },
];

type ViewMode = "grid" | "list";
type FilterType = "all" | "bar" | "pie" | "line" | "kpi" | "other";

export default function ChartsPage() {
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  const [charts, setCharts] = useState<(ChartData & { id: string; createdAt: Date })[]>(SAMPLE_CHARTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showChartModal, setShowChartModal] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartData | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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

  const handleCreateChart = (chart: ChartData) => {
    const newChart = {
      ...chart,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCharts((prev) => [newChart, ...prev]);
    setShowChartModal(false);
    setEditingChart(null);
  };

  const handleEditChart = (chartId: string) => {
    const chart = charts.find((c) => c.id === chartId);
    if (chart) {
      setEditingChart(chart);
      setShowChartModal(true);
    }
    setActiveMenu(null);
  };

  const handleDeleteChart = (chartId: string) => {
    setCharts((prev) => prev.filter((c) => c.id !== chartId));
    setActiveMenu(null);
  };

  const handleDuplicateChart = (chartId: string) => {
    const chart = charts.find((c) => c.id === chartId);
    if (chart) {
      const duplicate = {
        ...chart,
        id: Date.now().toString(),
        title: `${chart.title} (Copy)`,
        createdAt: new Date(),
      };
      setCharts((prev) => [duplicate, ...prev]);
    }
    setActiveMenu(null);
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t.charts || "Charts"}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create and manage interactive charts for your presentations
          </p>
        </div>
        <button
          onClick={() => {
            setEditingChart(null);
            setShowChartModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#0891b2] px-4 py-2.5 font-medium text-white transition-all hover:shadow-lg hover:shadow-[#06b6d4]/25"
        >
          <Plus size={18} />
          Create Chart
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search charts..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
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
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  filterType === filter.id
                    ? "bg-white text-[#06b6d4] shadow-sm dark:bg-slate-600"
                    : "text-slate-600 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                {filter.icon}
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-1 dark:bg-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-2 transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#06b6d4] shadow-sm dark:bg-slate-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-2 transition-all ${
                viewMode === "list"
                  ? "bg-white text-[#06b6d4] shadow-sm dark:bg-slate-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid/List */}
      {filteredCharts.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700">
            <BarChart3 size={32} className="text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-300">
            {searchQuery ? "No charts found" : "No charts yet"}
          </h3>
          <p className="mb-6 max-w-md text-center text-sm text-slate-500 dark:text-slate-400">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Create your first chart to visualize data in your presentations"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowChartModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#06b6d4] px-4 py-2 font-medium text-white transition-colors hover:bg-[#0891b2]"
            >
              <Sparkles size={16} />
              Create Your First Chart
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCharts.map((chart) => (
            <div
              key={chart.id}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-[#06b6d4]/50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="h-40 overflow-hidden bg-slate-50 p-4 dark:bg-slate-700/50">
                <InteractiveChart chart={chart} compact={true} interactive={false} />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[#06b6d4]">{getChartIcon(chart.type)}</span>
                      <h3 className="truncate font-semibold text-slate-800 dark:text-white">
                        {chart.title || "Untitled Chart"}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(chart.createdAt).toLocaleDateString()} • {chart.type}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === chart.id ? null : chart.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {activeMenu === chart.id && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                        <div className="p-1">
                          <button
                            onClick={() => handleEditChart(chart.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <Edit3 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDuplicateChart(chart.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <Copy size={14} /> Duplicate
                          </button>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                          <button
                            onClick={() => handleDeleteChart(chart.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={14} /> Delete
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
        <div className="space-y-2">
          {filteredCharts.map((chart) => (
            <div
              key={chart.id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[#06b6d4]/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <InteractiveChart chart={chart} compact={true} interactive={false} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[#06b6d4]">{getChartIcon(chart.type)}</span>
                  <h3 className="truncate font-semibold text-slate-800 dark:text-white">
                    {chart.title || "Untitled Chart"}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(chart.createdAt).toLocaleDateString()} • {chart.type} • {chart.data.length} data points
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditChart(chart.id)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#06b6d4]/10 hover:text-[#06b6d4]"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDuplicateChart(chart.id)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#06b6d4]/10 hover:text-[#06b6d4]"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleDeleteChart(chart.id)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Templates Section */}
      <div className="mt-12">
        <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">Quick Start Templates</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {CHART_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                const newChart = {
                  id: Date.now().toString(),
                  type: template.type,
                  title: template.name,
                  data: [...template.sampleData],
                  config: { ...template.defaultConfig },
                  createdAt: new Date(),
                };
                setCharts((prev) => [newChart, ...prev]);
              }}
              className="group rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-[#06b6d4] hover:shadow-md dark:border-slate-600 dark:bg-slate-800"
            >
              <div className="mb-2 h-16 overflow-hidden rounded-lg bg-slate-50 p-1.5 dark:bg-slate-700/50">
                <InteractiveChart
                  chart={{
                    type: template.type,
                    data: template.sampleData,
                    config: { ...template.defaultConfig, showAnimation: false },
                  }}
                  compact={true}
                  interactive={false}
                />
              </div>
              <div className="truncate text-xs font-medium text-slate-700 transition-colors group-hover:text-[#06b6d4] dark:text-slate-300">
                {template.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Modal */}
      <ChartModal
        isOpen={showChartModal}
        onClose={() => {
          setShowChartModal(false);
          setEditingChart(null);
        }}
        onInsert={handleCreateChart}
        existingChart={editingChart}
      />
    </div>
  );
}
