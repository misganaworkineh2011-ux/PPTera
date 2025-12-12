import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "~/server/db";
import { env } from "~/env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// Define slide limits by plan
const PLAN_SLIDE_LIMITS: Record<string, number> = {
  free: 10,
  starter: 20,
  pro: 50,
  enterprise: 70,
};

// Define valid slide options by plan
const getMaxSlidesForPlan = (plan: string | null | undefined): number => {
  if (!plan) return PLAN_SLIDE_LIMITS.free;
  const planLower = plan.toLowerCase();
  return PLAN_SLIDE_LIMITS[planLower] || PLAN_SLIDE_LIMITS.free;
};

// Validate requested slides against plan
const validateSlideCount = (
  requestedSlides: number,
  plan: string | null | undefined
): { valid: boolean; maxAllowed: number } => {
  const maxAllowed = getMaxSlidesForPlan(plan);
  return {
    valid: requestedSlides <= maxAllowed,
    maxAllowed,
  };
};

export async function POST(req: Request) {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to continue" },
        { status: 401 }
      );
    }

    // 2. Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "User account not found" },
        { status: 404 }
      );
    }

    // 3. Check credits
    if (user.credits < 1) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: "You don't have enough credits. Please purchase more credits or upgrade your plan.",
          credits: user.credits,
        },
        { status: 403 }
      );
    }

    // 4. Parse request body
    const body = await req.json();
    const { description, numberOfSlides, tone, language } = body;

    // 5. Validate required fields
    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Missing description", message: "Please provide a description of what you want to create" },
        { status: 400 }
      );
    }

    if (!numberOfSlides || numberOfSlides < 1) {
      return NextResponse.json(
        { error: "Invalid slides", message: "Please specify the number of slides" },
        { status: 400 }
      );
    }

    // 6. Validate slide count against user's plan
    const slideValidation = validateSlideCount(numberOfSlides, user.subscriptionPlan);
    if (!slideValidation.valid) {
      return NextResponse.json(
        {
          error: "Slide limit exceeded",
          message: `Your plan allows up to ${slideValidation.maxAllowed} slides. You requested ${numberOfSlides}.`,
          maxAllowed: slideValidation.maxAllowed,
          plan: user.subscriptionPlan || "free",
        },
        { status: 403 }
      );
    }

    // 7. Build the prompt for OpenAI
    const toneDescription = tone || "professional";
    const languageDescription = language || "english";
    const contentSlides = numberOfSlides - 1; // First slide is the title slide

    const systemPrompt = `You are an expert presentation creator and content strategist. Your task is to create a detailed presentation outline in JSON format.

The outline must be:
- Well-structured and logical
- Engaging and informative
- Written in ${languageDescription}
- Using a ${toneDescription} tone throughout

Output format must be a valid JSON object with a "slides" array.`;

    const userPrompt = `Create a presentation outline with exactly ${numberOfSlides} slides about: "${description}"

IMPORTANT RULES:
1. The FIRST slide must be a TITLE slide with:
   - "type": "title"
   - "title": A compelling, concise title for the presentation
   - "subtitle": A brief tagline or description (based on the user's input)

2. The remaining ${contentSlides} slides must be CONTENT slides, each with:
   - "type": "content"
   - "title": A clear, descriptive heading for that section
   - "bulletPoints": An array of 3-5 bullet points (strings), each point being concise but informative

3. Ensure the content flows logically from one slide to the next
4. Make the content specific and actionable, not generic
5. The language must be ${languageDescription}
6. The tone must be ${toneDescription}

Return ONLY a valid JSON object with this structure:
{
  "slides": [
    {
      "type": "title",
      "title": "Presentation Title",
      "subtitle": "Brief description"
    },
    {
      "type": "content",
      "title": "Slide Title",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"]
    }
    // ... more content slides
  ],
  "metadata": {
    "topic": "Main topic",
    "totalSlides": ${numberOfSlides},
    "tone": "${toneDescription}",
    "language": "${languageDescription}"
  }
}`;

    // 8. Generate outline with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      return NextResponse.json(
        { error: "Generation failed", message: "Failed to generate outline. Please try again." },
        { status: 500 }
      );
    }

    // 9. Parse the response
    let outline;
    try {
      outline = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      return NextResponse.json(
        { error: "Parse error", message: "Failed to process the generated outline. Please try again." },
        { status: 500 }
      );
    }

    // 10. Validate outline structure
    if (!outline.slides || !Array.isArray(outline.slides)) {
      return NextResponse.json(
        { error: "Invalid outline", message: "Generated outline has an invalid structure. Please try again." },
        { status: 500 }
      );
    }

    // 11. Deduct credits (only 1 credit for outline generation)
    await db.user.update({
      where: { id: user.id },
      data: { credits: user.credits - 1 },
    });

    // 12. Return the outline
    return NextResponse.json({
      success: true,
      outline: outline.slides,
      metadata: outline.metadata || {
        topic: description,
        totalSlides: numberOfSlides,
        tone: toneDescription,
        language: languageDescription,
      },
      creditsRemaining: user.credits - 1,
    });

  } catch (error) {
    console.error("Outline generation error:", error);
    
    // Check for specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: "API Error", message: "Failed to connect to AI service. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Generation failed", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

