"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Wand2 } from "lucide-react";
import { cn } from "~/lib/utils";

// Corporate Clean theme for professional look
const theme = {
  bg: "#ffffff",
  bgAlt: "#f9fafb",
  surface: "#f3f4f6",
  primary: "#2563eb",
  secondary: "#0ea5e9",
  text: "#374151",
  textMuted: "#6b7280",
  heading: "#111827",
  border: "#e5e7eb",
};

export function HeroDemo() {
  const [phase, setPhase] = useState(0);
  const [typing, setTyping] = useState("");
  const fullPrompt = "Create a quarterly business review presentation";

  useEffect(() => {
    if (phase === 0) {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= fullPrompt.length) {
          setTyping(fullPrompt.slice(0, i));
          i++;
        } else {
          clearInterval(timer);
          setTimeout(() => setPhase(1), 800);
        }
      }, 45);
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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="relative aspect-video rounded-[20px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200 bg-white">
      {/* Window Chrome */}
      <div className="absolute top-0 left-0 right-0 h-10 border-b border-slate-200 bg-slate-50 flex items-center px-4 gap-2 z-20">
        <div className="h-3 w-3 rounded-full bg-red-400"></div>
        <div className="h-3 w-3 rounded-full bg-amber-400"></div>
        <div className="h-3 w-3 rounded-full bg-green-400"></div>
        <div className="mx-auto flex items-center gap-2 rounded-md bg-white px-3 py-1 text-[10px] text-slate-500 border border-slate-200">
          <Sparkles className="w-3 h-3 text-blue-500" />
          PPTMaster
        </div>
      </div>

      {/* App Interface */}
      <div className="absolute inset-0 top-10 flex">
        {/* Sidebar - Thumbnails */}
        <div className="w-20 md:w-28 border-r border-slate-200 bg-slate-50 p-2 space-y-2 hidden md:block">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "aspect-video rounded-lg overflow-hidden transition-all duration-700 border bg-white",
                phase >= i + 2
                  ? "opacity-100 translate-x-0 border-blue-500 shadow-md"
                  : "opacity-30 -translate-x-2 border-slate-200"
              )}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <div className="w-full h-full p-1.5 bg-gradient-to-br from-white to-slate-50">
                <div className="h-1.5 w-2/3 rounded-full mb-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <div className="h-1 w-1/2 rounded-full bg-slate-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative flex flex-col bg-white">
          {/* Input Bar */}
          <div className={cn("mx-3 mt-3 transition-all duration-500", phase >= 2 && "opacity-50 scale-95")}>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="flex-1 text-xs text-slate-600 truncate">
                {typing}
                {phase === 0 && <span className="animate-pulse text-blue-500">|</span>}
              </span>
              {phase === 1 && (
                <div className="flex items-center gap-1.5 text-blue-500">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Slide Preview Area */}
          <div className="flex-1 p-3 relative">
            <GeneratingAnimation phase={phase} />
            <TitleSlide phase={phase} />
            <ContentSlide phase={phase} />
            <ChartSlide phase={phase} />
          </div>

          {/* Status Bar */}
          <div className="px-3 pb-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              Theme: <span className="text-blue-600">Corporate Clean</span>
            </span>
            {phase >= 2 && (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle2 className="w-3 h-3" />
                Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Notification Cards */}
      <FloatingCards />
    </div>
  );
}

function GeneratingAnimation({ phase }: { phase: number }) {
  if (phase !== 1) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-500 animate-spin"></div>
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-blue-400 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "0.7s" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-600 text-xs font-medium">Creating your presentation...</p>
        <p className="text-blue-500 text-[10px] mt-1">Corporate Clean theme</p>
      </div>
    </div>
  );
}

function TitleSlide({ phase }: { phase: number }) {
  return (
    <div
      className={cn(
        "absolute inset-3 rounded-xl overflow-hidden transition-all duration-700 border border-slate-200",
        phase === 2 ? "opacity-100 scale-100" : phase > 2 ? "opacity-0 scale-95 pointer-events-none" : "opacity-0 scale-105"
      )}
    >
      <div className="w-full h-full bg-gradient-to-br from-white via-slate-50 to-blue-50 relative">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)" }}></div>
        
        <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4"></div>
          <h2 className="text-xl md:text-3xl font-semibold text-slate-900 mb-2">
            Q4 Business Review
          </h2>
          <p className="text-slate-500 text-sm">Annual Performance Analysis 2024</p>
          <div className="absolute bottom-3 right-3 text-[10px] text-slate-400">1 / 6</div>
        </div>
      </div>
    </div>
  );
}

function ContentSlide({ phase }: { phase: number }) {
  const items = [
    { label: "Revenue Growth", value: "+23%", color: "#10b981" },
    { label: "Customer Retention", value: "94%", color: "#2563eb" },
    { label: "Market Expansion", value: "3 regions", color: "#8b5cf6" },
  ];

  return (
    <div
      className={cn(
        "absolute inset-3 rounded-xl overflow-hidden transition-all duration-700 border border-slate-200",
        phase === 3 ? "opacity-100 scale-100" : phase > 3 ? "opacity-0 scale-95 pointer-events-none" : "opacity-0 scale-105"
      )}
    >
      <div className="w-full h-full bg-white relative p-4 md:p-6">
        <h3 className="text-base md:text-xl font-semibold text-slate-900 mb-4">
          Key Highlights
        </h3>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-semibold" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400">2 / 6</div>
      </div>
    </div>
  );
}

function ChartSlide({ phase }: { phase: number }) {
  return (
    <div
      className={cn(
        "absolute inset-3 rounded-xl overflow-hidden transition-all duration-700 border border-slate-200",
        phase === 4 ? "opacity-100 scale-100" : "opacity-0 scale-105"
      )}
    >
      <div className="w-full h-full bg-white relative p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">Revenue Trend</h3>
        
        {/* Simple bar chart visualization */}
        <div className="flex items-end justify-around h-24 gap-2">
          {[40, 55, 45, 70, 85, 75].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}
              ></div>
              <span className="text-[8px] text-slate-400">Q{i + 1}</span>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400">3 / 6</div>
      </div>
    </div>
  );
}

function FloatingCards() {
  return (
    <>
      <div className="absolute -left-6 bottom-20 z-30 hidden lg:block animate-float">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-900">6 Slides Created</p>
            <p className="text-[9px] text-slate-500">Just now</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 top-20 z-30 hidden lg:block animate-float [animation-delay:1.5s]">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
            <Wand2 className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-900">Professional Theme</p>
            <p className="text-[9px] text-slate-500">Applied</p>
          </div>
        </div>
      </div>
    </>
  );
}
