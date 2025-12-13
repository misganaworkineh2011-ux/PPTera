import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch community posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = {
      isApproved: true,
      ...(category && category !== "all" ? { category } : {}),
    };

    const [posts, total] = await Promise.all([
      db.communityPost.findMany({
        where,
        include: {
          comments: {
            where: { isApproved: true },
            take: 3,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      db.communityPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST - Create new community post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, category, authorName, authorEmail } = body;

    if (!title || !content || !category || !authorName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const post = await db.communityPost.create({
      data: {
        title,
        content,
        category,
        authorName,
        authorEmail,
        isApproved: false, // Requires admin approval
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Post submitted for review",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
