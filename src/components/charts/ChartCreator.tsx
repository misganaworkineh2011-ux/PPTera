"use client";

import { useState } from "react";
import { BarChart3, PieChart, LineChart, TrendingUp, Target, Filter, Plus, Trash2, Palette, Eye, Save, Table, Activity, Gauge, BarChartHorizontal, CircleDot, ArrowDownWideNarrow } from "lucide-react";
import { type ChartData, type ChartDataPoint, type ChartType, type ChartConfig, CHART_TEMPLATES, COLOR_SCHEMES, getChartColor } from "~/lib/charts/types";
import InteractiveChart from "./InteractiveChart";
import { type Theme } from "~/lib/themes";

interface ChartCreatorProps {
  initialChart?: ChartData;
  onSave?: (chart: ChartData) => void;
  onCancel?: () => void;
  compact?: boolean;
  theme?: Theme;
}

const CHART_TYPES: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: "bar", label: "Bar", icon: <BarChart3 size={16} /> },
  { type: "horizontal-bar", label: "H-Bar", icon: <BarChartHorizontal size={16} /> },
  { type: "line", label: "Line", icon: <LineChart size={16} /> },
  { type: "area", label: "Area", icon: <Activity size={16} /> },
  { type: "pie", label: "Pie", icon: <PieChart size={16} /> },
  { type: "donut", label: "Donut", icon: <CircleDot size={16} /> },
  { type: "comparison", label: "Compare", icon: <ArrowDownWideNarrow size={16} /> },
  { type: "kpi", label: "KPI", icon: <Gauge size={16} /> },
  { type: "funnel", label: "Funnel", icon: <Filter size={16} /> },
  { type: "progress", label: "Progress", icon: <Target size={16} /> },
  { type: "gauge", label: "Gauge", icon: <Gauge size={16} /> },
  { type: "radar", label: "Radar", icon: <Target size={16} /> },
  { type: "table", label: "Table", icon: <Table size={16} /> },
];

export default function ChartCreator({ initialChart, onSave, onCancel, theme }: ChartCreatorProps) {
  const [tab, setTab] = useState<"type" | "data" | "style" | "preview">("type");
  const [chart, setChart] = useState<ChartData>(initialChart || {
    type: "bar",
    title: "",
    data: [{ label: "Item 1", value: 100 }, { label: "Item 2", value: 75 }, { label: "Item 3", value: 50 }],
    config: { showValues: true, showLabels: true, showLegend: true, showGrid: true, showAnimation: true, colorScheme: "default" },
  });

  const updateType = (type: ChartType) => setChart(prev => ({ ...prev, type }));
  const updateConfig = (updates: Partial<ChartConfig>) => setChart(prev => ({ ...prev, config: { ...prev.config, ...updates } }));
  const updatePoint = (i: number, updates: Partial<ChartDataPoint>) => setChart(prev => ({ ...prev, data: prev.data.map((d, idx) => idx === i ? { ...d, ...updates } : d) }));
  const addPoint = () => setChart(prev => ({ ...prev, data: [...prev.data, { label: `Item ${prev.data.length + 1}`, value: 50, color: getChartColor(prev.data.length, (prev.config.colorScheme as keyof typeof COLOR_SCHEMES) || "default") }] }));
  const removePoint = (i: number) => { if (chart.data.length > 1) setChart(prev => ({ ...prev, data: prev.data.filter((_, idx) => idx !== i) })); };
  const applyTemplate = (id: string) => { const t = CHART_TEMPLATES.find(x => x.id === id); if (t) setChart({ type: t.type, title: t.name, data: [...t.sampleData], config: { ...t.defaultConfig } }); };

  return (
    <div className="dark:bg-neutral-900 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">{initialChart ? "Edit Chart" : "Create Chart"}</h2>
        <div className="flex gap-2">
          {onCancel && <button onClick={onCancel} className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-white">Cancel</button>}
          <button onClick={() => onSave?.(chart)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06b6d4] text-white text-sm font-medium rounded-lg hover:bg-[#0891b2]">
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-neutral-800 rounded-lg mb-4">
        {[{ id: "type", label: "Type", icon: <BarChart3 size={14} /> }, { id: "data", label: "Data", icon: <Table size={14} /> }, { id: "style", label: "Style", icon: <Palette size={14} /> }, { id: "preview", label: "Preview", icon: <Eye size={14} /> }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${tab === t.id ? "bg-white dark:bg-neutral-700 text-[#06b6d4] shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-white"}`}>
            {t.icon}<span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[320px]">
        {tab === "type" && (
          <div className="space-y-4">
            {/* Templates */}
            <div>
              <h3 className="text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-2">Quick Templates</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {CHART_TEMPLATES.slice(0, 8).map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t.id)} className="p-2 text-left rounded-lg border border-slate-200 dark:border-neutral-700 hover:border-[#06b6d4] hover:bg-[#06b6d4]/5 transition-all">
                    <div className="text-[10px] font-medium text-slate-700 dark:text-neutral-300">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Chart Types */}
            <div>
              <h3 className="text-xs font-semibold text-slate-600 dark:text-neutral-400 mb-2">Chart Type</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                {CHART_TYPES.map(opt => (
                  <button key={opt.type} onClick={() => updateType(opt.type)} className={`p-2 text-center rounded-lg border transition-all ${chart.type === opt.type ? "border-[#06b6d4] bg-[#06b6d4]/10 ring-1 ring-[#06b6d4]/20" : "border-slate-200 dark:border-neutral-700 hover:border-[#06b6d4]/50"}`}>
                    <div className={`mb-1 ${chart.type === opt.type ? "text-[#06b6d4]" : "text-slate-400"}`}>{opt.icon}</div>
                    <div className="text-[10px] font-medium text-slate-600 dark:text-neutral-400">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "data" && (
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-1">Chart Title</label>
              <input type="text" value={chart.title || ""} onChange={(e) => setChart(prev => ({ ...prev, title: e.target.value }))} placeholder="Optional title..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#06b6d4]" />
            </div>
            {/* Data Points */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-neutral-400">Data Points</label>
                <button onClick={addPoint} className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded">
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                {chart.data.map((point, i) => (
                  <div key={i} className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-neutral-800/50 rounded-lg">
                    <input type="text" value={point.label} onChange={(e) => updatePoint(i, { label: e.target.value })} placeholder="Label"
                      className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#06b6d4]" />
                    <input type="number" value={point.value} onChange={(e) => updatePoint(i, { value: parseFloat(e.target.value) || 0 })} placeholder="Value"
                      className="w-20 px-2 py-1 text-xs rounded border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#06b6d4]" />
                    <input type="color" value={point.color || getChartColor(i)} onChange={(e) => updatePoint(i, { color: e.target.value })} className="w-6 h-6 rounded cursor-pointer border-0" />
                    <button onClick={() => removePoint(i)} disabled={chart.data.length <= 1} className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
            {/* KPI Options */}
            {chart.type === "kpi" && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-neutral-700">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Target</label>
                  <input type="number" value={chart.config.target || ""} onChange={(e) => updateConfig({ target: parseFloat(e.target.value) || undefined })} placeholder="100"
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Trend</label>
                  <select value={chart.config.trend || "neutral"} onChange={(e) => updateConfig({ trend: e.target.value as "up" | "down" | "neutral" })}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                    <option value="up">↑ Up</option><option value="down">↓ Down</option><option value="neutral">→ Neutral</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "style" && (
          <div className="space-y-4">
            {/* Color Scheme */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-2">Color Scheme</label>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.entries(COLOR_SCHEMES).map(([name, colors]) => (
                  <button key={name} onClick={() => updateConfig({ colorScheme: name as ChartConfig["colorScheme"] })}
                    className={`p-1.5 rounded-lg border transition-all ${chart.config.colorScheme === name ? "border-[#06b6d4] ring-1 ring-[#06b6d4]/20" : "border-slate-200 dark:border-neutral-700 hover:border-[#06b6d4]/50"}`}>
                    <div className="flex gap-0.5 mb-1">{colors.slice(0, 5).map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />)}</div>
                    <div className="text-[9px] font-medium text-slate-500 capitalize">{name}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Display Options */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-2">Display Options</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[{ key: "showValues", label: "Values" }, { key: "showLabels", label: "Labels" }, { key: "showLegend", label: "Legend" }, { key: "showGrid", label: "Grid" }, { key: "showAnimation", label: "Animate" }].map(opt => (
                  <label key={opt.key} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-neutral-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700">
                    <input type="checkbox" checked={chart.config[opt.key as keyof ChartConfig] as boolean || false} onChange={(e) => updateConfig({ [opt.key]: e.target.checked })}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#06b6d4] focus:ring-[#06b6d4]" />
                    <span className="text-xs text-slate-600 dark:text-neutral-400">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Value Formatting */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-neutral-400 mb-2">Formatting</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Prefix</label>
                  <input type="text" value={chart.config.prefix || ""} onChange={(e) => updateConfig({ prefix: e.target.value })} placeholder="$"
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Suffix</label>
                  <input type="text" value={chart.config.suffix || ""} onChange={(e) => updateConfig({ suffix: e.target.value })} placeholder="%"
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Unit</label>
                  <input type="text" value={chart.config.unit || ""} onChange={(e) => updateConfig({ unit: e.target.value })} placeholder="K"
                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div className="p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl border border-slate-200 dark:border-neutral-700">
            <InteractiveChart chart={chart} theme={theme} interactive={true} />
          </div>
        )}
      </div>
    </div>
  );
}
