import { type NextRequest, NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { db } from "~/server/db";
import { env } from "~/env";

export const dynamic = "force-dynamic";

type PolarWebhookPayload = {
  type: string;
  data: {
    id: string;
    created_at: string;
    modified_at: string | null;
    subscription_id?: string;
    product: {
      id: string;
      name: string;
      created_at: string;
      modified_at: string | null;
    };
    product_price: {
      id: string;
      created_at: string;
      modified_at: string | null;
      type: string;
      price_amount: number;
      price_currency: string;
    };
    customer: {
      id: string;
      email: string;
      name: string | null;
      created_at: string;
    };
    customer_metadata?: {
      clerkId?: string;
    };
    metadata?: {
      clerkId?: string;
    };
  };
};

function getPlanConfig(productId: string): { credits: number; plan: string; type: string; cardsPerPrompt: number } | null {
  // Plus plan - $10/mo ($8/yr), 1,000 credits, 20 cards/prompt
  if (productId === env.POLAR_PRODUCT_PLUS) {
    return { credits: 1000, plan: 'plus', type: 'monthly', cardsPerPrompt: 20 };
  }
  if (productId === env.POLAR_PRODUCT_YEARLY_PLUS) {
    return { credits: 1000, plan: 'plus', type: 'annual', cardsPerPrompt: 20 };
  }

  // Pro plan - $25/mo ($18/yr), 4,000 credits, 60 cards/prompt
  if (productId === env.POLAR_PRODUCT_PRO) {
    return { credits: 4000, plan: 'pro', type: 'monthly', cardsPerPrompt: 60 };
  }
  if (productId === env.POLAR_PRODUCT_YEARLY_PRO) {
    return { credits: 4000, plan: 'pro', type: 'annual', cardsPerPrompt: 60 };
  }

  // Ultra plan - $100/mo ($90/yr), 20,000 credits, 75 cards/prompt
  if (productId === env.POLAR_PRODUCT_ULTRA) {
    return { credits: 20000, plan: 'ultra', type: 'monthly', cardsPerPrompt: 75 };
  }
  if (productId === env.POLAR_PRODUCT_YEARLY_ULTRA) {
    return { credits: 20000, plan: 'ultra', type: 'annual', cardsPerPrompt: 75 };
  }

  return null;
}

function getNextResetDate(type: string): Date {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}

export async function POST(req: NextRequest) {
  console.log("[Polar Webhook] Received webhook");

  try {
    const body = await req.text();
    const webhookSecret = env.POLAR_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Polar Webhook] POLAR_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const payload = JSON.parse(body) as PolarWebhookPayload;
    
    // Validate webhook signature
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    const isValid = validateEvent(body, headers, webhookSecret);
    
    if (!isValid) {
      console.error("[Polar Webhook] Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("[Polar Webhook] Event type:", payload.type);

    // Handle successful payment completion events
    if (payload.type === "checkout.completed" || payload.type === "order.created" || payload.type === "subscription.created") {
      const { data } = payload;
      
      const productId = (data as any).product_id || (data as any).product?.id;
      const customerId = (data as any).customer_id || (data as any).customer?.id;
      const subscriptionId = (data as any).subscription_id || (data as any).id;

      console.log(`[Polar Webhook] Processing product ID: ${productId}`);

      if (!productId) {
        console.error("[Polar Webhook] Could not find product ID in payload");
        return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
      }

      const planConfig = getPlanConfig(productId);

      if (!planConfig) {
        console.error("[Polar Webhook] Unknown product ID:", productId);
        console.error("[Polar Webhook] Available products:", {
          plus: env.POLAR_PRODUCT_PLUS,
          yearlyPlus: env.POLAR_PRODUCT_YEARLY_PLUS,
          pro: env.POLAR_PRODUCT_PRO,
          yearlyPro: env.POLAR_PRODUCT_YEARLY_PRO,
          ultra: env.POLAR_PRODUCT_ULTRA,
          yearlyUltra: env.POLAR_PRODUCT_YEARLY_ULTRA,
        });
        return NextResponse.json(
          { error: "Unknown product" },
          { status: 400 }
        );
      }

      // Get clerkId from metadata
      const clerkId = 
        data.customer_metadata?.clerkId || 
        data.metadata?.clerkId || 
        (data as any).checkout?.metadata?.clerkId ||
        (data as any).order?.metadata?.clerkId;

      if (!clerkId) {
        console.error("[Polar Webhook] No clerkId in metadata");
        return NextResponse.json(
          { error: "No clerkId in metadata" },
          { status: 400 }
        );
      }

      console.log("[Polar Webhook] Processing purchase:", {
        clerkId,
        polarCustomerId: customerId,
        polarSubscriptionId: subscriptionId,
        productId,
        plan: planConfig.plan,
        credits: planConfig.credits,
        type: planConfig.type,
      });

      // Update user credits and plan info
      try {
        // Set next reset date for annual plans (monthly resets)
        const shouldSetResetDate = planConfig.type === 'annual';
        const nextReset = shouldSetResetDate ? getNextResetDate(planConfig.type) : null;
        
        const user = await db.user.update({
          where: { clerkId },
          data: {
            credits: planConfig.credits, // SET credits, replacing old value
            subscriptionPlan: planConfig.plan,
            subscriptionType: planConfig.type,
            productId: productId,
            polarCustomerId: customerId,
            polarSubscriptionId: subscriptionId || null,
            nextResetDate: nextReset,
          },
        });

        console.log("[Polar Webhook] Subscription updated successfully:", {
          userId: user.id,
          newBalance: user.credits,
          plan: user.subscriptionPlan,
          type: user.subscriptionType,
          nextReset: user.nextResetDate,
        });

        return NextResponse.json({
          success: true,
          message: "Credits updated successfully",
        });
      } catch (error) {
        console.error("[Polar Webhook] Database error:", error);
        return NextResponse.json(
          { error: "Failed to update user credits" },
          { status: 500 }
        );
      }
    }

    // Handle subscription cancellation
    if (payload.type === "subscription.cancelled") {
      const subscriptionId = payload.data.id;
      
      try {
        // Find user by subscription ID first
        const user = await db.user.findFirst({
          where: { polarSubscriptionId: subscriptionId },
        });
        
        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              subscriptionPlan: null,
              subscriptionType: null,
              polarSubscriptionId: null,
              nextResetDate: null,
            },
          });
          console.log("[Polar Webhook] Subscription cancelled:", subscriptionId);
        } else {
          console.log("[Polar Webhook] No user found for subscription:", subscriptionId);
        }

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error("[Polar Webhook] Error cancelling subscription:", error);
        return NextResponse.json(
          { error: "Failed to cancel subscription" },
          { status: 500 }
        );
      }
    }

    // Acknowledge other events
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Polar Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { 
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
