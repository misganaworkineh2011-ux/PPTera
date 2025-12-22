"use client";

import { useState, useEffect } from "react";
import { Wand2, MousePointer2, Type, Palette } from "lucide-react";
import { cn } from "~/lib/utils";

// Sunset Gradient theme
const theme = {
  bg: "#1c1017",
  bgAlt: "#261520",
  surface: "#2d1a24",
  primary: "#f472b6",
  secondary: "#fb923c",
  accent: "#a855f7",
  text: "#fce7f3",
  textMuted: "#f9a8d4",
  heading: "#ffffff",
  border: "#4c1d3d",
};

export function EditDemo() {
  const [activeElement, setActiveElement] = useState(0);
  const [showToolbar, setShowToolbar] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveElement((e) => {
        const next = (e + 1) % 4;
        setShowToolbar(next === 1 || next === 2);
        return next;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden border" style={{ background: theme.bg, borderColor: `${theme.primary}30` }}>
      {/* Window Chrome */}
      <div className="absolute top-0 left-0 right-0 h-8 border-b flex items-center px-3 gap-1.5" style={{ background: theme.bgAlt, borderColor: `${theme.primary}20` }}>
        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        <div className="mx-auto flex items-center gap-1.5 text-[9px]" style={{ color: theme.textMuted }}>
          <Wand2 className="w-3 h-3" style={{ color: theme.primary }} />
          Edit Mode
        </div>
      </div>

      <div className="absolute inset-0 top-8 p-3">
        {/* Slide Preview */}
        <div className="h-full rounded-xl border relative overflow-hidden" style={{ background: theme.surface, borderColor: `${theme.primary}20` }}>
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full" style={{ background: `radial-gradient(circle, ${theme.primary}40, transparent)` }}></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full" style={{ background: `radial-gradient(circle, ${theme.secondary}30, transparent)` }}></div>
          </div>

          <div className="relative h-full p-4">
            {/* Title */}
            <div
              className={cn(
                "mb-3 p-2 rounded-lg transition-all duration-300 cursor-pointer",
                activeElement === 0 && "ring-2 ring-pink-400"
              )}
              style={{ 
                background: activeElement === 0 ? `${theme.primary}15` : "transparent"
              }}
            >
              <h3 className="text-base font-bold" style={{ color: theme.heading }}>Creative Workshop</h3>
            </div>

            {/* Subtitle */}
            <div
              className={cn(
                "mb-4 p-2 rounded-lg transition-all duration-300 cursor-pointer",
                activeElement === 1 && "ring-2 ring-pink-400"
              )}
              style={{ 
                background: activeElement === 1 ? `${theme.primary}15` : "transparent"
              }}
            >
              <p className="text-xs" style={{ color: theme.textMuted }}>Unleash Your Imagination</p>
            </div>

            {/* Bullet Points */}
            <div
              className={cn(
                "space-y-2 p-2 rounded-lg transition-all duration-300 cursor-pointer",
                activeElement === 2 && "ring-2 ring-pink-400"
              )}
              style={{ 
                background: activeElement === 2 ? `${theme.primary}15` : "transparent"
              }}
            >
              {["Design thinking principles", "Color theory basics", "Typography essentials"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: i % 2 === 0 ? theme.primary : theme.secondary }}></span>
                  <span className="text-xs" style={{ color: theme.text }}>{item}</span>
                </div>
              ))}
            </div>

            {/* AI Edit Button */}
            <div
              className={cn(
                "absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300",
                activeElement === 3 ? "scale-110" : ""
              )}
              style={{ 
                background: activeElement === 3 ? theme.primary : theme.border,
                color: activeElement === 3 ? "#fff" : theme.textMuted
              }}
            >
              <Wand2 className="w-3 h-3" />
              <span className="text-[10px] font-medium">AI Edit</span>
            </div>

            {/* Floating Toolbar */}
            {showToolbar && (
              <div 
                className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-lg border animate-fade-in"
                style={{ background: theme.bgAlt, borderColor: theme.border }}
              >
                <button className="p-1 rounded hover:bg-white/10"><Type className="w-3 h-3" style={{ color: theme.text }} /></button>
                <button className="p-1 rounded hover:bg-white/10"><Palette className="w-3 h-3" style={{ color: theme.text }} /></button>
                <div className="w-px h-4 mx-1" style={{ background: theme.border }}></div>
                <button className="p-1 rounded" style={{ background: `${theme.primary}30` }}><Wand2 className="w-3 h-3" style={{ color: theme.primary }} /></button>
              </div>
            )}

            {/* Cursor */}
            <div
              className="absolute w-4 h-4 transition-all duration-500 pointer-events-none z-10"
              style={{
                top: activeElement === 0 ? "12%" : activeElement === 1 ? "28%" : activeElement === 2 ? "55%" : "78%",
                left: activeElement === 3 ? "80%" : "25%",
              }}
            >
              <MousePointer2 className="w-4 h-4" style={{ color: theme.primary, fill: `${theme.primary}40` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Theme indicator */}
      <div className="absolute bottom-2 left-3 text-[9px]" style={{ color: theme.textMuted }}>
        Theme: <span style={{ color: theme.primary }}>Sunset Gradient</span>
      </div>
    </div>
  );
}
