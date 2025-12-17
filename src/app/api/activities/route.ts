import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

// Get all activities for the current user
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const activities = await db.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        presentation: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({ activities });
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
