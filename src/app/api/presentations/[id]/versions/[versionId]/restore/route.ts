import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

// Restore a presentation to a saved version. The current state is snapshotted
// first ("Before restore"), so a restore is always itself reversible.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id, versionId } = await params;

    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true, title: true, slides: true, content: true },
    });
    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }
    if (presentation.userId !== authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const version = await db.presentationVersion.findUnique({
      where: { id: versionId },
    });
    if (!version || version.presentationId !== id) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Safety snapshot of the current state before overwriting
    await db.presentationVersion.create({
      data: {
        presentationId: id,
        title: presentation.title,
        slides: JSON.parse(JSON.stringify(presentation.slides ?? [])),
        content: JSON.parse(JSON.stringify(presentation.content ?? {})),
        label: "Before restore",
      },
    });

    const updated = await db.presentation.update({
      where: { id },
      data: {
        title: version.title,
        slides: JSON.parse(JSON.stringify(version.slides ?? [])),
        content: JSON.parse(JSON.stringify(version.content ?? {})),
      },
      select: { title: true, slides: true, content: true },
    });

    return NextResponse.json({
      success: true,
      title: updated.title,
      slides: updated.slides,
      content: updated.content,
    });
  } catch (error) {
    console.error("Error restoring version:", error);
    return NextResponse.json({ error: "Failed to restore version" }, { status: 500 });
  }
}
