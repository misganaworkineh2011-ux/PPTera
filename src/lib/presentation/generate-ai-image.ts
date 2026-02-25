/**
 * AI Image Generation Utility
 * 
 * Generates images using Google's Generative AI API.
 * Supports:
 * 1. Imagen 4 models (dedicated text-to-image): Use generateImages endpoint
 * 2. Gemini Image models (multimodal): Use generateContent with responseModalities
 */

import { env } from "~/env";
import type { ImageResult, SlideImage } from "./types";
import { uploadImageFromDataUrl } from "~/lib/uploads/cloudinary";

// Supported image generation models (as of January 2026)
export type ImageModelId =
  // Imagen 4 models (dedicated text-to-image, highest quality)
  | "imagen-4.0-ultra-generate-001"    // $0.06/image - Highest detail, 2K resolution
  | "imagen-4.0-generate-001"          // $0.04/image - Balanced speed and quality
  | "imagen-4.0-fast-generate-001"     // $0.02/image - Optimized for latency
  // Gemini multimodal models (conversational, good for consistency/editing)
  | "gemini-3-pro-image-preview"       // ~$0.134/image - Best reasoning + image gen
  | "gemini-2.5-flash-image";          // ~$0.039/image - Fast, cost-effective ("Nano Banana")

export const DEFAULT_IMAGE_MODEL: ImageModelId = "gemini-2.5-flash-image";

// Check model type
function isImagenModel(modelId: string): boolean {
  return modelId.startsWith("imagen-");
}

// Image generation styles
const STYLE_PROMPTS: Record<string, string> = {
  // Built-in art styles (matching CreatePresentationClient options)
  "illustration": "modern conceptual illustration, clean lines, professional style, vector-like quality",
  "photo": "high quality realistic photograph, professional lighting, stock photo style, photorealistic",
  "3d": "3D rendered illustration, soft shadows, isometric view, modern 3D graphics",
  "line-art": "minimalist line art, single color, elegant, clean lines, sketch style",
  "abstract": "abstract digital art, geometric shapes, modern corporate aesthetic, artistic",
  // Legacy style mappings
  "conceptual-illustration": "modern conceptual illustration, clean lines, professional business style",
  "realistic-photo": "high quality realistic photograph, professional lighting, stock photo style",
  "flat-illustration": "flat design illustration, minimal colors, vector art style",
  "watercolor": "watercolor painting style, soft edges, artistic",
};

/**
 * Build image generation prompt from slide data
 */
function buildImagePrompt(promptHint: string, style?: string | null, artStyle?: string | null): string {
  let styleModifier: string;
  
  if (artStyle) {
    const knownStyle = STYLE_PROMPTS[artStyle.toLowerCase()];
    styleModifier = knownStyle || artStyle; // Use custom text if not a known style
  } else if (style && STYLE_PROMPTS[style.toLowerCase()]) {
    styleModifier = STYLE_PROMPTS[style.toLowerCase()]!;
  } else {
    styleModifier = STYLE_PROMPTS["photo"]!;
  }

  return `${promptHint}. Style: ${styleModifier}. Professional presentation image, clean and visually appealing, high resolution, no text overlays or watermarks.`;
}


/**
 * Generate an image using Imagen 4 models
 * Uses the generateImages endpoint (not generateContent)
 */
async function generateImagenImage(
  prompt: string,
  modelId: string,
  apiKey: string
): Promise<ImageResult> {
  try {
    // Imagen 4 uses a dedicated image generation endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateImages`;

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "16:9",
          outputMimeType: "image/jpeg",
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Imagen] API error: ${response.status}`, errorBody);
      
      // Fallback to Gemini if Imagen fails
      console.log("[Imagen] Falling back to Gemini model...");
      return generateGeminiModelImage(prompt, "gemini-2.5-flash-image", apiKey);
    }

    const data = await response.json();
    
    // Imagen response: { generatedImages: [{ image: { imageBytes: "base64..." } }] }
    const generatedImage = data.generatedImages?.[0];
    const imageBytes = generatedImage?.image?.imageBytes;
    
    if (imageBytes) {
      const dataUrl = `data:image/jpeg;base64,${imageBytes}`;

      const uploadResult = await uploadImageFromDataUrl(dataUrl, {
        folder: "pptmaster/ai-images",
        tags: ["ai-generated", "imagen", "presentation"],
      });

      return {
        url: uploadResult?.url ?? dataUrl,
        alt: prompt,
        source: "gemini",
      };
    }

    console.warn("[Imagen] No image data in response", data);
    return { url: "", alt: prompt, source: "placeholder", error: "No image generated" };
  } catch (error) {
    console.error("[Imagen] Failed:", error);
    return { url: "", alt: prompt, source: "placeholder", error: String(error) };
  }
}

/**
 * Generate an image using Gemini multimodal models
 * Uses generateContent with responseModalities: ["image"]
 */
async function generateGeminiModelImage(
  prompt: string,
  modelId: string,
  apiKey: string
): Promise<ImageResult> {
  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["image", "text"],
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Gemini Image] API error: ${response.status}`, errorBody);
      return { url: "", alt: prompt, source: "placeholder", error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(
      (part: { inlineData?: { mimeType?: string; data?: string } }) => 
        part.inlineData?.mimeType?.startsWith("image/")
    );

    if (imagePart?.inlineData) {
      const { mimeType, data: base64Data } = imagePart.inlineData;
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      const uploadResult = await uploadImageFromDataUrl(dataUrl, {
        folder: "pptmaster/ai-images",
        tags: ["ai-generated", "gemini", "presentation"],
      });

      return { url: uploadResult?.url ?? dataUrl, alt: prompt, source: "gemini" };
    }

    console.warn("[Gemini Image] No image data in response", data);
    return { url: "", alt: prompt, source: "placeholder", error: "No image generated" };
  } catch (error) {
    console.error("[Gemini Image] Failed:", error);
    return { url: "", alt: prompt, source: "placeholder", error: String(error) };
  }
}



/**
 * Generate an image using the appropriate AI provider
 * Automatically routes to the correct API based on model type
 */
export async function generateGeminiImage(
  promptHint: string,
  style?: string | null,
  modelId: ImageModelId = DEFAULT_IMAGE_MODEL,
  artStyle?: string | null
): Promise<ImageResult> {
  const prompt = buildImagePrompt(promptHint, style, artStyle);
  const model = modelId || DEFAULT_IMAGE_MODEL;

  console.log(`[AI Image] Generating with model: ${model}`);

  // Google models (Imagen or Gemini)
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[AI Image] GEMINI_API_KEY not configured");
    return { url: "", alt: promptHint, source: "placeholder", error: "Gemini API key not configured" };
  }

  if (isImagenModel(model)) {
    return generateImagenImage(prompt, model, apiKey);
  } else {
    return generateGeminiModelImage(prompt, model, apiKey);
  }
}


/**
 * Generate image from slide image specification
 */
export async function generateImageFromSpec(
  imageSpec: SlideImage,
  modelId: ImageModelId = DEFAULT_IMAGE_MODEL,
  artStyle?: string | null
): Promise<ImageResult> {
  if (!imageSpec.required) {
    return { url: "", alt: "", source: "none" };
  }

  const promptHint = imageSpec.aiPromptHint || imageSpec.promptHint;
  if (!promptHint) {
    return { url: "", alt: "Image placeholder", source: "placeholder", error: "No prompt hint provided" };
  }

  return generateGeminiImage(promptHint, imageSpec.style, modelId, artStyle);
}

/**
 * Batch generate images for multiple slides
 */
export async function generateImagesForSlides(
  slides: Array<{
    type: "title" | "content";
    title: string;
    assets?: { image: SlideImage };
    image?: SlideImage;
  }>,
  modelId: ImageModelId = DEFAULT_IMAGE_MODEL,
  artStyle?: string | null
): Promise<Map<number, ImageResult>> {
  const imageMap = new Map<number, ImageResult>();
  const batchSize = 3;
  const delayBetweenBatches = 1000;

  for (let i = 0; i < slides.length; i += batchSize) {
    const batch = slides.slice(i, i + batchSize);

    const promises = batch.map(async (slide, batchIndex) => {
      const slideIndex = i + batchIndex;
      const imageSpec = slide.type === "title" ? slide.image : slide.assets?.image;

      if (!imageSpec?.required) {
        return { index: slideIndex, result: { url: "", alt: "", source: "none" as const } };
      }

      const result = await generateImageFromSpec(imageSpec, modelId, artStyle);
      return { index: slideIndex, result };
    });

    const results = await Promise.all(promises);
    for (const { index, result } of results) {
      imageMap.set(index, result);
    }

    if (i + batchSize < slides.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return imageMap;
}

/**
 * Check if slide requires an image
 */
export function slideRequiresImage(slide: {
  type: "title" | "content";
  assets?: { image: SlideImage };
  image?: SlideImage;
}): boolean {
  if (slide.type === "title") {
    return slide.image?.required ?? true;
  }
  return slide.assets?.image?.required ?? false;
}
