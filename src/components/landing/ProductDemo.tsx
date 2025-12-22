"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Star, MapPin, Music } from "lucide-react";
import { cn } from "~/lib/utils";

// Anime Dreamscape / Cyber Neon theme
const theme = {
  bg: "#0a0a0f",
  bgAlt: "#0f0f18",
  surface: "#151520",
  primary: "#00ffff",
  secondary: "#ff00ff",
  accent: "#adff2f",
  text: "#e0f0ff",
  textMuted: "#80d4ff",
  heading: "#ffffff",
};

export function ProductDemo() {
  const [phase, setPhase] = useState(0);
  const [typing, setTyping] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const fullText = "Create a neon cyberpunk presentation about Tokyo nightlife";

  const slides = [
    { type: "title", title: "Tokyo Nights", subtitle: "Neon Dreams & Electric Streets" },
    { type: "districts", title: "Iconic Districts" },
    { type: "culture", title: "Night Culture" },
    { type: "gems", title: "Hidden Gems" },
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
    <div className="rounded-3xl shadow-2xl border overflow-hidden" style={{ background: theme.bg, borderColor: `${theme.primary}30` }}>
      {/* Glow effects */}
      <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: theme.primary }}></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: theme.secondary }}></div>

      {/* Window Chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b relative" style={{ background: theme.bgAlt, borderColor: `${theme.primary}20` }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1 rounded-full text-xs border" style={{ background: `${theme.primary}15`, borderColor: `${theme.primary}40`, color: theme.primary }}>
          <Sparkles className="w-3 h-3" />
          PPTMaster
        </div>
        <div className="w-16"></div>
      </div>

      <div className="flex min-h-[400px] relative">
        {/* Sidebar */}
        <div className="w-24 md:w-32 border-r p-2 space-y-2 overflow-hidden" style={{ background: `${theme.bgAlt}80`, borderColor: `${theme.primary}20` }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className={cn(
                "aspect-video rounded-lg overflow-hidden transition-all duration-500 cursor-pointer border relative",
                phase >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                currentSlide === i ? "ring-2" : ""
              )}
              style={{ 
                transitionDelay: `${i * 150}ms`,
                borderColor: currentSlide === i ? theme.primary : `${theme.primary}20`,
                boxShadow: currentSlide === i ? `0 0 20px ${theme.primary}40` : "none"
              }}
              onClick={() => setCurrentSlide(i)}
            >
              <div className="w-full h-full p-1.5 relative" style={{ background: theme.bg }}>
                <div className="h-1.5 w-2/3 rounded mb-1" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }}></div>
                <div className="h-1 w-1/2 rounded" style={{ background: `${theme.textMuted}40` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 flex flex-col">
          {/* Input Area */}
          <div className={cn("mb-4 transition-all duration-500", phase >= 2 && "opacity-50 scale-95")}>
            <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: `${theme.bgAlt}90`, borderColor: `${theme.primary}30` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 0 20px ${theme.primary}50` }}>
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div className="flex-1 text-sm" style={{ color: theme.textMuted }}>
                {typing}
                {phase === 0 && <span className="animate-pulse" style={{ color: theme.primary }}>|</span>}
              </div>
              {phase === 1 && (
                <div className="flex items-center gap-2 text-xs" style={{ color: theme.primary }}>
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: theme.primary, borderTopColor: "transparent" }}></div>
                </div>
              )}
            </div>
          </div>

          {/* Slide Preview */}
          <div className="flex-1 relative">
            <SlidePreview phase={phase} currentSlide={currentSlide} slides={slides} theme={theme} />
            <GeneratingSpinner phase={phase} theme={theme} />
          </div>

          {/* Status Bar */}
          <div className="mt-4 flex items-center justify-between text-xs">
            <span style={{ color: theme.textMuted }}>Theme: <span style={{ color: theme.primary }}>Cyber Neon</span></span>
            {phase >= 2 && (
              <span className="flex items-center gap-1" style={{ color: "#00ff88" }}>
                <CheckCircle2 className="w-3 h-3" />
                Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlidePreview({ phase, currentSlide, slides, theme }: { phase: number; currentSlide: number; slides: any[]; theme: any }) {
  const slide = slides[currentSlide];

  const districts = [
    { name: "Shibuya Crossing", desc: "The heartbeat of Tokyo" },
    { name: "Shinjuku", desc: "Neon paradise after dark" },
    { name: "Akihabara", desc: "Electric town dreams" },
  ];

  const culture = [
    { icon: Star, text: "Izakaya dining experiences" },
    { icon: Music, text: "Karaoke until dawn" },
    { icon: MapPin, text: "Late-night ramen adventures" },
  ];

  return (
    <div className={cn(
      "absolute inset-0 rounded-xl overflow-hidden transition-all duration-700 border",
      phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-95"
    )} style={{ background: theme.bg, borderColor: `${theme.primary}30` }}>
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(${theme.primary}20 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}20 1px, transparent 1px)`,
        backgroundSize: "30px 30px"
      }}></div>
      
      {/* Glow orbs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl" style={{ background: theme.primary }}></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ background: theme.secondary }}></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
        {slide?.type === "title" && (
          <>
            <div className="w-16 h-0.5 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})` }}></div>
            <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tight" style={{ 
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`, 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent",
              textShadow: `0 0 40px ${theme.primary}60`
            }}>
              {slide?.title}
            </h2>
            <p className="text-sm md:text-base" style={{ color: theme.textMuted }}>{slide?.subtitle}</p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-medium border" style={{ borderColor: theme.primary, color: theme.primary }}>Nightlife</span>
              <span className="px-3 py-1 rounded-full text-[10px] font-medium border" style={{ borderColor: theme.secondary, color: theme.secondary }}>Culture</span>
            </div>
          </>
        )}

        {slide?.type === "districts" && (
          <div className="w-full max-w-sm text-left">
            <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: theme.heading }}>
              <span style={{ color: theme.primary }}>Iconic</span> Districts
            </h3>
            <div className="space-y-2">
              {districts.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border" style={{ background: `${theme.surface}80`, borderColor: `${theme.primary}20` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: i === 0 ? theme.primary : i === 1 ? theme.secondary : theme.accent, boxShadow: `0 0 10px ${i === 0 ? theme.primary : i === 1 ? theme.secondary : theme.accent}` }}></div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme.heading }}>{d.name}</p>
                    <p className="text-[10px]" style={{ color: theme.textMuted }}>{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide?.type === "culture" && (
          <div className="w-full max-w-sm text-left">
            <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: theme.heading }}>
              Night <span style={{ color: theme.secondary }}>Culture</span>
            </h3>
            <div className="space-y-2">
              {culture.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: `${theme.surface}60` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${theme.secondary}20` }}>
                    <c.icon className="w-3.5 h-3.5" style={{ color: theme.secondary }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.text }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide?.type === "gems" && (
          <div className="w-full max-w-sm">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-center" style={{ color: theme.heading }}>
              Hidden <span style={{ color: theme.accent }}>Gems</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {["Golden Gai", "Omoide Yokocho", "Rooftop Views"].map((gem, i) => (
                <div key={i} className="aspect-square rounded-lg flex items-center justify-center p-2 text-center border" style={{ background: `${theme.surface}80`, borderColor: `${theme.accent}30` }}>
                  <span className="text-[10px] font-medium" style={{ color: theme.text }}>{gem}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide Number */}
      <div className="absolute bottom-2 right-3 text-xs font-mono" style={{ color: `${theme.primary}80` }}>
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}

function GeneratingSpinner({ phase, theme }: { phase: number; theme: any }) {
  if (phase !== 1) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${theme.bg}ee` }}>
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: `${theme.primary}30` }}></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin" style={{ borderTopColor: theme.primary, borderRightColor: theme.secondary }}></div>
          <div className="absolute inset-2 rounded-full border-2 border-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s", borderBottomColor: theme.accent }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6" style={{ color: theme.primary }} />
          </div>
        </div>
        <p style={{ color: theme.text }} className="text-sm font-medium">Creating your presentation...</p>
        <p style={{ color: theme.primary }} className="text-xs mt-1">Applying Cyber Neon theme</p>
      </div>
    </div>
  );
}
