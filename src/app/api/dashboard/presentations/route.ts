import { auth } from "~/lib/auth-server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true }, // Only select what we need
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause. Trash view lists soft-deleted decks (and lazily
    // purges anything older than 30 days); every other view excludes them.
    const trashed = searchParams.get("trashed") === "1";
    if (trashed) {
      await db.presentation.deleteMany({
        where: {
          userId: user.id,
          deletedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      });
    }
    const where: Record<string, unknown> = {
      userId: user.id,
      deletedAt: trashed ? { not: null } : null,
    };
    
    if (filter === "favorites") {
      where.isPinned = true;
    } else if (filter === "public") {
      where.isPublic = true;
    } else if (filter === "private") {
      where.isPublic = false;
    }

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    // Get total count for pagination
    const total = await db.presentation.count({ where });

    // Fetch presentations with pagination
    const presentations = await db.presentation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        isPublic: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        thumbnailUrl: true,
        shareToken: true,
        outlineId: true,
        tags: true,
        viewCount: true,
        slideCount: true,
        previewImages: true,
        coverSlide: true,
        themeId: true,
        // Denormalized meta replaces the heavy slides JSON
      },
    });

    const hasMore = page * limit < total;

    return NextResponse.json(
      {
        data: presentations,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch presentations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Creation logic is currently in /api/generate
  // We can move it here or keep it there.
  return NextResponse.json({ message: "Use /api/generate for now" }, { status: 200 });
}

