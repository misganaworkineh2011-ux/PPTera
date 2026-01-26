"use client";

import { LayoutGrid } from "lucide-react";
import type { Theme } from "~/lib/themes";

interface ChangeLayoutButtonProps {
  canEdit: boolean;
  hasBoxContent: boolean;
  theme: Theme;
  onOpenSelector: () => void;
  onOpenContentLayoutPanel?: () => void;
  placement?: "inline";
}

export function ChangeLayoutButton({
  canEdit,
  hasBoxContent,
  theme,
  onOpenSelector,
  onOpenContentLayoutPanel,
  placement = "inline",
}: ChangeLayoutButtonProps) {
  if (!canEdit || !hasBoxContent) return null;
  const placementClasses = placement === "inline" ? "mt-2 sm:mt-3 self-start" : "";
  return (
    <button
      onClick={() => {
        if (onOpenContentLayoutPanel) {
          onOpenContentLayoutPanel();
        } else {
          onOpenSelector();
        }
      }}
      className={`z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shadow-md ${placementClasses} opacity-0 pointer-events-none group-hover:opacity-90 group-hover:pointer-events-auto hover:opacity-100`}
      style={{
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
      }}
      tabIndex={-1}
    >
      <LayoutGrid size={14} />
      <span className="hidden sm:inline">Change Layout</span>
    </button>
  );
}

interface SlideIndicatorProps {
  showPageNumber?: boolean;
  index: number;
  totalSlides: number;
  position?: "top-left" | "top-right";
  colors: {
    accent: string;
    accentLine: string;
    indicatorMuted: string;
  };
}

export function SlideIndicator({
  showPageNumber,
  index,
  totalSlides,
  position = "top-left",
  colors,
}: SlideIndicatorProps) {
  if (!showPageNumber) return null;
  const posClass = position === "top-left"
    ? "top-2 left-2 sm:top-4 sm:left-4 md:top-8 md:left-8"
    : "top-2 right-2 sm:top-4 sm:right-4 md:top-8 md:right-8";

  return (
    <div className={`absolute ${posClass} flex items-center gap-1 sm:gap-2 md:gap-3 z-10`}>
      <span
        className="font-mono font-medium"
        style={{ color: colors.accent, fontSize: "clamp(0.5rem, 1.2vw + 0.15rem, 0.875rem)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className={`w-4 sm:w-8 md:w-12 h-px bg-gradient-to-r ${colors.accentLine} to-transparent`} />
      <span
        className={`font-medium uppercase tracking-widest ${colors.indicatorMuted}`}
        style={{ fontSize: "clamp(0.4rem, 1vw + 0.1rem, 0.75rem)" }}
      >
        / {String(totalSlides).padStart(2, "0")}
      </span>
    </div>
  );
}
