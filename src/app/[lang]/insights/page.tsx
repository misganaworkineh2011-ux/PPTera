import { redirect } from "next/navigation";
import { generateLanguageParams, getTranslations, isValidLanguage, type Language } from "~/lib/i18n";
import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { InsightsPageClient } from "../../insights/InsightsPageClient";
import { db } from "~/server/db";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getTranslations(lang);
  
  return {
    title: `${t.insights || "Insights"} - PPT Master | ${t.insightsHeroTitle} ${t.insightsHeroHighlight}`,
    description: t.insightsHeroDesc || "Discover tips, guides, and expert insights to help you create better presentations with AI. Learn best practices and boost productivity.",
    openGraph: {
      title: `${t.insights || "Insights"} - PPT Master`,
      description: t.insightsHeroDesc,
      type: "website",
    },
  };
}

export const revalidate = 3600;

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

export default async function InsightsLangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  
  // Middleware handles /en/ redirect, so this page only serves non-English languages
  if (!isValidLanguage(lang) || lang === "en") {
    redirect("/insights");
  }

  const t = getTranslations(lang as Language);
  
  // Fetch posts directly from database (SSR - Google will see this content)
  let posts: InsightPost[] = [];
  let featuredPost: InsightPost | null = null;
  
  try {
    const dbPosts = await db.insightPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        author: true,
        authorImage: true,
        readTime: true,
        views: true,
        likes: true,
        publishedAt: true,
        isFeatured: true,
      },
    });
    
    if (dbPosts.length > 0) {
      posts = dbPosts;
      featuredPost = dbPosts.find(p => p.isFeatured) ?? dbPosts[0] ?? null;
    }
  } catch (error) {
    console.error("Failed to fetch insights:", error);
  }

  const stats = [
    { value: "100K+", label: t.statUsers || "Users Worldwide" },
    { value: "1M+", label: t.statPresentations || "Presentations Created" },
    { value: "150+", label: t.statCountries || "Countries" },
    { value: "99%", label: t.statSatisfaction || "Satisfaction Rate" },
  ];

  return (
    <div className="landing-page min-h-screen bg-white">
      <LandingNavbar currentLang={lang as Language} />
      
      <InsightsPageClient
        initialPosts={posts}
        initialFeaturedPost={featuredPost}
        stats={stats}
        translations={{
          insights: t.insights,
          insightsHeroTitle: t.insightsHeroTitle,
          insightsHeroHighlight: t.insightsHeroHighlight,
          insightsHeroDesc: t.insightsHeroDesc,
          readMore: t.readMore,
          loadMore: t.loadMore,
        }}
      />
      
      <LandingFooter currentLang={lang as Language} />
    </div>
  );
}
