import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";
import { computeDeckMeta } from "~/lib/presentation/deck-meta";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;
    const { slides } = await request.json();

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { error: "Slides array is required" },
        { status: 400 }
      );
    }

    // Check if presentation exists and belongs to user
    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true, title: true, slides: true, content: true },
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

    // Throttled auto-snapshot for version history: before overwriting, keep
    // the PRE-update state if the newest version is older than 10 minutes.
    // Failures here must never block the save itself.
    try {
      const AUTO_SNAPSHOT_MIN_INTERVAL_MS = 10 * 60 * 1000;
      const latest = await db.presentationVersion.findFirst({
        where: { presentationId: id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      if (
        !latest ||
        Date.now() - latest.createdAt.getTime() > AUTO_SNAPSHOT_MIN_INTERVAL_MS
      ) {
        await db.presentationVersion.create({
          data: {
            presentationId: id,
            title: presentation.title,
            slides: JSON.parse(JSON.stringify(presentation.slides ?? [])),
            content: JSON.parse(JSON.stringify(presentation.content ?? {})),
            label: "Auto snapshot",
          },
        });
        // Keep at most 30 versions per presentation
        const excess = await db.presentationVersion.findMany({
          where: { presentationId: id },
          orderBy: { createdAt: "desc" },
          skip: 30,
          select: { id: true },
        });
        if (excess.length > 0) {
          await db.presentationVersion.deleteMany({
            where: { id: { in: excess.map((v) => v.id) } },
          });
        }
      }
    } catch (snapshotError) {
      console.error("Auto-snapshot failed (save continues):", snapshotError);
    }

    // Update slides
    const updated = await db.presentation.update({
      where: { id },
      data: { slides: slides, ...computeDeckMeta(slides) },
    });

    return NextResponse.json({ success: true, slides: updated.slides });
  } catch (error) {
    console.error("Error saving slides:", error);
    return NextResponse.json(
      { error: "Failed to save slides" },
      { status: 500 }
    );
  }
}
