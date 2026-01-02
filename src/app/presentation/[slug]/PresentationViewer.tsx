"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Minimize2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { isCustomThemeId, getCustomThemeDbId, convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import { type LayoutType } from "~/lib/slide-layouts";
import { type SlideLayoutType, type ImageSize } from "~/lib/layouts/slide";
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

// Import extracted components
import {
  Header,
  NavigationControls,
  SlideMenu,
  ThumbnailSidebar,
  MultiImageModal,
  TitleSlide,
  ThemeSidebar,
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
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showContentLayoutPanel, setShowContentLayoutPanel] = useState(false);
  const [editingText, setEditingText] = useState<EditingState | null>(null);
  const [showImageModal, setShowImageModal] = useState<number | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // AI editing state - tracks which slide is being edited by AI
  const [aiEditingSlideIndex, setAiEditingSlideIndex] = useState<number | null>(null);
  // WYSIWYG Image Editor state
  const [showImageEditor, setShowImageEditor] = useState<{ slideIndex: number; imageIndex: number } | null>(null);
  const slidesRef = useRef<SlideData[]>(presentation.slides);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Hide body scrollbar when content layout panel is open
  useEffect(() => {
    if (showContentLayoutPanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showContentLayoutPanel]);

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

  const handleExport = (
    format: "pdf" | "pptx" | "images",
    options?: {
      range: "all" | "current" | "custom";
      customRange?: { from: number; to: number };
    },
  ) => {
    console.log("[PresentationViewer] Starting export via GET:", format);
    setIsExporting(true);

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
      console.log("[PresentationViewer] Redirecting to:", exportUrl);

      // Trigger native browser download
      window.location.assign(exportUrl);

      // Optimistically clear loading state and close modal
      // We assume the browser handles the download request successfully
      toast.info("Download started...");

      setTimeout(() => {
        setIsExporting(false);
        setShowExportModal(false);
      }, 2000);

    } catch (error) {
      console.error("[PresentationViewer] Export failed:", error);
      toast.error("Export failed to start.");
      setIsExporting(false);
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

      if (editingText) return;
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

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setShowThumbnails(false);
    } else {
      await document.exitFullscreen();
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
    }
    newSlides[slideIndex] = slide;
    updateSlidesWithSave(newSlides);
  };

  const changeSlideLayout = (slideIndex: number, slideLayoutId: SlideLayoutType, imageSize: ImageSize) => {
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
      };
      const mappedLayout = layoutMap[slideLayoutId] || "left-content";
      newSlides[slideIndex] = { 
        ...existingSlide, 
        layout: mappedLayout as LayoutType,
        slideLayout: slideLayoutId,
        imageSize: imageSize,
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
      newSlides[slideIndex] = { ...slide, bulletPoints: [...(slide.bulletPoints || []), "New point"] };
      updateSlidesWithSave(newSlides);
    }
  };

  const deleteBulletPoint = (slideIndex: number, bulletIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      newSlides[slideIndex] = { ...slide, bulletPoints: (slide.bulletPoints || []).filter((_, i) => i !== bulletIndex) };
      updateSlidesWithSave(newSlides);
    }
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

  const currentSlideData = slides[currentSlide];

  // Show app's standard loading during initial streaming setup
  if (streamingStatus === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          {/* Spinner Animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            {/* Outer Ring */}
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>

            {/* Spinning Gradient Ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-[#1e3a8a] border-r-[#06b6d4] rounded-full animate-spin"></div>

            {/* Inner Pulsing Circle */}
            <div className="absolute inset-3 bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] rounded-full animate-pulse"></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Loading...</h2>
            <div className="flex gap-1 justify-center">
              <div className="h-2 w-2 bg-[#1e3a8a] rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-[#06b6d4] rounded-full animate-bounce [animation-delay:100ms]"></div>
              <div className="h-2 w-2 bg-[#1e3a8a] rounded-full animate-bounce [animation-delay:200ms]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSlideData) {
    // During streaming, show loading if we don't have slides yet
    if (streamingStatus === "streaming" && slides.length === 0) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-[#1e3a8a] border-r-[#06b6d4] rounded-full animate-spin"></div>
              <div className="absolute inset-3 bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Generating slides...</h2>
              <div className="flex gap-1 justify-center">
                <div className="h-2 w-2 bg-[#1e3a8a] rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-[#06b6d4] rounded-full animate-bounce [animation-delay:100ms]"></div>
                <div className="h-2 w-2 bg-[#1e3a8a] rounded-full animate-bounce [animation-delay:200ms]"></div>
              </div>
            </div>
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
        onMouseEnter={() => canEdit && !isFullscreen && !isPublicView && setActiveSlideIndex(index)}
        onMouseLeave={() => !isEditing && !showContentLayoutPanel && setActiveSlideIndex(null)}
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

        {canEdit && !isFullscreen && !isPublicView && (isHovered || aiEditingSlideIndex === index) && (
          <SlideMenu
            index={index}
            totalSlides={slides.length}
            imageCount={getSlideImages(slide).length}
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
            onMoveUp={() => moveSlide(index, "up")}
            onMoveDown={() => moveSlide(index, "down")}
            onDelete={() => deleteSlide(index)}
            isAIEditing={aiEditingSlideIndex === index}
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

        {isTitle && !slide.slideLayout ? (
          // Default title slide layout (centered text, image as background)
          <TitleSlide
            slide={slide}
            index={index}
            totalSlides={slides.length}
            theme={theme}
            hasImage={!!hasImage}
            isOwner={canEdit}
            isFullscreen={isFullscreen || isPublicView}
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
            isOwner={canEdit}
            isFullscreen={isFullscreen || isPublicView}
            isHovered={isHovered ?? false}
            isEditing={isEditing ?? false}
            editingText={editingText}
            showPageNumber={showPageNumbers}
            onStartEditing={startEditing}
            onUpdateContent={updateSlideContent}
            onFinishEditing={() => setEditingText(null)}
            onAddBullet={addBulletPoint}
            onDeleteBullet={deleteBulletPoint}
            onChangeContentLayout={changeContentLayout}
          />
        )}
      </div>
    );
  };

  const renderScrollableView = () => {
    const ui = getUIColors(getThemeType(theme));
    const isCurrentlyStreaming = streamingStatus === "streaming";

    return (
      <div className="w-full mx-auto space-y-4 sm:space-y-8 md:space-y-12 pb-12 px-3 sm:px-4" style={{ maxWidth: "1109.33px" }}>
        {slides.map((slide, index) => {
          const isTitle = slide.type === "title";
          const isSlideStreaming = isCurrentlyStreaming && streamingSlideIndex === index;
          const isNewSlide = isCurrentlyStreaming && index === slides.length - 1;

          if (isTitle && !slide.slideLayout) {
            // Default title slide layout - use simple min-height container
            return (
              <div
                key={index}
                id={`slide-${index}`}
                className={`w-full rounded-md sm:rounded-lg shadow-xl sm:shadow-2xl overflow-hidden scroll-mt-20 ring-1 ${ui.ring} ${isNewSlide ? "animate-fade-in" : ""} ${isSlideStreaming ? "ring-2" : ""}`}
                style={{
                  ...(isMobile ? { minHeight: "280px", maxWidth: "100%" } : { width: "1109.33px", maxWidth: "100%", height: "auto", minHeight: "400px" }),
                  ...(isSlideStreaming ? { boxShadow: `0 0 20px ${theme.colors.primary}40` } : {}),
                }}
              >
                {renderSlide(slide, index, true)}
              </div>
            );
          }

          return (
            <div
              key={index}
              id={`slide-${index}`}
              className={`rounded-md sm:rounded-lg shadow-xl sm:shadow-2xl overflow-hidden scroll-mt-20 ring-1 ${ui.ring} ${isNewSlide ? "animate-fade-in" : ""} ${isSlideStreaming ? "ring-2" : ""}`}
              style={{
                width: isMobile ? "100%" : "1109.33px",
                maxWidth: "100%",
                height: "auto",
                ...(isSlideStreaming ? { boxShadow: `0 0 20px ${theme.colors.primary}40` } : {}),
              }}
            >
              <ScrollSlideContent slide={slide} index={index} theme={theme} renderSlide={renderSlide} isMobile={isMobile} />
            </div>
          );
        })}

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

      <div
        className={`min-h-screen ${theme.pageBackground ? "" : getUIColors(getThemeType(theme)).pageBg}`}
        style={theme.backgroundImage ? {
          backgroundImage: `url(${theme.backgroundImage})`,
          backgroundSize: theme.backgroundSize || "cover",
          backgroundPosition: theme.backgroundPosition || "center",
          backgroundAttachment: "fixed",
        } : theme.pageBackground ? { background: theme.pageBackground } : {}}
      >
        {!isFullscreen && !isPublicView && (
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
            onPresent={toggleFullscreen}
            onUndo={undo}
            onRedo={redo}
            onOpenThemes={() => setShowThemeSidebar(true)}
          />
        )}

        {/* Main content area - scrollable container that shrinks when panel is open */}
        <div 
          className={`transition-all duration-300 ${showContentLayoutPanel ? 'fixed left-0 overflow-y-scroll' : ''}`}
          style={showContentLayoutPanel ? {
            top: '53px',
            right: `${CONTENT_LAYOUT_PANEL_WIDTH}px`,
            bottom: '0',
            left: '0',
            height: 'calc(100vh - 53px)',
          } : {}}
        >
        <div className={`${isFullscreen ? "" : "px-0 sm:px-2 md:px-4 py-4 sm:py-8"} max-w-full ${showContentLayoutPanel ? 'pb-20' : ''}`}>
          {viewMode === "scroll" && !isFullscreen ? (
            <div className="flex gap-6 mx-auto" style={{ maxWidth: "1400px" }}>
              {showThumbnails && !isPublicView && !isMobile && (
                <ThumbnailSidebar
                  slides={slides}
                  onSlideClick={(index) => document.getElementById(`slide-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  onClose={() => setShowThumbnails(false)}
                  renderSlide={renderSlide}
                  theme={theme}
                  onAddSlide={addSlideAt}
                  isOwner={canEdit}
                />
              )}
              <div className="flex-1 w-full min-w-0">{renderScrollableView()}</div>
            </div>
          ) : (
            <div className={`flex gap-6 ${isFullscreen || isPublicView ? "h-screen w-screen" : "mx-auto"} overflow-x-hidden`} style={!isFullscreen && !isPublicView ? { maxWidth: "1700px" } : {}}>
              {showThumbnails && !isFullscreen && !isPublicView && viewMode === "slides" && (
                <div className={`hidden lg:block w-44 shrink-0 space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pr-2 sticky top-20 ${getUIColors(getThemeType(theme)).scrollbar}`}>
                  {slides.map((slide, index) => {
                    const ui = getUIColors(getThemeType(theme));
                    return (
                      <button key={index} onClick={() => goToSlide(index)} className="w-full group relative">
                        <div
                          className={`aspect-video overflow-hidden transition-all duration-200 ring-1 ${currentSlide === index ? "ring-2 shadow-lg" : `${ui.ringHover} opacity-70 hover:opacity-100`}`}
                          style={currentSlide === index ? { boxShadow: `0 0 0 2px ${theme.colors.primary}` } : {}}
                        >
                          {renderSlide(slide, index, false)}
                        </div>
                        <div className={`absolute top-1 left-1 w-4 h-4 backdrop-blur-sm flex items-center justify-center ${ui.thumbBg}`}>
                          <span className={`text-[9px] font-bold ${ui.thumbText}`}>{index + 1}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className={`flex-1 flex flex-col ${isFullscreen ? "h-full justify-center items-center w-full" : ""} max-w-full overflow-hidden`}>
                {(() => {
                  const isTitle = currentSlideData.type === "title";
                  const bulletCount = currentSlideData.bulletPoints?.length || 0;
                  const useFixedRatio = isFullscreen || isTitle || bulletCount <= 3;
                  const dynamicHeight = Math.max(450, 380 + bulletCount * 65);

                  if (useFixedRatio) {
                    return (
                      <div className={`relative overflow-hidden ${isFullscreen ? "w-full h-full max-h-screen flex items-center justify-center" : `w-full rounded-lg shadow-2xl ring-1 ${getUIColors(getThemeType(theme)).ring}`}`} style={!isFullscreen ? { aspectRatio: "16/9", maxHeight: "calc(100vh - 200px)" } : {}}>
                        <div className="w-full h-full">
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

                <NavigationControls
                  currentSlide={currentSlide}
                  totalSlides={slides.length}
                  isFullscreen={isFullscreen || isPublicView}
                  onPrev={prevSlide}
                  onNext={nextSlide}
                  onGoTo={goToSlide}
                  theme={theme}
                />

                {!isFullscreen && !isPublicView && (
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
            <div className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-auto z-50 max-w-md">
              <h1 className={`text-sm sm:text-lg font-semibold ${getUIColors(getThemeType(theme)).headerText} bg-black/30 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg truncate`}>
                {presentation.title}
              </h1>
            </div>

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

        {viewMode === "scroll" && !isFullscreen && !isPublicView && <FeedbackSection presentationId={presentation.id} theme={theme} />}
        </div>
        {/* End of content area that shifts */}

        {showLayoutModal && activeSlideIndex !== null && (
          <LayoutModal 
            slideType={slides[activeSlideIndex]?.type || "content"}
            currentSlideLayout={slides[activeSlideIndex]?.slideLayout || "image-right"}
            currentContentLayout={slides[activeSlideIndex]?.contentLayout || "box-style-1"}
            currentImageSize={slides[activeSlideIndex]?.imageSize || "medium"}
            contentItems={slides[activeSlideIndex]?.bulletPoints?.map((bp, i) => ({
              label: `Point ${i + 1}`,
              text: typeof bp === "string" ? bp : (bp as { text?: string }).text || "",
            })) || []}
            theme={theme}
            onSelectSlideLayout={(layoutId, imageSize) => changeSlideLayout(activeSlideIndex, layoutId, imageSize)}
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
          <RateUsModal onClose={() => setShowRateModal(false)} />
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
          };

          return (
            <ImageEditor
              block={imageBlock}
              onSave={(updatedBlock) => {
                // Update the image in the slide
                const newSlides = [...slidesData];
                const slideToUpdate = newSlides[showImageEditor.slideIndex];
                if (slideToUpdate) {
                  const currentImages = [...getSlideImages(slideToUpdate)];
                  currentImages[showImageEditor.imageIndex] = {
                    url: updatedBlock.url,
                    alt: updatedBlock.alt,
                    source: "edited",
                  };
                  newSlides[showImageEditor.slideIndex] = {
                    ...slideToUpdate,
                    images: currentImages,
                    image: currentImages[0] || null,
                  };
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
  const layout = slide.layout;
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
