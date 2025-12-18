/**
 * Chart Types and Configurations
 * Comprehensive type definitions for the chart system
 */

// Chart type options
export type ChartType = 
  | "bar" 
  | "horizontal-bar"
  | "line" 
  | "area" 
  | "pie" 
  | "donut"
  | "stacked-bar"
  | "grouped-bar"
  | "scatter"
  | "bubble"
  | "radar"
  | "gauge"
  | "funnel"
  | "treemap"
  | "heatmap"
  | "waterfall"
  | "comparison"
  | "progress"
  | "kpi"
  | "table";

// Data point for charts
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  // For multi-series charts
  series?: string;
  // For bubble charts
  size?: number;
  // For scatter plots
  x?: number;
  y?: number;
  // For grouped data
  group?: string;
  // For additional metadata
  metadata?: Record<string, unknown>;
}

// Chart configuration options
export interface ChartConfig {
  // Display options
  showLegend?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  showGrid?: boolean;
  showTooltips?: boolean;
  showAnimation?: boolean;
  
  // Value formatting
  maxValue?: number;
  minValue?: number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  
  // Axis configuration
  xAxisLabel?: string;
  yAxisLabel?: string;
  
  // Colors
  colorScheme?: "default" | "theme" | "rainbow" | "monochrome" | "gradient" | "custom";
  customColors?: string[];
  
  // Layout
  orientation?: "vertical" | "horizontal";
  aspectRatio?: number;
  
  // Interactivity
  interactive?: boolean;
  clickable?: boolean;
  
  // Specific chart options
  donutHole?: number; // 0-1 for donut charts
  barGap?: number;
  lineSmooth?: boolean;
  areaFill?: boolean;
  stackType?: "normal" | "percent";
  
  // KPI specific
  target?: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
}

// Complete chart data structure
export interface ChartData {
  id?: string;
  type: ChartType;
  title?: string;
  subtitle?: string;
  data: ChartDataPoint[];
  labels?: string[];
  config: ChartConfig;
  // For multi-series data
  series?: {
    name: string;
    data: ChartDataPoint[];
    color?: string;
  }[];
  // CSS classes for styling
  css?: string;
  // Creation metadata
  createdAt?: Date;
  updatedAt?: Date;
}

// Preset chart templates
export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  type: ChartType;
  category: "business" | "analytics" | "comparison" | "progress" | "distribution";
  thumbnail?: string;
  defaultConfig: ChartConfig;
  sampleData: ChartDataPoint[];
}

// Color schemes
export const COLOR_SCHEMES = {
  default: ["#06b6d4", "#1e3a8a", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"],
  rainbow: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"],
  monochrome: ["#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff"],
  gradient: ["#06b6d4", "#0891b2", "#0e7490", "#155e75", "#164e63", "#134e4a", "#115e59", "#0f766e"],
  warm: ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"],
  cool: ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe"],
  nature: ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d", "#10b981", "#059669", "#047857"],
};

// Chart templates for quick creation
export const CHART_TEMPLATES: ChartTemplate[] = [
  {
    id: "sales-bar",
    name: "Sales Performance",
    description: "Compare sales across categories or time periods",
    type: "bar",
    category: "business",
    defaultConfig: { showValues: true, showGrid: true, colorScheme: "default" },
    sampleData: [
      { label: "Q1", value: 45000 },
      { label: "Q2", value: 52000 },
      { label: "Q3", value: 48000 },
      { label: "Q4", value: 61000 },
    ],
  },
  {
    id: "market-share-pie",
    name: "Market Share",
    description: "Show distribution of market share",
    type: "pie",
    category: "distribution",
    defaultConfig: { showLegend: true, showValues: true },
    sampleData: [
      { label: "Product A", value: 35, color: "#06b6d4" },
      { label: "Product B", value: 28, color: "#1e3a8a" },
      { label: "Product C", value: 22, color: "#10b981" },
      { label: "Others", value: 15, color: "#f59e0b" },
    ],
  },
  {
    id: "growth-line",
    name: "Growth Trend",
    description: "Track growth over time",
    type: "line",
    category: "analytics",
    defaultConfig: { showGrid: true, lineSmooth: true, showLabels: true },
    sampleData: [
      { label: "Jan", value: 100 },
      { label: "Feb", value: 120 },
      { label: "Mar", value: 115 },
      { label: "Apr", value: 140 },
      { label: "May", value: 155 },
      { label: "Jun", value: 180 },
    ],
  },
  {
    id: "comparison-bars",
    name: "Side by Side Comparison",
    description: "Compare two or more items",
    type: "comparison",
    category: "comparison",
    defaultConfig: { showValues: true },
    sampleData: [
      { label: "Speed", value: 85, color: "#06b6d4" },
      { label: "Quality", value: 92, color: "#10b981" },
      { label: "Price", value: 78, color: "#f59e0b" },
      { label: "Support", value: 88, color: "#8b5cf6" },
    ],
  },
  {
    id: "kpi-card",
    name: "KPI Metric",
    description: "Highlight a key performance indicator",
    type: "kpi",
    category: "business",
    defaultConfig: { showValues: true, target: 100, trend: "up", trendValue: 12 },
    sampleData: [{ label: "Revenue", value: 125000 }],
  },
  {
    id: "progress-funnel",
    name: "Sales Funnel",
    description: "Show conversion through stages",
    type: "funnel",
    category: "progress",
    defaultConfig: { showValues: true, showLabels: true },
    sampleData: [
      { label: "Visitors", value: 10000 },
      { label: "Leads", value: 5000 },
      { label: "Qualified", value: 2500 },
      { label: "Proposals", value: 1000 },
      { label: "Closed", value: 500 },
    ],
  },
  {
    id: "donut-budget",
    name: "Budget Allocation",
    description: "Show budget distribution with center metric",
    type: "donut",
    category: "distribution",
    defaultConfig: { showLegend: true, donutHole: 0.6 },
    sampleData: [
      { label: "Marketing", value: 30, color: "#06b6d4" },
      { label: "Development", value: 40, color: "#1e3a8a" },
      { label: "Operations", value: 20, color: "#10b981" },
      { label: "Admin", value: 10, color: "#f59e0b" },
    ],
  },
  {
    id: "area-traffic",
    name: "Traffic Overview",
    description: "Show traffic trends with filled area",
    type: "area",
    category: "analytics",
    defaultConfig: { showGrid: true, areaFill: true, lineSmooth: true },
    sampleData: [
      { label: "Mon", value: 2400 },
      { label: "Tue", value: 3200 },
      { label: "Wed", value: 2800 },
      { label: "Thu", value: 3600 },
      { label: "Fri", value: 4200 },
      { label: "Sat", value: 3800 },
      { label: "Sun", value: 2900 },
    ],
  },
];

// Helper to get color from scheme
export function getChartColor(index: number, scheme: keyof typeof COLOR_SCHEMES = "default"): string {
  const colors = COLOR_SCHEMES[scheme];
  return colors[index % colors.length] || colors[0]!;
}

// Helper to format chart values
export function formatChartValue(value: number, config: ChartConfig): string {
  const { prefix = "", suffix = "", unit = "", decimals = 0 } = config;
  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
  return `${prefix}${formatted}${unit}${suffix}`;
}
