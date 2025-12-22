"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Wand2, TrendingUp, Users, Globe } from "lucide-react";
import { cn } from "~/lib/utils";

// Corporate Clean theme
const theme = {
  bg: "#ffffff",
  bgAlt: "#f9fafb",
  surface: "#f3f4f6",
  primary: "#2563eb",
  secondary: "#0ea5e9",
  accent: "#8b5cf6",
  text: "#374151",
  textMuted: "#6b7280",
  heading: "#111827",
  border: "#e5e7eb",
  success: "#10b981",
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
      const timer = setTimeout(() => setPhase(3), 3500);
      return () => clearTimeout(timer);
    }
    if (phase === 3) {
      const timer = setTimeout(() => setPhase(4), 3500);
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
                "aspect-video rounded-lg overflow-hidden transition-all duration-700 border",
                phase >= i + 2
                  ? "opacity-100 translate-x-0 border-blue-500 shadow-md"
                  : "opacity-30 -translate-x-2 border-slate-200"
              )}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <div className="w-full h-full p-1.5 bg-gradient-to-br from-white to-blue-50">
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
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="flex-1 text-xs text-slate-600 truncate">
                {typing}
                {phase === 0 && <span className="animate-pulse text-blue-500">|</span>}
              </span>
              {phase === 1 && (
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>

          {/* Slide Preview Area */}
          <div className="flex-1 p-3 relative">
            <GeneratingAnimation phase={phase} />
            <TitleSlide phase={phase} />
            <MetricsSlide phase={phase} />
            <ChartSlide phase={phase} />
          </div>

          {/* Status Bar */}
          <div className="px-3 pb-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">
              Theme: <span className="text-blue-600 font-medium">Corporate Clean</span>
            </span>
            {phase >= 2 && (
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
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
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/90 backdrop-blur-sm">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-cyan-500 animate-spin"></div>
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-blue-400 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "0.7s" }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-700 text-xs font-medium">Creating your presentation...</p>
        <p className="text-blue-500 text-[10px] mt-1">Corporate Clean theme</p>
      </div>
    </div>
  );
}

function TitleSlide({ phase }: { phase: number }) {
  return (
    <div
      className={cn(
        "absolute inset-3 rounded-xl overflow-hidden transition-all duration-700 border border-slate-200 shadow-lg",
        phase === 2 ? "opacity-100 scale-100" : phase > 2 ? "opacity-0 scale-95 pointer-events-none" : "opacity-0 scale-105"
      )}
    >
      <div className="w-full h-full bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/40 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-tr-full"></div>
        
        <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-2">
            Q4 Business Review
          </h2>
          <p className="text-slate-500 text-sm">Annual Performance Analysis 2024</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium">Strategy</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-medium">Growth</span>
          </div>
          <div className="absolute bottom-3 right-3 text-[10px] text-slate-400">1 / 6</div>
        </div>
      </div>
    </div>
  );
}

function MetricsSlide({ phase }: { phase: number }) {
  const metrics = [
    { icon: TrendingUp, label: "Revenue Growth", value: "+23%", color: "#10b981", bg: "#d1fae5" },
    { icon: Users, label: "Customer Retention", value: "94%", color: "#2563eb", bg: "#dbeafe" },
    { icon: Globe, label: "Market Expansion", value: "3 regions", color: "#8b5cf6", bg: "#ede9fe" },
  ];

  return (
    <div
      className={cn(
        "absolute inset-3 rounded-xl overflow-hidden transition-all duration-700 border border-slate-200 shadow-lg",
        phase === 3 ? "opacity-100 scale-100" : phase > 3 ? "opacity-0 scale-95 pointer-events-none" : "opacity-0 scale-105"
      )}
    >
      <div className="w-full h-full bg-white relative p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>
          <h3 className="text-base md:text-lg font-bold text-slate-900">Key Highlights</h3>
        </div>
        <div className="space-y-2.5">
          {metrics.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <span className="flex-1 text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400">2 / 6</div>
      </div>
    </div>
  );
}

function ChartSlide({ phase }: { phase: number }) {
  const bars = [
    { height: 45, label: "Q1" },
    { height: 60, label: "Q2" },
    { height: 52, label: "Q3" },
    { height: 78, label: "Q4" },
    { height: 90, label: "Q1'" },
    { height: 85, label: "Q2'" },
  ];

  return (
    <div
      className={cn(
        "absolute inset-3 rounded-xl overflow-hidden transition-all duration-700 border border-slate-200 shadow-lg",
        phase === 4 ? "opacity-100 scale-100" : "opacity-0 scale-105"
      )}
    >
      <div className="w-full h-full bg-white relative p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">Revenue Trend</h3>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">+47% YoY</span>
        </div>
        
        {/* Chart */}
        <div className="flex items-end justify-around h-20 gap-2 px-2">
          {bars.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full rounded-t-md transition-all duration-700 relative overflow-hidden"
                style={{ 
                  height: `${bar.height}%`,
                  background: `linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)`,
                  animationDelay: `${i * 100}ms`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              <span className="text-[8px] text-slate-400 font-medium">{bar.label}</span>
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
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
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
