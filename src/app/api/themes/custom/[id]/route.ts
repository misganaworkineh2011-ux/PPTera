import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch a custom theme by ID (public endpoint for viewing presentations)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const theme = await db.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error("Error fetching custom theme:", error);
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}
