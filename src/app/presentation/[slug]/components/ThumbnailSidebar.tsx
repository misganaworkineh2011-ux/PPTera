"use client";

import { X, PlusCircle } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "~/components/presentation/types";
import { getThemeType } from "./types";
import { getUIColors } from "./ui-colors";

interface ThumbnailSidebarProps {
  slides: SlideData[];
  onSlideClick: (i: number) => void;
  onClose: () => void;
  renderSlide: (
    slide: SlideData,
    index: number,
    isMain: boolean
  ) => React.ReactNode;
  theme: Theme;
  onAddSlide: (index: number) => void;
  isOwner: boolean;
}

export function ThumbnailSidebar({
  slides,
  onSlideClick,
  onClose,
  renderSlide,
  theme,
  onAddSlide,
  isOwner,
}: ThumbnailSidebarProps) {
  const ui = getUIColors(getThemeType(theme));

  return (
    <aside className="w-44 shrink-0 self-start sticky top-20">
      <div
        className={`space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto pr-2 scrollbar-thin ${ui.scrollbar}`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <span
            className={`text-xs font-semibold uppercase tracking-wide ${ui.headerMuted}`}
          >
            Slides
          </span>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${ui.headerHover} ${ui.headerMuted}`}
          >
            <X size={14} />
          </button>
        </div>
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => onSlideClick(index)}
            className="w-full group relative"
          >
            <div
              className={`aspect-video overflow-hidden transition-all duration-200 ring-1 hover:ring-2 hover:shadow-md ${ui.ringHover}`}
            >
              {renderSlide(slide, index, false)}
            </div>
            <div
              className={`absolute top-1 left-1 w-4 h-4 backdrop-blur-sm flex items-center justify-center ${ui.thumbBg}`}
            >
              <span className={`text-[9px] font-bold ${ui.thumbText}`}>
                {index + 1}
              </span>
            </div>
          </button>
        ))}
        {isOwner && (
          <button
            onClick={() => onAddSlide(slides.length - 1)}
            className={`w-full aspect-video rounded border-2 border-dashed flex items-center justify-center transition-colors ${ui.ringHover} ${ui.headerMuted} hover:border-solid`}
            style={{ borderColor: theme.colors.primary + "40" }}
          >
            <div className="text-center">
              <PlusCircle
                size={20}
                className="mx-auto mb-1"
                style={{ color: theme.colors.primary }}
              />
              <span className="text-[10px]">Add Slide</span>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
