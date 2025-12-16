import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch single insight post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const post = await db.insightPost.findUnique({
      where: { slug },
    });

    if (!post || !post.isPublished) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await db.insightPost.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    // Get related posts (same category, excluding current)
    const relatedPosts = await db.insightPost.findMany({
      where: {
        isPublished: true,
        category: post.category,
        slug: { not: slug },
      },
      orderBy: [
        { isFeatured: "desc" },
        { views: "desc" },
      ],
      take: 3,
    });

    return NextResponse.json({
      post,
      relatedPosts,
    });
  } catch (error) {
    console.error("Fetch insight post error:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// POST - Increment like count
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const post = await db.insightPost.update({
      where: { slug },
      data: { likes: { increment: 1 } },
    });

    return NextResponse.json({ likes: post.likes });
  } catch (error) {
    console.error("Update like error:", error);
    return NextResponse.json(
      { error: "Failed to update like count" },
      { status: 500 }
    );
  }
}
