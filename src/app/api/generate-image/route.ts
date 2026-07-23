import { auth } from "~/lib/auth-server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { env } from "~/env";
import { CREDIT_COSTS } from "~/lib/credits";
import { serverCache } from "~/lib/server-cache";
import { generateGeminiImage, type ImageModelId } from "~/lib/presentation/generate-ai-image";
import { uploadImageFromDataUrl } from "~/lib/uploads/cloudinary";

/**
 * Upload image URL to Cloudinary (fetches and re-uploads)
 */
async function uploadUrlToCloudinary(imageUrl: string, model: string): Promise<string> {
  // If it's already a Cloudinary URL, return as-is
  if (imageUrl.includes("cloudinary.com") || imageUrl.includes("res.cloudinary")) {
    return imageUrl;
  }

  // If it's a data URL (base64), upload directly
  if (imageUrl.startsWith("data:")) {
    const result = await uploadImageFromDataUrl(imageUrl, {
      folder: "pptmaster/ai-images",
      tags: ["ai-generated", model, "dashboard"],
    });
    return result?.url || imageUrl;
  }

  // For external URLs (like OpenAI temporary URLs), fetch and re-upload
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn("[Cloudinary] Failed to fetch image URL:", response.status);
      return imageUrl;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/png";
    const dataUrl = `data:${contentType};base64,${base64}`;

    const result = await uploadImageFromDataUrl(dataUrl, {
      folder: "pptmaster/ai-images",
      tags: ["ai-generated", model, "dashboard"],
    });

    return result?.url || imageUrl;
  } catch (error) {
    console.error("[Cloudinary] Error uploading URL:", error);
    return imageUrl;
  }
}

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

    // Block free users from AI image generation
    const isFreeUser = !user.subscriptionPlan || user.subscriptionPlan === 'free';
    if (isFreeUser) {
      return NextResponse.json(
        {
          error: "Upgrade required",
          message: "AI image generation is only available for Plus, Pro, and Ultra plans. Upgrade to unlock this feature.",
          needsUpgrade: true,
        },
        { status: 403 }
      );
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
    
    // Map model to credit cost (Google models only)
    const modelCreditMap: Record<string, { standard: number; hd: number }> = {
      // Gemini models
      "gemini-2.5-flash-image": { 
        standard: CREDIT_COSTS.GEMINI_FLASH, 
        hd: CREDIT_COSTS.GEMINI_FLASH_HD 
      },
      "gemini-3-pro-image-preview": { 
        standard: CREDIT_COSTS.GEMINI_PRO, 
        hd: CREDIT_COSTS.GEMINI_PRO_HD 
      },
      // Imagen models
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
      // Legacy/Fallback
      "gemini": { 
        standard: CREDIT_COSTS.GEMINI_FLASH, 
        hd: CREDIT_COSTS.GEMINI_FLASH_HD 
      },
    };
    
    const defaultCredits = { standard: CREDIT_COSTS.GEMINI_FLASH, hd: CREDIT_COSTS.GEMINI_FLASH_HD };
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
      creditCost,
    });

    let imageUrl: string;
    let revisedPrompt: string | undefined;

    // Use the unified Google image generation function exclusively
    const result = await generateGeminiImage(
      enhancedPrompt,
      artStyle,
      model as ImageModelId,
      artStyle
    );
    
    if (result.error || !result.url) {
      throw new Error(result.error || "Failed to generate image with Google AI");
    }
    
    imageUrl = result.url;
    revisedPrompt = undefined; // Google models don't return revised prompts (currently)

    if (!imageUrl) {
      throw new Error("No image URL returned");
    }

    // Upload to Cloudinary for permanent storage
    console.log("[Image Generation] Uploading to Cloudinary...");
    const cloudinaryUrl = await uploadUrlToCloudinary(imageUrl, model);
    
    // Use Cloudinary URL if upload succeeded
    const finalImageUrl = cloudinaryUrl || imageUrl;

    // Get friendly model name for activity log
    const modelNames: Record<string, string> = {
      "gemini-2.5-flash-image": "Nano Banana",
      "gemini-3-pro-image-preview": "Nano Banana Pro",
      "imagen-4.0-generate-001": "Imagen 4",
      "imagen-4.0-ultra-generate-001": "Imagen 4 Ultra",
      "imagen-4.0-fast-generate-001": "Imagen 4 Fast",
    };
    const modelDisplayName = modelNames[model] || model;

    // Always save image to database for the user's image library
    const savedImage = await db.image.create({
      data: {
        url: finalImageUrl,
        filename: `ai-${model}-${Date.now()}.png`,
        userId: user.id,
        presentationId: presentationId || null,
      },
    });

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
          description: `Generated AI image (${modelDisplayName})`,
          presentationId: presentationId || null,
          metadata: {
            creditsUsed: creditCost,
            model,
            quality,
            size,
            artStyle,
            promptPreview: prompt.substring(0, 100),
            imageId: savedImage.id,
          },
        },
      }),
    ]);

    // Invalidate user cache
    serverCache.invalidatePattern(`user-${user.id}`);

    console.log("[Image Generation] Success:", {
      userId: user.id,
      model,
      creditsUsed: creditCost,
      remainingCredits: updatedUser.credits,
      imageId: savedImage.id,
      cloudinaryUrl: finalImageUrl !== imageUrl,
    });

    return NextResponse.json({
      success: true,
      image: {
        url: finalImageUrl,
        revisedPrompt,
        model,
        quality,
        size,
        id: savedImage.id,
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
