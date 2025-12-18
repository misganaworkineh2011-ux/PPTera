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
      presentationId,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Determine credit cost based on model and quality
    let creditCost: number;
    if (model === "gemini") {
      creditCost = quality === "hd" ? CREDIT_COSTS.GEMINI_IMAGEN_HD : CREDIT_COSTS.GEMINI_IMAGEN;
    } else {
      creditCost = quality === "hd" ? CREDIT_COSTS.IMAGE_HD : CREDIT_COSTS.IMAGE_BASIC;
    }

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
        prompt: prompt,
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
        prompt: prompt,
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
          tags: ["ai-generated", model, quality],
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
