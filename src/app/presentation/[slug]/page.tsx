import { notFound } from "next/navigation";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import PresentationViewer from "./PresentationViewer";
import type { SlideData } from "~/components/presentation/types";
import { isCustomThemeId, getCustomThemeDbId } from "~/lib/custom-theme-utils";

interface PresentationPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    mode?: string;
  }>;
}

// Extract presentation ID from slug (format: "title-slug-{id}")
function extractPresentationId(slug: string): string | null {
  // The ID is the last part after the last hyphen
  // But cuid IDs can contain hyphens, so we need to be smart about this
  // CUIDs are typically 25 characters long
  const parts = slug.split("-");
  
  // Try to find a cuid-like string (starts with 'c' and is alphanumeric)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part && part.length >= 20 && /^c[a-z0-9]+$/i.test(part)) {
      return part;
    }
  }
  
  // Fallback: check if the whole last segment could be an ID
  const lastPart = parts[parts.length - 1];
  if (lastPart && lastPart.length >= 20) {
    return lastPart;
  }
  
  return null;
}

export const revalidate = 0; // Disable caching to always get fresh data

export default async function PresentationPage({
  params,
  searchParams,
}: PresentationPageProps) {
  const { slug } = await params;
  const { mode } = await searchParams;
  
  // requireAuth() returns the database user directly
  const user = await requireAuth();

  // Extract ID from slug
  const presentationId = extractPresentationId(slug);
  
  console.log("[presentation] Extracting ID from slug:", { slug, presentationId });
  
  if (!presentationId) {
    console.error("[presentation] Could not extract ID from slug:", slug);
    notFound();
  }

  // Get the presentation
  const presentation = await db.presentation.findUnique({
    where: { id: presentationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  console.log("[presentation] Found presentation:", {
    id: presentation?.id,
    title: presentation?.title,
    userId: presentation?.userId,
    currentUserId: user.id,
    slidesType: typeof presentation?.slides,
    slidesIsArray: Array.isArray(presentation?.slides),
    slidesLength: Array.isArray(presentation?.slides) ? (presentation.slides as unknown[]).length : "N/A",
  });

  if (!presentation) {
    console.error("[presentation] Presentation not found for ID:", presentationId);
    notFound();
  }

  const isOwner = presentation.userId === user.id;
  
  // Check for collaborator access
  const collaboration = await db.collaboration.findFirst({
    where: {
      presentationId: presentation.id,
      userId: user.id,
    },
  });

  console.log("[presentation] Access check:", { isOwner, hasCollaboration: !!collaboration });

  if (!isOwner && !collaboration) {
    console.error("[presentation] User doesn't have access:", { 
      presentationUserId: presentation.userId, 
      currentUserId: user.id 
    });
    notFound();
  }

  // Parse the presentation data - handle both string and object JSON
  // SlideData includes all fields: chart, icons, transformedContent, images, etc.
  let slides: SlideData[] = [];

  try {
    const rawSlides = presentation.slides;
    if (typeof rawSlides === "string") {
      slides = JSON.parse(rawSlides) as SlideData[];
    } else if (Array.isArray(rawSlides)) {
      slides = rawSlides as unknown as SlideData[];
    }
  } catch (e) {
    console.error("Error parsing slides:", e);
  }

  let content: {
    theme?: string;
    themeConfig?: Record<string, unknown>;
    imageSource?: string;
    metadata?: Record<string, unknown>;
  } = {};

  try {
    const rawContent = presentation.content;
    if (typeof rawContent === "string") {
      content = JSON.parse(rawContent);
    } else if (rawContent && typeof rawContent === "object") {
      content = rawContent as typeof content;
    }
  } catch (e) {
    console.error("Error parsing content:", e);
  }

  console.log("[presentation] Final parsed data:", {
    slidesCount: slides.length,
    slideTitles: slides.map(s => s.title),
    theme: content.theme,
    // Debug: check if enhanced data is present
    slidesWithCharts: slides.filter(s => s.chart).length,
    slidesWithIcons: slides.filter(s => s.icons?.length).length,
    slidesWithTransformedContent: slides.filter(s => s.transformedContent).length,
  });

  // OPTIMIZATION: Prefetch custom theme during SSR to avoid client-side fetch
  let prefetchedCustomTheme = null;
  const themeId = content.theme || "";
  if (isCustomThemeId(themeId)) {
    const dbId = getCustomThemeDbId(themeId);
    try {
      const customTheme = await db.theme.findUnique({
        where: { id: dbId },
        select: {
          id: true,
          name: true,
          colors: true,
          fonts: true,
          designElements: true,
        },
      });
      if (customTheme) {
        prefetchedCustomTheme = customTheme;
      }
    } catch (e) {
      console.error("Error prefetching custom theme:", e);
    }
  }

  return (
    <PresentationViewer
      presentation={{
        id: presentation.id,
        title: presentation.title,
        description: presentation.description,
        slides: slides,
        content: content,
        createdAt: presentation.createdAt,
        updatedAt: presentation.updatedAt,
        isPublic: presentation.isPublic,
        shareToken: presentation.shareToken,
      }}
      mode={mode || "view"}
      isOwner={isOwner}
      collaboratorRole={collaboration?.role}
      prefetchedCustomTheme={prefetchedCustomTheme}
    />
  );
}

