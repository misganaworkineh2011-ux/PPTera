"use client";

import { useState, useEffect } from "react";
import { FileText, Download, CheckCircle2, Globe, Share2, TrendingUp, Target, Award } from "lucide-react";
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
  success: "#22c55e",
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
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ background: theme.primary }}></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-15 blur-3xl" style={{ background: theme.secondary }}></div>

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

      {/* Main Slide Preview */}
      <div className="absolute inset-0 top-8 p-3">
        <div className="h-full rounded-xl border overflow-hidden relative" style={{ background: theme.surface, borderColor: theme.border }}>
          {/* Decorative background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-40" style={{ background: `radial-gradient(circle, ${theme.primary}30, transparent)` }}></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${theme.secondary}25, transparent)` }}></div>
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, ${theme.secondary}, transparent)` }}></div>
          </div>

          {/* Slide Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-5 text-center">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, boxShadow: `0 0 20px ${theme.primary}40` }}>
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: theme.heading }}>Business Pitch</h3>
            <p className="text-xs md:text-sm mb-4" style={{ color: theme.textMuted }}>Q4 Strategy & Growth Plan</p>
            
            {/* Stats row */}
            <div className="flex gap-3 mb-4">
              {[
                { icon: Target, value: "+23%", label: "Growth", color: theme.primary },
                { icon: Award, value: "94%", label: "Retention", color: theme.secondary },
              ].map((stat, i) => (
                <div key={i} className="px-3 py-2 rounded-lg border" style={{ background: `${theme.bg}80`, borderColor: `${theme.border}` }}>
                  <stat.icon className="w-3 h-3 mx-auto mb-1" style={{ color: stat.color }} />
                  <p className="text-sm font-bold" style={{ color: theme.heading }}>{stat.value}</p>
                  <p className="text-[8px]" style={{ color: theme.textMuted }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Slide number */}
            <div className="absolute bottom-3 left-3 text-[9px]" style={{ color: theme.textMuted }}>1 / 6</div>
          </div>

          {/* Floating Export Panel */}
          <div
            className="absolute bottom-3 right-3 flex items-center gap-2 px-2.5 py-2 rounded-xl border shadow-xl"
            style={{ background: `${theme.bgAlt}f5`, borderColor: theme.border }}
          >
            {/* Format Options */}
            {formats.map((format, i) => (
              <button
                key={format.label}
                onClick={() => setSelectedFormat(i)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-all",
                  selectedFormat === i ? "scale-105" : "opacity-50"
                )}
                style={{
                  background: selectedFormat === i ? `${theme.primary}20` : "transparent",
                  color: selectedFormat === i ? theme.primary : theme.textMuted,
                  boxShadow: selectedFormat === i ? `0 0 10px ${theme.primary}20` : "none"
                }}
              >
                {format.icon}
                {format.label}
              </button>
            ))}

            <div className="w-px h-6" style={{ background: theme.border }}></div>

            {/* Export Button */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
              style={{
                background: exported ? theme.success : exporting ? `${theme.primary}80` : theme.primary,
                color: "#000",
                boxShadow: `0 0 15px ${exported ? theme.success : theme.primary}40`
              }}
            >
              {exporting ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>...</span>
                </>
              ) : exported ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Done</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span>Export</span>
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
