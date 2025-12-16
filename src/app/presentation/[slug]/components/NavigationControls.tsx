"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { getThemeType } from "./types";
import { getUIColors } from "./ui-colors";

interface NavigationControlsProps {
  currentSlide: number;
  totalSlides: number;
  isFullscreen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (i: number) => void;
  theme: Theme;
}

export function NavigationControls({
  currentSlide,
  totalSlides,
  isFullscreen,
  onPrev,
  onNext,
  onGoTo,
  theme,
}: NavigationControlsProps) {
  const ui = getUIColors(getThemeType(theme));

  return (
    <div
      className={`flex items-center justify-between ${isFullscreen ? "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent" : "mt-6"}`}
    >
      <button
        onClick={onPrev}
        disabled={currentSlide === 0}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          isFullscreen
            ? "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
            : ui.navBtn
        }`}
      >
        <ChevronLeft size={18} />
        <span className="hidden sm:inline text-sm">Previous</span>
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => onGoTo(index)}
            className={`transition-all duration-300 ${
              currentSlide === index
                ? "w-6 h-1.5 rounded-full"
                : `w-1.5 h-1.5 rounded-full ${isFullscreen ? "bg-white/40 hover:bg-white/60" : ui.navDot}`
            }`}
            style={
              currentSlide === index
                ? { backgroundColor: theme.colors.primary }
                : {}
            }
          />
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={currentSlide === totalSlides - 1}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          isFullscreen
            ? "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
            : ui.navBtn
        }`}
      >
        <span className="hidden sm:inline text-sm">Next</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
