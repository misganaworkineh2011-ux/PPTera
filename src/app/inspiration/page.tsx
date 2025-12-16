"use client";

import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { useLanguage } from "~/contexts/LanguageContext";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface InspirationItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  likes: number;
  views: number;
  authorName: string | null;
}

export default function InspirationPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hasMore, setHasMore] = useState(false);

  const categories = ["all", "business", "education", "marketing", "design", "sales", "product"];

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const fetchItems = async (offset = 0) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/inspiration?category=${selectedCategory}&limit=18&offset=${offset}`
      );
      const data = await response.json();
      
      if (offset === 0) {
        setItems(data.items || []);
      } else {
        setItems(prev => [...prev, ...(data.items || [])]);
      }
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error("Failed to fetch inspiration items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchItems(items.length);
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

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#1e1e1e0a,transparent)]"></div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-4 py-2 backdrop-blur-sm animate-fade-in">
            <Sparkles className="h-4 w-4 text-[#06b6d4]" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {t.inspiration || "Inspiration"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up [animation-delay:100ms]">
            {t.inspirationHeroTitle || "Get inspired by"}{" "}
            <span className="bg-gradient-to-r from-[#1e3a8a] via-[#06b6d4] to-[#1e3a8a] bg-clip-text text-transparent">
              {t.inspirationHeroHighlight || "amazing designs"}
            </span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
            {t.inspirationHeroDesc || "Browse through hundreds of professionally designed presentations to spark your creativity."}
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="relative px-6 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full border text-sm font-semibold transition-all animate-fade-in-up ${
                  selectedCategory === category
                    ? "border-[#06b6d4] bg-[#06b6d4] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
                style={{ animationDelay: `${300 + index * 50}ms` }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          {loading && items.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#06b6d4] border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Loading inspiration...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No inspiration items found. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                  <a
                    key={item.id}
                    href={`/inspiration/${item.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer animate-fade-in-up block"
                    style={{ animationDelay: `${400 + index * 30}ms` }}
                  >
                    {/* Image */}
                    <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(item.category)} flex items-center justify-center`}>
                          <Sparkles className="h-16 w-16 text-white/50" />
                        </div>
                      )}
                      
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                      
                      {/* Sparkle Icon */}
                      <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-900">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#06b6d4] transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{item.views} views</span>
                        <span>{item.likes} likes</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white font-bold hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Loading..." : t.loadMore || "Load More"}
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
