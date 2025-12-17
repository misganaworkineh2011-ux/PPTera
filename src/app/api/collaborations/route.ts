import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

// Get all collaborations for the current user
export async function GET() {
  try {
    const user = await requireAuth();

    // Get presentations where user is a collaborator
    const collaborations = await db.collaboration.findMany({
      where: { 
        OR: [
          { userId: user.id },
          { email: user.email },
        ],
        status: "accepted",
      },
      include: {
        presentation: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get presentations owned by user with collaborators
    const ownedPresentations = await db.presentation.findMany({
      where: { userId: user.id },
      include: {
        collaborations: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Filter to only presentations with collaborators
    const sharedByMe = ownedPresentations.filter(p => p.collaborations.length > 0);

    return NextResponse.json({ 
      collaborations, 
      sharedByMe,
    });
  } catch (error) {
    console.error("Error fetching collaborations:", error);
    return NextResponse.json({ error: "Failed to fetch collaborations" }, { status: 500 });
  }
}
