import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

export async function GET(request: Request) {
  try {
    const authUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    const include = searchParams.get("include") || "basic"; // "basic", "presentations", "full"

    // Build select based on what's needed
    const select: Record<string, unknown> = {
      id: true,
      name: true,
      email: true,
      credits: true,
      subscriptionPlan: true,
      image: true,
    };

    // Only include presentations if requested
    if (include === "presentations" || include === "full") {
      select.presentations = {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          isPublic: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
          slides: true,
          shareToken: true,
        },
      };
    }

    // Include counts for full profile
    if (include === "full") {
      select._count = {
        select: {
          presentations: true,
          themes: true,
          images: true,
          charts: true,
        },
      };
    }

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user, {
      headers: {
        // Short cache for user data since it can change
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
