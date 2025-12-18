"use client";

import { useState, useEffect } from "react";
import { Star, Quote, Loader2, Send, CheckCircle } from "lucide-react";
import { cn } from "~/lib/utils";

interface Review {
  id: string;
  name: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  isFeatured: boolean;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews?featured=true&limit=6");
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || { averageRating: 0, totalReviews: 0 });
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", rating: 5, title: "", content: "" });
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, interactive = false, onChange }: { 
    rating: number; 
    interactive?: boolean;
    onChange?: (rating: number) => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onChange?.(star)}
          className={cn(
            "transition",
            interactive && "cursor-pointer hover:scale-110"
          )}
          disabled={!interactive}
        >
          <Star
            size={interactive ? 24 : 16}
            className={cn(
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-slate-200 text-slate-200"
            )}
          />
        </button>
      ))}
    </div>
  );

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Loved by Thousands of Users
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See what our users are saying about PPTMaster
          </p>
          
          {/* Stats */}
          {stats.totalReviews > 0 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(stats.averageRating)} />
                <span className="text-2xl font-bold text-slate-900">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">
                {stats.totalReviews} reviews
              </span>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={cn(
                  "bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition",
                  review.isFeatured && "ring-2 ring-[#06b6d4]/20"
                )}
              >
                <Quote className="h-8 w-8 text-[#06b6d4]/20 mb-4" />
                <StarRating rating={review.rating} />
                <h3 className="font-semibold text-slate-900 mt-3 mb-2">
                  {review.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-4 mb-4">
                  {review.content}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="font-medium text-slate-900">{review.name}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-12">
            Be the first to leave a review!
          </p>
        )}

        {/* Write Review Button / Form */}
        <div className="text-center">
          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              <Star className="h-5 w-5" />
              Write a Review
            </button>
          )}

          {submitted && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl">
              <CheckCircle className="h-5 w-5" />
              Thank you! Your review will be visible after approval.
            </div>
          )}

          {showForm && !submitted && (
            <form
              onSubmit={handleSubmit}
              className="max-w-lg mx-auto bg-white rounded-2xl p-6 shadow-lg border border-slate-100 text-left"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Share Your Experience
              </h3>

              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Rating
                </label>
                <StarRating
                  rating={formData.rating}
                  interactive
                  onChange={(rating) => setFormData({ ...formData, rating })}
                />
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Review Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
                  placeholder="Summarize your experience"
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent resize-none"
                  placeholder="Tell us about your experience with PPTMaster..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
