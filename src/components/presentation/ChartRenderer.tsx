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
  editable?: boolean;
  onTitleChange?: (newTitle: string) => void;
  onChartUpdate?: (chart: AnyChartData) => void;
}

/**
 * Renders charts for presentations - now uses the new InteractiveChart component
 * This wrapper maintains backward compatibility with existing chart data structures
 */
export default function ChartRenderer({ 
  chart, 
  theme, 
  compact = false,
  editable = false,
  onTitleChange,
  onChartUpdate,
}: ChartRendererProps) {
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
    // Create default data if none provided — use theme colors so it stays on-palette
    chartData = [
      { label: "Category A", value: 75, color: theme.colors.primary },
      { label: "Category B", value: 60, color: theme.colors.secondary || theme.colors.accent },
      { label: "Category C", value: 45, color: theme.colors.accent },
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

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    if (onTitleChange) {
      onTitleChange(newTitle);
    }
    if (onChartUpdate) {
      onChartUpdate({ ...chart, title: newTitle });
    }
  };

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
      showGrid: chart.config?.showGrid ?? false, // Cleaner look by default — gridlines read as "default chart"
      colorScheme: chart.config?.colorScheme ?? "theme", // Default to theme colors for slides
      lineSmooth: true, // Enable smooth curves by default
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
        editable={editable}
        onTitleChange={handleTitleChange}
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
