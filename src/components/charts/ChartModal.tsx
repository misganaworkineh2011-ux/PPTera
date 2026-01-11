"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Target,
  Filter,
  LayoutGrid,
  Gauge,
  ArrowDownWideNarrow,
  BarChart2,
  BarChartHorizontal,
  CircleDot,
  Layers,
  FolderOpen,
  Plus,
  Loader2,
  Check,
} from "lucide-react";
import { type ChartData, type ChartType } from "~/lib/charts/types";
import ChartCreator from "./ChartCreator";
import InteractiveChart from "./InteractiveChart";
import { type Theme } from "~/lib/themes";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";

interface SavedChart extends ChartData {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Get theme-aware colors using the helper
function getThemeColors(theme?: Theme) {
  if (!theme) {
    return {
      bg: "#ffffff",
      surface: "#f8fafc",
      border: "#e2e8f0",
      text: "#0f172a",
      textMuted: "#64748b",
      hoverBg: "#f1f5f9",
      accent: "#06b6d4",
    };
  }

  const modalColors = getModalColors(theme);
  return {
    bg: modalColors.bg,
    surface: modalColors.surface,
    border: modalColors.border,
    text: modalColors.text,
    textMuted: modalColors.textMuted,
    hoverBg: modalColors.hoverBg,
    accent: modalColors.accent || "#06b6d4",
  };
}

// Map chart types to representative icons
function getChartIcon(
  type: ChartType,
  size: number = 20,
  accentColor: string = "#06b6d4"
) {
  const iconProps = { size, style: { color: accentColor } };
  switch (type) {
    case "bar":
    case "stacked-bar":
    case "grouped-bar":
      return <BarChart3 {...iconProps} />;
    case "horizontal-bar":
      return <BarChartHorizontal {...iconProps} />;
    case "line":
      return <TrendingUp {...iconProps} />;
    case "area":
      return <Activity {...iconProps} />;
    case "pie":
      return <PieChart {...iconProps} />;
    case "donut":
      return <CircleDot {...iconProps} />;
    case "scatter":
    case "bubble":
      return <Layers {...iconProps} />;
    case "radar":
      return <Target {...iconProps} />;
    case "gauge":
      return <Gauge {...iconProps} />;
    case "funnel":
      return <Filter {...iconProps} />;
    case "treemap":
    case "heatmap":
      return <LayoutGrid {...iconProps} />;
    case "waterfall":
    case "histogram":
      return <BarChart2 {...iconProps} />;
    case "comparison":
      return <ArrowDownWideNarrow {...iconProps} />;
    case "progress":
      return <Target {...iconProps} />;
    case "kpi":
      return <Gauge {...iconProps} />;
    default:
      return <BarChart3 {...iconProps} />;
  }
}

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (chart: ChartData) => void;
  theme?: Theme;
  existingChart?: ChartData | null;
}

type TabType = "my-charts" | "create";

export default function ChartModal({
  isOpen,
  onClose,
  onInsert,
  theme,
  existingChart,
}: ChartModalProps) {
  const colors = getThemeColors(theme);
  const [activeTab, setActiveTab] = useState<TabType>(
    existingChart ? "create" : "my-charts"
  );
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);

  // Fetch saved charts when modal opens
  useEffect(() => {
    if (isOpen && !existingChart) {
      fetchSavedCharts();
    }
  }, [isOpen, existingChart]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab(existingChart ? "create" : "my-charts");
      setSelectedChartId(null);
    }
  }, [isOpen, existingChart]);

  const fetchSavedCharts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/charts");
      if (!res.ok) throw new Error("Failed to fetch charts");
      const data = await res.json();
      setSavedCharts(
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

  if (!isOpen || typeof window === "undefined") return null;

  const handleSave = (chart: ChartData) => {
    onInsert(chart);
    onClose();
  };

  const handleSelectSavedChart = (chart: SavedChart) => {
    // Insert the saved chart data (without the id, createdAt, etc.)
    const chartData: ChartData = {
      type: chart.type,
      title: chart.title,
      subtitle: chart.subtitle,
      data: chart.data,
      config: chart.config,
      series: chart.series,
    };
    onInsert(chartData);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop - click to close */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative mx-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl"
        style={{
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: `${colors.accent}15` }}
            >
              {existingChart ? (
                getChartIcon(existingChart.type)
              ) : (
                <BarChart3 size={20} style={{ color: colors.accent }} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                {existingChart ? "Edit Chart" : "Add Chart"}
              </h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {existingChart
                  ? "Modify your chart data and settings"
                  : "Select a saved chart or create a new one"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs - only show when not editing */}
        {!existingChart && (
          <div
            className="flex gap-1 px-6 pt-4"
            style={{ borderBottom: `1px solid ${colors.border}` }}
          >
            <button
              onClick={() => setActiveTab("my-charts")}
              className="flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  activeTab === "my-charts" ? colors.surface : "transparent",
                color:
                  activeTab === "my-charts" ? colors.accent : colors.textMuted,
                borderBottom:
                  activeTab === "my-charts"
                    ? `2px solid ${colors.accent}`
                    : "2px solid transparent",
              }}
            >
              <FolderOpen size={16} />
              My Charts
              {savedCharts.length > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: `${colors.accent}20`,
                    color: colors.accent,
                  }}
                >
                  {savedCharts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className="flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  activeTab === "create" ? colors.surface : "transparent",
                color:
                  activeTab === "create" ? colors.accent : colors.textMuted,
                borderBottom:
                  activeTab === "create"
                    ? `2px solid ${colors.accent}`
                    : "2px solid transparent",
              }}
            >
              <Plus size={16} />
              Create New
            </button>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          {activeTab === "my-charts" && !existingChart ? (
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: colors.accent }}
                  />
                  <p
                    className="mt-3 text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    Loading your charts...
                  </p>
                </div>
              ) : savedCharts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <BarChart3 size={32} style={{ color: colors.textMuted }} />
                  </div>
                  <h3
                    className="mb-2 text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    No saved charts
                  </h3>
                  <p
                    className="mb-6 max-w-md text-center text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    Create charts in the Charts dashboard to reuse them across
                    your presentations
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <Plus size={16} />
                    Create New Chart
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {savedCharts.map((chart) => (
                    <button
                      key={chart.id}
                      onClick={() => handleSelectSavedChart(chart)}
                      onMouseEnter={() => setSelectedChartId(chart.id)}
                      onMouseLeave={() => setSelectedChartId(null)}
                      className="group relative flex flex-col overflow-hidden rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: colors.surface,
                        border: `1px solid ${
                          selectedChartId === chart.id
                            ? colors.accent
                            : colors.border
                        }`,
                        boxShadow:
                          selectedChartId === chart.id
                            ? `0 4px 12px ${colors.accent}30`
                            : "none",
                      }}
                    >
                      {/* Chart Preview */}
                      <div
                        className="relative aspect-[4/3] w-full overflow-hidden p-3"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <InteractiveChart
                          chart={chart}
                          theme={theme}
                          compact={true}
                          interactive={false}
                        />
                        {/* Selection indicator */}
                        {selectedChartId === chart.id && (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: `${colors.accent}20` }}
                          >
                            <div
                              className="rounded-full p-2"
                              style={{ backgroundColor: colors.accent }}
                            >
                              <Check size={20} className="text-white" />
                            </div>
                          </div>
                        )}
                        {/* Chart type badge */}
                        <div
                          className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${colors.bg}ee`,
                            color: colors.accent,
                          }}
                        >
                          {getChartIcon(chart.type as ChartType, 12)}
                          <span className="capitalize">{chart.type}</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-3">
                        <h3
                          className="truncate text-sm font-semibold"
                          style={{ color: colors.text }}
                        >
                          {chart.title || "Untitled Chart"}
                        </h3>
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: colors.textMuted }}
                        >
                          {chart.data.length} data points
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <ChartCreator
                initialChart={existingChart || undefined}
                onSave={handleSave}
                onCancel={onClose}
                theme={theme}
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
