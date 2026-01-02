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

    // Get all presentations for this user to count which ones came from each outline
    const presentations = await db.presentation.findMany({
      where: {
        userId: user.id,
      },
      select: {
        content: true,
      },
    });

    // Count presentations per outline
    const presentationCountByOutline = new Map<string, number>();
    console.log("[outlines/recent] Processing", presentations.length, "presentations");
    
    for (const pres of presentations) {
      const content = pres.content as { outlineId?: string } | null;
      // Handle both null and empty string cases
      const outlineId = content?.outlineId && content.outlineId.trim() ? content.outlineId : null;
      console.log("[outlines/recent] Presentation content outlineId:", outlineId);
      if (outlineId) {
        const count = presentationCountByOutline.get(outlineId) || 0;
        presentationCountByOutline.set(outlineId, count + 1);
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

