import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch version history for a presentation
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership
    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true, title: true },
    });

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    if (presentation.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get version history from activities
    const activities = await db.activity.findMany({
      where: {
        presentationId: id,
        type: { in: ["create", "edit", "update", "version_save"] },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Transform activities into version history
    const versions = activities.map((activity, index) => ({
      id: activity.id,
      version: activities.length - index,
      description: activity.description,
      type: activity.type,
      createdAt: activity.createdAt,
      metadata: activity.metadata,
    }));

    return NextResponse.json({
      presentationId: id,
      title: presentation.title,
      versions,
    });
  } catch (error) {
    console.error("[Version History] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch version history" },
      { status: 500 }
    );
  }
}

// POST - Save a new version snapshot
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership and get current state
    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true, title: true, slides: true, content: true },
    });

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    if (presentation.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { description } = body;

    // Create version snapshot activity
    const activity = await db.activity.create({
      data: {
        userId: user.id,
        presentationId: id,
        type: "version_save",
        description: description || "Manual version save",
        metadata: {
          slideCount: Array.isArray(presentation.slides) ? presentation.slides.length : 0,
          snapshot: {
            slides: presentation.slides,
            content: presentation.content,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      version: {
        id: activity.id,
        description: activity.description,
        createdAt: activity.createdAt,
      },
    });
  } catch (error) {
    console.error("[Version Save] Error:", error);
    return NextResponse.json(
      { error: "Failed to save version" },
      { status: 500 }
    );
  }
}
