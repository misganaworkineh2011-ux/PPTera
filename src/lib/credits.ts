/**
 * Credit system utilities
 * 
 * Credit costs:
 * - Slides: 4 credits per slide
 * - AI Images: 10-120 credits depending on model
 * - Charts: 2 credits
 * - Outlines: 5 credits
 */

/**
 * Credit costs for different operations
 * - Slides: 4 credits per slide generated
 * - AI Images: Varies by model (based on Gamma pricing)
 */
export const CREDIT_COSTS = {
  // Slide generation
  SLIDE: 4,                    // 4 credits per slide
  
  // Gemini / Nano Banana models
  GEMINI_FLASH: 10,            // Nano Banana (Gemini 2.5 Flash) - standard
  GEMINI_FLASH_HD: 30,         // Nano Banana Pro HD
  GEMINI_PRO: 10,              // Nano Banana Pro (Gemini 3 Pro)
  GEMINI_PRO_HD: 30,           // Nano Banana Pro HD
  
  // Google Imagen models
  IMAGEN_4: 15,                // Imagen 4 standard
  IMAGEN_4_ULTRA: 30,          // Imagen 4 Ultra
  IMAGEN_4_FAST: 10,           // Imagen 4 Fast
  
  // OpenAI DALL-E models
  DALLE_STANDARD: 40,          // DALL-E 3 standard quality
  DALLE_HD: 60,                // DALL-E 3 HD quality
  GPT_IMAGE_DETAILED: 120,     // GPT Image Detailed (highest quality)
  
  // Legacy aliases (for backwards compatibility)
  IMAGE_BASIC: 10,             // Maps to GEMINI_FLASH
  IMAGE_HD: 30,                // Maps to GEMINI_PRO_HD
  IMAGE_PREMIUM: 120,          // Maps to GPT_IMAGE_DETAILED
  GEMINI_IMAGEN: 10,           // Legacy alias
  GEMINI_IMAGEN_HD: 30,        // Legacy alias
  
  // Other operations
  CHART_GENERATION: 2,         // AI-generated chart
  OUTLINE_GENERATION: 5,       // AI outline generation
  CONTENT_ENHANCEMENT: 3,      // AI content improvement
} as const;

/**
 * Plan configurations with credit allocations
 */
export const PLAN_CONFIG = {
  plus: {
    credits: 1000,
    cardsPerPrompt: 20,
    features: [
      "Create up to 20 cards per prompt",
      "1,000 monthly credits",
      "Remove Gamma branding",
      "Advanced AI image models",
    ],
  },
  pro: {
    credits: 4000,
    cardsPerPrompt: 60,
    features: [
      "Create up to 60 cards per prompt",
      "4,000 monthly credits",
      "Premium AI image models",
      "Custom branding & fonts",
      "Detailed analytics & advanced sharing",
      "Publish up to 10 custom domains",
      "API access",
      "Workspace templates",
    ],
  },
  ultra: {
    credits: 20000,
    cardsPerPrompt: 75,
    features: [
      "Create up to 75 cards per prompt",
      "20,000 monthly credits",
      "Access to the most advanced AI models (text, image, video)",
      "Publish up to 100 custom domains",
      "Early access to new features",
    ],
  },
} as const;

/**
 * Calculate credits needed for slide generation
 */
export function calculateSlideCredits(slideCount: number): number {
  return slideCount * CREDIT_COSTS.SLIDE;
}

/**
 * Calculate credits needed for AI image generation
 */
export function calculateImageCredits(
  imageCount: number,
  quality: "basic" | "hd" | "premium" = "basic"
): number {
  const costPerImage = {
    basic: CREDIT_COSTS.IMAGE_BASIC,
    hd: CREDIT_COSTS.IMAGE_HD,
    premium: CREDIT_COSTS.IMAGE_PREMIUM,
  };
  return imageCount * costPerImage[quality];
}

/**
 * Check if user has enough credits for an operation
 */
export function hasEnoughCredits(
  userCredits: number,
  requiredCredits: number
): boolean {
  return userCredits >= requiredCredits;
}

/**
 * Calculate how many slides/images user can create with their credits
 */
export function calculateCapacity(credits: number): {
  slides: number;
  basicImages: number;
  hdImages: number;
  premiumImages: number;
} {
  return {
    slides: Math.floor(credits / CREDIT_COSTS.SLIDE),
    basicImages: Math.floor(credits / CREDIT_COSTS.IMAGE_BASIC),
    hdImages: Math.floor(credits / CREDIT_COSTS.IMAGE_HD),
    premiumImages: Math.floor(credits / CREDIT_COSTS.IMAGE_PREMIUM),
  };
}

/**
 * Get plan details by name
 */
export function getPlanDetails(planName: string | null): {
  credits: number;
  cardsPerPrompt: number;
  features: readonly string[];
} | null {
  if (!planName) return null;
  
  const plan = planName.toLowerCase() as keyof typeof PLAN_CONFIG;
  return PLAN_CONFIG[plan] || null;
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(credits % 1000 === 0 ? 0 : 1)}k`;
  }
  return credits.toString();
}

/**
 * Calculate credit usage breakdown for a presentation
 */
export function calculatePresentationCredits(options: {
  slideCount: number;
  basicImageCount?: number;
  hdImageCount?: number;
  premiumImageCount?: number;
  chartCount?: number;
}): {
  slides: number;
  images: number;
  charts: number;
  total: number;
} {
  const slides = options.slideCount * CREDIT_COSTS.SLIDE;
  const images =
    (options.basicImageCount || 0) * CREDIT_COSTS.IMAGE_BASIC +
    (options.hdImageCount || 0) * CREDIT_COSTS.IMAGE_HD +
    (options.premiumImageCount || 0) * CREDIT_COSTS.IMAGE_PREMIUM;
  const charts = (options.chartCount || 0) * CREDIT_COSTS.CHART_GENERATION;

  return {
    slides,
    images,
    charts,
    total: slides + images + charts,
  };
}
