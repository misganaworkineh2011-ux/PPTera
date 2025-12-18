import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { serverCache, SERVER_CACHE_TTL } from "~/lib/server-cache";

// GET - Fetch insight posts with server-side caching
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "9");
    const offset = parseInt(searchParams.get("offset") || "0");
    const featured = searchParams.get("featured") === "true";

    // OPTIMIZATION: Server-side caching for insights
    const cacheKey = `insights-${category || "all"}-${limit}-${offset}-${featured}`;
    let cachedResult = serverCache.get<{ posts: unknown[]; total: number }>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        hasMore: offset + limit < cachedResult.total,
      }, {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      });
    }

    const where = {
      isPublished: true,
      ...(category && category !== "all" ? { category } : {}),
      ...(featured ? { isFeatured: true } : {}),
    };

    const [posts, total] = await Promise.all([
      db.insightPost.findMany({
        where,
        orderBy: [
          { isFeatured: "desc" },
          { publishedAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      db.insightPost.count({ where }),
    ]);

    // Cache the result
    serverCache.set(cacheKey, { posts, total }, SERVER_CACHE_TTL.INSIGHTS);

    return NextResponse.json({
      posts,
      total,
      hasMore: offset + limit < total,
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Fetch insights error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

// POST - Increment view count
export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json(
        { error: "Post slug required" },
        { status: 400 }
      );
    }

    await db.insightPost.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update view error:", error);
    return NextResponse.json(
      { error: "Failed to update view count" },
      { status: 500 }
    );
  }
}
