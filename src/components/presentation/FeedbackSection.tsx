"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";
import { type Theme } from "~/lib/themes";

interface FeedbackSectionProps {
  presentationId: string;
  theme?: Theme;
}

// Helper to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  if (!hexColor || !hexColor.startsWith("#")) return true;
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export default function FeedbackSection({ presentationId, theme }: FeedbackSectionProps) {
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use theme colors directly, with fallbacks
  const isDark = theme ? isColorDark(theme.colors.background) : true;
  
  const colors = {
    bg: theme?.colors.backgroundAlt || theme?.colors.background || (isDark ? "#0a0a0a" : "#f8fafc"),
    border: theme?.colors.border || (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
    title: theme?.colors.heading || theme?.colors.text || (isDark ? "#ffffff" : "#0f172a"),
    subtitle: theme?.colors.textMuted || (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"),
    primary: theme?.colors.primary || "#3b82f6",
    accent: theme?.colors.accent || theme?.colors.primary || "#06b6d4",
    surface: theme?.colors.surface || (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)"),
    text: theme?.colors.text || (isDark ? "#ffffff" : "#0f172a"),
  };

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
      className="w-full"
      style={{
        background: colors.bg,
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      <div className="w-full px-8 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <h3 
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight"
            style={{ color: colors.title }}
          >
            Like what you created?
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => router.push("/createpresentation?mode=ai")}
              className="w-full md:flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-white text-lg font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all hover:scale-[1.03] active:scale-[1.01]"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              }}
            >
              <Sparkles size={24} className="animate-pulse" />
              Create something else
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full md:flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl border-2 text-lg font-bold transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[1.01]"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              <ArrowLeft size={24} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
            }}
          >
            <ArrowLeft size={20} />
            Back to prompt
          </button>
        </div>
        <div 
          className="pt-6"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <p 
            className="text-sm text-center mb-3"
            style={{ color: colors.subtitle }}
          >
            Help refine our product
          </p>
          <p 
            className="text-base font-semibold text-center mb-4"
            style={{ color: colors.title }}
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
                  selectedRating === option.value ? "scale-105" : ""
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                style={{
                  borderColor: selectedRating === option.value ? colors.primary : colors.border,
                  backgroundColor: selectedRating === option.value ? `${colors.primary}20` : "transparent",
                }}
                title={option.label}
              >
                <span className="text-4xl">{option.icon}</span>
              </button>
            ))}
          </div>
          {selectedRating && (
            <p 
              className="text-center text-sm mt-4 font-medium"
              style={{ color: colors.subtitle }}
            >
              Thank you for your feedback!
            </p>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="mt-6 w-full text-sm transition-colors hover:opacity-80"
          style={{ color: colors.subtitle }}
        >
          Hide
        </button>
      </div>
    </div>
  );
}
