"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import {
  ArrowLeft,
  ThumbsUp,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  likes: number;
  createdAt: Date;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  likes: number;
  views: number;
  isPinned: boolean;
  createdAt: Date;
  comments: Comment[];
}

interface CommunityPostClientProps {
  post: Post;
}

const categoryLabels: Record<string, string> = {
  "show-tell": "Show & Tell",
  discussion: "Discussion",
  tips: "Tips & Tricks",
  "feature-request": "Feature Request",
};

const categoryColors: Record<string, string> = {
  "show-tell": "bg-purple-100 text-purple-700",
  discussion: "bg-blue-100 text-blue-700",
  tips: "bg-green-100 text-green-700",
  "feature-request": "bg-orange-100 text-orange-700",
};

export default function CommunityPostClient({
  post,
}: CommunityPostClientProps) {
  const [commentForm, setCommentForm] = useState({
    authorName: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  // Like state
  const [postLikes, setPostLikes] = useState(post.likes);
  const [hasLikedPost, setHasLikedPost] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, number>>({});
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  // Initialize likes from localStorage
  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    setHasLikedPost(likedPosts.includes(post.id));
    
    const likedCommentsStorage = JSON.parse(localStorage.getItem("likedComments") || "[]");
    setLikedComments(new Set(likedCommentsStorage));
    
    // Initialize comment likes from post data
    const initialCommentLikes: Record<string, number> = {};
    post.comments.forEach((c) => {
      initialCommentLikes[c.id] = c.likes;
    });
    setCommentLikes(initialCommentLikes);
  }, [post.id, post.comments]);

  const handleLikePost = async () => {
    if (hasLikedPost) {
      toast.info("You've already liked this post");
      return;
    }

    // Optimistic update
    setPostLikes((prev) => prev + 1);
    setHasLikedPost(true);

    try {
      const response = await fetch(`/api/community/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });

      if (!response.ok) throw new Error("Failed to like post");

      // Save to localStorage
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
      localStorage.setItem("likedPosts", JSON.stringify([...likedPosts, post.id]));
    } catch {
      // Revert on error
      setPostLikes((prev) => prev - 1);
      setHasLikedPost(false);
      toast.error("Failed to like post");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (likedComments.has(commentId)) {
      toast.info("You've already liked this comment");
      return;
    }

    // Optimistic update
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 0) + 1,
    }));
    setLikedComments((prev) => new Set([...prev, commentId]));

    try {
      const response = await fetch(
        `/api/community/posts/${post.id}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "like" }),
        }
      );

      if (!response.ok) throw new Error("Failed to like comment");

      // Save to localStorage
      const likedCommentsStorage = JSON.parse(
        localStorage.getItem("likedComments") || "[]"
      );
      localStorage.setItem(
        "likedComments",
        JSON.stringify([...likedCommentsStorage, commentId])
      );
    } catch {
      // Revert on error
      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) - 1,
      }));
      setLikedComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      toast.error("Failed to like comment");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.authorName.trim() || !commentForm.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit comment");
      }

      toast.success("Comment submitted for review!", {
        duration: 5000,
      });
      setCommentForm({ authorName: "", content: "" });
      setShowCommentForm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang="en" />

      <main className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Community
          </Link>

          {/* Post header */}
          <article>
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[post.category] || "bg-slate-100 text-slate-700"}`}
                >
                  {categoryLabels[post.category] || post.category}
                </span>
                {post.isPinned && (
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                    📌 Pinned
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.createdAt)}
                </span>
                <button
                  onClick={handleLikePost}
                  className={`flex items-center gap-1 transition-colors ${
                    hasLikedPost
                      ? "text-[#06b6d4] cursor-default"
                      : "hover:text-[#06b6d4] cursor-pointer"
                  }`}
                  title={hasLikedPost ? "You liked this" : "Like this post"}
                >
                  <ThumbsUp
                    className={`h-4 w-4 ${hasLikedPost ? "fill-current" : ""}`}
                  />
                  {postLikes} likes
                </button>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views} views
                </span>
              </div>
            </header>

            {/* Post content */}
            <div className="prose prose-slate max-w-none mb-12">
              {post.content.split("\n").map((paragraph, index) => (
                <p key={index} className="text-slate-700 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Comments section */}
            <section className="border-t border-slate-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {post.comments.length} Comments
                </h2>
                <button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#06b6d4] text-white text-sm font-semibold hover:bg-[#0891b2] transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Add Comment
                </button>
              </div>

              {/* Comment Form */}
              {showCommentForm && (
                <form
                  onSubmit={handleSubmitComment}
                  className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Leave a comment
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={commentForm.authorName}
                        onChange={(e) =>
                          setCommentForm({
                            ...commentForm,
                            authorName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4]"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Comment *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={commentForm.content}
                        onChange={(e) =>
                          setCommentForm({
                            ...commentForm,
                            content: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-[#06b6d4] focus:outline-none focus:ring-1 focus:ring-[#06b6d4] resize-none"
                        placeholder="Share your thoughts..."
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Comment
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCommentForm(false)}
                        className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      * Comments require approval before appearing publicly
                    </p>
                  </div>
                </form>
              )}

              {post.comments.length === 0 && !showCommentForm ? (
                <p className="text-slate-500 text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">
                          {comment.authorName}
                        </span>
                        <span className="text-sm text-slate-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-700">{comment.content}</p>
                      <div className="mt-2 text-sm text-slate-500">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            likedComments.has(comment.id)
                              ? "text-[#06b6d4] cursor-default"
                              : "hover:text-[#06b6d4] cursor-pointer"
                          }`}
                          title={
                            likedComments.has(comment.id)
                              ? "You liked this"
                              : "Like this comment"
                          }
                        >
                          <ThumbsUp
                            className={`h-3 w-3 ${likedComments.has(comment.id) ? "fill-current" : ""}`}
                          />
                          {commentLikes[comment.id] ?? comment.likes}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </article>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 p-8 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Join the conversation
            </h3>
            <p className="text-slate-600 mb-4">
              Share your own experiences and tips with the PPTera community
            </p>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-bold hover:shadow-xl transition-all hover:scale-105"
            >
              Go to Community
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter currentLang="en" />
    </div>
  );
}
