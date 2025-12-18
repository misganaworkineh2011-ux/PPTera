"use client";

import { type ChartData as NewChartData, type ChartType, type ChartConfig } from "~/lib/charts/types";
import { type Theme } from "~/lib/themes";
import InteractiveChart from "~/components/charts/InteractiveChart";

// Union type to handle both legacy and new chart formats
interface AnyChartData {
  type: string;
  title?: string;
  data: Array<{ label: string; value: number; color?: string }>;
  labels?: string[];
  config: Partial<ChartConfig> & {
    showLegend?: boolean;
    showLabels?: boolean;
    showValues?: boolean;
    maxValue?: number;
    unit?: string;
  };
  css?: string;
}

interface ChartRendererProps {
  chart: AnyChartData;
  theme: Theme;
  compact?: boolean;
}

/**
 * Renders charts for presentations - now uses the new InteractiveChart component
 * This wrapper maintains backward compatibility with existing chart data structures
 */
export default function ChartRenderer({ chart, theme, compact = false }: ChartRendererProps) {
  // Validate chart data - be more lenient and provide fallback
  if (!chart) {
    return (
      <div className={`w-full ${compact ? "py-4" : "py-6"} flex items-center justify-center`}>
        <p className="text-sm opacity-50" style={{ color: theme.colors.textMuted }}>Chart loading...</p>
      </div>
    );
  }

  // Ensure we have valid data array
  let chartData = chart.data;
  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    // Create default data if none provided
    chartData = [
      { label: "Category A", value: 75, color: "#06b6d4" },
      { label: "Category B", value: 60, color: "#1e3a8a" },
      { label: "Category C", value: 45, color: "#10b981" },
    ];
  }

  // Filter out any invalid data points
  chartData = chartData.filter(d => d && typeof d.value === "number" && d.label);

  // If still no valid data after filtering, show placeholder
  if (chartData.length === 0) {
    return (
      <div className={`w-full ${compact ? "py-4" : "py-6"} flex items-center justify-center`}>
        <p className="text-sm opacity-50" style={{ color: theme.colors.textMuted }}>No chart data</p>
      </div>
    );
  }

  // Convert any chart format to the new format for InteractiveChart
  const normalizedChart: NewChartData = {
    type: normalizeChartType(chart.type || "bar"),
    title: chart.title,
    data: chartData.map(d => ({
      label: d.label || "Unknown",
      value: typeof d.value === "number" ? d.value : 0,
      color: d.color,
    })),
    config: {
      showLegend: chart.config?.showLegend ?? true,
      showLabels: chart.config?.showLabels ?? true,
      showValues: chart.config?.showValues ?? true,
      maxValue: chart.config?.maxValue,
      unit: chart.config?.unit,
      showAnimation: chart.config?.showAnimation ?? true,
      showGrid: chart.config?.showGrid ?? true,
      colorScheme: chart.config?.colorScheme ?? "default",
      // Pass through any other config options
      ...chart.config,
    },
  };

  return (
    <div className="w-full">
      <InteractiveChart
        chart={normalizedChart}
        theme={theme}
        compact={compact}
        interactive={true}
      />
    </div>
  );
}

// Helper to normalize chart type strings
function normalizeChartType(type: string): ChartType {
  const normalizedType = (type || "bar").toLowerCase().trim();
  const typeMap: Record<string, ChartType> = {
    "bar": "bar",
    "horizontal-bar": "horizontal-bar",
    "horizontal bar": "horizontal-bar",
    "histogram": "bar",
    "pie": "pie",
    "line": "line",
    "area": "area",
    "comparison": "comparison",
    "table": "table",
    "stacked": "stacked-bar",
    "stacked-bar": "stacked-bar",
    "waterfall": "waterfall",
    "donut": "donut",
    "funnel": "funnel",
    "gauge": "gauge",
    "radar": "radar",
    "kpi": "kpi",
    "progress": "progress",
    "scatter": "line", // Fallback scatter to line
  };
  return typeMap[normalizedType] || "bar";
}
