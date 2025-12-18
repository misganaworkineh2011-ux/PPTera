import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

export async function GET(request: Request) {
  try {
    const authUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get activity history for credit usage
    const activities = await db.activity.findMany({
      where: {
        userId: authUser.id,
        createdAt: { gte: startDate },
        type: { in: ["create", "generate", "image_generate"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        description: true,
        metadata: true,
        createdAt: true,
        presentation: {
          select: { id: true, title: true },
        },
      },
    });

    // Group by date for chart data
    const usageByDate: Record<string, { slides: number; images: number; total: number }> = {};
    
    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split("T")[0]!;
      if (!usageByDate[date]) {
        usageByDate[date] = { slides: 0, images: 0, total: 0 };
      }
      
      const metadata = activity.metadata as { creditsUsed?: number; type?: string } | null;
      const credits = metadata?.creditsUsed || 0;
      
      if (activity.type === "image_generate") {
        usageByDate[date].images += credits;
      } else {
        usageByDate[date].slides += credits;
      }
      usageByDate[date].total += credits;
    });

    // Convert to array sorted by date
    const chartData = Object.entries(usageByDate)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate totals
    const totals = activities.reduce(
      (acc, activity) => {
        const metadata = activity.metadata as { creditsUsed?: number } | null;
        const credits = metadata?.creditsUsed || 0;
        
        if (activity.type === "image_generate") {
          acc.images += credits;
        } else if (activity.type === "create") {
          acc.slides += credits;
        }
        acc.total += credits;
        return acc;
      },
      { slides: 0, images: 0, total: 0 }
    );

    return NextResponse.json({
      activities: activities.slice(0, 50), // Last 50 activities
      chartData,
      totals,
      period: { days, startDate, endDate: new Date() },
    });
  } catch (error) {
    console.error("Error fetching usage history:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage history" },
      { status: 500 }
    );
  }
}
