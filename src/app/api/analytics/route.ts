import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "30", 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    // Run all queries in parallel for speed
    const [
      totalPresentations,
      recentPresentationsCount,
      previousPresentationsCount,
      activityCounts,
      viewCount,
      topPresentationsRaw,
      recentPresentationsForChart,
    ] = await Promise.all([
      // Total presentations count
      db.presentation.count({
        where: { userId: user.id },
      }),

      // Recent presentations count (in period)
      db.presentation.count({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
        },
      }),

      // Previous period presentations count (for growth)
      db.presentation.count({
        where: {
          userId: user.id,
          createdAt: { gte: previousPeriodStart, lt: startDate },
        },
      }),

      // Activity breakdown using groupBy
      db.activity.groupBy({
        by: ["type"],
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
        },
        _count: true,
      }),

      // Total views count
      db.activity.count({
        where: {
          userId: user.id,
          type: "view",
          createdAt: { gte: startDate },
        },
      }),

      // Top 5 presentations (minimal data, no slides JSON)
      db.presentation.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          createdAt: true,
          _count: {
            select: {
              activities: {
                where: { type: "view" },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20, // Get more to sort by views
      }),

      // Recent presentations for chart (only id, createdAt, slides for counting)
      db.presentation.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          createdAt: true,
          slides: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Calculate total slides from recent presentations only (for chart)
    const getSlideCount = (slides: unknown): number => {
      if (Array.isArray(slides)) return slides.length;
      return 0;
    };

    // Estimate total slides (use recent average * total count for speed)
    const recentSlideCount = recentPresentationsForChart.reduce(
      (sum, p) => sum + getSlideCount(p.slides),
      0
    );
    const avgSlidesPerPresentation =
      recentPresentationsForChart.length > 0
        ? Math.round(recentSlideCount / recentPresentationsForChart.length)
        : 8; // Default estimate
    const totalSlides = totalPresentations * avgSlidesPerPresentation;

    // Activity breakdown object
    const activityBreakdown: Record<string, number> = {};
    activityCounts.forEach((item) => {
      activityBreakdown[item.type] = item._count;
    });

    // Daily activity for chart
    const dailyActivity: Record<
      string,
      { presentations: number; slides: number; views: number }
    > = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      dailyActivity[key!] = { presentations: 0, slides: 0, views: 0 };
    }

    recentPresentationsForChart.forEach((p) => {
      const key = new Date(p.createdAt).toISOString().split("T")[0];
      if (key && dailyActivity[key]) {
        dailyActivity[key].presentations++;
        dailyActivity[key].slides += getSlideCount(p.slides);
      }
    });

    // Top presentations sorted by views
    const topPresentations = topPresentationsRaw
      .map((p) => ({
        id: p.id,
        title: p.title,
        views: p._count.activities,
        slides: avgSlidesPerPresentation, // Use average instead of fetching all
        createdAt: p.createdAt,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Calculate growth
    const growth = {
      presentations:
        previousPresentationsCount > 0
          ? Math.round(
              ((recentPresentationsCount - previousPresentationsCount) /
                previousPresentationsCount) *
                100
            )
          : recentPresentationsCount > 0
            ? 100
            : 0,
    };

    return NextResponse.json(
      {
        overview: {
          totalPresentations,
          totalSlides,
          totalViews: viewCount,
          recentPresentations: recentPresentationsCount,
          avgSlidesPerPresentation,
        },
        growth,
        activityBreakdown,
        dailyActivity: Object.entries(dailyActivity)
          .map(([date, data]) => ({ date, ...data }))
          .reverse(),
        topPresentations,
        period: { days, startDate: startDate.toISOString() },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
