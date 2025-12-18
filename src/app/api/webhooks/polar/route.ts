import { type NextRequest, NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { db } from "~/server/db";
import { env } from "~/env";
import { PLAN_CONFIG } from "~/lib/credits";

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

// Credit top-up product mapping
function getTopupCredits(productId: string): number | null {
  if (productId === env.POLAR_TOPUP_500) return 500;
  if (productId === env.POLAR_TOPUP_1000) return 1000;
  if (productId === env.POLAR_TOPUP_2500) return 2500;
  return null;
}

function getPlanConfig(productId: string): { credits: number; plan: string; type: string; cardsPerPrompt: number } | null {
  // Plus plan - $10/mo ($8/yr), 1,000 credits, 20 cards/prompt
  if (productId === env.POLAR_PRODUCT_PLUS) {
    return { credits: PLAN_CONFIG.plus.credits, plan: 'plus', type: 'monthly', cardsPerPrompt: PLAN_CONFIG.plus.cardsPerPrompt };
  }
  if (productId === env.POLAR_PRODUCT_YEARLY_PLUS) {
    return { credits: PLAN_CONFIG.plus.credits, plan: 'plus', type: 'annual', cardsPerPrompt: PLAN_CONFIG.plus.cardsPerPrompt };
  }

  // Pro plan - $25/mo ($18/yr), 4,000 credits, 60 cards/prompt
  if (productId === env.POLAR_PRODUCT_PRO) {
    return { credits: PLAN_CONFIG.pro.credits, plan: 'pro', type: 'monthly', cardsPerPrompt: PLAN_CONFIG.pro.cardsPerPrompt };
  }
  if (productId === env.POLAR_PRODUCT_YEARLY_PRO) {
    return { credits: PLAN_CONFIG.pro.credits, plan: 'pro', type: 'annual', cardsPerPrompt: PLAN_CONFIG.pro.cardsPerPrompt };
  }

  // Ultra plan - $100/mo ($90/yr), 20,000 credits, 75 cards/prompt
  if (productId === env.POLAR_PRODUCT_ULTRA) {
    return { credits: PLAN_CONFIG.ultra.credits, plan: 'ultra', type: 'monthly', cardsPerPrompt: PLAN_CONFIG.ultra.cardsPerPrompt };
  }
  if (productId === env.POLAR_PRODUCT_YEARLY_ULTRA) {
    return { credits: PLAN_CONFIG.ultra.credits, plan: 'ultra', type: 'annual', cardsPerPrompt: PLAN_CONFIG.ultra.cardsPerPrompt };
  }

  return null;
}

/**
 * Calculate next reset date based on subscription start date
 * For annual subscribers, credits reset monthly on the same day they subscribed
 */
function getNextResetDate(subscriptionStartDate: Date): Date {
  const now = new Date();
  const startDay = subscriptionStartDate.getDate();
  
  // Get next month's reset date on the same day as subscription started
  const nextReset = new Date(now);
  nextReset.setMonth(now.getMonth() + 1);
  nextReset.setDate(Math.min(startDay, getDaysInMonth(nextReset.getFullYear(), nextReset.getMonth())));
  nextReset.setHours(0, 0, 0, 0);
  
  // If we're past this month's reset day, use next month
  const thisMonthReset = new Date(now);
  thisMonthReset.setDate(Math.min(startDay, getDaysInMonth(now.getFullYear(), now.getMonth())));
  thisMonthReset.setHours(0, 0, 0, 0);
  
  if (now < thisMonthReset) {
    return thisMonthReset;
  }
  
  return nextReset;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
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
      const metadata = data.metadata || (data as any).checkout?.metadata || {};

      console.log(`[Polar Webhook] Processing product ID: ${productId}`);

      if (!productId) {
        console.error("[Polar Webhook] Could not find product ID in payload");
        return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
      }

      // Check if this is a credit top-up purchase
      const topupCredits = getTopupCredits(productId);
      if (topupCredits !== null || metadata.type === "credit_topup") {
        const credits = topupCredits || parseInt(metadata.credits || "0", 10);
        const userId = metadata.userId;

        if (!userId || !credits) {
          console.error("[Polar Webhook] Missing userId or credits for top-up");
          return NextResponse.json({ error: "Missing top-up data" }, { status: 400 });
        }

        console.log("[Polar Webhook] Processing credit top-up:", { userId, credits });

        try {
          const user = await db.user.update({
            where: { id: userId },
            data: {
              credits: { increment: credits },
            },
          });

          // Log activity
          await db.activity.create({
            data: {
              userId: user.id,
              type: "credit_topup",
              description: `Purchased ${credits.toLocaleString()} credits`,
              metadata: { credits, productId },
            },
          });

          // Create notification
          await db.notification.create({
            data: {
              userId: user.id,
              type: "credits",
              title: "Credits Added!",
              message: `${credits.toLocaleString()} credits have been added to your account.`,
            },
          }).catch(err => console.error("[Polar Webhook] Failed to create notification:", err));

          console.log("[Polar Webhook] Credit top-up successful:", {
            userId: user.id,
            creditsAdded: credits,
            newBalance: user.credits,
          });

          return NextResponse.json({ success: true, creditsAdded: credits });
        } catch (error) {
          console.error("[Polar Webhook] Top-up database error:", error);
          return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
        }
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
        const subscriptionStartDate = new Date();
        
        // For annual plans, set monthly reset date based on subscription start
        // For monthly plans, Polar handles billing cycle, no reset needed
        const shouldSetResetDate = planConfig.type === 'annual';
        const nextReset = shouldSetResetDate ? getNextResetDate(subscriptionStartDate) : null;
        
        // Build update data - subscriptionStartDate may not exist in older schemas
        const updateData: Record<string, unknown> = {
          credits: planConfig.credits, // SET credits, replacing old value (fresh start)
          subscriptionPlan: planConfig.plan,
          subscriptionType: planConfig.type,
          productId: productId,
          polarCustomerId: customerId,
          polarSubscriptionId: subscriptionId || null,
          nextResetDate: nextReset,
        };
        
        // Try to set subscriptionStartDate if the field exists
        try {
          updateData.subscriptionStartDate = subscriptionStartDate;
        } catch {
          // Field doesn't exist in schema yet, skip it
        }
        
        const user = await db.user.update({
          where: { clerkId },
          data: updateData as any,
        });

        console.log("[Polar Webhook] Subscription updated successfully:", {
          userId: user.id,
          newBalance: user.credits,
          plan: user.subscriptionPlan,
          type: user.subscriptionType,
          subscriptionStart: subscriptionStartDate,
          nextReset: user.nextResetDate,
        });

        // Create notification for user
        await db.notification.create({
          data: {
            userId: user.id,
            type: "subscription",
            title: `Welcome to ${planConfig.plan.charAt(0).toUpperCase() + planConfig.plan.slice(1)}!`,
            message: `Your account has been credited with ${planConfig.credits.toLocaleString()} credits. Credits reset monthly.`,
          },
        }).catch(err => console.error("[Polar Webhook] Failed to create notification:", err));

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
