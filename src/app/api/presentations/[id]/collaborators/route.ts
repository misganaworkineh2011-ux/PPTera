import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { nanoid } from "nanoid";

// Get all collaborators for a presentation
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const presentation = await db.presentation.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!presentation) {
      return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
    }

    // Check if user is owner or collaborator
    const isOwner = presentation.userId === user.id;
    const collaboration = await db.collaboration.findFirst({
      where: { presentationId: params.id, email: user.email, status: "accepted" },
    });

    if (!isOwner && !collaboration) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const collaborators = await db.collaboration.findMany({
      where: { presentationId: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ collaborators, isOwner });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json({ error: "Failed to fetch collaborators" }, { status: 500 });
  }
}

// Add a new collaborator
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { email, role } = await request.json();

    if (!email || !role || !["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid email or role" }, { status: 400 });
    }

    const presentation = await db.presentation.findUnique({
      where: { id: params.id },
      select: { userId: true, title: true },
    });

    if (!presentation || presentation.userId !== user.id) {
      return NextResponse.json({ error: "Presentation not found or unauthorized" }, { status: 404 });
    }

    // Check if already a collaborator
    const existing = await db.collaboration.findUnique({
      where: { presentationId_email: { presentationId: params.id, email } },
    });

    if (existing) {
      return NextResponse.json({ error: "User is already a collaborator" }, { status: 400 });
    }

    // Check if the email belongs to an existing user
    const existingUser = await db.user.findFirst({ where: { email } });

    const collaboration = await db.collaboration.create({
      data: {
        presentationId: params.id,
        email,
        role,
        userId: existingUser?.id,
        status: existingUser ? "accepted" : "pending",
        inviteToken: existingUser ? null : nanoid(24),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // TODO: Send email invitation if user doesn't exist

    return NextResponse.json({ collaboration });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json({ error: "Failed to add collaborator" }, { status: 500 });
  }
}

// Update collaborator role
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { collaboratorId, role } = await request.json();

    if (!collaboratorId || !role || !["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const presentation = await db.presentation.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!presentation || presentation.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const collaboration = await db.collaboration.update({
      where: { id: collaboratorId },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ collaboration });
  } catch (error) {
    console.error("Error updating collaborator:", error);
    return NextResponse.json({ error: "Failed to update collaborator" }, { status: 500 });
  }
}

// Remove a collaborator
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get("collaboratorId");

    if (!collaboratorId) {
      return NextResponse.json({ error: "Collaborator ID required" }, { status: 400 });
    }

    const presentation = await db.presentation.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!presentation || presentation.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.collaboration.delete({
      where: { id: collaboratorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json({ error: "Failed to remove collaborator" }, { status: 500 });
  }
}
