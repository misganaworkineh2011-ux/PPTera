import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch single community post by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await db.communityPost.findUnique({
      where: { id, isApproved: true },
      include: {
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count
    await db.communityPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Fetch post error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PATCH - Like a post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === "like") {
      const post = await db.communityPost.update({
        where: { id, isApproved: true },
        data: { likes: { increment: 1 } },
        select: { likes: true },
      });

      return NextResponse.json({ likes: post.likes });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}
