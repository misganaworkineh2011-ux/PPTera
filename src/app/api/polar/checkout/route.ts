import { type NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { currentUser } from "@clerk/nextjs/server";
import { env } from "~/env";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_ENV === "production" ? "production" : "sandbox",
});

export async function POST(req: NextRequest) {
  console.log("[Polar Checkout] Creating checkout session");

  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, recurringInterval } = body as { productId: string, recurringInterval?: string };

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Determine the Price ID based on interval if possible, 
    // OR if productId is actually the Product ID, we need to find the specific Price ID to checkout.
    // Polar Checkouts usually take a Product Price ID, NOT the Product ID itself if there are multiple prices.
    // However, the SDK might handle it.
    // Let's first fetch the product options to find the correct price ID for the interval.

    // NOTE: In our fetchPolarProductsFromEnv logic, we were mapping 'monthly' and 'yearly' objects.
    // However, those objects didn't explicitly store the specific PRICE ID (it just had product ID).
    // We need the PRICE ID to create a checkout for a specific billing interval.
    // Let's assume the frontend sends the PRODUCT ID, and we find the correct PRICE ID here.

    const product = await polarClient.products.get({ id: productId });
    // Find price
    const price = product.prices?.find(p =>
      p.type === "recurring" &&
      p.recurringInterval === (recurringInterval || "month") &&
      !p.isArchived
    );

    if (!price) {
      return NextResponse.json(
        { error: "Matching price not found for this product and interval" },
        { status: 400 }
      );
    }

    console.log("[Polar Checkout] Creating checkout for:", {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      limitId: price.id,
    });

    const baseUrl = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkout = await polarClient.checkouts.create({
      productPriceId: price.id, // Use the specific price ID
      customerEmail: user.emailAddresses[0]?.emailAddress,
      customerName: user.fullName || undefined,
      metadata: {
        clerkId: user.id,
      },
      successUrl: `${baseUrl}/dashboard?purchase=success`,
    });

    console.log("[Polar Checkout] Checkout created:", checkout.id);

    return NextResponse.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error) {
    console.error("[Polar Checkout] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
