import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch single inspiration item
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const item = await db.inspirationGallery.findUnique({
      where: { id },
    });

    if (!item || !item.isPublic) {
      return NextResponse.json(
        { error: "Inspiration item not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await db.inspirationGallery.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Get related items (same category, excluding current)
    const relatedItems = await db.inspirationGallery.findMany({
      where: {
        isPublic: true,
        category: item.category,
        id: { not: id },
      },
      orderBy: [
        { isFeatured: "desc" },
        { likes: "desc" },
      ],
      take: 3,
    });

    return NextResponse.json({
      item,
      relatedItems,
    });
  } catch (error) {
    console.error("Fetch inspiration item error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspiration item" },
      { status: 500 }
    );
  }
}

// POST - Increment like count
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const item = await db.inspirationGallery.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    return NextResponse.json({ likes: item.likes });
  } catch (error) {
    console.error("Update like error:", error);
    return NextResponse.json(
      { error: "Failed to update like count" },
      { status: 500 }
    );
  }
}
