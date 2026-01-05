import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { fetchImagesForSlides, type SlideWithVisualMetadata } from "~/lib/pexels";
import { getThemeById } from "~/lib/themes";
import {
  generateImagesForSlides as generateAIImages,
  transformOutlineToPresentationStream,
  planSlideLayout,
  extractPlannerInput,
  type TransformedSlide,
  type VisualStrategy,
  type SlideAssets,
  type ContentLayoutStyle,
} from "~/lib/presentation";
import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { SlideLayoutType, ImageSize } from "~/lib/layouts/slide";
import type { SlideImage as OutlineSlideImage } from "~/lib/dashboard/hooks/useOutlineStream";
import { generateSlug } from "~/lib/utils";

interface SlideInput {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  semanticIntent?: string;
  visualStrategy?: VisualStrategy;
  assets?: SlideAssets;
  image?: OutlineSlideImage;
  contentLayoutHint?: string; // Content layout hint from outline (e.g., "boxes", "sequence", "steps")
}

interface CreatePresentationRequest {
  outlineId: string;
  slides: SlideInput[];
  theme: string;
  imageSource: string;
  imageModel?: string;
  textDensity?: "minimal" | "concise" | "detailed" | "extensive";
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
  // Speaker notes - detailed explanations for the presenter (one per bullet)
  speakerNotes?: string[];
  // New: sections for card-style layouts (from LLM transformation)
  sections?: Array<{
    heading: string;
    description: string;
  }>;
  // New: intro text before content
  introText?: string;
  // New: slide description - simple 2-line description between title and content
  slideDescription?: string;
  // New: tagline for title slides
  tagline?: string;
  chart?: null;
  icons?: undefined;
  image?: {
    url: string;
    alt: string;
    photographer?: string;
    photographerUrl?: string;
    source: "pexels" | "ai" | "upload" | "placeholder" | "none";
  } | null;
  // New slide layout system (image position) - canonical field
  slideLayout?: SlideLayoutType;
  // Image size for slide layout
  imageSize?: ImageSize;
  // Legacy layout for renderer compatibility
  layout?: string;
  contentLayout?: string; // Specific layout style (e.g., "box-style-1", "sequence-style-2", "steps-pyramid")
  contentLayoutCategory?: ContentLayoutCategory; // Layout category (e.g., "boxes", "sequence", "steps")
  semanticIntent?: string;
  visualStrategy?: VisualStrategy;
}

// Helper to send SSE events
function sendEvent(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

// Process images in batches
async function processImageBatch(
  slideIndices: number[],
  slides: SlideInput[],
  imageSource: string,
  imageModel: string | undefined,
  controller: ReadableStreamDefaultController,
  presentationSlides: PresentationSlide[]
): Promise<void> {
  if (imageSource === "stock-photos") {
    const slidesWithMetadata: SlideWithVisualMetadata[] = slideIndices.map(i => {
      const slide = slides[i]!;
      return {
        type: slide.type,
        title: slide.title,
        subtitle: slide.subtitle,
        bulletPoints: slide.bulletPoints,
        assets: slide.assets,
        image: slide.image,
      };
    });

    const imageMap = await fetchImagesForSlides(slidesWithMetadata);

    // Map results back to original indices
    let mapIndex = 0;
    for (const slideIndex of slideIndices) {
      const photo = imageMap.get(mapIndex);
      if (photo) {
        const image = {
          url: photo.src.large,
          alt: photo.alt || slides[slideIndex]!.title,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          source: "pexels" as const,
        };
        presentationSlides[slideIndex]!.image = image;
        sendEvent(controller, "imageLoaded", { slideIndex, image });
      }
      mapIndex++;
    }
  } else if (imageSource === "ai-generated") {
    const slidesWithMetadata = slideIndices.map(i => {
      const slide = slides[i]!;
      return {
        type: slide.type,
        title: slide.title,
        assets: slide.assets,
        image: slide.image,
      };
    });

    const imageMap = await generateAIImages(slidesWithMetadata, imageModel as any);

    let mapIndex = 0;
    for (const slideIndex of slideIndices) {
      const result = imageMap.get(mapIndex);
      if (result && result.url) {
        const image = {
          url: result.url,
          alt: result.alt || slides[slideIndex]!.title,
          source: "ai" as const,
        };
        presentationSlides[slideIndex]!.image = image;
        sendEvent(controller, "imageLoaded", { slideIndex, image });
      }
      mapIndex++;
    }
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const user = await db.user.findFirst({ where: { clerkId: userId } });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  const body: CreatePresentationRequest = await request.json();
  const { outlineId, slides, theme, imageSource, imageModel, textDensity = "concise", metadata } = body;

  if (!slides || slides.length === 0) {
    return new Response(JSON.stringify({ error: "No slides provided" }), { status: 400 });
  }

  const themeConfig = getThemeById(theme);
  const presentationTitle = slides[0]?.type === "title" && slides[0]?.title
    ? slides[0].title
    : metadata.topic || "Untitled Presentation";
  const slug = generateSlug(presentationTitle);

  // Create the stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Initialize presentation slides array
        const presentationSlides: PresentationSlide[] = [];

        // Create presentation in DB first (without images)
        // Note: outlineId field requires Prisma client regeneration after schema update
        const presentation = await db.presentation.create({
          data: {
            title: presentationTitle,
            description: metadata.topic,
            thumbnailUrl: null,
            content: JSON.parse(JSON.stringify({
              theme,
              themeConfig: themeConfig || null,
              imageSource,
              textDensity,
              metadata,
              createdFrom: "outline",
              outlineId, // Store outlineId in content JSON
            })),
            slides: JSON.parse(JSON.stringify([])),
            userId: user.id,
          },
        });

        const redirectUrl = `/presentation/${slug}-${presentation.id}?mode=ai`;

        // Send presentation start event
        sendEvent(controller, "presentationStart", {
          presentationId: presentation.id,
          slug,
          totalSlides: slides.length,
          redirectUrl,
        });

        // Send transforming event
        sendEvent(controller, "transformingStart", { totalSlides: slides.length });

        // Transform outline to presentation using LLM (streams slide by slide)
        const outlineSlides = slides.map(s => ({
          type: s.type,
          title: s.title,
          subtitle: s.subtitle,
          bulletPoints: s.bulletPoints,
          contentLayoutHint: s.contentLayoutHint, // Include content layout hint from outline
        }));

        const transformStream = transformOutlineToPresentationStream(outlineSlides, {
          tone: metadata.tone,
          language: metadata.language,
          textDensity,
        });

        // Process each transformed slide
        for await (const { slideIndex, slide: transformedSlide } of transformStream) {
          const originalSlide = slides[slideIndex]!;

          // ==========================================
          // SMART LAYOUT PLANNING
          // Uses the layout planner to jointly select:
          // - slideLayout (image position): left/right/top/bottom/no-image
          // - imageSize: small/medium/large
          // - contentLayout: specific style (e.g., "box-style-1", "sequence-style-2")
          // - contentLayoutCategory: category (e.g., "boxes", "sequence")
          // The planner considers content density and applies fallback rules
          // ==========================================
          
          // Extract planner input from the transformed slide (uses transformed bullets for density)
          const plannerInput = extractPlannerInput(
            {
              type: transformedSlide.type,
              bulletPoints: transformedSlide.bulletPoints,
              semanticIntent: originalSlide.semanticIntent,
              visualStrategy: originalSlide.visualStrategy,
              assets: originalSlide.assets,
              image: originalSlide.image,
              contentLayoutHint: originalSlide.contentLayoutHint,
            },
            slideIndex,
            slides.length
          );
          
          // Get the planned layout
          const layoutPlan = planSlideLayout(plannerInput);

          // Create slide object with planned layout
          const presentationSlide: PresentationSlide = {
            type: transformedSlide.type,
            title: transformedSlide.title,
            subtitle: transformedSlide.subtitle,
            tagline: transformedSlide.tagline,
            slideDescription: transformedSlide.slideDescription,
            introText: transformedSlide.introText,
            bulletPoints: transformedSlide.bulletPoints,
            speakerNotes: transformedSlide.speakerNotes, // Detailed notes for presenter
            sections: transformedSlide.sections,
            chart: null,
            icons: undefined,
            image: null,
            // New canonical slide layout system
            slideLayout: layoutPlan.slideLayout,
            imageSize: layoutPlan.imageSize,
            // Legacy layout for renderer compatibility
            layout: layoutPlan.legacyLayout,
            // Content layout from planner
            contentLayout: layoutPlan.contentLayout,
            contentLayoutCategory: layoutPlan.contentLayoutCategory,
            semanticIntent: originalSlide.semanticIntent,
            visualStrategy: originalSlide.visualStrategy,
          };

          presentationSlides.push(presentationSlide);

          // Send slide start event (with placeholder for image)
          sendEvent(controller, "slideStart", {
            slideIndex,
            slide: {
              ...presentationSlide,
              image: imageSource !== "no-images" ? { url: "", alt: "Loading...", source: "placeholder" } : null,
            },
          });

          // Stream individual content fields for real-time updates
          sendEvent(controller, "slideContent", { slideIndex, field: "title", value: transformedSlide.title });
          
          if (transformedSlide.subtitle) {
            sendEvent(controller, "slideContent", { slideIndex, field: "subtitle", value: transformedSlide.subtitle });
          }

          if (transformedSlide.slideDescription) {
            sendEvent(controller, "slideContent", { slideIndex, field: "slideDescription", value: transformedSlide.slideDescription });
          }

          if (transformedSlide.introText) {
            sendEvent(controller, "slideContent", { slideIndex, field: "introText", value: transformedSlide.introText });
          }

          if (transformedSlide.bulletPoints) {
            for (let j = 0; j < transformedSlide.bulletPoints.length; j++) {
              sendEvent(controller, "slideContent", {
                slideIndex,
                field: "bulletPoint",
                bulletIndex: j,
                value: transformedSlide.bulletPoints[j],
              });
            }
          }

          if (transformedSlide.sections) {
            sendEvent(controller, "slideContent", { slideIndex, field: "sections", value: transformedSlide.sections });
          }

          // Send slide complete
          sendEvent(controller, "slideComplete", { slideIndex, slide: presentationSlide });
        }

        // Process images in batches of 4-5
        if (imageSource === "stock-photos" || imageSource === "ai-generated") {
          const slidesNeedingImages = slides
            .map((slide, index) => ({ slide, index }))
            .filter(({ slide }) => {
              if (slide.type === "title") {
                return slide.image?.required ?? true;
              }
              return slide.assets?.image?.required ?? false;
            })
            .map(({ index }) => index);

          if (slidesNeedingImages.length > 0) {
            const BATCH_SIZE = 4;
            const batches: number[][] = [];
            
            for (let i = 0; i < slidesNeedingImages.length; i += BATCH_SIZE) {
              batches.push(slidesNeedingImages.slice(i, i + BATCH_SIZE));
            }

            sendEvent(controller, "imagesStart", { slideIndices: slidesNeedingImages });

            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
              const batch = batches[batchIndex]!;
              
              await processImageBatch(
                batch,
                slides,
                imageSource,
                imageModel,
                controller,
                presentationSlides
              );

              sendEvent(controller, "imageBatchComplete", {
                batchIndex,
                totalBatches: batches.length,
              });
            }
          }
        } else if (imageSource === "placeholders") {
          // Add placeholder markers
          for (let i = 0; i < slides.length; i++) {
            const slide = slides[i]!;
            const requiresImage = slide.type === "title"
              ? (slide.image?.required ?? true)
              : (slide.assets?.image?.required ?? false);

            if (requiresImage) {
              presentationSlides[i]!.image = {
                url: "",
                alt: "Image placeholder",
                source: "placeholder",
              };
            }
          }
        }

        // Update presentation with final slides
        const thumbnailUrl = presentationSlides[0]?.image?.url &&
          presentationSlides[0].image.url.startsWith("http")
          ? presentationSlides[0].image.url
          : null;

        await db.presentation.update({
          where: { id: presentation.id },
          data: {
            slides: JSON.parse(JSON.stringify(presentationSlides)),
            thumbnailUrl,
          },
        });

        // Save AI images to library
        if (imageSource === "ai-generated") {
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
          }
        }

        // Send completion event
        sendEvent(controller, "presentationComplete", {
          presentationId: presentation.id,
          slug,
          redirectUrl,
          slides: presentationSlides,
        });

        controller.close();
      } catch (error) {
        console.error("[create-presentation/stream] Error:", error);
        sendEvent(controller, "error", {
          message: error instanceof Error ? error.message : "Failed to create presentation",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
