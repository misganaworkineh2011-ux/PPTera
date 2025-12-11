import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";

export type PolarProductSummary = {
  id: string;
  name: string;
  description?: string | null;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  priceType?: "one_time" | "recurring" | null;
  recurringInterval?: string | null;
  displayPrice?: string;
};

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_ENV,
});

export async function fetchPolarProductsFromEnv(): Promise<
  PolarProductSummary[]
> {
  const productIds = [
    env.POLAR_PRODUCT_STARTER,
    env.POLAR_PRODUCT_PRO,
    env.POLAR_PRODUCT_ENTERPRISE,
  ].filter(Boolean) as string[];

  if (productIds.length === 0) return [];

  const results: PolarProductSummary[] = [];

  for (const id of productIds) {
    const product = await fetchPolarProduct(id);
    if (product) {
      results.push(product);
    }
  }

  return results;
}

export async function fetchPolarProduct(
  productId?: string | null
): Promise<PolarProductSummary | null> {
  if (!productId) return null;

  try {
    const product = await polarClient.products.get({ id: productId });
    const price: any =
      product.prices?.find(
        (p: any) => p.amountType === "fixed" && !p.isArchived
      ) ?? product.prices?.[0];

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
  const interval = product.recurringInterval
    ? `/${product.recurringInterval}`
    : "";
  return `${currencySymbol(product.priceCurrency)}${amount}${isRecurring ? interval : ""}`;
}

function currencySymbol(code: string): string {
  try {
    return (0)
      .toLocaleString(undefined, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/0+([.,]0+)?$/, "");
  } catch {
    return "$";
  }
}
