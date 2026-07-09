"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { getTranslations, type Language } from "~/lib/i18n";
import { BookOpen, Heart, Eye, ArrowLeft, Share2, Clock, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InsightPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  authorImage: string | null;
  readTime: number;
  views: number;
  likes: number;
  publishedAt: Date | null;
  createdAt: string;
  updatedAt: string;
}

interface InsightPostPageProps {
  currentLang?: Language;
}

export default function InsightPostPage({ currentLang = "en" }: InsightPostPageProps) {
  const t = getTranslations(currentLang);
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<InsightPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<InsightPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`/api/insights/${params.slug}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        router.push("/insights");
        return;
      }

      const data = await response.json();
      setPost(data.post);
      setRelatedPosts(data.relatedPosts || []);
      setLocalLikes(data.post.likes);
    } catch (error) {
      console.error("Failed to fetch post:", error);
      router.push("/insights");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liked || !post) return;

    try {
      const response = await fetch(`/api/insights/${post.slug}`, {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocalLikes(data.likes);
        setLiked(true);
      }
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleShare = async () => {
    if (!post) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
        return;
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 3000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="landing-page min-h-screen bg-white">
        <LandingNavbar currentLang={currentLang} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#06b6d4] border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
        <LandingFooter currentLang={currentLang} />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="landing-page min-h-screen bg-white">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage,
            datePublished: post.publishedAt || post.createdAt,
            dateModified: post.updatedAt,
            author: {
              "@type": "Person",
              name: post.author,
              image: post.authorImage,
            },
            publisher: {
              "@type": "Organization",
              name: "PPTera",
              logo: {
                "@type": "ImageObject",
                url: "https://www.pptmaster.app/logo.png",
              },
            },
            keywords: post.tags.join(", "),
            articleSection: post.category,
            wordCount: post.content.split(" ").length,
            timeRequired: `PT${post.readTime}M`,
            interactionStatistic: [
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/LikeAction",
                userInteractionCount: localLikes,
              },
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/ViewAction",
                userInteractionCount: post.views,
              },
            ],
          }),
        }}
      />
      <LandingNavbar currentLang={currentLang} />

      {/* Back Button */}
      <div className="pt-32 pb-8 px-6">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => router.push("/insights")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#06b6d4] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Insights</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <article className="px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <header className="mb-12">
            {/* Category Badge */}
            <div className="mb-6">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white text-sm font-semibold">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              {post.excerpt}
            </p>

            {/* Author & Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-slate-600 pb-8 border-b border-slate-200">
              <div className="flex items-center gap-3">
                {post.authorImage ? (
                  <img
                    src={post.authorImage}
                    alt={post.author}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-white font-bold">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900">{post.author}</div>
                  <div className="text-sm text-slate-500">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                  {localLikes} likes
                </span>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          <div className="relative rounded-2xl overflow-hidden mb-12 shadow-2xl">
            <div className="aspect-[16/9] bg-slate-100">
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                liked
                  ? "bg-red-100 text-red-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white hover:shadow-xl hover:scale-105"
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              {liked ? "Liked" : "Like this article"}
            </button>
            <div className="relative">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-slate-200 bg-white text-slate-700 font-semibold hover:border-[#06b6d4] hover:text-[#06b6d4] transition-all"
              >
                <Share2 className="h-5 w-5" />
                {showCopied ? "Link Copied!" : "Share"}
              </button>
              {showCopied && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg whitespace-nowrap animate-fade-in">
                  Link copied to clipboard!
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              )}
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-xl max-w-none mb-16">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-4xl font-bold text-slate-900 mt-12 mb-6 leading-tight" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-3xl font-bold text-slate-900 mt-16 mb-6 leading-snug" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-2xl font-semibold text-slate-800 mt-10 mb-4 leading-snug" {...props} />,
                p: ({node, ...props}) => <p className="text-lg text-slate-700 leading-relaxed mb-6 font-normal" {...props} />,
                ul: ({node, ...props}) => <ul className="my-8 space-y-3 text-lg text-slate-700" {...props} />,
                ol: ({node, ...props}) => <ol className="my-8 space-y-3 text-lg text-slate-700 list-decimal list-inside" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed pl-2" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                em: ({node, ...props}) => <em className="italic text-slate-800" {...props} />,
                a: ({node, ...props}) => <a className="text-[#06b6d4] hover:text-[#0891b2] underline decoration-2 underline-offset-2 transition-colors" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#06b6d4] pl-6 py-2 my-8 italic text-slate-600 bg-slate-50 rounded-r-lg" {...props} />,
                code: ({node, inline, ...props}: any) => 
                  inline ? 
                    <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono" {...props} /> :
                    <code className="block bg-slate-900 text-slate-100 p-4 rounded-lg my-6 overflow-x-auto text-sm font-mono" {...props} />,
                hr: ({node, ...props}) => <hr className="my-12 border-slate-200" {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12 pb-12 border-b border-slate-200">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Bio */}
          <div className="rounded-2xl bg-slate-50 p-8 mb-16">
            <div className="flex items-start gap-4">
              {post.authorImage ? (
                <img
                  src={post.authorImage}
                  alt={post.author}
                  className="h-16 w-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {post.author.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Written by {post.author}
                </h3>
                <p className="text-slate-600">
                  Expert in presentation design and AI-powered content creation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="px-6 pb-24 bg-slate-50">
          <div className="mx-auto max-w-7xl pt-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <a
                  key={relatedPost.id}
                  href={`/insights/${relatedPost.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300 block"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                    {relatedPost.coverImage && (
                      <img
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-900">
                        {relatedPost.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#06b6d4] transition-colors">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {relatedPost.readTime} min
                      </span>
                      <span>•</span>
                      <span>{relatedPost.views} views</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <LandingFooter currentLang={currentLang} />
    </div>
  );
}
