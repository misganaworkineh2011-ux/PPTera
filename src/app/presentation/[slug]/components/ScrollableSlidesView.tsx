"use client";

import { type ReactNode } from "react";
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
  subscriptionPlan?: string | null;
  isFreeUserLimited?: boolean;
  freeSlideLimit?: number;
  halfBlurredSlideIndex?: number;
  onUpgrade?: () => void;
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
  subscriptionPlan,
  isFreeUserLimited = false,
  freeSlideLimit,
  halfBlurredSlideIndex,
  onUpgrade,
}: ScrollableSlidesViewProps) {
  const ui = getUIColors(getThemeType(theme));
  const isCurrentlyStreaming = streamingStatus === "streaming";
  const slideShapeStyles = getSlideShapeStyles(theme.slideShape);

  return (
    <div className="w-full mx-auto space-y-4 sm:space-y-8 md:space-y-12 pb-12 px-3 sm:px-4" style={{ maxWidth: "1209.33px" }}>
      {slides.map((slide, index) => {
        const isTitle = slide.type === "title";
        const isSlideStreaming = isCurrentlyStreaming && streamingSlideIndex === index;
        const isNewSlide = isCurrentlyStreaming && index === slides.length - 1;
        const isAiEditing = aiEditingSlideIndex === index;

        // Determine slide visibility for free users
        const isFullyVisible = !isFreeUserLimited || (freeSlideLimit !== undefined && index < freeSlideLimit);
        const isHalfBlurred = isFreeUserLimited && halfBlurredSlideIndex !== undefined && index === halfBlurredSlideIndex;
        const isHidden = isFreeUserLimited && freeSlideLimit !== undefined && halfBlurredSlideIndex !== undefined && index > halfBlurredSlideIndex;

        // Skip rendering hidden slides
        if (isHidden) {
          return null;
        }

        const slideElement = isTitle && !slide.slideLayout ? (
          <div
            id={`slide-${index}`}
            className={`w-full overflow-hidden scroll-mt-20 ring-1 ${ui.ring} ${isNewSlide ? "animate-fade-in" : ""} ${isSlideStreaming || isAiEditing ? "ring-2" : ""} relative`}
            style={{
              ...(isMobile ? { minHeight: "280px", maxWidth: "100%" } : { width: "1209.33px", maxWidth: "100%", height: "auto", minHeight: "400px" }),
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
            {isHalfBlurred && (() => {
              const lockedSlidesCount = slides.length - (halfBlurredSlideIndex || 0);
              return (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {/* Blur overlay covering 70% of the slide */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white/98" 
                    style={{ 
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      top: '30%'
                    }} 
                  />
                  {/* CTA Section */}
                  <div className="absolute bottom-0 left-0 right-0 h-[70%] flex flex-col items-center justify-center pointer-events-auto px-4">
                    <div className="text-center space-y-4 max-w-md">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50">
                        <Sparkles className="w-4 h-4" style={{ color: theme.colors.primary }} />
                        <span className="text-sm font-medium" style={{ color: theme.colors.primary }}>
                          {lockedSlidesCount} {lockedSlidesCount === 1 ? 'Slide' : 'Slides'} Locked
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold" style={{ color: theme.colors.heading }}>
                        Unlock Your Full Presentation
                      </h3>
                      <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                        Upgrade to access all {slides.length} slides and unlock premium features
                      </p>
                      <button
                        onClick={onUpgrade}
                        className="px-8 py-3.5 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        }}
                      >
                        Unlock {lockedSlidesCount} {lockedSlidesCount === 1 ? 'Slide' : 'Slides'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
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
            {isHalfBlurred && (() => {
              const lockedSlidesCount = slides.length - (halfBlurredSlideIndex || 0);
              return (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {/* Blur overlay covering 70% of the slide */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white/98" 
                    style={{ 
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      top: '30%'
                    }} 
                  />
                  {/* CTA Section */}
                  <div className="absolute bottom-0 left-0 right-0 h-[70%] flex flex-col items-center justify-center pointer-events-auto px-4">
                    <div className="text-center space-y-4 max-w-md">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50">
                        <Sparkles className="w-4 h-4" style={{ color: theme.colors.primary }} />
                        <span className="text-sm font-medium" style={{ color: theme.colors.primary }}>
                          {lockedSlidesCount} {lockedSlidesCount === 1 ? 'Slide' : 'Slides'} Locked
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold" style={{ color: theme.colors.heading }}>
                        Unlock Your Full Presentation
                      </h3>
                      <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                        Upgrade to access all {slides.length} slides and unlock premium features
                      </p>
                      <button
                        onClick={onUpgrade}
                        className="px-8 py-3.5 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                        }}
                      >
                        Unlock {lockedSlidesCount} {lockedSlidesCount === 1 ? 'Slide' : 'Slides'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
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
                subscriptionPlan={subscriptionPlan}
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
          subscriptionPlan={subscriptionPlan}
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
            {slides.length} slides • Created with PPT Master
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

  const slideLayout = slide.slideLayout;
  const layout = slide.layout as string | undefined;
  const isFullImageLayout = slideLayout === "image-full" || layout === "full-image";
  const isImageBackgroundLayout = slideLayout === "image-background" || layout === "image-background";
  const needsFixedAspectRatio = isFullImageLayout || isImageBackgroundLayout;

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

  if (needsFixedAspectRatio) {
    return (
      <div
        className={`w-full ${bgClass} relative`}
        style={{ aspectRatio: "16/9", ...bgStyle }}
      >
        {renderSlide(slide, index, true)}
      </div>
    );
  }

  return (
    <div
      className={`w-full ${bgClass} relative`}
      style={{ ...bgStyle }}
    >
      {renderSlide(slide, index, true)}
    </div>
  );
}
