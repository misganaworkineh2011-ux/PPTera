import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

// Get all activities for the current user with pagination
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
    const type = searchParams.get("type"); // Filter by activity type

    // Build where clause
    const where: Record<string, unknown> = { userId: user.id };
    if (type && type !== "all") {
      where.type = type;
    }

    // Get total count
    const total = await db.activity.count({ where });

    const activities = await db.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        description: true,
        createdAt: true,
        // metadata removed - not used in UI, can be large
        presentation: {
          select: { id: true, title: true },
        },
      },
    });

    const hasMore = page * limit < total;

    return NextResponse.json(
      {
        activities,
        pagination: { page, limit, total, hasMore },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

// Create a new activity
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { type, description, presentationId, metadata } = await request.json();

    if (!type || !description) {
      return NextResponse.json({ error: "Type and description are required" }, { status: 400 });
    }

    const activity = await db.activity.create({
      data: {
        type,
        description,
        userId: user.id,
        presentationId,
        metadata,
      },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
