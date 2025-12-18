/**
 * Credit system utilities
 * 
 * Credit costs:
 * - Slides: 4 credits per slide
 * - AI Images: 10-25 credits depending on model
 * - Charts: 2 credits
 * - Outlines: 5 credits
 */

import { CREDIT_COSTS, PLAN_CONFIG } from "./polar-products";

export { CREDIT_COSTS, PLAN_CONFIG };

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
