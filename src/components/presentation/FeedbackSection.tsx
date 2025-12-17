"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";
import { type Theme } from "~/lib/themes";

interface FeedbackSectionProps {
  presentationId: string;
  theme?: Theme;
}

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

function getThemeType(theme?: Theme): ThemeType {
  if (!theme) return "light";
  
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

function getThemeColors(themeType: ThemeType, theme?: Theme) {
  const colors = {
    dark: {
      bg: "bg-zinc-950",
      border: "border-zinc-800",
      title: "text-zinc-100",
      subtitle: "text-zinc-400",
      buttonPrimary: "from-amber-600 to-amber-500",
      buttonSecondary: "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800",
      ratingBorder: "border-zinc-700",
      ratingHover: "hover:border-zinc-600 hover:bg-zinc-900",
      ratingSelected: "border-amber-500 bg-zinc-900",
      hideText: "text-zinc-500 hover:text-zinc-400",
      thankYou: "text-zinc-400",
    },
    light: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      title: "text-slate-900",
      subtitle: "text-slate-500",
      buttonPrimary: "from-cyan-600 to-cyan-500",
      buttonSecondary: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
      ratingBorder: "border-slate-200",
      ratingHover: "hover:border-slate-300 hover:bg-white",
      ratingSelected: "border-cyan-500 bg-cyan-50",
      hideText: "text-slate-500 hover:text-slate-700",
      thankYou: "text-slate-600",
    },
    sunset: {
      bg: "bg-[#1c1017]",
      border: "border-pink-900/40",
      title: "text-pink-50",
      subtitle: "text-pink-300/60",
      buttonPrimary: "from-pink-500 to-orange-500",
      buttonSecondary: "bg-[#2d1a24] border-pink-800/40 text-pink-200 hover:bg-pink-950/60",
      ratingBorder: "border-pink-800/40",
      ratingHover: "hover:border-pink-700/50 hover:bg-[#2d1a24]",
      ratingSelected: "border-pink-500 bg-pink-950/50",
      hideText: "text-pink-300/50 hover:text-pink-300",
      thankYou: "text-pink-300/70",
    },
    ocean: {
      bg: "bg-[#0a1628]",
      border: "border-teal-900/40",
      title: "text-teal-50",
      subtitle: "text-teal-300/60",
      buttonPrimary: "from-teal-500 to-cyan-500",
      buttonSecondary: "bg-[#0d1f35] border-teal-800/40 text-teal-200 hover:bg-teal-950/60",
      ratingBorder: "border-teal-800/40",
      ratingHover: "hover:border-teal-700/50 hover:bg-[#0d1f35]",
      ratingSelected: "border-teal-500 bg-teal-950/50",
      hideText: "text-teal-300/50 hover:text-teal-300",
      thankYou: "text-teal-300/70",
    },
    aurora: {
      bg: "bg-[#0f0a1a]",
      border: "border-purple-900/40",
      title: "text-purple-50",
      subtitle: "text-purple-300/60",
      buttonPrimary: "from-purple-500 to-green-500",
      buttonSecondary: "bg-[#1a1030] border-purple-800/40 text-purple-200 hover:bg-purple-950/60",
      ratingBorder: "border-purple-800/40",
      ratingHover: "hover:border-purple-700/50 hover:bg-[#1a1030]",
      ratingSelected: "border-purple-500 bg-purple-950/50",
      hideText: "text-purple-300/50 hover:text-purple-300",
      thankYou: "text-purple-300/70",
    },
    ember: {
      bg: "bg-[#1a0a0a]",
      border: "border-red-900/40",
      title: "text-red-50",
      subtitle: "text-red-300/60",
      buttonPrimary: "from-red-500 to-orange-500",
      buttonSecondary: "bg-[#2a1010] border-red-800/40 text-red-200 hover:bg-red-950/60",
      ratingBorder: "border-red-800/40",
      ratingHover: "hover:border-red-700/50 hover:bg-[#2a1010]",
      ratingSelected: "border-red-500 bg-red-950/50",
      hideText: "text-red-300/50 hover:text-red-300",
      thankYou: "text-red-300/70",
    },
    midnight: {
      bg: "bg-[#0c0a1d]",
      border: "border-indigo-900/40",
      title: "text-pink-50",
      subtitle: "text-pink-300/60",
      buttonPrimary: "from-pink-400 to-indigo-500",
      buttonSecondary: "bg-[#1a1735] border-indigo-800/40 text-pink-200 hover:bg-indigo-950/60",
      ratingBorder: "border-indigo-800/40",
      ratingHover: "hover:border-pink-400/50 hover:bg-[#1a1735]",
      ratingSelected: "border-pink-400 bg-indigo-950/50",
      hideText: "text-pink-300/50 hover:text-pink-300",
      thankYou: "text-pink-300/70",
    },
    cyber: {
      bg: "bg-[#0a0a0f]",
      border: "border-cyan-900/40",
      title: "text-cyan-50",
      subtitle: "text-cyan-300/60",
      buttonPrimary: "from-cyan-400 to-fuchsia-500",
      buttonSecondary: "bg-[#151520] border-cyan-800/40 text-cyan-200 hover:bg-cyan-950/60",
      ratingBorder: "border-cyan-800/40",
      ratingHover: "hover:border-cyan-400/50 hover:bg-[#151520]",
      ratingSelected: "border-cyan-400 bg-cyan-950/50",
      hideText: "text-cyan-300/50 hover:text-cyan-300",
      thankYou: "text-cyan-300/70",
    },
    alien: {
      bg: "bg-[#0a0f0a]",
      border: "border-lime-900/40",
      title: "text-lime-50",
      subtitle: "text-lime-300/60",
      buttonPrimary: "from-lime-400 to-emerald-500",
      buttonSecondary: "bg-[#121a12] border-lime-800/40 text-lime-200 hover:bg-lime-950/60",
      ratingBorder: "border-lime-800/40",
      ratingHover: "hover:border-lime-400/50 hover:bg-[#121a12]",
      ratingSelected: "border-lime-400 bg-lime-950/50",
      hideText: "text-lime-300/50 hover:text-lime-300",
      thankYou: "text-lime-300/70",
    },
    corporate: {
      bg: "bg-white",
      border: "border-gray-200",
      title: "text-gray-900",
      subtitle: "text-gray-500",
      buttonPrimary: "from-blue-500 to-blue-600",
      buttonSecondary: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100",
      ratingBorder: "border-gray-200",
      ratingHover: "hover:border-blue-300 hover:bg-blue-50",
      ratingSelected: "border-blue-500 bg-blue-50",
      hideText: "text-gray-400 hover:text-gray-600",
      thankYou: "text-gray-600",
    },
    cosmic: {
      bg: "bg-[#0a0612]/90",
      border: "border-violet-500/30",
      title: "text-white",
      subtitle: "text-violet-300/70",
      buttonPrimary: "from-violet-500 to-fuchsia-500",
      buttonSecondary: "bg-[#120a1f]/80 border-violet-500/30 text-violet-200 hover:bg-[#1a0a2e]/80",
      ratingBorder: "border-violet-500/30",
      ratingHover: "hover:border-violet-400 hover:bg-violet-500/20",
      ratingSelected: "border-violet-400 bg-violet-500/30",
      hideText: "text-violet-400/60 hover:text-violet-300",
      thankYou: "text-violet-300/70",
    },
    architectural: {
      bg: "bg-[#0a0a0a]/95",
      border: "border-white/20",
      title: "text-white",
      subtitle: "text-neutral-400",
      buttonPrimary: "from-white to-neutral-300",
      buttonSecondary: "bg-[#141414]/90 border-white/20 text-neutral-300 hover:bg-[#1a1a1a]/90",
      ratingBorder: "border-white/20",
      ratingHover: "hover:border-white/40 hover:bg-white/10",
      ratingSelected: "border-white bg-white/20",
      hideText: "text-neutral-500 hover:text-neutral-300",
      thankYou: "text-neutral-400",
    },
    anime: {
      bg: "bg-[#1a1625]/90",
      border: "border-fuchsia-500/25",
      title: "text-white",
      subtitle: "text-fuchsia-300/70",
      buttonPrimary: "from-fuchsia-500 to-pink-400",
      buttonSecondary: "bg-[#251f35]/80 border-fuchsia-500/25 text-fuchsia-200 hover:bg-[#2d2640]/80",
      ratingBorder: "border-fuchsia-500/25",
      ratingHover: "hover:border-fuchsia-400 hover:bg-fuchsia-500/20",
      ratingSelected: "border-fuchsia-400 bg-fuchsia-500/30",
      hideText: "text-fuchsia-400/60 hover:text-fuchsia-300",
      thankYou: "text-fuchsia-300/70",
    },
    hacker: {
      bg: "bg-[#0d0d0d]/95",
      border: "border-[#00ff41]/30",
      title: "text-[#00ff41]",
      subtitle: "text-[#39ff14]/70",
      buttonPrimary: "from-[#00ff41] to-[#39ff14]",
      buttonSecondary: "bg-[#141414]/90 border-[#00ff41]/30 text-[#00ff41] hover:bg-[#1a1a1a]/90",
      ratingBorder: "border-[#00ff41]/30",
      ratingHover: "hover:border-[#00ff41] hover:bg-[#00ff41]/20",
      ratingSelected: "border-[#00ff41] bg-[#00ff41]/30",
      hideText: "text-[#00ff41]/60 hover:text-[#00ff41]",
      thankYou: "text-[#39ff14]/70",
    },
    // Custom dark theme - uses inline styles from theme object
    "custom-dark": {
      bg: "", // Will use inline style
      border: "border-white/20",
      title: "text-white",
      subtitle: "text-white/60",
      buttonPrimary: "from-white/90 to-white/70",
      buttonSecondary: "bg-white/10 border-white/20 text-white hover:bg-white/20",
      ratingBorder: "border-white/20",
      ratingHover: "hover:border-white/40 hover:bg-white/10",
      ratingSelected: "border-white bg-white/20",
      hideText: "text-white/50 hover:text-white/70",
      thankYou: "text-white/60",
    },
    // Custom light theme - uses inline styles from theme object
    "custom-light": {
      bg: "", // Will use inline style
      border: "border-black/10",
      title: "text-black",
      subtitle: "text-black/60",
      buttonPrimary: "from-black/90 to-black/70",
      buttonSecondary: "bg-black/5 border-black/10 text-black hover:bg-black/10",
      ratingBorder: "border-black/10",
      ratingHover: "hover:border-black/20 hover:bg-black/5",
      ratingSelected: "border-black bg-black/10",
      hideText: "text-black/50 hover:text-black/70",
      thankYou: "text-black/60",
    },
  };
  return colors[themeType];
}

export default function FeedbackSection({ presentationId, theme }: FeedbackSectionProps) {
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const themeType = getThemeType(theme);
  const colors = getThemeColors(themeType, theme);
  const isCustomTheme = theme?.id.startsWith("custom-");
  
  // For custom themes, use inline styles from theme object
  const customBgStyle = isCustomTheme && theme ? {
    background: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
  } : {};
  
  const customTitleStyle = isCustomTheme && theme ? { color: theme.colors.heading } : {};
  const customSubtitleStyle = isCustomTheme && theme ? { color: theme.colors.textMuted } : {};
  const customButtonPrimaryStyle = isCustomTheme && theme ? {
    background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.accent})`,
  } : {};
  const customButtonSecondaryStyle = isCustomTheme && theme ? {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  } : {};

  const handleRating = async (rating: number) => {
    setSelectedRating(rating);
    setIsSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presentationId, rating, type: "satisfaction" }),
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  const ratingOptions = [
    { value: 1, icon: "☹️", label: "Not satisfied" },
    { value: 2, icon: "😐", label: "Neutral" },
    { value: 3, icon: "☺️", label: "Satisfied" },
  ];

  return (
    <div 
      className={`w-full ${colors.bg} border-t ${colors.border} mt-16`}
      style={customBgStyle}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h3 
          className={`text-2xl font-bold text-center ${colors.title} mb-6`}
          style={customTitleStyle}
        >
          Like what you created?
        </h3>
        <div className="space-y-3 mb-8">
          <button
            onClick={() => router.push("/createpresentation?mode=ai")}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl ${!isCustomTheme ? `bg-gradient-to-r ${colors.buttonPrimary}` : ''} text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]`}
            style={customButtonPrimaryStyle}
          >
            <Sparkles size={20} />
            Create something else
          </button>
          <button
            onClick={() => router.push("/createpresentation?mode=ai")}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 ${colors.buttonSecondary} font-semibold transition-all`}
            style={customButtonSecondaryStyle}
          >
            <ArrowLeft size={20} />
            Back to prompt
          </button>
        </div>
        <div 
          className={`border-t ${colors.border} pt-6`}
          style={isCustomTheme && theme ? { borderColor: theme.colors.border } : {}}
        >
          <p 
            className={`text-sm ${colors.subtitle} text-center mb-3`}
            style={customSubtitleStyle}
          >
            Help refine our product
          </p>
          <p 
            className={`text-base font-semibold ${colors.title} text-center mb-4`}
            style={customTitleStyle}
          >
            How satisfied are you with the output?
          </p>
          <div className="flex items-center justify-center gap-4">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRating(option.value)}
                disabled={isSubmitting}
                className={`flex flex-col items-center gap-2 px-8 py-4 rounded-xl border-2 transition-all ${
                  selectedRating === option.value
                    ? `${colors.ratingSelected} scale-105`
                    : `${colors.ratingBorder} ${colors.ratingHover}`
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                style={isCustomTheme && theme ? {
                  borderColor: selectedRating === option.value ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selectedRating === option.value ? `${theme.colors.primary}20` : 'transparent',
                } : {}}
                title={option.label}
              >
                <span className="text-4xl">{option.icon}</span>
              </button>
            ))}
          </div>
          {selectedRating && (
            <p 
              className={`text-center text-sm ${colors.thankYou} mt-4 font-medium`}
              style={customSubtitleStyle}
            >
              Thank you for your feedback!
            </p>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className={`mt-6 w-full text-sm ${colors.hideText} transition-colors`}
          style={isCustomTheme && theme ? { color: theme.colors.textMuted } : {}}
        >
          Hide
        </button>
      </div>
    </div>
  );
}
