import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "~/server/db";
import { env } from "~/env";
import { searchPexelsPhotos } from "~/lib/pexels";
import { slideLayouts, type LayoutType } from "~/lib/slide-layouts";

const gemini = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

// Helper to clean and parse JSON from AI responses (handles markdown fences)
function parseAIJson<T>(responseText: string): T {
  let jsonText = responseText.trim();
  
  // Remove markdown code fences if present (```json ... ``` or ``` ... ```)
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
  }
  
  // Extract JSON from first { to last } (handles extra text before/after)
  const firstBrace = jsonText.indexOf("{");
  const lastBrace = jsonText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonText = jsonText.slice(firstBrace, lastBrace + 1);
  }
  
  return JSON.parse(jsonText);
}

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
  speakerNotes?: string[];
  sections?: Array<{ heading: string; description: string }>;
  introText?: string;
  tagline?: string;
  layout?: LayoutType;
  slideLayout?: string;
  imageSize?: string;
  image?: SlideImage | null;
  images?: SlideImage[];
  imageSearch?: string;
  removeImage?: boolean;
}

interface EditRequest {
  presentationId: string;
  presentationTitle: string;
  slides: SlideContent[];
  prompt: string;
  context: string;
}

// Build layout options for AI
const layoutOptions = slideLayouts.map(l => ({
  id: l.id,
  name: l.name,
  description: l.description,
  category: l.category,
}));

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

    // Editing entire presentation costs 5 credits
    const CREDIT_COST = 5;
    if (user.credits < CREDIT_COST) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          required: CREDIT_COST,
          available: user.credits,
        },
        { status: 403 }
      );
    }

    const { presentationTitle, slides, prompt, context } = await req.json() as EditRequest;

    if (!slides || !prompt) {
      return NextResponse.json(
        { error: "Slides and prompt are required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert presentation editor. You have full context of the entire presentation and can edit any or all slides based on user instructions.

## PRESENTATION CONTEXT:
Title: ${presentationTitle}
Total Slides: ${slides.length}

## CURRENT CONTENT:
${context}

## YOUR CAPABILITIES:
1. Edit text content (titles, subtitles, bullet points, sections)
2. Improve writing quality, fix grammar, translate
3. Make content longer or shorter
4. Add more specific details or simplify language
5. Restructure content across slides
6. Change slide layouts to better present content
7. Request new images by providing descriptive search terms
8. Add or remove images from slides

## AVAILABLE LAYOUTS:
${JSON.stringify(layoutOptions, null, 2)}

## SLIDE LAYOUT OPTIONS (for slideLayout field):
- "image-left": Image on left, content on right
- "image-right": Image on right, content on left  
- "image-top": Image on top, content below
- "image-bottom": Content on top, image below
- "image-background": Full background image with text overlay
- "image-full": Full slide image only
- "no-image": No image, content only

## IMAGE SIZE OPTIONS (for imageSize field):
- "small": 30% of slide
- "medium": 40% of slide (default)
- "large": 50% of slide
- "full": 60% of slide

## RESPONSE FORMAT:
Return a JSON object with a "slides" array containing ALL slides (even unchanged ones).
Each slide should have:
- "type": "title" or "content"
- "title": string (required)
- "subtitle": string (optional, for title slides)
- "bulletPoints": string[] (optional, for content slides)
- "sections": array of {heading, description} (optional, for card layouts)
- "layout": one of the layout IDs above (optional, to change content layout)
- "slideLayout": one of the slide layout options above (optional, to change image position)
- "imageSize": one of the image size options above (optional)
- "imageSearch": string (optional - descriptive search term to find a new image, e.g., "modern office teamwork collaboration")
- "removeImage": boolean (optional - set to true to remove existing image)

## IMPORTANT RULES:
1. Return ONLY valid JSON - no markdown, no explanation
2. Include ALL slides in the response, even if unchanged
3. Preserve slide types (title/content) unless specifically asked to change
4. Keep content concise and suitable for presentations
5. Do NOT include HTML tags in text
6. When improving writing, maintain the original meaning
7. For translations, translate ALL text content
8. When adding images, use descriptive search terms like "business meeting professional" or "technology innovation abstract"
9. For card layouts (content-cards-2, content-cards-3, content-grid-3, etc.), use the "sections" array with heading/description pairs
10. Match the number of sections to the layout (e.g., 3 sections for content-cards-3)

Example response format:
{
  "slides": [
    {"type": "title", "title": "...", "subtitle": "...", "imageSearch": "professional business presentation"},
    {"type": "content", "title": "...", "bulletPoints": ["...", "..."], "layout": "content-cards-3", "sections": [{"heading": "Point 1", "description": "Details..."}, ...]}
  ]
}`;

    let responseText: string;
    
    // Try Gemini first
    if (gemini) {
      try {
        console.log("[edit-presentation] Using Gemini API...");
        const model = gemini.getGenerativeModel({ 
          model: "gemini-2.5-flash-lite",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
            responseMimeType: "application/json",
          },
        });

        const geminiPrompt = `${systemPrompt}\n\nUser's edit request: "${prompt}"\n\nEdit the presentation according to this request. Return ALL slides as JSON.`;
        const result = await model.generateContent(geminiPrompt);
        const response = await result.response;
        responseText = response.text()?.trim() || "{}";
      } catch (geminiError) {
        console.warn("[edit-presentation] Gemini failed, falling back to OpenAI:", geminiError);
        // Fallback to OpenAI
        throw new Error("OpenAI fallback disabled");
        
      }
    } else {
      // No Gemini, use OpenAI
      throw new Error("OpenAI fallback disabled");
      
    }
    
    let result: { slides?: SlideContent[] };
    try {
      result = parseAIJson<{ slides?: SlideContent[] }>(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, "Response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    if (!result.slides || !Array.isArray(result.slides)) {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    // Process each slide - handle image requests and validate layouts
    const processedSlides = await Promise.all(
      result.slides.map(async (slide, index) => {
        // Preserve original slide data and merge with AI edits
        const originalSlide = slides[index] || {};
        const mergedSlide = { ...originalSlide, ...slide };

        // Validate layout if provided
        if (slide.layout) {
          const validLayout = slideLayouts.find(l => l.id === slide.layout);
          if (!validLayout) {
            delete mergedSlide.layout; // Remove invalid layout
          }
        }

        // Validate slideLayout if provided
        const validSlideLayouts = ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full", "no-image"];
        if (slide.slideLayout && !validSlideLayouts.includes(slide.slideLayout)) {
          delete mergedSlide.slideLayout;
        }

        // Validate imageSize if provided
        const validImageSizes = ["small", "medium", "large", "full"];
        if (slide.imageSize && !validImageSizes.includes(slide.imageSize)) {
          delete mergedSlide.imageSize;
        }

        // Handle image search if requested
        if (slide.imageSearch) {
          try {
            const photos = await searchPexelsPhotos(slide.imageSearch, 5);
            if (photos.length > 0) {
              const photo = photos[Math.floor(Math.random() * photos.length)]!;
              mergedSlide.image = {
                url: photo.src.large,
                alt: photo.alt || slide.imageSearch,
                photographer: photo.photographer,
                photographerUrl: photo.photographer_url,
                source: "pexels",
              };
            }
            delete mergedSlide.imageSearch;
          } catch (err) {
            console.error("Failed to fetch image:", err);
            delete mergedSlide.imageSearch;
          }
        }

        // Handle image removal
        if (slide.removeImage) {
          mergedSlide.image = null;
          delete mergedSlide.removeImage;
        }

        return mergedSlide;
      })
    );

    // Deduct credits
    await db.user.update({
      where: { id: user.id },
      data: { credits: { decrement: CREDIT_COST } },
    });

    // Invalidate cache
    const { serverCache } = await import("~/lib/server-cache");
    serverCache.invalidatePattern(`user-${user.id}`);

    return NextResponse.json({ 
      success: true,
      slides: processedSlides,
      creditsUsed: CREDIT_COST,
      creditsRemaining: user.credits - CREDIT_COST,
    });
  } catch (error) {
    console.error("AI edit presentation error:", error);
    return NextResponse.json(
      { error: "Failed to edit presentation" },
      { status: 500 }
    );
  }
}

