import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

/** Verify the presentation exists and is owned by the authed user. */
async function requireOwnedPresentation(id: string) {
  const authUser = await requireAuth();
  const presentation = await db.presentation.findUnique({
    where: { id },
    select: { userId: true, title: true, slides: true, content: true },
  });
  if (!presentation) {
    return { error: NextResponse.json({ error: "Presentation not found" }, { status: 404 }) };
  }
  if (presentation.userId !== authUser.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  return { presentation };
}

// List versions (newest first) — metadata only, no slide payloads.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const check = await requireOwnedPresentation(id);
    if (check.error) return check.error;

    const versions = await db.presentationVersion.findMany({
      where: { presentationId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, label: true, createdAt: true },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Error listing versions:", error);
    return NextResponse.json({ error: "Failed to list versions" }, { status: 500 });
  }
}

// Create a manual snapshot of the CURRENT presentation state.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const check = await requireOwnedPresentation(id);
    if (check.error) return check.error;
    const { presentation } = check;

    let label = "Manual snapshot";
    try {
      const body = await request.json();
      if (typeof body?.label === "string" && body.label.trim()) {
        label = body.label.trim().slice(0, 80);
      }
    } catch {
      // no body — use default label
    }

    const version = await db.presentationVersion.create({
      data: {
        presentationId: id,
        title: presentation.title,
        slides: JSON.parse(JSON.stringify(presentation.slides ?? [])),
        content: JSON.parse(JSON.stringify(presentation.content ?? {})),
        label,
      },
      select: { id: true, title: true, label: true, createdAt: true },
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

    return NextResponse.json({ version });
  } catch (error) {
    console.error("Error creating version:", error);
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
  }
}
