import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

export async function GET() {
  try {
    const authUser = await requireAuth();

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        credits: true,
        presentations: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            title: true,
            isPublic: true,
            isPinned: true,
            createdAt: true,
            updatedAt: true,
            slides: true,
            shareToken: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
