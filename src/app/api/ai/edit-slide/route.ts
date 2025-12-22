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
  sections?: Array<{ heading: string; description: string }>;
  introText?: string;
  tagline?: string;
  layout?: LayoutType;
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

    // AI slide editing costs 2 credits
    const CREDIT_COST = 2;
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
    const currentContent = `
Current slide content:
- Type: ${slide.type || "content"}
- Title: ${slide.title || "(no title)"}
${slide.subtitle ? `- Subtitle: ${slide.subtitle}` : ""}
${slide.tagline ? `- Tagline: ${slide.tagline}` : ""}
${slide.introText ? `- Intro Text: ${slide.introText}` : ""}
${slide.bullets && slide.bullets.length > 0 ? `- Bullet points:\n${slide.bullets.map((b, i) => `  ${i + 1}. ${b}`).join("\n")}` : ""}
${slide.sections && slide.sections.length > 0 ? `- Sections:\n${slide.sections.map((s, i) => `  ${i + 1}. ${s.heading}: ${s.description}`).join("\n")}` : ""}
- Current Layout: ${slide.layout || "default"}
- Has Image: ${slide.image ? "Yes" : "No"}
- Has Multiple Images: ${slide.images && slide.images.length > 0 ? `Yes (${slide.images.length})` : "No"}
`.trim();

    const systemPrompt = `You are an expert presentation editor with FULL control over slide content and design. You can modify ANY aspect of a slide based on user instructions.

## YOUR CAPABILITIES:
1. **Text Content**: Edit title, subtitle, tagline, introText, bullet points
2. **Sections**: Add/edit/remove card sections (heading + description pairs)
3. **Layout**: Change the slide layout to any available option
4. **Images**: Request new images by providing search terms, or remove existing images

## AVAILABLE LAYOUTS:
${JSON.stringify(layoutOptions, null, 2)}

## RESPONSE FORMAT:
Return a JSON object with the edited slide. Include ONLY the fields you want to change or keep.

### Required fields:
- "title": string (always include)

### Optional fields (include if relevant):
- "subtitle": string or null
- "tagline": string (short catchy phrase)
- "introText": string (intro paragraph before bullets)
- "bullets": string[] (bullet points array)
- "sections": array of {heading: string, description: string} for card layouts
- "layout": one of the layout IDs listed above
- "imageSearch": string (search term to find a new image - use descriptive terms like "team collaboration office" or "technology innovation")
- "removeImage": true (to remove the current image)

## IMPORTANT RULES:
1. Return ONLY valid JSON - no markdown, no explanation
2. Do NOT include HTML tags in text content
3. Keep content concise and suitable for presentation slides
4. When user asks for layout change, pick the most appropriate layout from the list
5. When user asks for images, provide a descriptive imageSearch term
6. For card/grid layouts, use the "sections" array with heading/description pairs
7. Match the number of sections to the layout (e.g., 3 sections for content-cards-3)
8. Be creative but professional

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
