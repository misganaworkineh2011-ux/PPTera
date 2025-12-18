"use client";

import { useState, useEffect } from "react";
import { Star, X, Send, Loader2, CheckCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { useUser } from "@clerk/nextjs";

const STORAGE_KEY = "pptmaster_rate_prompt";
const PRESENTATIONS_THRESHOLD = 5;

interface RateUsModalProps {
  onClose: () => void;
}

export function RateUsModal({ onClose }: RateUsModalProps) {
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
    const data = getRatePromptData();
    data.skippedCount = (data.skippedCount || 0) + 1;
    data.lastSkipped = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
            className={cn(
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
            )}
          />
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Thank You! 🎉
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Your feedback helps us improve PPTMaster for everyone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleSkip}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Enjoying PPTMaster? ⭐
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              You&apos;ve created {PRESENTATIONS_THRESHOLD}+ presentations! We&apos;d love your feedback.
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
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
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
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
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
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
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent resize-none"
              placeholder="What do you like most? Any suggestions for improvement?"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
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

// Helper functions for tracking
interface RatePromptData {
  presentationCount: number;
  hasReviewed: boolean;
  skippedCount: number;
  lastSkipped: number | null;
}

function getRatePromptData(): RatePromptData {
  if (typeof window === "undefined") {
    return { presentationCount: 0, hasReviewed: false, skippedCount: 0, lastSkipped: null };
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { presentationCount: 0, hasReviewed: false, skippedCount: 0, lastSkipped: null };
  } catch {
    return { presentationCount: 0, hasReviewed: false, skippedCount: 0, lastSkipped: null };
  }
}

function markAsReviewed() {
  const data = getRatePromptData();
  data.hasReviewed = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Call this after successful presentation creation
export function incrementPresentationCount(): boolean {
  const data = getRatePromptData();
  data.presentationCount = (data.presentationCount || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return shouldShowRatePrompt();
}

// Check if we should show the rate prompt
export function shouldShowRatePrompt(): boolean {
  const data = getRatePromptData();
  
  // Never show if already reviewed
  if (data.hasReviewed) return false;
  
  // Show every 5 presentations (5, 10, 15, etc.) but max 3 times
  if (data.skippedCount >= 3) return false;
  
  const threshold = PRESENTATIONS_THRESHOLD * (1 + (data.skippedCount || 0));
  return data.presentationCount >= threshold && data.presentationCount % PRESENTATIONS_THRESHOLD === 0;
}

// Check on page load if user has existing review
export async function checkExistingReview(): Promise<boolean> {
  try {
    const res = await fetch("/api/reviews?my=true");
    const data = await res.json();
    if (data.review) {
      markAsReviewed();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
