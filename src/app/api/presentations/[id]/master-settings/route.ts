import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

// Persist presentation-wide "master slide" settings (logo, footer, slide numbers)
// onto the presentation's content JSON. Mirrors the theme PATCH route.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id } = await params;
    const { masterSlide } = await request.json();

    if (masterSlide !== null && typeof masterSlide !== "object") {
      return NextResponse.json(
        { error: "Invalid master settings" },
        { status: 400 }
      );
    }

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const currentContent = (presentation.content as Record<string, unknown>) || {};
    const updatedContent = {
      ...currentContent,
      masterSlide: masterSlide ?? null,
    };

    const updated = await db.presentation.update({
      where: { id },
      data: { content: updatedContent },
    });

    return NextResponse.json({
      success: true,
      content: updated.content,
    });
  } catch (error) {
    console.error("Error updating master settings:", error);
    return NextResponse.json(
      { error: "Failed to update master settings" },
      { status: 500 }
    );
  }
}
