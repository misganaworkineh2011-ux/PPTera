import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";

export type PolarProductSummary = {
  id: string;
  name: string;
  description?: string | null;
  uiDescription?: string;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  priceType?: "one_time" | "recurring" | null;
  recurringInterval?: string | null;
  displayPrice?: string;
};

export type PolarPricingTier = {
  key: string;
  name: string;
  description?: string | null;
  uiDescription?: string;
  monthly?: PolarProductSummary | null;
  yearly?: PolarProductSummary | null;
};

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_ENV,
});

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

// Custom UI descriptions for better presentation
const UI_DESCRIPTIONS: Record<string, string> = {
  "plus": `
• 1,000 AI credits / mo
• ~250 slides (4 credits each)
• ~100 AI images (10 credits each)
• 20 cards per prompt
• Unlimited PDF exports
• Basic templates
• 7-day version history

**Credits reset:** Monthly on subscription date`,

  "pro": `
• 4,000 AI credits / mo
• ~1,000 slides (4 credits each)
• ~400 AI images (10 credits each)
• 60 cards per prompt
• Remove PPTMaster branding
• Export to PowerPoint (PPTX)
• Premium AI image models (HD: 15 credits)
• Premium templates
• 30-day version history
• Priority support

**Credits reset:** Monthly on subscription date`,

  "ultra": `
• 20,000 AI credits / mo
• ~5,000 slides (4 credits each)
• ~2,000 AI images (10 credits each)
• 75 cards per prompt
• Everything in Pro
• Access to most advanced AI models
• Premium images (25 credits)
• Shared team workspace
• Custom fonts & themes
• Advanced analytics
• Dedicated support

**Credits reset:** Monthly on subscription date`
};

export async function fetchPolarProductsFromEnv(): Promise<PolarPricingTier[]> {
  const tierConfigs = [
    {
      key: "plus",
      monthlyId: env.POLAR_PRODUCT_PLUS,
      yearlyId: env.POLAR_PRODUCT_YEARLY_PLUS,
    },
    {
      key: "pro",
      monthlyId: env.POLAR_PRODUCT_PRO,
      yearlyId: env.POLAR_PRODUCT_YEARLY_PRO,
    },
    {
      key: "ultra",
      monthlyId: env.POLAR_PRODUCT_ULTRA,
      yearlyId: env.POLAR_PRODUCT_YEARLY_ULTRA,
    },
  ].filter((config) => config.monthlyId || config.yearlyId);

  console.log('[Polar Products] Tier configs:', tierConfigs);

  if (tierConfigs.length === 0) return [];

  const results: PolarPricingTier[] = [];

  for (const tier of tierConfigs) {
    console.log(`[Polar Products] Fetching ${tier.key}:`, {
      monthlyId: tier.monthlyId,
      yearlyId: tier.yearlyId
    });

    const [monthly, yearly] = await Promise.all([
      fetchPolarProduct(tier.monthlyId),
      fetchPolarProduct(tier.yearlyId),
    ]);

    console.log(`[Polar Products] ${tier.key} results:`, {
      monthly: monthly ? { id: monthly.id, price: monthly.displayPrice, interval: monthly.recurringInterval } : null,
      yearly: yearly ? { id: yearly.id, price: yearly.displayPrice, interval: yearly.recurringInterval } : null,
    });

    const canonical = monthly ?? yearly;

    if (!canonical) {
      console.log(`[Polar Products] Skipping ${tier.key} - no products found`);
      continue;
    }

    results.push({
      key: tier.key,
      name: canonical.name,
      description: canonical.description ?? null,
      uiDescription: UI_DESCRIPTIONS[tier.key] ?? canonical.description ?? undefined,
      monthly: monthly ?? null,
      yearly: yearly ?? null,
    });
  }

  console.log(`[Polar Products] Total tiers: ${results.length}`);
  return results;
}

export async function fetchPolarProduct(productId?: string | null): Promise<PolarProductSummary | null> {
  if (!productId) {
    console.log('[Polar Product] No product ID provided');
    return null;
  }

  try {
    console.log(`[Polar Product] Fetching product: ${productId}`);
    const product = await polarClient.products.get({ id: productId });
    
    console.log(`[Polar Product] Product fetched:`, {
      id: product.id,
      name: product.name,
      pricesCount: product.prices?.length ?? 0
    });

    const price: any =
      product.prices?.find((p: any) => p.amountType === "fixed" && !p.isArchived) ??
      product.prices?.[0];

    if (!price) {
      console.log(`[Polar Product] No valid price found for ${productId}`);
      return null;
    }

    console.log(`[Polar Product] Price details:`, {
      priceAmount: price.priceAmount,
      currency: price.priceCurrency,
      type: price.type,
      interval: price.recurringInterval
    });

    const summary: PolarProductSummary = {
      id: product.id,
      name: product.name,
      description: product.description ?? null,
      priceAmount: price?.priceAmount ?? null,
      priceCurrency: price?.priceCurrency ?? null,
      priceType: price?.type ?? null,
      recurringInterval: price?.recurringInterval ?? null,
    };

    summary.displayPrice = formatPolarPrice(summary);
    console.log(`[Polar Product] Final summary:`, { id: summary.id, displayPrice: summary.displayPrice });

    return summary;
  } catch (err) {
    console.error("Failed to fetch Polar product", productId, err);
    return null;
  }
}

export function formatPolarPrice(product: PolarProductSummary): string {
  if (!product.priceAmount || !product.priceCurrency) return "";
  const amount = (product.priceAmount / 100).toFixed(2);
  const isRecurring = product.priceType === "recurring";
  const interval = product.recurringInterval ? `/${product.recurringInterval}` : "";
  return `${currencySymbol(product.priceCurrency)}${amount}${isRecurring ? interval : ""}`;
}

function currencySymbol(code: string): string {
  try {
    return (0).toLocaleString(undefined, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/0+([.,]0+)?$/, "");
  } catch {
    return "$";
  }
}
