import { headers } from "next/headers";
import { db } from "~/server/db";
import { env } from "~/env";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("webhook-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", env.POLAR_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.type === "subscription.created") {
      const { customer_id, product_id } = event.data;

      await db.user.update({
        where: { polarCustomerId: customer_id },
        data: {
          polarSubscriptionId: event.data.id,
          subscriptionPlan: "pro",
          productId: product_id,
          credits: 100, // Pro plan credits
        },
      });
    }

    if (event.type === "subscription.cancelled") {
      await db.user.update({
        where: { polarSubscriptionId: event.data.id },
        data: {
          subscriptionPlan: null,
          polarSubscriptionId: null,
        },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error", { status: 500 });
  }
}
