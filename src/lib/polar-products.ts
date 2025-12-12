import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";

export type PolarProductSummary = {
  id: string;
  name: string;
  description?: string | null;
  uiDescription?: string; // Custom UI description for better presentation
  priceAmount?: number | null; // in cents
  priceCurrency?: string | null;
  priceType?: "one_time" | "recurring" | null;
  recurringInterval?: string | null; // month, year, etc.
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
  server: env.POLAR_ENV === "production" ? "production" : "sandbox",
});

// Custom UI descriptions matching the Landing Page design content where possible
const UI_DESCRIPTIONS: Record<string, string> = {
  "starter": `
• 400 AI credits at signup
• Unlimited PDF exports
• Basic analytics
• 7-day version history`,

  "pro": `
• Unlimited AI creation
• Remove PPTMaster branding
• Export to PowerPoint (PPTX)
• Unlimited folders
• 30-day version history`,

  "enterprise": `
• Everything in Pro
• Shared team workspace
• Custom fonts & themes
• Advanced analytics
• Priority support`
};

export async function fetchPolarProductsFromEnv(): Promise<PolarPricingTier[]> {
  // Mapping the env vars to our keys. 
  // Note: We might only have monthly IDs in the env vars depending on setup.
  // Assuming the env vars point to the "Monthly" product IDs for now, 
  // or that we will fetch the product and find its monthly/yearly prices from Polar.

  // Strategy: Fetch the product by ID. Polar Product has multiple prices (monthly/yearly).
  // We will try to find both prices from the single Product ID if they are grouped, 
  // OR we might need separate IDs if they are separate products.
  // Based on the reference implementation, it seems they had separate IDs for monthly/yearly?
  // Reference had: monthlyId: env.POLAR_PRODUCT_SMALL, yearlyId: env.POLAR_PRODUCT_YEARLY_SMALL
  // Our env.js only has: POLAR_PRODUCT_STARTER, POLAR_PRODUCT_PRO, POLAR_PRODUCT_ENTERPRISE.
  // This implies either:
  // 1. These IDs refer to a "Product" that has BOTH monthly and yearly prices attached.
  // 2. We are missing variables for yearly.

  // I will assume (1) for now given the simpler env config. I will fetch the product and split its prices.

  const tierConfigs = [
    { key: "starter", id: env.POLAR_PRODUCT_STARTER },
    { key: "pro", id: env.POLAR_PRODUCT_PRO },
    { key: "enterprise", id: env.POLAR_PRODUCT_ENTERPRISE },
  ].filter((config) => config.id);

  if (tierConfigs.length === 0) return [];

  const results: PolarPricingTier[] = [];

  for (const tier of tierConfigs) {
    if (!tier.id) continue;

    const product = await fetchPolarProduct(tier.id);
    if (!product) continue;

    // The fetchPolarProduct helper below currently returns a single 'summary' based on the first price found.
    // We need to upgrade it to finding ALL prices (monthly/yearly) for this product.

    // Let's refactor fetchPolarProduct logic inline here or make a better helper to get all prices.
    const fullProduct = await polarClient.products.get({ id: tier.id }).catch(() => null);
    if (!fullProduct) continue;

    // Find monthly and yearly prices
    const monthlyPrice = fullProduct.prices?.find(p => p.type === "recurring" && p.recurringInterval === "month" && !p.isArchived);
    const yearlyPrice = fullProduct.prices?.find(p => p.type === "recurring" && p.recurringInterval === "year" && !p.isArchived);

    // Map them to summaries
    const mapPriceToSummary = (price: any): PolarProductSummary | null => {
      if (!price) return null;
      return {
        id: fullProduct.id, // The product ID is the same
        name: fullProduct.name,
        description: fullProduct.description ?? null,
        priceAmount: price.priceAmount,
        priceCurrency: price.priceCurrency,
        priceType: price.type,
        recurringInterval: price.recurringInterval,
        displayPrice: formatPrice(price.priceAmount, price.priceCurrency, price.recurringInterval)
      };
    };

    results.push({
      key: tier.key,
      name: fullProduct.name,
      description: fullProduct.description ?? null,
      uiDescription: UI_DESCRIPTIONS[tier.key] ?? fullProduct.description ?? null,
      monthly: mapPriceToSummary(monthlyPrice),
      yearly: mapPriceToSummary(yearlyPrice),
    });
  }

  return results;
}

async function fetchPolarProduct(productId: string): Promise<PolarProductSummary | null> {
  // Basic helper kept for compatibility if needed, but the main logic is above now.
  return null;
}

function formatPrice(amount: number, currency: string, interval: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(amount / 100)}/${interval}`;
}
