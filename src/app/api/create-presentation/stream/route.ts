import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { fetchImagesForSlides, type SlideWithVisualMetadata, searchPexelsPhotos } from "~/lib/pexels";
import { getThemeById } from "~/lib/themes";
import {
  generateImagesForSlides as generateAIImages,
  generateImageFromSpec,
  transformOutlineToPresentationStream,
  planSlideLayout,
  extractPlannerInput,
  type TransformedSlide,
  type VisualStrategy,
  type SlideAssets,
  type ContentLayoutStyle,
} from "~/lib/presentation";
import { calculateSlideCredits, CREDIT_COSTS } from "~/lib/credits";
import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { SlideLayoutType, ImageSize, ImageShape } from "~/lib/layouts/slide";
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
  // Multiple images for image gallery layouts
  images?: Array<{
    url: string;
    alt: string;
    photographer?: string;
    photographerUrl?: string;
    source: "pexels" | "ai" | "upload" | "placeholder" | "none";
  }>;
  // New slide layout system (image position) - canonical field
  slideLayout?: SlideLayoutType;
  // Image size for slide layout
  imageSize?: ImageSize;
  // Image shape for slide layout (rectangle, arc, rounded, wave)
  imageShape?: ImageShape;
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

// Sanitize error messages to never expose internal details to clients
function getSanitizedErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }
  
  const message = error.message.toLowerCase();
  
  // Map internal errors to user-friendly messages
  if (message.includes("rate limit") || message.includes("429")) {
    return "We're experiencing high demand. Please wait a moment and try again.";
  }
  if (message.includes("timeout") || message.includes("timed out")) {
    return "The request took too long. Please try again.";
  }
  if (message.includes("api key") || message.includes("unauthorized") || message.includes("401")) {
    return "Service configuration error. Please contact support.";
  }
  if (message.includes("quota") || message.includes("billing")) {
    return "Service temporarily unavailable. Please try again later.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Connection error. Please check your internet and try again.";
  }
  if (message.includes("pexels") || message.includes("image")) {
    return "Failed to load images. Please try again.";
  }
  
  // Default generic message - never expose raw error
  return "Failed to create presentation. Please try again.";
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

  // Credit check: 4 credits per slide (no charge for outline)
  const requestedSlideCount = slides.length;
  const creditsNeeded = calculateSlideCredits(requestedSlideCount);

  if (user.credits < creditsNeeded) {
    return new Response(
      JSON.stringify({
        error: "Insufficient credits",
        required: creditsNeeded,
        available: user.credits,
        costPerSlide: CREDIT_COSTS.SLIDE,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
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
              title: transformedSlide.title,
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
          const layoutPlan = await planSlideLayout(plannerInput);

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
            imageShape: layoutPlan.imageShape,
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

          // Special handling: Generate 2-3 additional images for slides with "images" layout
          const imagesLayoutSlides = presentationSlides
            .map((slide, index) => ({ slide, index, originalSlide: slides[index] }))
            .filter(({ slide, originalSlide }) => {
              if (!originalSlide) return false;
              // Check if content layout is "images" category
              const contentLayoutCategory = slide.contentLayoutCategory;
              return contentLayoutCategory === "images";
            });

          if (imagesLayoutSlides.length > 0 && imageSource === "stock-photos") {
            // Generate 2-3 additional images for each images layout slide
            for (const { slide, index, originalSlide } of imagesLayoutSlides) {
              if (!originalSlide) continue;
              
              const slidesWithMetadata: SlideWithVisualMetadata[] = [originalSlide];
              const imageMap = await fetchImagesForSlides(slidesWithMetadata);
              
              // Get 2-3 additional images (total 3-4 images for the slide)
              const numAdditionalImages = 2; // Generate 2 more (total 3 images)
              const additionalImages: Array<{
                url: string;
                alt: string;
                photographer?: string;
                photographerUrl?: string;
                source: "pexels";
              }> = [];

              // Try to get multiple different images
              for (let i = 0; i < numAdditionalImages; i++) {
                const photos = await searchPexelsPhotos(
                  originalSlide.assets?.image?.pexelsPromptHint || 
                  originalSlide.assets?.image?.promptHint || 
                  originalSlide.title,
                  10,
                  i + 2 // Different page to get variety
                );
                
                if (photos.length > 0) {
                  const photo = photos[Math.floor(Math.random() * photos.length)]!;
                  additionalImages.push({
                    url: photo.src.large,
                    alt: photo.alt || slide.title,
                    photographer: photo.photographer,
                    photographerUrl: photo.photographer_url,
                    source: "pexels",
                  });
                }
              }

              // Store additional images in the slide's images array
              if (additionalImages.length > 0) {
                if (!presentationSlides[index]!.images) {
                  presentationSlides[index]!.images = [];
                }
                presentationSlides[index]!.images!.push(...additionalImages);
                
                // Send events for each additional image
                additionalImages.forEach((img, imgIndex) => {
                  sendEvent(controller, "imageLoaded", {
                    slideIndex: index,
                    image: img,
                    imageIndex: imgIndex + 1, // 0 is the main image
                  });
                });
              }
            }
          } else if (imagesLayoutSlides.length > 0 && imageSource === "ai-generated") {
            // For AI-generated, generate 2-3 additional images
            for (const { slide, index, originalSlide } of imagesLayoutSlides) {
              if (!originalSlide) continue;
              
              const numAdditionalImages = 2; // Generate 2 more (total 3 images)
              const additionalImages: Array<{
                url: string;
                alt: string;
                source: "ai";
              }> = [];

              for (let i = 0; i < numAdditionalImages; i++) {
                const imageSpec = originalSlide.type === "title" 
                  ? originalSlide.image 
                  : originalSlide.assets?.image;
                
                if (imageSpec?.required && imageSpec.aiPromptHint) {
                  try {
                    const result = await generateImageFromSpec(imageSpec, imageModel as any);
                    if (result.url) {
                      additionalImages.push({
                        url: result.url,
                        alt: result.alt || slide.title,
                        source: "ai",
                      });
                    }
                  } catch (error) {
                    console.error(`[create-presentation] Failed to generate additional image ${i + 1} for slide ${index}:`, error);
                  }
                }
              }

              // Store additional images
              if (additionalImages.length > 0) {
                if (!presentationSlides[index]!.images) {
                  presentationSlides[index]!.images = [];
                }
                presentationSlides[index]!.images!.push(...additionalImages);
                
                // Send events for each additional image
                additionalImages.forEach((img, imgIndex) => {
                  sendEvent(controller, "imageLoaded", {
                    slideIndex: index,
                    image: img,
                    imageIndex: imgIndex + 1,
                  });
                });
              }
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

        // Deduct credits based on actual slide count (4 credits per slide)
        const actualSlideCount = presentationSlides.length;
        const creditsUsed = calculateSlideCredits(actualSlideCount);

        await db.user.update({
          where: { id: user.id },
          data: { credits: { decrement: creditsUsed } },
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
        // Log detailed error for debugging (server-side only)
        console.error("[create-presentation/stream] Error:", error);
        
        // Sanitize error message for client - never expose internal details
        const sanitizedMessage = getSanitizedErrorMessage(error);
        sendEvent(controller, "error", { message: sanitizedMessage });
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
