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
  const tierConfigs = [
    { 
      key: "starter", 
      monthlyId: env.POLAR_PRODUCT_STARTER,
      yearlyId: env.POLAR_PRODUCT_STARTER_YEARLY
    },
    { 
      key: "pro", 
      monthlyId: env.POLAR_PRODUCT_PRO,
      yearlyId: env.POLAR_PRODUCT_PRO_YEARLY
    },
    { 
      key: "enterprise", 
      monthlyId: env.POLAR_PRODUCT_ENTERPRISE,
      yearlyId: env.POLAR_PRODUCT_ENTERPRISE_YEARLY
    },
  ].filter((config) => config.monthlyId || config.yearlyId);

  console.log('[Polar Products] Tier configs:', tierConfigs);

  if (tierConfigs.length === 0) {
    console.log('[Polar Products] No product IDs found in environment variables');
    return [];
  }

  const results: PolarPricingTier[] = [];

  for (const tier of tierConfigs) {
    console.log(`[Polar Products] Processing tier: ${tier.key}`);

    try {
      let monthlySummary: PolarProductSummary | null = null;
      let yearlySummary: PolarProductSummary | null = null;
      let tierName = tier.key.charAt(0).toUpperCase() + tier.key.slice(1);
      let tierDescription: string | null = null;

      // Fetch monthly product if ID exists
      if (tier.monthlyId) {
        console.log(`[Polar Products] Fetching monthly product for ${tier.key} with ID: ${tier.monthlyId}`);
        try {
          const monthlyProduct = await polarClient.products.get({ id: tier.monthlyId });
          console.log(`[Polar Products] Monthly product fetched:`, {
            id: monthlyProduct.id,
            name: monthlyProduct.name,
            pricesCount: monthlyProduct.prices?.length ?? 0
          });

          tierName = monthlyProduct.name;
          tierDescription = monthlyProduct.description ?? null;

          // Check if this product has monthly prices
          const monthlyPrice = monthlyProduct.prices?.find(
            p => p.type === "recurring" && p.recurringInterval === "month" && !p.isArchived
          );

          if (monthlyPrice) {
            monthlySummary = mapPriceToSummary(monthlyProduct, monthlyPrice);
          }

          // Also check if this product has yearly prices (in case they're on the same product)
          const yearlyPrice = monthlyProduct.prices?.find(
            p => p.type === "recurring" && p.recurringInterval === "year" && !p.isArchived
          );

          if (yearlyPrice && !tier.yearlyId) {
            yearlySummary = mapPriceToSummary(monthlyProduct, yearlyPrice);
          }
        } catch (error) {
          console.error(`[Polar Products] Error fetching monthly product for ${tier.key}:`, error);
        }
      }

      // Fetch yearly product if separate ID exists
      if (tier.yearlyId && tier.yearlyId !== tier.monthlyId) {
        console.log(`[Polar Products] Fetching yearly product for ${tier.key} with ID: ${tier.yearlyId}`);
        try {
          const yearlyProduct = await polarClient.products.get({ id: tier.yearlyId });
          console.log(`[Polar Products] Yearly product fetched:`, {
            id: yearlyProduct.id,
            name: yearlyProduct.name,
            pricesCount: yearlyProduct.prices?.length ?? 0
          });

          // Find the yearly price
          const yearlyPrice = yearlyProduct.prices?.find(
            p => p.type === "recurring" && p.recurringInterval === "year" && !p.isArchived
          );

          if (yearlyPrice) {
            yearlySummary = mapPriceToSummary(yearlyProduct, yearlyPrice);
          }
        } catch (error) {
          console.error(`[Polar Products] Error fetching yearly product for ${tier.key}:`, error);
        }
      }

      console.log(`[Polar Products] Results for ${tier.key}:`, {
        hasMonthly: !!monthlySummary,
        hasYearly: !!yearlySummary,
        monthlyAmount: monthlySummary?.priceAmount,
        yearlyAmount: yearlySummary?.priceAmount
      });

      // Only add tier if we have at least one product
      if (monthlySummary || yearlySummary) {
        results.push({
          key: tier.key,
          name: tierName,
          description: tierDescription,
          uiDescription: UI_DESCRIPTIONS[tier.key] ?? tierDescription ?? undefined,
          monthly: monthlySummary,
          yearly: yearlySummary,
        });
      }
    } catch (error) {
      console.error(`[Polar Products] Error processing tier ${tier.key}:`, error);
      if (error instanceof Error) {
        console.error(`[Polar Products] Error message:`, error.message);
      }
    }
  }

  console.log(`[Polar Products] Total tiers fetched: ${results.length}`);
  return results;
}

// Helper function to map price to summary
function mapPriceToSummary(product: any, price: any): PolarProductSummary | null {
  if (!price) return null;
  
  // Handle different price structures from Polar SDK
  const amount = price.priceAmount ?? price.amount ?? 0;
  const currency = price.priceCurrency ?? price.currency ?? 'USD';
  const interval = price.recurringInterval ?? price.interval ?? 'month';
  
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? null,
    priceAmount: amount,
    priceCurrency: currency,
    priceType: price.type,
    recurringInterval: interval,
    displayPrice: formatPrice(amount, currency, interval)
  };
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
