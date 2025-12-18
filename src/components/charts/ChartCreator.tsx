"use client";

import { useState, useCallback } from "react";
import { 
  BarChart3, PieChart, LineChart, TrendingUp, Target, Filter, 
  Plus, Trash2, GripVertical, Palette, Settings2, Eye, Save,
  RotateCcw, Sparkles, Table, Activity, Gauge
} from "lucide-react";
import { 
  type ChartData, type ChartDataPoint, type ChartType, type ChartConfig,
  CHART_TEMPLATES, COLOR_SCHEMES, getChartColor 
} from "~/lib/charts/types";
import InteractiveChart from "./InteractiveChart";

interface ChartCreatorProps {
  initialChart?: ChartData;
  onSave?: (chart: ChartData) => void;
  onCancel?: () => void;
  compact?: boolean;
}

const CHART_TYPE_OPTIONS: { type: ChartType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "bar", label: "Bar Chart", icon: <BarChart3 size={18} />, description: "Compare values across categories" },
  { type: "horizontal-bar", label: "Horizontal Bar", icon: <BarChart3 size={18} className="rotate-90" />, description: "Horizontal comparison bars" },
  { type: "line", label: "Line Chart", icon: <LineChart size={18} />, description: "Show trends over time" },
  { type: "area", label: "Area Chart", icon: <Activity size={18} />, description: "Filled line chart for volume" },
  { type: "pie", label: "Pie Chart", icon: <PieChart size={18} />, description: "Show proportions of a whole" },
  { type: "donut", label: "Donut Chart", icon: <PieChart size={18} />, description: "Pie chart with center metric" },
  { type: "comparison", label: "Comparison", icon: <Target size={18} />, description: "Side-by-side metric cards" },
  { type: "kpi", label: "KPI Card", icon: <TrendingUp size={18} />, description: "Highlight key metrics" },
  { type: "funnel", label: "Funnel", icon: <Filter size={18} />, description: "Show conversion stages" },
  { type: "progress", label: "Progress Bars", icon: <Activity size={18} />, description: "Multiple progress indicators" },
  { type: "gauge", label: "Gauge", icon: <Gauge size={18} />, description: "Speedometer-style metric" },
  { type: "radar", label: "Radar Chart", icon: <Target size={18} />, description: "Multi-dimensional comparison" },
  { type: "table", label: "Data Table", icon: <Table size={18} />, description: "Tabular data display" },
];

export default function ChartCreator({ initialChart, onSave, onCancel, compact = false }: ChartCreatorProps) {
  const [activeTab, setActiveTab] = useState<"type" | "data" | "style" | "preview">("type");
  
  const [chartData, setChartData] = useState<ChartData>(initialChart || {
    type: "bar",
    title: "",
    data: [
      { label: "Item 1", value: 100 },
      { label: "Item 2", value: 75 },
      { label: "Item 3", value: 50 },
    ],
    config: {
      showValues: true,
      showLabels: true,
      showLegend: true,
      showGrid: true,
      showAnimation: true,
      colorScheme: "default",
    },
  });

  const updateChartType = (type: ChartType) => {
    setChartData(prev => ({ ...prev, type }));
  };

  const updateConfig = (updates: Partial<ChartConfig>) => {
    setChartData(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  };

  const updateDataPoint = (index: number, updates: Partial<ChartDataPoint>) => {
    setChartData(prev => ({
      ...prev,
      data: prev.data.map((d, i) => i === index ? { ...d, ...updates } : d),
    }));
  };

  const addDataPoint = () => {
    const newIndex = chartData.data.length;
    setChartData(prev => ({
      ...prev,
      data: [...prev.data, { 
        label: `Item ${newIndex + 1}`, 
        value: 50,
        color: getChartColor(newIndex, (prev.config.colorScheme as keyof typeof COLOR_SCHEMES) || "default"),
      }],
    }));
  };

  const removeDataPoint = (index: number) => {
    if (chartData.data.length <= 1) return;
    setChartData(prev => ({
      ...prev,
      data: prev.data.filter((_, i) => i !== index),
    }));
  };

  const applyTemplate = (templateId: string) => {
    const template = CHART_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setChartData({
        type: template.type,
        title: template.name,
        data: [...template.sampleData],
        config: { ...template.defaultConfig },
      });
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(chartData);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg ${compact ? "p-4" : "p-6"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {initialChart ? "Edit Chart" : "Create Chart"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Design interactive charts for your presentations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#06b6d4] text-white text-sm font-medium rounded-lg hover:bg-[#0891b2] transition-colors"
          >
            <Save size={16} />
            Save Chart
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6">
        {[
          { id: "type", label: "Chart Type", icon: <BarChart3 size={16} /> },
          { id: "data", label: "Data", icon: <Table size={16} /> },
          { id: "style", label: "Style", icon: <Palette size={16} /> },
          { id: "preview", label: "Preview", icon: <Eye size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-600 text-[#06b6d4] shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Chart Type Tab */}
        {activeTab === "type" && (
          <div className="space-y-6">
            {/* Quick Templates */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-[#06b6d4]" />
                Quick Templates
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CHART_TEMPLATES.slice(0, 8).map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template.id)}
                    className="p-3 text-left rounded-lg border border-slate-200 dark:border-slate-600 hover:border-[#06b6d4] hover:bg-[#06b6d4]/5 transition-all group"
                  >
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#06b6d4]">
                      {template.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Types */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Chart Types
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {CHART_TYPE_OPTIONS.map(option => (
                  <button
                    key={option.type}
                    onClick={() => updateChartType(option.type)}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      chartData.type === option.type
                        ? "border-[#06b6d4] bg-[#06b6d4]/10 ring-2 ring-[#06b6d4]/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-[#06b6d4]/50"
                    }`}
                  >
                    <div className={`mb-2 ${chartData.type === option.type ? "text-[#06b6d4]" : "text-slate-500"}`}>
                      {option.icon}
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {option.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === "data" && (
          <div className="space-y-4">
            {/* Chart Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Chart Title (optional)
              </label>
              <input
                type="text"
                value={chartData.title || ""}
                onChange={(e) => setChartData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter chart title..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
              />
            </div>

            {/* Data Points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Data Points
                </label>
                <button
                  onClick={addDataPoint}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded transition-colors"
                >
                  <Plus size={14} />
                  Add Point
                </button>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {chartData.data.map((point, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg group"
                  >
                    <GripVertical size={14} className="text-slate-400 cursor-grab" />
                    
                    <input
                      type="text"
                      value={point.label}
                      onChange={(e) => updateDataPoint(index, { label: e.target.value })}
                      placeholder="Label"
                      className="flex-1 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                    />
                    
                    <input
                      type="number"
                      value={point.value}
                      onChange={(e) => updateDataPoint(index, { value: parseFloat(e.target.value) || 0 })}
                      placeholder="Value"
                      className="w-24 px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                    />
                    
                    <input
                      type="color"
                      value={point.color || getChartColor(index)}
                      onChange={(e) => updateDataPoint(index, { color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    
                    <button
                      onClick={() => removeDataPoint(index)}
                      disabled={chartData.data.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* KPI-specific options */}
            {chartData.type === "kpi" && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={chartData.config.target || ""}
                    onChange={(e) => updateConfig({ target: parseFloat(e.target.value) || undefined })}
                    placeholder="e.g., 100"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Trend
                  </label>
                  <select
                    value={chartData.config.trend || "neutral"}
                    onChange={(e) => updateConfig({ trend: e.target.value as "up" | "down" | "neutral" })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  >
                    <option value="up">↑ Up</option>
                    <option value="down">↓ Down</option>
                    <option value="neutral">→ Neutral</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Style Tab */}
        {activeTab === "style" && (
          <div className="space-y-6">
            {/* Color Scheme */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Color Scheme
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(COLOR_SCHEMES).map(([name, colors]) => (
                  <button
                    key={name}
                    onClick={() => updateConfig({ colorScheme: name as ChartConfig["colorScheme"] })}
                    className={`p-2 rounded-lg border transition-all ${
                      chartData.config.colorScheme === name
                        ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-[#06b6d4]/50"
                    }`}
                  >
                    <div className="flex gap-0.5 mb-1.5">
                      {colors.slice(0, 5).map((color, i) => (
                        <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400 capitalize">
                      {name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Display Options
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "showValues", label: "Show Values" },
                  { key: "showLabels", label: "Show Labels" },
                  { key: "showLegend", label: "Show Legend" },
                  { key: "showGrid", label: "Show Grid" },
                  { key: "showAnimation", label: "Animate" },
                  { key: "lineSmooth", label: "Smooth Lines" },
                ].map(option => (
                  <label
                    key={option.key}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={chartData.config[option.key as keyof ChartConfig] as boolean || false}
                      onChange={(e) => updateConfig({ [option.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-[#06b6d4] focus:ring-[#06b6d4]"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Value Formatting */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Value Formatting
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={chartData.config.prefix || ""}
                    onChange={(e) => updateConfig({ prefix: e.target.value })}
                    placeholder="$"
                    className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Suffix</label>
                  <input
                    type="text"
                    value={chartData.config.suffix || ""}
                    onChange={(e) => updateConfig({ suffix: e.target.value })}
                    placeholder="%"
                    className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Unit</label>
                  <input
                    type="text"
                    value={chartData.config.unit || ""}
                    onChange={(e) => updateConfig({ unit: e.target.value })}
                    placeholder="K"
                    className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Chart Preview
              </h3>
              <button
                onClick={() => setChartData(prev => ({ ...prev, config: { ...prev.config, showAnimation: true } }))}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-[#06b6d4] transition-colors"
              >
                <RotateCcw size={12} />
                Replay Animation
              </button>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
              <InteractiveChart 
                chart={chartData} 
                interactive={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
