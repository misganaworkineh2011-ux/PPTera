import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

/**
 * Comment access: the owner always; other signed-in users only when the deck
 * is shared publicly (review flow) or they collaborate on it.
 */
async function canAccess(presentationId: string) {
  const authUser = await requireAuth();
  const presentation = await db.presentation.findUnique({
    where: { id: presentationId },
    select: { userId: true, isPublic: true },
  });
  if (!presentation) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };

  const isOwner = presentation.userId === authUser.id;
  let allowed = isOwner || presentation.isPublic;
  if (!allowed) {
    const collab = await db.collaboration.findFirst({
      where: { presentationId, userId: authUser.id },
      select: { id: true },
    });
    allowed = Boolean(collab);
  }
  if (!allowed) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }
  return { authUser, isOwner };
}

// List all comments for a presentation (newest first per slide)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const check = await canAccess(id);
    if ("error" in check) return check.error;

    const comments = await db.presentationComment.findMany({
      where: { presentationId: id },
      orderBy: [{ slideIndex: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ comments, isOwner: check.isOwner });
  } catch (error) {
    console.error("Error listing comments:", error);
    return NextResponse.json({ error: "Failed to list comments" }, { status: 500 });
  }
}

// Add a comment to a slide
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const check = await canAccess(id);
    if ("error" in check) return check.error;
    const { authUser } = check;

    const body = await request.json();
    const slideIndex = Number(body?.slideIndex);
    const text = typeof body?.body === "string" ? body.body.trim() : "";

    if (!Number.isInteger(slideIndex) || slideIndex < 0) {
      return NextResponse.json({ error: "Invalid slideIndex" }, { status: 400 });
    }
    if (!text || text.length > 2000) {
      return NextResponse.json({ error: "Comment must be 1-2000 characters" }, { status: 400 });
    }

    const comment = await db.presentationComment.create({
      data: {
        presentationId: id,
        slideIndex,
        authorId: authUser.id,
        authorName: authUser.name || "Someone",
        body: text,
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
