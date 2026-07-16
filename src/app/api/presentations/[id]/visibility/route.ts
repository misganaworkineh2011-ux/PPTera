import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

/** Set a presentation's public/private visibility explicitly. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth();
    const { id } = params;
    const body = await request.json();
    if (typeof body?.isPublic !== "boolean") {
      return NextResponse.json({ error: "isPublic must be a boolean" }, { status: 400 });
    }

    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }
    if (presentation.userId !== authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await db.presentation.update({
      where: { id },
      data: { isPublic: body.isPublic },
      select: { isPublic: true },
    });
    return NextResponse.json({ success: true, isPublic: updated.isPublic });
  } catch (error) {
    console.error("Error updating visibility:", error);
    return NextResponse.json({ error: "Failed to update visibility" }, { status: 500 });
  }
}
