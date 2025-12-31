import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { 
  getCachedUser, 
  getCachedPresentations, 
  getCachedThemes, 
  getCachedActivity,
  getCachedPresentationCount 
} from "~/lib/db-cache";

/**
 * Combined dashboard initialization endpoint with caching
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

    // Parallel fetch all data needed for dashboard with caching
    const [user, presentations, presentationCount, themes, recentActivity] = await Promise.all([
      // User data (cached)
      getCachedUser(authUser.id),

      // Presentations with pagination (cached)
      getCachedPresentations(authUser.id, {
        limit: presentationLimit,
        offset: presentationOffset,
        includeSlides: false,
      }),

      // Total presentation count for pagination (cached)
      getCachedPresentationCount(authUser.id),

      // Custom themes (if requested, cached)
      includeThemes ? getCachedThemes(authUser.id) : Promise.resolve([]),

      // Recent activity (if requested, cached)
      includeActivity ? getCachedActivity(authUser.id, activityLimit) : Promise.resolve([]),
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
          themeCount: themes.length,
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
