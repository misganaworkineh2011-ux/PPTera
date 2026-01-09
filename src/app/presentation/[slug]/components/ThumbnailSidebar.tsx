"use client";

import { useState } from "react";
import { X, LayoutGrid, List } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "~/components/presentation/types";
import { getUIColors, getModalColors } from "./ui-colors";
import { getThemeType } from "./types";

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
  const modalColors = getModalColors(theme);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  // Theme-aware background styles - use modalColors for consistent theming
  const bgStyle = { background: modalColors.bg };
  const bgClass = "";

  // For list view: sidebar shrinks to content and centers vertically
  // For grid view: sidebar is full height
  if (viewMode === "list") {
    return (
      <div className="w-44 shrink-0 fixed left-0 top-[56px] h-[calc(100vh-56px)] flex items-center">
        <aside
          className={`w-full mx-2 px-2 py-3 rounded-xl border shadow-lg ${bgClass}`}
          style={{
            ...bgStyle,
            borderColor: modalColors.border,
          }}
        >
          {/* Header with toggle */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center rounded-full p-0.5"
              style={{ backgroundColor: modalColors.surface }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className="p-1.5 rounded-full transition-all"
                style={{ color: modalColors.textMuted }}
                title="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="p-1.5 rounded-full transition-all shadow-sm"
                style={{ 
                  backgroundColor: modalColors.surfaceHover,
                  color: modalColors.text
                }}
                title="List view"
              >
                <List size={14} />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: modalColors.textMuted }}
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
                      ? { backgroundColor: modalColors.accent, color: "#ffffff" }
                      : { backgroundColor: modalColors.surface, color: modalColors.textMuted }
                  }
                >
                  {index + 1}
                </div>
                <div
                  className="flex-1 text-left py-1 px-1.5 rounded text-xs truncate transition-colors"
                  style={
                    currentSlide === index
                      ? { backgroundColor: modalColors.surface, color: modalColors.accent }
                      : { color: modalColors.text }
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
        borderColor: modalColors.border,
      }}
    >
      {/* Header with toggle */}
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center rounded-full p-0.5"
            style={{ backgroundColor: modalColors.surface }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className="p-1.5 rounded-full transition-all shadow-sm"
              style={{ 
                backgroundColor: modalColors.surfaceHover,
                color: modalColors.text
              }}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-1.5 rounded-full transition-all"
              style={{ color: modalColors.textMuted }}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: modalColors.textMuted }}
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
              className="aspect-video overflow-hidden rounded ring-1"
              style={{
                boxShadow: currentSlide === index ? `0 0 0 2px ${modalColors.accent}` : undefined,
                ["--tw-ring-color" as string]: currentSlide === index 
                  ? modalColors.accent 
                  : modalColors.border,
                willChange: "box-shadow",
              }}
            >
              {renderSlide(slide, index, false)}
            </div>
            <div
              className="absolute bottom-1 left-1 px-1 py-0.5 rounded text-[8px] font-semibold"
              style={{ 
                backgroundColor: modalColors.isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.9)",
                color: modalColors.text
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
