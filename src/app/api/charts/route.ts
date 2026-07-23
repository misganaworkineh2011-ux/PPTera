import { auth } from "~/lib/auth-server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch all charts for the user
export async function GET() {
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

    const charts = await db.chart.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        data: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ charts });
  } catch (error) {
    console.error("[Charts GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch charts" }, { status: 500 });
  }
}

// POST - Create a new chart
export async function POST(req: Request) {
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

    const body = await req.json();
    const { title, type, data, config, presentationId } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "Type and data are required" }, { status: 400 });
    }

    const chart = await db.chart.create({
      data: {
        title: title || "Untitled Chart",
        type,
        data,
        config: config || {},
        userId: user.id,
        presentationId: presentationId || null,
      },
    });

    return NextResponse.json({ chart });
  } catch (error) {
    console.error("[Charts POST] Error:", error);
    return NextResponse.json({ error: "Failed to create chart" }, { status: 500 });
  }
}
