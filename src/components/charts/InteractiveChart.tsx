"use client";

import { useState, useMemo, useId } from "react";
import { type ChartData, type ChartDataPoint, type ChartConfig, getChartColor, formatChartValue, COLOR_SCHEMES } from "~/lib/charts/types";
import { type Theme } from "~/lib/themes";

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
  const { type, data, config, title, subtitle } = chart;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title || "");

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

  const chartProps = { data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex: interactive ? setHoveredIndex : () => {}, getPointColor };

  const renderChart = () => {
    switch (type) {
      case "bar": return <BarChart {...chartProps} />;
      case "horizontal-bar": return <HorizontalBarChart {...chartProps} />;
      case "line": return <LineChart {...chartProps} />;
      case "area": return <AreaChart {...chartProps} />;
      case "pie": return <PieChart {...chartProps} />;
      case "donut": return <DonutChart {...chartProps} />;
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
};

// ============ BAR CHART ============
function BarChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor }: BaseProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-4">
        <span className="text-xs" style={{ color: colors.muted }}>No data available</span>
      </div>
    );
  }

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
            <div key={i} className="flex flex-col items-center group" 
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
                className="rounded-t transition-all duration-200 ease-out"
                style={{ 
                  width: barWidth, 
                  height: `${Math.max(height, 2)}%`, 
                  backgroundColor: barColor,
                  opacity: isHovered ? 1 : 0.85,
                  transform: isHovered ? "scaleY(1.02)" : "scaleY(1)",
                  transformOrigin: "bottom",
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
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ HORIZONTAL BAR CHART ============
function HorizontalBarChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor }: BaseProps) {
  return (
    <div className={`w-full ${compact ? "space-y-1" : "space-y-1.5"}`}>
      {data.map((item, i) => {
        const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const isHovered = hoveredIndex === i;
        return (
          <div key={i} className="flex items-center gap-2" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
            <div className="w-16 text-[9px] text-right truncate transition-colors" 
              style={{ color: isHovered ? getPointColor(item, i) : colors.text }}>
              {item.label}
            </div>
            <div className="flex-1 h-4 rounded overflow-hidden" style={{ backgroundColor: `${colors.text}08` }}>
              <div 
                className="h-full rounded transition-all duration-200"
                style={{ 
                  width: `${width}%`, 
                  backgroundColor: getPointColor(item, i),
                  opacity: isHovered ? 1 : 0.8
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
function LineChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor }: BaseProps) {
  // Bigger dimensions for non-compact (presentation) mode
  const width = compact ? 320 : 420;
  const height = compact ? 70 : 140;
  const pad = compact ? { t: 8, r: 12, b: 20, l: 32 } : { t: 12, r: 16, b: 28, l: 40 };
  const cw = width - pad.l - pad.r, ch = height - pad.t - pad.b;
  const lineColor = getPointColor(data[0]!, 0);
  const strokeWidth = compact ? 2 : 2.5;
  const pointRadius = compact ? 3 : 4;
  const pointRadiusHover = compact ? 4 : 6;
  const fontSize = compact ? 9 : 11;
  const labelSize = compact ? "8px" : "10px";

  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-4">
        <span className="text-xs" style={{ color: colors.muted }}>No data available</span>
      </div>
    );
  }

  const points = data.map((d, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * cw,
    y: pad.t + ch - ((d.value || 0) / maxValue) * ch,
    data: d, index: i,
  }));

  // Create smooth curve path
  const createSmoothPath = (pts: typeof points) => {
    if (pts.length < 2) return `M ${pts[0]?.x || 0} ${pts[0]?.y || 0}`;
    let path = `M ${pts[0]!.x} ${pts[0]!.y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i]!;
      const p1 = pts[i + 1]!;
      const midX = (p0.x + p1.x) / 2;
      path += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = config.lineSmooth !== false ? createSmoothPath(points) : points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {config.showGrid !== false && (
          <g opacity="0.12">
            {[0, 0.5, 1].map((r, i) => (
              <line key={i} x1={pad.l} y1={pad.t + ch * r} x2={pad.l + cw} y2={pad.t + ch * r} stroke={colors.text} strokeDasharray="3,4" />
            ))}
          </g>
        )}
        
        {/* Line */}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={14} fill="transparent" className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
            <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? pointRadiusHover : pointRadius} fill={colors.bg} stroke={lineColor} strokeWidth={strokeWidth}
              className="transition-all duration-150" />
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
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ AREA CHART ============
function AreaChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor }: BaseProps) {
  // Use stable ID for gradient to avoid hydration mismatch
  const stableId = useId();
  
  // Bigger dimensions for non-compact (presentation) mode
  const width = compact ? 320 : 420;
  const height = compact ? 70 : 140;
  const pad = compact ? { t: 8, r: 12, b: 20, l: 32 } : { t: 12, r: 16, b: 28, l: 40 };
  const cw = width - pad.l - pad.r, ch = height - pad.t - pad.b;
  const lineColor = getPointColor(data[0]!, 0);
  const strokeWidth = compact ? 2 : 2.5;
  const pointRadius = compact ? 3 : 4;
  const pointRadiusHover = compact ? 4 : 6;
  const fontSize = compact ? 9 : 11;
  const labelSize = compact ? "8px" : "10px";
  
  // Ensure we have valid data
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-4">
        <span className="text-xs" style={{ color: colors.muted }}>No data available</span>
      </div>
    );
  }

  const points = data.map((d, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * cw,
    y: pad.t + ch - ((d.value || 0) / maxValue) * ch,
    data: d, index: i,
  }));

  // Create smooth curve path using bezier curves
  const createSmoothPath = (pts: typeof points) => {
    if (pts.length < 2) return `M ${pts[0]?.x || 0} ${pts[0]?.y || 0}`;
    
    let path = `M ${pts[0]!.x} ${pts[0]!.y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i]!;
      const p1 = pts[i + 1]!;
      const midX = (p0.x + p1.x) / 2;
      path += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = config.lineSmooth !== false ? createSmoothPath(points) : points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = linePath + ` L ${points[points.length - 1]?.x} ${pad.t + ch} L ${points[0]?.x} ${pad.t + ch} Z`;
  const gradientId = `area-grad-${stableId.replace(/:/g, "")}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
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
        
        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        
        {/* Line */}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={14} fill="transparent" className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
            <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? pointRadiusHover : pointRadius} fill={colors.bg} stroke={lineColor} strokeWidth={strokeWidth}
              className="transition-all duration-150" />
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
              {item.label}
            </span>
          ))}
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
function ComparisonChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor }: BaseProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {data.map((item, i) => {
        const isHovered = hoveredIndex === i;
        const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={i} className="p-2 min-w-[60px] text-center rounded-lg border cursor-pointer transition-all duration-150"
            style={{ 
              borderColor: isHovered ? getPointColor(item, i) : `${colors.text}15`, 
              backgroundColor: isHovered ? `${getPointColor(item, i)}08` : "transparent",
            }}
            onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
            <div className="text-base font-bold" style={{ color: getPointColor(item, i) }}>
              {formatChartValue(item.value, config)}
            </div>
            <div className="text-[8px] mt-0.5" style={{ color: colors.muted }}>{item.label}</div>
            <div className="h-1 mt-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.text}10` }}>
              <div className="h-full rounded-full transition-all duration-200" style={{ width: `${pct}%`, backgroundColor: getPointColor(item, i) }} />
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
function FunnelChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor }: BaseProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  return (
    <div className="w-full space-y-0.5">
      {data.map((item, i) => {
        const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        const isHovered = hoveredIndex === i;
        const rate = i > 0 && data[i - 1] ? ((item.value / data[i - 1]!.value) * 100).toFixed(0) : null;
        return (
          <div key={i} className="flex items-center gap-2" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
            <div className="w-12 text-[8px] text-right truncate transition-colors" 
              style={{ color: isHovered ? getPointColor(item, i) : colors.text }}>
              {item.label}
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-5 rounded transition-all duration-200 flex items-center justify-center"
                style={{ 
                  width: `${width}%`, 
                  minWidth: "24px", 
                  backgroundColor: getPointColor(item, i),
                  opacity: isHovered ? 1 : 0.8,
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
function ProgressChart({ data, config, colors, compact, getPointColor }: BaseProps) {
  const maxValue = config.maxValue || 100;
  return (
    <div className="w-full space-y-2">
      {data.map((item, i) => {
        const pct = Math.min((item.value / maxValue) * 100, 100);
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px]" style={{ color: colors.text }}>{item.label}</span>
              <span className="text-[9px] font-semibold" style={{ color: getPointColor(item, i) }}>
                {formatChartValue(item.value, config)}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.text}10` }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: getPointColor(item, i) }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ GAUGE CHART ============
function GaugeChart({ data, config, colors, compact }: BaseProps) {
  const item = data[0];
  if (!item) return null;
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
            fill="none" stroke={`${colors.text}12`} strokeWidth={sw} strokeLinecap="round" />
          <path d={`M ${sw / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - sw / 2} ${size / 2}`} 
            fill="none" stroke={gaugeColor} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - (circ * angle) / 180} />
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
function RadarChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor }: BaseProps) {
  const size = compact ? 90 : 110;
  const center = size / 2;
  const maxR = (size / 2) - 16;
  const maxValue = config.maxValue || Math.max(...data.map(d => d.value));
  const step = (2 * Math.PI) / data.length;
  const accentColor = getPointColor(data[0]!, 0);

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
    <div className="flex justify-center">
      <svg width={size} height={size}>
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
        <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")} fill={`${accentColor}20`} stroke={accentColor} strokeWidth="1.5" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hoveredIndex === i ? 4 : 3} fill={colors.bg} stroke={accentColor} strokeWidth="1.5" 
            className="cursor-pointer transition-all duration-150" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} />
        ))}
        {points.map((p, i) => (
          <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" 
            className="text-[8px] transition-colors" 
            fill={hoveredIndex === i ? accentColor : colors.muted}>
            {p.data.label}
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
