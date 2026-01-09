import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // Validate token presence
    if (!token || token.trim() === "") {
      return NextResponse.redirect(
        new URL("/newsletter/error?reason=missing-token", req.url)
      );
    }

    // Find subscription by unsubscribe token
    const subscription = await db.newsletter.findUnique({
      where: { unsubscribeToken: token },
    });

    // Invalid or already-used token
    if (!subscription) {
      return NextResponse.redirect(
        new URL("/newsletter/error?reason=invalid-token", req.url)
      );
    }

    // Already unsubscribed - show appropriate message
    if (subscription.status === "unsubscribed") {
      return NextResponse.redirect(
        new URL("/newsletter/unsubscribed?already=true", req.url)
      );
    }

    // Perform unsubscribe
    await db.newsletter.update({
      where: { id: subscription.id },
      data: {
        status: "unsubscribed",
        unsubscribedAt: new Date(),
      },
    });

    // Redirect with success indicator
    return NextResponse.redirect(
      new URL("/newsletter/unsubscribed?success=true", req.url)
    );
  } catch (error) {
    console.error("[Newsletter Unsubscribe] Error:", error);
    return NextResponse.redirect(
      new URL("/newsletter/error?reason=server-error", req.url)
    );
  }
}
