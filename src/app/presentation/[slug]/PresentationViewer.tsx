"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Minimize2,
  Download,
  Share2,
  Play,
  Grid3X3,
  Sparkles,
  X,
  CheckCircle2,
  MoreHorizontal,
  LayoutGrid,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  PlusCircle,
  ImagePlus,
  ImageOff,
  Loader2,
} from "lucide-react";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { type LayoutType } from "~/lib/slide-layouts";
import { type SlideData, type SlideImage, type PresentationData, type EditingState } from "~/components/presentation/types";
import EditableText from "~/components/presentation/EditableText";
import SlideRenderer from "~/components/presentation/SlideRenderer";
import LayoutModal from "~/components/presentation/LayoutModal";
import ExportModal from "~/components/presentation/ExportModal";
import ShareModal from "~/components/presentation/ShareModal";
import FeedbackSection from "~/components/presentation/FeedbackSection";

interface PresentationViewerProps {
  presentation: PresentationData;
  mode: string;
  isOwner: boolean;
  collaboratorRole?: string;
  isPublicView?: boolean; // Clean presentation view for public access
}

function getGoogleFontsUrl(theme: Theme): string {
  const fonts = new Set<string>();
  const extractFontName = (family: string) => family.split(",")[0]?.replace(/['"]/g, "").trim() || "";
  fonts.add(extractFontName(theme.fonts.heading.family));
  fonts.add(extractFontName(theme.fonts.body.family));
  const fontParams = Array.from(fonts)
    .filter((f) => f && !["sans-serif", "serif", "monospace"].includes(f.toLowerCase()))
    .map((f) => `family=${f.replace(/\s+/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}

// Theme type helper - "dark" for Elegant Noir, "light" for Arctic Frost, "sunset" for Sunset Gradient, "ocean" for Ocean Depths, "aurora" for Aurora Borealis, "ember" for Ember Forge, "midnight" for Midnight Garden
type ThemeType = "dark" | "light" | "sunset" | "ocean" | "aurora" | "ember" | "midnight";
function getThemeType(theme: Theme): ThemeType {
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "sunset-gradient") return "sunset";
  if (theme.id === "ocean-depths") return "ocean";
  if (theme.id === "aurora-borealis") return "aurora";
  if (theme.id === "ember-forge") return "ember";
  if (theme.id === "midnight-garden") return "midnight";
  return "dark"; // elegant-noir and default
}

// Theme-aware UI colors
function getUIColors(themeType: ThemeType) {
  const colors = {
    dark: {
      pageBg: "bg-gradient-to-br from-zinc-950 via-black to-zinc-950",
      headerBg: "bg-zinc-950/90 border-zinc-800",
      headerText: "text-zinc-100",
      headerMuted: "text-zinc-500",
      headerHover: "hover:bg-zinc-800",
      headerIcon: "text-zinc-400",
      headerActive: "bg-zinc-800 text-zinc-200",
      divider: "bg-zinc-800",
      ring: "ring-zinc-800",
      ringHover: "ring-zinc-700 hover:ring-zinc-600",
      thumbBg: "bg-black/60",
      thumbText: "text-white",
      scrollbar: "scrollbar-thumb-zinc-700",
      kbd: "bg-zinc-800 text-zinc-400",
      endCard: "bg-zinc-900/90 border-zinc-800",
      endText: "text-zinc-200",
      endMuted: "text-zinc-500",
      titleBg: "bg-gradient-to-br from-zinc-900 via-zinc-950 to-black",
      orb1: "bg-amber-500/10",
      orb2: "bg-indigo-500/10",
      accentLine: "from-amber-500",
      borderLine: "via-zinc-800",
      indicatorMuted: "text-zinc-600",
      navBtn: "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-700",
      navDot: "bg-zinc-700 hover:bg-zinc-600",
    },
    light: {
      pageBg: "bg-gradient-to-br from-slate-100 via-white to-slate-50",
      headerBg: "bg-white/90 border-slate-200",
      headerText: "text-slate-800",
      headerMuted: "text-slate-500",
      headerHover: "hover:bg-slate-100",
      headerIcon: "text-slate-500",
      headerActive: "bg-slate-200 text-slate-700",
      divider: "bg-slate-200",
      ring: "ring-slate-200",
      ringHover: "ring-slate-200 hover:ring-slate-300",
      thumbBg: "bg-white/80",
      thumbText: "text-slate-700",
      scrollbar: "scrollbar-thumb-slate-300",
      kbd: "bg-slate-200 text-slate-600",
      endCard: "bg-white/90 border-slate-200",
      endText: "text-slate-700",
      endMuted: "text-slate-500",
      titleBg: "bg-gradient-to-br from-slate-50 via-white to-cyan-50",
      orb1: "bg-cyan-500/15",
      orb2: "bg-violet-500/10",
      accentLine: "from-cyan-500",
      borderLine: "via-slate-300",
      indicatorMuted: "text-slate-400",
      navBtn: "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm",
      navDot: "bg-slate-300 hover:bg-slate-400",
    },
    sunset: {
      pageBg: "bg-gradient-to-br from-[#1c1017] via-[#261520] to-[#1c1017]",
      headerBg: "bg-[#1c1017]/95 border-pink-900/40",
      headerText: "text-pink-50",
      headerMuted: "text-pink-300/60",
      headerHover: "hover:bg-pink-950/50",
      headerIcon: "text-pink-300/70",
      headerActive: "bg-pink-900/40 text-pink-100",
      divider: "bg-pink-900/40",
      ring: "ring-pink-900/50",
      ringHover: "ring-pink-800/50 hover:ring-pink-700/50",
      thumbBg: "bg-[#1c1017]/80",
      thumbText: "text-pink-100",
      scrollbar: "scrollbar-thumb-pink-900/50",
      kbd: "bg-pink-950/60 text-pink-300",
      endCard: "bg-[#2d1a24]/90 border-pink-800/30",
      endText: "text-pink-100",
      endMuted: "text-pink-300/60",
      titleBg: "bg-gradient-to-br from-rose-950 via-[#1c1017] to-[#261520]",
      orb1: "bg-pink-500/15",
      orb2: "bg-orange-500/10",
      accentLine: "from-pink-400",
      borderLine: "via-pink-900/40",
      indicatorMuted: "text-pink-300/50",
      navBtn: "bg-[#2d1a24] text-pink-200 hover:bg-pink-950/60 border border-pink-800/40",
      navDot: "bg-pink-800/50 hover:bg-pink-700/50",
    },
    ocean: {
      pageBg: "bg-gradient-to-br from-[#0a1628] via-[#0d1f35] to-[#0a1628]",
      headerBg: "bg-[#0a1628]/95 border-[#1e3a5f]",
      headerText: "text-cyan-50",
      headerMuted: "text-cyan-300/60",
      headerHover: "hover:bg-[#122a45]/50",
      headerIcon: "text-cyan-300/70",
      headerActive: "bg-[#1e3a5f]/40 text-cyan-100",
      divider: "bg-[#1e3a5f]",
      ring: "ring-[#1e3a5f]",
      ringHover: "ring-[#1e3a5f] hover:ring-teal-500/50",
      thumbBg: "bg-[#0a1628]/80",
      thumbText: "text-cyan-100",
      scrollbar: "scrollbar-thumb-[#1e3a5f]",
      kbd: "bg-[#122a45] text-cyan-300",
      endCard: "bg-[#122a45]/90 border-teal-500/30",
      endText: "text-cyan-100",
      endMuted: "text-cyan-300/60",
      titleBg: "bg-gradient-to-br from-[#0a1628] via-[#0d1f35] to-[#122a45]",
      orb1: "bg-teal-500/15",
      orb2: "bg-cyan-500/10",
      accentLine: "from-teal-400",
      borderLine: "via-[#1e3a5f]",
      indicatorMuted: "text-cyan-400/50",
      navBtn: "bg-[#122a45] text-cyan-200 hover:bg-[#1e3a5f]/60 border border-teal-500/30",
      navDot: "bg-[#1e3a5f] hover:bg-teal-500/50",
    },
    aurora: {
      pageBg: "bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#0f0a1a]",
      headerBg: "bg-[#0f0a1a]/95 border-[#2d1f4a]",
      headerText: "text-purple-50",
      headerMuted: "text-purple-300/60",
      headerHover: "hover:bg-[#1a1030]/50",
      headerIcon: "text-purple-300/70",
      headerActive: "bg-[#2d1f4a]/40 text-purple-100",
      divider: "bg-[#2d1f4a]",
      ring: "ring-[#2d1f4a]",
      ringHover: "ring-[#2d1f4a] hover:ring-purple-500/50",
      thumbBg: "bg-[#0f0a1a]/80",
      thumbText: "text-purple-100",
      scrollbar: "scrollbar-thumb-[#2d1f4a]",
      kbd: "bg-[#1a1030] text-purple-300",
      endCard: "bg-[#1a1030]/90 border-purple-500/30",
      endText: "text-purple-100",
      endMuted: "text-purple-300/60",
      titleBg: "bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#150d24]",
      orb1: "bg-purple-500/20",
      orb2: "bg-green-500/15",
      accentLine: "from-purple-400",
      borderLine: "via-[#2d1f4a]",
      indicatorMuted: "text-purple-400/50",
      navBtn: "bg-[#1a1030] text-purple-200 hover:bg-[#2d1f4a]/60 border border-purple-500/30",
      navDot: "bg-[#2d1f4a] hover:bg-purple-500/50",
    },
    ember: {
      pageBg: "bg-gradient-to-br from-[#1a0a0a] via-[#2a1010] to-[#1a0a0a]",
      headerBg: "bg-[#1a0a0a]/95 border-[#7f1d1d]",
      headerText: "text-red-50",
      headerMuted: "text-red-300/60",
      headerHover: "hover:bg-[#2a1010]/50",
      headerIcon: "text-red-300/70",
      headerActive: "bg-[#7f1d1d]/40 text-red-100",
      divider: "bg-[#7f1d1d]",
      ring: "ring-[#7f1d1d]",
      ringHover: "ring-[#7f1d1d] hover:ring-red-500/50",
      thumbBg: "bg-[#1a0a0a]/80",
      thumbText: "text-red-100",
      scrollbar: "scrollbar-thumb-[#7f1d1d]",
      kbd: "bg-[#2a1010] text-red-300",
      endCard: "bg-[#2a1010]/90 border-red-500/30",
      endText: "text-red-100",
      endMuted: "text-red-300/60",
      titleBg: "bg-gradient-to-br from-[#1a0a0a] via-[#2a1010] to-[#3a1515]",
      orb1: "bg-red-500/20",
      orb2: "bg-orange-500/15",
      accentLine: "from-red-500",
      borderLine: "via-[#7f1d1d]",
      indicatorMuted: "text-red-400/50",
      navBtn: "bg-[#2a1010] text-red-200 hover:bg-[#7f1d1d]/60 border border-red-500/30",
      navDot: "bg-[#7f1d1d] hover:bg-red-500/50",
    },
    midnight: {
      pageBg: "bg-gradient-to-br from-[#0c0a1d] via-[#1a1735] to-[#0c0a1d]",
      headerBg: "bg-[#0c0a1d]/95 border-[#312e81]",
      headerText: "text-pink-50",
      headerMuted: "text-pink-300/60",
      headerHover: "hover:bg-[#1a1735]/50",
      headerIcon: "text-pink-300/70",
      headerActive: "bg-[#312e81]/40 text-pink-100",
      divider: "bg-[#312e81]",
      ring: "ring-[#312e81]",
      ringHover: "ring-[#312e81] hover:ring-pink-400/50",
      thumbBg: "bg-[#0c0a1d]/80",
      thumbText: "text-pink-100",
      scrollbar: "scrollbar-thumb-[#312e81]",
      kbd: "bg-[#1a1735] text-pink-300",
      endCard: "bg-[#1a1735]/90 border-pink-400/30",
      endText: "text-pink-100",
      endMuted: "text-pink-300/60",
      titleBg: "bg-gradient-to-br from-[#0c0a1d] via-[#1a1735] to-[#12102a]",
      orb1: "bg-pink-400/20",
      orb2: "bg-indigo-500/15",
      accentLine: "from-pink-400",
      borderLine: "via-[#312e81]",
      indicatorMuted: "text-pink-400/50",
      navBtn: "bg-[#1a1735] text-pink-200 hover:bg-[#312e81]/60 border border-pink-400/30",
      navDot: "bg-[#312e81] hover:bg-pink-400/50",
    },
  };
  return colors[themeType];
}

export default function PresentationViewer({ presentation, mode, isOwner, collaboratorRole, isPublicView = false }: PresentationViewerProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(isPublicView); // Start fullscreen for public view
  const [showThumbnails, setShowThumbnails] = useState(!isPublicView);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [viewMode, setViewMode] = useState<"slides" | "scroll">("slides");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(presentation.title);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Determine effective permissions
  const canEdit = isOwner || collaboratorRole === "editor";

  // Editing state
  const [slidesData, setSlidesData] = useState<SlideData[]>(presentation.slides);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showSlideMenu, setShowSlideMenu] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<EditingState | null>(null);
  const [showImageModal, setShowImageModal] = useState<number | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null); // null = adding new, number = editing existing
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const slidesRef = useRef<SlideData[]>(presentation.slides);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const slides = slidesData;
  const { content } = presentation;
  const theme = getThemeById(content.theme || "") || getDefaultTheme();
  const fontsUrl = getGoogleFontsUrl(theme);

  // Keep ref in sync with state
  useEffect(() => {
    slidesRef.current = slidesData;
  }, [slidesData]);

  // Auto-save slides when they change - using ref-based debounce to avoid re-render issues
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

  // Mark as having unsaved changes and schedule save
  const updateSlidesWithSave = useCallback((newSlides: SlideData[]) => {
    setSlidesData(newSlides);
    slidesRef.current = newSlides;
    setHasUnsavedChanges(true);
    
    // Clear existing timeout and set new one
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveSlides();
    }, 2000);
  }, [saveSlides]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Title save
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

  // Export
  const handleExport = async (format: "pdf" | "pptx" | "images") => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/presentations/${presentation.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });
      if (!response.ok) throw new Error("Export failed");
      
      if (format === "pptx") {
        // PPTX: Download directly as file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${presentation.title}.pptx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // PDF/Images: Open HTML in new window for print/save
        const html = await response.text();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          // Add print instructions
          setTimeout(() => {
            const instructions = printWindow.document.createElement("div");
            instructions.innerHTML = `
              <div style="position: fixed; top: 0; left: 0; right: 0; background: #1a1a1d; color: white; padding: 16px; z-index: 9999; display: flex; justify-content: space-between; align-items: center; font-family: Arial, sans-serif;">
                <span>📄 ${format === "pdf" ? "Press Ctrl+P (Cmd+P on Mac) to save as PDF" : "Right-click on slides to save as images"}</span>
                <button onclick="this.parentElement.remove()" style="background: #f59e0b; color: black; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">Got it</button>
              </div>
            `;
            printWindow.document.body.insertBefore(instructions, printWindow.document.body.firstChild);
          }, 100);
        }
      }
      setShowExportModal(false);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Navigation
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [nextSlide, prevSlide, isFullscreen, editingText]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking inside the menu
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

  // Get all images from a slide (combines legacy image with images array)
  const getSlideImages = (slide: SlideData) => {
    const images = [...(slide.images || [])];
    // Include legacy single image if it exists and isn't already in images array
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
      const newImage = {
        url: newImageUrl,
        alt: slide.title,
        source: "custom",
      };
      newSlides[slideIndex] = {
        ...slide,
        images: [...currentImages, newImage],
        image: currentImages.length === 0 ? newImage : slide.image, // Keep first image as legacy for compatibility
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
        currentImages[imageIndex] = {
          url: newImageUrl,
          alt: slide.title,
          source: "custom",
        };
      }
      newSlides[slideIndex] = {
        ...slide,
        images: currentImages,
        image: currentImages[0] || null, // Keep first image as legacy
      };
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
        // Remove specific image
        currentImages.splice(imageIndex, 1);
      } else {
        // Remove all images (legacy behavior)
        currentImages.length = 0;
      }
      
      newSlides[slideIndex] = { 
        ...slide, 
        images: currentImages,
        image: currentImages[0] || null,
      };
      updateSlidesWithSave(newSlides);
    }
    setEditingImageIndex(null);
  };

  // Reorder images via drag and drop
  const reorderSlideImages = (slideIndex: number, fromIndex: number, toIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide && fromIndex !== toIndex) {
      const newSlides = [...slidesData];
      const currentImages = [...getSlideImages(slide)];
      const [movedImage] = currentImages.splice(fromIndex, 1);
      if (movedImage) {
        currentImages.splice(toIndex, 0, movedImage);
        newSlides[slideIndex] = {
          ...slide,
          images: currentImages,
          image: currentImages[0] || null,
        };
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
    // Content slides: no background here - the outer container handles the glass effect

    if (!isMain) {
      // Thumbnail view - render actual slide content scaled down
      const themeType = getThemeType(theme);
      const ui = getUIColors(themeType);
      const bgColors: Record<ThemeType, string> = { dark: "#0a0a0b", light: "#f8fafc", sunset: "#1c1017", ocean: "#0a1628", aurora: "#0f0a1a", ember: "#1a0a0a", midnight: "#0c0a1d" };
      const thumbnailBg: React.CSSProperties = isTitle 
        ? backgroundStyle 
        : { background: bgColors[themeType] };
      
      return (
        <div className="w-full h-full relative overflow-hidden" style={thumbnailBg}>
          {isTitle && hasImage && <div className={`absolute inset-0 ${themeType === "light" ? "bg-gradient-to-t from-white/70 via-white/30 to-transparent" : "bg-gradient-to-t from-black/70 via-black/30 to-transparent"}`} />}
          <div className="absolute inset-0 transform scale-[0.18] origin-top-left" style={{ width: "555%", height: "555%" }}>
            {isTitle ? (
              <div className={`h-full flex flex-col items-center justify-center p-12 text-center ${ui.titleBg}`}>
                <div className={`absolute top-0 right-0 w-96 h-96 ${ui.orb1} rounded-full blur-3xl`} />
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
        className="w-full h-full relative overflow-hidden transition-all duration-500 group"
        style={backgroundStyle}
        onMouseEnter={() => canEdit && !isFullscreen && !isPublicView && setActiveSlideIndex(index)}
        onMouseLeave={() => !isEditing && setActiveSlideIndex(null)}
      >
        {theme.overlay && !hasImage && <div className="absolute inset-0" style={{ background: theme.overlay }} />}

        {/* Slide Menu - only show for editors, not in public view */}
        {canEdit && !isFullscreen && !isPublicView && (isHovered || showSlideMenu === index) && (
          <SlideMenu
            index={index}
            totalSlides={slides.length}
            showMenu={showSlideMenu === index}
            imageCount={getSlideImages(slide).length}
            onToggleMenu={() => setShowSlideMenu(showSlideMenu === index ? null : index)}
            onChangeLayout={() => { setActiveSlideIndex(index); setShowLayoutModal(true); setShowSlideMenu(null); }}
            onDuplicate={() => duplicateSlide(index)}
            onAddSlide={() => addSlideAt(index)}
            onAddImage={() => { setShowImageModal(index); setEditingImageIndex(null); setImageUrl(""); setShowSlideMenu(null); }}
            onManageImages={() => { setShowImageModal(index); setEditingImageIndex(null); setImageUrl(""); setShowSlideMenu(null); }}
            onMoveUp={() => moveSlide(index, "up")}
            onMoveDown={() => moveSlide(index, "down")}
            onDelete={() => deleteSlide(index)}
          />
        )}

        {/* Title Slide */}
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
      <div className="max-w-6xl mx-auto space-y-12 pb-12">
        {slides.map((slide, index) => {
          const isTitle = slide.type === "title";
          
          // Title slides keep aspect-video, content slides grow dynamically
          if (isTitle) {
            return (
              <div 
                key={index} 
                id={`slide-${index}`} 
                className={`w-full aspect-video rounded-lg shadow-2xl overflow-hidden scroll-mt-24 ring-1 ${ui.ring}`}
              >
                {renderSlide(slide, index, true)}
              </div>
            );
          }
          
          // Content slides - render without fixed height constraint
          return (
            <div 
              key={index} 
              id={`slide-${index}`} 
              className={`w-full rounded-lg shadow-2xl overflow-hidden scroll-mt-24 ring-1 ${ui.ring}`}
            >
              <ScrollSlideContent slide={slide} index={index} theme={theme} renderSlide={renderSlide} />
            </div>
          );
        })}
        <div className="text-center py-8">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-sm shadow-lg border ${ui.endCard}`}>
            <Sparkles size={20} style={{ color: theme.colors.primary }} />
            <span className={`font-semibold ${ui.endText}`}>End of Presentation</span>
          </div>
          <p className={`mt-4 ${ui.endMuted}`}>{slides.length} slides • Created with PPT Master</p>
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
      `}</style>

      <div className={`min-h-screen ${getUIColors(getThemeType(theme)).pageBg}`}>
        {/* Header - hidden for public view */}
        {!isFullscreen && !isPublicView && (
          <Header
            title={presentation.title}
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
            onBack={() => router.push("/dashboard")}
            onEditTitle={() => setIsEditingTitle(true)}
            onTitleChange={setEditedTitle}
            onSaveTitle={handleSaveTitle}
            onCancelEditTitle={() => { setEditedTitle(presentation.title); setIsEditingTitle(false); }}
            onToggleViewMode={() => { setViewMode(viewMode === "slides" ? "scroll" : "slides"); if (viewMode === "scroll") setShowThumbnails(true); }}
            onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
            onExport={() => setShowExportModal(true)}
            onShare={() => setShowShareModal(true)}
            onPresent={toggleFullscreen}
          />
        )}

        {/* Main content */}
        <div className={`${isFullscreen ? "" : "px-4 py-8"}`}>
          {viewMode === "scroll" && !isFullscreen ? (
            <div className="flex gap-6 max-w-7xl mx-auto">
              {showThumbnails && !isPublicView && (
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
              <div className="flex-1">{renderScrollableView()}</div>
            </div>
          ) : (
            <div className={`flex gap-6 ${isFullscreen || isPublicView ? "h-screen" : "max-w-7xl mx-auto"}`}>
              {showThumbnails && !isFullscreen && !isPublicView && viewMode === "slides" && (
                <div className={`w-44 shrink-0 space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin pr-2 sticky top-20 ${getUIColors(getThemeType(theme)).scrollbar}`}>
                  {slides.map((slide, index) => {
                    const ui = getUIColors(getThemeType(theme));
                    return (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className="w-full group relative"
                      >
                        <div 
                          className={`aspect-video overflow-hidden transition-all duration-200 ring-1 ${
                            currentSlide === index 
                              ? "ring-2 shadow-lg" 
                              : `${ui.ringHover} opacity-70 hover:opacity-100`
                          }`}
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

              <div className={`flex-1 flex flex-col ${isFullscreen ? "h-full" : ""}`}>
                {(() => {
                  const isTitle = currentSlideData.type === "title";
                  const bulletCount = currentSlideData.bulletPoints?.length || 0;
                  // Title slides and fullscreen keep aspect-video, content slides grow dynamically
                  const useFixedRatio = isFullscreen || isTitle || bulletCount <= 3;
                  const dynamicHeight = Math.max(450, 380 + bulletCount * 65);
                  
                  if (useFixedRatio) {
                    return (
                      <div className={`relative overflow-hidden ${isFullscreen ? "w-full h-full" : `aspect-video w-full rounded-lg shadow-2xl ring-1 ${getUIColors(getThemeType(theme)).ring}`}`}>
                        {renderSlide(currentSlideData, currentSlide, true)}
                      </div>
                    );
                  }
                  
                  return (
                    <div 
                      className={`relative overflow-hidden w-full rounded-lg shadow-2xl ring-1 ${getUIColors(getThemeType(theme)).ring}`}
                      style={{ height: `${dynamicHeight}px` }}
                    >
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
                  <div className={`mt-4 text-center text-sm ${getUIColors(getThemeType(theme)).endMuted}`}>
                    <span>Slide {currentSlide + 1} of {slides.length}</span>
                    <span className="ml-2 opacity-70">• Press <kbd className={`px-1.5 py-0.5 rounded text-xs ${getUIColors(getThemeType(theme)).kbd}`}>F</kbd> for fullscreen</span>
                  </div>
                )}
                
                {/* Public view title overlay */}
                {isPublicView && (
                  <div className="fixed top-4 left-4 z-40">
                    <h1 className={`text-lg font-semibold ${getUIColors(getThemeType(theme)).headerText} bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg`}>
                      {presentation.title}
                    </h1>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isFullscreen && (
          <button onClick={toggleFullscreen} className="fixed top-6 right-6 p-3 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-50">
            <Minimize2 size={20} />
          </button>
        )}

        {viewMode === "scroll" && !isFullscreen && <FeedbackSection presentationId={presentation.id} theme={theme} />}

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

        {showExportModal && isOwner && <ExportModal isExporting={isExporting} theme={theme} onExport={handleExport} onClose={() => setShowExportModal(false)} />}

        {showShareModal && isOwner && <ShareModal presentationId={presentation.id} onClose={() => setShowShareModal(false)} />}
      </div>
    </>
  );
}


// Sub-components
function Header({
  title, editedTitle, isEditingTitle, slidesCount, mode, viewMode, showThumbnails, isOwner, theme,
  isSaving, hasUnsavedChanges,
  onBack, onEditTitle, onTitleChange, onSaveTitle, onCancelEditTitle, onToggleViewMode, onToggleThumbnails, onExport, onShare, onPresent,
}: {
  title: string; editedTitle: string; isEditingTitle: boolean; slidesCount: number; mode: string;
  viewMode: "slides" | "scroll"; showThumbnails: boolean; isOwner: boolean; theme: Theme;
  isSaving?: boolean; hasUnsavedChanges?: boolean;
  onBack: () => void; onEditTitle: () => void; onTitleChange: (v: string) => void; onSaveTitle: () => void;
  onCancelEditTitle: () => void; onToggleViewMode: () => void; onToggleThumbnails: () => void;
  onExport: () => void; onShare: () => void; onPresent: () => void;
}) {
  const themeType = getThemeType(theme);
  const ui = getUIColors(themeType);
  return (
    <header className={`backdrop-blur-md border-b px-4 py-2.5 sticky top-0 z-50 ${ui.headerBg}`}>
      <div className="flex items-center justify-between">
        {/* Left section - Back & Title */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-1.5 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`}>
            <ArrowLeft size={18} />
          </button>
          <div className={`h-5 w-px ${ui.divider}`} />
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") onSaveTitle(); else if (e.key === "Escape") onCancelEditTitle(); }}
                  className={`font-medium border-b bg-transparent focus:outline-none text-sm ${ui.headerText}`}
                  style={{ borderColor: theme.colors.primary }}
                  autoFocus
                />
                <button onClick={onSaveTitle} className={`p-1 rounded ${ui.headerHover} ${ui.headerIcon}`}><CheckCircle2 size={14} /></button>
                <button onClick={onCancelEditTitle} className={`p-1 rounded ${ui.headerHover} ${ui.headerMuted}`}><X size={14} /></button>
              </div>
            ) : (
              <h1 
                className={`font-medium text-sm truncate max-w-[300px] cursor-pointer transition-colors ${ui.headerText}`}
                style={{ ["--hover-color" as string]: theme.colors.primary }}
                onClick={isOwner ? onEditTitle : undefined}
              >
                {title}
              </h1>
            )}
            <div className="flex items-center gap-2">
              <p className={`text-xs ${ui.headerMuted}`}>{slidesCount} slides{mode === "ai" && " • AI"}</p>
              {isSaving && (
                <span className={`text-xs ${ui.headerMuted} flex items-center gap-1`}>
                  <Loader2 size={10} className="animate-spin" /> Saving...
                </span>
              )}
              {!isSaving && hasUnsavedChanges && (
                <span className={`text-xs ${ui.headerMuted}`}>• Unsaved</span>
              )}
              {!isSaving && !hasUnsavedChanges && isOwner && (
                <span className="text-xs text-emerald-500">• Saved</span>
              )}
            </div>
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onToggleViewMode} 
            className={`p-2 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`}
            title={viewMode === "slides" ? "Scroll View" : "Slides View"}
          >
            {viewMode === "slides" ? <Grid3X3 size={18} /> : <Play size={18} />}
          </button>
          <button 
            onClick={onToggleThumbnails} 
            className={`p-2 rounded transition-colors ${showThumbnails ? ui.headerActive : `${ui.headerIcon} ${ui.headerHover}`}`}
            title="Toggle Thumbnails"
          >
            <LayoutGrid size={18} />
          </button>
          
          <div className={`h-5 w-px mx-1 ${ui.divider}`} />
          
          {isOwner && (
            <>
              <button onClick={onExport} className={`p-2 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`} title="Export">
                <Download size={18} />
              </button>
              <button onClick={onShare} className={`p-2 rounded transition-colors ${ui.headerHover} ${ui.headerIcon}`} title="Share">
                <Share2 size={18} />
              </button>
            </>
          )}
          
          <div className={`h-5 w-px mx-1 ${ui.divider}`} />
          
          <button 
            onClick={onPresent} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: theme.colors.primary, color: themeType === "light" ? "#ffffff" : "#18181b" }}
          >
            <Play size={14} />
            <span className="hidden sm:inline">Present</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function SlideMenu({
  index, totalSlides, showMenu, imageCount, onToggleMenu, onChangeLayout, onDuplicate, onAddSlide, onAddImage, onManageImages, onMoveUp, onMoveDown, onDelete,
}: {
  index: number; totalSlides: number; showMenu: boolean; imageCount: number;
  onToggleMenu: () => void; onChangeLayout: () => void; onDuplicate: () => void; onAddSlide: () => void;
  onAddImage: () => void; onManageImages: () => void;
  onMoveUp: () => void; onMoveDown: () => void; onDelete: () => void;
}) {
  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    action();
  };

  return (
    <div data-slide-menu className="absolute top-4 right-4 z-30" onMouseDown={(e) => e.stopPropagation()}>
      <button 
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleAction(onToggleMenu)} 
        className="p-2 rounded-lg bg-zinc-900/90 backdrop-blur-sm shadow-lg hover:bg-zinc-800 transition-all border border-zinc-700"
      >
        <MoreHorizontal size={18} className="text-zinc-300" />
      </button>
      {showMenu && (
        <div data-slide-menu className="absolute top-full right-0 mt-2 w-52 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-700 py-2 z-50" onMouseDown={(e) => e.stopPropagation()}>
          <button onMouseDown={(e) => e.stopPropagation()} onClick={handleAction(onAddSlide)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-emerald-400 hover:bg-emerald-900/30">
            <PlusCircle size={16} />Add Slide After
          </button>
          <div className="border-t border-zinc-700 my-1" />
          <button onMouseDown={(e) => e.stopPropagation()} onClick={handleAction(onAddImage)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-cyan-400 hover:bg-cyan-900/30">
            <ImagePlus size={16} />
            {imageCount > 0 ? `Manage Images (${imageCount})` : "Add Image"}
          </button>
          <div className="border-t border-zinc-700 my-1" />
          <button onMouseDown={(e) => e.stopPropagation()} onClick={handleAction(onChangeLayout)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800">
            <LayoutGrid size={16} />Change Layout
          </button>
          <button onMouseDown={(e) => e.stopPropagation()} onClick={handleAction(onDuplicate)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800">
            <Copy size={16} />Duplicate Slide
          </button>
          <button onMouseDown={(e) => e.stopPropagation()} onClick={handleAction(onMoveUp)} disabled={index === 0} className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed">
            <MoveUp size={16} />Move Up
          </button>
          <button onMouseDown={(e) => e.stopPropagation()} onClick={handleAction(onMoveDown)} disabled={index === totalSlides - 1} className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed">
            <MoveDown size={16} />Move Down
          </button>
          <div className="border-t border-zinc-700 my-1" />
          <button onMouseDown={(e) => e.stopPropagation()} onClick={handleAction(onDelete)} disabled={totalSlides <= 1} className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-900/30 disabled:opacity-40 disabled:cursor-not-allowed">
            <Trash2 size={16} />Delete Slide
          </button>
        </div>
      )}
    </div>
  );
}

function TitleSlide({
  slide, index, totalSlides, theme, hasImage, isOwner, isFullscreen, isHovered, isEditing, editingText,
  onStartEditing, onUpdateContent, onFinishEditing,
}: {
  slide: SlideData; index: number; totalSlides: number; theme: Theme; hasImage: boolean;
  isOwner: boolean; isFullscreen: boolean; isHovered: boolean; isEditing: boolean; editingText: EditingState | null;
  onStartEditing: (i: number, f: string, b?: number) => void; onUpdateContent: (i: number, f: string, v: string, b?: number) => void; onFinishEditing: () => void;
}) {
  const canEdit = isOwner && !isFullscreen;
  const themeType = getThemeType(theme);
  const ui = getUIColors(themeType);

  // ELEGANT NOIR - Sophisticated dark with geometric accents
  if (themeType === "dark") {
    return (
      <div className="h-full relative overflow-hidden">
        {!hasImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
            {/* Geometric accent lines */}
            <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-amber-500/30 to-transparent" />
            <div className="absolute top-0 left-1/4 w-32 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
            <div className="absolute bottom-0 right-1/4 w-px h-24 bg-gradient-to-t from-indigo-500/20 to-transparent" />
            <div className="absolute bottom-0 right-1/4 w-24 h-px bg-gradient-to-l from-indigo-500/20 to-transparent" />
          </div>
        )}
        {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />}
        
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
          <div className="absolute top-8 left-8 flex items-center gap-3">
            <span className="font-mono text-sm font-medium text-amber-500">{String(index + 1).padStart(2, "0")}</span>
            <div className="w-16 h-px bg-gradient-to-r from-amber-500 to-transparent" />
            <span className="text-xs font-medium uppercase tracking-widest text-zinc-600">/ {String(totalSlides).padStart(2, "0")}</span>
          </div>

          {/* Decorative frame */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] border border-zinc-800/50 rounded-lg pointer-events-none" />
          
          <EditableText
            value={slide.title}
            isEditing={isEditing && editingText?.field === "title"}
            onStartEdit={() => onStartEditing(index, "title")}
            onChange={(val) => onUpdateContent(index, "title", val)}
            onFinish={onFinishEditing}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight"
            style={{ fontFamily: theme.fonts.heading.family, color: "#fafafa", letterSpacing: "-0.03em" }}
            isOwner={canEdit}
            isHovered={isHovered}
          />
          {slide.subtitle && (
            <EditableText
              value={slide.subtitle}
              isEditing={isEditing && editingText?.field === "subtitle"}
              onStartEdit={() => onStartEditing(index, "subtitle")}
              onChange={(val) => onUpdateContent(index, "subtitle", val)}
              onFinish={onFinishEditing}
              className="text-xl md:text-2xl max-w-3xl"
              style={{ fontFamily: theme.fonts.body.family, color: "#a1a1aa" }}
              isOwner={canEdit}
              isHovered={isHovered}
            />
          )}
          
          <div className="flex items-center gap-4 mt-12">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-amber-500/60" />
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>
    );
  }

  // ARCTIC FROST - Clean, airy with floating elements
  if (themeType === "light") {
    return (
      <div className="h-full relative overflow-hidden">
        {!hasImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-cyan-50">
            <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-violet-500/8 rounded-full blur-3xl" />
            {/* Floating circles decoration */}
            <div className="absolute top-20 right-20 w-4 h-4 rounded-full border-2 border-cyan-400/30" />
            <div className="absolute top-32 right-32 w-6 h-6 rounded-full border-2 border-cyan-400/20" />
            <div className="absolute bottom-24 left-24 w-5 h-5 rounded-full bg-cyan-400/20" />
            <div className="absolute top-1/4 left-16 w-3 h-3 rounded-full bg-violet-400/20" />
          </div>
        )}
        {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-white/30" />}
        
        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
          <div className="absolute top-8 left-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
              <span className="font-mono text-sm font-bold text-cyan-600">{index + 1}</span>
            </div>
            <div className="w-12 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
            <span className="text-xs font-medium text-slate-400">of {totalSlides}</span>
          </div>

          {/* Top decorative bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full" />
          
          <EditableText
            value={slide.title}
            isEditing={isEditing && editingText?.field === "title"}
            onStartEdit={() => onStartEditing(index, "title")}
            onChange={(val) => onUpdateContent(index, "title", val)}
            onFinish={onFinishEditing}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight"
            style={{ fontFamily: theme.fonts.heading.family, color: "#0f172a", letterSpacing: "-0.03em" }}
            isOwner={canEdit}
            isHovered={isHovered}
          />
          {slide.subtitle && (
            <EditableText
              value={slide.subtitle}
              isEditing={isEditing && editingText?.field === "subtitle"}
              onStartEdit={() => onStartEditing(index, "subtitle")}
              onChange={(val) => onUpdateContent(index, "subtitle", val)}
              onFinish={onFinishEditing}
              className="text-xl md:text-2xl max-w-3xl"
              style={{ fontFamily: theme.fonts.body.family, color: "#64748b" }}
              isOwner={canEdit}
              isHovered={isHovered}
            />
          )}
          
          <div className="flex items-center gap-3 mt-12">
            <div className="w-3 h-3 rounded-full bg-cyan-500/40" />
            <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500/60 to-violet-500/40 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-violet-500/40" />
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      </div>
    );
  }

  // SUNSET GRADIENT - Warm, dramatic with glowing accents
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-[#1c1017] to-[#261520]">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl" />
          {/* Glowing accent lines */}
          <div className="absolute top-1/4 left-0 w-48 h-px bg-gradient-to-r from-pink-500/40 to-transparent" />
          <div className="absolute bottom-1/3 right-0 w-32 h-px bg-gradient-to-l from-orange-500/30 to-transparent" />
          {/* Corner glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 to-transparent" />
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-[#1c1017]/95 via-[#1c1017]/60 to-[#1c1017]/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/30">
            <span className="font-mono text-sm font-bold text-pink-300">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="w-12 h-px bg-gradient-to-r from-pink-500/50 to-transparent" />
          <span className="text-xs font-medium text-pink-300/50">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>

        {/* Decorative glow behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-32 bg-gradient-to-r from-pink-500/10 via-orange-500/10 to-pink-500/10 blur-2xl rounded-full pointer-events-none" />
        
        <EditableText
          value={slide.title}
          isEditing={isEditing && editingText?.field === "title"}
          onStartEdit={() => onStartEditing(index, "title")}
          onChange={(val) => onUpdateContent(index, "title", val)}
          onFinish={onFinishEditing}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight relative"
          style={{ fontFamily: theme.fonts.heading.family, color: "#ffffff", letterSpacing: "-0.03em" }}
          isOwner={canEdit}
          isHovered={isHovered}
        />
        {slide.subtitle && (
          <EditableText
            value={slide.subtitle}
            isEditing={isEditing && editingText?.field === "subtitle"}
            onStartEdit={() => onStartEditing(index, "subtitle")}
            onChange={(val) => onUpdateContent(index, "subtitle", val)}
            onFinish={onFinishEditing}
            className="text-xl md:text-2xl max-w-3xl"
            style={{ fontFamily: theme.fonts.body.family, color: "#f9a8d4" }}
            isOwner={canEdit}
            isHovered={isHovered}
          />
        )}
        
        <div className="flex items-center gap-4 mt-12">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-pink-500/60 rounded-full" />
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-orange-400" />
          <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-orange-500/60 rounded-full" />
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-900/40 to-transparent" />
    </div>
  );

  // OCEAN DEPTHS - Deep teal with flowing waves and circular accents
  return (
    <div className="h-full relative overflow-hidden">
      {!hasImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f35] to-[#122a45]">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-3xl" />
          {/* Decorative circles */}
          <div className="absolute top-20 right-20 w-32 h-32 rounded-full border border-teal-500/20" />
          <div className="absolute top-28 right-28 w-24 h-24 rounded-full border border-cyan-500/15" />
          <div className="absolute bottom-32 left-16 w-20 h-20 rounded-full border border-teal-500/15" />
          {/* Wave accent */}
          <svg className="absolute bottom-0 left-0 right-0 h-32 opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#14b8a6" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
      )}
      {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/95 via-[#0a1628]/60 to-[#0a1628]/30" />}
      
      <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-teal-500/40 flex items-center justify-center bg-[#0a1628]/50 backdrop-blur-sm">
            <span className="font-mono text-sm font-bold text-teal-400">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-teal-500/50 to-transparent" />
          <span className="text-xs font-medium text-cyan-400/50">/ {String(totalSlides).padStart(2, "0")}</span>
        </div>

        {/* Decorative glow behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-40 bg-gradient-to-r from-teal-500/10 via-cyan-500/15 to-teal-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <EditableText
          value={slide.title}
          isEditing={isEditing && editingText?.field === "title"}
          onStartEdit={() => onStartEditing(index, "title")}
          onChange={(val) => onUpdateContent(index, "title", val)}
          onFinish={onFinishEditing}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 max-w-5xl leading-tight relative"
          style={{ fontFamily: theme.fonts.heading.family, color: "#ffffff", letterSpacing: "-0.02em" }}
          isOwner={canEdit}
          isHovered={isHovered}
        />
        {slide.subtitle && (
          <EditableText
            value={slide.subtitle || ""}
            isEditing={isEditing && editingText?.field === "subtitle"}
            onStartEdit={() => onStartEditing(index, "subtitle")}
            onChange={(val) => onUpdateContent(index, "subtitle", val)}
            onFinish={onFinishEditing}
            className="text-xl md:text-2xl max-w-3xl"
            style={{ fontFamily: theme.fonts.body.family, color: "#7dd3fc" }}
            isOwner={canEdit}
            isHovered={isHovered}
          />
        )}
        
        <div className="flex items-center gap-4 mt-12">
          <div className="w-4 h-4 rounded-full border-2 border-teal-500/40" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-teal-500/60 via-cyan-500/40 to-teal-500/60 rounded-full" />
          <div className="w-3 h-3 rounded-full bg-teal-500/60" />
          <div className="w-20 h-0.5 bg-gradient-to-r from-teal-500/60 via-cyan-500/40 to-teal-500/60 rounded-full" />
          <div className="w-4 h-4 rounded-full border-2 border-cyan-500/40" />
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
    </div>
  );
}

function ThumbnailSidebar({
  slides, onSlideClick, onClose, renderSlide, theme, onAddSlide, isOwner,
}: {
  slides: SlideData[]; onSlideClick: (i: number) => void; onClose: () => void;
  renderSlide: (slide: SlideData, index: number, isMain: boolean) => React.ReactNode; theme: Theme;
  onAddSlide: (index: number) => void; isOwner: boolean;
}) {
  const ui = getUIColors(getThemeType(theme));
  return (
    <div className="w-44 shrink-0">
      <div className={`sticky top-24 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-thin ${ui.scrollbar}`}>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className={`text-xs font-semibold uppercase tracking-wide ${ui.headerMuted}`}>Slides</span>
          <button onClick={onClose} className={`p-1 rounded transition-colors ${ui.headerHover} ${ui.headerMuted}`}><X size={14} /></button>
        </div>
        {slides.map((slide, index) => (
          <button key={index} onClick={() => onSlideClick(index)} className="w-full group relative">
            <div className={`aspect-video overflow-hidden transition-all duration-200 ring-1 hover:ring-2 hover:shadow-md ${ui.ringHover}`}>
              {renderSlide(slide, index, false)}
            </div>
            <div className={`absolute top-1 left-1 w-4 h-4 backdrop-blur-sm flex items-center justify-center ${ui.thumbBg}`}>
              <span className={`text-[9px] font-bold ${ui.thumbText}`}>{index + 1}</span>
            </div>
          </button>
        ))}
        {isOwner && (
          <button 
            onClick={() => onAddSlide(slides.length - 1)} 
            className={`w-full aspect-video rounded border-2 border-dashed flex items-center justify-center transition-colors ${ui.ringHover} ${ui.headerMuted} hover:border-solid`}
            style={{ borderColor: theme.colors.primary + "40" }}
          >
            <div className="text-center">
              <PlusCircle size={20} className="mx-auto mb-1" style={{ color: theme.colors.primary }} />
              <span className="text-[10px]">Add Slide</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function NavigationControls({
  currentSlide, totalSlides, isFullscreen, onPrev, onNext, onGoTo, theme,
}: {
  currentSlide: number; totalSlides: number; isFullscreen: boolean;
  onPrev: () => void; onNext: () => void; onGoTo: (i: number) => void; theme: Theme;
}) {
  const ui = getUIColors(getThemeType(theme));
  return (
    <div className={`flex items-center justify-between ${isFullscreen ? "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent" : "mt-6"}`}>
      <button
        onClick={onPrev}
        disabled={currentSlide === 0}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          isFullscreen ? "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20" : ui.navBtn
        }`}
      >
        <ChevronLeft size={18} /><span className="hidden sm:inline text-sm">Previous</span>
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => onGoTo(index)}
            className={`transition-all duration-300 ${
              currentSlide === index
                ? "w-6 h-1.5 rounded-full"
                : `w-1.5 h-1.5 rounded-full ${isFullscreen ? "bg-white/40 hover:bg-white/60" : ui.navDot}`
            }`}
            style={currentSlide === index ? { backgroundColor: theme.colors.primary } : {}}
          />
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={currentSlide === totalSlides - 1}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          isFullscreen ? "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20" : ui.navBtn
        }`}
      >
        <span className="hidden sm:inline text-sm">Next</span><ChevronRight size={18} />
      </button>
    </div>
  );
}

function MultiImageModal({
  images, imageUrl, editingIndex, isLoading, theme, onUrlChange, onAddImage, onUpdateImage, onRemoveImage, onReorderImages, onEditImage, onCancelEdit, onClose,
}: {
  images: SlideImage[]; imageUrl: string; editingIndex: number | null; isLoading: boolean; theme: Theme;
  onUrlChange: (url: string) => void; onAddImage: () => void; onUpdateImage: (idx: number) => void;
  onRemoveImage: (idx: number) => void; onReorderImages: (from: number, to: number) => void;
  onEditImage: (idx: number) => void; onCancelEdit: () => void; onClose: () => void;
}) {
  const themeType = getThemeType(theme);
  const isDark = themeType !== "light";
  const isEditing = editingIndex !== null;
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onReorderImages(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? "bg-zinc-900 border border-zinc-700" : "bg-white border border-slate-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-zinc-700" : "border-slate-200"}`}>
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Manage Images {images.length > 0 && `(${images.length})`}
          </h3>
          <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-slate-100 text-slate-500"}`}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Existing images grid with drag-and-drop */}
          {images.length > 0 && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                Current Images <span className="text-xs font-normal opacity-70">(drag to reorder)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`relative group rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing transition-all ${
                      editingIndex === idx ? "ring-2" : ""
                    } ${draggedIndex === idx ? "opacity-50 scale-95" : ""} ${
                      dragOverIndex === idx ? "ring-2 ring-cyan-500 scale-105" : ""
                    } ${isDark ? "border-zinc-700" : "border-slate-200"}`} 
                    style={editingIndex === idx ? { borderColor: theme.colors.primary } : {}}
                  >
                    <div className="aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover pointer-events-none" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEditImage(idx)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Edit"
                      >
                        <ImagePlus size={16} />
                      </button>
                      <button
                        onClick={() => onRemoveImage(idx)}
                        className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium ${isDark ? "bg-black/60 text-white" : "bg-white/80 text-slate-700"}`}>
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add/Edit image form */}
          <div className={`p-4 rounded-lg border ${isDark ? "border-zinc-700 bg-zinc-800/50" : "border-slate-200 bg-slate-50"}`}>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
              {isEditing ? `Edit Image ${editingIndex! + 1}` : "Add New Image"}
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isDark 
                  ? "bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-amber-500" 
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-500"
              } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
              style={{ ["--tw-ring-color" as string]: theme.colors.primary }}
            />
            <p className={`mt-2 text-xs ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
              Paste a direct link to an image (JPG, PNG, WebP). Add multiple images for gallery layouts.
            </p>
            
            {imageUrl && (
              <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-zinc-800 border border-dashed border-zinc-600 max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => onUpdateImage(editingIndex!)}
                    disabled={!imageUrl || isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Update
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className={`px-4 py-2 rounded-lg transition-colors ${isDark ? "text-zinc-400 hover:bg-zinc-700" : "text-slate-600 hover:bg-slate-200"}`}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={onAddImage}
                  disabled={!imageUrl || isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  Add Image
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className={`flex items-center justify-end p-4 border-t ${isDark ? "border-zinc-700" : "border-slate-200"}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors ${isDark ? "text-zinc-400 hover:bg-zinc-800" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Component for scroll view slides with dynamic height
function ScrollSlideContent({ 
  slide, 
  index, 
  theme, 
  renderSlide 
}: { 
  slide: SlideData; 
  index: number; 
  theme: Theme;
  renderSlide: (slide: SlideData, index: number, isMain: boolean) => React.ReactNode;
}) {
  const themeType = getThemeType(theme);
  const bulletCount = slide.bulletPoints?.length || 0;
  // Calculate height based on content - each bullet adds height
  const calculatedHeight = Math.max(450, 380 + bulletCount * 65);
  
  const bgColors: Record<ThemeType, string> = {
    dark: "bg-gradient-to-br from-zinc-900 via-zinc-950 to-black",
    light: "bg-gradient-to-br from-slate-50 via-white to-slate-100",
    sunset: "bg-gradient-to-br from-rose-950 via-[#1c1017] to-[#261520]",
    ocean: "bg-gradient-to-br from-[#0a1628] via-[#0d1f35] to-[#122a45]",
    aurora: "bg-gradient-to-br from-[#0f0a1a] via-[#1a1030] to-[#150d24]",
    ember: "bg-gradient-to-br from-[#1a0a0a] via-[#2a1010] to-[#3a1515]",
    midnight: "bg-gradient-to-br from-[#0c0a1d] via-[#1a1735] to-[#12102a]",
  };
  
  return (
    <div 
      className={`w-full ${bgColors[themeType]} relative`}
      style={{ height: `${calculatedHeight}px` }}
    >
      {renderSlide(slide, index, true)}
    </div>
  );
}
