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
} from "~/lib/presentation";
import { selectLayout, type LayoutSelectionContext } from "~/lib/presentation/smart-layout";
import { env } from "~/env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_MODELS } from "~/lib/ai/models";

const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

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
    // This is normal when user navigates away - not an actual error
    console.log(`[stream-content] sendEvent(${event}): client disconnected (normal)`);
    isClosed.value = true;
    return false;
  }
}

// Helper function to add a small delay for visual streaming effect
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Transformed content for a single slide (from the one batched request)
interface BatchSlideContent {
  subtitle?: string;
  tagline?: string;
  slideDescription?: string;
  introText?: string;
  bullets?: string[];
}

// Lenient JSON parse for the batched model response (strips code fences, trims to
// the outer object, and attempts a brace/bracket repair if the output truncated).
function parseBatchJson(text: string): { slides?: unknown[] } | null {
  let t = (text || "").trim();
  if (t.startsWith("```")) t = t.replace(/^```[a-zA-Z]*\s*/, "").replace(/```$/, "").trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) t = t.slice(first, last + 1);
  try {
    return JSON.parse(t) as { slides?: unknown[] };
  } catch {
    try {
      let repaired = t;
      const open = (repaired.match(/\{/g) || []).length;
      const close = (repaired.match(/\}/g) || []).length;
      const openB = (repaired.match(/\[/g) || []).length;
      const closeB = (repaired.match(/\]/g) || []).length;
      repaired += "]".repeat(Math.max(0, openB - closeB));
      repaired += "}".repeat(Math.max(0, open - close));
      return JSON.parse(repaired) as { slides?: unknown[] };
    } catch {
      return null;
    }
  }
}

// Generate slide-ready content for ALL slides in ONE request, returned as JSON
// and aligned back to the input order. Replaces the old per-slide LLM calls.
async function generateAllSlidesContent(
  slides: Array<{ type: string; title: string; subtitle?: string; bulletPoints?: string[] }>,
  options: { tone?: string; language?: string; textDensity?: string }
): Promise<BatchSlideContent[]> {
  const empty: BatchSlideContent[] = slides.map(() => ({}));
  if (!gemini || slides.length === 0) return empty;

  const densityGuidance: Record<string, string> = {
    minimal: "very brief — short phrases only",
    concise: "concise — one clear sentence per point",
    detailed: "detailed — 1-2 sentences per point",
    extensive: "comprehensive with examples",
  };

  // Compact spec to keep the single response within the output budget
  const slidesSpec = slides.map((s, i) => ({
    i,
    type: s.type,
    title: s.title,
    ...(s.subtitle ? { subtitle: s.subtitle } : {}),
    ...(s.bulletPoints && s.bulletPoints.length ? { bullets: s.bulletPoints } : {}),
  }));

  const prompt = `You are an expert presentation content writer. Transform EVERY outline slide below into slide-ready content in a SINGLE response.

Return ONLY a valid JSON object of this exact shape:
{ "slides": [ { "i": <slide index from input>, "subtitle"?: string, "tagline"?: string, "slideDescription"?: string, "bullets"?: string[] } ] }

Rules:
- Output exactly one entry per input slide, in the same order, each with the matching "i".
- TITLE slides: include "subtitle" (a compelling line that expands the title) and "tagline" (a short impactful phrase). No bullets.
- CONTENT slides: include "bullets" — transform EVERY outline bullet into one item formatted "ShortTitle — Description" where ShortTitle is a 2-5 word noun phrase (no colon), then the separator " — " (space, em dash, space), then a description of MAX 30 words expanded with real detail, context, or examples. Do not skip any bullet; keep descriptions within a slide roughly equal length. Optionally include "slideDescription": a 1-2 sentence factual statement (encyclopedia-style — never begin with "Exploring", "Understanding", "The key to", "Examining"); omit it if not needed.
- NEVER change slide titles.
- Tone: ${options.tone || "professional"}. Language: ${options.language || "English"}. Text density: ${densityGuidance[options.textDensity || "concise"] || densityGuidance.concise}.

INPUT SLIDES (JSON):
${JSON.stringify(slidesSpec)}`;

  try {
    const model = gemini.getGenerativeModel({
      model: AI_MODELS.content,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384,
        responseMimeType: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    const parsed = parseBatchJson(result.response.text());
    if (!parsed || !Array.isArray(parsed.slides)) {
      console.warn("[stream-content] Batch content parse failed; using original outline content");
      return empty;
    }

    const out: BatchSlideContent[] = slides.map(() => ({}));
    for (const raw of parsed.slides) {
      const entry = raw as Record<string, unknown>;
      const idx = typeof entry.i === "number" ? entry.i : -1;
      if (idx >= 0 && idx < out.length) {
        out[idx] = {
          subtitle: typeof entry.subtitle === "string" ? entry.subtitle : undefined,
          tagline: typeof entry.tagline === "string" ? entry.tagline : undefined,
          slideDescription: typeof entry.slideDescription === "string" ? entry.slideDescription : undefined,
          introText: typeof entry.introText === "string" ? entry.introText : undefined,
          bullets: Array.isArray(entry.bullets)
            ? entry.bullets.filter((b): b is string => typeof b === "string")
            : undefined,
        };
      }
    }
    return out;
  } catch (error) {
    console.error("[stream-content] Batch content generation failed:", error);
    return empty;
  }
}

// Emit the per-slide streaming events from already-generated batch content.
// Yields the same event shape the consumer loop expects (title/subtitle/tagline/
// slideDesc/intro/bullet) — no per-slide LLM call.
function* streamFromContent(
  slide: { type: string; title: string; subtitle?: string; bulletPoints?: string[] },
  content: BatchSlideContent
): Generator<{ type: string; content: string }> {
  // Title is fixed — never changed
  yield { type: "title", content: slide.title };

  if (slide.type === "title") {
    const subtitle = content.subtitle || slide.subtitle;
    if (subtitle) yield { type: "subtitle", content: subtitle };
    if (content.tagline) yield { type: "tagline", content: content.tagline };
    return;
  }

  // Content slide
  if (content.slideDescription) yield { type: "slideDesc", content: content.slideDescription };
  if (content.introText) yield { type: "intro", content: content.introText };

  const bullets = content.bullets && content.bullets.length ? content.bullets : (slide.bulletPoints || []);
  for (const b of bullets) {
    if (b && b.trim()) yield { type: "bullet", content: b };
  }
}

// LLM transformation for a single slide with character streaming
// Uses OpenAI first, Gemini as fallback (same as outline generation)
async function* streamSlideTransformation(
  slide: { type: string; title: string; subtitle?: string; bulletPoints?: string[] },
  slideIndex: number,
  totalSlides: number,
  options: { tone?: string; language?: string; textDensity?: string }
): AsyncGenerator<{ type: string; content: string }> {
  // First yield title (complete, not streamed)
  yield { type: "title", content: slide.title };
  
  // Check if we have any API keys
  if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) {
    // Fallback: simulate character-by-character streaming for original content
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
${slide.type === "content" ? "[SLIDE_DESC]OPTIONAL - A brief 1-2 sentence FACTUAL STATEMENT about the topic that appears between the title and content. Write DIRECT FACTS like Wikipedia, NOT descriptive phrases. FORBIDDEN PATTERNS - NEVER START WITH: 'Exploring...', 'Understanding...', 'The key to...', 'Examining...', 'Discovering...', 'The foundation of...'. CORRECT EXAMPLES: 'The Nile River spans 6,650 km across northeastern Africa.' or 'Climate change affects global temperatures through greenhouse gas emissions.' or 'Effective leadership requires clear communication and decisive action.' Write as if stating facts in an encyclopedia. Omit entirely if not needed.[/SLIDE_DESC]\n[BULLET]ShortTitle — Well-crafted detailed description (max 30 words, visually equal length)[/BULLET]\n[BULLET]ShortTitle — Well-crafted detailed description (max 30 words, visually equal length)[/BULLET]\n(continue for ALL ${slide.bulletPoints?.length || 0} outline bullets)" : ""}

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

  // Helper function to process streaming chunks and yield events
  const processChar = (
    char: string,
    currentTag: string,
    currentContent: string
  ): { tag: string; content: string; event?: { type: string; content: string } } => {
    let tag = currentTag;
    let content = currentContent + char;
    let event: { type: string; content: string } | undefined;

    // Check for tag openings (skip TITLE tag - we already yielded original title)
    if (content.endsWith("[TITLE]")) {
      tag = "skipTitle";
      content = "";
    } else if (content.endsWith("[SUBTITLE]")) {
      tag = "subtitle";
      content = "";
    } else if (content.endsWith("[TAGLINE]")) {
      tag = "tagline";
      content = "";
    } else if (content.endsWith("[SLIDE_DESC]")) {
      tag = "slideDesc";
      content = "";
    } else if (content.endsWith("[INTRO]")) {
      tag = "intro";
      content = "";
    } else if (content.endsWith("[BULLET]")) {
      tag = "bullet";
      content = "";
    } else if (content.endsWith("[SECTION_HEADING]")) {
      tag = "sectionHeading";
      content = "";
    } else if (content.endsWith("[SECTION_DESC]")) {
      tag = "sectionDesc";
      content = "";
    }
    // Check for tag closings
    else if (content.endsWith("[/TITLE]") || 
             content.endsWith("[/SUBTITLE]") ||
             content.endsWith("[/TAGLINE]") ||
             content.endsWith("[/SLIDE_DESC]") ||
             content.endsWith("[/INTRO]") ||
             content.endsWith("[/BULLET]") ||
             content.endsWith("[/SECTION_HEADING]") ||
             content.endsWith("[/SECTION_DESC]")) {
      // Remove the closing tag from content
      const tagLength = content.lastIndexOf("[/");
      const finalContent = content.slice(0, tagLength);
      // Skip yielding if it's a title tag (we already have the original)
      if (tag && tag !== "skipTitle" && finalContent) {
        event = { type: tag, content: finalContent };
      }
      tag = "";
      content = "";
    }
    // Yield character for streaming effect if we're in a tag (skip title)
    else if (tag && tag !== "skipTitle" && !content.includes("[")) {
      event = { type: `${tag}Char`, content: char };
    }

    return { tag, content, event };
  };

  // Try Gemini first, then OpenAI as fallback (same as outline generation)
  let useGeminiFallback = false;

  try {
    // Try Gemini first
    if (env.GEMINI_API_KEY) {
      try {
        console.log("[stream-content] Using Gemini API...");
        const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        const model = gemini.getGenerativeModel({
          model: "gemini-2.5-flash-lite",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        });

        const fullPrompt = `You are an expert presentation content writer. Transform outline content into presentation-ready content with well-crafted, detailed slide bullets.\n\n${prompt}`;
        
        const result = await model.generateContentStream(fullPrompt);

        let currentTag = "";
        let currentContent = "";

        for await (const chunk of result.stream) {
          const text = chunk.text() || "";
          if (!text) continue;

          for (const char of text) {
            const result = processChar(char, currentTag, currentContent);
            currentTag = result.tag;
            currentContent = result.content;
            if (result.event) {
              yield result.event;
            }
          }
        }
      } catch (geminiError) {
        console.warn("[stream-content] Gemini failed, falling back to OpenAI", geminiError);
        useGeminiFallback = true;
      }
    } else {
      useGeminiFallback = true;
    }

    // OpenAI fallback is disabled here; if Gemini failed, fall back to original content
    if (useGeminiFallback) {
      throw new Error("No API keys configured");
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
}export async function GET(
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
    // Data chart attached from spreadsheet analysis (Excel/CSV upload)
    chartData?: unknown;
  }> | undefined;
  const metadata = content?.metadata as { tone?: string; language?: string } | undefined;
  const imageSource = content?.imageSource as string | undefined;
  const imageModel = content?.imageModel as string | undefined;
  const imageArtStyle = content?.imageArtStyle as string | undefined;
  const customArtStyleText = content?.customArtStyleText as string | undefined;
  const textDensity = content?.textDensity as string | undefined;
  const streamingComplete = content?.streamingComplete as boolean | undefined;

  // Obfuscate imageModel to avoid exposing internal model details
  const obfuscatedImageModel = imageModel ? "pptmaster-image-engine" : undefined;
  
  console.log("[stream-content] Content parsed:", {
    imageSource,
    imageModel: obfuscatedImageModel, // Obfuscated for security
    imageArtStyle,
    customArtStyleText,
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
        
        // Initialize layout selection context for tracking across slides
        const layoutContext: LayoutSelectionContext = {
          slideIndex: 0,
          totalSlides: pendingSlides.length,
          previousLayouts: [],
          presentationTone: metadata?.tone || "professional",
          presentationLanguage: metadata?.language || "English",
          themeStyle: "professional",
          categoryUsage: new Map(),
          styleUsage: new Map(),
        };

        console.log(`[stream-content] Starting stream for ${pendingSlides.length} slides`);
        console.log(`[stream-content] Image source: ${imageSource}, Text density: ${textDensity}`);

        // Send start event
        if (!sendEvent(controller, "start", { totalSlides: pendingSlides.length }, isClosed)) {
          console.log("[stream-content] Client disconnected before start");
          return; // Client already disconnected
        }
        console.log("[stream-content] Sent start event");

        // Track image loading promises per slide (for parallel loading)
        const imagePromises: Promise<void>[] = [];

        // Generate ALL slide contents in ONE request, then organize them per slide below
        console.log(`[stream-content] Generating content for ${pendingSlides.length} slides in one request`);
        const batchContent = await generateAllSlidesContent(pendingSlides, {
          tone: metadata?.tone,
          language: metadata?.language,
          textDensity,
        });

        // Process each slide (text streaming from the batched content)
        console.log(`[stream-content] Starting to process ${pendingSlides.length} slides`);
        for (let i = 0; i < pendingSlides.length; i++) {
          if (isClosed.value) {
            console.log(`[stream-content] Client disconnected at slide ${i}`);
            break;
          }
          
          const slide = pendingSlides[i]!;
          console.log(`[stream-content] Processing slide ${i}/${pendingSlides.length}: "${slide.title}" (type: ${slide.type})`);
          
          // Check if this slide needs an image
          const needsImage = slide.type === "title" 
            ? (slide.image?.required ?? true) 
            : (slide.assets?.image?.required ?? false);

          // "No Images" mode: never reserve image space on client.
          const shouldHaveImageSlot = imageSource !== "no-images" && needsImage;
          
          // Send slide start
          const slideStartSent = sendEvent(controller, "slideStart", { 
            slideIndex: i, 
            type: slide.type,
            hasImage: shouldHaveImageSlot
          }, isClosed);
          
          if (!slideStartSent) {
            console.log(`[stream-content] Failed to send slideStart for slide ${i}`);
            break;
          }
          console.log(`[stream-content] Sent slideStart for slide ${i}`);

          // Start loading image for this slide immediately (in parallel with text streaming)
          if (needsImage && (imageSource === "stock-photos" || imageSource === "ai-generated")) {
            const imagePromise = (async () => {
              try {
                if (imageSource === "stock-photos") {
                  const slidesWithMetadata: SlideWithVisualMetadata[] = [{
                    type: slide.type as "title" | "content",
                    title: slide.title,
                    subtitle: slide.subtitle,
                    bulletPoints: slide.bulletPoints,
                    assets: slide.assets as SlideWithVisualMetadata["assets"],
                    image: slide.image as SlideWithVisualMetadata["image"],
                  }];

                  const fetchedImages = await fetchImagesForSlides(slidesWithMetadata);
                  const photo = fetchedImages.get(0);
                  
                  if (photo && !isClosed.value) {
                    const image = {
                      url: photo.src.large,
                      alt: photo.alt || slide.title,
                      photographer: photo.photographer,
                      photographerUrl: photo.photographer_url,
                      source: "pexels",
                    };
                    imageMap.set(i, image);
                    if (finalSlides[i]) {
                      finalSlides[i]!.image = image;
                    }
                    sendEvent(controller, "imageReady", { slideIndex: i, image }, isClosed);
                    console.log(`[stream-content] Image ready for slide ${i}`);
                  }
                } else if (imageSource === "ai-generated") {
                  console.log(`[stream-content] Generating AI image for slide ${i}, model: pptmaster-image-engine, artStyle: ${imageArtStyle}`);
                  const slidesWithMetadata = [{
                    type: slide.type,
                    title: slide.title,
                    assets: slide.assets,
                    image: slide.image,
                  }];

                  // Determine the effective art style to use
                  const effectiveArtStyle = imageArtStyle === "custom" && customArtStyleText 
                    ? customArtStyleText 
                    : imageArtStyle;

                  const generatedImages = await generateAIImages(
                    slidesWithMetadata as Parameters<typeof generateAIImages>[0], 
                    imageModel as Parameters<typeof generateAIImages>[1],
                    effectiveArtStyle
                  );

                  const result = generatedImages.get(0);
                  if (result && result.url && !isClosed.value) {
                    const image = {
                      url: result.url,
                      alt: result.alt || slide.title,
                      source: "ai",
                    };
                    imageMap.set(i, image);
                    if (finalSlides[i]) {
                      finalSlides[i]!.image = image;
                    }
                    sendEvent(controller, "imageReady", { slideIndex: i, image }, isClosed);
                    console.log(`[stream-content] AI image ready for slide ${i}`);
                  }
                }
              } catch (error) {
                console.error(`[stream-content] Error loading image for slide ${i}:`, error);
                // Don't throw - continue with other slides
              }
            })();
            imagePromises.push(imagePromise);
          }

          // Build slide data
          const slideData: Record<string, unknown> = {
            type: slide.type,
            title: "",
            bulletPoints: [],
          };

          // Attach a data chart (from analyzed Excel/CSV) when the slide carries one
          if (slide.chartData) {
            slideData.chart = slide.chartData;
          }

          // Emit transformed content for this slide from the single batched response
          console.log(`[stream-content] Emitting content for slide ${i}`);
          const streamGen = streamFromContent(slide, batchContent[i] ?? {});

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
          // SMART LAYOUT SELECTION
          // Uses the new smart layout selection system to jointly select:
          // - slideLayout (image position): left/right/top/bottom/no-image
          // - imageSize: small/medium/large
          // - contentLayout: specific style (e.g., "box-style-1", "sequence-style-2")
          // - contentLayoutCategory: category (e.g., "boxes", "sequence")
          // The system considers content analysis, LLM metadata, and presentation context
          // ==========================================
          
          // Update context for current slide
          layoutContext.slideIndex = i;
          
          // Perform smart layout selection
          const layoutSelection = await selectLayout({
            slide: {
              type: slide.type as "title" | "content",
              title: slideData.title as string,
              subtitle: slideData.subtitle as string | undefined,
              bulletPoints: slideData.bulletPoints as string[] | undefined,
              sections: slideData.sections as Array<{ heading: string; description: string }> | undefined,
              semanticIntent: (slide as { semanticIntent?: string }).semanticIntent,
              visualStrategy: (slide as { visualStrategy?: { pattern?: string } }).visualStrategy as { primary: string; pattern: string; emphasis: string } | undefined,
              contentLayoutHint: (slide as { contentLayoutHint?: string }).contentLayoutHint ||
                                 (slide as { contentLayout?: string }).contentLayout,
              // Convert image metadata to expected format
              image: slide.image ? {
                required: slide.image.required ?? true,
                orientation: "landscape" as const,
                pexelsPromptHint: "",
                aiPromptHint: "",
              } : undefined,
              assets: slide.assets ? {
                image: slide.assets.image ? {
                  required: slide.assets.image.required ?? false,
                  orientation: "landscape" as const,
                  pexelsPromptHint: "",
                  aiPromptHint: "",
                } : undefined,
              } : undefined,
            },
            context: layoutContext,
            options: {
              timeout: 50,
              enablePerformanceLogging: false,
              enableDebugLogging: true, // Enable debug logging to see layout decisions
            },
          });

          // Track selection for context (for next slides)
          layoutContext.previousLayouts.push({
            slideIndex: i,
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
            console.log(`[stream-content] Slide ${i}: Image overridden - ${imageOverrideReason}`);
            // Don't fetch image for this slide
            imageMap.delete(i);
          }

          // If user selected "placeholders", persist a placeholder image so the
          // slide continues to reserve the image area after streaming completes.
          // Also respect layout overrides (if image is overridden, do NOT include placeholder).
          if (imageSource === "placeholders" && needsImage && !imageWasOverridden) {
            slideData.image = {
              url: "",
              alt: "Image placeholder",
              source: "placeholder",
            };
          }

          // Apply selected layout to slide data
          // In "no-images" mode, always force a no-image layout so content uses full width.
          // Title slides stay layout-free so they render through TitleSlide
          // (theme signature / cover styles) with a full-bleed image backdrop.
          const effectiveSlideLayout = imageSource === "no-images" ? "no-image" : layoutSelection.slideLayout;
          slideData.slideLayout = slide.type === "title" ? undefined : effectiveSlideLayout;
          slideData.imageSize = layoutSelection.imageSize;
          slideData.imageShape = layoutSelection.imageShape;
          
          // Legacy layout for renderer compatibility
          slideData.layout = effectiveSlideLayout === "no-image" ? "no-image" : 
                            effectiveSlideLayout === "image-left" ? "image-left" :
                            effectiveSlideLayout === "image-right" ? "image-right" :
                            effectiveSlideLayout === "image-top" ? "image-top" :
                            effectiveSlideLayout === "image-bottom" ? "image-bottom" :
                            "no-image";
          
          // Content layout from smart selection
          slideData.contentLayout = layoutSelection.style;
          slideData.contentLayoutCategory = layoutSelection.category;

          // Send layout update immediately so placeholders appear in correct position
          sendEvent(controller, "layoutUpdate", {
            slideIndex: i,
            slideLayout: slide.type === "title" ? undefined : effectiveSlideLayout,
            contentLayout: layoutSelection.style,
            imageSize: layoutSelection.imageSize,
            imageShape: layoutSelection.imageShape,
          }, isClosed);

          finalSlides.push(slideData);
          sendEvent(controller, "slideComplete", { slideIndex: i, slide: slideData }, isClosed);
          console.log(`[stream-content] Slide ${i} fully complete, finalSlides count: ${finalSlides.length}`);
        }

        console.log(`[stream-content] All slides processed, finalSlides: ${finalSlides.length}`);

        // Wait for all images to finish loading (they've been processing in parallel)
        if (imagePromises.length > 0) {
          console.log(`[stream-content] Waiting for ${imagePromises.length} image(s) to finish loading...`);
          try {
            await Promise.all(imagePromises);
            console.log("[stream-content] All images finished loading");
          } catch (error) {
            console.error("[stream-content] Some images failed to load:", error);
            // Continue anyway - some images may have loaded successfully
          }
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
