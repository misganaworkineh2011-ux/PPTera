import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch a single chart
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const chart = await db.chart.findFirst({
      where: { id, userId: user.id },
    });

    if (!chart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    return NextResponse.json({ chart });
  } catch (error) {
    console.error("[Chart GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch chart" }, { status: 500 });
  }
}

// PATCH - Update a chart (including rename)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, type, data, config } = body;

    // Check ownership
    const existingChart = await db.chart.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingChart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (data !== undefined) updateData.data = data;
    if (config !== undefined) updateData.config = config;

    const chart = await db.chart.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ chart });
  } catch (error) {
    console.error("[Chart PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update chart" }, { status: 500 });
  }
}

// DELETE - Delete a chart
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    // Check ownership
    const existingChart = await db.chart.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingChart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    await db.chart.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Chart DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to delete chart" }, { status: 500 });
  }
}
