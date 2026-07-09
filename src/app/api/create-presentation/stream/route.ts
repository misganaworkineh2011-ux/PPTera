import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { fetchImagesForSlides, type SlideWithVisualMetadata, searchPexelsPhotos } from "~/lib/pexels";
import { getThemeById } from "~/lib/themes";
import { pickThemeForTopic } from "~/lib/themes/theme-matcher";
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
import { selectLayout, type LayoutSelectionContext } from "~/lib/presentation/smart-layout";
import { selectLayoutFromCatalog } from "~/lib/presentation/catalog-layout-selector";
import { buildDeckArtDirection } from "~/lib/presentation/generate-ai-image";

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
  slideRole?: string; // Narrative role from outline: "content" | "statement" | "data-moment"
  kicker?: string; // Short uppercase eyebrow label above the heading
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
  // Short uppercase kicker/eyebrow label above a content slide's heading
  kicker?: string;
  chart?: Record<string, unknown> | null;
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
  presentationSlides: PresentationSlide[],
  artStyle?: string | null
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

    const imageMap = await generateAIImages(slidesWithMetadata, imageModel as any, artStyle);

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

  // Brand kit: when the user has one enabled, new decks come out on-brand.
  // The brand theme (a custom Theme row managed by /api/user/brand-kit)
  // overrides topic matching; the logo/footer land on every slide via a
  // default master-slide overlay.
  let brandThemeId: string | null = null;
  let brandMasterSlide: Record<string, unknown> | null = null;
  try {
    const brandKit = await db.brandKit.findUnique({
      where: { userId: user.id },
    });
    if (brandKit?.enabled) {
      if (brandKit.logoUrl || brandKit.footerText) {
        brandMasterSlide = {
          logo: brandKit.logoUrl
            ? { url: brandKit.logoUrl, position: "top-right", size: 40, opacity: 0.95 }
            : null,
          footer: brandKit.footerText
            ? { text: brandKit.footerText, show: true, align: "left" }
            : null,
          slideNumbers: { show: true, align: "right" },
          hideOnTitle: true,
        };
      }
      const brandTheme = await db.theme.findFirst({
        where: { userId: user.id, name: "My Brand Kit" },
        select: { id: true },
      });
      if (brandTheme) brandThemeId = `custom-${brandTheme.id}`;
    }
  } catch (brandError) {
    console.error("Brand kit lookup failed (generation continues):", brandError);
  }

  // Auto-match a theme to the topic when the caller didn't make a deliberate choice.
  // The client default is "corporate-clean", so treat that (or empty) as "no choice"
  // and pick a topic-appropriate theme instead — a finance pitch and a wedding deck
  // shouldn't open with the same look. An enabled brand theme beats both.
  const resolvedTheme =
    brandThemeId ??
    (!theme || theme === "corporate-clean" ? pickThemeForTopic(metadata.topic) : theme);
  const themeConfig = getThemeById(resolvedTheme);
  // One cohesive art-direction descriptor for every AI image in this deck.
  const deckArtDirection = buildDeckArtDirection(themeConfig?.category);
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
        
        // Track which slides had their images overridden by layout compatibility rules
        const imageOverriddenSlides = new Set<number>();

        // Initialize layout selection context for tracking across slides
        const layoutContext: LayoutSelectionContext = {
          slideIndex: 0,
          totalSlides: slides.length,
          previousLayouts: [],
          presentationTone: metadata.tone,
          presentationLanguage: metadata.language,
          themeStyle: "professional", // TODO: Derive from theme
          categoryUsage: new Map(),
          styleUsage: new Map(),
        };

        // Create presentation in DB first (without images)
        // Note: outlineId field requires Prisma client regeneration after schema update
        const presentation = await db.presentation.create({
          data: {
            title: presentationTitle,
            description: metadata.topic,
            thumbnailUrl: null,
            // Link the source outline via the FK column too (not just the
            // content JSON) so lists can offer "Edit outline" cheaply.
            outlineId: outlineId || null,
            content: JSON.parse(JSON.stringify({
              theme: resolvedTheme,
              themeConfig: themeConfig || null,
              imageSource,
              textDensity,
              metadata,
              createdFrom: "outline",
              outlineId, // Store outlineId in content JSON
              ...(brandMasterSlide ? { masterSlide: brandMasterSlide } : {}),
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
        const outlineSlides = slides.map(s => {
          const chartIntent = (s.assets as { chart?: { type?: string; purpose?: string } } | undefined)?.chart;
          return {
            type: s.type,
            title: s.title,
            subtitle: s.subtitle,
            bulletPoints: s.bulletPoints,
            contentLayoutHint: s.contentLayoutHint, // Include content layout hint from outline
            // Chart intent from the outline — the transform LLM turns this
            // into real chart data (type + points) for the slide.
            wantsChart: Boolean(chartIntent),
            chartType: chartIntent?.type,
            chartPurpose: chartIntent?.purpose,
          };
        });

        const transformStream = transformOutlineToPresentationStream(outlineSlides, {
          tone: metadata.tone,
          language: metadata.language,
          textDensity,
        });

        // Process each transformed slide
        for await (const { slideIndex, slide: transformedSlide } of transformStream) {
          const originalSlide = slides[slideIndex]!;

          // ==========================================
          // SMART LAYOUT SELECTION
          // Uses the new smart layout selection system to jointly select:
          // - slideLayout (image position): left/right/top/bottom/no-image
          // - imageSize: small/medium/large
          // - contentLayout: specific style (e.g., "box-style-1", "sequence-style-2")
          // - contentLayoutCategory: category (e.g., "boxes", "sequence")
          // The system considers content analysis, LLM metadata, and presentation context
          // ==========================================
          
          // Update context for current slide
          layoutContext.slideIndex = slideIndex;
          
          // Perform smart layout selection
          const layoutSelection = await selectLayout({
            slide: {
              type: transformedSlide.type,
              title: transformedSlide.title,
              subtitle: transformedSlide.subtitle,
              bulletPoints: transformedSlide.bulletPoints,
              sections: transformedSlide.sections,
              semanticIntent: originalSlide.semanticIntent,
              visualStrategy: originalSlide.visualStrategy,
              contentLayoutHint: originalSlide.contentLayoutHint,
              // Convert image metadata to expected format
              image: originalSlide.image ? {
                required: originalSlide.image.required,
                orientation: "landscape" as const,
                pexelsPromptHint: originalSlide.image.pexelsPromptHint || originalSlide.image.promptHint || "",
                aiPromptHint: originalSlide.image.aiPromptHint || originalSlide.image.promptHint || "",
              } : undefined,
              assets: originalSlide.assets ? {
                image: originalSlide.assets.image ? {
                  required: originalSlide.assets.image.required,
                  orientation: "landscape" as const,
                  pexelsPromptHint: originalSlide.assets.image.pexelsPromptHint || originalSlide.assets.image.promptHint || "",
                  aiPromptHint: originalSlide.assets.image.aiPromptHint || originalSlide.assets.image.promptHint || "",
                } : undefined,
              } : undefined,
            },
            context: layoutContext,
            options: {
              timeout: 50,
              enablePerformanceLogging: false,
              enableDebugLogging: false,
            },
          });

          // ==========================================
          // LLM CATALOG OVERRIDE
          // Hand the full family-level layout catalog to an LLM so it can pick
          // the single most suitable content-layout family + style for this
          // slide's text and reshape the items to fit that family's format.
          // Overrides the deterministic selection above; falls back to it on any
          // failure. Skipped for title slides (they render via TitleSlide).
          // ==========================================
          if (transformedSlide.type !== "title") {
            try {
              const willHaveImage = layoutSelection.slideLayout !== "no-image";
              const catalogChoice = await selectLayoutFromCatalog(
                {
                  title: transformedSlide.title,
                  subtitle: transformedSlide.subtitle,
                  bulletPoints: transformedSlide.bulletPoints,
                  sections: transformedSlide.sections,
                  semanticIntent: originalSlide.semanticIntent,
                  visualStrategy: originalSlide.visualStrategy,
                  contentLayoutHint: originalSlide.contentLayoutHint,
                },
                { hasImage: willHaveImage }
              );
              if (catalogChoice) {
                // Redirect the deterministic pick to the LLM's choice so the
                // context tracking and slide creation below both use it.
                layoutSelection.category = catalogChoice.category;
                layoutSelection.style = catalogChoice.style;
                // Reshape content into the chosen family's item format
                // (getBoxContentItems reads sections first: heading→label, description→text).
                if (catalogChoice.items && catalogChoice.items.length > 0) {
                  transformedSlide.sections = catalogChoice.items.map((it) => ({
                    heading: it.label,
                    description: it.text,
                  }));
                }
                console.log(
                  `[create-presentation] Slide ${slideIndex}: catalog layout → ${catalogChoice.category}/${catalogChoice.style}` +
                    (catalogChoice.reasoning ? ` (${catalogChoice.reasoning})` : "")
                );
              }
            } catch (catalogError) {
              console.warn(
                `[create-presentation] Slide ${slideIndex}: catalog override failed, keeping deterministic selection:`,
                catalogError
              );
            }
          }

          // Track selection for context (for next slides)
          layoutContext.previousLayouts.push({
            slideIndex,
            category: layoutSelection.category,
            style: layoutSelection.style,
            slideLayout: layoutSelection.slideLayout,
          });
          
          // Update category and style usage statistics
          const categoryCount = layoutContext.categoryUsage.get(layoutSelection.category) ?? 0;
          layoutContext.categoryUsage.set(layoutSelection.category, categoryCount + 1);
          
          const styleCount = layoutContext.styleUsage.get(layoutSelection.style) ?? 0;
          layoutContext.styleUsage.set(layoutSelection.style, styleCount + 1);

          // Check if image was overridden by layout compatibility rules
          const imageWasOverridden = layoutSelection.imageOverridden ?? false;
          const imageOverrideReason = layoutSelection.imageOverrideReason;
          
          // Log when image is overridden for debugging
          if (imageWasOverridden) {
            console.log(`[create-presentation] Slide ${slideIndex}: Image overridden - ${imageOverrideReason}`);
            imageOverriddenSlides.add(slideIndex);
          }

          // Create slide object with selected layout
          const presentationSlide: PresentationSlide = {
            type: transformedSlide.type,
            title: transformedSlide.title,
            subtitle: transformedSlide.subtitle,
            tagline: transformedSlide.tagline,
            kicker: transformedSlide.kicker ?? originalSlide.kicker,
            slideDescription: transformedSlide.slideDescription,
            introText: transformedSlide.introText,
            bulletPoints: transformedSlide.bulletPoints,
            speakerNotes: transformedSlide.speakerNotes, // Detailed notes for presenter
            sections: transformedSlide.sections,
            chart: null,
            icons: undefined,
            image: null,
            // New canonical slide layout system from smart selection.
            // Title slides stay layout-free so they render through TitleSlide
            // (theme signature / cover styles) with a full-bleed image backdrop
            // instead of the generic side-image split.
            slideLayout: transformedSlide.type === "title" ? undefined : layoutSelection.slideLayout,
            imageSize: layoutSelection.imageSize,
            imageShape: layoutSelection.imageShape,
            // Legacy layout for renderer compatibility
            layout: layoutSelection.slideLayout === "no-image" ? "no-image" : 
                    layoutSelection.slideLayout === "image-left" ? "image-left" :
                    layoutSelection.slideLayout === "image-right" ? "image-right" :
                    layoutSelection.slideLayout === "image-top" ? "image-top" :
                    layoutSelection.slideLayout === "image-bottom" ? "image-bottom" :
                    "no-image",
            // Content layout from smart selection
            contentLayout: layoutSelection.style,
            contentLayoutCategory: layoutSelection.category,
            semanticIntent: originalSlide.semanticIntent,
            visualStrategy: originalSlide.visualStrategy,
          };

          // Attach an AI-generated chart when the transform produced one
          // (outline flagged the slide with assets.chart). The chart becomes
          // the slide's visual hero via the chart-right split layout.
          const aiChart = transformedSlide.chart;
          if (aiChart && Array.isArray(aiChart.data) && aiChart.data.length >= 2) {
            const VALID_CHART_TYPES = [
              "bar", "horizontal-bar", "line", "area", "pie", "donut",
              "funnel", "radar", "kpi", "progress", "gauge", "scatter",
            ];
            const chartType = VALID_CHART_TYPES.includes(aiChart.type) ? aiChart.type : "bar";
            presentationSlide.chart = {
              type: chartType,
              title: aiChart.title || transformedSlide.title,
              data: aiChart.data.slice(0, 8).map((d) => ({
                label: String(d.label).slice(0, 28),
                value: Number(d.value) || 0,
              })),
              config: {
                showValues: true,
                showLegend: chartType === "pie" || chartType === "donut",
                showGrid: ["bar", "line", "area", "scatter"].includes(chartType),
                colorScheme: "theme",
                ...(aiChart.unit ? { unit: aiChart.unit } : {}),
                ...(chartType === "donut" ? { donutHole: 0.6 } : {}),
              },
            };
            presentationSlide.slideLayout = "chart-right";
            presentationSlide.image = null;
          }

          // Narrative pacing: turn "statement" slides into full-bleed image moments
          // when the layout engine kept an image for them. This gives the deck rhythm
          // — a bold visual beat between dense content slides.
          if (
            originalSlide.slideRole === "statement" &&
            layoutSelection.slideLayout &&
            layoutSelection.slideLayout !== "no-image" &&
            !imageWasOverridden
          ) {
            presentationSlide.slideLayout = "image-background";
            presentationSlide.layout = "image-background";
          }

          presentationSlides.push(presentationSlide);

          // Determine if this slide should show an image placeholder
          // Don't show placeholder if image was overridden by layout compatibility
          const shouldShowImagePlaceholder = imageSource !== "no-images" && !imageWasOverridden;

          // Send slide start event (with placeholder for image if applicable)
          sendEvent(controller, "slideStart", {
            slideIndex,
            slide: {
              ...presentationSlide,
              image: shouldShowImagePlaceholder ? { url: "", alt: "Loading...", source: "placeholder" } : null,
            },
            // Include layout selection metadata for debugging
            layoutSelection: {
              category: layoutSelection.category,
              style: layoutSelection.style,
              confidence: layoutSelection.confidence,
              score: layoutSelection.score,
              explanation: layoutSelection.explanation,
              imageOverridden: imageWasOverridden,
              imageOverrideReason: imageOverrideReason,
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
          sendEvent(controller, "slideComplete", {
            slideIndex,
            slide: presentationSlide,
            // Include layout selection metadata for debugging
            layoutSelection: {
              category: layoutSelection.category,
              style: layoutSelection.style,
              confidence: layoutSelection.confidence,
              score: layoutSelection.score,
              imageOverridden: imageWasOverridden,
              imageOverrideReason: imageOverrideReason,
            },
          });

          // Persist progress after EVERY slide so an interrupted generation
          // (closed tab, back navigation, crash) leaves a usable partial deck
          // instead of a permanently empty one. Failures never stop the stream.
          try {
            await db.presentation.update({
              where: { id: presentation.id },
              data: { slides: JSON.parse(JSON.stringify(presentationSlides)) },
            });
          } catch (persistError) {
            console.error(
              `[create-presentation] Incremental save failed after slide ${slideIndex}:`,
              persistError,
            );
          }
        }

        // Process images in batches of 4-5
        if (imageSource === "stock-photos" || imageSource === "ai-generated") {
          const slidesNeedingImages = slides
            .map((slide, index) => ({ slide, index }))
            .filter(({ slide, index }) => {
              // Skip slides where image was overridden by layout compatibility rules
              if (imageOverriddenSlides.has(index)) {
                console.log(`[create-presentation] Skipping image for slide ${index}: Layout compatibility override`);
                return false;
              }
              
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
                presentationSlides,
                deckArtDirection
              );

              sendEvent(controller, "imageBatchComplete", {
                batchIndex,
                totalBatches: batches.length,
              });

              // Persist after each image batch too — images arrive after the
              // text pass and should survive an interruption as well.
              try {
                await db.presentation.update({
                  where: { id: presentation.id },
                  data: { slides: JSON.parse(JSON.stringify(presentationSlides)) },
                });
              } catch (persistError) {
                console.error(
                  `[create-presentation] Incremental save failed after image batch ${batchIndex}:`,
                  persistError,
                );
              }
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
                    const result = await generateImageFromSpec(imageSpec, imageModel as any, deckArtDirection);
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
            
            // Skip slides where image was overridden by layout compatibility rules
            if (imageOverriddenSlides.has(i)) {
              continue;
            }
            
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
