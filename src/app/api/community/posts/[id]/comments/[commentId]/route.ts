import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// PATCH - Like a comment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === "like") {
      const comment = await db.communityComment.update({
        where: { id: commentId, isApproved: true },
        data: { likes: { increment: 1 } },
        select: { likes: true },
      });

      return NextResponse.json({ likes: comment.likes });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update comment error:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}
