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

  // For list view: sidebar shrinks to content and centers vertically
  // For grid view: sidebar is full height
  if (viewMode === "list") {
    return (
      <div className="w-44 shrink-0 fixed left-0 top-[56px] h-[calc(100vh-56px)] flex items-center">
        <aside
          className={`w-full mx-2 px-2 py-3 rounded-xl border shadow-lg ${
            isLight ? "bg-white border-slate-200" : "bg-zinc-900 border-zinc-700"
          }`}
        >
          {/* Header with toggle */}
          <div className="flex items-center justify-between mb-3">
            <div
              className={`flex items-center rounded-full p-0.5 ${
                isLight ? "bg-slate-200/80" : "bg-zinc-800"
              }`}
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-full transition-all ${
                  isLight
                    ? "text-slate-500 hover:text-slate-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-full transition-all ${
                  isLight
                    ? "bg-white shadow-sm text-blue-600"
                    : "bg-zinc-700 text-white shadow-sm"
                }`}
                title="List view"
              >
                <List size={14} />
              </button>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isLight
                  ? "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
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
                  className={`w-5 h-5 shrink-0 flex items-center justify-center rounded text-[10px] font-semibold transition-colors ${
                    currentSlide === index
                      ? "text-white"
                      : isLight
                        ? "bg-slate-200 text-slate-600"
                        : "bg-zinc-800 text-zinc-400"
                  }`}
                  style={
                    currentSlide === index
                      ? { backgroundColor: theme.colors.primary }
                      : {}
                  }
                >
                  {index + 1}
                </div>
                <div
                  className={`flex-1 text-left py-1 px-1.5 rounded text-xs truncate transition-colors ${
                    currentSlide === index
                      ? isLight
                        ? "bg-blue-50 text-blue-700"
                        : "bg-zinc-800 text-white"
                      : isLight
                        ? "hover:bg-slate-100 text-slate-700"
                        : "hover:bg-zinc-800 text-zinc-300"
                  }`}
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
      className={`w-44 shrink-0 h-[calc(100vh-56px)] fixed left-0 top-[56px] flex flex-col border-r ${
        isLight ? "bg-slate-50 border-slate-200" : "bg-zinc-900/95 border-zinc-800"
      }`}
    >
      {/* Header with toggle */}
      <div className="p-2">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center rounded-full p-0.5 ${
              isLight ? "bg-slate-200/80" : "bg-zinc-800"
            }`}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full transition-all ${
                isLight
                  ? "bg-white shadow-sm text-blue-600"
                  : "bg-zinc-700 text-white shadow-sm"
              }`}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-full transition-all ${
                isLight
                  ? "text-slate-500 hover:text-slate-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight
                ? "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
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
              className={`aspect-video overflow-hidden rounded transition-all duration-200 ring-1 hover:ring-2 hover:shadow-sm ${
                currentSlide === index
                  ? "ring-2 shadow-md"
                  : isLight
                    ? "ring-slate-200 hover:ring-slate-300"
                    : "ring-zinc-700 hover:ring-zinc-600"
              }`}
              style={
                currentSlide === index
                  ? { boxShadow: `0 0 0 2px ${theme.colors.primary}` }
                  : {}
              }
            >
              {renderSlide(slide, index, false)}
            </div>
            <div
              className={`absolute bottom-1 left-1 px-1 py-0.5 rounded text-[8px] font-semibold ${
                isLight ? "bg-white/90 text-slate-700" : "bg-black/70 text-white"
              }`}
            >
              {index + 1}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
