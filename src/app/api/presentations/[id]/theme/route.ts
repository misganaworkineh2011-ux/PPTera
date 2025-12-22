import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await requireAuth();
    const { id } = params;
    const { theme } = await request.json();

    if (!theme || typeof theme !== "string") {
      return NextResponse.json(
        { error: "Theme ID is required" },
        { status: 400 }
      );
    }

    // Check if presentation exists and belongs to user
    const presentation = await db.presentation.findUnique({
      where: { id },
      select: { userId: true, content: true },
    });

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    if (presentation.userId !== authUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update theme in content
    const currentContent = (presentation.content as Record<string, unknown>) || {};
    const updatedContent = {
      ...currentContent,
      theme: theme,
    };

    const updated = await db.presentation.update({
      where: { id },
      data: { content: updatedContent },
    });

    return NextResponse.json({ 
      success: true, 
      theme: theme,
      content: updated.content,
    });
  } catch (error) {
    console.error("Error updating theme:", error);
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 }
    );
  }
}
