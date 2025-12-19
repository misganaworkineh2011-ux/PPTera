"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Sparkles,
  PlusCircle,
  Undo2,
  Redo2,
} from "lucide-react";
import { toast } from "sonner";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { isCustomThemeId, getCustomThemeDbId, convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import { type LayoutType } from "~/lib/slide-layouts";
import {
  type SlideData,
  type SlideImage,
  type PresentationData,
  type EditingState,
} from "~/components/presentation/types";
import SlideRenderer from "~/components/presentation/SlideRenderer";
import LayoutModal from "~/components/presentation/LayoutModal";
import ExportModal from "~/components/presentation/ExportModal";
import ShareModal from "~/components/presentation/ShareModal";
import FeedbackSection from "~/components/presentation/FeedbackSection";
import ChartModal from "~/components/charts/ChartModal";
import { type ChartData } from "~/lib/charts/types";
import { RateUsModal, incrementPresentationCount, shouldShowRatePrompt, checkExistingReview } from "~/components/RateUsModal";

// Import extracted components
import {
  Header,
  NavigationControls,
  SlideMenu,
  ThumbnailSidebar,
  MultiImageModal,
  TitleSlide,
  getThemeType,
  getGoogleFontsUrl,
  getUIColors,
  type ThemeType,
} from "./components";

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
}

export default function PresentationViewer({
  presentation,
  mode,
  isOwner,
  collaboratorRole,
  isPublicView = false,
  prefetchedCustomTheme,
}: PresentationViewerProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(isPublicView);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(presentation.title);
  
  // Sync title when presentation prop changes (e.g., after rename in dashboard)
  useEffect(() => {
    setEditedTitle(presentation.title);
  }, [presentation.title]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<"pdf" | "pptx" | "images" | null>(null);
  const [downloadNotification, setDownloadNotification] = useState<{ url: string; filename: string; format: "pdf" | "pptx" | "images" } | null>(null);
  const [showRateModal, setShowRateModal] = useState(false);
  
  // Initialize based on screen size
  const [showThumbnails, setShowThumbnails] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [viewMode, setViewMode] = useState<"slides" | "scroll">(
    typeof window !== 'undefined' && window.innerWidth < 768 ? "scroll" : "scroll"
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
  const [showSlideMenu, setShowSlideMenu] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<EditingState | null>(null);
  const [showImageModal, setShowImageModal] = useState<number | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showChartModal, setShowChartModal] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const slidesRef = useRef<SlideData[]>(presentation.slides);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  
  // Debug: Log slide data to check for icons/charts
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const slidesWithCharts = slidesData.filter(s => s.chart);
      const slidesWithIcons = slidesData.filter(s => s.icons && s.icons.length > 0);
      if (slidesWithCharts.length > 0 || slidesWithIcons.length > 0) {
        console.log("[PresentationViewer] Slides with enhanced content:", {
          totalSlides: slidesData.length,
          slidesWithCharts: slidesWithCharts.length,
          slidesWithIcons: slidesWithIcons.length,
          chartSlides: slidesWithCharts.map(s => ({ title: s.title, chartType: s.chart?.type })),
          iconSlides: slidesWithIcons.map(s => ({ title: s.title, iconsCount: s.icons?.length })),
        });
      }
    }
  }, [slidesData]);

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
  }, [content.theme]);
  
  // Get the theme - either custom or built-in
  const theme = customTheme || getThemeById(content.theme || "") || getDefaultTheme();
  const fontsUrl = getGoogleFontsUrl(theme);

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

  const handleExport = async (format: "pdf" | "pptx" | "images", options?: { range: "all" | "current" | "custom"; customRange?: { from: number; to: number } }) => {
    // Close modal immediately for better UX
    setShowExportModal(false);
    setIsExporting(true);
    setExportingFormat(format);
    
    try {
      // Build request body with format and options
      const requestBody: Record<string, unknown> = { format };
      if (options) {
        requestBody.range = options.range;
        if (options.range === "current") {
          requestBody.customRange = { from: currentSlide + 1, to: currentSlide + 1 };
        } else if (options.range === "custom" && options.customRange) {
          requestBody.customRange = options.customRange;
        }
      }
      
      const response = await fetch(`/api/presentations/${presentation.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      // Get the blob for all formats
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Set filename based on format
      let filename: string;
      if (format === "pptx") {
        filename = `${presentation.title}.pptx`;
      } else if (format === "pdf") {
        filename = `${presentation.title}.pdf`;
      } else {
        filename = `${presentation.title}-slides.zip`;
      }
      
      // Show download notification
      setDownloadNotification({ url, filename, format });
      
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export failed. Please try again.", { duration: 4000 });
    }
    
    // Reset exporting state
    setIsExporting(false);
    setExportingFormat(null);
  };
  
  const handleDownloadClick = (e: React.MouseEvent) => {
    // Prevent any default behavior or event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    if (downloadNotification) {
      try {
        // Create a temporary link element
        const link = document.createElement("a");
        link.href = downloadNotification.url;
        link.download = downloadNotification.filename;
        link.style.display = "none";
        link.setAttribute("target", "_self");
        
        // Append to body
        document.body.appendChild(link);
        
        // Trigger download using setTimeout to avoid blocking
        setTimeout(() => {
          link.click();
          
          // Clean up after a delay to ensure download starts
          setTimeout(() => {
            document.body.removeChild(link);
            // Revoke the blob URL after download starts
            window.URL.revokeObjectURL(downloadNotification.url);
            setDownloadNotification(null);
            toast.success("Download started!", { duration: 2000 });
          }, 100);
        }, 0);
      } catch (err) {
        console.error("Download error:", err);
        toast.error("Download failed. Please try again.");
        setDownloadNotification(null);
      }
    }
  };
  
  const handleCloseNotification = () => {
    if (downloadNotification?.url) {
      window.URL.revokeObjectURL(downloadNotification.url);
    }
    setDownloadNotification(null);
  };

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length && !isAnimating) {
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 300);
      }
    },
    [slides.length, isAnimating]
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-slide-menu]')) return;
      if (showSlideMenu !== null) setShowSlideMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSlideMenu]);

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

  const changeSlideLayout = (slideIndex: number, layoutId: LayoutType) => {
    const newSlides = [...slidesData];
    const existingSlide = newSlides[slideIndex];
    if (existingSlide) {
      newSlides[slideIndex] = { ...existingSlide, layout: layoutId };
      updateSlidesWithSave(newSlides);
    }
    setShowLayoutModal(false);
  };

  const duplicateSlide = (index: number) => {
    const original = slidesData[index];
    if (original) {
      const newSlides = [...slidesData];
      newSlides.splice(index + 1, 0, { ...original });
      updateSlidesWithSave(newSlides);
      setCurrentSlide(index + 1);
    }
    setShowSlideMenu(null);
  };

  const addSlideAt = (index: number) => {
    const newSlide: SlideData = {
      type: "content",
      title: "New Slide",
      bulletPoints: ["Add your content here"],
      layout: "content-left" as LayoutType,
    };
    const newSlides = [...slidesData];
    newSlides.splice(index + 1, 0, newSlide);
    updateSlidesWithSave(newSlides);
    setCurrentSlide(index + 1);
    setShowSlideMenu(null);
  };

  const deleteSlide = (index: number) => {
    if (slidesData.length <= 1) return;
    const newSlides = slidesData.filter((_, i) => i !== index);
    updateSlidesWithSave(newSlides);
    if (currentSlide >= newSlides.length) setCurrentSlide(newSlides.length - 1);
    setShowSlideMenu(null);
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
    setShowSlideMenu(null);
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

  // Chart operations
  const updateSlideChart = (slideIndex: number, chart: ChartData | null) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      // Convert new chart format to storage format
      const chartData = chart ? {
        type: chart.type,
        title: chart.title,
        data: chart.data.map(d => ({
          label: d.label,
          value: d.value,
          color: d.color,
        })),
        labels: chart.data.map(d => d.label),
        config: {
          showLegend: chart.config.showLegend ?? true,
          showLabels: chart.config.showLabels ?? true,
          showValues: chart.config.showValues ?? true,
          showGrid: chart.config.showGrid ?? true,
          showAnimation: chart.config.showAnimation ?? true,
          maxValue: chart.config.maxValue,
          unit: chart.config.unit,
          colorScheme: chart.config.colorScheme ?? "default",
        },
        css: "",
      } : null;
      
      newSlides[slideIndex] = { ...slide, chart: chartData };
      updateSlidesWithSave(newSlides);
    }
    setShowChartModal(null);
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

  if (!currentSlideData) {
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
    const isTitle = slide.type === "title";
    const isHovered = activeSlideIndex === index;
    const isEditing = editingText?.slideIndex === index;

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
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 ${themeType === "light" ? "bg-gradient-to-t from-white/70 via-white/30 to-transparent" : "bg-gradient-to-t from-black/70 via-black/30 to-transparent"}`} />
            </>
          )}
          <div className="absolute inset-0 transform scale-[0.18] origin-top-left" style={{ width: "555%", height: "555%" }}>
            {isTitle ? (
              <div className={`h-full flex flex-col items-center justify-center p-12 text-center ${hasImage ? "" : ui.titleBg}`}>
                {!hasImage && <div className={`absolute top-0 right-0 w-96 h-96 ${ui.orb1} rounded-full blur-3xl`} />}
                <h1 className="text-5xl font-bold mb-4 relative" style={{ fontFamily: theme.fonts.heading.family, color: hasImage ? "#fff" : theme.colors.heading }}>
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="text-2xl opacity-80 relative" style={{ fontFamily: theme.fonts.body.family, color: hasImage ? "#e2e8f0" : theme.colors.textMuted }}>
                    {slide.subtitle}
                  </p>
                )}
              </div>
            ) : (
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
                onStartEditing={() => {}}
                onUpdateContent={() => {}}
                onFinishEditing={() => {}}
                onAddBullet={() => {}}
                onDeleteBullet={() => {}}
              />
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className="w-full h-full relative overflow-hidden transition-all duration-500 group slide-content-container"
        style={!hasImage ? backgroundStyle : undefined}
        onMouseEnter={() => canEdit && !isFullscreen && !isPublicView && setActiveSlideIndex(index)}
        onMouseLeave={() => !isEditing && setActiveSlideIndex(null)}
      >
        {/* Full cover background image for title slides */}
        {isTitle && hasImage && slide.image?.url && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={slide.image.url} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </>
        )}
        {theme.overlay && !hasImage && <div className="absolute inset-0" style={{ background: theme.overlay }} />}

        {canEdit && !isFullscreen && !isPublicView && (isHovered || showSlideMenu === index) && (
          <SlideMenu
            index={index}
            totalSlides={slides.length}
            showMenu={showSlideMenu === index}
            imageCount={getSlideImages(slide).length}
            hasChart={!!slide.chart}
            onToggleMenu={() => setShowSlideMenu(showSlideMenu === index ? null : index)}
            onChangeLayout={() => { setActiveSlideIndex(index); setShowLayoutModal(true); setShowSlideMenu(null); }}
            onDuplicate={() => duplicateSlide(index)}
            onAddSlide={() => addSlideAt(index)}
            onAddImage={() => { setShowImageModal(index); setEditingImageIndex(null); setImageUrl(""); setShowSlideMenu(null); }}
            onManageImages={() => { setShowImageModal(index); setEditingImageIndex(null); setImageUrl(""); setShowSlideMenu(null); }}
            onAddChart={() => { setShowChartModal(index); setShowSlideMenu(null); }}
            onRemoveChart={() => { updateSlideChart(index, null); setShowSlideMenu(null); }}
            onMoveUp={() => moveSlide(index, "up")}
            onMoveDown={() => moveSlide(index, "down")}
            onDelete={() => deleteSlide(index)}
          />
        )}

        {isTitle ? (
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
            onStartEditing={startEditing}
            onUpdateContent={updateSlideContent}
            onFinishEditing={() => setEditingText(null)}
          />
        ) : (
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
            onStartEditing={startEditing}
            onUpdateContent={updateSlideContent}
            onFinishEditing={() => setEditingText(null)}
            onAddBullet={addBulletPoint}
            onDeleteBullet={deleteBulletPoint}
          />
        )}
      </div>
    );
  };

  const renderScrollableView = () => {
    const ui = getUIColors(getThemeType(theme));
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4 sm:space-y-8 md:space-y-12 pb-12 px-3 sm:px-4">
        {slides.map((slide, index) => {
          const isTitle = slide.type === "title";
          
          if (isTitle) {
            // On mobile, use min-height instead of aspect-ratio to allow content to expand
            return (
              <div 
                key={index} 
                id={`slide-${index}`} 
                className={`w-full rounded-md sm:rounded-lg shadow-xl sm:shadow-2xl overflow-hidden scroll-mt-20 ring-1 ${ui.ring}`} 
                style={isMobile ? { minHeight: "280px", maxWidth: "100%" } : { aspectRatio: "16/9", maxWidth: "100%" }}
              >
                {renderSlide(slide, index, true)}
              </div>
            );
          }
          
          return (
            <div key={index} id={`slide-${index}`} className={`w-full rounded-md sm:rounded-lg shadow-xl sm:shadow-2xl overflow-hidden scroll-mt-20 ring-1 ${ui.ring}`} style={{ maxWidth: "100%" }}>
              <ScrollSlideContent slide={slide} index={index} theme={theme} renderSlide={renderSlide} isMobile={isMobile} />
            </div>
          );
        })}
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
        style={theme.pageBackground ? { background: theme.pageBackground } : {}}
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
            onExport={() => setShowExportModal(true)}
            onShare={() => setShowShareModal(true)}
            onPresent={toggleFullscreen}
            onUndo={undo}
            onRedo={redo}
          />
        )}

        <div className={`${isFullscreen ? "" : "px-0 sm:px-2 md:px-4 py-4 sm:py-8"} max-w-full`}>
          {viewMode === "scroll" && !isFullscreen ? (
            <div className="flex gap-6 max-w-7xl mx-auto">
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
            <div className={`flex gap-6 ${isFullscreen || isPublicView ? "h-screen w-screen" : "max-w-7xl mx-auto"} overflow-x-hidden`}>
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

        {showLayoutModal && activeSlideIndex !== null && (
          <LayoutModal currentLayout={slides[activeSlideIndex]?.layout} onSelect={(layoutId) => changeSlideLayout(activeSlideIndex, layoutId)} onClose={() => setShowLayoutModal(false)} />
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

        {showChartModal !== null && canEdit && (
          <ChartModal
            isOpen={true}
            onClose={() => setShowChartModal(null)}
            onInsert={(chart) => updateSlideChart(showChartModal, chart)}
            theme={theme}
            existingChart={slidesData[showChartModal]?.chart ? {
              type: slidesData[showChartModal]!.chart!.type as any,
              title: slidesData[showChartModal]!.chart!.title,
              data: slidesData[showChartModal]!.chart!.data,
              config: slidesData[showChartModal]!.chart!.config,
            } : null}
          />
        )}

        {showRateModal && (
          <RateUsModal onClose={() => setShowRateModal(false)} />
        )}

        {/* Export Loading Notification */}
        {isExporting && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl">
              <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
              <span className="text-sm font-medium text-white">
                {exportingFormat === "pptx" 
                  ? "Exporting PowerPoint..." 
                  : exportingFormat === "pdf" 
                    ? "Exporting PDF..." 
                    : "Exporting Images..."}
              </span>
            </div>
          </div>
        )}

        {/* Download Ready Notification */}
        {downloadNotification && !isExporting && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Export ready!</p>
                <p className="text-xs text-zinc-400 truncate max-w-[200px]">{downloadNotification.filename}</p>
              </div>
              <button
                onClick={(e) => handleDownloadClick(e)}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Click here to download
              </button>
              <button
                onClick={handleCloseNotification}
                type="button"
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
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
  const bulletCount = slide.bulletPoints?.length || 0;
  const hasChart = !!slide.chart;
  const hasIcons = slide.icons && slide.icons.length > 0;
  
  // Responsive height calculation - smaller base on mobile
  // Add extra height for charts and icons
  const baseHeight = isMobile ? 280 : 380;
  const bulletHeight = isMobile ? 50 : 65;
  const chartHeight = hasChart ? (isMobile ? 280 : 350) : 0;
  const iconsHeight = hasIcons ? (isMobile ? 60 : 80) : 0;
  const calculatedHeight = Math.max(baseHeight, baseHeight + bulletCount * bulletHeight + chartHeight + iconsHeight);
  
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
    corporate: "bg-gradient-to-br from-white via-gray-50 to-white",
    cosmic: "bg-gradient-to-br from-[#0a0612] via-[#120a1f] to-[#1a0a2e]",
    architectural: "bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#0a0a0a]",
    anime: "bg-gradient-to-br from-[#1a1625] via-[#251f35] to-[#1a1625]",
    hacker: "bg-gradient-to-br from-[#0d0d0d] via-[#141414] to-[#0d0d0d]",
    // Custom themes use inline styles via bgStyle, these are fallbacks
    "custom-dark": "",
    "custom-light": "",
  };
  
  // Use custom pageBackground if available, otherwise fall back to themeType-based classes
  const hasCustomPageBg = !!theme.pageBackground;
  const bgClass = hasCustomPageBg ? "" : bgColors[themeType];
  const bgStyle = hasCustomPageBg ? { background: theme.pageBackground } : {};
  
  // On mobile, use min-height to allow content to expand; on desktop use fixed height
  if (isMobile) {
    return (
      <div className={`w-full ${bgClass} relative`} style={{ minHeight: `${calculatedHeight}px`, ...bgStyle }}>
        {renderSlide(slide, index, true)}
      </div>
    );
  }
  
  return (
    <div className={`w-full ${bgClass} relative`} style={{ height: `min(${calculatedHeight}px, calc(100vh - 150px))`, ...bgStyle }}>
      {renderSlide(slide, index, true)}
    </div>
  );
}
