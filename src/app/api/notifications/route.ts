import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

// Get user notifications
export async function GET() {
  try {
    const authUser = await requireAuth();

    const notifications = await db.notification.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Create a notification (for internal use)
export async function POST(request: Request) {
  try {
    const authUser = await requireAuth();
    const { type, title, message, link } = await request.json();

    const notification = await db.notification.create({
      data: {
        userId: authUser.id,
        type,
        title,
        message,
        link,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
