"use client";

import { useState, useEffect } from "react";
import { X, BarChart3, Sparkles, PieChart, TrendingUp, Activity, Target, Filter, LayoutGrid, Gauge, ArrowDownWideNarrow, BarChart2, BarChartHorizontal, CircleDot, Layers } from "lucide-react";
import { type ChartData, CHART_TEMPLATES, type ChartType } from "~/lib/charts/types";
import ChartCreator from "./ChartCreator";
import InteractiveChart from "./InteractiveChart";
import { type Theme } from "~/lib/themes";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";

// Helper to determine if theme is dark
function isDarkTheme(theme?: Theme): boolean {
  if (!theme) return false;
  const bg = theme.colors?.background || "#ffffff";
  if (bg.startsWith("#")) {
    const hex = bg.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  return false;
}

// Get theme-aware colors using the helper
function getThemeColors(theme?: Theme) {
  if (!theme) {
    return {
      bg: "#ffffff",
      surface: "#f8fafc",
      border: "#e2e8f0",
      text: "#0f172a",
      textMuted: "#64748b",
      hoverBg: "#f1f5f9",
      accent: "#06b6d4",
    };
  }
  
  const modalColors = getModalColors(theme);
  return {
    bg: modalColors.bg,
    surface: modalColors.surface,
    border: modalColors.border,
    text: modalColors.text,
    textMuted: modalColors.textMuted,
    hoverBg: modalColors.hoverBg,
    accent: modalColors.accent || "#06b6d4",
  };
}

// Map chart types to representative icons
function getChartIcon(type: ChartType, size: number = 20, accentColor: string = "#06b6d4") {
  const iconProps = { size, style: { color: accentColor } };
  switch (type) {
    case "bar":
    case "stacked-bar":
    case "grouped-bar":
      return <BarChart3 {...iconProps} />;
    case "horizontal-bar":
      return <BarChartHorizontal {...iconProps} />;
    case "line":
      return <TrendingUp {...iconProps} />;
    case "area":
      return <Activity {...iconProps} />;
    case "pie":
      return <PieChart {...iconProps} />;
    case "donut":
      return <CircleDot {...iconProps} />;
    case "scatter":
    case "bubble":
      return <Layers {...iconProps} />;
    case "radar":
      return <Target {...iconProps} />;
    case "gauge":
      return <Gauge {...iconProps} />;
    case "funnel":
      return <Filter {...iconProps} />;
    case "treemap":
    case "heatmap":
      return <LayoutGrid {...iconProps} />;
    case "waterfall":
    case "histogram":
      return <BarChart2 {...iconProps} />;
    case "comparison":
      return <ArrowDownWideNarrow {...iconProps} />;
    case "progress":
      return <Target {...iconProps} />;
    case "kpi":
      return <Gauge {...iconProps} />;
    default:
      return <BarChart3 {...iconProps} />;
  }
}

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (chart: ChartData) => void;
  theme?: Theme;
  existingChart?: ChartData | null;
}

export default function ChartModal({ isOpen, onClose, onInsert, theme, existingChart }: ChartModalProps) {
  const [mode, setMode] = useState<"templates" | "create">(existingChart ? "create" : "templates");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const colors = getThemeColors(theme);
  const isDark = isDarkTheme(theme);

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(existingChart ? "create" : "templates");
      setSelectedTemplate(null);
    }
  }, [isOpen, existingChart]);

  if (!isOpen) return null;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = CHART_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      // Go directly to create mode with template data
      setMode("create");
    }
  };

  const handleSave = (chart: ChartData) => {
    onInsert(chart);
    onClose();
  };

  const getInitialChart = (): ChartData | undefined => {
    if (existingChart) return existingChart;
    if (selectedTemplate) {
      const template = CHART_TEMPLATES.find(t => t.id === selectedTemplate);
      if (template) {
        return {
          type: template.type,
          title: template.name,
          data: [...template.sampleData],
          config: { ...template.defaultConfig },
        };
      }
    }
    return undefined;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden mx-4"
        style={{
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${colors.accent}15` }}
            >
              {existingChart ? getChartIcon(existingChart.type) : selectedTemplate ? getChartIcon(CHART_TEMPLATES.find(t => t.id === selectedTemplate)?.type || "bar") : <BarChart3 size={20} style={{ color: colors.accent }} />}
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                {existingChart ? "Edit Chart" : "Add Chart"}
              </h2>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {mode === "templates" ? "Choose a template or create from scratch" : "Customize your chart"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {mode === "templates" ? (
            <div className="p-6">
              {/* Quick Actions */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setMode("create")}
                  className="flex-1 flex items-center justify-center gap-2 p-4 text-white rounded-xl hover:shadow-lg transition-all"
                  style={{ 
                    background: `linear-gradient(to bottom right, ${colors.accent}, ${colors.accent}dd)`,
                    boxShadow: `0 4px 14px ${colors.accent}40`,
                  }}
                >
                  <Sparkles size={20} />
                  <span className="font-medium">Create from Scratch</span>
                </button>
              </div>

              {/* Templates by Category */}
              {["business", "analytics", "comparison", "progress", "distribution"].map(category => {
                const categoryTemplates = CHART_TEMPLATES.filter(t => t.category === category);
                if (categoryTemplates.length === 0) return null;

                return (
                  <div key={category} className="mb-6">
                    <h3 
                      className="text-sm font-semibold mb-3 capitalize"
                      style={{ color: colors.text }}
                    >
                      {category} Charts
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categoryTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.id)}
                          className="group p-4 text-left rounded-xl transition-all"
                          style={{
                            backgroundColor: isDark ? colors.surface : "#ffffff",
                            border: `1px solid ${colors.border}`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = colors.accent;
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = colors.border;
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          {/* Mini Preview */}
                          <div 
                            className="h-24 mb-3 rounded-lg p-2 overflow-hidden relative"
                            style={{ backgroundColor: isDark ? colors.bg : colors.surface }}
                          >
                            <InteractiveChart
                              chart={{
                                type: template.type,
                                data: template.sampleData,
                                config: { ...template.defaultConfig, showAnimation: false },
                              }}
                              theme={theme}
                              compact={true}
                              interactive={false}
                            />
                            {/* Chart type icon badge */}
                            <div 
                              className="absolute top-1 right-1 p-1 rounded shadow-sm"
                              style={{ backgroundColor: isDark ? `${colors.surface}ee` : "rgba(255,255,255,0.9)" }}
                            >
                              {getChartIcon(template.type, 14)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getChartIcon(template.type, 16)}
                            <span 
                              className="text-sm font-medium transition-colors"
                              style={{ color: colors.text }}
                            >
                              {template.name}
                            </span>
                          </div>
                          <div 
                            className="text-xs mt-0.5 ml-6"
                            style={{ color: colors.textMuted }}
                          >
                            {template.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6">
              {/* Back button */}
              {!existingChart && (
                <button
                  onClick={() => {
                    setMode("templates");
                    setSelectedTemplate(null);
                  }}
                  className="mb-4 text-sm transition-colors"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.textMuted;
                  }}
                >
                  ← Back to templates
                </button>
              )}
              
              <ChartCreator
                initialChart={getInitialChart()}
                onSave={handleSave}
                onCancel={onClose}
                theme={theme}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
