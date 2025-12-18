import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { PLAN_CONFIG, CREDIT_COSTS } from "~/lib/credits";

export async function GET() {
  try {
    const authUser = await requireAuth();

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        credits: true,
        subscriptionPlan: true,
        subscriptionType: true,
        nextResetDate: true,
        polarCustomerId: true,
        polarSubscriptionId: true,
        createdAt: true,
        _count: {
          select: {
            presentations: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get plan details
    const planDetails = user.subscriptionPlan
      ? PLAN_CONFIG[user.subscriptionPlan as keyof typeof PLAN_CONFIG]
      : null;

    // Calculate usage stats
    const maxCredits = planDetails?.credits || 0;
    const usedCredits = maxCredits - user.credits;
    const usagePercentage = maxCredits > 0 ? (usedCredits / maxCredits) * 100 : 0;

    return NextResponse.json({
      subscription: {
        plan: user.subscriptionPlan,
        type: user.subscriptionType,
        isActive: !!user.subscriptionPlan,
        nextResetDate: user.nextResetDate,
        polarCustomerId: user.polarCustomerId,
        polarSubscriptionId: user.polarSubscriptionId,
      },
      credits: {
        current: user.credits,
        max: maxCredits,
        used: usedCredits,
        usagePercentage: Math.round(usagePercentage),
      },
      planDetails: planDetails
        ? {
            name: user.subscriptionPlan,
            credits: planDetails.credits,
            cardsPerPrompt: planDetails.cardsPerPrompt,
            features: planDetails.features,
          }
        : null,
      usage: {
        presentations: user._count.presentations,
        estimatedSlides: Math.floor(user.credits / CREDIT_COSTS.SLIDE),
        estimatedImages: Math.floor(user.credits / CREDIT_COSTS.IMAGE_BASIC),
      },
      memberSince: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500 }
    );
  }
}
