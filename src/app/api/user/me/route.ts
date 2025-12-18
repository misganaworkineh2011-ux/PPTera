import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { serverCache } from "~/lib/server-cache";

export async function GET(request: Request) {
  try {
    const authUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    const include = searchParams.get("include") || "basic"; // "basic", "presentations", "full"

    // OPTIMIZATION: Server-side caching for basic user data (short TTL)
    const cacheKey = `user-${authUser.id}-${include}`;
    const cached = serverCache.get<unknown>(cacheKey);
    if (cached && include === "basic") {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
          "X-Cache": "HIT",
        },
      });
    }

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

    // Cache basic user data for 30 seconds
    if (include === "basic") {
      serverCache.set(cacheKey, user, 30 * 1000);
    }

    return NextResponse.json(user, {
      headers: {
        // Short cache for user data since it can change
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        "X-Cache": "MISS",
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
