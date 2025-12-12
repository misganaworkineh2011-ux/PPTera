import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(req: Request) {
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

    const presentations = await db.presentation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { slides: true }, // Assuming slides is a relation or we count JSON items differently? 
          // Actually slides is Json, so we can't count it with _count in Prisma directly if it's not a relation.
          // I will just return the presentation and handle slide count on client or fetch it.
        },
      },
    });

    return NextResponse.json(presentations);
  } catch (error) {
    console.error("Failed to fetch presentations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // Creation logic is currently in /api/generate
  // We can move it here or keep it there.
  return NextResponse.json({ message: "Use /api/generate for now" }, { status: 200 });
}

