import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth();
    const { id } = params;

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

    // Delete presentation (cascade will handle related records)
    await db.presentation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return NextResponse.json(
      { error: "Failed to delete presentation" },
      { status: 500 }
    );
  }
}
