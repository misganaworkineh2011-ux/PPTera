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
  // Validate chart data
  if (!chart || !chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
    console.warn("[ChartRenderer] Invalid chart data:", chart);
    return (
      <div className={`w-full ${compact ? "min-h-[180px]" : "min-h-[240px]"} flex items-center justify-center`}>
        <p className="text-sm text-gray-500">No chart data available</p>
      </div>
    );
  }

  // Convert any chart format to the new format for InteractiveChart
  const normalizedChart: NewChartData = {
    type: normalizeChartType(chart.type),
    title: chart.title,
    data: chart.data.map(d => ({
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
  const typeMap: Record<string, ChartType> = {
    "bar": "bar",
    "histogram": "bar",
    "pie": "pie",
    "line": "line",
    "area": "area",
    "comparison": "comparison",
    "table": "table",
    "stacked": "stacked-bar",
    "waterfall": "waterfall",
    "donut": "donut",
    "funnel": "funnel",
    "gauge": "gauge",
    "radar": "radar",
    "kpi": "kpi",
    "progress": "progress",
  };
  return typeMap[type] || "bar";
}
