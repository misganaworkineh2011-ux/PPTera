"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { type ChartData, type ChartDataPoint, type ChartConfig, getChartColor, formatChartValue, COLOR_SCHEMES } from "~/lib/charts/types";
import { type Theme } from "~/lib/themes";

interface InteractiveChartProps {
  chart: ChartData;
  theme?: Theme;
  compact?: boolean;
  interactive?: boolean;
  className?: string;
  onDataPointClick?: (point: ChartDataPoint, index: number) => void;
}

export default function InteractiveChart({
  chart,
  theme,
  compact = false,
  interactive = true,
  className = "",
  onDataPointClick,
}: InteractiveChartProps) {
  const { type, data, config, title, subtitle } = chart;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(1); // Start at 1 to avoid re-animation
  const hasAnimated = useRef(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    
    checkDarkMode();
    
    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    return () => observer.disconnect();
  }, []);

  // Animation on mount - only animate once
  useEffect(() => {
    if (hasAnimated.current) return;
    
    if (config.showAnimation !== false) {
      setAnimationProgress(0);
      const timer = setTimeout(() => {
        setAnimationProgress(1);
        hasAnimated.current = true;
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setAnimationProgress(1);
      hasAnimated.current = true;
    }
  }, []); // Empty dependency array - only run once on mount

  // Get theme-aware colors with dark mode support
  const colors = useMemo(() => {
    const accentColor = theme?.colors.accent || "#06b6d4";
    // Use light colors for dark mode when no theme is provided
    const textColor = theme?.colors.text || (isDarkMode ? "#ffffff" : "#1e293b");
    const mutedColor = theme?.colors.textMuted || (isDarkMode ? "#a3a3a3" : "#64748b");
    const bgColor = theme?.colors.background || (isDarkMode ? "#171717" : "#ffffff");
    const surfaceColor = theme?.colors.surface || (isDarkMode ? "#262626" : "#f8fafc");
    
    return { accentColor, textColor, mutedColor, bgColor, surfaceColor };
  }, [theme, isDarkMode]);

  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    return config.maxValue || Math.max(...data.map(d => d.value), 1);
  }, [data, config.maxValue]);

  // Get color for data point
  const getPointColor = (point: ChartDataPoint, index: number): string => {
    if (point.color) return point.color;
    if (config.customColors?.[index]) return config.customColors[index]!;
    const scheme = config.colorScheme || "default";
    if (scheme === "theme") return colors.accentColor;
    return getChartColor(index, scheme as keyof typeof COLOR_SCHEMES);
  };

  const handlePointClick = (point: ChartDataPoint, index: number) => {
    if (interactive && onDataPointClick) {
      onDataPointClick(point, index);
    }
  };

  // Render chart based on type
  const renderChart = () => {
    switch (type) {
      case "bar":
      case "horizontal-bar":
      case "stacked-bar":
      case "waterfall":
      case "histogram":
        return <BarChart data={data} config={config} colors={colors} maxValue={maxValue} compact={compact} 
          hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} getPointColor={getPointColor}
          animationProgress={animationProgress} horizontal={type === "horizontal-bar"} onPointClick={handlePointClick} />;
      
      case "line":
      case "area":
      case "scatter":
        return <LineAreaChart data={data} config={config} colors={colors} maxValue={maxValue} compact={compact}
          hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} getPointColor={getPointColor}
          animationProgress={animationProgress} showArea={type === "area"} onPointClick={handlePointClick} />;
      
      case "pie":
      case "donut":
        return <PieDonutChart data={data} config={config} colors={colors} compact={compact}
          hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} getPointColor={getPointColor}
          animationProgress={animationProgress} isDonut={type === "donut"} onPointClick={handlePointClick} />;
      
      case "comparison":
        return <ComparisonChart data={data} config={config} colors={colors} maxValue={maxValue} compact={compact}
          hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} getPointColor={getPointColor}
          animationProgress={animationProgress} onPointClick={handlePointClick} />;
      
      case "kpi":
        return <KPIChart data={data} config={config} colors={colors} compact={compact} animationProgress={animationProgress} />;
      
      case "funnel":
        return <FunnelChart data={data} config={config} colors={colors} compact={compact}
          hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} getPointColor={getPointColor}
          animationProgress={animationProgress} onPointClick={handlePointClick} />;
      
      case "progress":
        return <ProgressChart data={data} config={config} colors={colors} compact={compact}
          getPointColor={getPointColor} animationProgress={animationProgress} />;
      
      case "gauge":
        return <GaugeChart data={data} config={config} colors={colors} compact={compact}
          animationProgress={animationProgress} />;
      
      case "radar":
        return <RadarChart data={data} config={config} colors={colors} compact={compact}
          hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} getPointColor={getPointColor}
          animationProgress={animationProgress} />;
      
      case "table":
        return <TableChart data={data} config={config} colors={colors} compact={compact} />;
      
      default:
        return <BarChart data={data} config={config} colors={colors} maxValue={maxValue} compact={compact}
          hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} getPointColor={getPointColor}
          animationProgress={animationProgress} horizontal={false} onPointClick={handlePointClick} />;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className={`${compact ? "mb-2" : "mb-4"}`}>
          {title && (
            <h3 className={`font-semibold ${compact ? "text-sm" : "text-base"}`} style={{ color: colors.textColor }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`${compact ? "text-xs" : "text-sm"} mt-0.5`} style={{ color: colors.mutedColor }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {renderChart()}
    </div>
  );
}


// ============ BAR CHART ============
interface BarChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  maxValue: number;
  compact: boolean;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  getPointColor: (point: ChartDataPoint, index: number) => string;
  animationProgress: number;
  horizontal: boolean;
  onPointClick: (point: ChartDataPoint, index: number) => void;
}

function BarChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor, animationProgress, horizontal, onPointClick }: BarChartProps) {
  if (horizontal) {
    return (
      <div className={`w-full ${compact ? "space-y-1.5" : "space-y-2"}`}>
        {data.map((item, i) => {
          const width = maxValue > 0 ? (item.value / maxValue) * 100 * animationProgress : 0;
          const isHovered = hoveredIndex === i;
          return (
            <div 
              key={i} 
              className="flex items-center gap-2 cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onPointClick(item, i)}
            >
              <div 
                className={`min-w-[60px] ${compact ? "text-[10px]" : "text-xs"} text-right truncate transition-colors`}
                style={{ color: isHovered ? getPointColor(item, i) : colors.textColor }}
              >
                {item.label}
              </div>
              <div className={`flex-1 ${compact ? "h-5" : "h-6"} bg-black/5 dark:bg-white/10 rounded overflow-hidden relative`}>
                <div 
                  className="h-full rounded transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ 
                    width: `${width}%`,
                    backgroundColor: getPointColor(item, i),
                    transform: isHovered ? "scaleY(1.05)" : "scaleY(1)",
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
              {config.showValues && (
                <div 
                  className={`min-w-[45px] ${compact ? "text-[10px]" : "text-xs"} font-semibold transition-all`}
                  style={{ 
                    color: isHovered ? getPointColor(item, i) : colors.textColor,
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {formatChartValue(item.value, config)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bar chart - constrained sizing for slides
  const barWidth = Math.min(40, Math.max(16, 200 / data.length));
  const chartHeight = compact ? 100 : 140;

  return (
    <div className="w-full">
      <div className="flex items-end justify-center gap-2" style={{ height: chartHeight }}>
        {data.map((item, i) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 * animationProgress : 0;
          const isHovered = hoveredIndex === i;
          return (
            <div 
              key={i}
              className="flex flex-col items-center cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onPointClick(item, i)}
            >
              <div 
                className={`${compact ? "text-[10px]" : "text-xs"} font-semibold mb-1 transition-all`}
                style={{ 
                  color: isHovered ? getPointColor(item, i) : colors.mutedColor,
                  opacity: config.showValues ? 1 : 0,
                }}
              >
                {formatChartValue(item.value, config)}
              </div>
              <div 
                className="rounded-t-lg transition-all duration-700 ease-out relative overflow-hidden"
                style={{ 
                  width: barWidth,
                  height: `${height}%`,
                  backgroundColor: getPointColor(item, i),
                  transform: isHovered ? "scaleX(1.1)" : "scaleX(1)",
                  boxShadow: isHovered ? `0 4px 20px ${getPointColor(item, i)}40` : "none",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </div>
          );
        })}
      </div>
      {config.showLabels !== false && (
        <div className="flex justify-center gap-2 mt-3">
          {data.map((item, i) => (
            <div 
              key={i}
              className={`${compact ? "text-[10px]" : "text-xs"} text-center truncate transition-colors`}
              style={{ 
                width: barWidth,
                color: hoveredIndex === i ? getPointColor(item, i) : colors.mutedColor,
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ LINE/AREA CHART ============
interface LineAreaChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  maxValue: number;
  compact: boolean;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  getPointColor: (point: ChartDataPoint, index: number) => string;
  animationProgress: number;
  showArea: boolean;
  onPointClick: (point: ChartDataPoint, index: number) => void;
}

function LineAreaChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor, animationProgress, showArea, onPointClick }: LineAreaChartProps) {
  // Constrained viewBox for slide-friendly sizing
  const width = 400;
  const height = compact ? 100 : 120;
  const padding = { top: 10, right: 10, bottom: 25, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: padding.top + chartHeight - (d.value / maxValue) * chartHeight * animationProgress,
    data: d,
    index: i,
  }));

  const lineColor = getPointColor(data[0]!, 0);
  
  // Create smooth path
  const createPath = (pts: typeof points) => {
    if (pts.length < 2) return "";
    
    if (config.lineSmooth) {
      // Bezier curve for smooth lines
      let path = `M ${pts[0]!.x} ${pts[0]!.y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]!;
        const curr = pts[i]!;
        const cpx = (prev.x + curr.x) / 2;
        path += ` Q ${prev.x + (curr.x - prev.x) * 0.5} ${prev.y}, ${cpx} ${(prev.y + curr.y) / 2}`;
        if (i === pts.length - 1) {
          path += ` T ${curr.x} ${curr.y}`;
        }
      }
      return path;
    }
    
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  };

  const linePath = createPath(points);
  const areaPath = linePath + ` L ${points[points.length - 1]?.x} ${padding.top + chartHeight} L ${points[0]?.x} ${padding.top + chartHeight} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxHeight: compact ? "100px" : "130px" }} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {config.showGrid && (
          <g opacity="0.1">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={padding.top + chartHeight * ratio}
                x2={padding.left + chartWidth}
                y2={padding.top + chartHeight * ratio}
                stroke={colors.textColor}
                strokeDasharray="2,2"
              />
            ))}
          </g>
        )}

        {/* Gradient definition for area */}
        <defs>
          <linearGradient id={`areaGradient-${lineColor.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {showArea && (
          <path
            d={areaPath}
            fill={`url(#areaGradient-${lineColor.replace("#", "")})`}
            className="transition-all duration-700"
          />
        )}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-700"
          style={{
            filter: `drop-shadow(0 2px 4px ${lineColor}40)`,
          }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 6 : 4}
              fill={colors.bgColor}
              stroke={lineColor}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onPointClick(p.data, i)}
              style={{
                filter: hoveredIndex === i ? `drop-shadow(0 2px 8px ${lineColor}60)` : "none",
              }}
            />
            {/* Tooltip on hover */}
            {hoveredIndex === i && (
              <g>
                <rect
                  x={p.x - 25}
                  y={p.y - 28}
                  width="50"
                  height="20"
                  rx="4"
                  fill={colors.textColor}
                  opacity="0.9"
                />
                <text
                  x={p.x}
                  y={p.y - 14}
                  textAnchor="middle"
                  fill={colors.bgColor}
                  fontSize="8"
                  fontWeight="600"
                >
                  {formatChartValue(p.data.value, config)}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>

      {/* Labels */}
      {config.showLabels !== false && (
        <div className="flex justify-between px-2 mt-1">
          {data.map((item, i) => (
            <span
              key={i}
              className={`${compact ? "text-[9px]" : "text-[10px]"} truncate transition-colors`}
              style={{ color: hoveredIndex === i ? lineColor : colors.mutedColor }}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


// ============ PIE/DONUT CHART ============
interface PieDonutChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  compact: boolean;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  getPointColor: (point: ChartDataPoint, index: number) => string;
  animationProgress: number;
  isDonut: boolean;
  onPointClick: (point: ChartDataPoint, index: number) => void;
}

function PieDonutChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, animationProgress, isDonut, onPointClick }: PieDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = compact ? 100 : 140;
  const center = size / 2;
  const outerRadius = (size / 2) - 8;
  const innerRadius = isDonut ? outerRadius * (config.donutHole || 0.6) : 0;

  // Calculate segments
  let currentAngle = -90; // Start from top
  const segments = data.map((d, i) => {
    const percentage = total > 0 ? (d.value / total) : 0;
    const angle = percentage * 360 * animationProgress;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;
    
    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);
    
    const x1Inner = center + innerRadius * Math.cos(startRad);
    const y1Inner = center + innerRadius * Math.sin(startRad);
    const x2Inner = center + innerRadius * Math.cos(endRad);
    const y2Inner = center + innerRadius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const path = innerRadius > 0
      ? `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner} Z`
      : `M ${center} ${center} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    // Label position
    const midAngle = startAngle + angle / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelRadius = (outerRadius + innerRadius) / 2;
    const labelX = center + labelRadius * Math.cos(midRad);
    const labelY = center + labelRadius * Math.sin(midRad);
    
    return { path, percentage, labelX, labelY, data: d, index: i };
  });

  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-0">
          {segments.map((seg, i) => (
            <path
              key={i}
              d={seg.path}
              fill={getPointColor(seg.data, i)}
              className="cursor-pointer transition-all duration-300"
              style={{
                transform: hoveredIndex === i ? `scale(1.05)` : "scale(1)",
                transformOrigin: `${center}px ${center}px`,
                filter: hoveredIndex === i ? `drop-shadow(0 4px 12px ${getPointColor(seg.data, i)}50)` : "none",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onPointClick(seg.data, i)}
            />
          ))}
        </svg>
        
        {/* Center text for donut */}
        {isDonut && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ color: colors.textColor }}
          >
            {hoveredIndex !== null ? (
              <>
                <span className={`${compact ? "text-lg" : "text-2xl"} font-bold`}>
                  {(segments[hoveredIndex]?.percentage ?? 0 * 100).toFixed(1)}%
                </span>
                <span className={`${compact ? "text-[10px]" : "text-xs"} opacity-70`}>
                  {data[hoveredIndex]?.label}
                </span>
              </>
            ) : (
              <>
                <span className={`${compact ? "text-lg" : "text-2xl"} font-bold`}>
                  {total.toLocaleString()}
                </span>
                <span className={`${compact ? "text-[10px]" : "text-xs"} opacity-70`}>Total</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {config.showLegend && (
        <div className={`${compact ? "space-y-1.5" : "space-y-2"}`}>
          {data.map((item, i) => (
            <div 
              key={i}
              className="flex items-center gap-2 cursor-pointer transition-opacity"
              style={{ opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1 }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onPointClick(item, i)}
            >
              <div 
                className={`${compact ? "w-2.5 h-2.5" : "w-3 h-3"} rounded-sm`}
                style={{ backgroundColor: getPointColor(item, i) }}
              />
              <span className={`${compact ? "text-xs" : "text-sm"}`} style={{ color: colors.textColor }}>
                {item.label}
              </span>
              {config.showValues && (
                <span className={`${compact ? "text-xs" : "text-sm"} font-semibold ml-1`} style={{ color: colors.mutedColor }}>
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ COMPARISON CHART ============
interface ComparisonChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  maxValue: number;
  compact: boolean;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  getPointColor: (point: ChartDataPoint, index: number) => string;
  animationProgress: number;
  onPointClick: (point: ChartDataPoint, index: number) => void;
}

function ComparisonChart({ data, config, colors, maxValue, compact, hoveredIndex, setHoveredIndex, getPointColor, animationProgress, onPointClick }: ComparisonChartProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {data.map((item, i) => {
        const isHovered = hoveredIndex === i;
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        
        return (
          <div
            key={i}
            className={`${compact ? "p-2 min-w-[70px]" : "p-3 min-w-[90px]"} text-center rounded-lg border transition-all duration-300 cursor-pointer`}
            style={{
              borderColor: isHovered ? getPointColor(item, i) : `${colors.textColor}15`,
              backgroundColor: isHovered ? `${getPointColor(item, i)}10` : `${colors.textColor}05`,
              transform: isHovered ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
              boxShadow: isHovered ? `0 4px 12px ${getPointColor(item, i)}25` : "none",
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onPointClick(item, i)}
          >
            <div
              className={`${compact ? "text-lg" : "text-xl"} font-bold mb-0.5 transition-transform`}
              style={{ 
                color: getPointColor(item, i),
                transform: `scale(${animationProgress})`,
              }}
            >
              {formatChartValue(item.value * animationProgress, config)}
            </div>
            <div className={`${compact ? "text-[9px]" : "text-[10px]"} font-medium mb-1.5`} style={{ color: colors.mutedColor }}>
              {item.label}
            </div>
            {/* Mini progress bar */}
            <div className="h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${percentage * animationProgress}%`,
                  backgroundColor: getPointColor(item, i),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ KPI CHART ============
interface KPIChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  compact: boolean;
  animationProgress: number;
}

function KPIChart({ data, config, colors, compact, animationProgress }: KPIChartProps) {
  const item = data[0];
  if (!item) return null;

  const trendColor = config.trend === "up" ? "#10b981" : config.trend === "down" ? "#ef4444" : colors.mutedColor;
  const trendIcon = config.trend === "up" ? "↑" : config.trend === "down" ? "↓" : "→";

  return (
    <div className={`${compact ? "p-3" : "p-4"} rounded-xl border text-center`} style={{ borderColor: `${colors.textColor}10`, backgroundColor: `${colors.textColor}03` }}>
      <div className={`${compact ? "text-[10px]" : "text-xs"} font-medium mb-1`} style={{ color: colors.mutedColor }}>
        {item.label}
      </div>
      <div
        className={`${compact ? "text-2xl" : "text-3xl"} font-bold mb-1 transition-transform`}
        style={{ 
          color: colors.accentColor,
          transform: `scale(${animationProgress})`,
        }}
      >
        {formatChartValue(item.value * animationProgress, config)}
      </div>
      {config.trend && config.trendValue !== undefined && (
        <div className="flex items-center justify-center gap-1" style={{ color: trendColor }}>
          <span className={`${compact ? "text-xs" : "text-sm"} font-bold`}>{trendIcon}</span>
          <span className={`${compact ? "text-[10px]" : "text-xs"} font-semibold`}>
            {config.trendValue}%
          </span>
          <span className={`${compact ? "text-[9px]" : "text-[10px]"}`} style={{ color: colors.mutedColor }}>
            vs last period
          </span>
        </div>
      )}
      {config.target && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] mb-1" style={{ color: colors.mutedColor }}>
            <span>Progress</span>
            <span>{Math.round((item.value / config.target) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min((item.value / config.target) * 100, 100) * animationProgress}%`,
                backgroundColor: colors.accentColor,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}


// ============ FUNNEL CHART ============
interface FunnelChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  compact: boolean;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  getPointColor: (point: ChartDataPoint, index: number) => string;
  animationProgress: number;
  onPointClick: (point: ChartDataPoint, index: number) => void;
}

function FunnelChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, animationProgress, onPointClick }: FunnelChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={`w-full ${compact ? "space-y-1" : "space-y-1.5"}`}>
      {data.map((item, i) => {
        const width = maxValue > 0 ? (item.value / maxValue) * 100 * animationProgress : 0;
        const isHovered = hoveredIndex === i;
        const conversionRate = i > 0 && data[i - 1] ? ((item.value / data[i - 1]!.value) * 100).toFixed(1) : null;

        return (
          <div
            key={i}
            className="flex items-center gap-2 cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onPointClick(item, i)}
          >
            <div 
              className={`${compact ? "w-16 text-[10px]" : "w-20 text-xs"} text-right truncate transition-colors`}
              style={{ color: isHovered ? getPointColor(item, i) : colors.textColor }}
            >
              {item.label}
            </div>
            <div className="flex-1 flex justify-center">
              <div
                className={`${compact ? "h-6" : "h-7"} rounded transition-all duration-500 relative overflow-hidden`}
                style={{
                  width: `${width}%`,
                  minWidth: "30px",
                  backgroundColor: getPointColor(item, i),
                  transform: isHovered ? "scaleY(1.1)" : "scaleY(1)",
                  boxShadow: isHovered ? `0 4px 16px ${getPointColor(item, i)}40` : "none",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                {config.showValues && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${compact ? "text-[9px]" : "text-[10px]"} font-bold text-white drop-shadow`}>
                      {formatChartValue(item.value, config)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {conversionRate && (
              <div 
                className={`${compact ? "w-10 text-[9px]" : "w-12 text-[10px]"} text-left`}
                style={{ color: colors.mutedColor }}
              >
                {conversionRate}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============ PROGRESS CHART ============
interface ProgressChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  compact: boolean;
  getPointColor: (point: ChartDataPoint, index: number) => string;
  animationProgress: number;
}

function ProgressChart({ data, config, colors, compact, getPointColor, animationProgress }: ProgressChartProps) {
  const maxValue = config.maxValue || 100;

  return (
    <div className={`w-full ${compact ? "space-y-2" : "space-y-2.5"}`}>
      {data.map((item, i) => {
        const percentage = Math.min((item.value / maxValue) * 100, 100) * animationProgress;
        
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className={`${compact ? "text-[10px]" : "text-xs"} font-medium`} style={{ color: colors.textColor }}>
                {item.label}
              </span>
              <span className={`${compact ? "text-[10px]" : "text-xs"} font-bold`} style={{ color: getPointColor(item, i) }}>
                {formatChartValue(item.value, config)}
              </span>
            </div>
            <div className={`${compact ? "h-1.5" : "h-2"} bg-black/5 dark:bg-white/10 rounded-full overflow-hidden`}>
              <div
                className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: getPointColor(item, i),
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ GAUGE CHART ============
interface GaugeChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  compact: boolean;
  animationProgress: number;
}

function GaugeChart({ data, config, colors, compact, animationProgress }: GaugeChartProps) {
  const item = data[0];
  if (!item) return null;

  const maxValue = config.maxValue || 100;
  const percentage = Math.min((item.value / maxValue) * 100, 100);
  const angle = (percentage / 100) * 180 * animationProgress;
  
  const size = compact ? 120 : 160;
  const strokeWidth = compact ? 10 : 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;

  // Determine color based on value
  const getGaugeColor = () => {
    if (percentage < 33) return "#ef4444";
    if (percentage < 66) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} className="overflow-visible">
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={`${colors.textColor}10`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={getGaugeColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * angle) / 180}
            className="transition-all duration-1000"
            style={{
              filter: `drop-shadow(0 2px 8px ${getGaugeColor()}40)`,
            }}
          />
          {/* Needle */}
          <g transform={`rotate(${angle - 90}, ${size / 2}, ${size / 2})`}>
            <line
              x1={size / 2}
              y1={size / 2}
              x2={size / 2}
              y2={strokeWidth + 10}
              stroke={colors.textColor}
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <circle cx={size / 2} cy={size / 2} r="6" fill={colors.textColor} />
          </g>
        </svg>
        
        {/* Center value */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{ bottom: 0 }}
        >
          <div className={`${compact ? "text-2xl" : "text-3xl"} font-bold`} style={{ color: colors.textColor }}>
            {formatChartValue(item.value * animationProgress, config)}
          </div>
          <div className={`${compact ? "text-[10px]" : "text-xs"}`} style={{ color: colors.mutedColor }}>
            {item.label}
          </div>
        </div>
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between w-full px-2 mt-1">
        <span className={`${compact ? "text-[10px]" : "text-xs"}`} style={{ color: colors.mutedColor }}>
          {config.minValue || 0}
        </span>
        <span className={`${compact ? "text-[10px]" : "text-xs"}`} style={{ color: colors.mutedColor }}>
          {maxValue}
        </span>
      </div>
    </div>
  );
}

// ============ RADAR CHART ============
interface RadarChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  compact: boolean;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  getPointColor: (point: ChartDataPoint, index: number) => string;
  animationProgress: number;
}

function RadarChart({ data, config, colors, compact, hoveredIndex, setHoveredIndex, getPointColor, animationProgress }: RadarChartProps) {
  const size = compact ? 140 : 180;
  const center = size / 2;
  const maxRadius = (size / 2) - 25;
  const maxValue = config.maxValue || Math.max(...data.map(d => d.value));
  const levels = 5;

  // Calculate points
  const angleStep = (2 * Math.PI) / data.length;
  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const radius = (d.value / maxValue) * maxRadius * animationProgress;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (maxRadius + 15) * Math.cos(angle),
      labelY: center + (maxRadius + 15) * Math.sin(angle),
      data: d,
      index: i,
    };
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(" ");
  const accentColor = getPointColor(data[0]!, 0);

  return (
    <div className="flex justify-center">
      <svg width={size} height={size}>
        {/* Grid levels */}
        {Array.from({ length: levels }).map((_, level) => {
          const levelRadius = ((level + 1) / levels) * maxRadius;
          const levelPoints = data.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={levelPoints}
              fill="none"
              stroke={colors.textColor}
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis lines */}
        {data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + maxRadius * Math.cos(angle)}
              y2={center + maxRadius * Math.sin(angle)}
              stroke={colors.textColor}
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill={`${accentColor}30`}
          stroke={accentColor}
          strokeWidth="2"
          className="transition-all duration-700"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredIndex === i ? 6 : 4}
            fill={colors.bgColor}
            stroke={accentColor}
            strokeWidth="2"
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`${compact ? "text-[9px]" : "text-[11px]"} transition-colors`}
            fill={hoveredIndex === i ? accentColor : colors.mutedColor}
          >
            {p.data.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ============ TABLE CHART ============
interface TableChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  colors: { accentColor: string; textColor: string; mutedColor: string; bgColor: string; surfaceColor: string };
  compact: boolean;
}

function TableChart({ data, config, colors, compact }: TableChartProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ borderBottom: `2px solid ${colors.accentColor}` }}>
            <th 
              className={`${compact ? "p-2 text-xs" : "p-3 text-sm"} text-left font-semibold`}
              style={{ color: colors.textColor }}
            >
              Item
            </th>
            <th 
              className={`${compact ? "p-2 text-xs" : "p-3 text-sm"} text-right font-semibold`}
              style={{ color: colors.textColor }}
            >
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr 
              key={i}
              className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderBottom: `1px solid ${colors.textColor}10` }}
            >
              <td 
                className={`${compact ? "p-2 text-xs" : "p-3 text-sm"}`}
                style={{ color: colors.textColor }}
              >
                <div className="flex items-center gap-2">
                  {item.color && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  )}
                  {item.label}
                </div>
              </td>
              <td 
                className={`${compact ? "p-2 text-xs" : "p-3 text-sm"} text-right font-semibold`}
                style={{ color: item.color || colors.accentColor }}
              >
                {formatChartValue(item.value, config)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
