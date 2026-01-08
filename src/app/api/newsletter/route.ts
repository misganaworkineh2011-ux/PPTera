import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendNewsletterWelcome } from "~/lib/email";

// POST - Subscribe to newsletter
export async function POST(req: NextRequest) {
  try {
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
        
        // Send welcome email for reactivation
        sendNewsletterWelcome(email).catch((err) => {
          console.error("Failed to send newsletter welcome email:", err);
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

    // Send welcome email (don't block on failure)
    sendNewsletterWelcome(email).catch((err) => {
      console.error("Failed to send newsletter welcome email:", err);
    });

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
