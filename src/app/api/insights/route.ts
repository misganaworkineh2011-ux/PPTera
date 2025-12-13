import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch insight posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "9");
    const offset = parseInt(searchParams.get("offset") || "0");
    const featured = searchParams.get("featured") === "true";

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

    return NextResponse.json({
      posts,
      total,
      hasMore: offset + limit < total,
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
