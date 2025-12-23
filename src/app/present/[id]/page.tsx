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
} from "lucide-react";
import { cn } from "~/lib/utils";
import SlideRenderer from "~/components/presentation/SlideRenderer";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import { type PresentationData } from "~/components/presentation/types";
import Link from "next/link";

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch presentation
  useEffect(() => {
    async function fetchPresentation() {
      try {
        const res = await fetch(`/api/presentations/${id}`);
        if (!res.ok) throw new Error("Failed to load presentation");
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

        // Resolve theme (copied from EmbedPage)
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

      } catch (err: any) {
        setError(err.message || "Failed to load presentation");
      } finally {
        setLoading(false);
      }
    }
    fetchPresentation();
  }, [id]);

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
  }, [currentSlide, presentation, isFullscreen]); // dependencies need to be correct

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
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Bar - hidden when fullscreen if desired, but user might want controls */}
      {!isFullscreen && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold truncate max-w-xs">{presentation.title}</h1>
            <span className="text-slate-400 text-sm">
              Slide {currentSlide + 1} of {presentation.slides.length}
            </span>
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
                showNotes ? "bg-[#06b6d4] text-white" : "bg-slate-700 hover:bg-slate-600"
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
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Current Slide */}
        <div className="flex-1 p-4 flex flex-col items-center justify-center bg-black/90">
          {/* Slide Container - maintains 16:9 aspect ratio centered */}
          <div className="relative w-full aspect-video max-h-full max-w-[177.78vh] bg-white overflow-hidden shadow-2xl">
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
              onStartEditing={() => { }}
              onUpdateContent={() => { }}
              onFinishEditing={() => { }}
              onAddBullet={() => { }}
              onDeleteBullet={() => { }}
            />
          </div>

          {/* Navigation - Floating controls at bottom when fullscreen or integrated? 
              Let's keep the existing buttons below the slide if not fullscreen, 
              or overlay if fullscreen. The original had buttons below.
           */}
          {!isFullscreen && (
            <div className="flex items-center justify-center gap-4 mt-4 shrink-0">
              <button
                onClick={goPrev}
                disabled={currentSlide === 0}
                className="p-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <div className="flex gap-1">
                {presentation.slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition",
                      idx === currentSlide ? "bg-[#06b6d4]" : "bg-slate-600 hover:bg-slate-500"
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
          )}
        </div>

        {/* Side Panel (Notes) - Hidden in fullscreen usually? Or overlaid. 
            Standard PPT behavior: Fullscreen is just the slide.
            "Presenter View" is usually on a separate screen. 
            But this is a web app. 
            If isFullscreen is true, we probably want JUST the slide (Cinema Mode).
            Unless the user explicitly wants notes.
            Let's keep notes in the side panel if !isFullscreen.
        */}
        {showNotes && !isFullscreen && (
          <div className="w-80 border-l border-slate-700 flex flex-col shrink-0 bg-slate-900">
            {/* Next Slide Preview */}
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-xs font-medium text-slate-400 mb-2">NEXT SLIDE</h3>
              {nextSlide ? (
                <div className="aspect-video bg-white rounded overflow-hidden relative">
                  {/* Reuse SlideRenderer for preview if possible, but scaling might be an issue.
                        For now, keep it simple/text-based OR use a scaled down renderer? 
                        The original code used raw text. Let's try to be better but safe.
                        Actually, render raw text to be safe/fast for preview.
                    */}
                  <div className="absolute inset-0 p-1 overflow-hidden pointer-events-none transform scale-50 origin-top-left w-[200%] h-[200%]">
                    <SlideRenderer
                      slide={nextSlide}
                      index={currentSlide + 1}
                      totalSlides={presentation.slides.length}
                      theme={theme} // Same theme
                      isOwner={false} isFullscreen={true} isHovered={false} isEditing={false} editingText={null}
                      onStartEditing={() => { }} onUpdateContent={() => { }} onFinishEditing={() => { }} onAddBullet={() => { }} onDeleteBullet={() => { }}
                    />
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-slate-800 rounded flex items-center justify-center text-slate-500 text-sm">
                  End of presentation
                </div>
              )}
            </div>

            {/* Speaker Notes */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-xs font-medium text-slate-400 mb-2">SPEAKER NOTES</h3>
              {slide?.notes ? (
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{slide.notes}</p>
              ) : (
                <p className="text-sm text-slate-500 italic">No notes for this slide</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Watermark for free users - logic maintained */}
      {presentation.showWatermark && (
        <a
          href="https://www.pptmaster.app"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/70 text-sm font-medium hover:text-white hover:bg-white/20 transition"
        >
          Made with PPTMaster
        </a>
      )}
    </div>
  );
}
