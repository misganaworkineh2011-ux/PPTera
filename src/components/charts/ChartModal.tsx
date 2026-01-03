"use client";

import { useState, useEffect } from "react";
import { X, BarChart3, Sparkles } from "lucide-react";
import { type ChartData, CHART_TEMPLATES } from "~/lib/charts/types";
import ChartCreator from "./ChartCreator";
import InteractiveChart from "./InteractiveChart";
import { type Theme } from "~/lib/themes";

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
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#06b6d4]/10 rounded-lg">
              <BarChart3 size={20} className="text-[#06b6d4]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {existingChart ? "Edit Chart" : "Add Chart"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-neutral-400">
                {mode === "templates" ? "Choose a template or create from scratch" : "Customize your chart"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] text-white rounded-xl hover:shadow-lg hover:shadow-[#06b6d4]/25 transition-all"
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
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mb-3 capitalize">
                      {category} Charts
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categoryTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.id)}
                          className="group p-4 text-left rounded-xl border border-slate-200 dark:border-neutral-700 hover:border-[#06b6d4] hover:shadow-md transition-all bg-white dark:bg-neutral-800/50"
                        >
                          {/* Mini Preview */}
                          <div className="h-24 mb-3 bg-slate-50 dark:bg-neutral-900 rounded-lg p-2 overflow-hidden">
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
                          </div>
                          <div className="text-sm font-medium text-slate-700 dark:text-neutral-300 group-hover:text-[#06b6d4] transition-colors">
                            {template.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
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
                  className="mb-4 text-sm text-slate-500 hover:text-[#06b6d4] transition-colors"
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
