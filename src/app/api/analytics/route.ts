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

    // Get presentations with stats
    const presentations = await db.presentation.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        slides: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get activities for the period
    const activities = await db.activity.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
    });

    // Helper to count slides from JSON
    const getSlideCount = (slides: unknown): number => {
      if (Array.isArray(slides)) return slides.length;
      return 0;
    };

    // Calculate stats
    const totalPresentations = presentations.length;
    const totalSlides = presentations.reduce((sum, p) => sum + getSlideCount(p.slides), 0);
    // Views are tracked in activities, count view activities
    const viewActivities = activities.filter(a => a.type === "view");
    const totalViews = viewActivities.length;

    // Presentations created in period
    const recentPresentations = presentations.filter(
      (p) => new Date(p.createdAt) >= startDate
    );

    // Activity breakdown
    const activityBreakdown = activities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Daily activity for chart
    const dailyActivity: Record<string, { presentations: number; slides: number; views: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      dailyActivity[key!] = { presentations: 0, slides: 0, views: 0 };
    }

    recentPresentations.forEach((p) => {
      const key = new Date(p.createdAt).toISOString().split("T")[0];
      if (key && dailyActivity[key]) {
        dailyActivity[key].presentations++;
        dailyActivity[key].slides += getSlideCount(p.slides);
      }
    });

    // Count views per presentation from activities
    const viewsByPresentation: Record<string, number> = {};
    viewActivities.forEach((a) => {
      if (a.presentationId) {
        viewsByPresentation[a.presentationId] = (viewsByPresentation[a.presentationId] || 0) + 1;
      }
    });

    // Top presentations by views (or by recency if no views)
    const topPresentations = [...presentations]
      .map((p) => ({
        id: p.id,
        title: p.title,
        views: viewsByPresentation[p.id] || 0,
        slides: getSlideCount(p.slides),
        createdAt: p.createdAt,
      }))
      .sort((a, b) => b.views - a.views || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Calculate growth
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);
    
    const previousPresentations = presentations.filter(
      (p) => new Date(p.createdAt) >= previousPeriodStart && new Date(p.createdAt) < startDate
    );

    const growth = {
      presentations: previousPresentations.length > 0
        ? Math.round(((recentPresentations.length - previousPresentations.length) / previousPresentations.length) * 100)
        : recentPresentations.length > 0 ? 100 : 0,
    };

    return NextResponse.json({
      overview: {
        totalPresentations,
        totalSlides,
        totalViews,
        recentPresentations: recentPresentations.length,
        avgSlidesPerPresentation: totalPresentations > 0 
          ? Math.round(totalSlides / totalPresentations) 
          : 0,
      },
      growth,
      activityBreakdown,
      dailyActivity: Object.entries(dailyActivity)
        .map(([date, data]) => ({ date, ...data }))
        .reverse(),
      topPresentations,
      period: { days, startDate: startDate.toISOString() },
    });
  } catch (error) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
