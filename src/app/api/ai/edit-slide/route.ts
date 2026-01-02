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

interface SlideContent {
  type?: "title" | "content";
  title: string;
  subtitle?: string;
  bullets?: string[];
  bulletPoints?: string[];
  sections?: Array<{ heading: string; description: string }>;
  introText?: string;
  tagline?: string;
  layout?: LayoutType;
  slideLayout?: string;
  imageSize?: string;
  image?: SlideImage | null;
  images?: SlideImage[];
  // AI can request image search
  imageSearch?: string;
  // AI can request to remove image
  removeImage?: boolean;
}

// Available layouts for AI reference
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

    // AI slide editing costs 4 credits per slide
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

    const { slide, prompt } = await req.json() as { 
      slide: SlideContent;
      prompt: string;
    };

    if (!slide || !prompt) {
      return NextResponse.json(
        { error: "Slide content and prompt are required" },
        { status: 400 }
      );
    }

    // Build comprehensive slide content description
    const isTitleSlide = slide.type === "title";
    const bulletPointsContent = slide.bulletPoints || slide.bullets || [];
    
    const currentContent = `
Current slide content:
- Type: ${slide.type || "content"}
- Title: ${slide.title || "(no title)"}
${slide.subtitle ? `- Subtitle: ${slide.subtitle}` : ""}
${slide.tagline ? `- Tagline: ${slide.tagline}` : ""}
${slide.introText ? `- Intro Text: ${slide.introText}` : ""}
${bulletPointsContent.length > 0 ? `- Bullet points (MAIN CONTENT):\n${bulletPointsContent.map((b, i) => `  ${i + 1}. ${b}`).join("\n")}` : ""}
${slide.sections && slide.sections.length > 0 ? `- Sections:\n${slide.sections.map((s, i) => `  ${i + 1}. ${s.heading}: ${s.description}`).join("\n")}` : ""}
- Current Layout: ${slide.layout || "default"}
- Has Image: ${slide.image ? "Yes" : "No"}
`.trim();

    const systemPrompt = `You are an expert presentation editor. Edit this ${isTitleSlide ? "TITLE" : "CONTENT"} slide based on user instructions.

## SLIDE TYPE: ${isTitleSlide ? "TITLE SLIDE" : "CONTENT SLIDE"}
${isTitleSlide ? "Title slides should NOT have images, slideLayout, or bulletPoints." : "Content slides MUST have bulletPoints - this is the main text content."}

## YOUR CAPABILITIES:
1. **Text Content**: Edit title, subtitle, ${isTitleSlide ? "tagline" : "bulletPoints (MAIN CONTENT), introText"}
${!isTitleSlide ? `2. **Layout**: Change the slide layout
3. **Images**: Request new images by providing search terms
4. **Image Position**: Change where the image appears` : ""}

${!isTitleSlide ? `## AVAILABLE CONTENT LAYOUTS:
${JSON.stringify(layoutOptions.slice(0, 8), null, 2)}

## SLIDE LAYOUT OPTIONS (slideLayout field):
- "image-left", "image-right", "image-top", "image-bottom", "no-image"

## IMAGE SIZE OPTIONS (imageSize field):
- "small" (30%), "medium" (40%), "large" (50%), "full" (60%)` : ""}

## RESPONSE FORMAT:
Return a JSON object with the edited slide.

${isTitleSlide ? `For TITLE slides:
{
  "type": "title",
  "title": "Presentation Title",
  "subtitle": "Optional subtitle",
  "tagline": "Optional tagline"
}` : `For CONTENT slides:
{
  "type": "content",
  "title": "Slide Title",
  "bulletPoints": ["Point 1", "Point 2", "Point 3"],  // REQUIRED - main content
  "subtitle": "Optional",
  "introText": "Optional intro paragraph",
  "slideLayout": "image-right",
  "imageSearch": "search term for new image"
}`}

## CRITICAL RULES:
1. Return ONLY valid JSON
2. ${isTitleSlide ? "Do NOT add bulletPoints, slideLayout, or images to title slides" : "ALWAYS include bulletPoints array - this is the main content text"}
3. When improving writing, ${isTitleSlide ? "improve the title and subtitle" : "improve the bulletPoints text, not just the title"}
4. NO HTML tags

${currentContent}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `User's edit request: "${prompt}"\n\nEdit the slide according to this request. Return the complete updated slide as JSON.`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "{}";
    
    let editedSlide: SlideContent;
    try {
      editedSlide = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Validate the response has at least a title
    if (!editedSlide.title) {
      editedSlide.title = slide.title;
    }

    // Handle image search if requested
    if (editedSlide.imageSearch) {
      try {
        const photos = await searchPexelsPhotos(editedSlide.imageSearch, 5);
        if (photos.length > 0) {
          const photo = photos[Math.floor(Math.random() * photos.length)]!;
          editedSlide.image = {
            url: photo.src.large,
            alt: photo.alt || editedSlide.imageSearch,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            source: "pexels",
          };
        }
        // Remove the search term from response
        delete editedSlide.imageSearch;
      } catch (err) {
        console.error("Failed to fetch image:", err);
      }
    }

    // Handle image removal
    if (editedSlide.removeImage) {
      editedSlide.image = null;
      delete editedSlide.removeImage;
    }

    // Validate layout if provided
    if (editedSlide.layout) {
      const validLayout = slideLayouts.find(l => l.id === editedSlide.layout);
      if (!validLayout) {
        delete editedSlide.layout; // Remove invalid layout
      }
    }

    // Validate slideLayout if provided
    const validSlideLayouts = ["image-left", "image-right", "image-top", "image-bottom", "image-background", "image-full", "no-image"];
    if (editedSlide.slideLayout && !validSlideLayouts.includes(editedSlide.slideLayout)) {
      delete editedSlide.slideLayout;
    }

    // Validate imageSize if provided
    const validImageSizes = ["small", "medium", "large", "full"];
    if (editedSlide.imageSize && !validImageSizes.includes(editedSlide.imageSize)) {
      delete editedSlide.imageSize;
    }

    // Convert bullets to bulletPoints if needed
    if (editedSlide.bullets && !editedSlide.bulletPoints) {
      editedSlide.bulletPoints = editedSlide.bullets;
      delete editedSlide.bullets;
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
      slide: editedSlide,
      creditsUsed: CREDIT_COST,
      creditsRemaining: user.credits - CREDIT_COST,
    });
  } catch (error) {
    console.error("AI edit slide error:", error);
    return NextResponse.json(
      { error: "Failed to edit slide" },
      { status: 500 }
    );
  }
}
