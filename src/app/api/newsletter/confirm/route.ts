import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/newsletter/error?reason=missing-token", req.url)
      );
    }

    // Find subscription by token
    const subscription = await db.newsletter.findUnique({
      where: { confirmToken: token },
    });

    if (!subscription) {
      return NextResponse.redirect(
        new URL("/newsletter/error?reason=invalid-token", req.url)
      );
    }

    if (subscription.status === "confirmed") {
      return NextResponse.redirect(
        new URL("/newsletter/success?already=true", req.url)
      );
    }

    // Confirm subscription
    await db.newsletter.update({
      where: { id: subscription.id },
      data: {
        status: "confirmed",
        confirmedAt: new Date(),
        confirmToken: null, // Clear token after use
      },
    });

    return NextResponse.redirect(new URL("/newsletter/success", req.url));
  } catch (error) {
    console.error("[Newsletter Confirm] Error:", error);
    return NextResponse.redirect(
      new URL("/newsletter/error?reason=server-error", req.url)
    );
  }
}
