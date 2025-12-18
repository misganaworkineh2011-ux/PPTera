import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { env } from "~/env";
import { PLAN_CONFIG } from "~/lib/polar-products";

export const dynamic = "force-dynamic";

function getPlanCredits(plan: string): number {
  switch (plan) {
    case 'plus':
      return PLAN_CONFIG.plus.credits;
    case 'pro':
      return PLAN_CONFIG.pro.credits;
    case 'ultra':
      return PLAN_CONFIG.ultra.credits;
    default:
      return PLAN_CONFIG.plus.credits;
  }
}

/**
 * Calculate next reset date based on subscription start date
 * Credits reset on the same day of month as the subscription started
 */
function getNextResetDate(subscriptionStartDate: Date | null): Date {
  const now = new Date();
  
  // If no subscription start date, default to 1st of next month
  if (!subscriptionStartDate) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth;
  }
  
  const startDay = subscriptionStartDate.getDate();
  
  // Calculate next month's reset on the same day
  const nextReset = new Date(now);
  nextReset.setMonth(now.getMonth() + 1);
  // Handle months with fewer days (e.g., if subscribed on 31st, reset on 28th/30th)
  const daysInNextMonth = getDaysInMonth(nextReset.getFullYear(), nextReset.getMonth());
  nextReset.setDate(Math.min(startDay, daysInNextMonth));
  nextReset.setHours(0, 0, 0, 0);
  
  return nextReset;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get("authorization");
    const cronSecret = env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Credit Reset] Starting monthly credit reset for annual subscribers...");

    const now = new Date();

    // Find annual subscribers whose reset date has passed
    // Annual subscribers get monthly credit refreshes on their subscription anniversary day
    const usersToReset = await db.user.findMany({
      where: {
        subscriptionType: "annual",
        subscriptionPlan: { not: null },
        nextResetDate: {
          lte: now, // Reset date is in the past or today
        },
      },
    });

    console.log(`[Credit Reset] Found ${usersToReset.length} annual subscribers to reset`);

    let resetCount = 0;
    const errors: string[] = [];

    for (const user of usersToReset) {
      try {
        const planCredits = getPlanCredits(user.subscriptionPlan || 'plus');
        // Calculate next reset based on their subscription start date (or current reset date as fallback)
        const subscriptionStart = (user as any).subscriptionStartDate || user.nextResetDate;
        const nextReset = getNextResetDate(subscriptionStart);

        await db.$transaction([
          // Reset credits to full plan amount (replaces any leftover credits)
          db.user.update({
            where: { id: user.id },
            data: {
              credits: planCredits,
              nextResetDate: nextReset,
            },
          }),
          // Create notification about credit reset
          db.notification.create({
            data: {
              userId: user.id,
              type: "credits",
              title: "Credits Refreshed!",
              message: `Your monthly credits have been reset to ${planCredits.toLocaleString()}. Next reset: ${nextReset.toLocaleDateString()}.`,
            },
          }),
        ]);

        console.log(`[Credit Reset] Reset user ${user.id} (${user.subscriptionPlan}): ${planCredits} credits, next reset: ${nextReset.toISOString()}`);
        resetCount++;
      } catch (error) {
        const errorMsg = `Failed to reset user ${user.id}: ${error}`;
        console.error(`[Credit Reset] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Credit reset completed`,
      resetCount,
      totalUsers: usersToReset.length,
      timestamp: now.toISOString(),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[Credit Reset] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to reset credits",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
