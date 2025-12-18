"use client";

import type { ChartData, ChartDataPoint } from "~/lib/presentation/types";
import { type Theme } from "~/lib/themes";

interface ChartRendererProps {
  chart: ChartData;
  theme: Theme;
  compact?: boolean;
}

/**
 * Renders CSS-based charts for presentations
 */
export default function ChartRenderer({ chart, theme, compact = false }: ChartRendererProps) {
  const { type, data, config, title } = chart;
  const maxValue = config.maxValue || Math.max(...data.map(d => d.value));

  // Get theme-aware colors
  const accentColor = theme.colors.accent;
  const textColor = theme.colors.text;
  const bgColor = theme.colors.background;

  // Render based on chart type
  switch (type) {
    case "bar":
    case "histogram":
      return <BarChart data={data} maxValue={maxValue} config={config} accentColor={accentColor} textColor={textColor} compact={compact} />;
    
    case "pie":
      return <PieChart data={data} config={config} textColor={textColor} compact={compact} />;
    
    case "line":
    case "area":
      return <LineChart data={data} maxValue={maxValue} config={config} accentColor={accentColor} textColor={textColor} compact={compact} />;
    
    case "comparison":
      return <ComparisonChart data={data} config={config} accentColor={accentColor} textColor={textColor} compact={compact} />;
    
    case "table":
      return <TableChart data={data} config={config} accentColor={accentColor} textColor={textColor} bgColor={bgColor} compact={compact} />;
    
    case "stacked":
    case "waterfall":
      return <StackedBarChart data={data} maxValue={maxValue} config={config} accentColor={accentColor} textColor={textColor} compact={compact} />;
    
    default:
      return <BarChart data={data} maxValue={maxValue} config={config} accentColor={accentColor} textColor={textColor} compact={compact} />;
  }
}

// Bar Chart Component
function BarChart({ 
  data, 
  maxValue, 
  config, 
  accentColor, 
  textColor,
  compact 
}: { 
  data: ChartDataPoint[]; 
  maxValue: number; 
  config: ChartData["config"]; 
  accentColor: string; 
  textColor: string;
  compact: boolean;
}) {
  return (
    <div className={`w-full ${compact ? "space-y-2" : "space-y-3"}`}>
      {data.map((item, i) => {
        const width = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <div 
              className={`min-w-[80px] ${compact ? "text-xs" : "text-sm"} text-right truncate`}
              style={{ color: textColor }}
            >
              {item.label}
            </div>
            <div className="flex-1 h-6 bg-white/10 rounded overflow-hidden">
              <div 
                className="h-full rounded transition-all duration-500 ease-out"
                style={{ 
                  width: `${width}%`,
                  backgroundColor: item.color || accentColor,
                }}
              />
            </div>
            {config.showValues && (
              <div 
                className={`min-w-[50px] ${compact ? "text-xs" : "text-sm"} font-semibold`}
                style={{ color: textColor }}
              >
                {item.value.toLocaleString()}{config.unit || ""}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Pie Chart Component
function PieChart({ 
  data, 
  config, 
  textColor,
  compact 
}: { 
  data: ChartDataPoint[]; 
  config: ChartData["config"]; 
  textColor: string;
  compact: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  // Build conic gradient segments
  const segments = data.map((d) => {
    const startAngle = currentAngle;
    const percentage = total > 0 ? (d.value / total) * 100 : 0;
    currentAngle += percentage;
    return `${d.color} ${startAngle}% ${currentAngle}%`;
  });

  const gradient = `conic-gradient(${segments.join(", ")})`;

  return (
    <div className="flex items-center justify-center gap-8">
      <div 
        className={`${compact ? "w-32 h-32" : "w-48 h-48"} rounded-full shadow-lg`}
        style={{ background: gradient }}
      />
      {config.showLegend && (
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span 
                className={`${compact ? "text-xs" : "text-sm"}`}
                style={{ color: textColor }}
              >
                {item.label}
              </span>
              {config.showValues && (
                <span 
                  className={`${compact ? "text-xs" : "text-sm"} font-semibold ml-2`}
                  style={{ color: textColor }}
                >
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

// Line Chart Component
function LineChart({ 
  data, 
  maxValue, 
  config, 
  accentColor, 
  textColor,
  compact 
}: { 
  data: ChartDataPoint[]; 
  maxValue: number; 
  config: ChartData["config"]; 
  accentColor: string; 
  textColor: string;
  compact: boolean;
}) {
  const width = 100;
  const height = compact ? 100 : 150;
  const padding = 10;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1 || 1)) * chartWidth,
    y: padding + chartHeight - (d.value / (maxValue || 1)) * chartHeight,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x={padding} y={padding} width={chartWidth} height={chartHeight} fill="url(#grid)" />
        
        {/* Line */}
        <path 
          d={pathD} 
          fill="none" 
          stroke={accentColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Points */}
        {points.map((p, i) => (
          <circle 
            key={i} 
            cx={p.x} 
            cy={p.y} 
            r="3" 
            fill={accentColor}
          />
        ))}
      </svg>
      
      {/* Labels */}
      {config.showLabels && (
        <div className="flex justify-between mt-2">
          {data.map((d, i) => (
            <span 
              key={i} 
              className={`${compact ? "text-[10px]" : "text-xs"} truncate`}
              style={{ color: textColor, opacity: 0.8 }}
            >
              {d.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Comparison Chart Component
function ComparisonChart({ 
  data, 
  config, 
  accentColor, 
  textColor,
  compact 
}: { 
  data: ChartDataPoint[]; 
  config: ChartData["config"]; 
  accentColor: string; 
  textColor: string;
  compact: boolean;
}) {
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {data.map((item, i) => (
        <div 
          key={i}
          className={`${compact ? "p-3 min-w-[100px]" : "p-4 min-w-[140px]"} text-center rounded-lg border border-white/10 bg-white/5`}
        >
          <div 
            className={`${compact ? "text-2xl" : "text-3xl"} font-bold mb-1`}
            style={{ color: item.color || accentColor }}
          >
            {item.value.toLocaleString()}{config.unit || ""}
          </div>
          <div 
            className={`${compact ? "text-xs" : "text-sm"}`}
            style={{ color: textColor, opacity: 0.8 }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// Table Chart Component
function TableChart({ 
  data, 
  config, 
  accentColor, 
  textColor,
  bgColor,
  compact 
}: { 
  data: ChartDataPoint[]; 
  config: ChartData["config"]; 
  accentColor: string; 
  textColor: string;
  bgColor: string;
  compact: boolean;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2" style={{ borderColor: accentColor }}>
            <th 
              className={`${compact ? "p-2 text-xs" : "p-3 text-sm"} text-left font-semibold`}
              style={{ color: textColor }}
            >
              Item
            </th>
            <th 
              className={`${compact ? "p-2 text-xs" : "p-3 text-sm"} text-right font-semibold`}
              style={{ color: textColor }}
            >
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr 
              key={i} 
              className="border-b border-white/10 hover:bg-white/5 transition-colors"
            >
              <td 
                className={`${compact ? "p-2 text-xs" : "p-3 text-sm"}`}
                style={{ color: textColor }}
              >
                {item.label}
              </td>
              <td 
                className={`${compact ? "p-2 text-xs" : "p-3 text-sm"} text-right font-semibold`}
                style={{ color: item.color || accentColor }}
              >
                {item.value.toLocaleString()}{config.unit || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Stacked Bar Chart Component
function StackedBarChart({ 
  data, 
  maxValue, 
  config, 
  accentColor, 
  textColor,
  compact 
}: { 
  data: ChartDataPoint[]; 
  maxValue: number; 
  config: ChartData["config"]; 
  accentColor: string; 
  textColor: string;
  compact: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  return (
    <div className="w-full">
      {/* Stacked bar */}
      <div className={`${compact ? "h-8" : "h-10"} rounded overflow-hidden flex`}>
        {data.map((item, i) => {
          const width = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div 
              key={i}
              className="h-full transition-all duration-500 ease-out first:rounded-l last:rounded-r"
              style={{ 
                width: `${width}%`,
                backgroundColor: item.color || accentColor,
              }}
            />
          );
        })}
      </div>
      
      {/* Legend */}
      {config.showLegend && (
        <div className="flex flex-wrap gap-4 mt-3 justify-center">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span 
                className={`${compact ? "text-xs" : "text-sm"}`}
                style={{ color: textColor }}
              >
                {item.label}
              </span>
              {config.showValues && (
                <span 
                  className={`${compact ? "text-xs" : "text-sm"} font-semibold`}
                  style={{ color: textColor }}
                >
                  ({item.value.toLocaleString()}{config.unit || ""})
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

