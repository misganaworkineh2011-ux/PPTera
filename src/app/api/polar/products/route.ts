import { NextResponse } from "next/server";
import {
  fetchPolarProductsFromEnv,
  type PolarProductSummary,
} from "~/lib/polar-products";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log("[Polar API] Fetching products...");

  try {
    const products = await fetchPolarProductsFromEnv();
    console.log("[Polar API] Products fetched:", products.length);

    if (products.length === 0) {
      console.warn(
        "[Polar API] No products found - check POLAR_PRODUCT_* env variables"
      );
      return NextResponse.json(
        { error: "No products configured" },
        { status: 404 }
      );
    }

    const payload = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description ?? undefined,
      displayPrice: product.displayPrice ?? "",
      priceAmount: product.priceAmount ?? null,
      priceCurrency: product.priceCurrency ?? null,
      priceType: product.priceType ?? null,
      recurringInterval: product.recurringInterval ?? null,
    }));

    console.log("[Polar API] Returning payload:", payload);
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[Polar API] Error:", e);
    return NextResponse.json(
      {
        error: "Failed to load products",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
