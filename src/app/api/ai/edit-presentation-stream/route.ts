import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "~/server/db";
import { env } from "~/env";
import { searchPexelsPhotos } from "~/lib/pexels";
import { slideLayouts, type LayoutType } from "~/lib/slide-layouts";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// All available content layout types for the AI to use
const CONTENT_LAYOUTS = {
  boxes: [
    "box-style-1", "box-style-2", "box-style-3", "box-style-4", "box-style-5",
    "box-style-6", "box-style-7", "box-style-8", "box-style-9", "box-style-10"
  ],
  steps: [
    "steps-horizontal", "steps-vertical", "steps-numbered", "steps-timeline",
    "steps-zigzag", "steps-circular"
  ],
  bullets: [
    "bullet-simple", "bullet-icons", "bullet-cards", "bullet-columns",
    "bullet-highlight", "bullet-numbered"
  ],
  quotes: [
    "quote-centered", "quote-large", "quote-card", "quote-minimal",
    "quote-testimonial"
  ],
  circles: [
    "circle-radial", "circle-orbit", "circle-connected",
    "circle-venn"
  ],
  sequence: [
    "sequence-flow", "sequence-timeline", "sequence-process", "sequence-journey"
  ]
};

// Slide layout types (image positioning)
const SLIDE_LAYOUTS = [
  "image-left", "image-right", "image-top", "image-bottom",
  "image-background", "image-full", "no-image"
];

// Image sizes
const IMAGE_SIZES = ["small", "medium", "large", "full"];

interface SlideImage {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  source: string;
}

interface SlideContent {
  type?: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  sections?: Array<{ heading: string; description: string }>;
  introText?: string;
  tagline?: string;
  layout?: LayoutType;
  slideLayout?: string;
  imageSize?: string;
  contentLayout?: string;
  image?: SlideImage | null;
  images?: SlideImage[];
  imageSearch?: string;
  removeImage?: boolean;
  // Transformed content for advanced layouts
  transformedContent?: {
    intro?: string;
    items: Array<{ label?: string; text: string }>;
  };
}

interface EditRequest {
  presentationId: string;
  presentationTitle: string;
  slides: SlideContent[];
  prompt: string;
  context: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { presentationTitle, slides, prompt, context } = await req.json() as EditRequest;

    if (!slides || !prompt) {
      return NextResponse.json(
        { error: "Slides and prompt are required" },
        { status: 400 }
      );
    }

    // Credit cost: 4 credits per slide edited
    const CREDIT_PER_SLIDE = 4;
    const totalCreditCost = slides.length * CREDIT_PER_SLIDE;
    
    if (user.credits < totalCreditCost) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          required: totalCreditCost,
          available: user.credits,
        },
        { status: 403 }
      );
    }

    // Deduct credits upfront
    await db.user.update({
      where: { id: user.id },
      data: { credits: { decrement: totalCreditCost } },
    });

    // Invalidate cache
    const { serverCache } = await import("~/lib/server-cache");
    serverCache.invalidatePattern(`user-${user.id}`);

    const creditsRemaining = user.credits - totalCreditCost;

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Send start event
          sendEvent("start", { totalSlides: slides.length, creditsRemaining, creditCost: totalCreditCost });

          const systemPrompt = `You are an expert presentation editor and designer. Your job is to COMPLETELY and PRECISELY edit presentations based on user instructions.

## PRESENTATION CONTEXT:
Title: ${presentationTitle}
Total Slides: ${slides.length}

## CURRENT CONTENT:
${context}

## AVAILABLE LAYOUTS:

### Content Layouts (contentLayout field):
These control how content items are displayed on a slide.

**Box Cards** (best for 3-6 items with labels):
${CONTENT_LAYOUTS.boxes.join(", ")}

**Steps & Process** (best for sequential content, 3-6 steps):
${CONTENT_LAYOUTS.steps.join(", ")}

**Bullet Points** (best for simple lists, 3-8 items):
${CONTENT_LAYOUTS.bullets.join(", ")}

**Quotes & Testimonials** (best for 1-3 quotes):
${CONTENT_LAYOUTS.quotes.join(", ")}

**Circular Layouts** (best for 3-6 interconnected concepts):
${CONTENT_LAYOUTS.circles.join(", ")}

**Sequence & Timeline** (best for 3-6 chronological items):
${CONTENT_LAYOUTS.sequence.join(", ")}

### Slide Layouts (slideLayout field):
These control image positioning on the slide.
${SLIDE_LAYOUTS.join(", ")}

### Image Sizes (imageSize field):
${IMAGE_SIZES.join(", ")}

## CRITICAL EDITING RULES:

### When user asks to CHANGE THE TOPIC (e.g., "change to programming", "make it about X"):
1. COMPLETELY REWRITE all titles to match the new topic
2. COMPLETELY REWRITE all bulletPoints with new content about the new topic
3. ALWAYS include "imageSearch" for EVERY content slide with relevant search terms for the NEW topic
4. Remove ALL references to the old topic - check every word
5. The presentation should look like it was originally created for the new topic

### When user asks to IMPROVE or EDIT existing content:
1. Keep the same topic but improve the writing
2. Edit bulletPoints to be more professional/engaging
3. Only change images if specifically requested

### When user mentions specific slides (e.g., "slide 3", "page 5"):
1. Only edit those specific slides
2. Keep all other slides EXACTLY as they are

### When user asks about LAYOUTS:
1. You can change contentLayout to any of the available content layouts listed above
2. You can change slideLayout to control image positioning
3. You can change imageSize to control image size
4. Match the layout to the content type (e.g., use steps layouts for processes, quotes layouts for testimonials)

## SLIDE TYPES:
1. "title" slides (slide 1): Contains title, subtitle, tagline. CAN have images via imageSearch.
2. "content" slides (slides 2+): MUST have bulletPoints array OR sections array. Can have images.

## SECTIONS vs BULLETPOINTS:
- Slides can have content in different formats: bulletPoints, sections, or transformedContent
- When editing, ALWAYS provide bulletPoints array - the system will convert it to the right format
- Use "Label: Description" format for labeled items (e.g., "Step 1: Do this thing")
- The system will automatically parse and display the content correctly

## RESPONSE FORMAT:
Return JSON with "slides" array containing ALL ${slides.length} slides.

For TITLE slides (can include imageSearch for background):
{
  "type": "title",
  "title": "New Presentation Title",
  "subtitle": "New subtitle",
  "tagline": "New tagline",
  "imageSearch": "relevant background image search term"
}

For CONTENT slides (ALWAYS use bulletPoints for content):
{
  "type": "content",
  "title": "New Slide Title",
  "bulletPoints": ["Label 1: Description text here", "Label 2: Another description", "Label 3: More content"],
  "imageSearch": "relevant search term for new topic",
  "contentLayout": "box-style-1",
  "slideLayout": "image-right",
  "imageSize": "medium"
}

## IMAGE SEARCH GUIDELINES:
- Use descriptive, specific terms: "python programming code laptop", "software developer coding", "data structures algorithms"
- Match the slide's specific content, not just the general topic
- For programming: "coding laptop developer", "software engineering team", "computer science concept"

## ABSOLUTE RULES:
1. Return ONLY valid JSON
2. Return ALL ${slides.length} slides
3. When changing topics, EVERY slide must have NEW content - no old topic references
4. Content slides MUST have bulletPoints array
5. When changing topics, ALWAYS include imageSearch for content slides
6. NO HTML tags
7. Use appropriate contentLayout based on content type
8. Keep content concise - slides should be scannable, not walls of text`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `User request: "${prompt}"

CRITICAL INSTRUCTIONS:
1. If this is a TOPIC CHANGE request:
   - Rewrite ALL titles and ALL bulletPoints for the new topic
   - Include "imageSearch" for EVERY slide with terms relevant to the NEW topic
   - Remove ALL references to the old topic - every single word must be about the new topic

2. Return ALL ${slides.length} slides as JSON.

3. For ALL content slides, use bulletPoints array with format: "Label: Description"
   Example: ["Variables: Store data values", "Functions: Reusable code blocks", "Loops: Repeat actions"]

4. Title slides can have imageSearch for background images.` },
            ],
            response_format: { type: "json_object" },
            max_tokens: 4000,
            temperature: 0.7,
          });

          const responseText = completion.choices[0]?.message?.content?.trim() || "{}";
          
          let result: { slides?: SlideContent[] };
          try {
            result = JSON.parse(responseText);
          } catch {
            sendEvent("error", { message: "Failed to parse AI response" });
            controller.close();
            return;
          }

          if (!result.slides || !Array.isArray(result.slides)) {
            sendEvent("error", { message: "Invalid AI response format" });
            controller.close();
            return;
          }

          // Process each slide and stream updates
          for (let i = 0; i < result.slides.length; i++) {
            const aiSlide = result.slides[i]!;
            const originalSlide: SlideContent = slides[i] ?? { title: "" };
            const isFirstSlide = i === 0;
            const isTitleSlide = aiSlide.type === "title" || originalSlide.type === "title" || isFirstSlide;
            
            // Send processing event
            sendEvent("slideProcessing", { slideIndex: i, title: aiSlide.title });

            // For title slides, allow images and preserve more content
            if (isTitleSlide) {
              const titleSlide: SlideContent = {
                type: "title",
                title: aiSlide.title || originalSlide.title,
                subtitle: aiSlide.subtitle !== undefined ? aiSlide.subtitle : originalSlide.subtitle,
                tagline: aiSlide.tagline !== undefined ? aiSlide.tagline : originalSlide.tagline,
                // Preserve existing image unless AI requests change
                image: originalSlide.image,
              };
              
              // Handle image search for title slides too
              if (aiSlide.imageSearch) {
                sendEvent("slideImageLoading", { slideIndex: i, searchTerm: aiSlide.imageSearch });
                try {
                  const photos = await searchPexelsPhotos(aiSlide.imageSearch, 5);
                  if (photos.length > 0) {
                    const photo = photos[Math.floor(Math.random() * photos.length)]!;
                    titleSlide.image = {
                      url: photo.src.large,
                      alt: photo.alt || aiSlide.imageSearch,
                      photographer: photo.photographer,
                      photographerUrl: photo.photographer_url,
                      source: "pexels",
                    };
                  }
                } catch (err) {
                  console.error("Failed to fetch title image:", err);
                }
              }
              
              // Send completed title slide
              sendEvent("slideComplete", { slideIndex: i, slide: titleSlide });
            } else {
              // For content slides, merge with original preserving structure
              const mergedSlide: SlideContent = {
                ...originalSlide,
                type: "content",
                title: aiSlide.title || originalSlide.title,
                subtitle: aiSlide.subtitle !== undefined ? aiSlide.subtitle : originalSlide.subtitle,
                introText: aiSlide.introText !== undefined ? aiSlide.introText : originalSlide.introText,
                // Keep original image unless AI requests change
                image: originalSlide.image,
                images: originalSlide.images,
              };
              // BulletPoints - prefer AI's version if provided
              // This is the primary content field - we always update transformedContent from it
              if (aiSlide.bulletPoints && aiSlide.bulletPoints.length > 0) {
                mergedSlide.bulletPoints = aiSlide.bulletPoints;
                // Also update transformedContent to match new bulletPoints
                // This ensures the rendered content updates
                mergedSlide.transformedContent = {
                  intro: aiSlide.introText || originalSlide.introText || undefined,
                  items: aiSlide.bulletPoints.map(bp => {
                    // Parse "Label: Text" format if present
                    const colonIndex = bp.indexOf(':');
                    if (colonIndex > 0 && colonIndex < 40) {
                      return {
                        label: bp.substring(0, colonIndex).trim(),
                        text: bp.substring(colonIndex + 1).trim(),
                      };
                    }
                    return { text: bp };
                  }),
                };
                // Clear sections since we're using bulletPoints
                mergedSlide.sections = undefined;
              } else if (originalSlide.bulletPoints && originalSlide.bulletPoints.length > 0) {
                // Keep original bulletPoints
                mergedSlide.bulletPoints = originalSlide.bulletPoints;
              } else if (originalSlide.transformedContent?.items && originalSlide.transformedContent.items.length > 0) {
                // If original only has transformedContent, convert to bulletPoints for consistency
                mergedSlide.bulletPoints = originalSlide.transformedContent.items.map(item => 
                  item.label ? `${item.label}: ${item.text}` : item.text
                );
              }
              
              // Sections for card layouts - only use if AI explicitly provides them
              if (aiSlide.sections && aiSlide.sections.length > 0) {
                mergedSlide.sections = aiSlide.sections;
                // Convert sections to transformedContent format
                mergedSlide.transformedContent = {
                  intro: aiSlide.introText || originalSlide.introText || undefined,
                  items: aiSlide.sections.map(sec => ({
                    label: sec.heading,
                    text: sec.description,
                  })),
                };
              }
              
              // Layout options
              mergedSlide.layout = aiSlide.layout || originalSlide.layout;
              mergedSlide.slideLayout = aiSlide.slideLayout || originalSlide.slideLayout;
              mergedSlide.imageSize = aiSlide.imageSize || originalSlide.imageSize;
              mergedSlide.contentLayout = aiSlide.contentLayout || originalSlide.contentLayout;

              // Validate and apply layout
              if (mergedSlide.layout) {
                const validLayout = slideLayouts.find(l => l.id === mergedSlide.layout);
                if (!validLayout) delete mergedSlide.layout;
              }

              // Validate slideLayout
              const validSlideLayouts = ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full", "no-image"];
              if (mergedSlide.slideLayout && !validSlideLayouts.includes(mergedSlide.slideLayout)) {
                delete mergedSlide.slideLayout;
              }

              // Validate imageSize
              const validImageSizes = ["small", "medium", "large", "full"];
              if (mergedSlide.imageSize && !validImageSizes.includes(mergedSlide.imageSize)) {
                delete mergedSlide.imageSize;
              }

              // Validate contentLayout
              const allContentLayouts = [
                ...CONTENT_LAYOUTS.boxes,
                ...CONTENT_LAYOUTS.steps,
                ...CONTENT_LAYOUTS.bullets,
                ...CONTENT_LAYOUTS.quotes,
                ...CONTENT_LAYOUTS.circles,
                ...CONTENT_LAYOUTS.sequence,
              ];
              if (mergedSlide.contentLayout && !allContentLayouts.includes(mergedSlide.contentLayout)) {
                delete mergedSlide.contentLayout;
              }

              // Handle image search (only for content slides)
              if (aiSlide.imageSearch) {
                sendEvent("slideImageLoading", { slideIndex: i, searchTerm: aiSlide.imageSearch });
                try {
                  const photos = await searchPexelsPhotos(aiSlide.imageSearch, 5);
                  if (photos.length > 0) {
                    const photo = photos[Math.floor(Math.random() * photos.length)]!;
                    mergedSlide.image = {
                      url: photo.src.large,
                      alt: photo.alt || aiSlide.imageSearch,
                      photographer: photo.photographer,
                      photographerUrl: photo.photographer_url,
                      source: "pexels",
                    };
                  }
                } catch (err) {
                  console.error("Failed to fetch image:", err);
                }
              }

              // Handle image removal
              if (aiSlide.removeImage) {
                mergedSlide.image = null;
              }

              // Send completed content slide
              sendEvent("slideComplete", { slideIndex: i, slide: mergedSlide });
            }

            // Small delay for visual effect
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Send completion event
          sendEvent("complete", { 
            success: true, 
            totalSlides: result.slides.length,
            creditsUsed: totalCreditCost,
            creditsRemaining,
          });

        } catch (error) {
          console.error("Streaming error:", error);
          sendEvent("error", { message: "Failed to edit presentation" });
        } finally {
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
  } catch (error) {
    console.error("AI edit presentation stream error:", error);
    return NextResponse.json(
      { error: "Failed to edit presentation" },
      { status: 500 }
    );
  }
}
