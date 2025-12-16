import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth();
    const { id } = params;

    // Get the original presentation
    const original = await db.presentation.findUnique({
      where: { id },
      select: {
        userId: true,
        title: true,
        description: true,
        content: true,
        slides: true,
        thumbnailUrl: true,
      },
    });

    if (!original) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    if (original.userId !== authUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create duplicate
    const duplicate = await db.presentation.create({
      data: {
        userId: authUser.id,
        title: `${original.title} (Copy)`,
        description: original.description,
        content: original.content,
        slides: original.slides,
        thumbnailUrl: original.thumbnailUrl,
        isPinned: false,
        isPublic: false,
      },
    });

    return NextResponse.json({ 
      success: true, 
      presentation: {
        id: duplicate.id,
        title: duplicate.title,
        isPublic: duplicate.isPublic,
        isPinned: duplicate.isPinned,
        createdAt: duplicate.createdAt,
        updatedAt: duplicate.updatedAt,
        slides: duplicate.slides,
        shareToken: duplicate.shareToken,
      }
    });
  } catch (error) {
    console.error("Error duplicating presentation:", error);
    return NextResponse.json(
      { error: "Failed to duplicate presentation" },
      { status: 500 }
    );
  }
}
