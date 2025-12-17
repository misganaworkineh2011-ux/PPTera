"use client";

import { X, FileText, Presentation, Image } from "lucide-react";
import { type Theme } from "~/lib/themes";

interface ExportModalProps {
  isExporting: boolean;
  theme: Theme;
  onExport: (format: "pdf" | "pptx" | "images") => void;
  onClose: () => void;
}

// Theme type detection
type ThemeType = "dark" | "light" | "sunset" | "ocean" | "aurora" | "ember" | "midnight" | "cyber" | "alien" | "corporate" | "cosmic" | "architectural" | "anime" | "hacker" | "custom-dark" | "custom-light";

// Helper to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function getThemeType(theme: Theme): ThemeType {
  // Check for custom themes first
  if (theme.id.startsWith("custom-")) {
    return isColorDark(theme.colors.background) ? "custom-dark" : "custom-light";
  }
  
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "sunset-gradient") return "sunset";
  if (theme.id === "ocean-depths") return "ocean";
  if (theme.id === "aurora-borealis") return "aurora";
  if (theme.id === "ember-forge") return "ember";
  if (theme.id === "midnight-garden") return "midnight";
  if (theme.id === "cyber-neon") return "cyber";
  if (theme.id === "alien-tech") return "alien";
  if (theme.id === "corporate-clean") return "corporate";
  if (theme.id === "cosmic-voyage") return "cosmic";
  if (theme.id === "architectural-mono") return "architectural";
  if (theme.id === "anime-dreamscape") return "anime";
  if (theme.id === "hacker-terminal") return "hacker";
  return "dark";
}

export default function ExportModal({ isExporting, theme, onExport, onClose }: ExportModalProps) {
  const themeType = getThemeType(theme);
  const isDark = themeType !== "light";
  
  // Theme-aware colors
  const colors = {
    dark: {
      bg: "bg-zinc-900",
      border: "border-zinc-700",
      text: "text-zinc-100",
      textMuted: "text-zinc-400",
      cardBg: "bg-zinc-800/50",
      cardBorder: "border-zinc-700",
      cardHover: "hover:border-amber-500/50 hover:bg-amber-500/5",
      closeHover: "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200",
    },
    light: {
      bg: "bg-white",
      border: "border-slate-200",
      text: "text-slate-900",
      textMuted: "text-slate-500",
      cardBg: "bg-slate-50",
      cardBorder: "border-slate-200",
      cardHover: "hover:border-cyan-500/50 hover:bg-cyan-500/5",
      closeHover: "hover:bg-slate-100 text-slate-400 hover:text-slate-600",
    },
    sunset: {
      bg: "bg-[#1c1017]",
      border: "border-pink-900/50",
      text: "text-pink-50",
      textMuted: "text-pink-300/70",
      cardBg: "bg-[#2d1a24]/50",
      cardBorder: "border-pink-900/40",
      cardHover: "hover:border-pink-500/50 hover:bg-pink-500/5",
      closeHover: "hover:bg-pink-950/50 text-pink-300/70 hover:text-pink-100",
    },
    ocean: {
      bg: "bg-[#0a1628]",
      border: "border-[#1e3a5f]",
      text: "text-cyan-50",
      textMuted: "text-cyan-300/70",
      cardBg: "bg-[#122a45]/50",
      cardBorder: "border-[#1e3a5f]",
      cardHover: "hover:border-teal-500/50 hover:bg-teal-500/5",
      closeHover: "hover:bg-[#122a45]/50 text-cyan-300/70 hover:text-cyan-100",
    },
    aurora: {
      bg: "bg-[#0f0a1a]",
      border: "border-[#2d1f4a]",
      text: "text-purple-50",
      textMuted: "text-purple-300/70",
      cardBg: "bg-[#1a1030]/50",
      cardBorder: "border-[#2d1f4a]",
      cardHover: "hover:border-purple-500/50 hover:bg-purple-500/5",
      closeHover: "hover:bg-[#1a1030]/50 text-purple-300/70 hover:text-purple-100",
    },
    ember: {
      bg: "bg-[#1a0a0a]",
      border: "border-[#7f1d1d]",
      text: "text-red-50",
      textMuted: "text-red-300/70",
      cardBg: "bg-[#2a1010]/50",
      cardBorder: "border-[#7f1d1d]",
      cardHover: "hover:border-red-500/50 hover:bg-red-500/5",
      closeHover: "hover:bg-[#2a1010]/50 text-red-300/70 hover:text-red-100",
    },
    midnight: {
      bg: "bg-[#0c0a1d]",
      border: "border-[#312e81]",
      text: "text-pink-50",
      textMuted: "text-pink-300/70",
      cardBg: "bg-[#1a1735]/50",
      cardBorder: "border-[#312e81]",
      cardHover: "hover:border-pink-400/50 hover:bg-pink-400/5",
      closeHover: "hover:bg-[#1a1735]/50 text-pink-300/70 hover:text-pink-100",
    },
    cyber: {
      bg: "bg-[#0a0a0f]",
      border: "border-[#1a1a2e]",
      text: "text-cyan-50",
      textMuted: "text-cyan-300/70",
      cardBg: "bg-[#151520]/50",
      cardBorder: "border-[#1a1a2e]",
      cardHover: "hover:border-cyan-400/50 hover:bg-cyan-400/5",
      closeHover: "hover:bg-[#151520]/50 text-cyan-300/70 hover:text-cyan-100",
    },
    alien: {
      bg: "bg-[#0a0f0a]",
      border: "border-[#1a2a1a]",
      text: "text-lime-50",
      textMuted: "text-lime-300/70",
      cardBg: "bg-[#121a12]/50",
      cardBorder: "border-[#1a2a1a]",
      cardHover: "hover:border-lime-400/50 hover:bg-lime-400/5",
      closeHover: "hover:bg-[#121a12]/50 text-lime-300/70 hover:text-lime-100",
    },
    corporate: {
      bg: "bg-white",
      border: "border-gray-200",
      text: "text-gray-900",
      textMuted: "text-gray-500",
      cardBg: "bg-gray-50",
      cardBorder: "border-gray-200",
      cardHover: "hover:border-blue-400/50 hover:bg-blue-50/50",
      closeHover: "hover:bg-gray-100 text-gray-400 hover:text-gray-600",
    },
    cosmic: {
      bg: "bg-[#0a0612]",
      border: "border-violet-500/30",
      text: "text-white",
      textMuted: "text-violet-300/70",
      cardBg: "bg-[#120a1f]/80",
      cardBorder: "border-violet-500/25",
      cardHover: "hover:border-violet-400/50 hover:bg-violet-500/10",
      closeHover: "hover:bg-violet-500/20 text-violet-300/70 hover:text-violet-100",
    },
    architectural: {
      bg: "bg-[#0a0a0a]",
      border: "border-white/20",
      text: "text-white",
      textMuted: "text-neutral-400",
      cardBg: "bg-[#141414]/90",
      cardBorder: "border-white/15",
      cardHover: "hover:border-white/30 hover:bg-white/5",
      closeHover: "hover:bg-white/10 text-neutral-400 hover:text-white",
    },
    anime: {
      bg: "bg-[#1a1625]",
      border: "border-fuchsia-500/25",
      text: "text-white",
      textMuted: "text-fuchsia-300/70",
      cardBg: "bg-[#251f35]/80",
      cardBorder: "border-fuchsia-500/20",
      cardHover: "hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10",
      closeHover: "hover:bg-fuchsia-500/20 text-fuchsia-300/70 hover:text-fuchsia-100",
    },
    hacker: {
      bg: "bg-[#0d0d0d]",
      border: "border-[#00ff41]/30",
      text: "text-[#00ff41]",
      textMuted: "text-[#39ff14]/70",
      cardBg: "bg-[#141414]/90",
      cardBorder: "border-[#00ff41]/25",
      cardHover: "hover:border-[#00ff41]/50 hover:bg-[#00ff41]/10",
      closeHover: "hover:bg-[#00ff41]/20 text-[#39ff14]/70 hover:text-[#00ff41]",
    },
    // Custom dark theme
    "custom-dark": {
      bg: "bg-black/95",
      border: "border-white/20",
      text: "text-white",
      textMuted: "text-white/60",
      cardBg: "bg-white/10",
      cardBorder: "border-white/15",
      cardHover: "hover:border-white/30 hover:bg-white/15",
      closeHover: "hover:bg-white/10 text-white/60 hover:text-white",
    },
    // Custom light theme
    "custom-light": {
      bg: "bg-white",
      border: "border-black/10",
      text: "text-black",
      textMuted: "text-black/60",
      cardBg: "bg-black/5",
      cardBorder: "border-black/10",
      cardHover: "hover:border-black/20 hover:bg-black/10",
      closeHover: "hover:bg-black/5 text-black/60 hover:text-black",
    },
  };
  
  const c = colors[themeType];
  const accentColor = theme.colors.primary;

  const options = [
    { 
      format: "pdf" as const, 
      Icon: FileText, 
      title: "PDF Document", 
      desc: "Best for sharing and printing",
    },
    { 
      format: "pptx" as const, 
      Icon: Presentation, 
      title: "PowerPoint (PPTX)", 
      desc: "Editable in PowerPoint",
    },
    { 
      format: "images" as const, 
      Icon: Image, 
      title: "Images (HTML)", 
      desc: "High-quality slide images",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl border ${c.bg} ${c.border}`}>
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 rounded-lg p-2 transition-colors ${c.closeHover}`}
        >
          <X size={20} />
        </button>
        <h2 className={`mb-2 text-2xl font-bold ${c.text}`}>Export Presentation</h2>
        <p className={`mb-6 text-sm ${c.textMuted}`}>Choose your preferred export format</p>
        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.format}
              onClick={() => onExport(opt.format)}
              disabled={isExporting}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${c.cardBg} ${c.cardBorder} ${c.cardHover}`}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-11 h-11 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <opt.Icon size={22} style={{ color: accentColor }} />
                </div>
                <div className="text-left">
                  <div className={`font-semibold ${c.text}`}>{opt.title}</div>
                  <div className={`text-xs ${c.textMuted}`}>{opt.desc}</div>
                </div>
              </div>
              {isExporting && (
                <div 
                  className="animate-spin h-5 w-5 border-2 border-t-transparent rounded-full"
                  style={{ borderColor: accentColor, borderTopColor: "transparent" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
