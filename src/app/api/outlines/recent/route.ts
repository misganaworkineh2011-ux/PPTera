import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const take = parseInt(searchParams.get("take") || "5", 10);

    // Fetch recent completed outlines for the user
    const outlines = await db.outline.findMany({
      where: {
        userId: user.id,
        status: "completed",
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    });

    // Get presentation counts per outline using the proper outlineId column
    // This is much more efficient than parsing JSON content
    const presentationCounts = await db.presentation.groupBy({
      by: ['outlineId'],
      where: {
        userId: user.id,
        outlineId: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // Build a map of outlineId -> count
    const presentationCountByOutline = new Map<string, number>();
    for (const item of presentationCounts) {
      if (item.outlineId) {
        presentationCountByOutline.set(item.outlineId, item._count.id);
      }
    }
    
    console.log("[outlines/recent] Presentation counts:", Object.fromEntries(presentationCountByOutline));
    console.log("[outlines/recent] Outline IDs:", outlines.map(o => o.id));

    // Extract title from metadata and include presentation count
    const formattedOutlines = outlines.map((outline) => {
      const metadata = outline.metadata as {
        topic?: string;
        totalSlides?: number;
        tone?: string;
        language?: string;
      };

      return {
        id: outline.id,
        title: metadata.topic || "Untitled Presentation",
        createdAt: outline.createdAt.toISOString(),
        presentationCount: presentationCountByOutline.get(outline.id) || 0,
      };
    });

    return NextResponse.json({
      outlines: formattedOutlines,
      hasMore: outlines.length === take, // If we got exactly 'take' items, there might be more
    });
  } catch (error) {
    console.error("Error fetching recent outlines:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent outlines" },
      { status: 500 }
    );
  }
}

