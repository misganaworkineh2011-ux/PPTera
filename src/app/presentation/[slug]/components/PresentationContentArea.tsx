"use client";

import type { ReactNode } from "react";
import AnimatedSlide from "~/components/presentation/AnimatedSlide";
import { CONTENT_LAYOUT_PANEL_WIDTH } from "~/components/presentation/ContentLayoutPanel";
import FeedbackSection from "~/components/presentation/FeedbackSection";
import type { SlideData } from "~/components/presentation/types";
import type { Theme } from "~/lib/themes";
import type { StreamingStatus } from "../hooks";
import { NavigationControls } from "./NavigationControls";
import { ThumbnailSidebar } from "./ThumbnailSidebar";
import { ScrollableSlidesView } from "./ScrollableSlidesView";
import { PublicViewControls, FullscreenNavbar } from "./PresentationViewControls";
import { getThemeType } from "./types";
import { getUIColors } from "./ui-colors";

interface PresentationContentAreaProps {
  theme: Theme;
  presentationId: string;
  presentationTitle: string;
  slides: SlideData[];
  currentSlide: number;
  currentSlideData: SlideData;
  viewMode: "slides" | "scroll";
  showThumbnails: boolean;
  showContentLayoutPanel: boolean;
  showFeedback: boolean;
  isFullscreen: boolean;
  isPublicView: boolean;
  isPresenting: boolean;
  isMobile: boolean;
  isShaking: boolean;
  presentZoom: number;
  isSpotlightActive: boolean;
  spotlightContentIndex: number;
  showNavbarInFullscreen: boolean;
  canEdit: boolean;
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
  onGoToSlide: (index: number) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onCloseThumbnails: () => void;
  onToggleViewMode: () => void;
  onToggleFullscreen: () => void;
  onToggleSpotlight: () => void;
  onZoomChange: (zoom: number) => void;
  onShowNavbarInFullscreen: () => void;
  onHideNavbarInFullscreen: () => void;
  onShare: () => void;
  onCopySlide: (index: number) => void;
  onPasteSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onUpgrade?: () => void;
  subscriptionPlan?: string;
  isFreeUserLimited?: boolean;
  freeSlideLimit?: number;
  halfBlurredSlideIndex?: number | null;
}

export function PresentationContentArea({
  theme,
  presentationId,
  presentationTitle,
  slides,
  currentSlide,
  currentSlideData,
  viewMode,
  showThumbnails,
  showContentLayoutPanel,
  showFeedback,
  isFullscreen,
  isPublicView,
  isPresenting,
  isMobile,
  isShaking,
  presentZoom,
  isSpotlightActive,
  spotlightContentIndex,
  showNavbarInFullscreen,
  canEdit,
  streamingStatus,
  streamingSlideIndex,
  aiEditingSlideIndex,
  renderSlide,
  onAddSlideAt,
  onAddAISlide,
  onGoToSlide,
  onPrevSlide,
  onNextSlide,
  onCloseThumbnails,
  onToggleViewMode,
  onToggleFullscreen,
  onToggleSpotlight,
  onZoomChange,
  onShowNavbarInFullscreen,
  onHideNavbarInFullscreen,
  onShare,
  onCopySlide,
  onPasteSlide,
  onDeleteSlide,
  onUpgrade,
  subscriptionPlan,
  isFreeUserLimited,
  freeSlideLimit,
  halfBlurredSlideIndex
}: PresentationContentAreaProps) {
  const ui = getUIColors(getThemeType(theme));

  return (
    <>
      <div
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{
          ...(showContentLayoutPanel ? { marginRight: `${CONTENT_LAYOUT_PANEL_WIDTH}px` } : {}),
          ...(showThumbnails && !isPublicView && !isMobile && !isFullscreen && !isPresenting
            ? { marginLeft: "176px" }
            : {}),
          ...(!theme.backgroundImage && theme.pageBackground
            ? { background: theme.pageBackground }
            : {}),
        }}
      >
        {viewMode === "scroll" && !isFullscreen ? (
          <>
            <div
              className={`px-0 sm:px-2 md:px-4 py-4 sm:py-8 max-w-full ${showContentLayoutPanel ? "pb-20" : ""}`}
            >
              {showThumbnails && !isPublicView && !isMobile && (
                <ThumbnailSidebar
                  slides={slides}
                  currentSlide={currentSlide}
                  onSlideClick={(index) =>
                    document
                      .getElementById(`slide-${index}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                  onClose={onCloseThumbnails}
                  renderSlide={renderSlide}
                  theme={theme}
                />
              )}
              <div className="mx-auto" style={{ maxWidth: "1300px" }}>
                <ScrollableSlidesView
                  slides={slides}
                  canEdit={canEdit}
                  isPublicView={isPublicView}
                  isMobile={isMobile}
                  theme={theme}
                  streamingStatus={streamingStatus}
                  streamingSlideIndex={streamingSlideIndex}
                  aiEditingSlideIndex={aiEditingSlideIndex}
                  renderSlide={renderSlide}
                  onAddSlideAt={onAddSlideAt}
                  onAddAISlide={onAddAISlide}
                  presentationTitle={presentationTitle}
                />
              </div>
            </div>
            {showFeedback && (
              <div className="w-full">
                <FeedbackSection presentationId={presentationId} theme={theme} />
              </div>
            )}
          </>
        ) : (
          <div
            className={`${isFullscreen || isPresenting ? "" : "px-0 sm:px-2 md:px-4 py-4 sm:py-8"} max-w-full ${showContentLayoutPanel ? "pb-20" : ""}`}
          >
            <div
              className={`flex gap-6 ${isFullscreen || isPublicView || isPresenting ? "h-screen w-screen" : "mx-auto"} overflow-x-hidden`}
              style={!isFullscreen && !isPublicView && !isPresenting ? { maxWidth: "1800px" } : {}}
            >
              {showThumbnails && !isFullscreen && !isPublicView && !isPresenting && viewMode === "slides" && (
                <ThumbnailSidebar
                  slides={slides}
                  currentSlide={currentSlide}
                  onSlideClick={onGoToSlide}
                  onClose={onCloseThumbnails}
                  renderSlide={renderSlide}
                  theme={theme}
                />
              )}

              <div
                className={`flex-1 flex flex-col ${isFullscreen || isPresenting ? "h-full justify-center items-center w-full" : ""} max-w-full overflow-hidden`}
              >
                {(() => {
                  const isTitle = currentSlideData.type === "title";
                  const bulletCount = currentSlideData.bulletPoints?.length || 0;
                  const useFixedRatio =
                    isFullscreen || isPresenting || isTitle || bulletCount <= 3;
                  const dynamicHeight = Math.max(450, 380 + bulletCount * 65);

                  if (useFixedRatio) {
                    return (
                      <div
                        className={`relative overflow-hidden ${isFullscreen || isPresenting ? "w-screen h-screen flex items-center justify-center" : `w-full rounded-lg shadow-2xl ring-1 ${ui.ring}`} ${isShaking ? "animate-shake" : ""}`}
                        style={{
                          ...(!isFullscreen && !isPresenting
                            ? { aspectRatio: "16/9", maxHeight: "calc(100vh - 200px)" }
                            : {}),
                        }}
                      >
                        <AnimatedSlide
                          slideKey={currentSlide}
                          animationId={currentSlideData.animation}
                          isPresenting={isFullscreen || isPresenting || isPublicView}
                        >
                          <div
                            className="w-full h-full"
                            style={{
                              ...((isFullscreen || isPresenting) && presentZoom !== 100
                                ? {
                                    zoom: presentZoom / 100,
                                    transition: "zoom 0.3s ease",
                                  }
                                : {}),
                            }}
                          >
                            {renderSlide(
                              currentSlideData,
                              currentSlide,
                              true,
                              (isFullscreen || isPresenting) && isSpotlightActive
                                ? spotlightContentIndex
                                : undefined,
                            )}
                          </div>
                        </AnimatedSlide>
                      </div>
                    );
                  }

                  return (
                    <div
                      className={`relative overflow-hidden w-full rounded-lg shadow-2xl ring-1 ${ui.ring} ${isShaking ? "animate-shake" : ""}`}
                      style={{ height: 'auto', minHeight: '600px', aspectRatio: '16/9' }}
                    >
                      <AnimatedSlide
                        slideKey={currentSlide}
                        animationId={currentSlideData.animation}
                        isPresenting={isFullscreen || isPresenting || isPublicView}
                      >
                        <div className="w-full h-full">
                          {renderSlide(currentSlideData, currentSlide, true)}
                        </div>
                      </AnimatedSlide>
                    </div>
                  );
                })()}

                {!isPresenting && (
                  <NavigationControls
                    currentSlide={currentSlide}
                    totalSlides={slides.length}
                    isFullscreen={isFullscreen || isPublicView}
                    onPrev={onPrevSlide}
                    onNext={onNextSlide}
                    onGoTo={onGoToSlide}
                    theme={theme}
                  />
                )}

                {!isFullscreen && !isPublicView && !isPresenting && (
                  <div className={`mt-4 text-center text-xs sm:text-sm ${ui.endMuted}`}>
                    <span>
                      Slide {currentSlide + 1} of {slides.length}
                    </span>
                    <span className="hidden sm:inline ml-2 opacity-70">
                      • Press <kbd className={`px-1.5 py-0.5 rounded text-xs ${ui.kbd}`}>F</kbd> for fullscreen
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
      </div>

      {isPublicView && (
        <PublicViewControls
          isFullscreen={isFullscreen}
          viewMode={viewMode}
          theme={theme}
          onToggleViewMode={onToggleViewMode}
          onToggleFullscreen={onToggleFullscreen}
        />
      )}

      {isFullscreen && !isPublicView && (
        <FullscreenNavbar
          isVisible={showNavbarInFullscreen}
          theme={theme}
          currentSlide={currentSlide}
          totalSlides={slides.length}
          presentZoom={presentZoom}
          isSpotlightActive={isSpotlightActive}
          onShowNavbar={onShowNavbarInFullscreen}
          onHideNavbar={onHideNavbarInFullscreen}
          onZoomChange={onZoomChange}
          onToggleSpotlight={onToggleSpotlight}
          onShare={onShare}
          onExit={onToggleFullscreen}
        />
      )}

      {viewMode === "scroll" && !isFullscreen && !isPublicView && showFeedback && (
        <></>
      )}
    </>
  );
}
