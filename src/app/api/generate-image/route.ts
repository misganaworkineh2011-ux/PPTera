import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "~/server/db";
import { env } from "~/env";
import { CREDIT_COSTS } from "~/lib/credits";
import { serverCache } from "~/lib/server-cache";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, credits: true, subscriptionPlan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      prompt,
      model = "openai", // "openai" or "gemini"
      quality = "standard", // "standard" or "hd"
      size = "1024x1024", // "1024x1024", "1792x1024", "1024x1792"
      style = "vivid", // "vivid" or "natural" (OpenAI only)
      artStyle = "photo", // "illustration" | "photo" | "abstract" | "3d" | "line-art" | "custom"
      presentationId,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build enhanced prompt with art style
    const artStylePrompts: Record<string, string> = {
      "illustration": "Create a digital illustration style image with artistic brush strokes, vibrant colors, and a hand-drawn aesthetic. The image should look like a professional digital painting or illustration.",
      "photo": "Create a photorealistic image that looks like a professional photograph with natural lighting, realistic textures, and high detail.",
      "abstract": "Create an abstract artistic image with geometric shapes, flowing patterns, bold colors, and modern artistic composition. Focus on visual impact rather than literal representation.",
      "3d": "Create a 3D rendered image with depth, realistic lighting, shadows, and a polished CGI aesthetic. The image should look like a professional 3D render.",
      "line-art": "Create a minimalist line art style image with clean black lines on white background, simple elegant strokes, and a sketch-like quality. Focus on outlines and contours.",
      "custom": "", // No style modification for custom
    };

    const stylePrefix = artStylePrompts[artStyle] || "";
    const enhancedPrompt = stylePrefix 
      ? `${stylePrefix}\n\nSubject: ${prompt}`
      : prompt;

    // Determine credit cost based on model and quality
    let creditCost: number;
    
    // Map model to credit cost
    const modelCreditMap: Record<string, { standard: number; hd: number }> = {
      "gemini-2.5-flash-image": { 
        standard: CREDIT_COSTS.GEMINI_FLASH, 
        hd: CREDIT_COSTS.GEMINI_FLASH_HD 
      },
      "gemini-3-pro-image-preview": { 
        standard: CREDIT_COSTS.GEMINI_PRO, 
        hd: CREDIT_COSTS.GEMINI_PRO_HD 
      },
      "imagen-4.0-generate-001": { 
        standard: CREDIT_COSTS.IMAGEN_4, 
        hd: CREDIT_COSTS.IMAGEN_4_ULTRA 
      },
      "imagen-4.0-ultra-generate-001": { 
        standard: CREDIT_COSTS.IMAGEN_4_ULTRA, 
        hd: CREDIT_COSTS.IMAGEN_4_ULTRA 
      },
      "imagen-4.0-fast-generate-001": { 
        standard: CREDIT_COSTS.IMAGEN_4_FAST, 
        hd: CREDIT_COSTS.IMAGEN_4_FAST 
      },
      "openai": { 
        standard: CREDIT_COSTS.DALLE_STANDARD, 
        hd: CREDIT_COSTS.DALLE_HD 
      },
      "openai-hd": { 
        standard: CREDIT_COSTS.DALLE_HD, 
        hd: CREDIT_COSTS.GPT_IMAGE_DETAILED 
      },
      "gpt-image": { 
        standard: CREDIT_COSTS.GPT_IMAGE_DETAILED, 
        hd: CREDIT_COSTS.GPT_IMAGE_DETAILED 
      },
      // Legacy support
      "gemini": { 
        standard: CREDIT_COSTS.GEMINI_FLASH, 
        hd: CREDIT_COSTS.GEMINI_FLASH_HD 
      },
    };
    
    const defaultCredits = { standard: CREDIT_COSTS.DALLE_STANDARD, hd: CREDIT_COSTS.DALLE_HD };
    const modelCredits = modelCreditMap[model] ?? defaultCredits;
    creditCost = quality === "hd" ? modelCredits.hd : modelCredits.standard;

    // Check if user has enough credits
    if (user.credits < creditCost) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: creditCost,
          available: user.credits,
          model,
          quality,
        },
        { status: 403 }
      );
    }

    console.log("[Image Generation] Generating image:", {
      prompt: prompt.substring(0, 50) + "...",
      artStyle,
      model,
      quality,
      size,
      style,
      creditCost,
    });

    let imageUrl: string;
    let revisedPrompt: string | undefined;

    if (model === "gemini") {
      // Gemini Imagen - uses DALL-E 3 with natural style as Gemini's image API
      // is not yet publicly available. Credit cost is lower for Gemini option.
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: size as "1024x1024" | "1792x1024" | "1024x1792",
        quality: quality as "standard" | "hd",
        style: "natural", // Gemini-style: more natural/realistic
        response_format: "url",
      });

      imageUrl = response.data?.[0]?.url || "";
      revisedPrompt = response.data?.[0]?.revised_prompt;
    } else {
      // Generate with OpenAI DALL-E 3
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: size as "1024x1024" | "1792x1024" | "1024x1792",
        quality: quality as "standard" | "hd",
        style: style as "vivid" | "natural",
        response_format: "url",
      });

      imageUrl = response.data?.[0]?.url || "";
      revisedPrompt = response.data?.[0]?.revised_prompt;
    }

    if (!imageUrl) {
      throw new Error("No image URL returned");
    }

    // Deduct credits and log activity in transaction
    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { credits: { decrement: creditCost } },
      }),
      db.activity.create({
        data: {
          userId: user.id,
          type: "image_generate",
          description: `Generated ${quality === "hd" ? "HD " : ""}AI image (${model === "gemini" ? "Gemini" : "DALL-E 3"})`,
          presentationId: presentationId || null,
          metadata: {
            creditsUsed: creditCost,
            model,
            quality,
            size,
            artStyle,
            promptPreview: prompt.substring(0, 100),
          },
        },
      }),
    ]);

    // Invalidate user cache
    serverCache.invalidatePattern(`user-${user.id}`);

    // Optionally save image to database
    let savedImage = null;
    if (presentationId) {
      savedImage = await db.image.create({
        data: {
          url: imageUrl,
          filename: `ai-generated-${Date.now()}.png`,
          userId: user.id,
          presentationId,
        },
      });
    }

    console.log("[Image Generation] Success:", {
      userId: user.id,
      model,
      creditsUsed: creditCost,
      remainingCredits: updatedUser.credits,
    });

    return NextResponse.json({
      success: true,
      image: {
        url: imageUrl,
        revisedPrompt,
        model,
        quality,
        size,
        id: savedImage?.id,
      },
      credits: {
        used: creditCost,
        remaining: updatedUser.credits,
      },
    });
  } catch (error: any) {
    console.error("[Image Generation] Error:", error);

    // Handle OpenAI specific errors
    if (error?.error?.code === "content_policy_violation") {
      return NextResponse.json(
        {
          error: "Content policy violation",
          message: "Your prompt was rejected. Please try a different description.",
        },
        { status: 400 }
      );
    }

    if (error?.error?.code === "rate_limit_exceeded") {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again in a moment.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Image generation failed" },
      { status: 500 }
    );
  }
}
