import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { fetchImagesForSlides, type SlideWithVisualMetadata } from "~/lib/pexels";
import { getThemeById } from "~/lib/themes";
import {
  generateImagesForSlides as generateAIImages,
  transformOutlineToPresentationStream,
  type TransformedSlide,
  type VisualStrategy,
  type SlideAssets,
} from "~/lib/presentation";
import type { BoxLayoutType } from "~/lib/layouts/content/boxes";
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
  contentLayout?: string; // Content layout method from outline (e.g., "box")
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
  // New: sections for card-style layouts (from LLM transformation)
  sections?: Array<{
    heading: string;
    description: string;
  }>;
  // New: intro text before content
  introText?: string;
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
  layout?: string;
  contentLayout?: string; // Box layout type (e.g., "box-style-1", "box-style-2", etc.)
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
        const createData: Parameters<typeof db.presentation.create>[0]["data"] = {
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
            outlineId,
          })),
          slides: JSON.parse(JSON.stringify([])),
          userId: user.id,
        };
        
        // Add outlineId if the field exists in Prisma schema (after regeneration)
        if (outlineId) {
          (createData as Record<string, unknown>).outlineId = outlineId;
        }

        const presentation = await db.presentation.create({ data: createData });

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
          contentLayout: s.contentLayout, // Include content layout from outline
        }));

        const transformStream = transformOutlineToPresentationStream(outlineSlides, {
          tone: metadata.tone,
          language: metadata.language,
          textDensity,
        });

        // Helper function to randomly select a box layout
        const getRandomBoxLayout = (): BoxLayoutType => {
          const boxLayouts: BoxLayoutType[] = ["box-style-1", "box-style-2", "box-style-3", "box-style-4"];
          return boxLayouts[Math.floor(Math.random() * boxLayouts.length)]!;
        };

        // Process each transformed slide
        for await (const { slideIndex, slide: transformedSlide } of transformStream) {
          const originalSlide = slides[slideIndex]!;

          // ==========================================
          // SLIDE LAYOUT: Controls image positioning (left, right, centered)
          // This determines WHERE the image appears on the slide
          // Options: "left-content" (image left), "right-content" (image right), "centered" (no image)
          // ==========================================
          let slideLayout: string;
          if (transformedSlide.type === "title") {
            slideLayout = "title-centered";
          } else {
            // For content slides, determine image position based on outline's image requirements
            const hasImage = originalSlide.assets?.image?.required || originalSlide.image?.required;
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
          if (transformedSlide.type === "content") {
            // Randomly select a box layout style for bullet points
            contentLayout = getRandomBoxLayout();
          }

          // Create slide object with transformed content
          const presentationSlide: PresentationSlide = {
            type: transformedSlide.type,
            title: transformedSlide.title,
            subtitle: transformedSlide.subtitle,
            tagline: transformedSlide.tagline,
            introText: transformedSlide.introText,
            bulletPoints: transformedSlide.bulletPoints,
            sections: transformedSlide.sections,
            chart: null,
            icons: undefined,
            image: null,
            layout: slideLayout, // Slide layout: image positioning
            contentLayout, // Content layout: box style for bullet points
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
