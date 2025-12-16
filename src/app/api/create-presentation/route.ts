import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { fetchImagesForSlides } from "~/lib/pexels";
import { getThemeById } from "~/lib/themes";

interface SlideInput {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
}

interface CreatePresentationRequest {
  outlineId: string;
  slides: SlideInput[];
  theme: string;
  imageSource: string;
  metadata: {
    topic: string;
    totalSlides: number;
    tone: string;
    language: string;
  };
}

interface PresentationSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  image?: {
    url: string;
    alt: string;
    photographer?: string;
    photographerUrl?: string;
    source: "pexels" | "ai" | "upload" | "placeholder" | "none";
  } | null;
  layout?: string;
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string, maxLength: number = 50): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
    .substring(0, maxLength)
    .replace(/-$/, ""); // Remove trailing hyphen
}

export async function POST(request: Request) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request
    const body: CreatePresentationRequest = await request.json();
    const { outlineId, slides, theme, imageSource, metadata } = body;

    console.log("[create-presentation] Received request:", {
      outlineId,
      slidesCount: slides?.length || 0,
      theme,
      imageSource,
      metadata,
    });

    if (!slides || slides.length === 0) {
      console.error("[create-presentation] No slides provided in request");
      return NextResponse.json(
        { error: "No slides provided" },
        { status: 400 }
      );
    }

    // Get theme configuration
    const themeConfig = getThemeById(theme);

    // Prepare slides with images if needed
    let presentationSlides: PresentationSlide[] = slides.map((slide) => ({
      ...slide,
      image: null,
      layout: slide.type === "title" ? "title-centered" : "content-with-bullets",
    }));

    // Fetch images based on image source
    if (imageSource === "stock-photos") {
      const imageMap = await fetchImagesForSlides(slides);

      presentationSlides = presentationSlides.map((slide, index) => {
        const photo = imageMap.get(index);
        if (photo) {
          return {
            ...slide,
            image: {
              url: photo.src.large, // Use large size for presentations
              alt: photo.alt || slide.title,
              photographer: photo.photographer,
              photographerUrl: photo.photographer_url,
              source: "pexels" as const,
            },
          };
        }
        return slide;
      });
    } else if (imageSource === "placeholders") {
      // Add placeholder markers
      presentationSlides = presentationSlides.map((slide) => ({
        ...slide,
        image: {
          url: "",
          alt: "Image placeholder",
          source: "placeholder" as const,
        },
      }));
    }
    // For "no-images", "ai-generated", "illustrations", "web-images" - handle later or leave null

    // Generate title from first slide or topic
    const presentationTitle =
      slides[0]?.type === "title" && slides[0]?.title
        ? slides[0].title
        : metadata.topic || "Untitled Presentation";

    // Create slug
    const slug = generateSlug(presentationTitle);

    console.log("[create-presentation] Prepared slides:", {
      count: presentationSlides.length,
      slideTitles: presentationSlides.map(s => s.title),
      imagesAdded: presentationSlides.filter(s => s.image?.url).length,
    });

    // Create the presentation in the database
    const presentation = await db.presentation.create({
      data: {
        title: presentationTitle,
        description: metadata.topic,
        content: {
          theme: theme,
          themeConfig: themeConfig || null,
          imageSource: imageSource,
          metadata: metadata,
          createdFrom: "outline",
          outlineId: outlineId,
        },
        slides: presentationSlides,
        userId: user.id,
      },
    });

    console.log("[create-presentation] Created presentation:", {
      id: presentation.id,
      title: presentation.title,
      slidesStored: Array.isArray(presentation.slides) ? (presentation.slides as unknown[]).length : "not-array",
    });

    // Generate the redirect URL
    // Format: /presentation/{slug}-{id}?mode=ai
    const redirectUrl = `/presentation/${slug}-${presentation.id}?mode=ai`;

    return NextResponse.json({
      success: true,
      presentationId: presentation.id,
      title: presentationTitle,
      slug: slug,
      redirectUrl: redirectUrl,
      slidesCount: presentationSlides.length,
      imagesAdded: presentationSlides.filter((s) => s.image?.url).length,
    });
  } catch (error) {
    console.error("Error creating presentation:", error);
    return NextResponse.json(
      { error: "Failed to create presentation" },
      { status: 500 }
    );
  }
}

