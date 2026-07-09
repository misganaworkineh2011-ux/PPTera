import { NextResponse } from "next/server";
import { env } from "~/env";
import { fetchPolarProduct } from "~/lib/polar-products";
import { Polar } from "@polar-sh/sdk";

export const dynamic = "force-dynamic";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_ENV,
});

export async function GET() {
  const productId = env.POLAR_PRODUCT_LIFETIME;

  if (!productId) {
    return NextResponse.json({ productId: null, displayPrice: null, claimedCount: 0 });
  }

  try {
    const product = await fetchPolarProduct(productId);

    if (!product) {
      return NextResponse.json({ productId: null, displayPrice: null, claimedCount: 0 });
    }

    let claimedCount = 0;
    try {
      const orders = await polarClient.orders.list({ productId, limit: 1 });
      claimedCount = (orders as any).pagination?.totalCount ?? 0;
    } catch {
      // non-fatal — claimedCount stays 0
    }

    return NextResponse.json({
      productId: product.id,
      displayPrice: product.displayPrice ?? null,
      claimedCount,
    });
  } catch (err) {
    console.error("[Polar Lifetime] Error:", err);
    return NextResponse.json({ productId: null, displayPrice: null, claimedCount: 0 });
  }
}
