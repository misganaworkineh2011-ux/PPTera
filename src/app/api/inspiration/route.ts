import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch inspiration gallery items
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "18");
    const offset = parseInt(searchParams.get("offset") || "0");

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

    return NextResponse.json({
      items,
      total,
      hasMore: offset + limit < total,
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
