import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;

    // Check if presentation exists and belongs to user
    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true, isPinned: true },
    });

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    if (presentation.userId !== authUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Toggle by default; accept an explicit {pinned} body for idempotent
    // bulk operations.
    let nextPinned = !presentation.isPinned;
    try {
      const body = await request.json();
      if (typeof body?.pinned === "boolean") nextPinned = body.pinned;
    } catch {
      // no body - plain toggle
    }
    const updated = await db.presentation.update({
      where: { id },
      data: { isPinned: nextPinned },
    });

    return NextResponse.json({ success: true, isPinned: updated.isPinned });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Failed to update presentation" },
      { status: 500 }
    );
  }
}
