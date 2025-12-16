"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Edit3,
  Download,
  Share2,
  Play,
  Grid3X3,
  Sparkles,
  ImageIcon,
  X,
  Globe,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";

interface SlideData {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  image?: {
    url: string;
    alt: string;
    photographer?: string;
    photographerUrl?: string;
    source: string;
  } | null;
  layout?: string;
}

interface PresentationData {
  id: string;
  title: string;
  description: string | null;
  slides: SlideData[];
  content: {
    theme?: string;
    themeConfig?: Record<string, unknown>;
    imageSource?: string;
    metadata?: Record<string, unknown>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PresentationViewerProps {
  presentation: PresentationData;
  mode: string;
  isOwner: boolean;
  collaboratorRole?: string;
}

// Get Google Fonts for the theme
function getGoogleFontsUrl(theme: Theme): string {
  const fonts = new Set<string>();
  
  // Extract font family names (remove fallbacks and quotes)
  const extractFontName = (family: string) => {
    return family.split(",")[0]?.replace(/['"]/g, "").trim() || "";
  };
  
  fonts.add(extractFontName(theme.fonts.heading.family));
  fonts.add(extractFontName(theme.fonts.body.family));
  
  const fontParams = Array.from(fonts)
    .filter(f => f && !["sans-serif", "serif", "monospace"].includes(f.toLowerCase()))
    .map(f => `family=${f.replace(/\s+/g, "+")}:wght@400;500;600;700`)
    .join("&");
  
  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}

export default function PresentationViewer({
  presentation,
  mode,
  isOwner,
}: PresentationViewerProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [viewMode, setViewMode] = useState<"slides" | "scroll">("scroll"); // Default to scroll view

  const { slides, content } = presentation;
  const theme = getThemeById(content.theme || "") || getDefaultTheme();
  const fontsUrl = getGoogleFontsUrl(theme);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length && !isAnimating) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [slides.length, isAnimating]);

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen();
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
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

  const currentSlideData = slides[currentSlide];

  if (!currentSlideData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white">
          <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">No slides found in this presentation.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render a single slide with beautiful design
  const renderSlide = (slide: SlideData, index: number, isMain: boolean = false) => {
    const hasImage = slide.image?.url && slide.image.source !== "placeholder";
    const isTitle = slide.type === "title";
    
    // Determine background based on slide type and image
    let backgroundStyle: React.CSSProperties = {};
    
    if (isTitle && hasImage) {
      backgroundStyle = {
        backgroundImage: `url(${slide.image!.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    } else if (isTitle) {
      backgroundStyle = {
        background: theme.slideStyles.title.background,
      };
    } else {
      backgroundStyle = {
        backgroundColor: theme.colors.background,
      };
    }

    if (!isMain) {
      // Thumbnail version
      return (
        <div className="w-full h-full relative overflow-hidden" style={backgroundStyle}>
          {isTitle && hasImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          )}
          <div className="relative p-2 h-full flex flex-col justify-end">
            <p
              className="text-[7px] font-semibold line-clamp-2"
              style={{
                color: isTitle ? "#ffffff" : theme.colors.heading,
                textShadow: isTitle ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
              }}
            >
              {slide.title}
            </p>
          </div>
        </div>
      );
    }

    // Main slide version - beautiful full design
    return (
      <div
        className="w-full h-full relative overflow-hidden transition-all duration-500"
        style={backgroundStyle}
      >
        {/* Title Slide Design */}
        {isTitle ? (
          <>
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
              {/* Slide number badge */}
              <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-xs font-medium">
                {index + 1} / {slides.length}
              </div>
              
              {/* Title */}
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl leading-tight animate-fade-in"
                style={{
                  fontFamily: theme.fonts.heading.family,
                  color: "#ffffff",
                  textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  letterSpacing: theme.fonts.heading.letterSpacing,
                }}
              >
                {slide.title}
              </h1>
              
              {/* Subtitle */}
              {slide.subtitle && (
                <p
                  className="text-xl md:text-2xl max-w-2xl opacity-90 animate-fade-in-delay"
                  style={{
                    fontFamily: theme.fonts.body.family,
                    color: "#e2e8f0",
                    lineHeight: theme.fonts.body.lineHeight,
                  }}
                >
                  {slide.subtitle}
                </p>
              )}
              
              {/* Decorative line */}
              <div 
                className="w-24 h-1 rounded-full mt-8"
                style={{ backgroundColor: theme.colors.primary }}
              />

              {/* Pexels attribution */}
              {slide.image?.source === "pexels" && slide.image.photographer && (
                <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full">
                  Photo by{" "}
                  <a
                    href={slide.image.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                  >
                    {slide.image.photographer}
                  </a>
                  {" "}on Pexels
                </div>
              )}
            </div>
          </>
        ) : (
          /* Content Slide Design */
          <div className="h-full flex">
            {/* Content area */}
            <div className={`flex flex-col justify-center p-12 ${hasImage ? "w-1/2" : "w-full"}`}>
              {/* Slide number */}
              <div 
                className="inline-flex items-center gap-2 mb-6 text-sm font-medium"
                style={{ color: theme.colors.primary }}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: theme.colors.primary }}>
                  {index + 1}
                </span>
                <span className="opacity-60">of {slides.length}</span>
              </div>
              
              {/* Title */}
              <h2
                className="text-3xl md:text-4xl font-bold mb-8"
                style={{
                  fontFamily: theme.fonts.heading.family,
                  color: theme.colors.heading,
                  letterSpacing: theme.fonts.heading.letterSpacing,
                }}
              >
                {slide.title}
              </h2>
              
              {/* Bullet points with beautiful styling */}
              {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                <ul className="space-y-4">
                  {slide.bulletPoints.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 text-lg md:text-xl animate-fade-in"
                      style={{
                        fontFamily: theme.fonts.body.family,
                        color: theme.colors.text,
                        lineHeight: theme.fonts.body.lineHeight,
                        animationDelay: `${i * 100}ms`,
                      }}
                    >
                      <span
                        className="mt-2.5 w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Image area */}
            {hasImage && (
              <div className="w-1/2 p-6 flex items-center justify-center">
                <div 
                  className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                  style={{ boxShadow: theme.design.shadows.large }}
                >
                  <Image
                    src={slide.image!.url}
                    alt={slide.image!.alt || slide.title}
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                  {/* Gradient overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  
                  {/* Pexels attribution */}
                  {slide.image?.source === "pexels" && slide.image.photographer && (
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                      📷{" "}
                      <a
                        href={slide.image.photographerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {slide.image.photographer}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder for slides expecting images */}
            {slide.image?.source === "placeholder" && (
              <div className="w-1/2 p-6 flex items-center justify-center">
                <div className="w-full h-full rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50/50">
                  <div className="text-center text-slate-400">
                    <ImageIcon size={64} className="mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Image placeholder</p>
                    <p className="text-sm">Click to add image</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Scrollable view rendering - all slides stacked vertically
  const renderScrollableView = () => {
    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-12">
        {slides.map((slide, index) => (
          <div
            key={index}
            id={`slide-${index}`}
            className="w-full aspect-video rounded-2xl shadow-2xl ring-1 ring-slate-200/50 overflow-hidden scroll-mt-24"
          >
            {renderSlide(slide, index, true)}
          </div>
        ))}
        
        {/* End of presentation indicator */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white shadow-lg">
            <Sparkles size={20} />
            <span className="font-semibold">End of Presentation</span>
          </div>
          <p className="mt-4 text-slate-500">
            {slides.length} slides • Created with PPT Master
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('${fontsUrl}');
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.5s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>

      <div className={`min-h-screen ${isFullscreen ? "bg-black" : "bg-gradient-to-br from-slate-100 to-slate-200"}`}>
        {/* Header - hidden in fullscreen */}
        {!isFullscreen && (
          <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 px-6 py-3 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="font-semibold text-slate-900 truncate max-w-[400px]">
                    {presentation.title}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{slides.length} slides</span>
                    {mode === "ai" && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-500" />
                          AI Generated
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setViewMode(viewMode === "slides" ? "scroll" : "slides");
                    if (viewMode === "scroll") setShowThumbnails(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                  title={viewMode === "slides" ? "Switch to scroll view" : "Switch to presentation mode"}
                >
                  {viewMode === "slides" ? "📄 Scroll View" : "🎬 Presentation Mode"}
                </button>
                
                {viewMode === "slides" && (
                  <button 
                    onClick={() => setShowThumbnails(!showThumbnails)}
                    className={`p-2 rounded-xl text-sm transition-colors ${
                      showThumbnails ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                )}
                
                {isOwner && (
                  <>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                      <Edit3 size={16} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                      <Download size={16} />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    <button 
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                      <Share2 size={16} />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </>
                )}
                
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all"
                >
                  <Play size={16} />
                  <span className="hidden sm:inline">Present</span>
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Main content */}
        <div className={`${isFullscreen ? "" : "max-w-7xl mx-auto px-6 py-8"}`}>
          {/* Scrollable view */}
          {viewMode === "scroll" && !isFullscreen ? (
            renderScrollableView()
          ) : (
            <div className={`flex gap-6 ${isFullscreen ? "h-screen" : ""}`}>
              {/* Slide thumbnails sidebar - hidden in fullscreen */}
              {showThumbnails && !isFullscreen && viewMode === "slides" && (
              <div className="w-52 shrink-0 space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-2 scrollbar-thin">
                {slides.map((slide, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-full aspect-video rounded-xl overflow-hidden transition-all duration-200 ${
                      currentSlide === index
                        ? "ring-2 ring-indigo-500 ring-offset-2 shadow-lg scale-[1.02]"
                        : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {renderSlide(slide, index, false)}
                  </button>
                ))}
              </div>
            )}

            {/* Main slide view */}
            <div className={`flex-1 flex flex-col ${isFullscreen ? "h-full" : ""}`}>
              {/* Slide container */}
              <div
                className={`relative overflow-hidden ${
                  isFullscreen 
                    ? "w-full h-full" 
                    : "aspect-video w-full rounded-2xl shadow-2xl ring-1 ring-slate-200/50"
                }`}
              >
                {renderSlide(currentSlideData, currentSlide, true)}
              </div>

              {/* Navigation controls */}
              <div className={`flex items-center justify-between ${isFullscreen ? "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent" : "mt-6"}`}>
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isFullscreen 
                      ? "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20" 
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <ChevronLeft size={20} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Slide dots */}
                <div className="flex items-center gap-1.5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`rounded-full transition-all duration-300 ${
                        currentSlide === index
                          ? `w-8 h-2 ${isFullscreen ? "bg-white" : "bg-indigo-500"}`
                          : `w-2 h-2 ${isFullscreen ? "bg-white/40 hover:bg-white/60" : "bg-slate-300 hover:bg-slate-400"}`
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  disabled={currentSlide === slides.length - 1}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isFullscreen 
                      ? "bg-white/10 backdrop-blur-sm text-white hover:bg-white/20" 
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Slide info - hidden in fullscreen */}
              {!isFullscreen && (
                <div className="mt-4 text-center text-sm text-slate-500">
                  <span>Slide {currentSlide + 1} of {slides.length}</span>
                  {currentSlideData.image?.source === "pexels" && (
                    <span className="ml-2">
                      • Images from{" "}
                      <a
                        href="https://www.pexels.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline font-medium"
                      >
                        Pexels
                      </a>
                    </span>
                  )}
                  <span className="ml-2 text-slate-400">
                    • Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-xs">F</kbd> for fullscreen
                  </span>
                </div>
              )}
            </div>
            </div>
          )}
        </div>

        {/* Fullscreen controls overlay */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="fixed top-6 right-6 p-3 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-50"
          >
            <Minimize2 size={20} />
          </button>
        )}

        {/* Share Modal */}
        {showShareModal && isOwner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                Share Presentation
              </h2>

              <ShareModalContent 
                presentationId={presentation.id}
                onClose={() => setShowShareModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Share Modal Content Component
function ShareModalContent({ presentationId, onClose }: { presentationId: string; onClose: () => void }) {
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShareStatus();
  }, []);

  const fetchShareStatus = async () => {
    try {
      const res = await fetch(`/api/presentations/${presentationId}/share`);
      const data = await res.json();
      setIsPublic(data.isPublic);
      setShareUrl(data.shareUrl || "");
    } catch (error) {
      console.error("Error fetching share status:", error);
    }
  };

  const handleTogglePublic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      const data = await res.json();
      setIsPublic(data.isPublic);
      setShareUrl(data.shareUrl);
    } catch (error) {
      console.error("Failed to update sharing settings");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="mb-6 rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isPublic ? (
              <Globe className="text-green-500" size={24} />
            ) : (
              <Lock className="text-slate-400" size={24} />
            )}
            <div>
              <p className="font-semibold text-slate-900">
                {isPublic ? "Public" : "Private"}
              </p>
              <p className="text-sm text-slate-500">
                {isPublic ? "Anyone with the link can view" : "Only you can access"}
              </p>
            </div>
          </div>
          <button
            onClick={handleTogglePublic}
            disabled={loading}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              isPublic ? "bg-green-500" : "bg-slate-300"
            } ${loading ? "opacity-50" : ""}`}
          >
            <div
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                isPublic ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {isPublic && shareUrl && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">Share Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
            >
              {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Anyone with this link can view your presentation
          </p>
        </div>
      )}

      {!isPublic && (
        <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-600">
          Enable public sharing to get a shareable link
        </div>
      )}
    </>
  );
}
