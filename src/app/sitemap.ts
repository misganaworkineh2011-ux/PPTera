import type { MetadataRoute } from "next";
import { db } from "~/server/db";
import { SUPPORTED_LANGUAGES } from "~/lib/i18n";
import {
  TOOLS,
  INDUSTRIES,
  USE_CASES,
  TEMPLATE_TOPICS,
  HOW_TO_GUIDES,
  ALTERNATIVES,
  getAllComboSlugs
} from "~/lib/seo/page-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.pptmaster.app";

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

  // Dynamic pages without language versions (redirects to /en/ versions)
  const staticPages: MetadataRoute.Sitemap = [];

  // ============================================
  // PROGRAMMATIC SEO PAGES
  // ============================================

  // Tool pages (~20 pages)
  const toolPages: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Industry pages (~30 pages)
  const industryPages: MetadataRoute.Sitemap = INDUSTRIES.map((industry) => ({
    url: `${baseUrl}/industries/${industry.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Use case pages (~25 pages)
  const useCasePages: MetadataRoute.Sitemap = USE_CASES.map((useCase) => ({
    url: `${baseUrl}/create/${useCase.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Template topic pages (~30 pages)
  const templatePages: MetadataRoute.Sitemap = TEMPLATE_TOPICS.map((template) => ({
    url: `${baseUrl}/templates/${template.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // How-to guide pages (~15 pages)
  const howToPages: MetadataRoute.Sitemap = HOW_TO_GUIDES.map((guide) => ({
    url: `${baseUrl}/how-to/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Alternative/competitor pages (~10 pages)
  const alternativePages: MetadataRoute.Sitemap = ALTERNATIVES.map((alt) => ({
    url: `${baseUrl}/alternatives/${alt.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Combo pages (industry × use case = ~750 pages)
  const comboSlugs = getAllComboSlugs();
  const comboPages: MetadataRoute.Sitemap = comboSlugs.map((slug) => ({
    url: `${baseUrl}/for/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // ============================================
  // DYNAMIC DATABASE CONTENT
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
    ...staticPages,
    // pSEO pages
    ...toolPages,
    ...industryPages,
    ...useCasePages,
    ...templatePages,
    ...howToPages,
    ...alternativePages,
    ...comboPages,
    // Dynamic content
    ...inspirationPages,
    ...insightPages,
    ...communityPages,
  ];
}
