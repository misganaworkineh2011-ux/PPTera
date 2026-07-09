"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { getTranslations, type Language } from "~/lib/i18n";
import { Users, MessageSquare, Plus, ThumbsUp, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { LoadingButton } from "~/components/LoadingButton";
import { toast } from "sonner";
import Link from "next/link";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  likes: number;
  views: number;
  createdAt: Date;
  comments: Array<{
    id: string;
    content: string;
    authorName: string;
  }>;
}

interface CommunityPageClientProps {
  currentLang?: Language;
}

export default function CommunityPageClient({ currentLang = "en" }: CommunityPageClientProps) {
  const t = getTranslations(currentLang);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const LIMIT = 10;
  
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "discussion",
    authorName: "",
    authorEmail: "",
  });

  useEffect(() => {
    // Reset and fetch when category changes
    setPosts([]);
    setOffset(0);
    fetchPosts(0, true);
  }, [selectedCategory]);

  const fetchPosts = async (currentOffset: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const url = selectedCategory === "all"
        ? `/api/community/posts?limit=${LIMIT}&offset=${currentOffset}`
        : `/api/community/posts?category=${selectedCategory}&limit=${LIMIT}&offset=${currentOffset}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (isInitial) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchPosts(newOffset, false);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      toast.success(data.message || t.postSubmittedReview || "Post submitted for review!", {
        duration: 5000,
        position: "top-center",
      });
      setNewPost({
        title: "",
        content: "",
        category: "discussion",
        authorName: "",
        authorEmail: "",
      });
      setShowCreateForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.failedCreatePost || "Failed to create post", {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const guidelines = [
    {
      title: t.guidelineRespectTitle || "Be Respectful",
      description: t.guidelineRespectDesc || "Treat all community members with kindness and respect. No harassment, hate speech, or discrimination of any kind."
    },
    {
      title: t.guidelineQualityTitle || "Share Quality Content",
      description: t.guidelineQualityDesc || "Post presentations and content that add value to the community. Avoid spam and self-promotion."
    },
    {
      title: t.guidelineCreditTitle || "Give Credit",
      description: t.guidelineCreditDesc || "Always credit original creators when sharing work. Respect intellectual property rights."
    },
    {
      title: t.guidelineHelpTitle || "Help Others",
      description: t.guidelineHelpDesc || "Share your knowledge and help fellow members. Answer questions and provide constructive feedback."
    },
    {
      title: t.guidelineTopicTitle || "Stay On Topic",
      description: t.guidelineTopicDesc || "Keep discussions relevant to presentations, design, and PPTera features."
    },
    {
      title: t.guidelineReportTitle || "Report Issues",
      description: t.guidelineReportDesc || "If you see inappropriate content or behavior, report it to moderators immediately."
    }
  ];

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={currentLang} />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Users className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.community}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            {t.communityHeroTitle || "Join the"} <span className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] bg-clip-text text-transparent">PPTera</span> {t.community}
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            {t.communityHeroDesc || "Connect with creators, share your work, learn from experts, and be part of the presentation revolution."}
          </p>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto mt-4 leading-relaxed animate-fade-in-up [animation-delay:250ms]">
            {t.communityExtendedDesc || "Our community brings together designers, marketers, educators, and business professionals who share a passion for creating impactful presentations. Exchange ideas, get feedback, and grow together."}
          </p>
        </div>
      </section>

      {/* Forum Section */}
      <section className="relative px-6 pb-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-slate-900">{t.communityForums || "Community Forums"}</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-1 px-3 py-2 md:px-6 md:py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white text-xs md:text-base font-bold hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 md:h-5 md:w-5" />
              <span className="hidden sm:inline">{t.createPost || "Create Post"}</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>

          {/* Create Post Form */}
          {showCreateForm && (
            <div className="mb-12 rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">{t.createNewPost || "Create New Post"}</h3>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">{t.yourName || "Your Name"} *</label>
                    <input
                      type="text"
                      required
                      value={newPost.authorName}
                      onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">{t.emailOptional || "Email (optional)"}</label>
                    <input
                      type="email"
                      value={newPost.authorEmail}
                      onChange={(e) => setNewPost({ ...newPost, authorEmail: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">{t.category || "Category"} *</label>
                  <select
                    required
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none"
                  >
                    <option value="show-tell">{t.showTell || "Show & Tell"}</option>
                    <option value="discussion">{t.generalDiscussion || "General Discussion"}</option>
                    <option value="tips">{t.tipsTricks || "Tips & Tricks"}</option>
                    <option value="feature-request">{t.featureRequests || "Feature Requests"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">{t.title || "Title"} *</label>
                  <input
                    type="text"
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none"
                    placeholder={t.postAbout || "What's your post about?"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">{t.content || "Content"} *</label>
                  <textarea
                    required
                    rows={6}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#06b6d4] focus:outline-none resize-none"
                    placeholder={t.shareThoughts || "Share your thoughts..."}
                  />
                </div>
                <div className="flex gap-3">
                  <LoadingButton
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText={t.submitting || "Submitting..."}
                    variant="primary"
                  >
                    {t.submitPost || "Submit Post"}
                  </LoadingButton>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                  >
                    {t.cancel || "Cancel"}
                  </button>
                </div>
                <p className="text-sm text-slate-500">{t.postsRequireApproval || "* Posts require admin approval before appearing publicly"}</p>
              </form>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {["all", "show-tell", "discussion", "tips", "feature-request"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full border text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? "border-[#06b6d4] bg-[#06b6d4] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {cat === "all" ? t.all || "All" : 
                 cat === "show-tell" ? t.showTell || "Show & Tell" :
                 cat === "discussion" ? t.generalDiscussion || "General Discussion" :
                 cat === "tips" ? t.tipsTricks || "Tips & Tricks" :
                 t.featureRequests || "Feature Requests"}
              </button>
            ))}
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#06b6d4] border-r-transparent"></div>
              <p className="mt-4 text-slate-600">{t.loadingPosts || "Loading posts..."}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">{t.noPostsYet || "No posts yet. Be the first to create one!"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-[#06b6d4]/10 text-[#06b6d4] text-xs font-semibold">
                          {post.category}
                        </span>
                        <span className="text-sm text-slate-500">
                          {t.by || "by"} {post.authorName}
                        </span>
                        <span className="text-sm text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 hover:text-[#06b6d4] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {post.likes} {t.likes || "likes"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views} {t.views || "views"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments.length} {t.comments || "comments"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {!loading && hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 rounded-full border-2 border-[#06b6d4] text-[#06b6d4] font-semibold hover:bg-[#06b6d4] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                    {t.loading || "Loading..."}
                  </span>
                ) : (
                  t.loadMore || "Load More"
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">{t.communityGuidelines || "Community Guidelines"}</h2>
          <p className="text-xl text-slate-600 mb-12 text-center">
            {t.communityGuidelinesDesc || "Help us maintain a positive and productive community for everyone"}
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {guidelines.map((guideline, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-2">{guideline.title}</h3>
                <p className="text-slate-600 leading-relaxed">{guideline.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter currentLang={currentLang} />
    </div>
  );
}
