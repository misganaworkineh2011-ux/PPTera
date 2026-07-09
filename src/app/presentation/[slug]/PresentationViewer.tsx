"use client";

import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronDown,
  Plus,
  Copy,
  Palette,
  Layers,
  Wand2,
  Image as ImageIcon,
  BarChart3,
  Video,
  Download,
  Share2,
  Play,
  FileText,
  History,
  ListTree,
  LayoutGrid,
} from "lucide-react";
import CommandPalette, { type Command } from "~/components/presentation/CommandPalette";
import { toast } from "sonner";
import {
  type SlideData,
  type PresentationData,
  type EditingState,
  type ContentLayoutType,
  type MasterSlideSettings,
} from "~/components/presentation/types";
import { type PresentationViewerProps } from "./types";
import { MasterSlideEditor } from "./components/MasterSlideEditor";
import { HistoryPanel } from "./components/HistoryPanel";
import { InsightsModal } from "./components/InsightsModal";
import { CommentsPanel } from "./components/CommentsPanel";
import { beautifyDeck } from "./utils/beautify";
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
  shouldShowUpgradeModal = false,
  isFreeUserLimited = false,
  freeSlideLimit,
  halfBlurredSlideIndex,
}: PresentationViewerProps) {
  const router = useRouter();
  const [showPricingModal, setShowPricingModal] = useState(shouldShowUpgradeModal);
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
  const [showMasterEditor, setShowMasterEditor] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [masterSlide, setMasterSlide] = useState<MasterSlideSettings | null>(
    presentation.content?.masterSlide ?? null,
  );
  const masterSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update master-slide settings optimistically and persist (debounced).
  const updateMasterSettings = (next: MasterSlideSettings | null) => {
    setMasterSlide(next);
    if (masterSaveTimeout.current) clearTimeout(masterSaveTimeout.current);
    masterSaveTimeout.current = setTimeout(() => {
      fetch(`/api/presentations/${presentation.id}/master-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterSlide: next }),
      }).catch((e) => console.error("Failed to save master settings:", e));
    }, 600);
  };

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
  // Embed modal state
  const [showEmbedModal, setShowEmbedModal] = useState<number | null>(null);
  // Command palette (⌘K / Ctrl+K)
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setShowCommandPalette((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // Animation picker modal state
  const [showAnimationPicker, setShowAnimationPicker] = useState<number | null>(null);
  // Public-view engagement beacon: report per-slide dwell time for analytics
  const dwellRef = useRef<{ idx: number; t: number } | null>(null);
  useEffect(() => {
    if (!isPublicView) return;
    const send = (idx: number, ms: number) => {
      if (ms < 500) return;
      try {
        navigator.sendBeacon(
          `/api/presentations/${presentation.id}/engagement`,
          new Blob([JSON.stringify({ slideIndex: idx, ms })], {
            type: "application/json",
          }),
        );
      } catch {
        // best-effort
      }
    };
    const prev = dwellRef.current;
    if (prev && prev.idx !== currentSlide) send(prev.idx, Date.now() - prev.t);
    dwellRef.current = { idx: currentSlide, t: Date.now() };
    const onHide = () => {
      const cur = dwellRef.current;
      if (cur) send(cur.idx, Date.now() - cur.t);
      dwellRef.current = null;
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [currentSlide, isPublicView, presentation.id]);
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
    const toastId = toast.loading("Exporting presentation... This might take a few minutes.");

    try {
      // Build query params
      const params = buildExportParams(format, currentSlide, options);

      const exportUrl = `/api/presentations/${presentation.id}/export?${params.toString()}`;
      console.log("[PresentationViewer] Fetching:", exportUrl);

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

      toast.success("Export complete!", { id: toastId });
      setShowExportModal(false);
    } catch (error) {
      console.error("[PresentationViewer] Export failed:", error);
      toast.error(error instanceof Error ? error.message : "Export failed", { id: toastId });
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const { goToSlide, nextSlide, prevSlide, revealCount } = useSlideNavigation({
    slidesLength: slides.length,
    currentSlide,
    isAnimating,
    setIsAnimating,
    setCurrentSlide,
    setIsShaking,
    isFreeUserLimited,
    halfBlurredSlideIndex,
    onUpgrade: () => setShowPricingModal(true),
    // Click-to-reveal builds run on every presenting surface (main Present
    // button = browser fullscreen, "in this tab", and the public view).
    slidesData,
    revealBuildsActive: isPresenting || isFullscreen || isPublicView,
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

  const handleCopySlide = async () => {};
  const handlePasteSlide = async () => {};

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
    changeCoverLayout,
    changeSlideAnimation,
    changeContentAnimation,
    changeAllSlidesAnimation,
    changeAllSlidesContentAnimation,
    changeItemAnimation,
    changeItemBuild,
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

    // An empty deck almost always means generation was interrupted before it
    // finished. The outline survives generation, so offer to resume from it.
    const sourceOutlineId = (presentation.content as Record<string, unknown> | undefined)
      ?.outlineId as string | undefined;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-[#06b6d4] opacity-70" />
          <p className="text-xl text-[#1e3a8a] font-medium">No slides found in this presentation.</p>
          {isOwner && sourceOutlineId && (
            <p className="mt-2 text-sm text-slate-500">
              It looks like generation was interrupted — you can resume from the saved outline.
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-3">
            {isOwner && sourceOutlineId && (
              <button
                onClick={() =>
                  router.push(`/createpresentation/outline/${sourceOutlineId}?mode=ai`)
                }
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:opacity-90 hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Resume generation
              </button>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className={
                isOwner && sourceOutlineId
                  ? "px-6 py-2.5 rounded-full border border-slate-300 text-slate-600 font-semibold transition-all hover:bg-slate-100"
                  : "px-6 py-2.5 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:opacity-90 hover:shadow-xl hover:scale-105 active:scale-95"
              }
            >
              Back to Dashboard
            </button>
          </div>
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
      revealCount={
        // Single-slide surfaces only. Fullscreen via the main Present button
        // keeps viewMode "scroll" while rendering the single-slide branch, so
        // gate on the same condition PresentationContentArea uses.
        viewMode === "slides" || isFullscreen || isPresenting
          ? revealCount
          : undefined
      }
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
      subscriptionPlan={subscriptionPlan}
      onUpgrade={() => setShowPricingModal(true)}
      masterSlide={masterSlide}
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
            subscriptionPlan={subscriptionPlan}
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
            onOpenTransitions={() => setShowAnimationPicker(-1)}
            onOpenMaster={() => setShowMasterEditor(true)}
            onOpenCommand={() => setShowCommandPalette(true)}
            onOpenAgent={() => setShowAgentPanel(true)}
            onOpenHistory={() => setShowHistoryPanel(true)}
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
          onActiveSlideChange={setCurrentSlide}
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
          onCopySlide={handleCopySlide}
          onPasteSlide={handlePasteSlide}
          onDeleteSlide={deleteSlide}
          onDuplicateSlide={duplicateSlide}
          onMoveSlide={moveSlide}
          onZoomChange={setPresentZoom}
          onShowNavbarInFullscreen={() => setShowNavbarInFullscreen(true)}
          onHideNavbarInFullscreen={() => setShowNavbarInFullscreen(false)}
          onShare={() => setShowShareModal(true)}
          subscriptionPlan={subscriptionPlan || undefined}
          isFreeUserLimited={isFreeUserLimited}
          freeSlideLimit={freeSlideLimit}
          halfBlurredSlideIndex={halfBlurredSlideIndex}
          onUpgrade={() => setShowPricingModal(true)}
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
          showEmbedModal={showEmbedModal}
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
          changeAllSlidesAnimation={changeAllSlidesAnimation}
          changeAllSlidesContentAnimation={changeAllSlidesContentAnimation}
          changeItemAnimation={changeItemAnimation}
          changeItemBuild={changeItemBuild}
          onExport={handleExport}
          onSetShowImageModal={setShowImageModal}
          onSetImageUrl={setImageUrl}
          onSetEditingImageIndex={setEditingImageIndex}
          onSetShowExportModal={setShowExportModal}
          onSetShowShareModal={setShowShareModal}
          onSetShowRateModal={setShowRateModal}
          onSetShowChartModal={setShowChartModal}
          onSetShowEmbedModal={setShowEmbedModal}
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
        onReplaceSlides={(newSlides) => {
          // Structural AI edits (add/delete/reorder) land as one undoable step
          updateSlidesWithSave(newSlides);
          setCurrentSlide((prev) => Math.min(prev, Math.max(0, newSlides.length - 1)));
        }}
        onSetEditingSlide={setAiEditingSlideIndex}
        onSelectContentLayout={(layoutId) => {
          if (activeSlideIndex !== null) {
            changeContentLayout(activeSlideIndex, layoutId as ContentLayoutType);
          }
        }}
        onSelectCoverLayout={(layoutId) => {
          if (activeSlideIndex !== null) {
            changeCoverLayout(activeSlideIndex, layoutId);
          }
        }}
        onClosePricingModal={() => setShowPricingModal(false)}
        onUpgrade={() => setShowPricingModal(true)}
      />

      <MasterSlideEditor
        isOpen={showMasterEditor}
        onClose={() => setShowMasterEditor(false)}
        settings={masterSlide}
        onChange={updateMasterSettings}
        theme={theme}
        presentationId={presentation.id}
      />

      <HistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        theme={theme}
        presentationId={presentation.id}
        onRestored={(restoredSlides, restoredTitle) => {
          updateSlidesWithSave(restoredSlides);
          presentation.title = restoredTitle;
          setEditedTitle(restoredTitle);
          setCurrentSlide(0);
          setShowHistoryPanel(false);
          toast.success("Version restored");
        }}
      />

      <InsightsModal
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
        theme={theme}
        presentationId={presentation.id}
        slides={slidesData}
      />

      <CommentsPanel
        isOpen={showCommentsPanel}
        onClose={() => setShowCommentsPanel(false)}
        theme={theme}
        presentationId={presentation.id}
        currentSlide={currentSlide}
        totalSlides={slidesData.length}
        onGoToSlide={(index) => goToSlide(index)}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        theme={theme}
        commands={[
          { id: "add-slide", label: "Add slide", group: "Slide", icon: <Plus size={15} />, keywords: "new", run: () => addSlideAt(currentSlide) },
          { id: "duplicate-slide", label: "Duplicate slide", group: "Slide", icon: <Copy size={15} />, run: () => duplicateSlide(currentSlide) },
          { id: "theme", label: "Change theme", group: "Design", icon: <Palette size={15} />, keywords: "color style", run: () => setShowThemeSidebar(true) },
          { id: "master", label: "Master slide — logo, footer, numbers", group: "Design", icon: <Layers size={15} />, keywords: "logo footer brand", run: () => setShowMasterEditor(true) },
          { id: "transitions", label: "Slide transitions", group: "Design", icon: <Wand2 size={15} />, keywords: "animation motion", run: () => setShowAnimationPicker(-1) },
          { id: "insert-image", label: "Insert image", group: "Insert", icon: <ImageIcon size={15} />, keywords: "photo picture upload", run: () => setShowImageModal(currentSlide) },
          { id: "insert-chart", label: "Insert chart", group: "Insert", icon: <BarChart3 size={15} />, keywords: "graph data", run: () => setShowChartModal(currentSlide) },
          { id: "insert-embed", label: "Embed video or web page", group: "Insert", icon: <Video size={15} />, keywords: "youtube vimeo loom figma iframe video", run: () => setShowEmbedModal(currentSlide) },
          { id: "ai", label: "Ask AI to edit", group: "AI", icon: <Sparkles size={15} />, keywords: "agent assistant rewrite add remove slide", run: () => setShowAgentPanel(true) },
          { id: "history", label: "Version history", group: "File", icon: <History size={15} />, keywords: "restore undo snapshot versions", run: () => setShowHistoryPanel(true) },
          ...((() => {
            const deckOutlineId = (presentation.content as Record<string, unknown> | undefined)
              ?.outlineId as string | undefined;
            return deckOutlineId
              ? [{
                  id: "edit-outline",
                  label: "Edit outline",
                  group: "File",
                  icon: <ListTree size={15} />,
                  keywords: "structure plan regenerate outline slides",
                  run: () => router.push(`/createpresentation/outline/${deckOutlineId}?mode=ai`),
                }]
              : [];
          })()),
          { id: "insights", label: "Viewer analytics", group: "File", icon: <BarChart3 size={15} />, keywords: "views engagement stats analytics insights", run: () => setShowInsightsModal(true) },
          { id: "comments", label: "Comments", group: "Collaborate", icon: <FileText size={15} />, keywords: "review feedback notes resolve", run: () => setShowCommentsPanel(true) },
          {
            id: "save-template",
            label: "Save as template",
            group: "File",
            icon: <Copy size={15} />,
            keywords: "template reuse skeleton structure",
            run: () => {
              const job = fetch("/api/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ presentationId: presentation.id }),
              }).then(async (res) => {
                if (!res.ok) throw new Error((await res.json()).error || "Failed");
              });
              toast.promise(job, {
                loading: "Saving deck structure as a template…",
                success: "Template saved — find it under Dashboard → Templates.",
                error: "Failed to save template.",
              });
            },
          },
          {
            id: "beautify",
            label: "Beautify deck (AI restyle layouts)",
            group: "AI",
            icon: <Wand2 size={15} />,
            keywords: "restyle redesign layouts polish premium",
            run: () => {
              const job = (async () => {
                // Snapshot first so beautify is always reversible from History
                await fetch(`/api/presentations/${presentation.id}/versions`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ label: "Before beautify" }),
                }).catch(() => {});
                const restyled = await beautifyDeck(slidesRef.current);
                updateSlidesWithSave(restyled);
              })();
              toast.promise(job, {
                loading: "Beautifying deck — re-selecting layouts…",
                success: "Deck restyled. Undo or restore from History if needed.",
                error: "Beautify failed — deck unchanged.",
              });
            },
          },
          { id: "cover-style", label: "Cover style", group: "Deck", icon: <LayoutGrid size={15} />, keywords: "title slide hero cover composition", run: () => { goToSlide(0); setActiveSlideIndex(0); setShowContentLayoutPanel(true); } },
          { id: "present", label: "Present", group: "Deck", icon: <Play size={15} />, keywords: "fullscreen slideshow play", run: () => router.push(`/present/${presentation.id}`) },
          { id: "export", label: "Export (PDF, PPTX, images)", group: "Deck", icon: <Download size={15} />, keywords: "download pdf pptx png", run: () => setShowExportModal(true) },
          { id: "share", label: "Share", group: "Deck", icon: <Share2 size={15} />, keywords: "link public publish", run: () => setShowShareModal(true) },
          ...slidesData.map((s, i): Command => ({
            id: `goto-${i}`,
            label: `Go to: ${s.title || `Slide ${i + 1}`}`,
            group: "Slides",
            hint: String(i + 1),
            icon: <FileText size={15} />,
            keywords: `slide ${i + 1}`,
            run: () => goToSlide(i),
          })),
        ]}
      />
    </>
  );
}
