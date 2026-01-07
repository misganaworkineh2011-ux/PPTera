/**
 * Internal Export Data API - Returns presentation data for export rendering
 * This endpoint is used internally by the export-slide page and doesn't require auth
 * It only returns the minimal data needed for rendering (slides, theme)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import {
  isCustomThemeId,
  getCustomThemeDbId,
} from "~/lib/custom-theme-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get presentation without auth check (internal use only)
    const presentation = await db.presentation.findUnique({
      where: { id },
      select: {
        id: true,
        slides: true,
        content: true,
      },
    });

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    // Get theme ID
    const themeId =
      (presentation.content as { theme?: string })?.theme || "corporate-clean";

    // Get custom theme data if applicable
    let customTheme = null;
    if (isCustomThemeId(themeId)) {
      try {
        const customThemeDbId = getCustomThemeDbId(themeId);
        const customThemeData = await db.theme.findUnique({
          where: { id: customThemeDbId },
        });
        if (customThemeData) {
          customTheme = customThemeData;
        }
      } catch {
        // Ignore custom theme errors
      }
    }

    return NextResponse.json({
      id: presentation.id,
      slides: presentation.slides,
      themeId,
      customTheme,
    });
  } catch (error) {
    console.error("[Export Data] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to load presentation data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
