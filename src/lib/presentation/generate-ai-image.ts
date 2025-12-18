/**
 * AI Image Generation Utility
 * 
 * Generates images using Gemini AI API based on prompt hints from outline.
 * Falls back gracefully when API is not available.
 */

import { env } from "~/env";
import type { ImageResult, SlideImage } from "./types";
import { uploadImageFromDataUrl } from "~/lib/uploads/cloudinary";

// Supported Gemini / Imagen image models
export type ImageModelId =
  | "gemini-3-pro-image-preview"
  | "gemini-2.5-flash-image"
  | "imagen-4.0-generate-001"
  | "imagen-4.0-ultra-generate-001"
  | "imagen-4.0-fast-generate-001";

export const DEFAULT_IMAGE_MODEL: ImageModelId = "gemini-2.5-flash-image";

// Image generation styles
const STYLE_PROMPTS: Record<string, string> = {
  "conceptual-illustration": "modern conceptual illustration, clean lines, professional business style",
  "realistic-photo": "high quality realistic photograph, professional lighting, stock photo style",
  "abstract": "abstract digital art, geometric shapes, modern corporate aesthetic",
  "flat-illustration": "flat design illustration, minimal colors, vector art style",
  "mockup": "professional product mockup, clean background, studio lighting",
  "infographic": "infographic style, data visualization, clean minimal design",
  "3d-render": "3D rendered illustration, soft shadows, isometric view",
  "watercolor": "watercolor painting style, soft edges, artistic",
  "line-art": "minimalist line art, single color, elegant",
  "gradient": "smooth gradient background, modern aesthetic, vibrant colors",
};

/**
 * Build image generation prompt from slide data
 */
function buildImagePrompt(promptHint: string, style?: string | null): string {
  const styleModifier = style && STYLE_PROMPTS[style.toLowerCase()] 
    ? STYLE_PROMPTS[style.toLowerCase()]
    : STYLE_PROMPTS["conceptual-illustration"];

  return `Create a professional presentation image for the following concept:

${promptHint}

Style requirements: ${styleModifier}

The image should be:
- Suitable for a professional presentation
- Clean and visually appealing
- High resolution and clear
- No text overlays or watermarks
- Appropriate for business/educational context`;
}

/**
 * Generate an image using Gemini AI
 * 
 * Note: Gemini's image generation capabilities are still evolving.
 * This implementation uses the latest available model for image generation.
 */
export async function generateGeminiImage(
  promptHint: string,
  style?: string | null,
  modelId: ImageModelId = DEFAULT_IMAGE_MODEL
): Promise<ImageResult> {
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[Gemini Image] GEMINI_API_KEY not configured, returning placeholder");
    return {
      url: "",
      alt: promptHint,
      source: "placeholder",
      error: "Gemini API key not configured",
    };
  }

  try {
    const model = modelId || DEFAULT_IMAGE_MODEL;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const prompt = buildImagePrompt(promptHint, style);

    // Note: Gemini / Imagen image generation API structure
    // Keep generationConfig minimal to avoid unsupported fields on newer models
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["image"],
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Gemini Image] API error: ${response.status} ${response.statusText}`, errorBody);
      return {
        url: "",
        alt: promptHint,
        source: "placeholder",
        error: `Gemini API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Parse response - structure may vary based on API version
    const candidate = data.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(
      (part: { inlineData?: { mimeType?: string; data?: string } }) => 
        part.inlineData?.mimeType?.startsWith("image/")
    );

    if (imagePart?.inlineData) {
      // Convert base64 to data URL
      const mimeType = imagePart.inlineData.mimeType;
      const base64Data = imagePart.inlineData.data;
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      // Try to upload to Cloudinary so we have a persistent URL
      const uploadResult = await uploadImageFromDataUrl(dataUrl, {
        folder: "pptmaster/ai-images",
        tags: ["ai-generated", "gemini", "presentation"],
      });

      return {
        url: uploadResult?.url ?? dataUrl,
        alt: promptHint,
        source: "gemini",
      };
    }

    // Fallback: Check for other image formats in response
    console.warn("[Gemini Image] No image data in response", data);
    return {
      url: "",
      alt: promptHint,
      source: "placeholder",
      error: "No image generated",
    };
  } catch (error) {
    console.error("[Gemini Image] Failed to generate image:", error);
    return {
      url: "",
      alt: promptHint,
      source: "placeholder",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate image from slide image specification
 */
export async function generateImageFromSpec(
  imageSpec: SlideImage,
  modelId: ImageModelId = DEFAULT_IMAGE_MODEL
): Promise<ImageResult> {
  if (!imageSpec.required) {
    return {
      url: "",
      alt: "",
      source: "none",
    };
  }

  if (!imageSpec.promptHint) {
    return {
      url: "",
      alt: "Image placeholder",
      source: "placeholder",
      error: "No prompt hint provided",
    };
  }

  return generateGeminiImage(imageSpec.promptHint, imageSpec.style, modelId);
}

/**
 * Batch generate images for multiple slides
 * 
 * Processes images in batches to avoid rate limiting.
 */
export async function generateImagesForSlides(
  slides: Array<{
    type: "title" | "content";
    title: string;
    assets?: { image: SlideImage };
    image?: SlideImage;
  }>,
  modelId: ImageModelId = DEFAULT_IMAGE_MODEL
): Promise<Map<number, ImageResult>> {
  const imageMap = new Map<number, ImageResult>();
  const batchSize = 3;
  const delayBetweenBatches = 1000; // 1 second

  for (let i = 0; i < slides.length; i += batchSize) {
    const batch = slides.slice(i, i + batchSize);

    const promises = batch.map(async (slide, batchIndex) => {
      const slideIndex = i + batchIndex;
      
      // Get image spec from either assets.image or direct image property
      const imageSpec = slide.type === "title" ? slide.image : slide.assets?.image;

      if (!imageSpec?.required) {
        return { index: slideIndex, result: { url: "", alt: "", source: "none" as const } };
      }

      const result = await generateImageFromSpec(imageSpec, modelId);
      return { index: slideIndex, result };
    });

    const results = await Promise.all(promises);

    for (const { index, result } of results) {
      imageMap.set(index, result);
    }

    // Delay between batches
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
    return slide.image?.required ?? true; // Title slides require images by default
  }
  return slide.assets?.image?.required ?? false;
}

