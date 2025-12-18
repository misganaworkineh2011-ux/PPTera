/**
 * Chart Generation Utility
 * 
 * Generates CSS-based chart structures from slide content.
 * Charts are rendered client-side using pure CSS for maximum compatibility.
 */

import type { Slide, ChartData, ChartDataPoint, SlideChart } from "./types";

// Color palette for chart elements
const CHART_COLORS = [
  "#06b6d4", // cyan-500
  "#1e3a8a", // blue-900
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
];

/**
 * Extract numerical data from bullet points
 * Looks for percentages, numbers, and values in text
 */
function extractDataFromBullets(bullets: string[]): ChartDataPoint[] {
  const dataPoints: ChartDataPoint[] = [];

  bullets.forEach((bullet, index) => {
    // Look for percentage patterns (e.g., "45%", "45 percent")
    const percentMatch = bullet.match(/(\d+(?:\.\d+)?)\s*(%|percent)/i);
    if (percentMatch) {
      const label = extractLabel(bullet, percentMatch[0]);
      dataPoints.push({
        label,
        value: parseFloat(percentMatch[1]),
        color: CHART_COLORS[index % CHART_COLORS.length],
      });
      return;
    }

    // Look for number patterns with context (e.g., "increased by 30", "$5M revenue")
    const numberMatch = bullet.match(/(\$?\d+(?:,\d{3})*(?:\.\d+)?)\s*(M|B|K|million|billion|thousand)?/i);
    if (numberMatch) {
      let value = parseFloat(numberMatch[1].replace(/[$,]/g, ""));
      const multiplier = numberMatch[2]?.toLowerCase();
      
      if (multiplier === "k" || multiplier === "thousand") value *= 1000;
      if (multiplier === "m" || multiplier === "million") value *= 1000000;
      if (multiplier === "b" || multiplier === "billion") value *= 1000000000;

      const label = extractLabel(bullet, numberMatch[0]);
      dataPoints.push({
        label,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      });
      return;
    }

    // If no numbers found, create placeholder data point
    const words = bullet.split(" ").slice(0, 3).join(" ");
    dataPoints.push({
      label: words || `Item ${index + 1}`,
      value: 50 + Math.random() * 50, // Random value for visual representation
      color: CHART_COLORS[index % CHART_COLORS.length],
    });
  });

  return dataPoints;
}

/**
 * Extract a meaningful label from the bullet text
 */
function extractLabel(bullet: string, matchedValue: string): string {
  // Remove the matched value and extract context
  const cleanBullet = bullet.replace(matchedValue, "").trim();
  
  // Take first 3-4 words as label
  const words = cleanBullet.split(/\s+/).filter(w => w.length > 0);
  const labelWords = words.slice(0, 4);
  
  let label = labelWords.join(" ");
  
  // Clean up punctuation
  label = label.replace(/^[:\-–—,\s]+|[:\-–—,\s]+$/g, "");
  
  return label || "Data";
}

/**
 * Generate CSS classes for a bar chart
 */
function generateBarChartCSS(): string {
  return `
    .chart-bar-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      width: 100%;
    }
    .chart-bar-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .chart-bar-label {
      min-width: 120px;
      font-size: 0.875rem;
      color: #374151;
      text-align: right;
    }
    .chart-bar-track {
      flex: 1;
      height: 24px;
      background: #f3f4f6;
      border-radius: 4px;
      overflow: hidden;
    }
    .chart-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease-out;
    }
    .chart-bar-value {
      min-width: 50px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
    }
  `;
}

/**
 * Generate CSS classes for a pie chart
 */
function generatePieChartCSS(): string {
  return `
    .chart-pie-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      padding: 1rem;
    }
    .chart-pie {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      position: relative;
    }
    .chart-pie-legend {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .chart-pie-legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    .chart-pie-legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
  `;
}

/**
 * Generate CSS classes for a line chart
 */
function generateLineChartCSS(): string {
  return `
    .chart-line-container {
      width: 100%;
      height: 200px;
      padding: 1rem;
      position: relative;
    }
    .chart-line-grid {
      position: absolute;
      inset: 1rem;
      border-left: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
    }
    .chart-line-path {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .chart-line-point {
      r: 4;
    }
    .chart-line-labels {
      display: flex;
      justify-content: space-between;
      padding-top: 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
    }
  `;
}

/**
 * Generate CSS classes for a comparison chart
 */
function generateComparisonChartCSS(): string {
  return `
    .chart-comparison-container {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      justify-content: center;
    }
    .chart-comparison-item {
      flex: 1;
      max-width: 200px;
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      background: #f9fafb;
    }
    .chart-comparison-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .chart-comparison-label {
      font-size: 0.875rem;
      color: #6b7280;
    }
  `;
}

/**
 * Generate CSS classes for a table
 */
function generateTableCSS(): string {
  return `
    .chart-table-container {
      width: 100%;
      overflow-x: auto;
      padding: 1rem;
    }
    .chart-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .chart-table th {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 2px solid #e5e7eb;
      font-weight: 600;
      color: #1f2937;
    }
    .chart-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
      color: #374151;
    }
    .chart-table tr:hover {
      background: #f9fafb;
    }
  `;
}

/**
 * Get CSS generator for chart type
 */
function getChartCSS(type: string): string {
  const typeMap: Record<string, () => string> = {
    bar: generateBarChartCSS,
    line: generateLineChartCSS,
    pie: generatePieChartCSS,
    stacked: generateBarChartCSS, // Similar to bar
    comparison: generateComparisonChartCSS,
    table: generateTableCSS,
    area: generateLineChartCSS, // Similar to line
    scatter: generateLineChartCSS, // Similar to line
    histogram: generateBarChartCSS, // Similar to bar
    waterfall: generateBarChartCSS, // Similar to bar
  };

  return (typeMap[type.toLowerCase()] || generateBarChartCSS)();
}

/**
 * Calculate pie chart segments as conic-gradient string
 */
function calculatePieGradient(data: ChartDataPoint[]): string {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;
  
  const segments = data.map((d) => {
    const startAngle = currentAngle;
    const percentage = (d.value / total) * 100;
    currentAngle += percentage;
    return `${d.color} ${startAngle}% ${currentAngle}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

/**
 * Main chart generation function
 * 
 * Generates a CSS-based chart structure from slide content.
 */
export function generateChart(slide: Slide): ChartData | null {
  // Check if slide has chart metadata
  const chartMeta = slide.assets?.chart;
  if (!chartMeta) return null;

  const bullets = slide.bulletPoints || [];
  if (bullets.length === 0) return null;

  // Extract data from bullets
  const data = extractDataFromBullets(bullets);
  const labels = data.map((d) => d.label);

  // Calculate max value for bar chart scaling
  const maxValue = Math.max(...data.map((d) => d.value));

  // Generate chart structure
  const chartData: ChartData = {
    type: chartMeta.type.toLowerCase(),
    data,
    labels,
    title: slide.title,
    config: {
      showLegend: true,
      showLabels: true,
      showValues: true,
      maxValue,
      unit: data.some((d) => d.value > 0 && d.value <= 100) ? "%" : undefined,
    },
    css: getChartCSS(chartMeta.type),
  };

  // Add pie chart specific gradient
  if (chartData.type === "pie") {
    (chartData as ChartData & { gradient?: string }).gradient = calculatePieGradient(data);
  }

  return chartData;
}

/**
 * Generate chart from explicit chart specification
 */
export function generateChartFromSpec(
  chartSpec: SlideChart,
  slideTitle: string,
  bullets: string[]
): ChartData {
  const data = extractDataFromBullets(bullets);
  const labels = data.map((d) => d.label);
  const maxValue = Math.max(...data.map((d) => d.value));

  return {
    type: chartSpec.type.toLowerCase(),
    data,
    labels,
    title: slideTitle,
    config: {
      showLegend: true,
      showLabels: true,
      showValues: true,
      maxValue,
      unit: data.some((d) => d.value > 0 && d.value <= 100) ? "%" : undefined,
    },
    css: getChartCSS(chartSpec.type),
  };
}

/**
 * Check if a slide should have a chart based on its assets
 */
export function shouldHaveChart(slide: Slide): boolean {
  return !!slide.assets?.chart && !!slide.assets.chart.type;
}

