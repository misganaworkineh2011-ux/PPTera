import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "~/lib/rate-limit";

// POST - Subscribe to newsletter
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(`newsletter:${ip}`, RATE_LIMITS.NEWSLETTER);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "Email already subscribed" },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await db.newsletter.update({
          where: { email },
          data: {
            isActive: true,
            unsubscribedAt: null,
          },
        });
        return NextResponse.json({
          success: true,
          message: "Subscription reactivated!",
        });
      }
    }

    // Create new subscription
    await db.newsletter.create({
      data: { email },
    });

    // TODO: Send welcome email

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
