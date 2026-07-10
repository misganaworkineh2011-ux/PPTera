import type { MetadataRoute } from "next";
import { db } from "~/server/db";
import { SUPPORTED_LANGUAGES } from "~/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Follow the configured deployment domain (same source as metadataBase and
  // robots.ts) so the sitemap always lists URLs on the serving domain.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app";

  // Pages that should have language versions
  const i18nPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/help", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/prompt-guide", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/cookies", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/careers", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/community", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/education", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/inspiration", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/insights", priority: 0.7, changeFrequency: "daily" as const },
  ];

  // Generate URLs for all languages
  // For English (en), use root path without /en/ prefix
  const i18nUrls: MetadataRoute.Sitemap = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const page of i18nPages) {
      // English uses root path, other languages use /[lang]/ prefix
      const langPrefix = lang === "en" ? "" : `/${lang}`;
      i18nUrls.push({
        url: `${baseUrl}${langPrefix}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  // ============================================
  // DYNAMIC DATABASE CONTENT (natural SEO)
  // ============================================

  // Fetch inspiration items for dynamic URLs
  let inspirationPages: MetadataRoute.Sitemap = [];
  try {
    const inspirationItems = await db.inspirationGallery.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    inspirationPages = inspirationItems.map((item) => ({
      url: `${baseUrl}/inspiration/${item.id}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching inspiration items for sitemap:", error);
  }

  // Fetch insight posts for dynamic URLs
  let insightPages: MetadataRoute.Sitemap = [];
  try {
    const insightPosts = await db.insightPost.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    insightPages = insightPosts.map((post) => ({
      url: `${baseUrl}/insights/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching insight posts for sitemap:", error);
  }

  // Fetch community posts for dynamic URLs
  let communityPages: MetadataRoute.Sitemap = [];
  try {
    const communityPosts = await db.communityPost.findMany({
      where: { isApproved: true },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    communityPages = communityPosts.map((post) => ({
      url: `${baseUrl}/community/${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error("Error fetching community posts for sitemap:", error);
  }

  return [
    ...i18nUrls,
    ...inspirationPages,
    ...insightPages,
    ...communityPages,
  ];
}
