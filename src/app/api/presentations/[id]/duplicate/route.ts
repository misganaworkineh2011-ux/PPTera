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

    // Optional custom title from the rename-on-duplicate dialog
    let requestedTitle = "";
    try {
      const body = await request.json();
      if (typeof body?.title === "string") requestedTitle = body.title.trim().slice(0, 160);
    } catch {
      // No/invalid body - fall back to "(Copy)"
    }

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
        tags: true,
        slideCount: true,
        previewImages: true,
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
        title: requestedTitle || `${original.title} (Copy)`,
        description: original.description,
        content: original.content ?? {},
        slides: original.slides ?? [],
        thumbnailUrl: original.thumbnailUrl,
        tags: original.tags,
        slideCount: original.slideCount,
        previewImages: original.previewImages,
        isPinned: false,
        isPublic: false,
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        userId: authUser.id,
        type: "create",
        description: `Duplicated presentation "${original.title}"`,
        presentationId: duplicate.id,
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
