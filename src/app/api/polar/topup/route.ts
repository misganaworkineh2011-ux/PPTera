import { auth } from "~/lib/auth-server";
import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";
import { db } from "~/server/db";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_ENV,
});

// Credit top-up configurations (credits only, prices fetched from Polar)
export const TOPUP_PRODUCTS = {
  "500": {
    credits: 500,
    productId: env.POLAR_TOPUP_500,
  },
  "1000": {
    credits: 1000,
    productId: env.POLAR_TOPUP_1000,
  },
  "2500": {
    credits: 2500,
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

    const option = TOPUP_PRODUCTS[credits as keyof typeof TOPUP_PRODUCTS];
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

    // Create Polar checkout using products array
    const checkout = await polarClient.checkouts.create({
      products: [option.productId],
      customerEmail: user.email,
      metadata: {
        userId: user.id,
        type: "credit_topup",
        credits: option.credits.toString(),
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?topup=success&credits=${option.credits}`,
    } as any);

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
  try {
    // Fetch actual prices from Polar API for each product
    const options = await Promise.all(
      Object.entries(TOPUP_PRODUCTS).map(async ([key, value]) => {
        if (!value.productId) {
          return {
            credits: value.credits,
            price: 0,
            priceDisplay: "0.00",
            available: false,
          };
        }

        try {
          const product = await polarClient.products.get({ id: value.productId });
          
          // Find the fixed price (same logic as polar-products.ts)
          const price: any =
            product.prices?.find((p: any) => p.amountType === "fixed" && !p.isArchived) ??
            product.prices?.[0];
          
          const priceAmount = price?.priceAmount ?? 0;
          
          console.log(`[Topup] Product ${value.credits} credits:`, {
            productId: value.productId,
            priceAmount,
            pricesCount: product.prices?.length ?? 0,
          });
          
          return {
            credits: value.credits,
            price: priceAmount,
            priceDisplay: (priceAmount / 100).toFixed(2),
            available: priceAmount > 0,
          };
        } catch (err) {
          console.error(`[Topup] Failed to fetch product ${value.productId}:`, err);
          return {
            credits: value.credits,
            price: 0,
            priceDisplay: "0.00",
            available: false,
          };
        }
      })
    );

    return NextResponse.json({ options });
  } catch (error) {
    console.error("[Topup] Error fetching options:", error);
    return NextResponse.json({ options: [] });
  }
}
