"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";
import { type Theme } from "~/lib/themes";

interface FeedbackSectionProps {
  presentationId: string;
  theme?: Theme;
}

type ThemeType = "dark" | "light" | "sunset";

function getThemeType(theme?: Theme): ThemeType {
  if (!theme) return "light";
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "sunset-gradient") return "sunset";
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
    <div className={`w-full ${colors.bg} border-t ${colors.border} mt-16`}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h3 className={`text-2xl font-bold text-center ${colors.title} mb-6`}>
          Like what you created?
        </h3>
        <div className="space-y-3 mb-8">
          <button
            onClick={() => router.push("/createpresentation?mode=ai")}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r ${colors.buttonPrimary} text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]`}
          >
            <Sparkles size={20} />
            Create something else
          </button>
          <button
            onClick={() => router.push("/createpresentation?mode=ai")}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 ${colors.buttonSecondary} font-semibold transition-all`}
          >
            <ArrowLeft size={20} />
            Back to prompt
          </button>
        </div>
        <div className={`border-t ${colors.border} pt-6`}>
          <p className={`text-sm ${colors.subtitle} text-center mb-3`}>Help refine our product</p>
          <p className={`text-base font-semibold ${colors.title} text-center mb-4`}>
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
                title={option.label}
              >
                <span className="text-4xl">{option.icon}</span>
              </button>
            ))}
          </div>
          {selectedRating && (
            <p className={`text-center text-sm ${colors.thankYou} mt-4 font-medium`}>
              Thank you for your feedback!
            </p>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className={`mt-6 w-full text-sm ${colors.hideText} transition-colors`}
        >
          Hide
        </button>
      </div>
    </div>
  );
}
