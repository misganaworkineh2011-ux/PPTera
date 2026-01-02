import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "~/server/db";
import { env } from "~/env";
import { searchPexelsPhotos } from "~/lib/pexels";
import { type LayoutType, slideLayouts } from "~/lib/slide-layouts";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface SlideImage {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  source: string;
}

interface GeneratedSlide {
  type: "content";
  title: string;
  bulletPoints: string[];
  introText?: string;
  layout?: LayoutType;
  slideLayout?: string;
  imageSize?: string;
  imageSearch?: string;
  image?: SlideImage | null;
}

// Available layouts for AI reference
const layoutOptions = slideLayouts.slice(0, 10).map(l => ({
  id: l.id,
  name: l.name,
  description: l.description,
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

    // AI slide generation costs 4 credits
    const CREDIT_COST = 4;
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

    const { prompt, presentationContext, previousSlide, nextSlide } = await req.json() as { 
      prompt: string;
      presentationContext?: string;
      previousSlide?: { title: string; bulletPoints?: string[] };
      nextSlide?: { title: string; bulletPoints?: string[] };
    };

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const contextInfo = presentationContext 
      ? `\nPresentation topic: "${presentationContext}"`
      : "";
    
    const prevSlideInfo = previousSlide
      ? `\nPrevious slide: "${previousSlide.title}"${previousSlide.bulletPoints?.length ? ` with points: ${previousSlide.bulletPoints.slice(0, 3).join(", ")}` : ""}`
      : "";
    
    const nextSlideInfo = nextSlide
      ? `\nNext slide: "${nextSlide.title}"`
      : "";

    const systemPrompt = `You are an expert presentation designer. Create a single content slide based on the user's request.

## CONTEXT${contextInfo}${prevSlideInfo}${nextSlideInfo}

## AVAILABLE CONTENT LAYOUTS:
${JSON.stringify(layoutOptions, null, 2)}

## SLIDE LAYOUT OPTIONS (slideLayout field - controls image position):
- "image-left" - Image on left, content on right
- "image-right" - Image on right, content on left  
- "image-top" - Image on top, content below
- "image-bottom" - Content on top, image below
- "no-image" - No image, full content

## IMAGE SIZE OPTIONS (imageSize field):
- "small" (30%), "medium" (40%), "large" (50%)

## RESPONSE FORMAT:
Return a JSON object with the slide content:
{
  "type": "content",
  "title": "Slide Title",
  "bulletPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "introText": "Optional intro paragraph",
  "layout": "bullets",
  "slideLayout": "image-right",
  "imageSize": "medium",
  "imageSearch": "search term for relevant image from Pexels"
}

## RULES:
1. Return ONLY valid JSON
2. ALWAYS include bulletPoints array with 3-5 points
3. Make content professional and engaging
4. Choose appropriate layout based on content type
5. Include imageSearch with a descriptive term for finding a relevant image
6. NO HTML tags in content`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a slide: "${prompt}"` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "{}";
    
    let generatedSlide: GeneratedSlide;
    try {
      generatedSlide = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Ensure required fields
    generatedSlide.type = "content";
    if (!generatedSlide.title) {
      generatedSlide.title = "New Slide";
    }
    if (!generatedSlide.bulletPoints || generatedSlide.bulletPoints.length === 0) {
      generatedSlide.bulletPoints = ["Content point 1", "Content point 2", "Content point 3"];
    }

    // Fetch image from Pexels if search term provided
    if (generatedSlide.imageSearch) {
      try {
        const photos = await searchPexelsPhotos(generatedSlide.imageSearch, 5);
        if (photos.length > 0) {
          const photo = photos[Math.floor(Math.random() * photos.length)]!;
          generatedSlide.image = {
            url: photo.src.large,
            alt: photo.alt || generatedSlide.imageSearch,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            source: "pexels",
          };
        }
        delete generatedSlide.imageSearch;
      } catch (err) {
        console.error("Failed to fetch image:", err);
        delete generatedSlide.imageSearch;
      }
    }

    // Validate layout
    if (generatedSlide.layout) {
      const validLayout = slideLayouts.find(l => l.id === generatedSlide.layout);
      if (!validLayout) {
        generatedSlide.layout = "bullets" as LayoutType;
      }
    }

    // Validate slideLayout
    const validSlideLayouts = ["image-left", "image-right", "image-top", "image-bottom", "no-image"];
    if (generatedSlide.slideLayout && !validSlideLayouts.includes(generatedSlide.slideLayout)) {
      generatedSlide.slideLayout = generatedSlide.image ? "image-right" : "no-image";
    }

    // Validate imageSize
    const validImageSizes = ["small", "medium", "large", "full"];
    if (generatedSlide.imageSize && !validImageSizes.includes(generatedSlide.imageSize)) {
      generatedSlide.imageSize = "medium";
    }

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
      slide: generatedSlide,
      creditsUsed: CREDIT_COST,
      creditsRemaining: user.credits - CREDIT_COST,
    });
  } catch (error) {
    console.error("AI generate slide error:", error);
    return NextResponse.json(
      { error: "Failed to generate slide" },
      { status: 500 }
    );
  }
}
