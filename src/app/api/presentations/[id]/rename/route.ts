import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth();
    const { id } = params;
    const { title } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Check if presentation exists and belongs to user
    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true },
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

    // Update title
    const updated = await db.presentation.update({
      where: { id },
      data: { title: title.trim() },
    });

    return NextResponse.json({ success: true, title: updated.title });
  } catch (error) {
    console.error("Error renaming presentation:", error);
    return NextResponse.json(
      { error: "Failed to rename presentation" },
      { status: 500 }
    );
  }
}
