"use client";

import { useState, useEffect } from "react";
import { X, Download, Crown } from "lucide-react";
import { type Theme } from "~/lib/themes";
import PricingModal from "~/components/dashboard/PricingModal";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";
import { trackExportPresentation } from "~/components/GoogleAnalytics";

interface ExportModalProps {
  isExporting: boolean;
  theme: Theme;
  totalSlides?: number;
  subscriptionPlan?: string | null;
  currentSlide?: number;
  onExport: (format: "pdf" | "pptx" | "images", options?: ExportOptions) => void;
  onClose: () => void;
}

interface ExportOptions {
  range: "all" | "current" | "custom";
  customRange?: { from: number; to: number };
}

type ExportFormat = "pdf" | "pptx" | "images";
type ExportRange = "all" | "current" | "custom";

// Theme type detection
type ThemeType = "dark" | "light" | "sunset" | "ocean" | "aurora" | "ember" | "midnight" | "cyber" | "alien" | "corporate" | "cosmic" | "architectural" | "anime" | "hacker" | "custom-dark" | "custom-light";

function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function getThemeType(theme: Theme): ThemeType {
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
  // For themes with background images or unknown themes, check background luminance
  return isColorDark(theme.colors.background) ? "custom-dark" : "custom-light";
}

const themeColors: Record<ThemeType, {
  bg: string;
  border: string;
  text: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  inputBg: string;
  inputBorder: string;
  closeHover: string;
  accent: string;
}> = {
  dark: {
    bg: "bg-zinc-900",
    border: "border-zinc-700",
    text: "text-zinc-100",
    textMuted: "text-zinc-400",
    cardBg: "bg-zinc-800/50",
    cardBorder: "border-zinc-700",
    cardHover: "hover:border-zinc-600",
    inputBg: "bg-zinc-800",
    inputBorder: "border-zinc-600",
    closeHover: "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200",
    accent: "text-amber-400",
  },
  light: {
    bg: "bg-white",
    border: "border-slate-200",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    cardBg: "bg-slate-50",
    cardBorder: "border-slate-200",
    cardHover: "hover:border-slate-300",
    inputBg: "bg-white",
    inputBorder: "border-slate-300",
    closeHover: "hover:bg-slate-100 text-slate-400 hover:text-slate-600",
    accent: "text-cyan-600",
  },
  sunset: {
    bg: "bg-[#1c1017]",
    border: "border-pink-900/50",
    text: "text-pink-50",
    textMuted: "text-pink-300/70",
    cardBg: "bg-[#2d1a24]/50",
    cardBorder: "border-pink-900/40",
    cardHover: "hover:border-pink-700/60",
    inputBg: "bg-[#2d1a24]",
    inputBorder: "border-pink-900/50",
    closeHover: "hover:bg-pink-950/50 text-pink-300/70 hover:text-pink-100",
    accent: "text-pink-400",
  },
  ocean: {
    bg: "bg-[#0a1628]",
    border: "border-[#1e3a5f]",
    text: "text-cyan-50",
    textMuted: "text-cyan-300/70",
    cardBg: "bg-[#122a45]/50",
    cardBorder: "border-[#1e3a5f]",
    cardHover: "hover:border-teal-600/50",
    inputBg: "bg-[#122a45]",
    inputBorder: "border-[#1e3a5f]",
    closeHover: "hover:bg-[#122a45]/50 text-cyan-300/70 hover:text-cyan-100",
    accent: "text-teal-400",
  },
  aurora: {
    bg: "bg-[#0f0a1a]",
    border: "border-[#2d1f4a]",
    text: "text-purple-50",
    textMuted: "text-purple-300/70",
    cardBg: "bg-[#1a1030]/50",
    cardBorder: "border-[#2d1f4a]",
    cardHover: "hover:border-purple-600/50",
    inputBg: "bg-[#1a1030]",
    inputBorder: "border-[#2d1f4a]",
    closeHover: "hover:bg-[#1a1030]/50 text-purple-300/70 hover:text-purple-100",
    accent: "text-purple-400",
  },
  ember: {
    bg: "bg-[#1a0a0a]",
    border: "border-[#7f1d1d]",
    text: "text-red-50",
    textMuted: "text-red-300/70",
    cardBg: "bg-[#2a1010]/50",
    cardBorder: "border-[#7f1d1d]",
    cardHover: "hover:border-red-600/50",
    inputBg: "bg-[#2a1010]",
    inputBorder: "border-[#7f1d1d]",
    closeHover: "hover:bg-[#2a1010]/50 text-red-300/70 hover:text-red-100",
    accent: "text-red-400",
  },
  midnight: {
    bg: "bg-[#0c0a1d]",
    border: "border-[#312e81]",
    text: "text-pink-50",
    textMuted: "text-pink-300/70",
    cardBg: "bg-[#1a1735]/50",
    cardBorder: "border-[#312e81]",
    cardHover: "hover:border-pink-500/40",
    inputBg: "bg-[#1a1735]",
    inputBorder: "border-[#312e81]",
    closeHover: "hover:bg-[#1a1735]/50 text-pink-300/70 hover:text-pink-100",
    accent: "text-pink-400",
  },
  cyber: {
    bg: "bg-[#0a0a0f]",
    border: "border-[#1a1a2e]",
    text: "text-cyan-50",
    textMuted: "text-cyan-300/70",
    cardBg: "bg-[#151520]/50",
    cardBorder: "border-[#1a1a2e]",
    cardHover: "hover:border-cyan-500/40",
    inputBg: "bg-[#151520]",
    inputBorder: "border-[#1a2a2e]",
    closeHover: "hover:bg-[#151520]/50 text-cyan-300/70 hover:text-cyan-100",
    accent: "text-cyan-400",
  },
  alien: {
    bg: "bg-[#0a0f0a]",
    border: "border-[#1a2a1a]",
    text: "text-lime-50",
    textMuted: "text-lime-300/70",
    cardBg: "bg-[#121a12]/50",
    cardBorder: "border-[#1a2a1a]",
    cardHover: "hover:border-lime-500/40",
    inputBg: "bg-[#121a12]",
    inputBorder: "border-[#1a2a1a]",
    closeHover: "hover:bg-[#121a12]/50 text-lime-300/70 hover:text-lime-100",
    accent: "text-lime-400",
  },
  corporate: {
    bg: "bg-white",
    border: "border-gray-200",
    text: "text-gray-900",
    textMuted: "text-gray-500",
    cardBg: "bg-gray-50",
    cardBorder: "border-gray-200",
    cardHover: "hover:border-gray-300",
    inputBg: "bg-white",
    inputBorder: "border-gray-300",
    closeHover: "hover:bg-gray-100 text-gray-400 hover:text-gray-600",
    accent: "text-blue-600",
  },
  cosmic: {
    bg: "bg-[#0a0612]",
    border: "border-violet-500/30",
    text: "text-white",
    textMuted: "text-violet-300/70",
    cardBg: "bg-[#120a1f]/80",
    cardBorder: "border-violet-500/25",
    cardHover: "hover:border-violet-500/40",
    inputBg: "bg-[#120a1f]",
    inputBorder: "border-violet-500/30",
    closeHover: "hover:bg-violet-500/20 text-violet-300/70 hover:text-violet-100",
    accent: "text-violet-400",
  },
  architectural: {
    bg: "bg-[#0a0a0a]",
    border: "border-white/20",
    text: "text-white",
    textMuted: "text-neutral-400",
    cardBg: "bg-[#141414]/90",
    cardBorder: "border-white/15",
    cardHover: "hover:border-white/25",
    inputBg: "bg-[#141414]",
    inputBorder: "border-white/20",
    closeHover: "hover:bg-white/10 text-neutral-400 hover:text-white",
    accent: "text-white",
  },
  anime: {
    bg: "bg-[#1a1625]",
    border: "border-fuchsia-500/25",
    text: "text-white",
    textMuted: "text-fuchsia-300/70",
    cardBg: "bg-[#251f35]/80",
    cardBorder: "border-fuchsia-500/20",
    cardHover: "hover:border-fuchsia-500/35",
    inputBg: "bg-[#251f35]",
    inputBorder: "border-fuchsia-500/25",
    closeHover: "hover:bg-fuchsia-500/20 text-fuchsia-300/70 hover:text-fuchsia-100",
    accent: "text-fuchsia-400",
  },
  hacker: {
    bg: "bg-[#0d0d0d]",
    border: "border-[#00ff41]/30",
    text: "text-[#00ff41]",
    textMuted: "text-[#39ff14]/70",
    cardBg: "bg-[#141414]/90",
    cardBorder: "border-[#00ff41]/25",
    cardHover: "hover:border-[#00ff41]/40",
    inputBg: "bg-[#141414]",
    inputBorder: "border-[#00ff41]/30",
    closeHover: "hover:bg-[#00ff41]/20 text-[#39ff14]/70 hover:text-[#00ff41]",
    accent: "text-[#00ff41]",
  },
  "custom-dark": {
    bg: "bg-black/95",
    border: "border-white/20",
    text: "text-white",
    textMuted: "text-white/60",
    cardBg: "bg-white/10",
    cardBorder: "border-white/15",
    cardHover: "hover:border-white/25",
    inputBg: "bg-white/10",
    inputBorder: "border-white/20",
    closeHover: "hover:bg-white/10 text-white/60 hover:text-white",
    accent: "text-white",
  },
  "custom-light": {
    bg: "bg-white",
    border: "border-black/10",
    text: "text-black",
    textMuted: "text-black/60",
    cardBg: "bg-black/5",
    cardBorder: "border-black/10",
    cardHover: "hover:border-black/20",
    inputBg: "bg-black/5",
    inputBorder: "border-black/10",
    closeHover: "hover:bg-black/5 text-black/60 hover:text-black",
    accent: "text-black",
  },
};

export default function ExportModal({ 
  isExporting, 
  theme, 
  totalSlides = 1,
  subscriptionPlan,
  currentSlide = 1,
  onExport, 
  onClose,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pptx");
  const [exportRange, setExportRange] = useState<ExportRange>("all");
  const [customFromInput, setCustomFromInput] = useState("1");
  const [customToInput, setCustomToInput] = useState(String(totalSlides));
  const [showPricingModal, setShowPricingModal] = useState(false);
  
  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // Update customTo when totalSlides changes
  useEffect(() => {
    setCustomToInput(String(totalSlides));
  }, [totalSlides]);

  // Parse the input values for export
  const customFrom = parseInt(customFromInput) || 1;
  const customTo = parseInt(customToInput) || totalSlides;

  const themeType = getThemeType(theme);
  const c = themeColors[themeType];
  const accentColor = theme.colors.primary;
  
  // Get modal colors for inline styles
  const modalColors = getModalColors(theme);
  
  const hasPaidPlan = subscriptionPlan && ["plus", "pro", "ultra"].includes(subscriptionPlan);
  const hasProPlus = subscriptionPlan && ["pro", "ultra"].includes(subscriptionPlan);

  // Microsoft PowerPoint icon - official style
  const PowerPointIcon = ({ selected }: { selected: boolean }) => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="4" width="32" height="40" rx="2" fill={selected ? "#D24726" : "#6B7280"} />
      <rect x="4" y="12" width="20" height="24" rx="1" fill={selected ? "#B7472A" : "#525252"} />
      <text x="14" y="28" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">P</text>
      <path d="M28 14h8M28 20h8M28 26h8M28 32h6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );

  // Adobe PDF icon - official style  
  const PDFIcon = ({ selected }: { selected: boolean }) => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <path d="M8 4h24l8 8v32a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" fill={selected ? "#FF0000" : "#6B7280"} />
      <path d="M32 4v8h8" fill={selected ? "#CC0000" : "#525252"} />
      <path d="M32 4l8 8h-8V4z" fill={selected ? "#FF3333" : "#737373"} />
      <text x="24" y="32" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">PDF</text>
    </svg>
  );

  // Image/Gallery icon - photo style
  const ImagesIcon = ({ selected }: { selected: boolean }) => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="8" width="40" height="32" rx="3" fill={selected ? "#4CAF50" : "#6B7280"} />
      <circle cx="14" cy="18" r="4" fill={selected ? "#81C784" : "#9CA3AF"} />
      <path d="M4 32l10-10 8 8 8-12 14 18H4v-4z" fill={selected ? "#2E7D32" : "#525252"} />
      <rect x="8" y="4" width="36" height="28" rx="2" fill="none" stroke={selected ? "#66BB6A" : "#9CA3AF"} strokeWidth="2" opacity="0.5" />
    </svg>
  );

  const formats = [
    { id: "pptx" as const, Icon: PowerPointIcon, label: "PowerPoint", ext: ".pptx" },
    { id: "pdf" as const, Icon: PDFIcon, label: "PDF", ext: ".pdf" },
    { id: "images" as const, Icon: ImagesIcon, label: "Images", ext: ".zip" },
  ];

  const handleExport = () => {
    const options: ExportOptions = {
      range: exportRange,
      ...(exportRange === "custom" && { customRange: { from: customFrom, to: customTo || totalSlides } }),
    };
    // Track export event
    trackExportPresentation(selectedFormat);
    onExport(selectedFormat, options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-2xl rounded-2xl p-6 shadow-2xl border"
        style={{
          backgroundColor: modalColors.bg,
          borderColor: modalColors.border,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 rounded-lg p-2 transition-colors ${c.closeHover}`}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className={`text-xl font-bold ${c.text}`}>{t.exportModalTitle || "Export Presentation"}</h2>
          <p className={`text-sm mt-1 ${c.textMuted}`}>
            {totalSlides} {t.slidesCountExport || "slides"} • {t.chooseFormatRange || "Choose format and range"}
          </p>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className={`text-sm font-medium ${c.textMuted} mb-3 block`}>{t.formatLabel || "Format"}</label>
          <div className="grid grid-cols-3 gap-3">
            {formats.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors
                  ${selectedFormat === fmt.id 
                    ? `border-current ${c.accent} ${c.cardBg}` 
                    : `${c.cardBorder} ${c.cardHover} ${c.cardBg}`
                  }
                `}
              >
                <fmt.Icon selected={selectedFormat === fmt.id} />
                <span className={`text-sm font-medium ${c.text}`}>{fmt.label}</span>
                <span className={`text-xs ${c.textMuted}`}>{fmt.ext}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Range Selection */}
        <div className="mb-6">
          <label className={`text-sm font-medium ${c.textMuted} mb-3 block`}>{t.slidesToExport || "Slides to export"}</label>
          <div className={`inline-flex p-1 rounded-xl ${c.cardBg} ${c.cardBorder} border`}>
            <button
              onClick={() => setExportRange("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                exportRange === "all"
                  ? "text-white shadow-md"
                  : `${c.textMuted} hover:${c.text}`
              }`}
              style={exportRange === "all" ? { backgroundColor: accentColor } : undefined}
            >
              {t.allSlidesRange || "All slides"} ({totalSlides})
            </button>
            <button
              onClick={() => setExportRange("current")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                exportRange === "current"
                  ? "text-white shadow-md"
                  : `${c.textMuted} hover:${c.text}`
              }`}
              style={exportRange === "current" ? { backgroundColor: accentColor } : undefined}
            >
              {t.currentSlideOnly || "Current slide only"}
            </button>
            <button
              onClick={() => setExportRange("custom")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                exportRange === "custom"
                  ? "text-white shadow-md"
                  : `${c.textMuted} hover:${c.text}`
              }`}
              style={exportRange === "custom" ? { backgroundColor: accentColor } : undefined}
            >
              {t.customRange || "Custom range"}
            </button>
          </div>

          {exportRange === "custom" && (
            <div className={`inline-flex items-center gap-4 p-4 mt-3 rounded-xl ${c.cardBg} ${c.cardBorder} border`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${c.textMuted}`}>{t.fromSlide || "From"}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={customFromInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setCustomFromInput(val);
                  }}
                  onBlur={() => {
                    const num = parseInt(customFromInput) || 1;
                    setCustomFromInput(String(Math.max(1, Math.min(totalSlides, num))));
                  }}
                  className={`w-20 px-3 py-2 rounded-lg text-sm text-center font-medium ${c.inputBg} ${c.inputBorder} border ${c.text} focus:outline-none focus:ring-2 focus:ring-offset-0`}
                  style={{ ["--tw-ring-color" as string]: accentColor }}
                />
              </div>
              <span className={`text-sm ${c.textMuted}`}>{t.toSlide || "to"}</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={customToInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setCustomToInput(val);
                  }}
                  onBlur={() => {
                    const num = parseInt(customToInput) || totalSlides;
                    setCustomToInput(String(Math.max(1, Math.min(totalSlides, num))));
                  }}
                  className={`w-20 px-3 py-2 rounded-lg text-sm text-center font-medium ${c.inputBg} ${c.inputBorder} border ${c.text} focus:outline-none focus:ring-2 focus:ring-offset-0`}
                  style={{ ["--tw-ring-color" as string]: accentColor }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Watermark Notice or Locking */}
        {!hasPaidPlan ? (
          <div className={`mb-6 p-4 rounded-xl ${c.cardBg} ${c.cardBorder} border`}>
            <div className="flex items-start gap-3">
              <Crown size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${c.text}`}>
                  {t.upgradeToExportTitle || "Export is a Plus feature"}
                </p>
                <p className={`text-xs mt-1 ${c.textMuted}`}>
                  {t.upgradeToExportDesc || "Upgrade to a Plus plan or higher to export your presentation as PDF, PowerPoint, or Images."}
                </p>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium mt-2"
                  style={{ color: accentColor }}
                >
                  {t.viewPlansBtn || "View plans"} →
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${c.textMuted} ${c.closeHover}`}
          >
            {t.cancel || "Cancel"}
          </button>
          <button
            onClick={hasPaidPlan ? handleExport : () => setShowPricingModal(true)}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.exportingStatus || "Exporting..."}
              </>
            ) : (
              <>
                {!hasPaidPlan ? <Crown size={16} /> : <Download size={16} />}
                {hasPaidPlan ? (t.exportBtn || "Export") : (t.upgradeToExport || "Upgrade to Export")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        currentPlan={subscriptionPlan}
      />
    </div>
  );
}
