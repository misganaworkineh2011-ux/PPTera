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
} from "lucide-react";
import Link from "next/link";

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

export default function CommunityPostClient({ post }: CommunityPostClientProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {post.likes} likes
                </span>
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
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {post.comments.length} Comments
              </h2>

              {post.comments.length === 0 ? (
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
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {comment.likes}
                        </span>
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
              Share your own experiences and tips with the PPTMaster community
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
