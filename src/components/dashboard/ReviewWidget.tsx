"use client";

import { useState, useEffect } from "react";
import { Star, Send, Loader2, CheckCircle, MessageSquare, Edit3 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface ExistingReview {
  id: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewWidget() {
  const { user, isLoaded } = useUser();
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    title: "",
    content: "",
  });

  // Fetch existing review on mount
  useEffect(() => {
    if (isLoaded && user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      }));
      fetchExistingReview();
    }
  }, [isLoaded, user]);

  const fetchExistingReview = async () => {
    try {
      const res = await fetch("/api/reviews?my=true");
      const data = await res.json();
      if (data.review) {
        setExistingReview(data.review);
        setFormData({
          name: data.review.name,
          email: data.review.email,
          rating: data.review.rating,
          title: data.review.title,
          content: data.review.content,
        });
      }
    } catch (err) {
      console.error("Failed to fetch review:", err);
    } finally {
      setLoading(false);
    }
  };

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
        const data = await res.json();
        setSubmitted(true);
        setIsEditing(false);
        // Refresh to get updated review
        setTimeout(() => {
          setSubmitted(false);
          fetchExistingReview();
        }, 3000);
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

  const StarRating = ({ rating, onChange, readonly = false }: { rating: number; onChange?: (r: number) => void; readonly?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={cn("transition", !readonly && "hover:scale-110", readonly && "cursor-default")}
        >
          <Star
            size={readonly ? 20 : 28}
            className={cn(
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600 dark:text-neutral-400"
            )}
          />
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[#06b6d4]" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.feedback || "Feedback"}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{t.shareYourThoughts || "Share your thoughts with us"}</p>
        </div>
        
        <div className="text-center py-12 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200 dark:border-green-800">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 shadow-lg shadow-green-500/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {existingReview ? (t.reviewUpdated || "Review Updated!") : (t.thankYouFeedback || "Thank You for Your Feedback!")}
          </h3>
          <p className="text-sm font-medium text-slate-600 dark:text-zinc-300 max-w-md mx-auto">
            {t.reviewSubmittedMessage || `Your review has been ${existingReview ? "updated" : "submitted"} and will be visible after approval.`}
          </p>
        </div>
      </div>
    );
  }

  // Show existing review (view mode)
  if (existingReview && !isEditing) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.yourReview || "Your Review"}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
            {existingReview.isPublic ? (t.published || "Published") : (t.pendingApproval || "Pending approval")}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-zinc-900 dark:to-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StarRating rating={existingReview.rating} readonly />
              <span className="text-sm font-bold text-slate-600 dark:text-zinc-400">
                {existingReview.rating}/5
              </span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded-xl transition-all active:scale-95"
            >
              <Edit3 size={14} />
              {t.edit || "Edit"}
            </button>
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{existingReview.title}</h3>
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-300 leading-relaxed">{existingReview.content}</p>
          </div>
          
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800">
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500">
              {t.submittedOn || "Submitted on"} {new Date(existingReview.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Form (new or edit mode)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isEditing ? (t.editYourReview || "Edit Your Review") : (t.shareYourFeedback || "Share Your Feedback")}
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{t.helpUsImprove || "Help us improve PPTMaster"}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Rating */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3 dark:text-zinc-300">
            {t.howWouldYouRate || "How would you rate PPTMaster?"}
          </label>
          <StarRating
            rating={formData.rating}
            onChange={(rating) => setFormData({ ...formData, rating })}
          />
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-zinc-300">
              {t.name || "Name"}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all"
              placeholder={t.yourName || "Your name"}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-zinc-300">
              {t.email || "Email"}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              disabled
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium bg-slate-50 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-zinc-300">
            {t.reviewTitle || "Review Title"}
          </label>
          <input
            type="text"
            required
            minLength={5}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all"
            placeholder={t.summarizeExperience || "Summarize your experience"}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 dark:text-zinc-300">
            {t.yourReviewLabel || "Your Review"}
          </label>
          <textarea
            required
            minLength={20}
            rows={5}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white resize-none transition-all"
            placeholder={t.tellUsWhatYouLove || "Tell us what you love about PPTMaster and how we can improve..."}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                // Reset form to existing review data
                if (existingReview) {
                  setFormData({
                    name: existingReview.name,
                    email: existingReview.email,
                    rating: existingReview.rating,
                    title: existingReview.title,
                    content: existingReview.content,
                  });
                }
              }}
              className="flex-1 px-5 py-3 border-2 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
            >
              {t.cancel || "Cancel"}
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all shadow-sm active:scale-95",
              isEditing ? "flex-1" : "w-full"
            )}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                {isEditing ? (t.updateReview || "Update Review") : (t.submitReview || "Submit Review")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
