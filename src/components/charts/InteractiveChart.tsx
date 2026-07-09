"use client";

import { useState, useMemo, useId, useEffect, Fragment } from "react";
import { type ChartData, type ChartDataPoint, type ChartConfig, getChartColor, formatChartValue, COLOR_SCHEMES } from "~/lib/charts/types";
import { type Theme } from "~/lib/themes";

type ChartSeries = NonNullable<ChartData["series"]>;

interface InteractiveChartProps {
  chart: ChartData;
  theme?: Theme;
  compact?: boolean;
  interactive?: boolean;
  className?: string;
  onTitleChange?: (newTitle: string) => void;
  editable?: boolean;
}

export default function InteractiveChart({
  chart,
  theme,
  compact = false,
  interactive = true,
  className = "",
  onTitleChange,
  editable = false,
}: InteractiveChartProps) {
  const { type, data, config, title, subtitle, series } = chart;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title || "");

  // Mounted flag drives subtle entrance animations (bars grow, lines draw, areas fade).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const colors = useMemo(() => ({
    accent: theme?.colors.accent || "#06b6d4",
    text: theme?.colors.text || "#1e293b",
    muted: theme?.colors.textMuted || "#64748b",
    bg: theme?.colors.background || "#ffffff",
  }), [theme]);

  const maxValue = useMemo(() => config.maxValue || Math.max(...data.map(d => d.value), 1), [data, config.maxValue]);

  const getPointColor = (point: ChartDataPoint, index: number): string => {
    if (point.color) return point.color;
    if (config.customColors?.[index]) return config.customColors[index]!;
    const scheme = config.colorScheme || "theme";
    if (scheme === "theme" && theme) {
      const themeColors = [
        theme.colors.accent,
        theme.colors.primary || theme.colors.accent,
        theme.colors.secondary || theme.colors.accent,
        `${theme.colors.accent}cc`,
        `${theme.colors.accent}99`,
      ];
      return themeColors[index % themeColors.length] || theme.colors.accent;
    }
    return getChartColor(index, scheme as keyof typeof COLOR_SCHEMES);
  };

  const handleTitleSave = () => {
    if (onTitleChange && editedTitle !== title) {
      onTitleChange(editedTitle);
    }
    setIsEditingTitle(false);
  };

  const chartProps = { data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex: interactive ? setHoveredIndex : () => {}, getPointColor, mounted, series };

  const renderChart = () => {
    switch (type) {
      case "bar": return <BarChart {...chartProps} />;
      case "horizontal-bar": return <HorizontalBarChart {...chartProps} />;
      case "line": return <LineChart {...chartProps} />;
      case "area": return <AreaChart {...chartProps} />;
      case "pie": return <PieChart {...chartProps} />;
      case "donut": return <DonutChart {...chartProps} />;
      case "stacked-bar": return <StackedBarChart {...chartProps} />;
      case "grouped-bar": return <GroupedBarChart {...chartProps} />;
      case "scatter": return <ScatterChart {...chartProps} />;
      case "bubble": return <BubbleChart {...chartProps} />;
      case "treemap": return <TreemapChart {...chartProps} />;
      case "heatmap": return <HeatmapChart {...chartProps} />;
      case "waterfall": return <WaterfallChart {...chartProps} />;
      case "histogram": return <HistogramChart {...chartProps} />;
      case "comparison": return <ComparisonChart {...chartProps} />;
      case "kpi": return <KPIChart {...chartProps} />;
      case "funnel": return <FunnelChart {...chartProps} />;
      case "progress": return <ProgressChart {...chartProps} />;
      case "gauge": return <GaugeChart {...chartProps} />;
      case "radar": return <RadarChart {...chartProps} />;
      case "table": return <TableChart {...chartProps} />;
      default: return <BarChart {...chartProps} />;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {(title || subtitle || editable) && (
        <div className="mb-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") {
                  setEditedTitle(title || "");
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="w-full bg-transparent border-b border-current outline-none font-medium text-xs"
              style={{ color: colors.text }}
              placeholder="Chart title..."
            />
          ) : (
            <h3 
              className={`font-medium text-xs ${editable ? "cursor-pointer hover:opacity-70" : ""}`} 
              style={{ color: colors.text }}
              onClick={() => editable && setIsEditingTitle(true)}
              title={editable ? "Click to edit title" : undefined}
            >
              {title || (editable ? "Click to add title" : "")}
            </h3>
          )}
          {subtitle && <p className="text-[9px] mt-0.5" style={{ color: colors.muted }}>{subtitle}</p>}
        </div>
      )}
      {renderChart()}
    </div>
  );
}

type ChartColors = { accent: string; text: string; muted: string; bg: string };
type BaseProps = {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: ChartColors;
  maxValue: number;
  compact: boolean;
  hoveredIndex: number | null;
  setHoveredIndex: (i: number | null) => void;
  getPointColor: (p: ChartDataPoint, i: number) => string;
  mounted: boolean;
  series?: ChartSeries;
};

// ---- Shared helpers ----------------------------------------------------------

// Sentence-case a label (first letter upper, rest as-is) without mangling ALLCAPS acronyms.
function sentenceCase(label: string): string {
  if (!label) return label;
  const trimmed = label.trim();
  if (trimmed.length <= 1) return trimmed.toUpperCase();
  // Leave existing acronyms / all-caps tokens alone.
  if (trimmed === trimmed.toUpperCase()) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

// Append an alpha channel to a hex color; falls back to the color itself for non-hex (rgb/named) inputs.
function withAlpha(color: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  if (/^#([0-9a-f]{6})$/i.test(color)) return `${color}${a}`;
  if (/^#([0-9a-f]{3})$/i.test(color)) {
    const r = color[1]!, g = color[2]!, b = color[3]!;
    return `#${r}${r}${g}${g}${b}${b}${a}`;
  }
  return color; // rgb()/hsl()/named — caller still gets a usable solid color.
}

// Smooth bezier path through a set of {x, y} points (used by line & area charts).
function createSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return `M ${pts[0]?.x ?? 0} ${pts[0]?.y ?? 0}`;
  let path = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]!;
    const p1 = pts[i + 1]!;
    const midX = (p0.x + p1.x) / 2;
    path += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return path;
}

// Empty-state placeholder shared by data-driven charts.
function EmptyState({ colors }: { colors: ChartColors }) {
  return (
    <div className="w-full flex items-center justify-center py-4">
      <span className="text-xs" style={{ color: colors.muted }}>No data available</span>
    </div>
  );
}

// Normalise multi-series input into category labels + parallel series rows.
// When no real series exist, the single `data` array becomes one trivial series.
function useSeriesMatrix(data: ChartDataPoint[], series: ChartSeries | undefined) {
  return useMemo(() => {
    const hasSeries = !!series && series.length > 0;
    const seriesRows = hasSeries ? series! : [{ name: "", data, color: undefined }];
    // Categories come from the longest series (keeps alignment when rows differ).
    const base = seriesRows.reduce((a, b) => (b.data.length > a.data.length ? b : a), seriesRows[0]!);
    const labels = base.data.map((d) => d.label);
    return { hasSeries, seriesRows, labels };
  }, [data, series]);
}

// ============ BAR CHART ============
function BarChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  if (!data || data.length === 0) return <EmptyState colors={colors} />;

  // Bigger bars and height for non-compact (presentation) mode
  const barWidth = compact ? Math.min(32, Math.max(16, 180 / data.length)) : Math.min(48, Math.max(24, 280 / data.length));
  const chartHeight = compact ? 80 : 160;
  const gap = compact ? Math.min(10, Math.max(4, 80 / data.length)) : Math.min(16, Math.max(8, 120 / data.length));
  const fontSize = compact ? "9px" : "11px";
  const labelSize = compact ? "9px" : "10px";

  return (
    <div className="w-full">
      <div className="flex items-end justify-center" style={{ height: chartHeight, gap: `${gap}px` }}>
        {data.map((item, i) => {
          const height = maxValue > 0 ? ((item.value || 0) / maxValue) * 100 : 0;
          const isHovered = hoveredIndex === i;
          const barColor = getPointColor(item, i);
          return (
            <div key={i} className="flex flex-col items-center justify-end group h-full"
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              {config.showValues !== false && (
                <div className="font-semibold mb-1 transition-all duration-200"
                  style={{
                    fontSize,
                    color: isHovered ? barColor : colors.muted,
                    transform: isHovered ? "scale(1.05)" : "scale(1)"
                  }}>
                  {formatChartValue(item.value, config)}
                </div>
              )}
              <div
                className="rounded-t-md ease-out"
                style={{
                  width: barWidth,
                  height: `${mounted ? Math.max(height, 2) : 0}%`,
                  background: `linear-gradient(to top, ${withAlpha(barColor, 0.6)}, ${barColor})`,
                  boxShadow: isHovered ? `0 4px 12px ${withAlpha(barColor, 0.35)}` : "none",
                  opacity: isHovered ? 1 : 0.92,
                  transition: `height 700ms cubic-bezier(0.22,1,0.36,1) ${i * 40}ms, opacity 200ms, box-shadow 200ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      {config.showLabels !== false && (
        <div className="flex justify-center mt-2" style={{ gap: `${gap}px` }}>
          {data.map((item, i) => (
            <div key={i} className="font-medium text-center truncate transition-colors"
              style={{ width: barWidth, fontSize: labelSize, color: hoveredIndex === i ? getPointColor(item, i) : colors.muted }}>
              {sentenceCase(item.label)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ HORIZONTAL BAR CHART ============
function HorizontalBarChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  return (
    <div className={`w-full ${compact ? "space-y-1.5" : "space-y-2"}`}>
      {data.map((item, i) => {
        const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const isHovered = hoveredIndex === i;
        const barColor = getPointColor(item, i);
        return (
          <div key={i} className="flex items-center gap-2" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
            <div className="w-16 text-[9px] text-right truncate transition-colors"
              style={{ color: isHovered ? barColor : colors.text }}>
              {sentenceCase(item.label)}
            </div>
            <div className="flex-1 h-4 rounded-md overflow-hidden" style={{ backgroundColor: withAlpha(colors.text, 0.06) }}>
              <div
                className="h-full rounded-md"
                style={{
                  width: `${mounted ? width : 0}%`,
                  background: `linear-gradient(to right, ${withAlpha(barColor, 0.7)}, ${barColor})`,
                  opacity: isHovered ? 1 : 0.88,
                  transition: `width 700ms cubic-bezier(0.22,1,0.36,1) ${i * 40}ms, opacity 200ms`,
                }}
              />
            </div>
            {config.showValues !== false && (
              <div className="w-10 text-[9px] font-medium" style={{ color: colors.text }}>
                {formatChartValue(item.value, config)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============ LINE CHART ============
function LineChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  const stableId = useId().replace(/:/g, "");
  // Bigger dimensions for non-compact (presentation) mode
  const width = compact ? 320 : 420;
  const height = compact ? 70 : 140;
  const pad = compact ? { t: 8, r: 12, b: 20, l: 32 } : { t: 12, r: 16, b: 28, l: 40 };
  const cw = width - pad.l - pad.r, ch = height - pad.t - pad.b;
  const strokeWidth = compact ? 2 : 2.5;
  const pointRadius = compact ? 3 : 4;
  const pointRadiusHover = compact ? 4 : 6;
  const fontSize = compact ? 9 : 11;
  const labelSize = compact ? "8px" : "10px";

  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  const lineColor = getPointColor(data[0]!, 0);

  const points = data.map((d, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * cw,
    y: pad.t + ch - ((d.value || 0) / maxValue) * ch,
    data: d, index: i,
  }));

  const linePath = config.lineSmooth !== false ? createSmoothPath(points) : points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x} ${pad.t + ch} L ${points[0]?.x} ${pad.t + ch} Z`;
  const strokeId = `line-stroke-${stableId}`;
  const fillId = `line-fill-${stableId}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={withAlpha(lineColor, 0.7)} />
            <stop offset="100%" stopColor={lineColor} />
          </linearGradient>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {config.showGrid !== false && (
          <g opacity="0.12">
            {[0, 0.5, 1].map((r, i) => (
              <line key={i} x1={pad.l} y1={pad.t + ch * r} x2={pad.l + cw} y2={pad.t + ch * r} stroke={colors.text} strokeDasharray="3,4" />
            ))}
          </g>
        )}

        {/* Soft area under the line */}
        <path d={areaPath} fill={`url(#${fillId})`} style={{ opacity: mounted ? 1 : 0, transition: "opacity 600ms ease 250ms" }} />

        {/* Line — draws itself on mount via dash offset */}
        <path
          d={linePath}
          fill="none"
          stroke={`url(#${strokeId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: mounted ? 0 : 1, transition: "stroke-dashoffset 900ms ease" }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={14} fill="transparent" className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
            <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? pointRadiusHover : pointRadius} fill={colors.bg} stroke={lineColor} strokeWidth={strokeWidth}
              style={{ opacity: mounted ? 1 : 0, transition: `opacity 300ms ease ${300 + i * 60}ms, r 150ms` }} />
          </g>
        ))}

        {/* Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <g>
            <rect x={points[hoveredIndex]!.x - 24} y={points[hoveredIndex]!.y - 26} width="48" height="18" rx="4" fill={colors.text} />
            <text x={points[hoveredIndex]!.x} y={points[hoveredIndex]!.y - 13} textAnchor="middle" fill={colors.bg} fontSize={fontSize} fontWeight="600">
              {formatChartValue(data[hoveredIndex]!.value, config)}
            </text>
          </g>
        )}
      </svg>

      {/* X-axis labels */}
      {config.showLabels !== false && (
        <div className="flex justify-between px-8 -mt-1">
          {data.map((item, i) => (
            <span key={i} className="font-medium transition-colors text-center"
              style={{ fontSize: labelSize, color: hoveredIndex === i ? lineColor : colors.muted }}>
              {sentenceCase(item.label)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ AREA CHART ============
function AreaChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  // Use stable ID for gradient to avoid hydration mismatch
  const stableId = useId().replace(/:/g, "");

  // Bigger dimensions for non-compact (presentation) mode
  const width = compact ? 320 : 420;
  const height = compact ? 70 : 140;
  const pad = compact ? { t: 8, r: 12, b: 20, l: 32 } : { t: 12, r: 16, b: 28, l: 40 };
  const cw = width - pad.l - pad.r, ch = height - pad.t - pad.b;
  const strokeWidth = compact ? 2 : 2.5;
  const pointRadius = compact ? 3 : 4;
  const pointRadiusHover = compact ? 4 : 6;
  const fontSize = compact ? 9 : 11;
  const labelSize = compact ? "8px" : "10px";

  // Ensure we have valid data
  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  const lineColor = getPointColor(data[0]!, 0);

  const points = data.map((d, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * cw,
    y: pad.t + ch - ((d.value || 0) / maxValue) * ch,
    data: d, index: i,
  }));

  const linePath = config.lineSmooth !== false ? createSmoothPath(points) : points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = linePath + ` L ${points[points.length - 1]?.x} ${pad.t + ch} L ${points[0]?.x} ${pad.t + ch} Z`;
  const gradientId = `area-grad-${stableId}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.38" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {config.showGrid !== false && (
          <g opacity="0.12">
            {[0, 0.5, 1].map((r, i) => (
              <line key={i} x1={pad.l} y1={pad.t + ch * r} x2={pad.l + cw} y2={pad.t + ch * r} stroke={colors.text} strokeDasharray="3,4" />
            ))}
          </g>
        )}

        {/* Area fill — fades in on mount */}
        <path d={areaPath} fill={`url(#${gradientId})`} style={{ opacity: mounted ? 1 : 0, transition: "opacity 700ms ease 200ms" }} />

        {/* Line — draws itself on mount */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{ strokeDasharray: 1, strokeDashoffset: mounted ? 0 : 1, transition: "stroke-dashoffset 900ms ease" }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={14} fill="transparent" className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
            <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? pointRadiusHover : pointRadius} fill={colors.bg} stroke={lineColor} strokeWidth={strokeWidth}
              style={{ opacity: mounted ? 1 : 0, transition: `opacity 300ms ease ${300 + i * 60}ms, r 150ms` }} />
          </g>
        ))}

        {/* Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <g>
            <rect x={points[hoveredIndex]!.x - 24} y={points[hoveredIndex]!.y - 26} width="48" height="18" rx="4" fill={colors.text} />
            <text x={points[hoveredIndex]!.x} y={points[hoveredIndex]!.y - 13} textAnchor="middle" fill={colors.bg} fontSize={fontSize} fontWeight="600">
              {formatChartValue(data[hoveredIndex]!.value, config)}
            </text>
          </g>
        )}
      </svg>

      {/* X-axis labels */}
      {config.showLabels !== false && (
        <div className="flex justify-between px-8 -mt-1">
          {data.map((item, i) => (
            <span key={i} className="font-medium transition-colors text-center"
              style={{ fontSize: labelSize, color: hoveredIndex === i ? lineColor : colors.muted }}>
              {sentenceCase(item.label)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ STACKED BAR CHART ============
function StackedBarChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted, series }: BaseProps) {
  const { seriesRows, labels } = useSeriesMatrix(data, series);
  if (labels.length === 0) return <EmptyState colors={colors} />;

  // Per-category stacked totals → tallest stack defines the scale.
  const totals = labels.map((_, ci) => seriesRows.reduce((sum, s) => sum + (s.data[ci]?.value ?? 0), 0));
  const stackMax = Math.max(config.maxValue || 0, ...totals, 1);
  const seriesColor = (si: number) => seriesRows[si]!.color || getPointColor(seriesRows[si]!.data[0] ?? { label: "", value: 0 }, si);

  const barWidth = compact ? Math.min(34, Math.max(16, 180 / labels.length)) : Math.min(52, Math.max(24, 280 / labels.length));
  const chartHeight = compact ? 90 : 160;
  const gap = compact ? Math.min(12, Math.max(6, 90 / labels.length)) : Math.min(20, Math.max(8, 130 / labels.length));

  return (
    <div className="w-full">
      <div className="flex items-end justify-center" style={{ height: chartHeight, gap: `${gap}px` }}>
        {labels.map((label, ci) => {
          const isHovered = hoveredIndex === ci;
          const totalH = stackMax > 0 ? (totals[ci]! / stackMax) * 100 : 0;
          return (
            <div key={ci} className="flex flex-col items-center justify-end h-full"
              onMouseEnter={() => setHoveredIndex(ci)} onMouseLeave={() => setHoveredIndex(null)}>
              {config.showValues !== false && (
                <div className="font-semibold mb-1" style={{ fontSize: compact ? "9px" : "10px", color: isHovered ? colors.text : colors.muted }}>
                  {formatChartValue(totals[ci]!, config)}
                </div>
              )}
              <div className="flex flex-col-reverse rounded-t-md overflow-hidden"
                style={{
                  width: barWidth,
                  height: `${mounted ? Math.max(totalH, 2) : 0}%`,
                  boxShadow: isHovered ? `0 4px 12px ${withAlpha(colors.text, 0.18)}` : "none",
                  transition: `height 700ms cubic-bezier(0.22,1,0.36,1) ${ci * 40}ms, box-shadow 200ms`,
                }}>
                {seriesRows.map((s, si) => {
                  const v = s.data[ci]?.value ?? 0;
                  const frac = totals[ci]! > 0 ? (v / totals[ci]!) * 100 : 0;
                  const c = seriesColor(si);
                  return (
                    <div key={si} style={{ height: `${frac}%`, background: `linear-gradient(to top, ${withAlpha(c, 0.7)}, ${c})`, opacity: isHovered ? 1 : 0.92 }} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {config.showLabels !== false && (
        <div className="flex justify-center mt-2" style={{ gap: `${gap}px` }}>
          {labels.map((label, ci) => (
            <div key={ci} className="font-medium text-center truncate" style={{ width: barWidth, fontSize: compact ? "9px" : "10px", color: hoveredIndex === ci ? colors.text : colors.muted }}>
              {sentenceCase(label)}
            </div>
          ))}
        </div>
      )}
      <SeriesLegend seriesRows={seriesRows} colors={colors} colorOf={seriesColor} show={config.showLegend !== false} />
    </div>
  );
}

// ============ GROUPED BAR CHART ============
function GroupedBarChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted, series }: BaseProps) {
  const { seriesRows, labels } = useSeriesMatrix(data, series);
  if (labels.length === 0) return <EmptyState colors={colors} />;

  const groupMax = Math.max(config.maxValue || 0, ...seriesRows.flatMap((s) => s.data.map((d) => d.value)), 1);
  const seriesColor = (si: number) => seriesRows[si]!.color || getPointColor(seriesRows[si]!.data[0] ?? { label: "", value: 0 }, si);

  const chartHeight = compact ? 90 : 160;
  const groupGap = compact ? 10 : 16;
  const barGap = 2;
  const innerBar = compact ? Math.min(14, Math.max(5, 120 / (labels.length * seriesRows.length))) : Math.min(20, Math.max(7, 200 / (labels.length * seriesRows.length)));

  return (
    <div className="w-full">
      <div className="flex items-end justify-center" style={{ height: chartHeight, gap: `${groupGap}px` }}>
        {labels.map((label, ci) => (
          <div key={ci} className="flex flex-col items-center justify-end h-full"
            onMouseEnter={() => setHoveredIndex(ci)} onMouseLeave={() => setHoveredIndex(null)}>
            <div className="flex items-end h-full" style={{ gap: `${barGap}px` }}>
              {seriesRows.map((s, si) => {
                const v = s.data[ci]?.value ?? 0;
                const h = groupMax > 0 ? (v / groupMax) * 100 : 0;
                const c = seriesColor(si);
                const isHovered = hoveredIndex === ci;
                return (
                  <div key={si} className="rounded-t-md"
                    style={{
                      width: innerBar,
                      height: `${mounted ? Math.max(h, 2) : 0}%`,
                      background: `linear-gradient(to top, ${withAlpha(c, 0.6)}, ${c})`,
                      opacity: isHovered ? 1 : 0.9,
                      transition: `height 700ms cubic-bezier(0.22,1,0.36,1) ${(ci * seriesRows.length + si) * 30}ms, opacity 200ms`,
                    }} />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {config.showLabels !== false && (
        <div className="flex justify-center mt-2" style={{ gap: `${groupGap}px` }}>
          {labels.map((label, ci) => (
            <div key={ci} className="font-medium text-center truncate" style={{ width: seriesRows.length * (innerBar + barGap), fontSize: compact ? "9px" : "10px", color: hoveredIndex === ci ? colors.text : colors.muted }}>
              {sentenceCase(label)}
            </div>
          ))}
        </div>
      )}
      <SeriesLegend seriesRows={seriesRows} colors={colors} colorOf={seriesColor} show={config.showLegend !== false} />
    </div>
  );
}

// Small reusable series legend for multi-series charts.
function SeriesLegend({ seriesRows, colors, colorOf, show }: { seriesRows: ChartSeries; colors: ChartColors; colorOf: (i: number) => string; show: boolean }) {
  if (!show || seriesRows.length <= 1) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
      {seriesRows.map((s, si) => (
        <div key={si} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colorOf(si) }} />
          <span className="text-[9px]" style={{ color: colors.muted }}>{sentenceCase(s.name || `Series ${si + 1}`)}</span>
        </div>
      ))}
    </div>
  );
}

// ============ SCATTER CHART ============
function ScatterChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  const width = compact ? 320 : 420;
  const height = compact ? 110 : 170;
  const pad = compact ? { t: 10, r: 12, b: 22, l: 32 } : { t: 14, r: 16, b: 28, l: 40 };
  const cw = width - pad.l - pad.r, ch = height - pad.t - pad.b;

  // Fallback: index → x, value → y.
  const xs = data.map((d, i) => d.x ?? i);
  const ys = data.map((d) => d.y ?? d.value);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys, 0), yMax = Math.max(...ys, 1);
  const sx = (v: number) => pad.l + (xMax > xMin ? (v - xMin) / (xMax - xMin) : 0.5) * cw;
  const sy = (v: number) => pad.t + ch - (yMax > yMin ? (v - yMin) / (yMax - yMin) : 0.5) * ch;
  const r = compact ? 4 : 5;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {config.showGrid !== false && (
          <g opacity="0.12">
            {[0, 0.5, 1].map((t, i) => (
              <line key={`h${i}`} x1={pad.l} y1={pad.t + ch * t} x2={pad.l + cw} y2={pad.t + ch * t} stroke={colors.text} strokeDasharray="3,4" />
            ))}
          </g>
        )}
        {/* Axes */}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + ch} stroke={colors.text} strokeOpacity="0.2" />
        <line x1={pad.l} y1={pad.t + ch} x2={pad.l + cw} y2={pad.t + ch} stroke={colors.text} strokeOpacity="0.2" />
        {data.map((d, i) => {
          const c = getPointColor(d, i);
          const isHovered = hoveredIndex === i;
          return (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              <circle cx={sx(xs[i]!)} cy={sy(ys[i]!)} r={isHovered ? r + 2 : r}
                fill={withAlpha(c, 0.85)} stroke={colors.bg} strokeWidth={1}
                style={{ opacity: mounted ? 1 : 0, transition: `opacity 400ms ease ${i * 30}ms, r 150ms` }} />
            </g>
          );
        })}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <g>
            <rect x={Math.min(Math.max(sx(xs[hoveredIndex]!) - 28, 2), width - 58)} y={Math.max(sy(ys[hoveredIndex]!) - 26, 2)} width="56" height="18" rx="4" fill={colors.text} />
            <text x={Math.min(Math.max(sx(xs[hoveredIndex]!), 30), width - 30)} y={Math.max(sy(ys[hoveredIndex]!) - 13, 15)} textAnchor="middle" fill={colors.bg} fontSize={compact ? 9 : 10} fontWeight="600">
              {sentenceCase(data[hoveredIndex]!.label)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ============ BUBBLE CHART ============
function BubbleChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  const stableId = useId().replace(/:/g, "");
  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  const width = compact ? 320 : 420;
  const height = compact ? 120 : 180;
  const pad = compact ? { t: 12, r: 14, b: 22, l: 32 } : { t: 16, r: 18, b: 28, l: 40 };
  const cw = width - pad.l - pad.r, ch = height - pad.t - pad.b;

  const xs = data.map((d, i) => d.x ?? i);
  const ys = data.map((d) => d.y ?? d.value);
  const sizes = data.map((d) => d.size ?? d.value);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys, 0), yMax = Math.max(...ys, 1);
  const sizeMax = Math.max(...sizes, 1);
  const sx = (v: number) => pad.l + (xMax > xMin ? (v - xMin) / (xMax - xMin) : 0.5) * cw;
  const sy = (v: number) => pad.t + ch - (yMax > yMin ? (v - yMin) / (yMax - yMin) : 0.5) * ch;
  const rMax = compact ? 16 : 22, rMin = compact ? 4 : 5;
  const radius = (s: number) => rMin + (sizeMax > 0 ? Math.sqrt(s / sizeMax) : 0) * (rMax - rMin);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + ch} stroke={colors.text} strokeOpacity="0.2" />
        <line x1={pad.l} y1={pad.t + ch} x2={pad.l + cw} y2={pad.t + ch} stroke={colors.text} strokeOpacity="0.2" />
        {data.map((d, i) => {
          const c = getPointColor(d, i);
          const isHovered = hoveredIndex === i;
          const gid = `bubble-${stableId}-${i}`;
          return (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              <defs>
                <radialGradient id={gid} cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor={withAlpha(c, 0.95)} />
                  <stop offset="100%" stopColor={withAlpha(c, 0.45)} />
                </radialGradient>
              </defs>
              <circle cx={sx(xs[i]!)} cy={sy(ys[i]!)} r={mounted ? radius(sizes[i]!) : 0}
                fill={`url(#${gid})`} stroke={c} strokeOpacity={isHovered ? 0.9 : 0.4} strokeWidth={1}
                style={{ transition: `r 600ms cubic-bezier(0.22,1,0.36,1) ${i * 40}ms, stroke-opacity 200ms` }} />
            </g>
          );
        })}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <g>
            <rect x={Math.min(Math.max(sx(xs[hoveredIndex]!) - 30, 2), width - 62)} y={Math.max(sy(ys[hoveredIndex]!) - radius(sizes[hoveredIndex]!) - 22, 2)} width="60" height="18" rx="4" fill={colors.text} />
            <text x={Math.min(Math.max(sx(xs[hoveredIndex]!), 32), width - 32)} y={Math.max(sy(ys[hoveredIndex]!) - radius(sizes[hoveredIndex]!) - 9, 15)} textAnchor="middle" fill={colors.bg} fontSize={compact ? 9 : 10} fontWeight="600">
              {sentenceCase(data[hoveredIndex]!.label)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ============ TREEMAP CHART ============
function TreemapChart({ data, config, colors, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  const width = 100, height = 62; // viewBox units; rendered responsively as %.
  const total = data.reduce((s, d) => s + Math.max(d.value, 0), 0) || 1;

  // Squarified row treemap: lay items into horizontal rows, closing a row when
  // adding the next item would worsen its worst aspect ratio.
  type Rect = { x: number; y: number; w: number; h: number; data: ChartDataPoint; index: number };
  const rects: Rect[] = [];
  const area = width * height;
  // Largest-first packs the prominent values first for a tidier layout.
  const items = data
    .map((d, i) => ({ d, i, a: (Math.max(d.value, 0) / total) * area }))
    .sort((p, q) => q.a - p.a);

  const worstRatio = (row: { a: number }[], rowSum: number, side: number) => {
    if (side <= 0 || rowSum <= 0) return Infinity;
    const max = Math.max(...row.map((it) => it.a));
    const min = Math.min(...row.map((it) => it.a));
    const s2 = rowSum * rowSum;
    const w2 = side * side;
    return Math.max((w2 * max) / s2, s2 / (w2 * min));
  };

  let y = 0;
  let cursor = 0;
  // Outer loop is bounded by item count; inner loop only advances `cursor`.
  while (cursor < items.length && y < height - 0.01) {
    const remainingH = height - y;
    const row: typeof items = [];
    let rowSum = 0;
    // Grow the current row while the worst aspect ratio keeps improving.
    while (cursor < items.length) {
      const next = items[cursor]!;
      const withNext = worstRatio([...row, next], rowSum + next.a, width);
      const current = row.length ? worstRatio(row, rowSum, width) : Infinity;
      if (row.length && withNext > current) break;
      row.push(next);
      rowSum += next.a;
      cursor++;
    }
    const rowH = Math.min(rowSum / width || remainingH, remainingH);
    let x = 0;
    for (const it of row) {
      const w = (it.a / (rowSum || 1)) * width;
      rects.push({ x, y, w, h: rowH, data: it.d, index: it.i });
      x += w;
    }
    y += rowH;
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none" style={{ maxHeight: 200 }}>
        {rects.map((rc) => {
          const c = getPointColor(rc.data, rc.index);
          const isHovered = hoveredIndex === rc.index;
          const pad = 0.4;
          const showText = rc.w > 14 && rc.h > 9;
          return (
            <g key={rc.index} onMouseEnter={() => setHoveredIndex(rc.index)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              <rect x={rc.x + pad} y={rc.y + pad} width={Math.max(rc.w - pad * 2, 0)} height={Math.max(rc.h - pad * 2, 0)} rx={1.2}
                fill={withAlpha(c, isHovered ? 1 : 0.88)} stroke={colors.bg} strokeWidth={0.6}
                style={{ opacity: mounted ? 1 : 0, transition: "opacity 500ms ease" }} />
              {showText && (
                <text x={rc.x + 1.6} y={rc.y + 4.2} fill="#ffffff" fontSize={2.6} fontWeight="600" style={{ pointerEvents: "none" }}>
                  {sentenceCase(rc.data.label)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="text-center mt-1 text-[9px]" style={{ color: colors.muted }}>
          {sentenceCase(data[hoveredIndex]!.label)} · {formatChartValue(data[hoveredIndex]!.value, config)}
        </div>
      )}
    </div>
  );
}

// ============ HEATMAP CHART ============
function HeatmapChart({ data, config, colors, hoveredIndex, setHoveredIndex, getPointColor, mounted, series }: BaseProps) {
  const { hasSeries, seriesRows, labels } = useSeriesMatrix(data, series);
  if (labels.length === 0) return <EmptyState colors={colors} />;

  // Grid: rows = series (or auto-wrapped single series), cols = categories.
  const cols = labels;
  const allValues = seriesRows.flatMap((s) => s.data.map((d) => d.value));
  const vMax = Math.max(config.maxValue || 0, ...allValues, 1);
  const vMin = Math.min(...allValues, 0);
  const baseColor = getPointColor(data[0] ?? { label: "", value: 0 }, 0);
  const intensity = (v: number) => (vMax > vMin ? (v - vMin) / (vMax - vMin) : 0.5);

  // For a plain single series, wrap into a near-square grid for visual balance.
  if (!hasSeries) {
    const n = data.length;
    const colCount = Math.ceil(Math.sqrt(n));
    return (
      <div className="w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
          {data.map((d, i) => {
            const t = intensity(d.value);
            const isHovered = hoveredIndex === i;
            return (
              <div key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
                className="rounded-sm flex items-center justify-center cursor-pointer"
                style={{
                  aspectRatio: "1.6 / 1",
                  background: withAlpha(baseColor, 0.12 + t * 0.85),
                  outline: isHovered ? `1.5px solid ${baseColor}` : "none",
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 400ms ease ${i * 20}ms`,
                }}>
                <span className="text-[8px] font-semibold" style={{ color: t > 0.55 ? "#ffffff" : colors.text }}>
                  {config.showValues !== false ? formatChartValue(d.value, config) : sentenceCase(d.label)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(0, 1fr))` }}>
        <div />
        {cols.map((label, ci) => (
          <div key={ci} className="text-[8px] text-center truncate pb-0.5" style={{ color: colors.muted }}>{sentenceCase(label)}</div>
        ))}
        {seriesRows.map((s, ri) => (
          <Fragment key={ri}>
            <div className="text-[8px] flex items-center pr-1 whitespace-nowrap" style={{ color: colors.muted }}>{sentenceCase(s.name || `Row ${ri + 1}`)}</div>
            {cols.map((_, ci) => {
              const v = s.data[ci]?.value ?? 0;
              const t = intensity(v);
              const flat = ri * cols.length + ci;
              const isHovered = hoveredIndex === flat;
              return (
                <div key={ci} onMouseEnter={() => setHoveredIndex(flat)} onMouseLeave={() => setHoveredIndex(null)}
                  className="rounded-sm flex items-center justify-center cursor-pointer"
                  style={{
                    aspectRatio: "1.8 / 1",
                    background: withAlpha(baseColor, 0.1 + t * 0.85),
                    outline: isHovered ? `1.5px solid ${baseColor}` : "none",
                    opacity: mounted ? 1 : 0,
                    transition: `opacity 400ms ease ${flat * 15}ms`,
                  }}>
                  {config.showValues !== false && (
                    <span className="text-[7px] font-semibold" style={{ color: t > 0.55 ? "#ffffff" : colors.text }}>{formatChartValue(v, config)}</span>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// ============ WATERFALL CHART ============
function WaterfallChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  const stableId = useId().replace(/:/g, "");
  if (!data || data.length === 0) return <EmptyState colors={colors} />;

  const width = compact ? 320 : 420;
  const height = compact ? 120 : 170;
  const pad = compact ? { t: 14, r: 10, b: 24, l: 32 } : { t: 16, r: 14, b: 30, l: 40 };
  const cw = width - pad.l - pad.r, ch = height - pad.t - pad.b;

  // Build running totals; treat the last bar as a final total if it roughly equals the sum.
  let running = 0;
  const steps = data.map((d, i) => {
    const start = running;
    running += d.value;
    return { start, end: running, value: d.value, data: d, index: i };
  });
  const minY = Math.min(0, ...steps.map((s) => Math.min(s.start, s.end)));
  const maxY = Math.max(0, ...steps.map((s) => Math.max(s.start, s.end)), 1);
  const sy = (v: number) => pad.t + ch - ((v - minY) / (maxY - minY || 1)) * ch;
  const slot = cw / steps.length;
  const barW = Math.min(compact ? 30 : 44, slot * 0.62);
  const upColor = "#10b981", downColor = "#ef4444";

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`wf-up-${stableId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={upColor} /><stop offset="100%" stopColor={withAlpha(upColor, 0.45)} />
          </linearGradient>
          <linearGradient id={`wf-down-${stableId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={downColor} /><stop offset="100%" stopColor={withAlpha(downColor, 0.45)} />
          </linearGradient>
        </defs>
        {/* Baseline at zero */}
        <line x1={pad.l} y1={sy(0)} x2={pad.l + cw} y2={sy(0)} stroke={colors.text} strokeOpacity="0.25" />
        {steps.map((s, i) => {
          const up = s.value >= 0;
          const yTop = sy(Math.max(s.start, s.end));
          const yBot = sy(Math.min(s.start, s.end));
          const x = pad.l + i * slot + (slot - barW) / 2;
          const fullH = Math.max(yBot - yTop, 1);
          const isHovered = hoveredIndex === i;
          return (
            <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
              {/* connector to next bar */}
              {i < steps.length - 1 && (
                <line x1={x + barW} y1={sy(s.end)} x2={x + slot} y2={sy(s.end)} stroke={colors.text} strokeOpacity="0.18" strokeDasharray="2,2" />
              )}
              <rect x={x} y={mounted ? yTop : sy(0)} width={barW} height={mounted ? fullH : 0} rx={2}
                fill={`url(#${up ? `wf-up-${stableId}` : `wf-down-${stableId}`})`}
                style={{ opacity: isHovered ? 1 : 0.92, transition: `y 650ms cubic-bezier(0.22,1,0.36,1) ${i * 50}ms, height 650ms cubic-bezier(0.22,1,0.36,1) ${i * 50}ms, opacity 200ms` }} />
              {config.showValues !== false && (
                <text x={x + barW / 2} y={yTop - 3} textAnchor="middle" fontSize={compact ? 8 : 9} fontWeight="600" fill={up ? upColor : downColor}>
                  {(up ? "+" : "") + formatChartValue(s.value, config)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {config.showLabels !== false && (
        <div className="flex justify-between px-6 -mt-1">
          {data.map((d, i) => (
            <span key={i} className="font-medium text-center truncate" style={{ fontSize: compact ? "8px" : "9px", maxWidth: barW + 12, color: hoveredIndex === i ? colors.text : colors.muted }}>
              {sentenceCase(d.label)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ HISTOGRAM CHART ============
function HistogramChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  const stableId = useId().replace(/:/g, "");
  if (!data || data.length === 0) return <EmptyState colors={colors} />;

  // Bucket the raw values into frequency bins (Sturges-ish, capped for small canvases).
  const values = data.map((d) => d.value);
  const vMin = Math.min(...values), vMax = Math.max(...values);
  const binCount = Math.max(3, Math.min(compact ? 7 : 10, Math.ceil(Math.sqrt(values.length))));
  const range = vMax - vMin || 1;
  const binSize = range / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    lo: vMin + i * binSize,
    hi: vMin + (i + 1) * binSize,
    count: 0,
  }));
  for (const v of values) {
    const idx = Math.min(binCount - 1, Math.floor((v - vMin) / binSize));
    bins[idx]!.count++;
  }
  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const barColor = getPointColor(data[0]!, 0);

  const chartHeight = compact ? 90 : 150;
  const gradId = `hist-${stableId}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 100 ${compact ? 56 : 64}`} className="w-full h-auto" preserveAspectRatio="none" style={{ maxHeight: chartHeight }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} /><stop offset="100%" stopColor={withAlpha(barColor, 0.4)} />
          </linearGradient>
        </defs>
        {bins.map((b, i) => {
          const bw = 100 / binCount;
          const x = i * bw;
          const fullH = (b.count / maxCount) * (compact ? 50 : 58);
          const yTop = (compact ? 54 : 62) - fullH;
          const isHovered = hoveredIndex === i;
          return (
            <rect key={i} x={x + bw * 0.08} y={mounted ? yTop : (compact ? 54 : 62)} width={bw * 0.84} height={mounted ? Math.max(fullH, 0.5) : 0} rx={0.8}
              fill={`url(#${gradId})`} style={{ opacity: isHovered ? 1 : 0.9, transition: `y 600ms cubic-bezier(0.22,1,0.36,1) ${i * 35}ms, height 600ms cubic-bezier(0.22,1,0.36,1) ${i * 35}ms, opacity 200ms` }}
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
          );
        })}
      </svg>
      {config.showLabels !== false && (
        <div className="flex justify-between mt-1" style={{ fontSize: compact ? "7px" : "8px", color: colors.muted }}>
          <span>{formatChartValue(vMin, config)}</span>
          <span>{formatChartValue(vMax, config)}</span>
        </div>
      )}
      {hoveredIndex !== null && bins[hoveredIndex] && (
        <div className="text-center mt-0.5 text-[9px]" style={{ color: colors.muted }}>
          {formatChartValue(bins[hoveredIndex]!.lo, config)}–{formatChartValue(bins[hoveredIndex]!.hi, config)} · {bins[hoveredIndex]!.count} {bins[hoveredIndex]!.count === 1 ? "item" : "items"}
        </div>
      )}
    </div>
  );
}

// ============ PIE CHART ============
function PieChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor }: BaseProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  // Bigger size for non-compact (presentation) mode
  const size = compact ? 70 : 140;
  const center = size / 2;
  const radius = (size / 2) - 4;
  const legendFontSize = compact ? "9px" : "11px";
  const legendDotSize = compact ? "w-2 h-2" : "w-3 h-3";

  let angle = -90;
  const segments = data.map((d, i) => {
    const pct = total > 0 ? d.value / total : 0;
    const sweep = pct * 360;
    const start = angle;
    angle += sweep;
    const s = (start * Math.PI) / 180, e = ((start + sweep) * Math.PI) / 180;
    const x1 = center + radius * Math.cos(s), y1 = center + radius * Math.sin(s);
    const x2 = center + radius * Math.cos(e), y2 = center + radius * Math.sin(e);
    const large = sweep > 180 ? 1 : 0;
    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
    return { path, pct, data: d, index: i };
  });

  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      <svg width={size} height={size}>
        {segments.map((seg, i) => (
          <path key={i} d={seg.path} fill={getPointColor(seg.data, i)} 
            className="cursor-pointer transition-all duration-150"
            style={{ 
              opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.5, 
              transform: hoveredIndex === i ? "scale(1.03)" : "scale(1)", 
              transformOrigin: `${center}px ${center}px` 
            }}
            onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
        ))}
      </svg>
      {config.showLegend !== false && (
        <div className={compact ? "space-y-1" : "space-y-2"}>
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2 cursor-pointer transition-opacity" 
              style={{ opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1 }}
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              <div className={`${legendDotSize} rounded-sm`} style={{ backgroundColor: getPointColor(item, i) }} />
              <span style={{ fontSize: legendFontSize, color: colors.text }}>{item.label}</span>
              {config.showValues !== false && (
                <span style={{ fontSize: legendFontSize, color: colors.muted }}>
                  {((item.value / total) * 100).toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ DONUT CHART ============
function DonutChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor }: BaseProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  // Bigger size for non-compact (presentation) mode
  const size = compact ? 70 : 140;
  const center = size / 2;
  const outerR = (size / 2) - 4;
  const innerR = outerR * 0.55;
  const centerFontSize = compact ? "text-sm" : "text-lg";
  const centerLabelSize = compact ? "8px" : "10px";
  const legendFontSize = compact ? "9px" : "11px";
  const legendDotSize = compact ? "w-2 h-2" : "w-3 h-3";

  let angle = -90;
  const segments = data.map((d, i) => {
    const pct = total > 0 ? d.value / total : 0;
    const sweep = pct * 360;
    const start = angle;
    angle += sweep;
    const s = (start * Math.PI) / 180, e = ((start + sweep) * Math.PI) / 180;
    const x1 = center + outerR * Math.cos(s), y1 = center + outerR * Math.sin(s);
    const x2 = center + outerR * Math.cos(e), y2 = center + outerR * Math.sin(e);
    const x1i = center + innerR * Math.cos(s), y1i = center + innerR * Math.sin(s);
    const x2i = center + innerR * Math.cos(e), y2i = center + innerR * Math.sin(e);
    const large = sweep > 180 ? 1 : 0;
    const path = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x2i} ${y2i} A ${innerR} ${innerR} 0 ${large} 0 ${x1i} ${y1i} Z`;
    return { path, pct, data: d, index: i };
  });

  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      <div className="relative">
        <svg width={size} height={size}>
          {segments.map((seg, i) => (
            <path key={i} d={seg.path} fill={getPointColor(seg.data, i)} 
              className="cursor-pointer transition-all duration-150"
              style={{ 
                opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.5, 
                transform: hoveredIndex === i ? "scale(1.03)" : "scale(1)", 
                transformOrigin: `${center}px ${center}px` 
              }}
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`${centerFontSize} font-bold`} style={{ color: colors.text }}>
            {hoveredIndex !== null ? `${((segments[hoveredIndex]?.pct ?? 0) * 100).toFixed(0)}%` : total.toLocaleString()}
          </span>
          <span style={{ fontSize: centerLabelSize, color: colors.muted }}>
            {hoveredIndex !== null ? data[hoveredIndex]?.label : "Total"}
          </span>
        </div>
      </div>
      {config.showLegend !== false && (
        <div className={compact ? "space-y-1" : "space-y-2"}>
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2 cursor-pointer transition-opacity" 
              style={{ opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1 }}
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              <div className={`${legendDotSize} rounded-sm`} style={{ backgroundColor: getPointColor(item, i) }} />
              <span className="text-[9px]" style={{ color: colors.text }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ COMPARISON CHART ============
function ComparisonChart({ data, config, colors, maxValue, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {data.map((item, i) => {
        const isHovered = hoveredIndex === i;
        const c = getPointColor(item, i);
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={i} className="p-2 min-w-[60px] text-center rounded-lg border cursor-pointer transition-all duration-150"
            style={{
              borderColor: isHovered ? c : withAlpha(colors.text, 0.1),
              backgroundColor: isHovered ? withAlpha(c, 0.06) : "transparent",
              boxShadow: isHovered ? `0 4px 14px ${withAlpha(c, 0.18)}` : "none",
            }}
            onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
            <div className="text-base font-bold" style={{ color: c }}>
              {formatChartValue(item.value, config)}
            </div>
            <div className="text-[8px] mt-0.5" style={{ color: colors.muted }}>{sentenceCase(item.label)}</div>
            <div className="h-1 mt-1.5 rounded-full overflow-hidden" style={{ backgroundColor: withAlpha(colors.text, 0.08) }}>
              <div className="h-full rounded-full"
                style={{ width: `${mounted ? pct : 0}%`, background: `linear-gradient(to right, ${withAlpha(c, 0.7)}, ${c})`, transition: `width 700ms cubic-bezier(0.22,1,0.36,1) ${i * 50}ms` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ KPI CHART ============
function KPIChart({ data, config, colors, compact }: BaseProps) {
  const item = data[0];
  if (!item) return null;
  const trendColor = config.trend === "up" ? "#10b981" : config.trend === "down" ? "#ef4444" : colors.muted;
  const trendIcon = config.trend === "up" ? "↑" : config.trend === "down" ? "↓" : "→";

  return (
    <div className="p-3 rounded-lg border text-center" style={{ borderColor: `${colors.text}10` }}>
      <div className="text-[9px] font-medium" style={{ color: colors.muted }}>{item.label}</div>
      <div className="text-2xl font-bold my-0.5" style={{ color: colors.accent }}>
        {formatChartValue(item.value, config)}
      </div>
      {config.trend && config.trendValue !== undefined && (
        <div className="flex items-center justify-center gap-1" style={{ color: trendColor }}>
          <span className="text-xs">{trendIcon} {config.trendValue}%</span>
          <span className="text-[8px]" style={{ color: colors.muted }}>vs last</span>
        </div>
      )}
      {config.target && (
        <div className="mt-2">
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.text}10` }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min((item.value / config.target) * 100, 100)}%`, backgroundColor: colors.accent }} />
          </div>
          <div className="text-[8px] mt-1" style={{ color: colors.muted }}>
            {Math.round((item.value / config.target) * 100)}% of target
          </div>
        </div>
      )}
    </div>
  );
}

// ============ FUNNEL CHART ============
function FunnelChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  const maxValue = Math.max(...data.map(d => d.value));
  return (
    <div className="w-full space-y-0.5">
      {data.map((item, i) => {
        const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const isHovered = hoveredIndex === i;
        const c = getPointColor(item, i);
        const rate = i > 0 && data[i - 1] ? ((item.value / data[i - 1]!.value) * 100).toFixed(0) : null;
        return (
          <div key={i} className="flex items-center gap-2" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
            <div className="w-12 text-[8px] text-right truncate transition-colors"
              style={{ color: isHovered ? c : colors.text }}>
              {sentenceCase(item.label)}
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-5 rounded-md flex items-center justify-center"
                style={{
                  width: `${mounted ? width : 0}%`,
                  minWidth: "24px",
                  background: `linear-gradient(to right, ${withAlpha(c, 0.75)}, ${c})`,
                  boxShadow: isHovered ? `0 2px 8px ${withAlpha(c, 0.35)}` : "none",
                  opacity: isHovered ? 1 : 0.88,
                  transition: `width 700ms cubic-bezier(0.22,1,0.36,1) ${i * 60}ms, opacity 200ms, box-shadow 200ms`,
                }}>
                {config.showValues !== false && (
                  <span className="text-[8px] font-semibold text-white">
                    {formatChartValue(item.value, config)}
                  </span>
                )}
              </div>
            </div>
            {rate && (
              <div className="w-8 text-[8px]" style={{ color: colors.muted }}>{rate}%</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============ PROGRESS CHART ============
function ProgressChart({ data, config, colors, getPointColor, mounted }: BaseProps) {
  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  const maxValue = config.maxValue || 100;
  return (
    <div className="w-full space-y-2">
      {data.map((item, i) => {
        const pct = Math.min((item.value / maxValue) * 100, 100);
        const c = getPointColor(item, i);
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px]" style={{ color: colors.text }}>{sentenceCase(item.label)}</span>
              <span className="text-[9px] font-semibold" style={{ color: c }}>
                {formatChartValue(item.value, config)}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: withAlpha(colors.text, 0.08) }}>
              <div className="h-full rounded-full"
                style={{
                  width: `${mounted ? pct : 0}%`,
                  background: `linear-gradient(to right, ${withAlpha(c, 0.7)}, ${c})`,
                  transition: `width 750ms cubic-bezier(0.22,1,0.36,1) ${i * 60}ms`,
                }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ GAUGE CHART ============
function GaugeChart({ data, config, colors, compact, mounted }: BaseProps) {
  const item = data[0];
  if (!item) return <EmptyState colors={colors} />;
  const maxValue = config.maxValue || 100;
  const pct = Math.min((item.value / maxValue) * 100, 100);
  const angle = (pct / 100) * 180;
  const size = compact ? 80 : 100;
  const sw = 8;
  const r = (size - sw) / 2;
  const circ = Math.PI * r;
  const gaugeColor = pct < 33 ? "#ef4444" : pct < 66 ? "#f59e0b" : "#10b981";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 16 }}>
        <svg width={size} height={size / 2 + 16}>
          <path d={`M ${sw / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - sw / 2} ${size / 2}`}
            fill="none" stroke={withAlpha(colors.text, 0.1)} strokeWidth={sw} strokeLinecap="round" />
          <path d={`M ${sw / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - sw / 2} ${size / 2}`}
            fill="none" stroke={gaugeColor} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={mounted ? circ - (circ * angle) / 180 : circ}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }} />
        </svg>
        <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ bottom: 0 }}>
          <div className="text-base font-bold" style={{ color: colors.text }}>
            {formatChartValue(item.value, config)}
          </div>
          <div className="text-[8px]" style={{ color: colors.muted }}>{item.label}</div>
        </div>
      </div>
      <div className="flex justify-between w-full px-1 mt-0.5">
        <span className="text-[8px]" style={{ color: colors.muted }}>{config.minValue || 0}</span>
        <span className="text-[8px]" style={{ color: colors.muted }}>{maxValue}</span>
      </div>
    </div>
  );
}

// ============ RADAR CHART ============
function RadarChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, mounted }: BaseProps) {
  const stableId = useId().replace(/:/g, "");
  if (!data || data.length === 0) return <EmptyState colors={colors} />;
  const size = compact ? 90 : 130;
  const center = size / 2;
  const maxR = (size / 2) - 18;
  const maxValue = config.maxValue || Math.max(...data.map(d => d.value)) || 1;
  const step = (2 * Math.PI) / data.length;
  const accentColor = getPointColor(data[0]!, 0);
  const fillId = `radar-fill-${stableId}`;

  const points = data.map((d, i) => {
    const a = i * step - Math.PI / 2;
    const r = (d.value / maxValue) * maxR;
    return {
      x: center + r * Math.cos(a),
      y: center + r * Math.sin(a),
      lx: center + (maxR + 12) * Math.cos(a),
      ly: center + (maxR + 12) * Math.sin(a),
      data: d, i
    };
  });

  return (
    <div className="flex justify-center w-full">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet" style={{ maxWidth: size * 1.6 }}>
        <defs>
          <radialGradient id={fillId} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={withAlpha(accentColor, 0.35)} />
            <stop offset="100%" stopColor={withAlpha(accentColor, 0.12)} />
          </radialGradient>
        </defs>
        {[0.33, 0.66, 1].map((r, i) => (
          <polygon key={i}
            points={data.map((_, j) => {
              const a = j * step - Math.PI / 2;
              return `${center + maxR * r * Math.cos(a)},${center + maxR * r * Math.sin(a)}`;
            }).join(" ")}
            fill="none" stroke={colors.text} strokeOpacity="0.1" />
        ))}
        {data.map((_, i) => {
          const a = i * step - Math.PI / 2;
          return <line key={i} x1={center} y1={center} x2={center + maxR * Math.cos(a)} y2={center + maxR * Math.sin(a)} stroke={colors.text} strokeOpacity="0.1" />;
        })}
        <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")} fill={`url(#${fillId})`} stroke={accentColor} strokeWidth="1.5"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? "scale(1)" : "scale(0.4)", transformOrigin: `${center}px ${center}px`, transition: "opacity 600ms ease, transform 600ms cubic-bezier(0.22,1,0.36,1)" }} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hoveredIndex === i ? 4 : 3} fill={colors.bg} stroke={accentColor} strokeWidth="1.5"
            className="cursor-pointer" style={{ opacity: mounted ? 1 : 0, transition: `opacity 300ms ease ${300 + i * 40}ms, r 150ms` }}
            onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
        ))}
        {points.map((p, i) => (
          <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
            className="transition-colors" fontSize={compact ? 6 : 7}
            fill={hoveredIndex === i ? accentColor : colors.muted}>
            {sentenceCase(p.data.label)}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ============ TABLE CHART ============
function TableChart({ data, config, colors, compact }: BaseProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.accent}` }}>
            <th className="p-1.5 text-[9px] text-left font-semibold" style={{ color: colors.text }}>Item</th>
            <th className="p-1.5 text-[9px] text-right font-semibold" style={{ color: colors.text }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" 
              style={{ borderBottom: `1px solid ${colors.text}10` }}>
              <td className="p-1.5 text-[9px]" style={{ color: colors.text }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || colors.accent }} />
                  {item.label}
                </div>
              </td>
              <td className="p-1.5 text-[9px] text-right font-semibold" 
                style={{ color: item.color || colors.accent }}>
                {formatChartValue(item.value, config)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
