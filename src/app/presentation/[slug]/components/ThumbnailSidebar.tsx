"use client";

import { useState } from "react";
import { X, LayoutGrid, List } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "~/components/presentation/types";
import { getThemeType } from "./types";
import { getUIColors } from "./ui-colors";

type ViewMode = "grid" | "list";

interface ThumbnailSidebarProps {
  slides: SlideData[];
  currentSlide?: number;
  onSlideClick: (i: number) => void;
  onClose: () => void;
  renderSlide: (
    slide: SlideData,
    index: number,
    isMain: boolean
  ) => React.ReactNode;
  theme: Theme;
}

export function ThumbnailSidebar({
  slides,
  currentSlide = 0,
  onSlideClick,
  onClose,
  renderSlide,
  theme,
}: ThumbnailSidebarProps) {
  const themeType = getThemeType(theme);
  const ui = getUIColors(themeType);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const isLight = themeType === "light" || themeType === "corporate";
  
  // Theme-aware background styles
  const bgStyle = theme.pageBackground 
    ? { background: theme.pageBackground }
    : {};
  const bgClass = theme.pageBackground 
    ? "" 
    : isLight ? "bg-slate-50" : "bg-zinc-900/95";

  // For list view: sidebar shrinks to content and centers vertically
  // For grid view: sidebar is full height
  if (viewMode === "list") {
    return (
      <div className="w-44 shrink-0 fixed left-0 top-[56px] h-[calc(100vh-56px)] flex items-center">
        <aside
          className={`w-full mx-2 px-2 py-3 rounded-xl border shadow-lg ${bgClass}`}
          style={{
            ...bgStyle,
            borderColor: isLight ? "#e2e8f0" : theme.colors.border || "#3f3f46",
          }}
        >
          {/* Header with toggle */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center rounded-full p-0.5"
              style={{ backgroundColor: isLight ? "rgba(226, 232, 240, 0.8)" : theme.colors.surface || "#27272a" }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className="p-1.5 rounded-full transition-all"
                style={{ color: isLight ? "#64748b" : theme.colors.textMuted || "#a1a1aa" }}
                title="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="p-1.5 rounded-full transition-all shadow-sm"
                style={{ 
                  backgroundColor: isLight ? "#ffffff" : theme.colors.surfaceHover || "#3f3f46",
                  color: isLight ? "#2563eb" : "#ffffff"
                }}
                title="List view"
              >
                <List size={14} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: isLight ? "#94a3b8" : theme.colors.textMuted || "#71717a" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Slide list */}
          <div className="space-y-0.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => onSlideClick(index)}
                className="w-full flex items-center gap-1.5"
              >
                <div
                  className="w-5 h-5 shrink-0 flex items-center justify-center rounded text-[10px] font-semibold transition-colors"
                  style={
                    currentSlide === index
                      ? { backgroundColor: theme.colors.primary, color: "#ffffff" }
                      : { backgroundColor: isLight ? "#e2e8f0" : theme.colors.surface || "#27272a", color: isLight ? "#475569" : theme.colors.textMuted || "#a1a1aa" }
                  }
                >
                  {index + 1}
                </div>
                <div
                  className="flex-1 text-left py-1 px-1.5 rounded text-xs truncate transition-colors"
                  style={
                    currentSlide === index
                      ? { backgroundColor: isLight ? "#eff6ff" : theme.colors.surface || "#27272a", color: isLight ? "#1d4ed8" : "#ffffff" }
                      : { color: isLight ? "#334155" : theme.colors.text || "#d4d4d8" }
                  }
                >
                  {slide.title || slide.subtitle || `Slide ${index + 1}`}
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    );
  }

  // Grid view - full height sidebar
  return (
    <aside
      className={`w-44 shrink-0 h-[calc(100vh-56px)] fixed left-0 top-[56px] flex flex-col border-r ${bgClass}`}
      style={{
        ...bgStyle,
        borderColor: isLight ? "#e2e8f0" : theme.colors.border || "#27272a",
      }}
    >
      {/* Header with toggle */}
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center rounded-full p-0.5"
            style={{ backgroundColor: isLight ? "rgba(226, 232, 240, 0.8)" : theme.colors.surface || "#27272a" }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className="p-1.5 rounded-full transition-all shadow-sm"
              style={{ 
                backgroundColor: isLight ? "#ffffff" : theme.colors.surfaceHover || "#3f3f46",
                color: isLight ? "#2563eb" : "#ffffff"
              }}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-1.5 rounded-full transition-all"
              style={{ color: isLight ? "#64748b" : theme.colors.textMuted || "#a1a1aa" }}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: isLight ? "#94a3b8" : theme.colors.textMuted || "#71717a" }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Slides grid */}
      <div
        className={`flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin ${ui.scrollbar} space-y-1.5`}
      >
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => onSlideClick(index)}
            className="w-full group relative"
          >
            <div
              className="aspect-video overflow-hidden rounded transition-all duration-200 ring-1 hover:ring-2 hover:shadow-sm"
              style={{
                boxShadow: currentSlide === index ? `0 0 0 2px ${theme.colors.primary}` : undefined,
                ["--tw-ring-color" as string]: currentSlide === index 
                  ? theme.colors.primary 
                  : isLight ? "#e2e8f0" : theme.colors.border || "#3f3f46",
              }}
            >
              {renderSlide(slide, index, false)}
            </div>
            <div
              className="absolute bottom-1 left-1 px-1 py-0.5 rounded text-[8px] font-semibold"
              style={{ 
                backgroundColor: isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)",
                color: isLight ? "#334155" : "#ffffff"
              }}
            >
              {index + 1}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
