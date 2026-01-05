/**
 * Stream presentation content generation
 * 
 * This endpoint streams the LLM-transformed content for a presentation
 * that was created with streaming=true mode.
 */

import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { fetchImagesForSlides, type SlideWithVisualMetadata } from "~/lib/pexels";
import {
  generateImagesForSlides as generateAIImages,
  planSlideLayout,
  extractPlannerInput,
} from "~/lib/presentation";
import { env } from "~/env.js";

function parseTitledBullet(bullet: string): { label?: string; text: string } {
  const trimmed = bullet.trim();
  // Prefer the new format: "Title — description"
  const emDashSep = " — ";
  const emIdx = trimmed.indexOf(emDashSep);
  if (emIdx > 0) {
    const label = trimmed.slice(0, emIdx).trim();
    const text = trimmed.slice(emIdx + emDashSep.length).trim();
    return { label: label || undefined, text: text || trimmed };
  }
  // Fallback: "Title - description"
  const dashSep = " - ";
  const dashIdx = trimmed.indexOf(dashSep);
  if (dashIdx > 0) {
    const label = trimmed.slice(0, dashIdx).trim();
    const text = trimmed.slice(dashIdx + dashSep.length).trim();
    return { label: label || undefined, text: text || trimmed };
  }
  // Final fallback: infer a short label from first 2-4 words
  const words = trimmed.split(/\s+/).filter(Boolean);
  const labelWords = words.slice(0, Math.min(4, Math.max(2, Math.ceil(words.length / 4))));
  const label = labelWords.join(" ");
  const text = words.slice(labelWords.length).join(" ") || trimmed;
  return { label: label || undefined, text };
}

// Helper to send SSE events safely (silently fails if controller is closed)
function sendEvent(
  controller: ReadableStreamDefaultController, 
  event: string, 
  data: unknown,
  isClosed: { value: boolean }
): boolean {
  if (isClosed.value) {
    console.log(`[stream-content] sendEvent(${event}): skipped, already closed`);
    return false;
  }
  try {
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    return true;
  } catch (error) {
    // Controller is closed (client disconnected), mark as closed and return false
    console.log(`[stream-content] sendEvent(${event}): ERROR - client disconnected`, error);
    isClosed.value = true;
    return false;
  }
}

// Helper function to add a small delay for visual streaming effect
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// LLM transformation for a single slide with character streaming
async function* streamSlideTransformation(
  slide: { type: string; title: string; subtitle?: string; bulletPoints?: string[] },
  slideIndex: number,
  totalSlides: number,
  options: { tone?: string; language?: string; textDensity?: string }
): AsyncGenerator<{ type: string; content: string }> {
  const apiKey = env.GEMINI_API_KEY;
  
  if (!apiKey) {
    // Fallback: simulate character-by-character streaming for original content
    // First yield title (complete, not streamed)
    yield { type: "title", content: slide.title };
    
    // Stream subtitle character by character with small delay
    if (slide.subtitle) {
      for (const char of slide.subtitle) {
        yield { type: "subtitleChar", content: char };
        await delay(10); // Small delay for visual effect
      }
      yield { type: "subtitle", content: slide.subtitle };
    }
    
    // Stream bullet points character by character
    if (slide.bulletPoints) {
      for (const bp of slide.bulletPoints) {
        for (const char of bp) {
          yield { type: "bulletChar", content: char };
          await delay(5); // Faster for bullets
        }
        yield { type: "bullet", content: bp };
      }
    }
    return;
  }

  const densityGuidance: Record<string, string> = {
    minimal: "Keep content very brief - short phrases only",
    concise: "Keep content concise - one clear sentence per point",
    detailed: "Provide detailed explanations - 1-2 sentences per point",
    extensive: "Provide comprehensive content with examples"
  };

  const prompt = `Transform this outline slide into SLIDE-READY content. Stream your response naturally.

SLIDE ${slideIndex + 1} of ${totalSlides}:
Type: ${slide.type}
Original Title: ${slide.title}
${slide.subtitle ? `Subtitle: ${slide.subtitle}` : ""}
${slide.bulletPoints ? `Bullet Points:\n${slide.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join("\n")}` : ""}

CRITICAL REQUIREMENTS:
- Transform ALL ${slide.bulletPoints?.length || 0} outline bullets - do not skip or omit any
- Each generated bullet must be well-crafted and detailed, expanding on the outline with context, examples, implications
- Maximum 30 words per bullet description
- All bullets should have visually similar length (approximately equal word count) for visual balance
- EXPAND and ELABORATE on the outline bullets - add context, examples, implications, causes, effects, or specific details
- Make the generated content MORE detailed and explanatory than the outline

REQUIREMENTS:
- Tone: ${options.tone || "professional"}
- Language: ${options.language || "English"}  
- Text Density: ${densityGuidance[options.textDensity || "concise"]}
- Slide bullets: Maximum 30 words each, visually equal length, well-crafted with expanded detail

CRITICAL: DO NOT change the slide title. Keep it EXACTLY as provided: "${slide.title}"

OUTPUT FORMAT (respond with these exact markers):
${slide.type === "title" ? "[SUBTITLE]Enhanced subtitle that expands on the title[/SUBTITLE]\n[TAGLINE]Short impactful phrase[/TAGLINE]" : ""}
${slide.type === "content" ? "[SLIDE_DESC]OPTIONAL - natural 1-2 line description of the topic itself (omit if not needed, max 2 lines). Write directly about the topic, NOT about the slide. NEVER use: 'This slide highlights', 'This slide covers', 'In this slide'. INSTEAD write: 'Understanding the core principles...', 'Exploring key factors...'[/SLIDE_DESC]\n[INTRO]Optional intro sentence to set context[/INTRO]\n[BULLET]ShortTitle — Well-crafted detailed description (max 30 words, visually equal length)[/BULLET]\n[BULLET]ShortTitle — Well-crafted detailed description (max 30 words, visually equal length)[/BULLET]\n(continue for ALL ${slide.bulletPoints?.length || 0} outline bullets)" : ""}

CONTENT SLIDE BULLET RULES (IMPORTANT):
- Transform ALL ${slide.bulletPoints?.length || 0} outline bullets - none should be skipped
- Each outline bullet must become ONE slide item with TWO parts:
  - ShortTitle: 2–5 words, noun phrase (no colon), suitable as a card title
  - Description: Maximum 30 words, visually equal length across all bullets, expand with more detail, context, examples, implications
- Use this exact separator between title and description: " — " (space, em dash, space)
- Keep descriptions within a slide roughly similar length so cards look balanced
- Avoid the forbidden pattern "Title: description" (no colons)
- EXPAND on the outline - add more detail, not less

Transform each outline bullet into a clean, balanced slide item with a title + detailed description (card-ready).
DO NOT output any [TITLE] tag - the title is fixed and will not change.`;

  try {
    // First, yield the original title immediately (titles are never changed)
    yield { type: "title", content: slide.title };

    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent";
    
    const response = await fetch(`${apiUrl}?key=${apiKey}&alt=sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentTag = "";
    let currentContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Parse SSE data from Gemini
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            // Process character by character for streaming effect
            for (const char of text) {
              currentContent += char;
              
              // Check for tag openings (skip TITLE tag - we already yielded original title)
              if (currentContent.endsWith("[TITLE]")) {
                currentTag = "skipTitle"; // Skip any title the LLM might output
                currentContent = "";
              } else if (currentContent.endsWith("[SUBTITLE]")) {
                currentTag = "subtitle";
                currentContent = "";
              } else if (currentContent.endsWith("[TAGLINE]")) {
                currentTag = "tagline";
                currentContent = "";
              } else if (currentContent.endsWith("[SLIDE_DESC]")) {
                currentTag = "slideDesc";
                currentContent = "";
              } else if (currentContent.endsWith("[INTRO]")) {
                currentTag = "intro";
                currentContent = "";
              } else if (currentContent.endsWith("[BULLET]")) {
                currentTag = "bullet";
                currentContent = "";
              } else if (currentContent.endsWith("[SECTION_HEADING]")) {
                currentTag = "sectionHeading";
                currentContent = "";
              } else if (currentContent.endsWith("[SECTION_DESC]")) {
                currentTag = "sectionDesc";
                currentContent = "";
              }
              // Check for tag closings
              else if (currentContent.endsWith("[/TITLE]") || 
                       currentContent.endsWith("[/SUBTITLE]") ||
                       currentContent.endsWith("[/TAGLINE]") ||
                       currentContent.endsWith("[/SLIDE_DESC]") ||
                       currentContent.endsWith("[/INTRO]") ||
                       currentContent.endsWith("[/BULLET]") ||
                       currentContent.endsWith("[/SECTION_HEADING]") ||
                       currentContent.endsWith("[/SECTION_DESC]")) {
                // Remove the closing tag from content
                const tagLength = currentContent.lastIndexOf("[/");
                const finalContent = currentContent.slice(0, tagLength);
                // Skip yielding if it's a title tag (we already have the original)
                if (currentTag && currentTag !== "skipTitle" && finalContent) {
                  yield { type: currentTag, content: finalContent };
                }
                currentTag = "";
                currentContent = "";
              }
              // Yield character for streaming effect if we're in a tag (skip title)
              else if (currentTag && currentTag !== "skipTitle" && !currentContent.includes("[")) {
                yield { type: `${currentTag}Char`, content: char };
              }
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    // Yield any remaining content (skip if it's title)
    if (currentTag && currentTag !== "skipTitle" && currentContent && !currentContent.includes("[")) {
      yield { type: currentTag, content: currentContent };
    }
  } catch (error) {
    console.error(`[stream-content] Error streaming slide ${slideIndex}:`, error);
    // Fallback to original content (title already yielded at start)
    if (slide.subtitle) yield { type: "subtitle", content: slide.subtitle };
    if (slide.bulletPoints) {
      for (const bp of slide.bulletPoints) {
        yield { type: "bullet", content: bp };
      }
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id: presentationId } = await params;

  // Get presentation with pending content
  const presentation = await db.presentation.findUnique({
    where: { id: presentationId },
    include: { user: true },
  });

  if (!presentation) {
    return new Response(JSON.stringify({ error: "Presentation not found" }), { status: 404 });
  }

  // Verify ownership
  const user = await db.user.findFirst({ where: { clerkId: userId } });
  if (!user || presentation.userId !== user.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }

  // Get pending content from presentation content field
  const content = presentation.content as Record<string, unknown>;
  const pendingSlides = content?.pendingSlides as Array<{
    type: string;
    title: string;
    subtitle?: string;
    bulletPoints?: string[];
    assets?: { image?: { required?: boolean }; icons?: string[]; chart?: unknown };
    image?: { required?: boolean };
    visualStrategy?: { pattern?: string };
    semanticIntent?: string;
    contentLayoutHint?: string;
    // Back-compat: older outlines may have used `contentLayout`
    contentLayout?: string;
  }> | undefined;
  const metadata = content?.metadata as { tone?: string; language?: string } | undefined;
  const imageSource = content?.imageSource as string | undefined;
  const textDensity = content?.textDensity as string | undefined;
  const streamingComplete = content?.streamingComplete as boolean | undefined;

  console.log("[stream-content] Content parsed:", {
    imageSource,
    textDensity,
    streamingComplete,
    hasPendingSlides: !!pendingSlides,
    pendingSlidesCount: pendingSlides?.length,
    outlineId: content?.outlineId,
    outlineIdType: typeof content?.outlineId,
  });

  // If streaming is already complete, return the existing slides
  if (streamingComplete) {
    const existingSlides = presentation.slides as unknown[];
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: complete\ndata: ${JSON.stringify({ slides: existingSlides })}\n\n`));
        controller.close();
      }
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  if (!pendingSlides || pendingSlides.length === 0) {
    // Return SSE error event instead of JSON
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "No pending content" })}\n\n`));
        controller.close();
      }
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const isClosed = { value: false };
      
      try {
        const finalSlides: Record<string, unknown>[] = [];
        // Store images separately to merge at the end (since they load in parallel)
        const imageMap = new Map<number, Record<string, unknown>>();

        console.log(`[stream-content] Starting stream for ${pendingSlides.length} slides`);
        console.log(`[stream-content] Image source: ${imageSource}, Text density: ${textDensity}`);

        // Send start event
        if (!sendEvent(controller, "start", { totalSlides: pendingSlides.length }, isClosed)) {
          console.log("[stream-content] Client disconnected before start");
          return; // Client already disconnected
        }
        console.log("[stream-content] Sent start event");

        // Start image fetching in parallel (don't await - let it run alongside text streaming)
        let imagePromise: Promise<void> | null = null;
        if (imageSource === "stock-photos" || imageSource === "ai-generated") {
          const slidesNeedingImages = pendingSlides
            .map((slide, index) => ({ slide, index }))
            .filter(({ slide }) => {
              if (slide.type === "title") return slide.image?.required ?? true;
              return slide.assets?.image?.required ?? false;
            });

          if (slidesNeedingImages.length > 0) {
            sendEvent(controller, "imagesStart", { count: slidesNeedingImages.length }, isClosed);

            // Process images in parallel batches
            imagePromise = (async () => {
              const BATCH_SIZE = 4;
              for (let i = 0; i < slidesNeedingImages.length; i += BATCH_SIZE) {
                if (isClosed.value) break; // Stop if controller is closed
                
                const batch = slidesNeedingImages.slice(i, i + BATCH_SIZE);
                
                if (imageSource === "stock-photos") {
                  const slidesWithMetadata: SlideWithVisualMetadata[] = batch.map(({ slide }) => ({
                    type: slide.type as "title" | "content",
                    title: slide.title,
                    subtitle: slide.subtitle,
                    bulletPoints: slide.bulletPoints,
                    assets: slide.assets as SlideWithVisualMetadata["assets"],
                    image: slide.image as SlideWithVisualMetadata["image"],
                  }));

                  const fetchedImages = await fetchImagesForSlides(slidesWithMetadata);

                  let mapIndex = 0;
                  for (const { index } of batch) {
                    if (isClosed.value) break;
                    const photo = fetchedImages.get(mapIndex);
                    if (photo) {
                      const image = {
                        url: photo.src.large,
                        alt: photo.alt || pendingSlides[index]!.title,
                        photographer: photo.photographer,
                        photographerUrl: photo.photographer_url,
                        source: "pexels",
                      };
                      // Store in imageMap for later merging
                      imageMap.set(index, image);
                      // Also update finalSlides if it exists
                      if (finalSlides[index]) {
                        finalSlides[index]!.image = image;
                      }
                      sendEvent(controller, "imageReady", { slideIndex: index, image }, isClosed);
                    }
                    mapIndex++;
                  }
                } else if (imageSource === "ai-generated") {
                  console.log("[stream-content] Generating AI images for batch:", batch.map(b => b.index));
                  const slidesWithMetadata = batch.map(({ slide }) => ({
                    type: slide.type,
                    title: slide.title,
                    assets: slide.assets,
                    image: slide.image,
                  }));

                  const generatedImages = await generateAIImages(slidesWithMetadata as Parameters<typeof generateAIImages>[0]);
                  console.log("[stream-content] Generated images count:", generatedImages.size);

                  let mapIndex = 0;
                  for (const { index } of batch) {
                    if (isClosed.value) break;
                    const result = generatedImages.get(mapIndex);
                    console.log(`[stream-content] Image result for slide ${index}:`, {
                      hasResult: !!result,
                      hasUrl: !!result?.url,
                      source: result?.source,
                    });
                    if (result && result.url) {
                      const image = {
                        url: result.url,
                        alt: result.alt || pendingSlides[index]!.title,
                        source: "ai",
                      };
                      // Store in imageMap for later merging
                      imageMap.set(index, image);
                      console.log(`[stream-content] Stored image in imageMap for slide ${index}`);
                      // Also update finalSlides if it exists
                      if (finalSlides[index]) {
                        finalSlides[index]!.image = image;
                        console.log(`[stream-content] Updated finalSlides[${index}] with image`);
                      }
                      sendEvent(controller, "imageReady", { slideIndex: index, image }, isClosed);
                    }
                    mapIndex++;
                  }
                }
              }
            })();
          }
        }

        // Process each slide (text streaming)
        console.log(`[stream-content] Starting to process ${pendingSlides.length} slides`);
        for (let i = 0; i < pendingSlides.length; i++) {
          if (isClosed.value) {
            console.log(`[stream-content] Client disconnected at slide ${i}`);
            break;
          }
          
          const slide = pendingSlides[i]!;
          console.log(`[stream-content] Processing slide ${i}/${pendingSlides.length}: "${slide.title}" (type: ${slide.type})`);
          
          // Send slide start
          const slideStartSent = sendEvent(controller, "slideStart", { 
            slideIndex: i, 
            type: slide.type,
            hasImage: slide.type === "title" ? (slide.image?.required ?? true) : (slide.assets?.image?.required ?? false)
          }, isClosed);
          
          if (!slideStartSent) {
            console.log(`[stream-content] Failed to send slideStart for slide ${i}`);
            break;
          }
          console.log(`[stream-content] Sent slideStart for slide ${i}`);

          // Build slide data
          const slideData: Record<string, unknown> = {
            type: slide.type,
            title: "",
            bulletPoints: [],
          };

          // Stream transformed content
          console.log(`[stream-content] Starting transformation for slide ${i}`);
          const streamGen = streamSlideTransformation(
            slide,
            i,
            pendingSlides.length,
            { tone: metadata?.tone, language: metadata?.language, textDensity }
          );

          let chunkCount = 0;
          for await (const chunk of streamGen) {
            if (isClosed.value) {
              console.log(`[stream-content] Client disconnected during slide ${i} streaming`);
              break;
            }
            
            chunkCount++;
            // Only log every 50th chunk to avoid spam
            if (chunkCount % 50 === 0 || !chunk.type.endsWith("Char")) {
              console.log(`[stream-content] Slide ${i} chunk ${chunkCount}:`, chunk.type, chunk.content?.substring(0, 30));
            }
            
            if (chunk.type === "titleChar" || chunk.type === "subtitleChar" || 
                chunk.type === "taglineChar" || chunk.type === "slideDescChar" ||
                chunk.type === "introChar" || chunk.type === "bulletChar") {
              // Stream individual characters
              sendEvent(controller, "char", { 
                slideIndex: i, 
                field: chunk.type.replace("Char", ""),
                char: chunk.content 
              }, isClosed);
            } else if (chunk.type === "title") {
              slideData.title = chunk.content;
              sendEvent(controller, "fieldComplete", { slideIndex: i, field: "title", value: chunk.content }, isClosed);
            } else if (chunk.type === "subtitle") {
              slideData.subtitle = chunk.content;
              sendEvent(controller, "fieldComplete", { slideIndex: i, field: "subtitle", value: chunk.content }, isClosed);
            } else if (chunk.type === "tagline") {
              slideData.tagline = chunk.content;
              sendEvent(controller, "fieldComplete", { slideIndex: i, field: "tagline", value: chunk.content }, isClosed);
            } else if (chunk.type === "slideDesc") {
              slideData.slideDescription = chunk.content;
              sendEvent(controller, "fieldComplete", { slideIndex: i, field: "slideDescription", value: chunk.content }, isClosed);
            } else if (chunk.type === "intro") {
              slideData.introText = chunk.content;
              sendEvent(controller, "fieldComplete", { slideIndex: i, field: "introText", value: chunk.content }, isClosed);
            } else if (chunk.type === "bullet") {
              (slideData.bulletPoints as string[]).push(chunk.content);
              sendEvent(controller, "bulletComplete", { 
                slideIndex: i, 
                bulletIndex: (slideData.bulletPoints as string[]).length - 1,
                value: chunk.content 
              }, isClosed);
            }
          }
          
          console.log(`[stream-content] Slide ${i} transformation complete: ${chunkCount} chunks, title: "${slideData.title}"`);
          
          if (isClosed.value) break; // Stop if client disconnected

          // Build transformedContent items (label + text) from the titled bullet format.
          // This is what most of your content layouts render nicely (boxes, bullets, steps, etc.).
          if (slide.type === "content") {
            const bullets = (slideData.bulletPoints as string[] | undefined) || [];
            slideData.transformedContent = {
              intro: (slideData.introText as string | undefined) || undefined,
              items: bullets.map(parseTitledBullet),
            };
          }

          // ==========================================
          // SMART LAYOUT PLANNING (applied after bullets are known)
          // This is the key fix: previously this endpoint always forced box layouts.
          // Now we compute slideLayout + contentLayout using the planner, using:
          // - transformed bullets (for density)
          // - outline hints (contentLayoutHint, semanticIntent, visualStrategy)
          // - image requirements (assets.image.required / title image.required)
          // ==========================================
          try {
            const plannerInput = extractPlannerInput(
              {
                type: slide.type === "title" ? "title" : "content",
                title: slideData.title as string | undefined,
                bulletPoints: slideData.bulletPoints as string[] | undefined,
                semanticIntent: (slide as { semanticIntent?: string }).semanticIntent,
                visualStrategy: (slide as { visualStrategy?: { pattern?: string } }).visualStrategy,
                assets: slide.assets,
                image: slide.image,
                contentLayoutHint:
                  (slide as { contentLayoutHint?: string }).contentLayoutHint ||
                  (slide as { contentLayout?: string }).contentLayout,
              },
              i,
              pendingSlides.length
            );

            const plan = await planSlideLayout(plannerInput);

            // Canonical image placement fields
            slideData.slideLayout = plan.slideLayout;
            slideData.imageSize = plan.imageSize;

            // Legacy layout string (SlideRenderer understands this too)
            slideData.layout = plan.legacyLayout;

            // Content layout choice (this is what prevents “boxes only”)
            slideData.contentLayout = plan.contentLayout;
            slideData.contentLayoutCategory = plan.contentLayoutCategory;
          } catch (e) {
            console.warn("[stream-content] Layout planner failed, falling back to defaults:", e);
            // If planner fails, keep legacy behavior: centered if no image, else left/right.
            const hasImage = slide.type === "title" ? (slide.image?.required ?? true) : (slide.assets?.image?.required ?? false);
            slideData.layout = hasImage ? (i % 2 === 0 ? "right-content" : "left-content") : "centered";
            slideData.contentLayout = "box-style-1";
            slideData.contentLayoutCategory = "boxes";
          }

          finalSlides.push(slideData);
          sendEvent(controller, "slideComplete", { slideIndex: i, slide: slideData }, isClosed);
          console.log(`[stream-content] Slide ${i} fully complete, finalSlides count: ${finalSlides.length}`);
        }

        console.log(`[stream-content] All slides processed, finalSlides: ${finalSlides.length}`);

        // Wait for images to finish loading (they've been processing in parallel)
        if (imagePromise) {
          console.log("[stream-content] Waiting for images to finish loading...");
          await imagePromise;
          console.log("[stream-content] Images finished loading");
        }

        // Merge images from imageMap into finalSlides (in case they weren't set during streaming)
        console.log("[stream-content] Merging images from imageMap. imageMap size:", imageMap.size);
        for (const [index, image] of imageMap) {
          console.log(`[stream-content] imageMap entry ${index}:`, {
            url: (image as { url?: string }).url?.substring(0, 50),
            source: (image as { source?: string }).source,
          });
          if (finalSlides[index] && !finalSlides[index]!.image) {
            finalSlides[index]!.image = image;
            console.log(`[stream-content] Merged image into slide ${index}`);
          } else if (finalSlides[index]?.image) {
            console.log(`[stream-content] Slide ${index} already has image`);
          }
        }

        // Only save to database if we have slides (client might have disconnected early)
        if (finalSlides.length > 0) {
          // Update presentation with final slides
          const thumbnailUrl = (finalSlides[0]?.image as { url?: string })?.url || null;
          
          console.log("[stream-content] Saving presentation. Original content.outlineId:", content?.outlineId);
          
          await db.presentation.update({
            where: { id: presentationId },
            data: {
              slides: JSON.parse(JSON.stringify(finalSlides)),
              thumbnailUrl,
              content: JSON.parse(JSON.stringify({
                ...content,
                pendingSlides: undefined, // Clear pending
                streamingComplete: true,
                // outlineId is already in content from the spread, no need to set it again
              })),
            },
          });
          
          console.log("[stream-content] Presentation saved successfully");

          // Save AI-generated images to the Image library for the user's dashboard
          if (imageSource === "ai-generated") {
            console.log("[stream-content] Checking for AI images to save...");
            console.log("[stream-content] finalSlides count:", finalSlides.length);
            
            try {
              const aiSlideImages = finalSlides
                .map((slide, index) => ({ slide, index }))
                .filter(({ slide }) => {
                  const img = slide.image as { source?: string; url?: string } | null;
                  console.log(`[stream-content] Slide image check:`, {
                    hasImage: !!img,
                    source: img?.source,
                    hasUrl: !!img?.url,
                  });
                  return img && img.source === "ai" && img.url;
                });

              console.log("[stream-content] AI images found:", aiSlideImages.length);

              if (aiSlideImages.length > 0) {
                const slug = presentation.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "presentation";
                await db.image.createMany({
                  data: aiSlideImages.map(({ slide, index }) => ({
                    url: (slide.image as { url: string }).url,
                    filename: `${slug}-slide-${index + 1}.png`,
                    userId: user.id,
                    presentationId: presentationId,
                  })),
                });
                console.log("[stream-content] Saved AI images to Image library:", aiSlideImages.length);
              } else {
                console.log("[stream-content] No AI images to save");
              }
            } catch (e) {
              console.error("[stream-content] Failed to save AI images to Image library:", e);
            }
          } else {
            console.log("[stream-content] Image source is not ai-generated:", imageSource);
          }
        }

        if (!isClosed.value) {
          sendEvent(controller, "complete", { slides: finalSlides }, isClosed);
          isClosed.value = true;
          controller.close();
        }
      } catch (error) {
        console.error("[stream-content] Error:", error);
        if (!isClosed.value) {
          sendEvent(controller, "error", { 
            message: error instanceof Error ? error.message : "Failed to generate content" 
          }, isClosed);
          isClosed.value = true;
          try {
            controller.close();
          } catch {
            // Already closed
          }
        }
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
