import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { serverCache, SERVER_CACHE_TTL } from "~/lib/server-cache";

// GET - Fetch inspiration gallery items with server-side caching
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "18");
    const offset = parseInt(searchParams.get("offset") || "0");

    // OPTIMIZATION: Server-side caching for inspiration items
    // Cache key includes all query params for proper cache separation
    const cacheKey = `inspiration-${category || "all"}-${limit}-${offset}`;
    let cachedResult = serverCache.get<{ items: unknown[]; total: number }>(cacheKey);

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
      isPublic: true,
      ...(category && category !== "all" ? { category } : {}),
    };

    const [items, total] = await Promise.all([
      db.inspirationGallery.findMany({
        where,
        orderBy: [
          { isFeatured: "desc" },
          { likes: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      db.inspirationGallery.count({ where }),
    ]);

    // Cache the result
    serverCache.set(cacheKey, { items, total }, SERVER_CACHE_TTL.INSPIRATION);

    return NextResponse.json({
      items,
      total,
      hasMore: offset + limit < total,
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Fetch inspiration error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspiration items" },
      { status: 500 }
    );
  }
}

// POST - Increment view count
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Item ID required" },
        { status: 400 }
      );
    }

    await db.inspirationGallery.update({
      where: { id },
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
