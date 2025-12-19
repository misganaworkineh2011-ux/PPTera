"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { BookOpen, TrendingUp, Users, Zap, Clock, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

interface InsightPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: string;
  authorImage: string | null;
  readTime: number;
  views: number;
  likes: number;
  publishedAt: Date | null;
  isFeatured: boolean;
}

export default function InsightsPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<InsightPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<InsightPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hasMore, setHasMore] = useState(false);

  const categories = ["all", "ai-technology", "design", "best-practices"];

  useEffect(() => {
    fetchPosts();
    fetchFeaturedPost();
  }, [selectedCategory]);

  const fetchFeaturedPost = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch("/api/insights?featured=true&limit=1", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      if (data.posts && data.posts.length > 0) {
        setFeaturedPost(data.posts[0]);
      }
    } catch (error) {
      console.error("Failed to fetch featured post:", error);
      // Don't block the page if featured post fails
    }
  };

  const fetchPosts = async (offset = 0) => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `/api/insights?category=${selectedCategory}&limit=9&offset=${offset}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Failed to fetch posts");
      
      const data = await response.json();
      
      if (offset === 0) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      // Set empty array on error to show "no posts" message
      if (offset === 0) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchPosts(posts.length);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "ai-technology": "from-blue-500 to-cyan-500",
      design: "from-purple-500 to-pink-500",
      "best-practices": "from-green-500 to-emerald-500",
    };
    return colors[category] || "from-slate-500 to-gray-500";
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, typeof Zap> = {
      "ai-technology": Zap,
      design: BookOpen,
      "best-practices": TrendingUp,
    };
    return icons[category] || BookOpen;
  };

  const stats = [
    { value: "100K+", label: t.statUsers || "Active Users" },
    { value: "1M+", label: t.statPresentations || "Presentations Created" },
    { value: "150+", label: t.statCountries || "Countries" },
    { value: "99%", label: t.statSatisfaction || "Satisfaction Rate" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "PPT Master Insights",
            description: "Expert tips, guides, and insights for creating better presentations with AI powerpoint generator tools",
            url: "https://www.pptmaster.app/insights",
            publisher: {
              "@type": "Organization",
              name: "PPT Master",
              logo: {
                "@type": "ImageObject",
                url: "https://www.pptmaster.app/logo.png",
              },
            },
            blogPost: posts.slice(0, 10).map(post => ({
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image: post.coverImage,
              datePublished: post.publishedAt,
              author: {
                "@type": "Person",
                name: post.author,
              },
              url: `https://www.pptmaster.app/insights/${post.slug}`,
            })),
          }),
        }}
      />
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <BookOpen className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.insights || "Insights"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            {t.insightsHeroTitle || "Learn from the"}{" "}
            <span className="bg-gradient-to-r from-[#1e3a8a] via-[#06b6d4] to-[#1e3a8a] bg-clip-text text-transparent">
              {t.insightsHeroHighlight || "experts"}
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            {t.insightsHeroDesc || "Tips, guides, and insights to help you create better presentations."}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="relative px-6 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300 animate-fade-in-up [animation-delay:700ms]">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="h-64 md:h-full relative bg-slate-100">
                  {featuredPost.coverImage ? (
                    <img
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(featuredPost.category)}`}></div>
                  )}
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-sm font-semibold text-slate-900">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-sm font-semibold text-[#06b6d4] mb-3">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span>{featuredPost.author}</span>
                    <span>•</span>
                    <span>{featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString() : ""}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime} min read
                    </span>
                  </div>
                  <a 
                    href={`/insights/${featuredPost.slug}`}
                    className="inline-flex items-center gap-2 text-[#06b6d4] font-semibold hover:gap-3 transition-all"
                  >
                    {t.readMore?.replace(' →', '') || "Read More"}
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="relative px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full border text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? "border-[#06b6d4] bg-[#06b6d4] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          {loading && posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#06b6d4] border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Loading articles...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No articles found. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => {
                  const Icon = getCategoryIcon(post.category);
                  return (
                    <a
                      key={post.id}
                      href={`/insights/${post.slug}`}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300 animate-fade-in-up block"
                      style={{ animationDelay: `${900 + index * 100}ms` }}
                    >
                      {/* Icon Header */}
                      <div className="h-48 relative overflow-hidden bg-slate-100">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(post.category)}`}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Icon className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-900">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#06b6d4] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-slate-600 mb-4 leading-relaxed text-sm line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {post.readTime} min read
                          </span>
                          <button className="text-[#06b6d4] font-semibold text-sm hover:gap-2 inline-flex items-center gap-1 transition-all">
                            Read
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-bold hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Loading..." : t.loadMore || "Load More Articles"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
