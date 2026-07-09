import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

/**
 * POST — public beacon from shared viewers: { slideIndex, ms }
 * Accumulates per-slide views + watch time. No auth (public share pages),
 * but only accepted for presentations that are actually shared publicly.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const slideIndex = Number(body?.slideIndex);
    // Clamp watch time: ignore junk, cap a single beacon at 5 minutes
    const ms = Math.max(0, Math.min(Number(body?.ms) || 0, 5 * 60 * 1000));

    if (!Number.isInteger(slideIndex) || slideIndex < 0 || slideIndex > 500) {
      return NextResponse.json({ error: "Invalid slideIndex" }, { status: 400 });
    }

    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { isPublic: true },
    });
    if (!presentation || !presentation.isPublic) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.slideEngagement.upsert({
      where: { presentationId_slideIndex: { presentationId: id, slideIndex } },
      create: { presentationId: id, slideIndex, views: 1, totalMs: Math.round(ms) },
      update: { views: { increment: 1 }, totalMs: { increment: Math.round(ms) } },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Engagement beacon failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** GET — owner-only per-slide engagement summary. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;

    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true, viewCount: true },
    });
    if (!presentation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (presentation.userId !== authUser.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const rows = await db.slideEngagement.findMany({
      where: { presentationId: id },
      orderBy: { slideIndex: "asc" },
      select: { slideIndex: true, views: true, totalMs: true },
    });

    return NextResponse.json({ totalViews: presentation.viewCount, slides: rows });
  } catch (error) {
    console.error("Engagement summary failed:", error);
    return NextResponse.json({ error: "Failed to load engagement" }, { status: 500 });
  }
}
