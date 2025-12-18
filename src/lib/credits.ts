/**
 * Credit system utilities
 * 
 * Credit costs:
 * - Slides: 4 credits per slide
 * - AI Images: 10-25 credits depending on model
 * - Charts: 2 credits
 * - Outlines: 5 credits
 */

/**
 * Credit costs for different operations
 * - Slides: 4 credits per slide generated
 * - AI Images: Varies by model
 */
export const CREDIT_COSTS = {
  // Slide generation
  SLIDE: 4,                    // 4 credits per slide
  
  // OpenAI DALL-E 3 Image generation
  IMAGE_BASIC: 10,             // DALL-E 3 standard quality
  IMAGE_HD: 15,                // DALL-E 3 HD quality
  
  // Google Gemini Image generation
  GEMINI_IMAGEN: 8,            // Gemini Imagen 3 (faster, cheaper)
  GEMINI_IMAGEN_HD: 12,        // Gemini Imagen 3 HD
  
  // Legacy (for backwards compatibility)
  IMAGE_PREMIUM: 25,           // Reserved for future premium models
  
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
      "1,000 AI credits / month",
      "~250 slides or ~100 AI images",
      "20 cards per prompt",
      "Unlimited PDF exports",
      "Basic templates",
      "7-day version history",
    ],
  },
  pro: {
    credits: 4000,
    cardsPerPrompt: 60,
    features: [
      "4,000 AI credits / month",
      "~1,000 slides or ~400 AI images",
      "60 cards per prompt",
      "Remove PPTMaster branding",
      "Export to PowerPoint (PPTX)",
      "Premium AI image models",
      "Premium templates",
      "30-day version history",
      "Priority support",
    ],
  },
  ultra: {
    credits: 20000,
    cardsPerPrompt: 75,
    features: [
      "20,000 AI credits / month",
      "~5,000 slides or ~2,000 AI images",
      "75 cards per prompt",
      "Everything in Pro",
      "Access to most advanced AI models",
      "Shared team workspace",
      "Custom fonts & themes",
      "Advanced analytics",
      "Dedicated support",
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
