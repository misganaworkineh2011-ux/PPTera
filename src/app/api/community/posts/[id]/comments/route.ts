import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// POST - Add a comment to a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await req.json();
    const { content, authorName } = body;

    if (!content || !authorName) {
      return NextResponse.json(
        { error: "Content and author name are required" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await db.communityPost.findUnique({
      where: { id: postId, isApproved: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Create comment (requires approval)
    const comment = await db.communityComment.create({
      data: {
        postId,
        content: content.trim(),
        authorName: authorName.trim(),
        isApproved: false, // Requires admin approval
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Comment submitted for review",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
