"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Minimize2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getThemeById, getDefaultTheme, type Theme, getSlideShapeStyles } from "~/lib/themes";
import { isCustomThemeId, getCustomThemeDbId, convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import { type LayoutType } from "~/lib/slide-layouts";
import { type SlideLayoutType, type ImageSize, type ImageShape } from "~/lib/layouts/slide";
import {
  type SlideData,
  type PresentationData,
  type EditingState,
} from "~/components/presentation/types";
import SlideRenderer from "~/components/presentation/SlideRenderer";
import LayoutModal from "~/components/presentation/LayoutModal";
import ContentLayoutPanel, { CONTENT_LAYOUT_PANEL_WIDTH, type ContentLayoutId } from "~/components/presentation/ContentLayoutPanel";
import ExportModal from "~/components/presentation/ExportModal";
import ShareModal from "~/components/presentation/ShareModal";
import FeedbackSection from "~/components/presentation/FeedbackSection";
import { RateUsModal, incrementPresentationCount, checkExistingReview } from "~/components/RateUsModal";
import { ImageEditor, type ImageBlock } from "~/lib/blocks";
import ChartModal from "~/components/charts/ChartModal";
import { type ChartData } from "~/lib/charts/types";

// Import extracted components
import {
  Header,
  NavigationControls,
  SlideMenu,
  ThumbnailSidebar,
  MultiImageModal,
  TitleSlide,
  ThemeSidebar,
  AgentPanel,
  SlideNoteButton,
  AddSlideButtons,
  getThemeType,
  getGoogleFontsUrl,
  getUIColors,
  type ThemeType,
} from "./components";

// Helper function to strip HTML tags from text
const stripHtml = (html: string): string => {
  if (!html) return "";
  // Create a temporary element to parse HTML and extract text
  if (typeof document !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }
  // Fallback for SSR: simple regex strip
  return html.replace(/<[^>]*>/g, "");
};

// Helper to get title slide text colors matching the TitleSlide component
const getTitleSlideColors = (themeType: ThemeType, hasImage: boolean): { title: string; subtitle: string } => {
  if (hasImage) {
    return { title: "#ffffff", subtitle: "#e2e8f0" };
  }

  const colorMap: Record<ThemeType, { title: string; subtitle: string }> = {
    dark: { title: "#fafafa", subtitle: "#a1a1aa" },
    light: { title: "#0f172a", subtitle: "#64748b" },
    sunset: { title: "#ffffff", subtitle: "#f9a8d4" },
    ocean: { title: "#ffffff", subtitle: "#7dd3fc" },
    aurora: { title: "#ffffff", subtitle: "#c4b5fd" },
    ember: { title: "#ffffff", subtitle: "#fca5a5" },
    midnight: { title: "#ffffff", subtitle: "#fda4af" },
    cyber: { title: "#ffffff", subtitle: "#67e8f9" },
    alien: { title: "#ffffff", subtitle: "#a3ff00" },
    corporate: { title: "#111827", subtitle: "#6b7280" },
    cosmic: { title: "#ffffff", subtitle: "#c4b5fd" },
    architectural: { title: "#ffffff", subtitle: "#a3a3a3" },
    anime: { title: "#ffffff", subtitle: "#d8b4fe" },
    hacker: { title: "#00ff41", subtitle: "#39ff14" },
    "custom-dark": { title: "#fafafa", subtitle: "#a1a1aa" },
    "custom-light": { title: "#0f172a", subtitle: "#64748b" },
  };

  return colorMap[themeType] || colorMap.dark;
};

interface CustomThemeData {
  id: string;
  name: string;
  colors: unknown;
  fonts: unknown;
  designElements: unknown;
}

interface PresentationViewerProps {
  presentation: PresentationData;
  mode: string;
  isOwner: boolean;
  collaboratorRole?: string;
  isPublicView?: boolean;
  /** OPTIMIZATION: Prefetched custom theme from SSR to avoid client-side fetch */
  prefetchedCustomTheme?: CustomThemeData | null;
  /** Enable streaming mode - content will be streamed from server */
  isStreaming?: boolean;
  /** Total slides expected when streaming */
  totalSlidesForStreaming?: number;
}

export default function PresentationViewer({
  presentation,
  mode,
  isOwner,
  collaboratorRole,
  isPublicView = false,
  prefetchedCustomTheme,
  isStreaming = false,
  totalSlidesForStreaming = 0,
}: PresentationViewerProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(isPublicView);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showThemeSidebar, setShowThemeSidebar] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(presentation.title);
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState(presentation.content.theme || "elegant-noir");

  // Sync title when presentation prop changes (e.g., after rename in dashboard)
  useEffect(() => {
    setEditedTitle(presentation.title);
  }, [presentation.title]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<
    "pdf" | "pptx" | "images" | null
  >(null);
  const [showRateModal, setShowRateModal] = useState(false);

  // Track if this is a fresh AI creation (show feedback only on first view after creation)
  const [showFeedback, setShowFeedback] = useState(() => {
    // Only show feedback if mode is 'ai' and we haven't seen this presentation before
    if (typeof window === "undefined") return false;
    if (mode !== "ai") return false;
    const seenKey = `ppt-seen-${presentation.id}`;
    const hasSeen = sessionStorage.getItem(seenKey);
    if (!hasSeen) {
      sessionStorage.setItem(seenKey, "true");
      return true;
    }
    return false;
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

  // Check for rate prompt on new presentation view
  useEffect(() => {
    // Only check for owners viewing their own presentations
    if (!isOwner || isPublicView) return;

    const checkRatePrompt = async () => {
      // First check if user already has a review
      const hasReview = await checkExistingReview();
      if (hasReview) return;

      // Increment count and check if we should show prompt
      const shouldShow = incrementPresentationCount();
      if (shouldShow) {
        // Small delay to let the presentation load first
        setTimeout(() => setShowRateModal(true), 2000);
      }
    };

    checkRatePrompt();
  }, [isOwner, isPublicView]);

  // Detect mobile and set view mode
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode("scroll");
        setShowThumbnails(false);
      }
      // On desktop, let user control thumbnail visibility - don't force it open
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []); // Remove showThumbnails from dependencies to prevent re-triggering

  const canEdit = isOwner || collaboratorRole === "editor";

  const [slidesData, setSlidesData] = useState<SlideData[]>(presentation.slides);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  // Track the last hovered slide for the AI agent panel
  const [lastHoveredSlideIndex, setLastHoveredSlideIndex] = useState<number>(0);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showContentLayoutPanel, setShowContentLayoutPanel] = useState(false);
  const [editingText, setEditingText] = useState<EditingState | null>(null);
  const [showImageModal, setShowImageModal] = useState<number | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // Chart modal state
  const [showChartModal, setShowChartModal] = useState<number | null>(null);
  // AI editing state - tracks which slide is being edited by AI
  const [aiEditingSlideIndex, setAiEditingSlideIndex] = useState<number | null>(null);
  // In-tab presentation mode (not fullscreen, but focused view)
  const [isPresenting, setIsPresenting] = useState(false);
  // Store previous thumbnail state before entering in-tab present mode
  const [prevThumbnailState, setPrevThumbnailState] = useState(true);
  // Navbar visibility in presentation mode (show on hover)
  const [showNavbarInPresent, setShowNavbarInPresent] = useState(false);
  // WYSIWYG Image Editor state
  const [showImageEditor, setShowImageEditor] = useState<{ slideIndex: number; imageIndex: number } | null>(null);
  const slidesRef = useRef<SlideData[]>(presentation.slides);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // BroadcastChannel for presenter view communication
  const presenterChannelRef = useRef<BroadcastChannel | null>(null);
  const [presenterViewConnected, setPresenterViewConnected] = useState(false);

  // Streaming state
  const [streamingStatus, setStreamingStatus] = useState<"idle" | "loading" | "streaming" | "complete">(
    isStreaming ? "loading" : "idle"
  );
  const [streamingSlideIndex, setStreamingSlideIndex] = useState(-1);
  const [imagesLoading, setImagesLoading] = useState<Set<number>>(new Set());
  const [imageLoadedStates, setImageLoadedStates] = useState<Record<number, boolean>>({});
  // Use ref for streaming text to avoid stale closure issues
  const streamingTextRef = useRef<Record<number, Record<string, string>>>({});
  // Track EventSource to prevent duplicates - use window to persist across re-renders
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to streaming endpoint when in streaming mode
  useEffect(() => {
    if (!isStreaming || streamingStatus !== "loading") return;

    // Check if there's already a global EventSource for this presentation
    const globalKey = `__streaming_${presentation.id}`;
    const existingEventSource = (window as unknown as Record<string, EventSource | undefined>)[globalKey];

    if (existingEventSource && existingEventSource.readyState !== EventSource.CLOSED) {
      console.log("[Streaming] Using existing global EventSource");
      eventSourceRef.current = existingEventSource;
      return;
    }

    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      console.log("[Streaming] Already have an active EventSource");
      return;
    }

    console.log("[Streaming] Creating new EventSource for presentation:", presentation.id);
    const eventSource = new EventSource(`/api/presentations/${presentation.id}/stream-content`);
    eventSourceRef.current = eventSource;
    // Store globally to persist across re-renders
    (window as unknown as Record<string, EventSource>)[globalKey] = eventSource;

    // Handle connection open
    eventSource.onopen = () => {
      console.log("[Streaming] Connection opened successfully");
    };

    eventSource.addEventListener("start", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received START event, total slides:", data.totalSlides);
      setStreamingStatus("streaming");
      // Start with EMPTY slides array - slides will be added progressively
      setSlidesData([]);
      streamingTextRef.current = {};
    });

    eventSource.addEventListener("slideStart", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received SLIDE_START event:", data.slideIndex, data.type, "hasImage:", data.hasImage);
      setStreamingSlideIndex(data.slideIndex);

      // ADD the new slide to the array (progressive creation)
      setSlidesData(prev => {
        console.log("[Streaming] Adding slide", data.slideIndex, "to slidesData, current length:", prev.length);
        const newSlides = [...prev];
        // Add the new slide at the correct index
        newSlides[data.slideIndex] = {
          type: data.type,
          title: "",
          bulletPoints: [],
          image: data.hasImage ? { url: "", alt: "Loading...", source: "placeholder" } : undefined,
        };
        return newSlides;
      });

      // Reset streaming text ref for this slide (including bullet index)
      streamingTextRef.current[data.slideIndex] = { "_currentBulletIndex": "0" };

      if (data.hasImage) {
        setImagesLoading(prev => new Set(prev).add(data.slideIndex));
      }
    });

    eventSource.addEventListener("char", (e) => {
      const data = JSON.parse(e.data);
      const { slideIndex, field, char } = data;

      // Update ref
      if (!streamingTextRef.current[slideIndex]) {
        streamingTextRef.current[slideIndex] = {};
      }

      // Handle bullet streaming separately (it's an array)
      if (field === "bullet") {
        // Get current bullet index from ref or start at 0
        const currentBulletKey = "_currentBulletIndex";
        const bulletIndex = parseInt(streamingTextRef.current[slideIndex]![currentBulletKey] ?? "0", 10);
        const bulletKey = `bullet_${bulletIndex}`;

        streamingTextRef.current[slideIndex]![bulletKey] =
          (streamingTextRef.current[slideIndex]![bulletKey] || "") + char;

        const currentBulletText = streamingTextRef.current[slideIndex]![bulletKey] || "";

        setSlidesData(prev => {
          const newSlides = [...prev];
          if (newSlides[slideIndex]) {
            const bullets = [...(newSlides[slideIndex]!.bulletPoints || [])];
            bullets[bulletIndex] = currentBulletText;
            newSlides[slideIndex] = {
              ...newSlides[slideIndex]!,
              bulletPoints: bullets,
            };
          }
          return newSlides;
        });
      } else {
        // Handle other fields (title, subtitle, etc.)
        streamingTextRef.current[slideIndex]![field] =
          (streamingTextRef.current[slideIndex]![field] || "") + char;

        const currentText = streamingTextRef.current[slideIndex]![field];
        setSlidesData(prev => {
          const newSlides = [...prev];
          if (newSlides[slideIndex]) {
            newSlides[slideIndex] = {
              ...newSlides[slideIndex]!,
              [field]: currentText,
            };
          }
          return newSlides;
        });
      }
    });

    eventSource.addEventListener("fieldComplete", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received FIELD_COMPLETE:", data.slideIndex, data.field, "value length:", data.value?.length);
      setSlidesData(prev => {
        const newSlides = [...prev];
        if (newSlides[data.slideIndex]) {
          newSlides[data.slideIndex] = {
            ...newSlides[data.slideIndex]!,
            [data.field]: data.value,
          };
        }
        return newSlides;
      });
    });

    eventSource.addEventListener("bulletComplete", (e) => {
      const data = JSON.parse(e.data);
      const { slideIndex, bulletIndex, value } = data;
      console.log("[Streaming] ✓ Received BULLET_COMPLETE:", slideIndex, "bullet", bulletIndex);

      // Update the current bullet index for the next bullet
      if (streamingTextRef.current[slideIndex]) {
        streamingTextRef.current[slideIndex]!["_currentBulletIndex"] = String(bulletIndex + 1);
      }

      setSlidesData(prev => {
        const newSlides = [...prev];
        if (newSlides[slideIndex]) {
          const bullets = [...(newSlides[slideIndex]!.bulletPoints || [])];
          bullets[bulletIndex] = value;
          newSlides[slideIndex] = {
            ...newSlides[slideIndex]!,
            bulletPoints: bullets,
          };
        }
        return newSlides;
      });
    });

    eventSource.addEventListener("imageReady", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received IMAGE_READY:", data.slideIndex, "url:", data.image?.url?.substring(0, 50));
      setSlidesData(prev => {
        const newSlides = [...prev];
        if (newSlides[data.slideIndex]) {
          newSlides[data.slideIndex] = {
            ...newSlides[data.slideIndex]!,
            image: data.image,
          };
        }
        return newSlides;
      });
      setImagesLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.slideIndex);
        return newSet;
      });
    });

    eventSource.addEventListener("slideComplete", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received SLIDE_COMPLETE:", data.slideIndex, "title:", data.slide?.title);
      setSlidesData(prev => {
        const newSlides = [...prev];
        const existingSlide = newSlides[data.slideIndex];
        // Preserve image that may have been set by earlier events
        newSlides[data.slideIndex] = {
          ...data.slide,
          image: data.slide.image?.url ? data.slide.image : existingSlide?.image,
        };
        console.log("[Streaming] Updated slidesData, new length:", newSlides.length);
        return newSlides;
      });
    });

    eventSource.addEventListener("complete", (e) => {
      const data = JSON.parse(e.data);
      console.log("[Streaming] ✓ Received COMPLETE event, slides:", data.slides?.length);
      // Merge server slides with any images that were already loaded on client
      setSlidesData(prev => {
        return data.slides.map((serverSlide: SlideData, index: number) => {
          const clientSlide = prev[index];
          return {
            ...serverSlide,
            // Prefer server image if it has a URL, otherwise keep client image
            image: serverSlide.image?.url ? serverSlide.image : clientSlide?.image,
          };
        });
      });
      setStreamingStatus("complete");
      setStreamingSlideIndex(-1);
      // Remove streaming param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("streaming");
      window.history.replaceState({}, "", url.toString());
      // Clean up EventSource and global reference
      eventSource.close();
      eventSourceRef.current = null;
      const globalKey = `__streaming_${presentation.id}`;
      delete (window as unknown as Record<string, unknown>)[globalKey];
    });

    // Handle server-sent error events
    eventSource.addEventListener("error", (e: Event) => {
      console.error("[Streaming] ✗ Error event received:", e);
      // Check if this is a MessageEvent (server-sent error) or a connection error
      if (e instanceof MessageEvent) {
        try {
          const data = JSON.parse(e.data);
          console.error("[Streaming] Server error:", data.message);
          toast.error(data.message || "Streaming error occurred");
        } catch {
          console.error("[Streaming] Error parsing error event");
        }
        // Only close on server-sent errors, not connection errors
        setStreamingStatus("complete");
        eventSource.close();
        eventSourceRef.current = null;
        const globalKey = `__streaming_${presentation.id}`;
        delete (window as unknown as Record<string, unknown>)[globalKey];
      } else {
        // Connection error - might be temporary, don't close immediately
        console.error("[Streaming] EventSource connection error:", e);
        if (eventSource.readyState === EventSource.CLOSED) {
          console.error("[Streaming] Connection was closed by server/network");
          setStreamingStatus("complete");
          eventSourceRef.current = null;
          const globalKey = `__streaming_${presentation.id}`;
          delete (window as unknown as Record<string, unknown>)[globalKey];
        }
      }
    });

    // Also listen for the generic "message" event in case server sends non-typed events
    eventSource.onmessage = (e) => {
      console.log("[Streaming] Generic message:", e.data);
    };

    // Note: We intentionally don't close the EventSource in cleanup
    // because React StrictMode will unmount/remount and we want to keep the connection alive.
    // The EventSource will be closed when:
    // 1. The "complete" event is received
    // 2. An error occurs
    // 3. The user navigates away (browser handles this)
    return () => {
      // Don't close the EventSource here - let it continue streaming
      // It will be closed when complete or error events are received
      console.log("[Streaming] Cleanup called, but keeping EventSource alive (global)");
    };
  }, [isStreaming, streamingStatus, presentation.id]);

  // Cleanup EventSource when component truly unmounts (navigation away)
  useEffect(() => {
    const presentationId = presentation.id;
    return () => {
      console.log("[Streaming] Component unmounting, cleaning up");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      const globalKey = `__streaming_${presentationId}`;
      const globalEventSource = (window as unknown as Record<string, EventSource | undefined>)[globalKey];
      if (globalEventSource) {
        globalEventSource.close();
        delete (window as unknown as Record<string, unknown>)[globalKey];
      }
    };
  }, [presentation.id]);

  // BroadcastChannel for presenter view communication
  useEffect(() => {
    presenterChannelRef.current = new BroadcastChannel(`presentation-${presentation.id}`);
    
    // Listen for messages from presenter view
    presenterChannelRef.current.onmessage = (event) => {
      const { type, slideIndex } = event.data;
      
      switch (type) {
        case "presenter-opened":
          setPresenterViewConnected(true);
          // Send confirmation to presenter view
          presenterChannelRef.current?.postMessage({ type: "main-connected" });
          break;
        case "presenter-closed":
          setPresenterViewConnected(false);
          // Exit presentation mode when presenter view closes
          setIsPresenting(false);
          setViewMode("scroll");
          // Restore thumbnails - use a ref to get the stored value
          setShowThumbnails(true);
          break;
        case "slide-change":
          // Presenter view changed slide, sync here
          if (typeof slideIndex === "number" && slideIndex >= 0 && slideIndex < slidesRef.current.length) {
            setCurrentSlide(slideIndex);
          }
          break;
        case "enter-fullscreen":
          // Presenter view requested fullscreen on main window (requires user gesture)
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
              // Fullscreen blocked by browser - already in presentation mode so this is fine
            });
          }
          break;
      }
    };
    
    return () => {
      presenterChannelRef.current?.postMessage({ type: "main-disconnected" });
      presenterChannelRef.current?.close();
    };
  }, [presentation.id]);

  const slides = slidesData;
  const { content } = presentation;

  // Custom theme state - OPTIMIZATION: Initialize with prefetched theme if available
  const [customTheme, setCustomTheme] = useState<Theme | null>(() => {
    if (prefetchedCustomTheme) {
      return convertCustomThemeToTheme(prefetchedCustomTheme);
    }
    return null;
  });
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);


  // Load custom theme if needed - OPTIMIZATION: Skip if prefetched
  useEffect(() => {
    // Skip if we already have a prefetched theme
    if (prefetchedCustomTheme) return;

    const themeId = content.theme || "";
    if (isCustomThemeId(themeId)) {
      setIsLoadingTheme(true);
      const dbId = getCustomThemeDbId(themeId);
      fetch(`/api/themes/custom/${dbId}`)
        .then(res => res.json())
        .then(data => {
          if (data.theme) {
            setCustomTheme(convertCustomThemeToTheme(data.theme));
          }
        })
        .catch(err => console.error("Failed to load custom theme:", err))
        .finally(() => setIsLoadingTheme(false));
    }
  }, [content.theme, currentThemeId]);

  // Get the theme - either custom or built-in (use currentThemeId for live updates)
  const theme = customTheme || getThemeById(currentThemeId || content.theme || "") || getDefaultTheme();
  const fontsUrl = getGoogleFontsUrl(theme);

  // Handle theme change from sidebar
  const handleThemeChange = useCallback((newThemeId: string) => {
    setCurrentThemeId(newThemeId);
    // If it's a custom theme, we need to fetch it
    if (newThemeId.startsWith("custom-")) {
      const dbId = newThemeId.replace("custom-", "");
      setIsLoadingTheme(true);
      fetch(`/api/themes/custom/${dbId}`)
        .then(res => res.json())
        .then(data => {
          if (data.theme) {
            setCustomTheme(convertCustomThemeToTheme(data.theme));
          }
        })
        .catch(err => console.error("Failed to load custom theme:", err))
        .finally(() => setIsLoadingTheme(false));
    } else {
      // Built-in theme, clear custom theme
      setCustomTheme(null);
    }
  }, []);

  // Undo/Redo history management
  const [history, setHistory] = useState<SlideData[][]>([presentation.slides]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);
  const maxHistorySize = 50;

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  useEffect(() => {
    slidesRef.current = slidesData;
  }, [slidesData]);

  const saveSlides = useCallback(async () => {
    if (!isOwner) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/presentations/${presentation.id}/slides`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: slidesRef.current }),
      });
      if (response.ok) {
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Failed to save slides:", error);
    } finally {
      setIsSaving(false);
    }
  }, [isOwner, presentation.id]);

  const undo = useCallback(() => {
    if (canUndo) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousState = history[newIndex];
      if (previousState) {
        setSlidesData(previousState);
        slidesRef.current = previousState;
        setHasUnsavedChanges(true);
        // Trigger save after undo
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveSlides();
        }, 2000);
      }
    }
  }, [canUndo, historyIndex, history, saveSlides]);

  const redo = useCallback(() => {
    if (canRedo) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      if (nextState) {
        setSlidesData(nextState);
        slidesRef.current = nextState;
        setHasUnsavedChanges(true);
        // Trigger save after redo
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveSlides();
        }, 2000);
      }
    }
  }, [canRedo, historyIndex, history, saveSlides]);

  const updateSlidesWithSave = useCallback((newSlides: SlideData[]) => {
    setSlidesData(newSlides);
    slidesRef.current = newSlides;
    setHasUnsavedChanges(true);

    // Add to history only if this is not an undo/redo action
    if (!isUndoRedoAction.current) {
      setHistory(prev => {
        // Remove any future history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Add new state
        newHistory.push(newSlides);
        // Limit history size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
    }
    isUndoRedoAction.current = false;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveSlides();
    }, 2000);
  }, [saveSlides, historyIndex]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
    format: "pdf" | "pptx" | "images",
    options?: {
      range: "all" | "current" | "custom";
      customRange?: { from: number; to: number };
    },
  ) => {
    console.log("[PresentationViewer] Starting export via fetch:", format);
    setIsExporting(true);
    setExportingFormat(format);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.set("format", format);

      if (options) {
        params.set("range", options.range);
        if (options.range === "current") {
          params.set("from", String(currentSlide + 1));
        } else if (options.range === "custom" && options.customRange) {
          params.set("from", String(options.customRange.from));
          params.set("to", String(options.customRange.to));
        }
      }

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
      let filename = `${presentation.title}.${format === "images" ? "zip" : format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

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

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length && !isAnimating) {
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 300);
      }
    },
    [slides.length, isAnimating],
  );

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  // Update lastHoveredSlideIndex when a slide is hovered
  useEffect(() => {
    if (activeSlideIndex !== null) {
      setLastHoveredSlideIndex(activeSlideIndex);
    }
  }, [activeSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle undo/redo even when editing text
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Don't intercept keys when user is typing in input/textarea or contenteditable
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || 
                       target.tagName === "TEXTAREA" || 
                       target.isContentEditable ||
                       target.closest('[contenteditable="true"]');
      
      if (editingText || isTyping) return;
      
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        if (isFullscreen) document.exitFullscreen();
        setEditingText(null);
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, editingText, undo, redo]);

  // Track thumbnail state before fullscreen to restore it after
  const thumbnailsBeforeFullscreenRef = useRef<boolean>(true);
  const wasFullscreenRef = useRef<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      
      // If exiting fullscreen, restore thumbnail state
      if (wasFullscreenRef.current && !isNowFullscreen) {
        setShowThumbnails(thumbnailsBeforeFullscreenRef.current);
      }
      
      wasFullscreenRef.current = isNowFullscreen;
      setIsFullscreen(isNowFullscreen);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      // Save current thumbnail state before entering fullscreen
      thumbnailsBeforeFullscreenRef.current = showThumbnails;
      await document.documentElement.requestFullscreen();
      setShowThumbnails(false);
    } else {
      await document.exitFullscreen();
      // Note: thumbnail restoration is handled by fullscreenchange event
    }
  };


  // Slide operations
  const updateSlideContent = (slideIndex: number, field: string, value: string, bulletIndex?: number) => {
    const newSlides = [...slidesData];
    const existingSlide = newSlides[slideIndex];
    if (!existingSlide) return;
    const slide: SlideData = { ...existingSlide };
    if (field === "title") slide.title = value;
    else if (field === "subtitle") slide.subtitle = value;
    else if (field === "bullet" && bulletIndex !== undefined) {
      const bullets = [...(slide.bulletPoints || [])];
      bullets[bulletIndex] = value;
      slide.bulletPoints = bullets;
      // Clear transformedContent so bulletPoints take precedence in rendering
      slide.transformedContent = undefined;
    } else if (field === "sectionHeading" && bulletIndex !== undefined) {
      // Handle section heading edits
      const sections = [...(slide.sections || [])];
      if (sections[bulletIndex]) {
        sections[bulletIndex] = { ...sections[bulletIndex], heading: value };
        slide.sections = sections;
      }
    } else if (field === "sectionDescription" && bulletIndex !== undefined) {
      // Handle section description edits
      const sections = [...(slide.sections || [])];
      if (sections[bulletIndex]) {
        sections[bulletIndex] = { ...sections[bulletIndex], description: value };
        slide.sections = sections;
      }
    }
    newSlides[slideIndex] = slide;
    updateSlidesWithSave(newSlides);
  };

  const changeSlideLayout = (slideIndex: number, slideLayoutId: SlideLayoutType, imageSize: ImageSize, imageShape: ImageShape) => {
    const newSlides = [...slidesData];
    const existingSlide = newSlides[slideIndex];
    if (existingSlide) {
      // Map new slide layout to SlideRenderer layout variants
      // image-top and image-bottom are now directly supported
      const layoutMap: Record<SlideLayoutType, string> = {
        "image-left": "right-content",
        "image-right": "left-content",
        "image-top": "image-top",
        "image-bottom": "image-bottom",
        "image-background": "image-background",
        "image-full": "full-image",
        "no-image": "grid-3-col",
        "chart-left": "chart-left",
        "chart-right": "chart-right",
      };
      const mappedLayout = layoutMap[slideLayoutId] || "left-content";
      newSlides[slideIndex] = { 
        ...existingSlide, 
        layout: mappedLayout as LayoutType,
        slideLayout: slideLayoutId,
        imageSize: imageSize,
        imageShape: imageShape,
      };
      updateSlidesWithSave(newSlides);
    }
    setShowLayoutModal(false);
  };

  const changeContentLayout = (slideIndex: number, layoutId: ContentLayoutId) => {
    const newSlides = [...slidesData];
    const existingSlide = newSlides[slideIndex];
    if (existingSlide) {
      newSlides[slideIndex] = { ...existingSlide, contentLayout: layoutId };
      updateSlidesWithSave(newSlides);
    }
  };

  const duplicateSlide = (index: number) => {
    const original = slidesData[index];
    if (original) {
      const newSlides = [...slidesData];
      newSlides.splice(index + 1, 0, { ...original });
      updateSlidesWithSave(newSlides);
      setCurrentSlide(index + 1);
    }
  };

  const addSlideAt = (index: number) => {
    const newSlide: SlideData = {
      type: "content",
      title: "New Slide",
      bulletPoints: ["Add your content here"],
      layout: "left-content" as LayoutType,
      slideLayout: "image-right",
      imageSize: "medium",
      contentLayout: "box-style-1",
    };
    const newSlides = [...slidesData];
    newSlides.splice(index + 1, 0, newSlide);
    updateSlidesWithSave(newSlides);
    setCurrentSlide(index + 1);
  };

  const handleAddAISlide = async (index: number, prompt: string) => {
    // Get context from surrounding slides
    const previousSlide = slidesData[index];
    const nextSlide = slidesData[index + 1];
    
    try {
      const response = await fetch("/api/ai/generate-slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          presentationContext: presentation.title,
          previousSlide: previousSlide ? { 
            title: previousSlide.title, 
            bulletPoints: previousSlide.bulletPoints 
          } : undefined,
          nextSlide: nextSlide ? { 
            title: nextSlide.title, 
            bulletPoints: nextSlide.bulletPoints 
          } : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate slide");
      }

      const data = await response.json();
      if (data.success && data.slide) {
        const newSlides = [...slidesData];
        newSlides.splice(index + 1, 0, data.slide);
        updateSlidesWithSave(newSlides);
        setCurrentSlide(index + 1);
        toast.success("AI slide generated!", {
          description: `${data.creditsUsed} credits used`,
        });
      } else {
        throw new Error("No slide content returned");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate slide";
      toast.error(message);
      throw error;
    }
  };

  const deleteSlide = (index: number) => {
    if (slidesData.length <= 1) return;
    const newSlides = slidesData.filter((_, i) => i !== index);
    updateSlidesWithSave(newSlides);
    if (currentSlide >= newSlides.length) setCurrentSlide(newSlides.length - 1);
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slidesData.length) return;
    const newSlides = [...slidesData];
    const slideA = newSlides[index];
    const slideB = newSlides[newIndex];
    if (slideA && slideB) {
      newSlides[index] = slideB;
      newSlides[newIndex] = slideA;
      updateSlidesWithSave(newSlides);
      setCurrentSlide(newIndex);
    }
  };

  const addBulletPoint = (slideIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      const hasContentLayout = !!slide.contentLayout;
      
      // Determine the primary data source for content layouts
      // Priority: sections > transformedContent.items > bulletPoints
      const hasSections = slide.sections && slide.sections.length > 0;
      const hasTransformedContent = slide.transformedContent?.items && slide.transformedContent.items.length > 0;
      
      let newBulletPoints = [...(slide.bulletPoints || [])];
      let newSections = slide.sections ? [...slide.sections] : undefined;
      let newTransformedContent = slide.transformedContent ? { ...slide.transformedContent } : undefined;
      
      if (hasContentLayout) {
        // For content layouts, add to the appropriate data source
        if (hasSections) {
          // Add to sections (primary source)
          newSections = [...slide.sections!, { heading: "New Point", description: "Add description here" }];
          // Also sync to bulletPoints for consistency
          newBulletPoints = [...newBulletPoints, "New Point: Add description here"];
        } else if (hasTransformedContent) {
          // Add to transformedContent.items
          newTransformedContent = {
            ...slide.transformedContent!,
            items: [...slide.transformedContent!.items!, { label: "New Point", text: "Add description here" }]
          };
          // Also sync to bulletPoints for consistency
          newBulletPoints = [...newBulletPoints, "New Point: Add description here"];
        } else {
          // No sections or transformedContent - create sections from bulletPoints + new point
          const existingBullets = slide.bulletPoints || [];
          newSections = existingBullets.map((bullet) => {
            const colonIndex = bullet.indexOf(":");
            if (colonIndex > 0 && colonIndex < 50) {
              const label = bullet.substring(0, colonIndex).trim();
              const text = bullet.substring(colonIndex + 1).trim();
              if (label && text) {
                return { heading: label, description: text };
              }
            }
            return { heading: bullet, description: bullet };
          });
          // Add the new point
          newSections.push({ heading: "New Point", description: "Add description here" });
          newBulletPoints = [...newBulletPoints, "New Point: Add description here"];
        }
      } else {
        // No content layout - just add to bulletPoints
        newBulletPoints = [...newBulletPoints, "New point"];
      }
      
      newSlides[slideIndex] = { 
        ...slide, 
        bulletPoints: newBulletPoints,
        sections: newSections,
        transformedContent: newTransformedContent,
      };
      updateSlidesWithSave(newSlides);
    }
  };

  const deleteBulletPoint = (slideIndex: number, bulletIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      const newBulletPoints = (slide.bulletPoints || []).filter((_, i) => i !== bulletIndex);
      
      // Also update sections if they exist (for content layouts)
      const newSections = slide.sections ? slide.sections.filter((_, i) => i !== bulletIndex) : undefined;
      
      // Also update transformedContent if it exists
      const newTransformedContent = slide.transformedContent?.items 
        ? { ...slide.transformedContent, items: slide.transformedContent.items.filter((_, i) => i !== bulletIndex) }
        : undefined;
      
      // If all content is deleted, clear the content layout too
      const shouldClearLayout = newBulletPoints.length === 0 && 
        (!newSections || newSections.length === 0) && 
        (!newTransformedContent?.items || newTransformedContent.items.length === 0);
      
      newSlides[slideIndex] = { 
        ...slide, 
        bulletPoints: newBulletPoints,
        sections: newSections,
        transformedContent: newTransformedContent,
        contentLayout: shouldClearLayout ? undefined : slide.contentLayout,
      };
      updateSlidesWithSave(newSlides);
    }
  };

  const deleteTitle = (slideIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      newSlides[slideIndex] = { 
        ...slide, 
        title: "",
      };
      updateSlidesWithSave(newSlides);
    }
  };

  const deleteSubtitle = (slideIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      newSlides[slideIndex] = { 
        ...slide, 
        subtitle: "",
      };
      updateSlidesWithSave(newSlides);
    }
  };

  const reorderContent = (slideIndex: number, fromIndex: number, toIndex: number) => {
    const slide = slidesData[slideIndex];
    if (!slide) return;
    
    const newSlides = [...slidesData];
    
    // Reorder bullet points
    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      const newBulletPoints = [...slide.bulletPoints];
      const [removed] = newBulletPoints.splice(fromIndex, 1);
      if (removed !== undefined) {
        newBulletPoints.splice(toIndex, 0, removed);
      }
      newSlides[slideIndex] = { ...slide, bulletPoints: newBulletPoints };
    }
    
    // Reorder sections if they exist
    if (slide.sections && slide.sections.length > 0) {
      const newSections = [...slide.sections];
      const [removed] = newSections.splice(fromIndex, 1);
      if (removed !== undefined) {
        newSections.splice(toIndex, 0, removed);
      }
      newSlides[slideIndex] = { ...newSlides[slideIndex]!, sections: newSections };
    }
    
    // Reorder transformedContent if it exists
    if (slide.transformedContent?.items && slide.transformedContent.items.length > 0) {
      const newItems = [...slide.transformedContent.items];
      const [removed] = newItems.splice(fromIndex, 1);
      if (removed !== undefined) {
        newItems.splice(toIndex, 0, removed);
      }
      newSlides[slideIndex] = { 
        ...newSlides[slideIndex]!, 
        transformedContent: { ...slide.transformedContent, items: newItems } 
      };
    }
    
    updateSlidesWithSave(newSlides);
  };

  const startEditing = (slideIndex: number, field: string, bulletIndex?: number) => {
    setEditingText({ slideIndex, field, bulletIndex });
  };


  const getSlideImages = (slide: SlideData) => {
    const images = [...(slide.images || [])];
    if (slide.image?.url && !images.some(img => img.url === slide.image?.url)) {
      images.unshift(slide.image);
    }
    return images;
  };

  const addSlideImage = (slideIndex: number, newImageUrl: string) => {
    const slide = slidesData[slideIndex];
    if (slide && newImageUrl) {
      const newSlides = [...slidesData];
      const currentImages = getSlideImages(slide);
      const newImage = { url: newImageUrl, alt: slide.title, source: "custom" };
      newSlides[slideIndex] = {
        ...slide,
        images: [...currentImages, newImage],
        image: currentImages.length === 0 ? newImage : slide.image,
      };
      updateSlidesWithSave(newSlides);
    }
    setShowImageModal(null);
    setImageUrl("");
  };

  const updateSlideImage = (slideIndex: number, imageIndex: number, newImageUrl: string) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      const currentImages = [...getSlideImages(slide)];
      if (newImageUrl) {
        currentImages[imageIndex] = { url: newImageUrl, alt: slide.title, source: "custom" };
      }
      newSlides[slideIndex] = { ...slide, images: currentImages, image: currentImages[0] || null };
      updateSlidesWithSave(newSlides);
    }
    setShowImageModal(null);
    setImageUrl("");
    setEditingImageIndex(null);
  };

  const removeSlideImage = (slideIndex: number, imageIndex?: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      const currentImages = getSlideImages(slide);
      if (imageIndex !== undefined) {
        currentImages.splice(imageIndex, 1);
      } else {
        currentImages.length = 0;
      }
      newSlides[slideIndex] = { ...slide, images: currentImages, image: currentImages[0] || null };
      updateSlidesWithSave(newSlides);
    }
    setEditingImageIndex(null);
  };

  const reorderSlideImages = (slideIndex: number, fromIndex: number, toIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide && fromIndex !== toIndex) {
      const newSlides = [...slidesData];
      const currentImages = [...getSlideImages(slide)];
      const [movedImage] = currentImages.splice(fromIndex, 1);
      if (movedImage) {
        currentImages.splice(toIndex, 0, movedImage);
        newSlides[slideIndex] = { ...slide, images: currentImages, image: currentImages[0] || null };
        updateSlidesWithSave(newSlides);
      }
    }
    setEditingImageIndex(null);
  };

  const changeImageShape = (slideIndex: number, shape: ImageShape) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      newSlides[slideIndex] = { ...slide, imageShape: shape };
      updateSlidesWithSave(newSlides);
    }
  };

  const changeImagePosition = (slideIndex: number, position: SlideLayoutType) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      newSlides[slideIndex] = { ...slide, slideLayout: position };
      updateSlidesWithSave(newSlides);
    }
  };

  const openImageModal = (slideIndex: number, imageIndex?: number) => {
    setShowImageModal(slideIndex);
    if (imageIndex !== undefined) {
      setEditingImageIndex(imageIndex);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white">
          <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">No slides found in this presentation.</p>
          <button onClick={() => router.push("/dashboard")} className="mt-4 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getThemeBackground = () => {
    if (theme.backgroundImage) {
      return { backgroundImage: `url(${theme.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" };
    }
    return { background: theme.slideStyles.title.background };
  };


  // Render slide
  const renderSlide = (slide: SlideData, index: number, isMain: boolean = false) => {
    const hasImage = slide.image?.url && slide.image.source !== "placeholder";
    const isImageLoading = imagesLoading.has(index);
    const isImageLoaded = imageLoadedStates[index];
    const isTitle = slide.type === "title";
    const isHovered = activeSlideIndex === index;
    const isEditing = editingText?.slideIndex === index;
    const isCurrentlyStreaming = streamingStatus === "streaming" && streamingSlideIndex === index;

    let backgroundStyle: React.CSSProperties = {};
    if (isTitle && hasImage) {
      backgroundStyle = { backgroundImage: `url(${slide.image!.url})`, backgroundSize: "cover", backgroundPosition: "center" };
    } else if (isTitle) {
      backgroundStyle = getThemeBackground();
    }

    if (!isMain) {
      // Thumbnail view
      const themeType = getThemeType(theme);
      const ui = getUIColors(themeType);
      const bgColors: Record<ThemeType, string> = { dark: "#0a0a0b", light: "#f8fafc", sunset: "#1c1017", ocean: "#0a1628", aurora: "#0f0a1a", ember: "#1a0a0a", midnight: "#0c0a1d", cyber: "#0a0a0f", alien: "#0a0f0a", corporate: "#ffffff", cosmic: "#0a0612", architectural: "#0a0a0a", anime: "#1a1625", hacker: "#0d0d0d", "custom-dark": "#0a0a0a", "custom-light": "#ffffff" };
      // Use custom theme background if available
      const thumbnailBgColor = theme.pageBackground ? theme.colors.background : bgColors[themeType];
      const thumbnailBg: React.CSSProperties = isTitle ? backgroundStyle : { background: thumbnailBgColor };

      return (
        <div className="w-full h-full relative overflow-hidden" style={thumbnailBg}>
          {/* Full cover image for title slides with images */}
          {isTitle && hasImage && slide.image?.url && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image.url}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setImageLoadedStates(prev => ({ ...prev, [index]: true }))}
              />
              {/* Loading placeholder for thumbnail */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse" />
              )}
              <div className={`absolute inset-0 ${themeType === "light" ? "bg-gradient-to-t from-white/70 via-white/30 to-transparent" : "bg-gradient-to-t from-black/70 via-black/30 to-transparent"}`} />
            </>
          )}
          {/* Image loading indicator for thumbnail */}
          {isTitle && isImageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 transform scale-[0.18] origin-top-left" style={{ width: "555%", height: "555%" }}>
            {isTitle && !slide.slideLayout ? (
              // Default title slide layout (centered text, image as background)
              <div className={`h-full flex flex-col items-center justify-center p-12 text-center ${hasImage ? "" : ui.titleBg}`}>
                {!hasImage && <div className={`absolute top-0 right-0 w-96 h-96 ${ui.orb1} rounded-full blur-3xl`} />}
                <h1 className="text-5xl font-bold mb-4 relative" style={{ fontFamily: theme.fonts.heading.family, color: getTitleSlideColors(themeType, !!hasImage).title }}>
                  {stripHtml(slide.title) || (isCurrentlyStreaming ? "..." : "")}
                </h1>
                {slide.subtitle && (
                  <p className="text-2xl opacity-80 relative" style={{ fontFamily: theme.fonts.body.family, color: getTitleSlideColors(themeType, !!hasImage).subtitle }}>
                    {stripHtml(slide.subtitle)}
                  </p>
                )}
              </div>
            ) : (
              // Title slides with custom slideLayout OR content slides use SlideRenderer
              <SlideRenderer
                slide={slide}
                index={index}
                totalSlides={slides.length}
                theme={theme}
                isOwner={false}
                isFullscreen={false}
                isHovered={false}
                isEditing={false}
                editingText={null}
                showPageNumber={showPageNumbers}
                onStartEditing={() => { }}
                onUpdateContent={() => { }}
                onFinishEditing={() => { }}
                onAddBullet={() => { }}
                onDeleteBullet={() => { }}
                onChangeContentLayout={changeContentLayout}
              />
            )}
          </div>
          {/* Streaming indicator on thumbnail */}
          {isCurrentlyStreaming && (
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </div>
      );
    }

    return (
      <div
        className="w-full h-full relative overflow-hidden transition-all duration-500 group slide-content-container"
        style={!hasImage ? backgroundStyle : undefined}
        onMouseEnter={() => {
          // Don't change activeSlideIndex if user is currently editing ANY text field
          if (canEdit && !isFullscreen && !isPublicView && !isPresenting && !editingText) {
            setActiveSlideIndex(index);
          }
        }}
        onMouseLeave={(e) => {
          // Don't clear activeSlideIndex if:
          // 1. User is editing text (ANY text field, not just on this slide)
          // 2. Content layout panel is open
          // 3. There's an active text selection (user might be using WYSIWYG toolbar)
          // 4. Mouse is moving to a child element (toolbar, etc.)
          const relatedTarget = e.relatedTarget as HTMLElement | null;
          const isMovingToToolbar = relatedTarget?.closest('[data-toolbar]') || 
                                    relatedTarget?.closest('.text-toolbar') ||
                                    relatedTarget?.closest('[role="toolbar"]') ||
                                    relatedTarget?.closest('[contenteditable="true"]');
          
          const selection = window.getSelection();
          const hasActiveSelection = selection && !selection.isCollapsed && selection.toString().trim().length > 0;
          
          // Check if ANY text is being edited (not just on this slide)
          const isAnyTextEditing = editingText !== null;
          
          if (!isAnyTextEditing && !showContentLayoutPanel && !hasActiveSelection && !isMovingToToolbar) {
            setActiveSlideIndex(null);
          }
        }}
      >
        {/* Full cover background image for title slides (only when no custom slideLayout) */}
        {isTitle && !slide.slideLayout && hasImage && slide.image?.url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image.url}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoadedStates(prev => ({ ...prev, [index]: true }))}
            />
            {/* Loading placeholder with shimmer effect */}
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse" />
            )}
          </>
        )}
        {/* Image loading placeholder for title slides (only when no custom slideLayout) */}
        {isTitle && !slide.slideLayout && isImageLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
              <span className="text-xs text-zinc-400">Loading image...</span>
            </div>
          </div>
        )}
        {theme.overlay && !hasImage && <div className="absolute inset-0" style={{ background: theme.overlay }} />}

        {/* AI Editing Overlay */}
        {aiEditingSlideIndex === index && (
          <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="relative">
                <Sparkles size={32} className="animate-pulse text-purple-400" />
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
                  <div className="w-full h-full rounded-full border-2 border-transparent border-t-purple-400 border-r-pink-400" />
                </div>
              </div>
              <p className="text-sm font-medium">AI is editing this slide...</p>
            </div>
          </div>
        )}

        {canEdit && !isFullscreen && !isPublicView && !isPresenting && (isHovered || aiEditingSlideIndex === index) && (
          <SlideMenu
            index={index}
            totalSlides={slides.length}
            imageCount={getSlideImages(slide).length}
            theme={theme}
            slideContent={{
              type: slide.type,
              title: slide.title,
              subtitle: slide.subtitle,
              bullets: slide.bulletPoints,
              sections: slide.sections,
              introText: slide.introText,
              tagline: slide.tagline,
              layout: slide.layout,
              image: slide.image,
              images: slide.images,
            }}
            onChangeLayout={() => { setActiveSlideIndex(index); setShowLayoutModal(true); }}
            onChangeContentLayout={() => { setActiveSlideIndex(index); setShowContentLayoutPanel(true); }}
            onDuplicate={() => duplicateSlide(index)}
            onAddSlide={() => addSlideAt(index)}
            onAddImage={() => { setShowImageModal(index); setEditingImageIndex(null); setImageUrl(""); }}
            onAddChart={() => setShowChartModal(index)}
            onRemoveChart={() => {
              const newSlides = slidesData.map((s, idx) => {
                if (idx === index) {
                  return { ...s, chart: null };
                }
                return s;
              });
              updateSlidesWithSave(newSlides);
              toast.success("Chart removed from slide");
            }}
            hasChart={!!slide.chart}
            onMoveUp={() => moveSlide(index, "up")}
            onMoveDown={() => moveSlide(index, "down")}
            onDelete={() => deleteSlide(index)}
            onAIEditingChange={(isEditing) => setAiEditingSlideIndex(isEditing ? index : null)}
            onAIEdit={(editedSlide) => {
              // Update the slide with AI-edited content - full slide replacement
              const newSlides = [...slidesData];
              const existingSlide = newSlides[index];
              if (!existingSlide) return;

              const updatedSlide: SlideData = {
                ...existingSlide,
                // Text content
                title: editedSlide.title || existingSlide.title,
                subtitle: editedSlide.subtitle !== undefined ? editedSlide.subtitle : existingSlide.subtitle,
                tagline: editedSlide.tagline !== undefined ? editedSlide.tagline : existingSlide.tagline,
                introText: editedSlide.introText !== undefined ? editedSlide.introText : existingSlide.introText,
                // Bullet points
                bulletPoints: editedSlide.bullets && editedSlide.bullets.length > 0
                  ? editedSlide.bullets
                  : existingSlide.bulletPoints,
                // Sections for card layouts
                sections: editedSlide.sections !== undefined ? editedSlide.sections : existingSlide.sections,
                // Layout
                layout: editedSlide.layout || existingSlide.layout,
                // Image - AI can add new image or remove existing
                image: editedSlide.image !== undefined ? editedSlide.image : existingSlide.image,
                images: editedSlide.images !== undefined ? editedSlide.images : existingSlide.images,
              };

              newSlides[index] = updatedSlide;
              updateSlidesWithSave(newSlides);
              toast.success("Slide updated with AI");
            }}
          />
        )}

        {/* Note button - top left, appears on hover */}
        {canEdit && !isFullscreen && !isPublicView && !isPresenting && (isHovered || aiEditingSlideIndex === index) && (
          <div className="absolute top-3 left-3 z-30">
            <SlideNoteButton
              slideIndex={index}
              speakerNotes={slide.speakerNotes}
              theme={theme}
              onAddNote={(note) => {
                const newSlides = [...slidesData];
                const existingSlide = newSlides[index];
                if (!existingSlide) return;
                const currentNotes = existingSlide.speakerNotes || [];
                newSlides[index] = { ...existingSlide, speakerNotes: [...currentNotes, note] };
                updateSlidesWithSave(newSlides);
                toast.success("Note added");
              }}
              onEditNote={(noteIndex, note) => {
                const newSlides = [...slidesData];
                const existingSlide = newSlides[index];
                if (!existingSlide) return;
                const currentNotes = [...(existingSlide.speakerNotes || [])];
                currentNotes[noteIndex] = note;
                newSlides[index] = { ...existingSlide, speakerNotes: currentNotes };
                updateSlidesWithSave(newSlides);
                toast.success("Note updated");
              }}
              onDeleteNote={(noteIndex) => {
                const newSlides = [...slidesData];
                const existingSlide = newSlides[index];
                if (!existingSlide) return;
                const currentNotes = [...(existingSlide.speakerNotes || [])];
                currentNotes.splice(noteIndex, 1);
                newSlides[index] = { ...existingSlide, speakerNotes: currentNotes };
                updateSlidesWithSave(newSlides);
                toast.success("Note deleted");
              }}
            />
          </div>
        )}

        {isTitle && !slide.slideLayout ? (
          // Default title slide layout (centered text, image as background)
          <TitleSlide
            slide={slide}
            index={index}
            totalSlides={slides.length}
            theme={theme}
            hasImage={!!hasImage}
            isOwner={canEdit && !isPresenting}
            isFullscreen={isFullscreen || isPublicView || isPresenting}
            isHovered={isHovered ?? false}
            isEditing={isEditing ?? false}
            editingText={editingText}
            showPageNumber={showPageNumbers}
            onStartEditing={startEditing}
            onUpdateContent={updateSlideContent}
            onFinishEditing={() => setEditingText(null)}
          />
        ) : (
          // Title slides with custom slideLayout OR content slides use SlideRenderer
          <SlideRenderer
            slide={slide}
            index={index}
            totalSlides={slides.length}
            theme={theme}
            isOwner={canEdit && !isPresenting}
            isFullscreen={isFullscreen || isPublicView || isPresenting}
            isHovered={isHovered ?? false}
            isEditing={isEditing ?? false}
            editingText={editingText}
            showPageNumber={showPageNumbers}
            onStartEditing={startEditing}
            onUpdateContent={updateSlideContent}
            onFinishEditing={() => setEditingText(null)}
            onAddBullet={addBulletPoint}
            onDeleteBullet={deleteBulletPoint}
            onDeleteTitle={deleteTitle}
            onDeleteSubtitle={deleteSubtitle}
            onReorderContent={reorderContent}
            onChangeContentLayout={changeContentLayout}
            onOpenContentLayoutPanel={() => { setActiveSlideIndex(index); setShowContentLayoutPanel(true); }}
            onOpenImageModal={openImageModal}
            onRemoveImage={removeSlideImage}
            onChangeImageShape={changeImageShape}
            onChangeImagePosition={changeImagePosition}
            onReorderImages={reorderSlideImages}
          />
        )}
      </div>
    );
  };

  const renderScrollableView = () => {
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

          // Render the slide with add buttons between slides
          const slideElement = isTitle && !slide.slideLayout ? (
            // Default title slide layout - use simple min-height container
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
              <ScrollSlideContent slide={slide} index={index} theme={theme} renderSlide={renderSlide} isMobile={isMobile} />
            </div>
          );

          return (
            <div key={index}>
              {slideElement}

              {/* Add slide buttons between slides - only show for editors, not during streaming */}
              {canEdit && !isPublicView && !isMobile && !isCurrentlyStreaming && index < slides.length - 1 && (
                <AddSlideButtons
                  onAddSlide={() => addSlideAt(index)}
                  onAddAISlide={(prompt) => handleAddAISlide(index, prompt)}
                  presentationContext={presentation.title}
                  theme={theme}
                />
              )}
            </div>
          );
        })}

        {/* Add slide buttons after the last slide */}
        {canEdit && !isPublicView && !isMobile && !isCurrentlyStreaming && slides.length > 0 && (
          <AddSlideButtons
            onAddSlide={() => addSlideAt(slides.length - 1)}
            onAddAISlide={(prompt) => handleAddAISlide(slides.length - 1, prompt)}
            presentationContext={presentation.title}
            theme={theme}
          />
        )}

        {/* Streaming indicator at the bottom */}
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
                borderColor: theme.colors.border
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
  };


  return (
    <>
      <style jsx global>{`
        @import url('${fontsUrl}');
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(100, 100, 100, 0.4); border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(100, 100, 100, 0.6); }
        
        /* Responsive slide content padding and sizing */
        @media (max-width: 640px) {
          /* Make slide containers use min-height instead of fixed height on mobile */
          .slide-content-container > div.h-full {
            height: auto !important;
            min-height: 100% !important;
          }
          .slide-content-container > div[class*="p-12"],
          .slide-content-container > div[class*="p-16"],
          .slide-content-container > div[class*="p-20"],
          .slide-content-container div[class*="p-12"],
          .slide-content-container div[class*="p-16"],
          .slide-content-container div[class*="p-20"] {
            padding: 1rem !important;
            padding-top: 2.5rem !important;
          }
          .slide-content-container > div[class*="pt-20"],
          .slide-content-container div[class*="pt-20"],
          .slide-content-container > div[class*="pt-12"],
          .slide-content-container div[class*="pt-12"] {
            padding-top: 3rem !important;
          }
          .slide-content-container > div[class*="pb-16"],
          .slide-content-container div[class*="pb-16"] {
            padding-bottom: 1rem !important;
          }
          .slide-content-container > div[class*="pr-16"],
          .slide-content-container div[class*="pr-16"] {
            padding-right: 0.75rem !important;
          }
          .slide-content-container > div[class*="pl-16"],
          .slide-content-container div[class*="pl-16"],
          .slide-content-container > div[class*="pl-32"],
          .slide-content-container div[class*="pl-32"] {
            padding-left: 0.75rem !important;
          }
          /* Make layout widths responsive - stack vertically */
          .slide-content-container div[class*="w-[55%]"],
          .slide-content-container div[class*="w-[60%]"],
          .slide-content-container div[class*="w-[48%]"],
          .slide-content-container div[class*="w-[45%]"],
          .slide-content-container div[class*="w-[40%]"],
          .slide-content-container div[class*="w-1/2"] {
            width: 100% !important;
          }
          /* Hide decorative elements on mobile */
          .slide-content-container .absolute[class*="w-32"],
          .slide-content-container .absolute[class*="w-24"],
          .slide-content-container .absolute[class*="w-20"],
          .slide-content-container .absolute[class*="w-16"],
          .slide-content-container .absolute[class*="w-64"],
          .slide-content-container .absolute[class*="w-52"],
          .slide-content-container .absolute[class*="w-40"],
          .slide-content-container .absolute[class*="w-48"],
          .slide-content-container .absolute[class*="w-96"],
          .slide-content-container .absolute[class*="w-80"],
          .slide-content-container .absolute[class*="w-72"],
          .slide-content-container .absolute[class*="w-[500px]"],
          .slide-content-container .absolute[class*="w-[600px]"],
          .slide-content-container .absolute[class*="w-[400px]"],
          .slide-content-container .absolute[class*="w-[300px]"] {
            display: none !important;
          }
          /* Scale down margins and gaps */
          .slide-content-container div[class*="mb-8"],
          .slide-content-container div[class*="mb-10"],
          .slide-content-container div[class*="mb-12"] {
            margin-bottom: 0.75rem !important;
          }
          .slide-content-container div[class*="mb-6"] {
            margin-bottom: 0.5rem !important;
          }
          .slide-content-container div[class*="gap-8"] {
            gap: 0.5rem !important;
          }
          .slide-content-container div[class*="gap-6"] {
            gap: 0.375rem !important;
          }
          .slide-content-container div[class*="mt-12"],
          .slide-content-container div[class*="mt-8"] {
            margin-top: 0.75rem !important;
          }
          /* Make flex containers stack on mobile */
          .slide-content-container > div > .flex:not(.items-center):not(.gap-2):not(.gap-3):not(.gap-4) {
            flex-direction: column !important;
          }
          /* Inner flex containers should also be auto height */
          .slide-content-container .h-full.flex {
            height: auto !important;
            min-height: 100% !important;
          }
          /* Responsive text sizes */
          .slide-content-container .text-5xl,
          .slide-content-container .text-6xl,
          .slide-content-container .text-7xl {
            font-size: 1.5rem !important;
            line-height: 1.2 !important;
          }
          .slide-content-container .text-4xl {
            font-size: 1.25rem !important;
            line-height: 1.3 !important;
          }
          .slide-content-container .text-3xl {
            font-size: 1.125rem !important;
            line-height: 1.3 !important;
          }
          .slide-content-container .text-2xl {
            font-size: 1rem !important;
          }
          .slide-content-container .text-xl {
            font-size: 0.875rem !important;
          }
          .slide-content-container .text-lg {
            font-size: 0.8125rem !important;
          }
          /* Grid layouts - single column on mobile */
          .slide-content-container .grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
          /* Max width adjustments */
          .slide-content-container .max-w-5xl,
          .slide-content-container .max-w-4xl,
          .slide-content-container .max-w-3xl {
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Global Export Indicator - shows even when modals are closed */}
      {isExporting && (
        <div className="fixed bottom-6 right-6 z-[10001] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white animate-pulse">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">Exporting {exportingFormat?.toUpperCase() || "file"}...</span>
        </div>
      )}

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
              toggleFullscreen();
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              }
            }}
            onExitPresent={() => {
              setIsPresenting(false);
              setViewMode("scroll");
              // Restore previous thumbnail state
              setShowThumbnails(prevThumbnailState);
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
          />
          </div>
        )}

        {/* Main content area - uses margin to make room for panel, preserving scroll position */}
        <div 
          className="flex-1 overflow-y-auto transition-all duration-300"
          style={{
            ...(showContentLayoutPanel ? { marginRight: `${CONTENT_LAYOUT_PANEL_WIDTH}px` } : {}),
            ...(showThumbnails && !isPublicView && !isMobile && !isFullscreen && !isPresenting ? { marginLeft: '176px' } : {}),
            // Apply page background to scrollable area for themes with cardBox (dark themes)
            ...(theme.pageBackground ? { background: theme.pageBackground } : {}),
          }}
        >
        <div className={`${isFullscreen || isPresenting ? "" : "px-0 sm:px-2 md:px-4 py-4 sm:py-8"} max-w-full ${showContentLayoutPanel ? 'pb-20' : ''}`}>
          {viewMode === "scroll" && !isFullscreen ? (
            <>
              {showThumbnails && !isPublicView && !isMobile && (
                <ThumbnailSidebar
                  slides={slides}
                  currentSlide={currentSlide}
                  onSlideClick={(index) => document.getElementById(`slide-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  onClose={() => setShowThumbnails(false)}
                  renderSlide={renderSlide}
                  theme={theme}
                />
              )}
              <div className="mx-auto" style={{ maxWidth: "1300px" }}>{renderScrollableView()}</div>
            </>
          ) : (
            <div className={`flex gap-6 ${isFullscreen || isPublicView || isPresenting ? "h-screen w-screen" : "mx-auto"} overflow-x-hidden`} style={!isFullscreen && !isPublicView && !isPresenting ? { maxWidth: "1800px" } : {}}>
              {showThumbnails && !isFullscreen && !isPublicView && !isPresenting && viewMode === "slides" && (
                <ThumbnailSidebar
                  slides={slides}
                  currentSlide={currentSlide}
                  onSlideClick={goToSlide}
                  onClose={() => setShowThumbnails(false)}
                  renderSlide={renderSlide}
                  theme={theme}
                />
              )}

              <div className={`flex-1 flex flex-col ${isFullscreen || isPresenting ? "h-full justify-center items-center w-full" : ""} max-w-full overflow-hidden`}>
                {(() => {
                  const isTitle = currentSlideData.type === "title";
                  const bulletCount = currentSlideData.bulletPoints?.length || 0;
                  const useFixedRatio = isFullscreen || isPresenting || isTitle || bulletCount <= 3;
                  const dynamicHeight = Math.max(450, 380 + bulletCount * 65);

                  if (useFixedRatio) {
                    return (
                      <div className={`relative overflow-hidden ${isFullscreen || isPresenting ? "w-screen h-screen flex items-center justify-center" : `w-full rounded-lg shadow-2xl ring-1 ${getUIColors(getThemeType(theme)).ring}`}`} style={!isFullscreen && !isPresenting ? { aspectRatio: "16/9", maxHeight: "calc(100vh - 200px)" } : {}}>
                        <div className={`${isFullscreen || isPresenting ? "w-full h-full" : "w-full h-full"}`}>
                          {renderSlide(currentSlideData, currentSlide, true)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className={`relative overflow-hidden w-full rounded-lg shadow-2xl ring-1 ${getUIColors(getThemeType(theme)).ring}`} style={{ height: `min(${dynamicHeight}px, calc(100vh - 200px))` }}>
                      {renderSlide(currentSlideData, currentSlide, true)}
                    </div>
                  );
                })()}

                {/* Navigation controls - hidden during presentation mode */}
                {!isPresenting && (
                  <NavigationControls
                    currentSlide={currentSlide}
                    totalSlides={slides.length}
                    isFullscreen={isFullscreen || isPublicView}
                    onPrev={prevSlide}
                    onNext={nextSlide}
                    onGoTo={goToSlide}
                    theme={theme}
                  />
                )}

                {!isFullscreen && !isPublicView && !isPresenting && (
                  <div className={`mt-4 text-center text-xs sm:text-sm ${getUIColors(getThemeType(theme)).endMuted}`}>
                    <span>Slide {currentSlide + 1} of {slides.length}</span>
                    <span className="hidden sm:inline ml-2 opacity-70">• Press <kbd className={`px-1.5 py-0.5 rounded text-xs ${getUIColors(getThemeType(theme)).kbd}`}>F</kbd> for fullscreen</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Public View Controls - Always visible */}
        {isPublicView && (
          <>
            <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 flex items-center gap-2">
              {/* View Mode Toggle */}
              {!isFullscreen && (
                <button
                  onClick={() => setViewMode(viewMode === "slides" ? "scroll" : "slides")}
                  className={`p-2 sm:p-2.5 rounded-lg backdrop-blur-sm transition-colors ${getUIColors(getThemeType(theme)).headerBg} ${getUIColors(getThemeType(theme)).headerText} hover:opacity-80`}
                  title={viewMode === "slides" ? "Switch to scroll view" : "Switch to slides view"}
                >
                  {viewMode === "slides" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="3" y1="15" x2="21" y2="15" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  )}
                </button>
              )}

              {/* Present Mode Toggle */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 sm:p-2.5 rounded-lg backdrop-blur-sm transition-colors ${getUIColors(getThemeType(theme)).headerBg} ${getUIColors(getThemeType(theme)).headerText} hover:opacity-80`}
                title={isFullscreen ? "Exit present mode" : "Enter present mode"}
              >
                {isFullscreen ? (
                  <Minimize2 size={18} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}

        {isFullscreen && !isPublicView && (
          <button onClick={toggleFullscreen} className="fixed top-2 sm:top-6 right-2 sm:right-6 p-2 sm:p-3 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-50">
            <Minimize2 size={18} className="sm:w-5 sm:h-5" />
          </button>
        )}

        {viewMode === "scroll" && !isFullscreen && !isPublicView && showFeedback && <FeedbackSection presentationId={presentation.id} theme={theme} />}
        </div>
        {/* End of content area that shifts */}

        {showLayoutModal && activeSlideIndex !== null && (
          <LayoutModal 
            slideType={slides[activeSlideIndex]?.type || "content"}
            currentSlideLayout={slides[activeSlideIndex]?.slideLayout || "image-right"}
            currentContentLayout={slides[activeSlideIndex]?.contentLayout || "box-style-1"}
            currentImageSize={slides[activeSlideIndex]?.imageSize || "medium"}
            currentImageShape={slides[activeSlideIndex]?.imageShape || "arc"}
            contentItems={slides[activeSlideIndex]?.bulletPoints?.map((bp, i) => ({
              label: `Point ${i + 1}`,
              text: typeof bp === "string" ? bp : ((bp as { text?: string } | null)?.text ?? ""),
            })) || []}
            theme={theme}
            onSelectSlideLayout={(layoutId, imageSize, imageShape) => changeSlideLayout(activeSlideIndex, layoutId, imageSize, imageShape)}
            onOpenContentLayoutPanel={() => setShowContentLayoutPanel(true)}
            onClose={() => setShowLayoutModal(false)} 
          />
        )}

        {showImageModal !== null && (
          <MultiImageModal
            images={getSlideImages(slides[showImageModal]!)}
            imageUrl={imageUrl}
            editingIndex={editingImageIndex}
            isLoading={isLoadingImage}
            theme={theme}
            presentationId={presentation.id}
            onUrlChange={setImageUrl}
            onAddImage={() => addSlideImage(showImageModal, imageUrl)}
            onUpdateImage={(idx) => updateSlideImage(showImageModal, idx, imageUrl)}
            onRemoveImage={(idx) => removeSlideImage(showImageModal, idx)}
            onReorderImages={(from, to) => reorderSlideImages(showImageModal, from, to)}
            onEditImage={(idx) => { setEditingImageIndex(idx); setImageUrl(getSlideImages(slides[showImageModal]!)[idx]?.url || ""); }}
            onCancelEdit={() => { setEditingImageIndex(null); setImageUrl(""); }}
            onClose={() => { setShowImageModal(null); setImageUrl(""); setEditingImageIndex(null); }}
            onOpenWysiwygEditor={(idx) => {
              setShowImageModal(null);
              setShowImageEditor({ slideIndex: showImageModal, imageIndex: idx });
            }}
            onAddGeneratedImage={(url) => {
              addSlideImage(showImageModal, url);
            }}
          />
        )}

        {showExportModal && isOwner && (
          <ExportModal
            isExporting={isExporting}
            theme={theme}
            totalSlides={slidesData.length}
            currentSlide={currentSlide + 1}
            onExport={handleExport}
            onClose={() => setShowExportModal(false)}
          />
        )}

        {showShareModal && isOwner && (
          <ShareModal
            presentationId={presentation.id}
            initialIsPublic={presentation.isPublic}
            initialShareToken={presentation.shareToken}
            onClose={() => setShowShareModal(false)}
            theme={theme}
          />
        )}

        {showRateModal && (
          <RateUsModal onClose={() => setShowRateModal(false)} theme={theme} />
        )}

        {showChartModal !== null && (
          <ChartModal
            isOpen={true}
            theme={theme}
            existingChart={slides[showChartModal]?.chart as ChartData | null}
            onClose={() => setShowChartModal(null)}
            onInsert={(chart: ChartData) => {
              const slideIndex = showChartModal;
              const newSlides = slidesData.map((slide, idx) => {
                if (idx === slideIndex) {
                  // Create a new slide object with the chart
                  return { ...slide, chart };
                }
                return slide;
              });
              updateSlidesWithSave(newSlides);
              toast.success(slides[slideIndex]?.chart ? "Chart updated" : "Chart added to slide");
              setShowChartModal(null);
            }}
          />
        )}

        {/* WYSIWYG Image Editor Modal */}
        {showImageEditor && canEdit && (() => {
          const slide = slidesData[showImageEditor.slideIndex];
          const images = getSlideImages(slide!);
          const image = images[showImageEditor.imageIndex];
          if (!image) return null;

          // Convert SlideImage to ImageBlock format
          const imageBlock: ImageBlock = {
            id: `img-${showImageEditor.slideIndex}-${showImageEditor.imageIndex}`,
            type: "image",
            url: image.url,
            alt: image.alt || slide?.title || "Image",
            filter: image.filter,
            crop: image.crop,
            objectFit: image.objectFit,
          };

          return (
            <ImageEditor
              block={imageBlock}
              theme={theme}
              onSave={(updatedBlock) => {
                // Update the image in the slide with all editing properties
                const newSlides = [...slidesData];
                const slideToUpdate = newSlides[showImageEditor.slideIndex];
                if (slideToUpdate) {
                  // Create the updated image object
                  const updatedImage = {
                    url: updatedBlock.url,
                    alt: updatedBlock.alt,
                    source: "edited" as const,
                    filter: updatedBlock.filter,
                    crop: updatedBlock.crop,
                    objectFit: updatedBlock.objectFit,
                    // Preserve photographer info if it exists
                    photographer: image.photographer,
                    photographerUrl: image.photographerUrl,
                  };

                  // Get all current images
                  const allImages = getSlideImages(slideToUpdate);
                  
                  // Check if we're editing the primary image (slide.image)
                  const isPrimaryImage = showImageEditor.imageIndex === 0 && 
                    slideToUpdate.image?.url === image.url;
                  
                  if (isPrimaryImage) {
                    // Update the primary image directly
                    newSlides[showImageEditor.slideIndex] = {
                      ...slideToUpdate,
                      image: updatedImage,
                      // Also update in images array if it exists there
                      images: slideToUpdate.images?.map((img, idx) => 
                        img.url === image.url ? updatedImage : img
                      ),
                    };
                  } else {
                    // Update in the images array
                    const updatedImages = [...(slideToUpdate.images || [])];
                    // Find the correct index in the images array
                    const imagesArrayIndex = slideToUpdate.image?.url === allImages[0]?.url 
                      ? showImageEditor.imageIndex - 1 
                      : showImageEditor.imageIndex;
                    
                    if (imagesArrayIndex >= 0 && imagesArrayIndex < updatedImages.length) {
                      updatedImages[imagesArrayIndex] = updatedImage;
                    }
                    
                    newSlides[showImageEditor.slideIndex] = {
                      ...slideToUpdate,
                      images: updatedImages,
                    };
                  }
                  
                  updateSlidesWithSave(newSlides);
                }
                setShowImageEditor(null);
                toast.success("Image updated!");
              }}
              onCancel={() => setShowImageEditor(null)}
            />
          );
        })()}

        {/* Theme Sidebar */}
        <ThemeSidebar
          isOpen={showThemeSidebar}
          onClose={() => setShowThemeSidebar(false)}
          currentThemeId={currentThemeId}
          onThemeChange={handleThemeChange}
          presentationId={presentation.id}
          theme={theme}
        />

        {/* Agent Panel */}
        <AgentPanel
          isOpen={showAgentPanel}
          onClose={() => setShowAgentPanel(false)}
          theme={theme}
          slides={slidesData}
          currentSlideIndex={lastHoveredSlideIndex}
          presentationTitle={presentation.title}
          presentationId={presentation.id}
          onUpdateSlide={(index, slide) => {
            // Use slidesRef.current to get the latest slides (avoids stale closure)
            const newSlides = [...slidesRef.current];
            newSlides[index] = slide;
            updateSlidesWithSave(newSlides);
          }}
          onSetEditingSlide={setAiEditingSlideIndex}
        />

      </div>

      {/* Content Layout Panel - slides in from right (outside main wrapper so it doesn't shift) */}
      <ContentLayoutPanel
        isOpen={showContentLayoutPanel && activeSlideIndex !== null}
        currentContentLayout={activeSlideIndex !== null ? (slides[activeSlideIndex]?.contentLayout || "box-style-1") : "box-style-1"}
        contentItems={(() => {
          if (activeSlideIndex === null) return [];
          const slide = slides[activeSlideIndex];
          if (!slide) return [];
          
          // Use same logic as SlideRenderer.getBoxContentItems for accurate preview
          // 1. Prefer sections if available
          if (slide.sections && slide.sections.length > 0) {
            return slide.sections.map((section) => ({
              label: section.heading,
              text: section.description,
            }));
          }
          // 2. Fall back to transformed content
          if (slide.transformedContent?.items) {
            return slide.transformedContent.items
              .filter(item => item.label)
              .map((item) => ({
                label: item.label,
                text: item.text,
              }));
          }
          // 3. Fall back to bullet points with smart label extraction
          if (slide.bulletPoints && slide.bulletPoints.length > 0) {
            return slide.bulletPoints.map((bullet) => {
              const bp = typeof bullet === "string" ? bullet : (bullet as { text?: string }).text || "";
              // Try to extract label and text from "Label: Text" format
              const colonIndex = bp.indexOf(":");
              if (colonIndex > 0 && colonIndex < 50) {
                const label = bp.substring(0, colonIndex).trim();
                const text = bp.substring(colonIndex + 1).trim();
                if (label && text) {
                  return { label, text };
                }
              }
              // If no label format, use first few words as label
              const words = bp.split(" ");
              if (words.length > 5) {
                return { label: words.slice(0, 3).join(" "), text: bp };
              }
              // Short bullet - use as both
              return { label: bp, text: bp };
            });
          }
          return [];
        })()}
        theme={theme}
        onSelectContentLayout={(layoutId) => {
          if (activeSlideIndex !== null) {
            changeContentLayout(activeSlideIndex, layoutId);
          }
        }}
        onClose={() => setShowContentLayoutPanel(false)}
      />
    </>
  );
}

// Component for scroll view slides with dynamic height
function ScrollSlideContent({ slide, index, theme, renderSlide, isMobile }: {
  slide: SlideData;
  index: number;
  theme: Theme;
  renderSlide: (slide: SlideData, index: number, isMain: boolean) => React.ReactNode;
  isMobile?: boolean;
}) {
  const themeType = getThemeType(theme);

  // Check if this is a full-image or image-background layout that needs fixed aspect ratio
  const slideLayout = slide.slideLayout;
  const layout = slide.layout as string | undefined;
  const isFullImageLayout = slideLayout === "image-full" || layout === "full-image";
  const isImageBackgroundLayout = slideLayout === "image-background" || layout === "image-background";
  const needsFixedAspectRatio = isFullImageLayout || isImageBackgroundLayout;

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
    // Custom themes use inline styles via bgStyle, these are fallbacks
    "custom-dark": "",
    "custom-light": "",
  };

  // If theme has cardBox, the slide handles its own background with transparency
  // Don't apply a solid background here so the page background shows through
  const hasCardBox = !!theme.cardBox?.background;
  
  // Use custom pageBackground if available, otherwise fall back to themeType-based classes
  const hasCustomPageBg = !!theme.pageBackground;
  // When hasCardBox is true, don't apply any background - let the slide be transparent
  const bgClass = hasCardBox ? "" : (hasCustomPageBg ? "" : bgColors[themeType]);
  const bgStyle = hasCardBox ? {} : (hasCustomPageBg ? { background: theme.pageBackground } : {});

  // For full-image layouts, use fixed aspect ratio
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

  // Auto height - content determines the height naturally
  // No minHeight - let content size the slide naturally
  return (
    <div 
      className={`w-full ${bgClass} relative`} 
      style={{ ...bgStyle }}
    >
      {renderSlide(slide, index, true)}
    </div>
  );
}
