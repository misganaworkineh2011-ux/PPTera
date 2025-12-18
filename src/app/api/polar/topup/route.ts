import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";
import { db } from "~/server/db";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_ENV,
});

// Credit top-up configurations
export const TOPUP_OPTIONS = {
  "500": {
    credits: 500,
    price: 999, // cents
    productId: env.POLAR_TOPUP_500,
  },
  "1000": {
    credits: 1000,
    price: 1799,
    productId: env.POLAR_TOPUP_1000,
  },
  "2500": {
    credits: 2500,
    price: 3999,
    productId: env.POLAR_TOPUP_2500,
  },
} as const;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true, subscriptionPlan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow top-ups for subscribed users
    if (!user.subscriptionPlan || user.subscriptionPlan === "free") {
      return NextResponse.json(
        { error: "Credit top-ups are only available for subscribed users" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { credits } = body;

    const option = TOPUP_OPTIONS[credits as keyof typeof TOPUP_OPTIONS];
    if (!option) {
      return NextResponse.json(
        { error: "Invalid credit amount" },
        { status: 400 }
      );
    }

    if (!option.productId) {
      return NextResponse.json(
        { error: "Top-up product not configured" },
        { status: 500 }
      );
    }

    console.log("[Credit Top-up] Creating checkout:", {
      userId: user.id,
      credits: option.credits,
      productId: option.productId,
    });

    // Fetch product to get price ID
    const product = await polarClient.products.get({ id: option.productId });
    const price = product.prices?.find(p => p.type === "one_time" && !p.isArchived) || product.prices?.[0];

    if (!price) {
      return NextResponse.json(
        { error: "No price found for top-up product" },
        { status: 500 }
      );
    }

    // Create Polar checkout
    const checkout = await (polarClient.checkouts.create as any)({
      productPriceId: price.id,
      customerEmail: user.email,
      metadata: {
        userId: user.id,
        type: "credit_topup",
        credits: option.credits.toString(),
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?topup=success&credits=${option.credits}`,
    });

    return NextResponse.json({
      checkoutUrl: checkout.url,
    });
  } catch (error: any) {
    console.error("[Credit Top-up] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return available top-up options
  const options = Object.entries(TOPUP_OPTIONS).map(([key, value]) => ({
    credits: value.credits,
    price: value.price,
    priceDisplay: `$${(value.price / 100).toFixed(2)}`,
    available: !!value.productId,
  }));

  return NextResponse.json({ options });
}
