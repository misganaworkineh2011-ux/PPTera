import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

async function loadContext(presentationId: string, commentId: string) {
  const authUser = await requireAuth();
  const comment = await db.presentationComment.findUnique({
    where: { id: commentId },
  });
  if (!comment || comment.presentationId !== presentationId) {
    return { error: NextResponse.json({ error: "Comment not found" }, { status: 404 }) };
  }
  const presentation = await db.presentation.findUnique({
    where: { id: presentationId },
    select: { userId: true },
  });
  if (!presentation) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  const isOwner = presentation.userId === authUser.id;
  const isAuthor = comment.authorId === authUser.id;
  return { authUser, comment, isOwner, isAuthor };
}

// Toggle resolve (owner or author)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const ctx = await loadContext(id, commentId);
    if ("error" in ctx) return ctx.error;
    if (!ctx.isOwner && !ctx.isAuthor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const resolved =
      typeof body?.resolved === "boolean" ? body.resolved : !ctx.comment.resolved;

    const comment = await db.presentationComment.update({
      where: { id: commentId },
      data: { resolved },
    });
    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

// Delete (owner or author)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params;
    const ctx = await loadContext(id, commentId);
    if ("error" in ctx) return ctx.error;
    if (!ctx.isOwner && !ctx.isAuthor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.presentationComment.delete({ where: { id: commentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
