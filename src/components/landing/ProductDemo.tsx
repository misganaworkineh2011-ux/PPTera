"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Wand2 } from "lucide-react";
import { cn } from "~/lib/utils";

// Anime Dreamscape theme for ProductDemo
const animeTheme = {
  bg: "#1a1625",
  bgAlt: "#251f35",
  primary: "#e879f9",
  secondary: "#7dd3fc",
  accent: "#fda4af",
  text: "#ffffff",
  textMuted: "#d8b4fe",
  bgImage: "https://images.hdqwalls.com/download/anime-city-hd-zt-3840x2160.jpg",
};

export function ProductDemo() {
  const [phase, setPhase] = useState(0);
  const [typing, setTyping] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const fullText = "Create an anime-style presentation about Tokyo nightlife";

  const slides = [
    { type: "title", title: "Tokyo Nightlife", subtitle: "A Journey Through Neon Dreams" },
    {
      type: "content",
      title: "Iconic Districts",
      bullets: ["Shibuya Crossing - The heartbeat of Tokyo", "Shinjuku - Neon paradise after dark", "Akihabara - Electric town dreams"],
    },
    {
      type: "content",
      title: "Night Culture",
      bullets: ["Izakaya dining experiences", "Karaoke until dawn", "Late-night ramen adventures"],
    },
    {
      type: "content",
      title: "Hidden Gems",
      bullets: ["Golden Gai's tiny bars", "Omoide Yokocho alleyways", "Rooftop city views"],
    },
  ];

  useEffect(() => {
    if (phase === 0) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= fullText.length) {
          setTyping(fullText.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setTimeout(() => setPhase(1), 500);
        }
      }, 40);
      return () => clearInterval(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 1) {
      const timer = setTimeout(() => setPhase(2), 2000);
      return () => clearTimeout(timer);
    }
    if (phase === 2) {
      const timer = setTimeout(() => setPhase(3), 3000);
      return () => clearTimeout(timer);
    }
    if (phase === 3) {
      const timer = setTimeout(() => setPhase(4), 3000);
      return () => clearTimeout(timer);
    }
    if (phase === 4) {
      const timer = setTimeout(() => {
        setPhase(0);
        setTyping("");
        setCurrentSlide(0);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase >= 2) {
      const timer = setInterval(() => {
        setCurrentSlide((s) => (s + 1) % slides.length);
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [phase, slides.length]);

  return (
    <div className="rounded-3xl shadow-2xl border border-fuchsia-500/20 overflow-hidden" style={{ background: animeTheme.bg }}>
      {/* Window Chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-fuchsia-500/20" style={{ background: animeTheme.bgAlt }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs border border-fuchsia-500/30">
          <Sparkles className="w-3 h-3" />
          PPTMaster
        </div>
        <div className="w-16"></div>
      </div>

      <div className="flex min-h-[400px]">
        {/* Sidebar */}
        <div className="w-24 md:w-32 border-r border-fuchsia-500/20 p-2 space-y-2 overflow-hidden" style={{ background: `${animeTheme.bgAlt}80` }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className={cn(
                "aspect-video rounded-lg overflow-hidden transition-all duration-500 cursor-pointer border",
                phase >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                currentSlide === i ? "border-fuchsia-500 ring-2 ring-fuchsia-500/30" : "border-fuchsia-500/20"
              )}
              style={{ transitionDelay: `${i * 150}ms` }}
              onClick={() => setCurrentSlide(i)}
            >
              <div className="w-full h-full p-1.5 relative" style={{ background: animeTheme.bg }}>
                <div className="absolute inset-0 opacity-20">
                  <img src={animeTheme.bgImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative">
                  <div className="h-1.5 w-2/3 rounded mb-1" style={{ background: `linear-gradient(90deg, ${animeTheme.primary}, ${animeTheme.secondary})` }}></div>
                  <div className="h-1 w-1/2 rounded" style={{ background: animeTheme.textMuted }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 flex flex-col">
          {/* Input Area */}
          <div className={cn("mb-4 transition-all duration-500", phase >= 2 && "opacity-50 scale-95")}>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-fuchsia-500/30" style={{ background: `${animeTheme.bgAlt}90` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${animeTheme.primary}, ${animeTheme.secondary})` }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-sm" style={{ color: animeTheme.textMuted }}>
                {typing}
                {phase === 0 && <span className="animate-pulse" style={{ color: animeTheme.primary }}>|</span>}
              </div>
              {phase === 1 && (
                <div className="flex items-center gap-2 text-xs" style={{ color: animeTheme.primary }}>
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: animeTheme.primary, borderTopColor: "transparent" }}></div>
                  Generating...
                </div>
              )}
            </div>
          </div>

          {/* Slide Preview */}
          <div className="flex-1 relative">
            <SlidePreview phase={phase} currentSlide={currentSlide} slides={slides} theme={animeTheme} />
            <GeneratingSpinner phase={phase} theme={animeTheme} />
          </div>

          {/* Status Bar */}
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span style={{ color: animeTheme.textMuted }}>Theme: <span style={{ color: animeTheme.primary }}>Anime Dreamscape</span></span>
              <span style={{ color: animeTheme.textMuted }}>Slides: <span className="text-white">{slides.length}</span></span>
            </div>
            {phase >= 2 && (
              <div className="flex items-center gap-2">
                {phase === 4 ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Ready to export
                  </span>
                ) : (
                  <span className="flex items-center gap-1" style={{ color: animeTheme.primary }}>
                    <Sparkles className="w-3 h-3" />
                    AI-powered
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlidePreview({ phase, currentSlide, slides, theme }: { phase: number; currentSlide: number; slides: any[]; theme: any }) {
  const slide = slides[currentSlide];

  return (
    <div className={cn(
      "absolute inset-0 rounded-xl overflow-hidden transition-all duration-700",
      phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
    )} style={{ background: theme.bg }}>
      {/* Background Image */}
      <img src={theme.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(26, 22, 37, 0.4) 0%, rgba(37, 31, 53, 0.7) 100%)" }}></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
        {slide?.type === "title" ? (
          <>
            <h2 className="text-2xl md:text-4xl font-bold mb-2" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {slide?.title}
            </h2>
            <p style={{ color: `${theme.textMuted}cc` }} className="text-sm md:text-base">{slide?.subtitle}</p>
          </>
        ) : (
          <div className="w-full max-w-md text-left">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4" style={{ textShadow: `0 0 20px ${theme.primary}40` }}>
              {slide?.title}
            </h3>
            <ul className="space-y-2">
              {slide?.bullets?.map((bullet: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: `${theme.text}e6` }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: i % 2 === 0 ? theme.primary : theme.secondary }}></span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Slide Number */}
      <div className="absolute bottom-2 right-3 text-xs" style={{ color: `${theme.textMuted}80` }}>
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}

function GeneratingSpinner({ phase, theme }: { phase: number; theme: any }) {
  if (phase !== 1) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: `${theme.primary}30` }}></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: theme.primary, borderRightColor: theme.secondary }}></div>
          <div className="absolute inset-2 rounded-full border-2 border-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s", borderBottomColor: theme.accent }}></div>
        </div>
        <p style={{ color: theme.textMuted }} className="text-sm">Creating your presentation...</p>
        <p style={{ color: theme.primary }} className="text-xs mt-1">Applying Anime Dreamscape theme</p>
      </div>
    </div>
  );
}
