"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
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

interface PresentationViewerProps {
  presentation: PresentationData;
  mode: string;
  isOwner: boolean;
  collaboratorRole?: string;
  isPublicView?: boolean;
}

export default function PresentationViewer({
  presentation,
  mode,
  isOwner,
  collaboratorRole,
  isPublicView = false,
}: PresentationViewerProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(isPublicView);
  const [showThumbnails, setShowThumbnails] = useState(!isPublicView);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [viewMode, setViewMode] = useState<"slides" | "scroll">("slides");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(presentation.title);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
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
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const slidesRef = useRef<SlideData[]>(presentation.slides);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const slides = slidesData;
  const { content } = presentation;
  const theme = getThemeById(content.theme || "") || getDefaultTheme();
  const fontsUrl = getGoogleFontsUrl(theme);

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

  const updateSlidesWithSave = useCallback((newSlides: SlideData[]) => {
    setSlidesData(newSlides);
    slidesRef.current = newSlides;
    setHasUnsavedChanges(true);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveSlides();
    }, 2000);
  }, [saveSlides]);

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
        const html = await response.text();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => {
            const instructions = printWindow.document.createElement("div");
            instructions.innerHTML = `
              <div style="position: fixed; top: 0; left: 0; right: 0; background: #1a1a1d; color: white; padding: 16px; z-index: 9999; display: flex; justify-content: space-between; align-items: center; font-family: Arial, sans-serif;">
                <span>${format === "pdf" ? "Press Ctrl+P (Cmd+P on Mac) to save as PDF" : "Right-click on slides to save as images"}</span>
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
      const bgColors: Record<ThemeType, string> = { dark: "#0a0a0b", light: "#f8fafc", sunset: "#1c1017", ocean: "#0a1628", aurora: "#0f0a1a", ember: "#1a0a0a", midnight: "#0c0a1d", cyber: "#0a0a0f", alien: "#0a0f0a", corporate: "#ffffff" };
      const thumbnailBg: React.CSSProperties = isTitle ? backgroundStyle : { background: bgColors[themeType] };
      
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
          
          if (isTitle) {
            return (
              <div key={index} id={`slide-${index}`} className={`w-full aspect-video rounded-lg shadow-2xl overflow-hidden scroll-mt-24 ring-1 ${ui.ring}`}>
                {renderSlide(slide, index, true)}
              </div>
            );
          }
          
          return (
            <div key={index} id={`slide-${index}`} className={`w-full rounded-lg shadow-2xl overflow-hidden scroll-mt-24 ring-1 ${ui.ring}`}>
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

              <div className={`flex-1 flex flex-col ${isFullscreen ? "h-full" : ""}`}>
                {(() => {
                  const isTitle = currentSlideData.type === "title";
                  const bulletCount = currentSlideData.bulletPoints?.length || 0;
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
                    <div className={`relative overflow-hidden w-full rounded-lg shadow-2xl ring-1 ${getUIColors(getThemeType(theme)).ring}`} style={{ height: `${dynamicHeight}px` }}>
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

// Component for scroll view slides with dynamic height
function ScrollSlideContent({ slide, index, theme, renderSlide }: { 
  slide: SlideData; 
  index: number; 
  theme: Theme;
  renderSlide: (slide: SlideData, index: number, isMain: boolean) => React.ReactNode;
}) {
  const themeType = getThemeType(theme);
  const bulletCount = slide.bulletPoints?.length || 0;
  const calculatedHeight = Math.max(450, 380 + bulletCount * 65);
  
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
  };
  
  return (
    <div className={`w-full ${bgColors[themeType]} relative`} style={{ height: `${calculatedHeight}px` }}>
      {renderSlide(slide, index, true)}
    </div>
  );
}
