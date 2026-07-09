"use client";

import { useState, useEffect } from "react";
import { Star, X, Send, Loader2, CheckCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { useUser } from "@clerk/nextjs";
import type { Theme } from "~/lib/themes";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";
import { PRESENTATIONS_THRESHOLD, markAsReviewed, markAsSkipped } from "./rate-us-utils";

export { incrementPresentationCount, checkExistingReview, shouldShowRatePrompt, markAsReviewed } from "./rate-us-utils";

// Helper to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

interface RateUsModalProps {
  onClose: () => void;
  theme?: Theme;
}

export function RateUsModal({ onClose, theme }: RateUsModalProps) {
  const { user } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    rating: 5,
    title: "",
    content: "",
  });

  // Theme-aware colors using the helper
  const modalColors = theme ? getModalColors(theme) : null;
  const isDark = modalColors?.isDark ?? (theme ? isColorDark(theme.colors.background) : true);
  const colors = isDark ? {
    bg: modalColors?.bg || "#18181b",
    text: modalColors?.text || "#fafafa",
    textMuted: modalColors?.textMuted || "#a1a1aa",
    border: modalColors?.border || "#3f3f46",
    inputBg: modalColors?.surface || "#27272a",
    hoverBg: modalColors?.hoverBg || "#3f3f46",
    successBg: "rgba(34, 197, 94, 0.1)",
    successText: "#4ade80",
    starFill: "#facc15",
    starEmpty: "#3f3f46",
  } : {
    bg: modalColors?.bg || "#ffffff",
    text: modalColors?.text || "#0f172a",
    textMuted: modalColors?.textMuted || "#64748b",
    border: modalColors?.border || "#e2e8f0",
    inputBg: modalColors?.surface || "#ffffff",
    hoverBg: modalColors?.hoverBg || "#f1f5f9",
    successBg: "#dcfce7",
    successText: "#16a34a",
    starFill: "#facc15",
    starEmpty: "#e2e8f0",
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.primaryEmailAddress?.emailAddress || prev.email,
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        // Mark as reviewed so we don't prompt again
        markAsReviewed();
        setTimeout(onClose, 2500);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
      }
    } catch (err) {
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Increment skip count, will prompt again after another 5 presentations
    markAsSkipped();
    onClose();
  };

  const StarRating = ({ rating, onChange }: { rating: number; onChange: (r: number) => void }) => (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition hover:scale-110"
        >
          <Star
            size={36}
            style={{
              fill: star <= rating ? colors.starFill : colors.starEmpty,
              color: star <= rating ? colors.starFill : colors.starEmpty,
            }}
          />
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div 
          className="rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center"
          style={{ backgroundColor: colors.bg }}
        >
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: colors.successBg }}
          >
            <CheckCircle className="h-8 w-8" style={{ color: colors.successText }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
            Thank You! 🎉
          </h3>
          <p style={{ color: colors.textMuted }}>
            Your feedback helps us improve PPTera for everyone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleSkip}>
      <div 
        className="rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl" 
        style={{ backgroundColor: colors.bg }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: colors.text }}>
              Enjoying PPTera? ⭐
            </h2>
            <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
              You&apos;ve created {PRESENTATIONS_THRESHOLD}+ presentations! We&apos;d love your feedback.
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 transition"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="py-4">
            <StarRating
              rating={formData.rating}
              onChange={(rating) => setFormData({ ...formData, rating })}
            />
            <p className="text-center text-sm mt-2" style={{ color: colors.textMuted }}>
              {formData.rating === 5 && "Excellent!"}
              {formData.rating === 4 && "Great!"}
              {formData.rating === 3 && "Good"}
              {formData.rating === 2 && "Fair"}
              {formData.rating === 1 && "Poor"}
            </p>
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              required
              minLength={5}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
              style={{ 
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="Title your review (e.g., 'Great for quick presentations!')"
            />
          </div>

          {/* Content */}
          <div>
            <textarea
              required
              minLength={20}
              rows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent resize-none"
              style={{ 
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text,
              }}
              placeholder="What do you like most? Any suggestions for improvement?"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-2.5 border rounded-lg font-medium transition"
              style={{ 
                borderColor: colors.border,
                color: colors.textMuted,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Maybe Later
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

