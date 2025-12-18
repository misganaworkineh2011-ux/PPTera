"use client";

import { useState, useEffect, use, useCallback } from "react";
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

interface PresenterPageProps {
  params: Promise<{ id: string }>;
}

interface Slide {
  title?: string;
  content?: string;
  notes?: string;
  type?: string;
  [key: string]: any;
}

interface PresentationData {
  id: string;
  title: string;
  slides: Slide[];
  showWatermark?: boolean;
}

export default function PresenterPage({ params }: PresenterPageProps) {
  const { id } = use(params);
  
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fetch presentation
  useEffect(() => {
    async function fetchPresentation() {
      try {
        const res = await fetch(`/api/presentations/${id}`);
        if (!res.ok) throw new Error("Failed to load presentation");
        const data = await res.json();
        
        // Check user subscription for watermark
        const userRes = await fetch("/api/user/me");
        let showWatermark = true;
        if (userRes.ok) {
          const userData = await userRes.json();
          showWatermark = !userData.subscriptionPlan || 
            !["plus", "pro", "ultra"].includes(userData.subscriptionPlan);
        }
        
        setPresentation({ ...data, showWatermark });
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

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Current Slide */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1 bg-white rounded-lg overflow-hidden shadow-xl">
            <div className="h-full p-8 flex flex-col justify-center text-slate-900">
              {slide?.title && (
                <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
              )}
              {slide?.content && (
                <p className="text-lg whitespace-pre-wrap">{slide.content}</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4">
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
        </div>

        {/* Side Panel */}
        {showNotes && (
          <div className="w-80 border-l border-slate-700 flex flex-col">
            {/* Next Slide Preview */}
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-xs font-medium text-slate-400 mb-2">NEXT SLIDE</h3>
              {nextSlide ? (
                <div className="aspect-video bg-white rounded overflow-hidden">
                  <div className="h-full p-3 text-slate-900 text-xs">
                    {nextSlide.title && (
                      <p className="font-bold truncate">{nextSlide.title}</p>
                    )}
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

      {/* Watermark for free users */}
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
