"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { getSlideShapeStyles } from "~/lib/themes";
import type { SlideData } from "~/components/presentation/types";
import type { StreamingStatus } from "../hooks";
import { AddSlideButtons } from "./AddSlideButtons";
import { getThemeType, type ThemeType } from "./types";
import { getUIColors } from "./ui-colors";
import FeedbackSection from "~/components/presentation/FeedbackSection";

interface ScrollableSlidesViewProps {
  slides: SlideData[];
  canEdit: boolean;
  isPublicView: boolean;
  isMobile: boolean;
  theme: Theme;
  streamingStatus: StreamingStatus;
  streamingSlideIndex: number;
  aiEditingSlideIndex: number | null;
  renderSlide: (
    slide: SlideData,
    index: number,
    isMain?: boolean,
    spotlightIndex?: number,
  ) => ReactNode;
  onAddSlideAt: (index: number) => void;
  onAddAISlide: (index: number, prompt: string) => Promise<void>;
  presentationTitle: string;
  showFeedback?: boolean;
  presentationId?: string;
  // Reports the slide that is most in view as the user scrolls, so the navigator
  // highlight stays in sync with the main viewer.
  onActiveSlideChange?: (index: number) => void;
}

export function ScrollableSlidesView({
  slides,
  canEdit,
  isPublicView,
  isMobile,
  theme,
  streamingStatus,
  streamingSlideIndex,
  aiEditingSlideIndex,
  renderSlide,
  onAddSlideAt,
  onAddAISlide,
  presentationTitle,
  showFeedback,
  presentationId,
  onActiveSlideChange,
}: ScrollableSlidesViewProps) {
  const ui = getUIColors(getThemeType(theme));
  const isCurrentlyStreaming = streamingStatus === "streaming";
  const slideShapeStyles = getSlideShapeStyles(theme.slideShape);

  // Track which slide is most visible and report it (highlight sync on scroll).
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!onActiveSlideChange) return;
    const root = containerRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[id^="slide-"]'));
    if (!els.length) return;

    const ratios = new Map<number, number>();
    let last = -1;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).id.replace("slide-", ""));
          if (!Number.isNaN(idx)) {
            ratios.set(idx, entry.isIntersecting ? entry.intersectionRatio : 0);
          }
        }
        let best = -1;
        let bestRatio = 0;
        ratios.forEach((r, idx) => {
          if (r > bestRatio) {
            bestRatio = r;
            best = idx;
          }
        });
        if (best !== -1 && best !== last && bestRatio > 0.35) {
          last = best;
          onActiveSlideChange(best);
        }
      },
      { threshold: [0.2, 0.4, 0.6, 0.8] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onActiveSlideChange, slides.length]);

  return (
    <div ref={containerRef} className="w-full mx-auto space-y-4 sm:space-y-8 md:space-y-12 pb-12 px-3 sm:px-4" style={{ maxWidth: "1209.33px" }}>
      {slides.map((slide, index) => {
        const isTitle = slide.type === "title";
        const isSlideStreaming = isCurrentlyStreaming && streamingSlideIndex === index;
        const isNewSlide = isCurrentlyStreaming && index === slides.length - 1;
        const isAiEditing = aiEditingSlideIndex === index;

        const slideElement = isTitle && !slide.slideLayout ? (
          <div
            id={`slide-${index}`}
            className={`w-full overflow-hidden scroll-mt-20 ring-1 ${ui.ring} ${isNewSlide ? "animate-fade-in" : ""} ${isSlideStreaming || isAiEditing ? "ring-2" : ""} relative`}
            style={{
              // Fixed 16:9 canvas so the title slide matches every other slide's size.
              ...(isMobile ? { maxWidth: "100%", aspectRatio: "16/9" } : { width: "1209.33px", maxWidth: "100%", aspectRatio: "16/9" }),
              ...(isSlideStreaming || isAiEditing ? { boxShadow: `0 0 20px ${theme.colors.primary}40` } : {}),
              ...slideShapeStyles,
            }}
          >
            {isAiEditing && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/90 text-white text-xs font-medium backdrop-blur-sm">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating...</span>
              </div>
            )}
            {renderSlide(slide, index, true)}
          </div>
        ) : (
          <div
            id={`slide-${index}`}
            className={`overflow-hidden scroll-mt-20 ring-1 ${ui.ring} ${isNewSlide ? "animate-fade-in" : ""} ${isSlideStreaming || isAiEditing ? "ring-2" : ""} relative`}
            style={{
              width: isMobile ? "100%" : "1209.33px",
              maxWidth: "100%",
              height: "auto",
              ...(isSlideStreaming || isAiEditing ? { boxShadow: `0 0 20px ${theme.colors.primary}40` } : {}),
              ...slideShapeStyles,
            }}
          >
            {isAiEditing && (
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/90 text-white text-xs font-medium backdrop-blur-sm">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating...</span>
              </div>
            )}
            <ScrollSlideContent
              slide={slide}
              index={index}
              theme={theme}
              renderSlide={renderSlide}
            />
          </div>
        );

        return (
          <div key={index}>
            {slideElement}

            {canEdit && !isPublicView && !isMobile && !isCurrentlyStreaming && index < slides.length - 1 && (
              <AddSlideButtons
                onAddSlide={() => onAddSlideAt(index)}
                onAddAISlide={(prompt) => onAddAISlide(index, prompt)}
                presentationContext={presentationTitle}
                theme={theme}
              />
            )}
          </div>
        );
      })}

      {canEdit && !isPublicView && !isMobile && !isCurrentlyStreaming && slides.length > 0 && (
        <AddSlideButtons
          onAddSlide={() => onAddSlideAt(slides.length - 1)}
          onAddAISlide={(prompt) => onAddAISlide(slides.length - 1, prompt)}
          presentationContext={presentationTitle}
          theme={theme}
        />
      )}

      {isCurrentlyStreaming && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-700">
            <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            <span className="text-sm text-white/80">Generating slides...</span>
          </div>
        </div>
      )}

      {streamingStatus !== "streaming" && (
        <div className="text-center py-6 sm:py-8">
          <div
            className={`inline-flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full backdrop-blur-sm shadow-lg border ${ui.endCard}`}
            style={theme.pageBackground ? {
              background: theme.colors.backgroundAlt,
              borderColor: theme.colors.border,
            } : {}}
          >
            <Sparkles size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" style={{ color: theme.colors.primary }} />
            <span
              className={`font-semibold text-xs sm:text-sm md:text-base ${ui.endText}`}
              style={theme.pageBackground ? { color: theme.colors.heading } : {}}
            >
              End of Presentation
            </span>
          </div>
          <p
            className={`mt-3 sm:mt-4 text-[10px] sm:text-xs md:text-sm ${ui.endMuted}`}
            style={theme.pageBackground ? { color: theme.colors.textMuted } : {}}
          >
            {slides.length} slides • Created with PPTera
          </p>
        </div>
      )}
    </div>
  );
}

function ScrollSlideContent({
  slide,
  index,
  theme,
  renderSlide,
}: {
  slide: SlideData;
  index: number;
  theme: Theme;
  renderSlide: (slide: SlideData, index: number, isMain: boolean) => ReactNode;
}) {
  const themeType = getThemeType(theme);

  const isCustomTheme = theme.id.startsWith("custom-");

  const bgColors: Record<ThemeType, string> = {
    dark: "bg-gradient-to-br from-zinc-900 via-zinc-950 to-black",
    light: "bg-gradient-to-br from-slate-50 via-white to-slate-100",
    sunset: "bg-gradient-to-br from-rose-950 via-[#1c1017] to-[#261520]",
    ocean: "bg-gradient-to-br from-[#0a1628] via-[#0d1f35] to-[#122a45]",
    aurora: "bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#150d24]",
    ember: "bg-gradient-to-br from-[#1a0a0a] via-[#2a1010] to-[#3a1515]",
    midnight: "bg-gradient-to-br from-[#0c0a1d] via-[#1a1735] to-[#12102a]",
    cyber: "bg-gradient-to-br from-[#0a0a0f] via-[#0f0f18] to-[#151520]",
    alien: "bg-gradient-to-br from-[#0a0f0a] via-[#0d140d] to-[#121a12]",
    corporate: "bg-gradient-to-br from-white via-slate-50 to-white",
    cosmic: "bg-gradient-to-br from-[#0a0612] via-[#120a1f] to-[#1a0a2e]",
    architectural: "bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#0a0a0a]",
    anime: "bg-gradient-to-br from-[#1a1625] via-[#251f35] to-[#1a1625]",
    hacker: "bg-gradient-to-br from-[#0d0d0d] via-[#141414] to-[#0d0d0d]",
    "custom-dark": "",
    "custom-light": "",
  };

  const hasCustomPageBg = !!theme.pageBackground;

  const bgClass = isCustomTheme ? "" : (hasCustomPageBg ? "" : bgColors[themeType]);
  const bgStyle = isCustomTheme || hasCustomPageBg ? { background: theme.pageBackground || theme.colors.background } : {};

  // All slides use a fixed 16:9 canvas so every slide in the feed is the same size.
  return (
    <div
      className={`w-full ${bgClass} relative`}
      style={{ aspectRatio: "16/9", ...bgStyle }}
    >
      {renderSlide(slide, index, true)}
    </div>
  );
}
