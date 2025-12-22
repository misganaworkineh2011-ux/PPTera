"use client";

import { useState, useEffect } from "react";
import { FileText, Download, CheckCircle2, Globe, Share2 } from "lucide-react";
import { cn } from "~/lib/utils";

// Elegant Noir theme
const theme = {
  bg: "#0a0a0b",
  bgAlt: "#141416",
  surface: "#1a1a1d",
  primary: "#f59e0b",
  secondary: "#6366f1",
  accent: "#ec4899",
  text: "#e4e4e7",
  textMuted: "#a1a1aa",
  heading: "#fafafa",
  border: "#27272a",
};

export function ExportDemo() {
  const [selectedFormat, setSelectedFormat] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedFormat((f) => (f + 1) % 3);

      if (Math.random() > 0.6) {
        setExporting(true);
        setTimeout(() => {
          setExporting(false);
          setExported(true);
          setTimeout(() => setExported(false), 1500);
        }, 1200);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const formats = [
    { icon: <FileText className="w-3 h-3" />, label: "PPTX" },
    { icon: <FileText className="w-3 h-3" />, label: "PDF" },
    { icon: <Globe className="w-3 h-3" />, label: "Link" },
  ];

  return (
    <div
      className="relative aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden border"
      style={{ background: theme.bg, borderColor: `${theme.primary}30` }}
    >
      {/* Window Chrome */}
      <div
        className="absolute top-0 left-0 right-0 h-8 border-b flex items-center px-3 gap-1.5 z-10"
        style={{ background: theme.bgAlt, borderColor: theme.border }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        <div className="mx-auto flex items-center gap-1.5 text-[9px]" style={{ color: theme.textMuted }}>
          <Share2 className="w-3 h-3" style={{ color: theme.primary }} />
          Share & Export
        </div>
      </div>

      {/* Main Slide Preview - Full space */}
      <div className="absolute inset-0 top-8 p-3">
        <div className="h-full rounded-xl border overflow-hidden relative" style={{ background: theme.surface, borderColor: theme.border }}>
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 right-4 w-24 h-24 rounded-full" style={{ background: `radial-gradient(circle, ${theme.primary}40, transparent)` }}></div>
            <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full" style={{ background: `radial-gradient(circle, ${theme.secondary}30, transparent)` }}></div>
          </div>

          {/* Slide Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-0.5 rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }}></div>
            <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: theme.heading }}>Business Pitch</h3>
            <p className="text-xs md:text-sm mb-4" style={{ color: theme.textMuted }}>Q4 Strategy & Growth Plan</p>
            
            {/* Mini bullet points */}
            <div className="space-y-2 text-left max-w-[220px]">
              {["Revenue targets exceeded", "Market expansion complete", "Team growth on track"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: i % 2 === 0 ? theme.primary : theme.secondary }}></span>
                  <span className="text-[11px]" style={{ color: theme.text }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Slide number */}
            <div className="absolute bottom-3 left-3 text-[9px]" style={{ color: theme.textMuted }}>1 / 6</div>
          </div>

          {/* Floating Export Panel - Overlaid on slide */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-2 px-2 py-1.5 rounded-lg border"
            style={{ background: `${theme.bgAlt}ee`, borderColor: theme.border }}
          >
            {/* Format Options */}
            {formats.map((format, i) => (
              <button
                key={format.label}
                onClick={() => setSelectedFormat(i)}
                className={cn(
                  "flex items-center gap-1 px-1.5 py-1 rounded text-[9px] font-medium transition-all",
                  selectedFormat === i ? "scale-105" : "opacity-50"
                )}
                style={{
                  background: selectedFormat === i ? `${theme.primary}25` : "transparent",
                  color: selectedFormat === i ? theme.primary : theme.textMuted,
                }}
              >
                {format.icon}
                {format.label}
              </button>
            ))}

            <div className="w-px h-5" style={{ background: theme.border }}></div>

            {/* Export Button */}
            <button
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all"
              style={{
                background: exported ? "#22c55e" : exporting ? `${theme.primary}80` : theme.primary,
                color: "#000",
              }}
            >
              {exporting ? (
                <>
                  <div className="w-2.5 h-2.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">...</span>
                </>
              ) : exported ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Done</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">Export</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Theme indicator */}
      <div className="absolute bottom-2 left-3 text-[9px] z-10" style={{ color: theme.textMuted }}>
        Theme: <span style={{ color: theme.primary }}>Elegant Noir</span>
      </div>
    </div>
  );
}
