"use client";

import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  type SlideData,
  type PresentationData,
  type EditingState,
  type ContentLayoutType,
} from "~/components/presentation/types";
import { type PresentationViewerProps } from "./types";
import {
  type ExportFormat,
  type ExportOptions,
  buildExportParams,
  getExportFilename,
  downloadBlob,
} from "./utils";
import {
  usePresentationStreaming,
  usePresenterChannel,
  usePresentationViewport,
  useRatePrompt,
  useSyncedTitle,
  usePresentationFeedback,
  useSlidesHistory,
  useCustomTheme,
  usePresentationKeyboard,
  useFullscreenControls,
  useSlideOperations,
  useAISlideGeneration,
  useSlideNavigation,
  type StreamingStatus,
} from "./hooks";

// Import extracted components
import {
  Header,
  PresentationSlide,
  PresentationModals,
  PresentationPanels,
  ExportIndicator,
  PresentationGlobalStyles,
  PresentationContentArea,
  getThemeType,
  getGoogleFontsUrl,
  getUIColors,
} from "./components";

export default function PresentationViewer({
  presentation,
  mode,
  isOwner,
  collaboratorRole,
  isPublicView = false,
  prefetchedCustomTheme,
  isStreaming = false,
  totalSlidesForStreaming = 0,
  subscriptionPlan,
}: PresentationViewerProps) {
  const router = useRouter();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(isPublicView);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showThemeSidebar, setShowThemeSidebar] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(presentation.title);
  const [showPageNumbers, setShowPageNumbers] = useState(false);

  useSyncedTitle({
    title: presentation.title,
    setEditedTitle,
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<
    "pdf" | "pptx" | "images" | null
  >(null);
  const [showRateModal, setShowRateModal] = useState(false);

  const { showFeedback, setShowFeedback } = usePresentationFeedback({
    mode,
    presentationId: presentation.id,
  });

  // Initialize based on screen size
  const [showThumbnails, setShowThumbnails] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );
  const [viewMode, setViewMode] = useState<"slides" | "scroll">(
    typeof window !== "undefined" && window.innerWidth < 768
      ? "scroll"
      : "scroll",
  );

  // Streaming state
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>(
    isStreaming ? "loading" : "idle"
  );
  const [streamingSlideIndex, setStreamingSlideIndex] = useState(-1);
  const [imagesLoading, setImagesLoading] = useState<Set<number>>(new Set());
  const [imageLoadedStates, setImageLoadedStates] = useState<Record<number, boolean>>({});

  useRatePrompt({
    isOwner,
    isPublicView,
    setShowRateModal,
  });

  usePresentationViewport({
    setIsMobile,
    setViewMode,
    setShowThumbnails,
  });

  const canEdit = isOwner || collaboratorRole === "editor";

  const {
    slidesData,
    setSlidesData,
    slidesRef,
    isSaving,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    undo,
    redo,
    updateSlidesWithSave,
  } = useSlidesHistory({
    initialSlides: presentation.slides,
    presentationId: presentation.id,
    isOwner,
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  // Track the last hovered slide for the AI agent panel
  const [lastHoveredSlideIndex, setLastHoveredSlideIndex] = useState<number>(0);
  const [showContentLayoutPanel, setShowContentLayoutPanel] = useState(false);
  const [editingText, setEditingText] = useState<EditingState | null>(null);
  const [showImageModal, setShowImageModal] = useState<number | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  // Chart modal state
  const [showChartModal, setShowChartModal] = useState<number | null>(null);
  // Animation picker modal state
  const [showAnimationPicker, setShowAnimationPicker] = useState<number | null>(null);
  // AI editing state - tracks which slide is being edited by AI
  const [aiEditingSlideIndex, setAiEditingSlideIndex] = useState<number | null>(null);
  // In-tab presentation mode (not fullscreen, but focused view)
  const [isPresenting, setIsPresenting] = useState(false);
  // Store previous thumbnail state before entering in-tab present mode
  const [prevThumbnailState, setPrevThumbnailState] = useState(true);
  // Navbar visibility in presentation mode (show on hover)
  const [showNavbarInPresent, setShowNavbarInPresent] = useState(false);
  // Navbar visibility in fullscreen mode (show on hover)
  const [showNavbarInFullscreen, setShowNavbarInFullscreen] = useState(false);
  // Presentation mode zoom level (percentage)
  const [presentZoom, setPresentZoom] = useState(100);
  // Spotlight mode for presentation - highlights content one by one
  const [isSpotlightActive, setIsSpotlightActive] = useState(false);
  const [spotlightContentIndex, setSpotlightContentIndex] = useState(0); // Which content element is highlighted
  // WYSIWYG Image Editor state
  const [showImageEditor, setShowImageEditor] = useState<{ slideIndex: number; imageIndex: number } | null>(null);

  const [presenterViewConnected, setPresenterViewConnected] = useState(false);

  usePresentationStreaming({
    presentationId: presentation.id,
    isStreaming,
    streamingStatus,
    setStreamingStatus,
    setSlidesData,
    setStreamingSlideIndex,
    setImagesLoading,
  });

  usePresenterChannel({
    presentationId: presentation.id,
    slidesRef,
    setPresenterViewConnected,
    setIsPresenting,
    setViewMode,
    setShowThumbnails,
    setCurrentSlide,
  });

  const slides = slidesData;
  const { content } = presentation;

  const {
    currentThemeId,
    isLoadingTheme,
    handleThemeChange,
    theme,
  } = useCustomTheme({
    contentTheme: content.theme,
    prefetchedCustomTheme,
  });
  const fontsUrl = getGoogleFontsUrl(theme);
  const handleSaveTitle = async () => {
    if (editedTitle.trim() === "" || editedTitle === presentation.title) {
      setEditedTitle(presentation.title);
      setIsEditingTitle(false);
      return;
    }
    try {
      const response = await fetch(`/api/presentations/${presentation.id}/rename`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editedTitle.trim() }),
      });
      if (response.ok) {
        presentation.title = editedTitle.trim();
        setIsEditingTitle(false);
      } else {
        setEditedTitle(presentation.title);
      }
    } catch {
      setEditedTitle(presentation.title);
    }
  };

  const handleExport = async (
    format: ExportFormat,
    options?: ExportOptions,
  ) => {
    console.log("[PresentationViewer] Starting export via fetch:", format);
    setIsExporting(true);
    setExportingFormat(format);

    try {
      // Build query params
      const params = buildExportParams(format, currentSlide, options);

      const exportUrl = `/api/presentations/${presentation.id}/export?${params.toString()}`;
      console.log("[PresentationViewer] Fetching:", exportUrl);

      toast.info("Preparing export...");

      // Fetch the file as blob
      const response = await fetch(exportUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed with status ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = getExportFilename(presentation.title, format, contentDisposition);

      // Create download link and trigger download
      downloadBlob(blob, filename);

      toast.success("Export complete!");
      setShowExportModal(false);
    } catch (error) {
      console.error("[PresentationViewer] Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const { goToSlide, nextSlide, prevSlide } = useSlideNavigation({
    slidesLength: slides.length,
    currentSlide,
    isAnimating,
    setIsAnimating,
    setCurrentSlide,
    setIsShaking,
  });

  // Update lastHoveredSlideIndex when a slide is hovered
  useEffect(() => {
    if (activeSlideIndex !== null) {
      setLastHoveredSlideIndex(activeSlideIndex);
    }
  }, [activeSlideIndex]);

  const { toggleFullscreen } = useFullscreenControls({
    showThumbnails,
    setShowThumbnails,
    setIsFullscreen,
  });

  usePresentationKeyboard({
    nextSlide,
    prevSlide,
    toggleFullscreen,
    undo,
    redo,
    slidesRef,
    currentSlide,
    isFullscreen,
    isPresenting,
    editingText,
    prevThumbnailState,
    isSpotlightActive,
    spotlightContentIndex,
    setSpotlightContentIndex,
    setIsShaking,
    setIsPresenting,
    setViewMode,
    setShowThumbnails,
    setPresentZoom,
    setIsSpotlightActive,
    setEditingText,
  });


  const {
    updateSlideContent,
    changeContentLayout,
    changeSlideAnimation,
    changeContentAnimation,
    duplicateSlide,
    addSlideAt,
    deleteSlide,
    moveSlide,
    addBulletPoint,
    deleteBulletPoint,
    deleteTitle,
    deleteSubtitle,
    reorderContent,
    startEditing,
    getSlideImages,
    addSlideImage,
    updateSlideImage,
    removeSlideImage,
    reorderSlideImages,
    changeImageShape,
    changeImagePosition,
    openImageModal,
  } = useSlideOperations({
    slidesData,
    currentSlide,
    updateSlidesWithSave,
    setCurrentSlide,
    setEditingText,
    setShowImageModal,
    setImageUrl,
    setEditingImageIndex,
  });

  const { handleAddAISlide } = useAISlideGeneration({
    slidesData,
    updateSlidesWithSave,
    setCurrentSlide,
    presentationTitle: presentation.title,
  });

  const currentSlideData = slides[currentSlide];

  // Show app's standard loading during initial streaming setup
  if (streamingStatus === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentSlideData) {
    // During streaming, show loading if we don't have slides yet
    if (streamingStatus === "streaming" && slides.length === 0) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-600">Generating slides...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-[#06b6d4] opacity-70" />
          <p className="text-xl text-[#1e3a8a] font-medium">No slides found in this presentation.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:opacity-90 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderSlide = (slide: SlideData, index: number, isMain: boolean = false, spotlightIndex?: number) => (
    <PresentationSlide
      slide={slide}
      index={index}
      isMain={isMain}
      spotlightIndex={spotlightIndex}
      theme={theme}
      slidesLength={slides.length}
      slidesData={slidesData}
      canEdit={canEdit}
      isFullscreen={isFullscreen}
      isPublicView={isPublicView}
      isPresenting={isPresenting}
      showPageNumbers={showPageNumbers}
      showContentLayoutPanel={showContentLayoutPanel}
      streamingStatus={streamingStatus}
      streamingSlideIndex={streamingSlideIndex}
      activeSlideIndex={activeSlideIndex}
      editingText={editingText}
      aiEditingSlideIndex={aiEditingSlideIndex}
      imagesLoading={imagesLoading}
      imageLoadedStates={imageLoadedStates}
      setImageLoadedStates={setImageLoadedStates}
      setActiveSlideIndex={setActiveSlideIndex}
      setShowContentLayoutPanel={setShowContentLayoutPanel}
      setShowImageModal={setShowImageModal}
      setEditingImageIndex={setEditingImageIndex}
      setImageUrl={setImageUrl}
      setShowChartModal={setShowChartModal}
      setShowAnimationPicker={setShowAnimationPicker}
      setAiEditingSlideIndex={setAiEditingSlideIndex}
      setEditingText={setEditingText}
      updateSlidesWithSave={updateSlidesWithSave}
      getSlideImages={getSlideImages}
      changeContentLayout={changeContentLayout}
      updateSlideContent={updateSlideContent}
      startEditing={startEditing}
      addBulletPoint={addBulletPoint}
      deleteBulletPoint={deleteBulletPoint}
      deleteTitle={deleteTitle}
      deleteSubtitle={deleteSubtitle}
      reorderContent={reorderContent}
      openImageModal={openImageModal}
      removeSlideImage={removeSlideImage}
      changeImageShape={changeImageShape}
      changeImagePosition={changeImagePosition}
      reorderSlideImages={reorderSlideImages}
      duplicateSlide={duplicateSlide}
      addSlideAt={addSlideAt}
      moveSlide={moveSlide}
      deleteSlide={deleteSlide}
    />
  );

  return (
    <>
      <PresentationGlobalStyles fontsUrl={fontsUrl} />

      <ExportIndicator isExporting={isExporting} exportingFormat={exportingFormat} />

      <div
        className={`h-screen overflow-hidden flex flex-col ${theme.pageBackground ? "" : getUIColors(getThemeType(theme)).pageBg}`}
        style={{
          ...(theme.backgroundImage ? {
            backgroundImage: `url(${theme.backgroundImage})`,
            backgroundSize: theme.backgroundSize || "cover",
            backgroundPosition: theme.backgroundPosition || "center",
          } : theme.pageBackgroundGradient ? { 
            background: theme.pageBackgroundGradient,
            backgroundColor: theme.pageBackground || theme.colors.background,
          } : theme.pageBackground ? { 
            background: theme.pageBackground,
          } : {}),
        }}
      >
        {/* Navbar hover zone for presentation mode */}
        {isPresenting && !showNavbarInPresent && (
          <div 
            className="fixed top-0 left-0 right-0 h-4 z-50"
            onMouseEnter={() => setShowNavbarInPresent(true)}
          />
        )}

        {!isFullscreen && !isPublicView && (!isPresenting || showNavbarInPresent) && (
          <div 
            className={`${isPresenting ? "fixed top-0 left-0 right-0 z-50 transition-transform duration-300" : "sticky top-0 z-40"}`}
            onMouseLeave={() => isPresenting && setShowNavbarInPresent(false)}
          >
          <Header
            title={editedTitle || presentation.title}
            editedTitle={editedTitle}
            isEditingTitle={isEditingTitle}
            slidesCount={slides.length}
            mode={mode}
            viewMode={viewMode}
            showThumbnails={showThumbnails}
            showPageNumbers={showPageNumbers}
            isOwner={isOwner}
            theme={theme}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            isMobile={isMobile}
            canUndo={canUndo}
            canRedo={canRedo}
            isPresenting={isPresenting}
            presenterViewConnected={presenterViewConnected}
            presentZoom={presentZoom}
            isSpotlightActive={isSpotlightActive}
            currentSlide={currentSlide}
            onBack={() => router.push("/dashboard")}
            onEditTitle={() => setIsEditingTitle(true)}
            onTitleChange={setEditedTitle}
            onSaveTitle={handleSaveTitle}
            onCancelEditTitle={() => { setEditedTitle(presentation.title); setIsEditingTitle(false); }}
            onToggleViewMode={() => { if (!isMobile) { setViewMode(viewMode === "slides" ? "scroll" : "slides"); if (viewMode === "scroll") setShowThumbnails(true); } }}
            onToggleThumbnails={() => { if (!isMobile) setShowThumbnails(!showThumbnails); }}
            onTogglePageNumbers={() => setShowPageNumbers(!showPageNumbers)}
            onExport={() => setShowExportModal(true)}
            onShare={() => setShowShareModal(true)}
            onPresent={() => {
              // Main Present button triggers fullscreen
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {
                  // Fullscreen blocked - just enter presentation mode without fullscreen
                  console.log("Fullscreen not available, entering presentation mode");
                });
              }
            }}
            onExitPresent={() => {
              setIsPresenting(false);
              setViewMode("scroll");
              // Restore previous thumbnail state
              setShowThumbnails(prevThumbnailState);
              // Reset presentation mode states
              setPresentZoom(100);
              setIsSpotlightActive(false);
            }}
            onPresentFullscreen={() => {
              // "In this tab" option - switch to slides view and hide thumbnails
              setPrevThumbnailState(showThumbnails); // Store current state before hiding
              setIsPresenting(true);
              setViewMode("slides");
              setShowThumbnails(false);
            }}
            onPresentWithNotes={() => {
              // Enter tab view mode first, then open presenter view
              setPrevThumbnailState(showThumbnails);
              setIsPresenting(true);
              setViewMode("slides");
              setShowThumbnails(false);
              // Open presenter view in new window
              window.open(`/present/${presentation.id}`, "_blank", "width=1200,height=800");
            }}
            onShareFollowLink={() => setShowShareModal(true)}
            onUndo={undo}
            onRedo={redo}
            onOpenThemes={() => setShowThemeSidebar(true)}
            onOpenAgent={() => setShowAgentPanel(true)}
            onZoomChange={setPresentZoom}
            onSpotlightToggle={() => {
              setIsSpotlightActive(prev => {
                if (!prev) setSpotlightContentIndex(0);
                return !prev;
              });
            }}
            onUpgrade={() => setShowPricingModal(true)}
          />
          </div>
        )}

        <PresentationContentArea
          theme={theme}
          presentationId={presentation.id}
          presentationTitle={presentation.title}
          slides={slides}
          currentSlide={currentSlide}
          currentSlideData={currentSlideData}
          viewMode={viewMode}
          showThumbnails={showThumbnails}
          showContentLayoutPanel={showContentLayoutPanel}
          showFeedback={showFeedback}
          isFullscreen={isFullscreen}
          isPublicView={isPublicView}
          isPresenting={isPresenting}
          isMobile={isMobile}
          isShaking={isShaking}
          presentZoom={presentZoom}
          isSpotlightActive={isSpotlightActive}
          spotlightContentIndex={spotlightContentIndex}
          showNavbarInFullscreen={showNavbarInFullscreen}
          canEdit={canEdit}
          streamingStatus={streamingStatus}
          streamingSlideIndex={streamingSlideIndex}
          aiEditingSlideIndex={aiEditingSlideIndex}
          renderSlide={renderSlide}
          onAddSlideAt={addSlideAt}
          onAddAISlide={handleAddAISlide}
          onGoToSlide={goToSlide}
          onPrevSlide={prevSlide}
          onNextSlide={nextSlide}
          onCloseThumbnails={() => setShowThumbnails(false)}
          onToggleViewMode={() =>
            setViewMode(viewMode === "slides" ? "scroll" : "slides")
          }
          onToggleFullscreen={toggleFullscreen}
          onToggleSpotlight={() => {
            setIsSpotlightActive((prev) => {
              if (!prev) setSpotlightContentIndex(0);
              return !prev;
            });
          }}
          onZoomChange={setPresentZoom}
          onShowNavbarInFullscreen={() => setShowNavbarInFullscreen(true)}
          onHideNavbarInFullscreen={() => setShowNavbarInFullscreen(false)}
          onShare={() => setShowShareModal(true)}
        />

        <PresentationModals
          slidesData={slidesData}
          theme={theme}
          presentationId={presentation.id}
          initialIsPublic={presentation.isPublic}
          initialShareToken={presentation.shareToken}
          subscriptionPlan={subscriptionPlan}
          currentSlide={currentSlide}
          isOwner={isOwner}
          showImageModal={showImageModal}
          imageUrl={imageUrl}
          editingImageIndex={editingImageIndex}
          isLoadingImage={isLoadingImage}
          showExportModal={showExportModal}
          showShareModal={showShareModal}
          showRateModal={showRateModal}
          showChartModal={showChartModal}
          showAnimationPicker={showAnimationPicker}
          showImageEditor={canEdit ? showImageEditor : null}
          getSlideImages={getSlideImages}
          addSlideImage={addSlideImage}
          updateSlideImage={updateSlideImage}
          removeSlideImage={removeSlideImage}
          reorderSlideImages={reorderSlideImages}
          updateSlidesWithSave={updateSlidesWithSave}
          changeSlideAnimation={changeSlideAnimation}
          changeContentAnimation={changeContentAnimation}
          onExport={handleExport}
          onSetShowImageModal={setShowImageModal}
          onSetImageUrl={setImageUrl}
          onSetEditingImageIndex={setEditingImageIndex}
          onSetShowExportModal={setShowExportModal}
          onSetShowShareModal={setShowShareModal}
          onSetShowRateModal={setShowRateModal}
          onSetShowChartModal={setShowChartModal}
          onSetShowAnimationPicker={setShowAnimationPicker}
          onSetShowImageEditor={setShowImageEditor}
          onSetShowImageModalAndEditor={(slideIndex, imageIndex) => {
            setShowImageEditor({ slideIndex, imageIndex });
          }}
          onUpgrade={() => setShowPricingModal(true)}
          isExporting={isExporting}
        />

      </div>
      <PresentationPanels
        theme={theme}
        currentThemeId={currentThemeId}
        presentationId={presentation.id}
        presentationTitle={presentation.title}
        subscriptionPlan={subscriptionPlan}
        slidesData={slidesData}
        activeSlideIndex={activeSlideIndex}
        showContentLayoutPanel={showContentLayoutPanel}
        showThemeSidebar={showThemeSidebar}
        showAgentPanel={showAgentPanel}
        showPricingModal={showPricingModal}
        lastHoveredSlideIndex={lastHoveredSlideIndex}
        onThemeChange={handleThemeChange}
        onCloseThemeSidebar={() => setShowThemeSidebar(false)}
        onCloseAgentPanel={() => setShowAgentPanel(false)}
        onCloseContentLayoutPanel={() => setShowContentLayoutPanel(false)}
        onUpdateSlide={(index, slide) => {
          const newSlides = [...slidesRef.current];
          newSlides[index] = slide;
          updateSlidesWithSave(newSlides);
        }}
        onSetEditingSlide={setAiEditingSlideIndex}
        onSelectContentLayout={(layoutId) => {
          if (activeSlideIndex !== null) {
            changeContentLayout(activeSlideIndex, layoutId as ContentLayoutType);
          }
        }}
        onClosePricingModal={() => setShowPricingModal(false)}
      />
    </>
  );
}
