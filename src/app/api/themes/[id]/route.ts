import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

// GET - Fetch a single theme
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const theme = await db.theme.findUnique({
      where: { id },
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}

// PATCH - Update a theme (including setting as default)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if theme belongs to user
    const existingTheme = await db.theme.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    // If setting as default, unset other defaults first
    if (body.isDefault === true) {
      await db.theme.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const theme = await db.theme.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.colors && { colors: body.colors }),
        ...(body.fonts && { fonts: body.fonts }),
        ...(body.designElements && { designElements: body.designElements }),
        ...(typeof body.isDefault === "boolean" && { isDefault: body.isDefault }),
      },
    });

    return NextResponse.json({ theme });
  } catch (error) {
    console.error("Error updating theme:", error);
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}

// DELETE - Delete a theme
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    // Check if theme belongs to user
    const existingTheme = await db.theme.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    await db.theme.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting theme:", error);
    return NextResponse.json({ error: "Failed to delete theme" }, { status: 500 });
  }
}
