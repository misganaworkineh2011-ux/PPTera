import { NextResponse } from "next/server";
import { fetchPolarProductsFromEnv, type PolarProductSummary } from "~/lib/polar-products";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log('[Polar API] Fetching products...');

  try {
    const products = await fetchPolarProductsFromEnv();
    console.log('[Polar API] Products fetched:', products.length);

    const payload = products.map((tier) => ({
      key: tier.key,
      name: tier.name,
      description: tier.description ?? undefined,
      uiDescription: tier.uiDescription,
      monthly: tier.monthly,
      yearly: tier.yearly,
    }));

    return NextResponse.json(payload);
  } catch (e) {
    console.error('[Polar API] Error:', e);
    return NextResponse.json({
      error: "Failed to load products",
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}
