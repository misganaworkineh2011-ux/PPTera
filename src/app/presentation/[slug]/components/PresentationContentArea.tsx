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
  onActiveSlideChange?: (index: number) => void;
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
  onDuplicateSlide: (index: number) => void;
  onMoveSlide: (index: number, direction: "up" | "down") => void;
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
  onActiveSlideChange,
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
  onDuplicateSlide,
  onMoveSlide,
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
                  onSlideClick={(index) => {
                    // Mark the clicked slide active (so the navigator highlight moves)
                    // and scroll it into view in the continuous view.
                    onGoToSlide(index);
                    document
                      .getElementById(`slide-${index}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  onClose={onCloseThumbnails}
                  renderSlide={renderSlide}
                  theme={theme}
                  onDuplicateSlide={onDuplicateSlide}
                  onMoveSlide={onMoveSlide}
                  onDeleteSlide={onDeleteSlide}
                  onAddSlideAfter={onAddSlideAt}
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
                  onActiveSlideChange={onActiveSlideChange}
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
                  onDuplicateSlide={onDuplicateSlide}
                  onMoveSlide={onMoveSlide}
                  onDeleteSlide={onDeleteSlide}
                  onAddSlideAfter={onAddSlideAt}
                />
              )}

              <div
                className={`flex-1 flex flex-col ${isFullscreen || isPresenting ? "h-full justify-center items-center w-full" : ""} max-w-full overflow-hidden`}
              >
                {(() => {
                  // Every slide renders into the SAME 16:9 canvas in every context:
                  // - Editor: a width-constrained 16:9 box.
                  // - Fullscreen/present: the same 16:9 box scaled to fit the screen and
                  //   centered with letterbox bars, so a 16:10 / ultrawide monitor never
                  //   stretches the slide. This keeps viewer and fullscreen proportions
                  //   identical and makes every slide exactly the same size.
                  const isImmersive = isFullscreen || isPresenting;

                  const slideBox = (
                    <div
                      className={`relative overflow-hidden aspect-video ${
                        isImmersive
                          ? "w-full max-h-screen max-w-[calc(100vh*16/9)]"
                          : `w-full rounded-lg shadow-2xl ring-1 ${ui.ring}`
                      } ${isShaking ? "animate-shake" : ""}`}
                      style={isImmersive ? {} : { maxHeight: "calc(100vh - 200px)" }}
                    >
                      <AnimatedSlide
                        slideKey={currentSlide}
                        animationId={currentSlideData.animation}
                        isPresenting={isFullscreen || isPresenting || isPublicView}
                      >
                        <div
                          className="w-full h-full"
                          style={{
                            ...(isImmersive && presentZoom !== 100
                              ? { zoom: presentZoom / 100, transition: "zoom 0.3s ease" }
                              : {}),
                          }}
                        >
                          {renderSlide(
                            currentSlideData,
                            currentSlide,
                            true,
                            isImmersive && isSpotlightActive
                              ? spotlightContentIndex
                              : undefined,
                          )}
                        </div>
                      </AnimatedSlide>
                    </div>
                  );

                  if (isImmersive) {
                    // Center the 16:9 box on screen; black bars fill any leftover space.
                    return (
                      <div className="w-screen h-screen flex items-center justify-center bg-black">
                        {slideBox}
                      </div>
                    );
                  }
                  return slideBox;
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
