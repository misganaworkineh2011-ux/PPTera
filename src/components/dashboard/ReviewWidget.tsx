"use client";

import { useState, useEffect } from "react";
import { Star, Send, Loader2, CheckCircle, MessageSquare, Edit3 } from "lucide-react";
import { cn } from "~/lib/utils";
import { useUser } from "@clerk/nextjs";

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
                : "fill-slate-200 text-slate-200 dark:fill-slate-600 dark:text-slate-600"
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
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {existingReview ? "Review Updated!" : "Thank You for Your Feedback!"}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your review has been {existingReview ? "updated" : "submitted"} and will be visible after approval.
        </p>
      </div>
    );
  }

  // Show existing review (view mode)
  if (existingReview && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-white">Your Review</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {existingReview.isPublic ? "Published" : "Pending approval"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded-lg transition"
          >
            <Edit3 size={14} />
            Edit
          </button>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 space-y-3">
          <div className="flex items-center gap-2">
            <StarRating rating={existingReview.rating} readonly />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({existingReview.rating}/5)
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{existingReview.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{existingReview.content}</p>
          <p className="text-xs text-slate-400">
            Submitted on {new Date(existingReview.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // Form (new or edit mode)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4]">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1e3a8a] dark:text-white">
            {isEditing ? "Edit Your Review" : "Share Your Feedback"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Help us improve PPTMaster</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            How would you rate PPTMaster?
          </label>
          <StarRating
            rating={formData.rating}
            onChange={(rating) => setFormData({ ...formData, rating })}
          />
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Review Title
          </label>
          <input
            type="text"
            required
            minLength={5}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent text-sm"
            placeholder="Summarize your experience"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Your Review
          </label>
          <textarea
            required
            minLength={20}
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent resize-none text-sm"
            placeholder="Tell us what you love about PPTMaster and how we can improve..."
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
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
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition",
              isEditing ? "flex-1" : "w-full"
            )}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                {isEditing ? "Update Review" : "Submit Review"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
