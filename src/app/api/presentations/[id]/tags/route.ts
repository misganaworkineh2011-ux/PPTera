import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

/** Replace a presentation's organization tags (max 8, each 1-24 chars). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth();
    const { id } = params;
    const body = await request.json();

    const raw = Array.isArray(body?.tags) ? body.tags : null;
    if (!raw) {
      return NextResponse.json({ error: "tags must be an array" }, { status: 400 });
    }
    const cleaned: string[] = raw
      .filter((t: unknown): t is string => typeof t === "string")
      .map((t: string) => t.trim().slice(0, 24))
      .filter((t: string) => t.length > 0);
    const tags = Array.from(new Set<string>(cleaned)).slice(0, 8);

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

    await db.presentation.update({ where: { id }, data: { tags } });
    return NextResponse.json({ success: true, tags });
  } catch (error) {
    console.error("Error updating tags:", error);
    return NextResponse.json({ error: "Failed to update tags" }, { status: 500 });
  }
}
