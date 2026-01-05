import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { fetchImagesForSlides, type SlideWithVisualMetadata } from "~/lib/pexels";
import { getThemeById } from "~/lib/themes";
import {
  transformBullets,
  generateImagesForSlides as generateAIImages,
  type TransformedContent,
  type VisualStrategy,
  type SlideAssets,
  type SlideImage,
} from "~/lib/presentation";
import type { BoxLayoutType } from "~/lib/layouts/content/boxes";
import { generateSlug } from "~/lib/utils";
import type { ChartData } from "~/lib/blocks";

interface SlideInput {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  // Visual metadata from outline
  semanticIntent?: string;
  visualStrategy?: VisualStrategy;
  assets?: SlideAssets;
  // Title slide specific
  image?: SlideImage;
  // Content layout hint from outline (e.g., "boxes", "bullets", "sequence")
  contentLayoutHint?: string;
}

interface CreatePresentationRequest {
  outlineId: string;
  slides: SlideInput[];
  theme: string;
  imageSource: string;
  // Optional image model for AI-generated images
  imageModel?: string;
  textDensity?: "minimal" | "concise" | "detailed" | "extensive";
  metadata: {
    topic: string;
    totalSlides: number;
    tone: string;
    language: string;
  };
  // New: enable streaming mode (Gamma-style)
  streaming?: boolean;
}

interface PresentationSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  // Original bullets preserved
  bulletPoints?: string[];
  // Speaker notes - detailed explanations for the presenter
  speakerNotes?: string[];
  // Transformed content
  transformedContent?: TransformedContent;
  // Visual assets
  chart?: ChartData | null;
  icons?: IconPlaceholder[];
  image?: {
    url: string;
    alt: string;
    photographer?: string;
    photographerUrl?: string;
    source: "pexels" | "ai" | "upload" | "placeholder" | "none";
  } | null;
  // Layout from visual strategy
  layout?: string;
  // Content layout for box/card arrangements
  contentLayout?: string;
  // Preserved visual metadata
  semanticIntent?: string;
  visualStrategy?: VisualStrategy;
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
    const { outlineId, slides, theme, imageSource, imageModel, textDensity = "concise", metadata, streaming = true } = body;

    console.log("[create-presentation] Received request:", {
      outlineId,
      outlineIdType: typeof outlineId,
      outlineIdTruthy: !!outlineId,
      slidesCount: slides?.length || 0,
      theme,
      imageSource,
      textDensity,
      metadata,
      streaming,
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

    // STREAMING MODE: Create presentation immediately with pending slides, redirect to page
    if (streaming) {
      const presentationTitle = slides[0]?.type === "title" && slides[0]?.title
        ? slides[0].title
        : metadata.topic || "Untitled Presentation";
      const slug = generateSlug(presentationTitle);

      // Create presentation with empty slides but store pending content
      // Ensure outlineId is null if empty string (for proper matching later)
      const validOutlineId = outlineId && outlineId.trim() ? outlineId : null;
      
      const presentation = await db.presentation.create({
        data: {
          title: presentationTitle,
          description: metadata.topic,
          thumbnailUrl: null,
          outlineId: validOutlineId, // Store outlineId as a proper column
          content: {
            theme,
            themeConfig: themeConfig || null,
            imageSource,
            imageModel,
            textDensity,
            metadata,
            createdFrom: "outline",
            // Store slides for streaming processing
            pendingSlides: slides,
            streamingComplete: false,
          },
          slides: [], // Empty - will be populated by streaming
          userId: user.id,
        },
      });

      console.log("[create-presentation] Created presentation with outlineId:", validOutlineId);

      const redirectUrl = `/presentation/${slug}-${presentation.id}?mode=ai&streaming=true`;

      return NextResponse.json({
        success: true,
        presentationId: presentation.id,
        title: presentationTitle,
        slug,
        redirectUrl,
        streaming: true,
      });
    }

    // NON-STREAMING MODE: Process everything before responding (legacy)
    // Step 1: Transform slides with all visual enhancements
    let presentationSlides: PresentationSlide[] = slides.map((slide) => {
      // Transform bullet points based on semantic intent and visual strategy
      const transformedContent = slide.type === "content" 
        ? transformBullets(slide, textDensity)
        : undefined;

      // ==========================================
      // SLIDE LAYOUT: Controls image positioning (left, right, centered)
      // This determines WHERE the image appears on the slide
      // Options: "left-content" (image left), "right-content" (image right), "centered" (no image)
      // ==========================================
      let slideLayout: string;
      if (slide.type === "title") {
        slideLayout = "title-centered";
      } else {
        // For content slides, determine image position based on outline's image requirements
        const hasImage = slide.assets?.image?.required || slide.image?.required;
        if (hasImage) {
          // Randomly choose image position: left or right (most common and well-supported)
          const imagePositions = ["left-content", "right-content"];
          slideLayout = imagePositions[Math.floor(Math.random() * imagePositions.length)]!;
        } else {
          // No image - use centered layout
          slideLayout = "centered";
        }
      }

      // ==========================================
      // CONTENT LAYOUT: Controls how bullet points are displayed (box-style-1, box-style-2, etc.)
      // This determines HOW the content/bullet points are rendered (as cards/boxes)
      // This is separate from slide layout and only affects content rendering
      // ==========================================
      let contentLayout: BoxLayoutType | undefined;
      // For all content slides, apply a box layout (either from outline or randomly selected)
      if (slide.type === "content") {
        // Randomly select a box layout style for bullet points
        const boxLayouts: BoxLayoutType[] = ["box-style-1", "box-style-2", "box-style-3", "box-style-4"];
        contentLayout = boxLayouts[Math.floor(Math.random() * boxLayouts.length)]!;
      }

      return {
        type: slide.type,
        title: slide.title,
        subtitle: slide.subtitle,
        bulletPoints: slide.bulletPoints,
        transformedContent,
        chart: null,
        icons: undefined,
        image: null,
        layout: slideLayout, // Slide layout: image positioning
        contentLayout, // Content layout: box style for bullet points
        semanticIntent: slide.semanticIntent,
        visualStrategy: slide.visualStrategy,
      };
    });

    console.log("[create-presentation] Transformed slides:", {
      count: presentationSlides.length,
      withTransformedContent: presentationSlides.filter(s => s.transformedContent).length,
      withCharts: presentationSlides.filter(s => s.chart).length,
      withIcons: presentationSlides.filter(s => s.icons?.length).length,
    });

    // Step 2: Handle images based on image source
    if (imageSource === "stock-photos") {
      // Use enhanced Pexels search with promptHint
      const slidesWithMetadata: SlideWithVisualMetadata[] = slides.map(slide => ({
        type: slide.type,
        title: slide.title,
        subtitle: slide.subtitle,
        bulletPoints: slide.bulletPoints,
        assets: slide.assets,
        image: slide.image,
      }));
      
      const imageMap = await fetchImagesForSlides(slidesWithMetadata);

      presentationSlides = presentationSlides.map((slide, index) => {
        const photo = imageMap.get(index);
        if (photo) {
          return {
            ...slide,
            image: {
              url: photo.src.large,
              alt: photo.alt || slide.title,
              photographer: photo.photographer,
              photographerUrl: photo.photographer_url,
              source: "pexels" as const,
            },
          };
        }
        return slide;
      });
    } else if (imageSource === "ai-generated") {
      // Use Gemini / Imagen AI for image generation (backed by Cloudinary for persistence)
      const slidesWithMetadata = slides.map(slide => ({
        type: slide.type,
        title: slide.title,
        assets: slide.assets,
        image: slide.image,
      }));
      
      const imageMap = await generateAIImages(slidesWithMetadata, imageModel as any);

      presentationSlides = presentationSlides.map((slide, index) => {
        const result = imageMap.get(index);
        if (result && result.url) {
          return {
            ...slide,
            image: {
              url: result.url,
              alt: result.alt || slide.title,
              source: "ai" as const,
            },
          };
        }
        return slide;
      });
    } else if (imageSource === "placeholders") {
      // Add placeholder markers for slides that require images
      presentationSlides = presentationSlides.map((slide, index) => {
        const originalSlide = slides[index];
        const requiresImage = originalSlide?.type === "title"
          ? (originalSlide.image?.required ?? true)
          : (originalSlide?.assets?.image?.required ?? false);

        if (requiresImage) {
          return {
            ...slide,
            image: {
              url: "",
              alt: "Image placeholder",
              source: "placeholder" as const,
            },
          };
        }
        return slide;
      });
    }
    // For "no-images", "illustrations", "web-images" - leave images null

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
      chartsAdded: presentationSlides.filter(s => s.chart).length,
    });

    // Extract thumbnail from title slide (first slide)
    const titleSlide = presentationSlides[0];
    const thumbnailUrl =
      titleSlide?.image?.url && titleSlide.image.url.startsWith("http")
        ? titleSlide.image.url
        : null;

    // Ensure outlineId is null if empty string (for proper matching later)
    const validOutlineIdNonStreaming = outlineId && outlineId.trim() ? outlineId : null;

    // Create the presentation in the database
    const presentation = await db.presentation.create({
      data: {
        title: presentationTitle,
        description: metadata.topic,
        thumbnailUrl,
        outlineId: validOutlineIdNonStreaming, // Store outlineId as a proper column
        content: {
          theme: theme,
          themeConfig: themeConfig || null,
          imageSource: imageSource,
          textDensity: textDensity,
          metadata: metadata,
          createdFrom: "outline",
        },
        slides: presentationSlides,
        userId: user.id,
      },
    });

    console.log("[create-presentation] Created presentation:", {
      id: presentation.id,
      title: presentation.title,
      outlineId: validOutlineIdNonStreaming,
      slidesStored: Array.isArray(presentation.slides) ? (presentation.slides as unknown[]).length : "not-array",
    });

    // Persist AI images into the Image library for the current user
    try {
      const aiSlideImages = presentationSlides
        .map((slide, index) => ({ slide, index }))
        .filter(({ slide }) => slide.image && slide.image.source === "ai" && slide.image.url);

      if (aiSlideImages.length > 0) {
        await db.image.createMany({
          data: aiSlideImages.map(({ slide, index }) => ({
            url: slide.image!.url,
            filename: `${slug}-slide-${index + 1}.png`,
            userId: user.id,
            presentationId: presentation.id,
          })),
        });

        console.log("[create-presentation] Saved AI images to Image library:", {
          count: aiSlideImages.length,
        });
      }
    } catch (e) {
      console.error("[create-presentation] Failed to save AI images to Image library:", e);
    }

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
      chartsAdded: presentationSlides.filter((s) => s.chart).length,
      iconsAdded: presentationSlides.filter((s) => s.icons?.length).length,
    });
  } catch (error) {
    console.error("Error creating presentation:", error);
    return NextResponse.json(
      { error: "Failed to create presentation" },
      { status: 500 }
    );
  }
}

