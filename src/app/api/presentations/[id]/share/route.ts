import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { nanoid } from "nanoid";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { isPublic } = await request.json();

    // Check if user owns the presentation
    const presentation = await db.presentation.findUnique({
      where: { id: params.id },
    });

    if (!presentation || presentation.userId !== user.id) {
      return NextResponse.json(
        { error: "Presentation not found or unauthorized" },
        { status: 404 }
      );
    }

    // Generate share token if it doesn't exist
    const shareToken = presentation.shareToken || nanoid(16);

    // Update presentation
    const updated = await db.presentation.update({
      where: { id: params.id },
      data: {
        isPublic,
        shareToken,
      },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/${shareToken}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      isPublic,
    });
  } catch (error) {
    console.error("Error sharing presentation:", error);
    return NextResponse.json(
      { error: "Failed to share presentation" },
      { status: 500 }
    );
  }
}

// Get share status
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const presentation = await db.presentation.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        isPublic: true,
        shareToken: true,
        userId: true,
      },
    });

    if (!presentation || presentation.userId !== user.id) {
      return NextResponse.json(
        { error: "Presentation not found or unauthorized" },
        { status: 404 }
      );
    }

    const shareUrl = presentation.shareToken
      ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/${presentation.shareToken}`
      : null;

    return NextResponse.json({
      isPublic: presentation.isPublic,
      shareUrl,
    });
  } catch (error) {
    console.error("Error getting share status:", error);
    return NextResponse.json(
      { error: "Failed to get share status" },
      { status: 500 }
    );
  }
}
