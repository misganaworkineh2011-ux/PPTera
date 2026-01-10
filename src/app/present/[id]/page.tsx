"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Clock,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  StickyNote,
} from "lucide-react";
import { cn } from "~/lib/utils";
import SlideRenderer from "~/components/presentation/SlideRenderer";
import AnimatedSlide from "~/components/presentation/AnimatedSlide";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import { type PresentationData } from "~/components/presentation/types";

interface PresenterPageProps {
  params: Promise<{ id: string }>;
}

interface PresentationResponse extends PresentationData {
  showWatermark?: boolean;
}

export default function PresenterPage({ params }: PresenterPageProps) {
  const { id } = use(params);

  const [presentation, setPresentation] = useState<PresentationResponse | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [theme, setTheme] = useState<Theme>(getDefaultTheme());
  const [mainWindowConnected, setMainWindowConnected] = useState(false);
  
  // BroadcastChannel for communicating with main app
  const channelRef = useRef<BroadcastChannel | null>(null);
  const mountTimeRef = useRef<number>(0);

  // Initialize BroadcastChannel
  useEffect(() => {
    channelRef.current = new BroadcastChannel(`presentation-${id}`);
    mountTimeRef.current = Date.now();
    
    // Notify main app that presenter view is opened
    channelRef.current.postMessage({ type: "presenter-opened" });
    
    // Listen for messages from main app
    channelRef.current.onmessage = (event) => {
      const { type, slideIndex } = event.data;
      
      switch (type) {
        case "main-connected":
          setMainWindowConnected(true);
          // Sync current slide to main window
          channelRef.current?.postMessage({ 
            type: "slide-change", 
            slideIndex: currentSlide 
          });
          break;
        case "main-disconnected":
          setMainWindowConnected(false);
          break;
        case "slide-change":
          // Main window changed slide, sync here
          if (typeof slideIndex === "number") {
            setCurrentSlide(slideIndex);
          }
          break;
        case "presentation-updated":
          // Presentation data was updated, refetch
          fetchPresentation();
          break;
      }
    };
    
    // Handle page unload to send presenter-closed
    const handleBeforeUnload = () => {
      channelRef.current?.postMessage({ type: "presenter-closed" });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Only send presenter-closed if component was mounted for more than 500ms
      // This prevents React StrictMode double-mount from triggering close
      const mountDuration = Date.now() - mountTimeRef.current;
      if (mountDuration > 500) {
        channelRef.current?.postMessage({ type: "presenter-closed" });
      }
      channelRef.current?.close();
    };
  }, [id]);

  // Broadcast slide changes to main window
  useEffect(() => {
    if (channelRef.current && mainWindowConnected) {
      channelRef.current.postMessage({ 
        type: "slide-change", 
        slideIndex: currentSlide 
      });
    }
  }, [currentSlide, mainWindowConnected]);

  // Fetch presentation
  const fetchPresentation = useCallback(async () => {
    try {
      const res = await fetch(`/api/presentations/${id}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load presentation (${res.status})`);
      }
      const data = await res.json();

      // Check user subscription for watermark
      let showWatermark = true;
      try {
        const userRes = await fetch("/api/user/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          showWatermark = !userData.subscriptionPlan ||
            !["plus", "pro", "ultra"].includes(userData.subscriptionPlan);
        }
      } catch {
        // ignore
      }

      const fullData = { ...data, showWatermark };
      setPresentation(fullData);

      // Resolve theme
      const themeId = data.content?.theme || data.themeId;
      const customThemeData = data.content?.themeConfig || data.theme;

      if (themeId) {
        if (themeId.startsWith("custom-")) {
          if (customThemeData) {
            const customTheme = convertCustomThemeToTheme(customThemeData);
            setTheme(customTheme);
          } else {
            setTheme(getDefaultTheme());
          }
        } else {
          const staticTheme = getThemeById(themeId);
          if (staticTheme) setTheme(staticTheme);
        }
      }

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load presentation";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPresentation();
  }, [fetchPresentation]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Sync fullscreen state with browser fullscreen API
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, presentation, isFullscreen]);

  const goNext = useCallback(() => {
    if (presentation && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, presentation]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const goToSlide = useCallback((index: number) => {
    if (presentation && index >= 0 && index < presentation.slides.length) {
      setCurrentSlide(index);
    }
  }, [presentation]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setElapsedTime(0);
    setIsTimerRunning(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <p className="text-lg">{error || "Presentation not found"}</p>
      </div>
    );
  }

  const slide = presentation.slides[currentSlide];
  const nextSlide = presentation.slides[currentSlide + 1];

  if (!slide) return null;

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold truncate max-w-xs">{presentation.title}</h1>
          <span className="text-slate-400 text-sm">
            Slide {currentSlide + 1} of {presentation.slides.length}
          </span>
          {/* Connection status indicator - just a dot */}
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            mainWindowConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
          )} title={mainWindowConnected ? "Connected to main window" : "Not connected"} />
        </div>

        <div className="flex items-center gap-2">
          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 hover:bg-slate-600 rounded"
            >
              {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
            <button onClick={resetTimer} className="p-1 hover:bg-slate-600 rounded">
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={cn(
              "p-2 rounded-lg transition",
              showNotes ? "bg-amber-500 text-white" : "bg-slate-700 hover:bg-slate-600"
            )}
            title={showNotes ? "Hide Notes" : "Show Notes"}
          >
            {showNotes ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Current Slide */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Slide Container */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full aspect-video max-h-full max-w-[calc(100vh*16/9)] bg-white overflow-hidden shadow-2xl rounded-lg">
              <AnimatedSlide
                slideKey={currentSlide}
                animationId={slide.animation || "fade-up"}
                isPresenting={true}
              >
                <SlideRenderer
                  slide={slide}
                  index={currentSlide}
                  totalSlides={presentation.slides.length}
                  theme={theme}
                  isOwner={false}
                  isFullscreen={true}
                  isHovered={false}
                  isEditing={false}
                  editingText={null}
                  isPresenting={true}
                  onStartEditing={() => { }}
                  onUpdateContent={() => { }}
                  onFinishEditing={() => { }}
                  onAddBullet={() => { }}
                  onDeleteBullet={() => { }}
                />
              </AnimatedSlide>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4 shrink-0">
            <button
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="p-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex gap-1 max-w-md overflow-x-auto py-1">
              {presentation.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition shrink-0",
                    idx === currentSlide ? "bg-[#06b6d4] scale-125" : "bg-slate-600 hover:bg-slate-500"
                  )}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={currentSlide === presentation.slides.length - 1}
              className="p-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Side Panel (Notes + Next Slide) */}
        {showNotes && (
          <div className="w-96 border-l border-slate-700 flex flex-col shrink-0 bg-slate-900">
            {/* Next Slide Preview */}
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Next Slide</h3>
              {nextSlide ? (
                <button 
                  onClick={goNext}
                  className="w-full aspect-video bg-white rounded-lg overflow-hidden relative hover:ring-2 hover:ring-[#06b6d4] transition group"
                >
                  <div className="absolute inset-0 overflow-hidden pointer-events-none transform scale-50 origin-top-left w-[200%] h-[200%]">
                    <SlideRenderer
                      slide={nextSlide}
                      index={currentSlide + 1}
                      totalSlides={presentation.slides.length}
                      theme={theme}
                      isOwner={false} 
                      isFullscreen={true} 
                      isHovered={false} 
                      isEditing={false} 
                      editingText={null}
                      onStartEditing={() => { }} 
                      onUpdateContent={() => { }} 
                      onFinishEditing={() => { }} 
                      onAddBullet={() => { }} 
                      onDeleteBullet={() => { }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition text-xs font-medium text-white bg-black/50 px-2 py-1 rounded">
                      Click to advance
                    </span>
                  </div>
                </button>
              ) : (
                <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-sm">
                  End of presentation
                </div>
              )}
            </div>

            {/* Speaker Notes */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Speaker Notes</h3>
                {slide?.speakerNotes && slide.speakerNotes.length > 0 && (
                  <span className="ml-auto text-xs text-amber-400 font-medium">
                    {slide.speakerNotes.length} note{slide.speakerNotes.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              
              {slide?.speakerNotes && slide.speakerNotes.length > 0 ? (
                <div className="space-y-3">
                  {slide.speakerNotes.map((note, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                    >
                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <StickyNote className="h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">No notes for this slide</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Add notes in the editor to see them here
                  </p>
                </div>
              )}
            </div>

            {/* Slide thumbnails strip */}
            <div className="p-3 border-t border-slate-700 bg-slate-800/50">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {presentation.slides.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={cn(
                      "shrink-0 w-16 aspect-video bg-white rounded overflow-hidden relative transition",
                      idx === currentSlide 
                        ? "ring-2 ring-[#06b6d4]" 
                        : "ring-1 ring-slate-600 hover:ring-slate-500"
                    )}
                  >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none transform scale-[0.1] origin-top-left w-[1000%] h-[1000%]">
                      <SlideRenderer
                        slide={s}
                        index={idx}
                        totalSlides={presentation.slides.length}
                        theme={theme}
                        isOwner={false} 
                        isFullscreen={true} 
                        isHovered={false} 
                        isEditing={false} 
                        editingText={null}
                        onStartEditing={() => { }} 
                        onUpdateContent={() => { }} 
                        onFinishEditing={() => { }} 
                        onAddBullet={() => { }} 
                        onDeleteBullet={() => { }}
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white text-center py-0.5">
                      {idx + 1}
                    </div>
                    {/* Note indicator */}
                    {s.speakerNotes && s.speakerNotes.length > 0 && (
                      <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 left-4 text-xs text-slate-500">
        <span className="opacity-70">← → Navigate</span>
        <span className="mx-2 opacity-50">•</span>
        <span className="opacity-70">F Fullscreen</span>
        <span className="mx-2 opacity-50">•</span>
        <span className="opacity-70">Space Next</span>
      </div>

      {/* Watermark for free users */}
      {presentation.showWatermark && (
        <a
          href="https://www.pptmaster.app"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-white text-sm font-medium hover:bg-slate-700 transition flex items-center gap-2 shadow-lg"
        >
          <img src="/logo.png" alt="PPTMaster" className="h-5 w-5" />
          Made with PPTMaster
        </a>
      )}
    </div>
  );
}
