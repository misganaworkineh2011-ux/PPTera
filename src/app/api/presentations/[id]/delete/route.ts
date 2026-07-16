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
      select: { userId: true, title: true },
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

    const permanent = request.nextUrl.searchParams.get("permanent") === "1";

    await db.activity.create({
      data: {
        userId: authUser.id,
        type: "delete",
        description: permanent
          ? `Permanently deleted presentation "${presentation.title}"`
          : `Moved presentation "${presentation.title}" to trash`,
      },
    });

    if (permanent) {
      // Hard delete (cascade handles related records)
      await db.presentation.delete({ where: { id } });
    } else {
      // Soft delete: restorable from Trash for 30 days
      await db.presentation.update({ where: { id }, data: { deletedAt: new Date() } });
    }

    return NextResponse.json({ success: true, permanent });
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return NextResponse.json(
      { error: "Failed to delete presentation" },
      { status: 500 }
    );
  }
}
