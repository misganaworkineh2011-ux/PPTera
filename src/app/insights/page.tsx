import { LandingNavbar } from "~/components/LandingNavbar";
import { LandingFooter } from "~/components/LandingFooter";
import { getTranslations, type Language } from "~/lib/i18n";
import { db } from "~/server/db";
import { InsightsPageClient } from "./InsightsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights & Blog",
  description: "Discover expert tips and best practices for creating stunning AI presentations with PPTMaster (PPT Master). Learn design principles and techniques.",
  keywords: "pptmaster,ppt master,ai powerpoint generator,presentation tips,powerpoint design,slide design,presentation best practices,ai presentation tool,powerpoint templates,presentation maker,design guides,presentation techniques,visual storytelling,presentation software",
  openGraph: {
    title: "Insights & Blog | PPTMaster – Presentation Tips",
    description: "Expert tips and guides for creating stunning presentations with PPTMaster AI powerpoint generator. Learn design principles, best practices, and presentation techniques.",
    url: "https://www.pptmaster.app/insights",
    type: "website",
    images: [
      {
        url: "https://www.pptmaster.app/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "PPTMaster Insights – Presentation Design Tips",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights & Blog | PPTMaster – Presentation Tips",
    description: "Expert tips and guides for creating stunning AI presentations. Learn design principles and best practices.",
    images: ["https://www.pptmaster.app/og-image.jpeg"],
  },
  alternates: {
    canonical: "https://www.pptmaster.app/insights",
  },
};

// Revalidate every hour - this ensures fresh content from DB
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

interface InsightsPageProps {
  currentLang?: Language;
}

export default async function InsightsPage({ currentLang = "en" }: InsightsPageProps) {
  const t = getTranslations(currentLang);
  
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

  // JSON-LD for SEO - includes actual posts from database
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "PPTMaster Insights",
    description: "Expert tips, guides, and insights for creating better presentations with PPTMaster (PPT Master) AI powerpoint generator",
    url: "https://www.pptmaster.app/insights",
    publisher: {
      "@type": "Organization",
      name: "PPTMaster",
      logo: {
        "@type": "ImageObject",
        url: "https://www.pptmaster.app/logo.png",
      },
    },
    blogPost: posts.slice(0, 10).map(post => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: post.coverImage || "https://www.pptmaster.app/og-image.jpeg",
      datePublished: post.publishedAt,
      author: {
        "@type": "Person",
        name: post.author,
      },
      url: `https://www.pptmaster.app/insights/${post.slug}`,
    })),
  };

  return (
    <div className="landing-page min-h-screen bg-white">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      
      <LandingNavbar currentLang={currentLang} />
      
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
      
      <LandingFooter currentLang={currentLang} />
    </div>
  );
}
