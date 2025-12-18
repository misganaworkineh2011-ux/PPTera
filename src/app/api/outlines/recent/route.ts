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

    // Extract title from metadata
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

