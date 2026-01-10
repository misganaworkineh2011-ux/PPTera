import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { presentationId, token } = await request.json();

    if (!presentationId || !token) {
      return NextResponse.json(
        { error: "Missing presentation ID or token" },
        { status: 400 }
      );
    }

    // Find the collaboration invite
    const collaboration = await db.collaboration.findFirst({
      where: {
        presentationId,
        inviteToken: token,
      },
    });

    if (!collaboration) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    // Check if already accepted
    if (collaboration.status === "accepted") {
      return NextResponse.json({
        success: true,
        message: "Invitation already accepted",
      });
    }

    // Update collaboration to accepted and link to user
    await db.collaboration.update({
      where: { id: collaboration.id },
      data: {
        status: "accepted",
        userId: user.id,
        // Keep the token for reference but it's now used
      },
    });

    // Log activity
    await db.activity.create({
      data: {
        userId: user.id,
        type: "collaboration",
        description: `Accepted invitation to collaborate on a presentation`,
        presentationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation accepted",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
