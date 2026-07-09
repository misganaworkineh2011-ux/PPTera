"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { getTranslations, type Language } from "~/lib/i18n";
import { Sparkles, Heart, Eye, ArrowLeft, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface InspirationItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InspirationItemPageProps {
  currentLang?: Language;
}

export default function InspirationItemPage({ currentLang = "en" }: InspirationItemPageProps) {
  const t = getTranslations(currentLang);
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<InspirationItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchItem();
    }
  }, [params.id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inspiration/${params.id}`);
      
      if (!response.ok) {
        router.push("/inspiration");
        return;
      }

      const data = await response.json();
      setItem(data.item);
      setRelatedItems(data.relatedItems || []);
      setLocalLikes(data.item.likes);
    } catch (error) {
      console.error("Failed to fetch inspiration item:", error);
      router.push("/inspiration");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (liked || !item) return;

    try {
      const response = await fetch(`/api/inspiration/${item.id}`, {
        method: "POST",
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocalLikes(data.likes);
        setLiked(true);
      }
    } catch (error) {
      console.error("Failed to like item:", error);
    }
  };

  const handleShare = async () => {
    if (!item) return;

    // Try native share first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description || `Check out this ${item.category} presentation design on PPTera`,
          url: window.location.href,
        });
        return;
      } catch (error) {
        // User cancelled or share failed, fall through to copy
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 3000);
    } catch (error) {
      console.error("Copy failed:", error);
      // Final fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 3000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }
      document.body.removeChild(textArea);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      business: "from-blue-500 to-cyan-500",
      marketing: "from-purple-500 to-pink-500",
      product: "from-orange-500 to-red-500",
      sales: "from-green-500 to-emerald-500",
      education: "from-amber-500 to-orange-500",
      design: "from-red-500 to-pink-500",
    };
    return colors[category.toLowerCase()] || "from-slate-500 to-gray-500";
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

  if (!item) {
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
            "@type": "Article",
            headline: item.title,
            description: item.description || `${item.category} presentation design inspiration`,
            image: item.imageUrl,
            datePublished: item.createdAt,
            dateModified: item.updatedAt,
            author: {
              "@type": "Person",
              name: item.authorName || "PPTera Team",
            },
            publisher: {
              "@type": "Organization",
              name: "PPTera",
              logo: {
                "@type": "ImageObject",
                url: "https://www.pptmaster.app/logo.png",
              },
            },
            keywords: [item.category, ...item.tags].join(", "),
            articleSection: item.category,
            interactionStatistic: [
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/LikeAction",
                userInteractionCount: localLikes,
              },
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/ViewAction",
                userInteractionCount: item.views,
              },
            ],
          }),
        }}
      />
      <LandingNavbar currentLang={currentLang} />

      {/* Back Button */}
      <div className="pt-32 pb-8 px-6">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => router.push("/inspiration")}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#06b6d4] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Inspiration</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <article className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white text-sm font-semibold">
                {item.category}
              </span>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              {item.title}
            </h1>

            {item.description && (
              <p className="text-xl text-slate-600 leading-relaxed mb-6">
                {item.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-slate-600">
              {item.authorName && (
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-white font-bold">
                    {item.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{item.authorName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span>{item.views} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                <span>{localLikes} likes</span>
              </div>
            </div>
          </header>

          {/* Main Image */}
          <div className="relative rounded-2xl overflow-hidden mb-8 shadow-2xl">
            <div className="aspect-[16/10] bg-slate-100">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(item.category)} flex items-center justify-center`}>
                  <Sparkles className="h-24 w-24 text-white/50" />
                </div>
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
              {liked ? "Liked" : "Like this design"}
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

          {/* Description Section */}
          {item.description && (
            <div className="prose prose-lg max-w-none mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Design</h2>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] rounded-2xl p-8 md:p-12 text-center text-white mb-16">
            <Sparkles className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to create your own?
            </h2>
            <p className="text-lg mb-6 text-white/90">
              Use PPTera AI to generate stunning presentations like this in minutes.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-4 bg-white text-[#1e3a8a] rounded-full font-bold hover:shadow-xl transition-all hover:scale-105"
            >
              Start Creating Free
            </button>
          </div>
        </div>
      </article>

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <section className="px-6 pb-24 bg-slate-50">
          <div className="mx-auto max-w-7xl pt-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              More {item.category} Inspiration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((relatedItem) => (
                <a
                  key={relatedItem.id}
                  href={`/inspiration/${relatedItem.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer block"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                    {relatedItem.imageUrl ? (
                      <img
                        src={relatedItem.imageUrl}
                        alt={relatedItem.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(relatedItem.category)} flex items-center justify-center`}>
                        <Sparkles className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-900">
                        {relatedItem.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#06b6d4] transition-colors">
                      {relatedItem.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{relatedItem.views} views</span>
                      <span>{relatedItem.likes} likes</span>
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
