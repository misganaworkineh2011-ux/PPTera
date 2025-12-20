import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

/**
 * Combined dashboard initialization endpoint
 * Reduces multiple API calls to a single request for initial dashboard load
 * Returns: user data, presentations, recent activity, and custom themes
 * Supports pagination for presentations
 */
export async function GET(request: Request) {
  try {
    const authUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    // Parse options
    const includeThemes = searchParams.get("themes") !== "false";
    const includeActivity = searchParams.get("activity") !== "false";
    const presentationLimit = Math.min(
      parseInt(searchParams.get("presentationLimit") || "12", 10),
      50
    );
    const presentationOffset = parseInt(searchParams.get("presentationOffset") || "0", 10);
    const activityLimit = Math.min(
      parseInt(searchParams.get("activityLimit") || "10", 10),
      50
    );

    // Parallel fetch all data needed for dashboard
    const [user, presentations, presentationCount, themes, recentActivity] = await Promise.all([
      // User data (without presentations for pagination)
      db.user.findUnique({
        where: { id: authUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
          subscriptionPlan: true,
          image: true,
          createdAt: true,
          _count: {
            select: {
              presentations: true,
              themes: true,
            },
          },
        },
      }),

      // Presentations with pagination
      db.presentation.findMany({
        where: { userId: authUser.id },
        orderBy: { createdAt: "desc" },
        take: presentationLimit,
        skip: presentationOffset,
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
      }),

      // Total presentation count for pagination
      db.presentation.count({
        where: { userId: authUser.id },
      }),

      // Custom themes (if requested)
      includeThemes
        ? db.theme.findMany({
            where: { userId: authUser.id },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
              id: true,
              name: true,
              colors: true,
              fonts: true,
              designElements: true,
              isDefault: true,
            },
          })
        : Promise.resolve([]),

      // Recent activity (if requested)
      includeActivity
        ? db.activity.findMany({
            where: { userId: authUser.id },
            orderBy: { createdAt: "desc" },
            take: activityLimit,
            select: {
              id: true,
              type: true,
              description: true,
              createdAt: true,
              presentation: {
                select: { id: true, title: true },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hasMore = presentationOffset + presentations.length < presentationCount;

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          credits: user.credits,
          subscriptionPlan: user.subscriptionPlan,
          image: user.image,
          createdAt: user.createdAt,
          counts: user._count,
        },
        presentations,
        themes,
        recentActivity,
        pagination: {
          total: presentationCount,
          limit: presentationLimit,
          offset: presentationOffset,
          hasMore,
        },
        meta: {
          timestamp: new Date().toISOString(),
          presentationCount,
          themeCount: user._count.themes,
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Dashboard init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize dashboard" },
      { status: 500 }
    );
  }
}
