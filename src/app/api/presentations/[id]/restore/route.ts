import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

/** Restore a soft-deleted presentation from the trash. */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth();
    const { id } = params;

    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true, title: true, deletedAt: true },
    });
    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }
    if (presentation.userId !== authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.presentation.update({ where: { id }, data: { deletedAt: null } });
    await db.activity.create({
      data: {
        userId: authUser.id,
        type: "update",
        description: `Restored presentation "${presentation.title}" from trash`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error restoring presentation:", error);
    return NextResponse.json({ error: "Failed to restore presentation" }, { status: 500 });
  }
}
