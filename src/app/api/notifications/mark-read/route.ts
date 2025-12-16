import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const { notificationId } = await request.json();

    if (notificationId) {
      // Mark single notification as read
      await db.notification.update({
        where: {
          id: notificationId,
          userId: authUser.id,
        },
        data: { isRead: true },
      });
    } else {
      // Mark all notifications as read
      await db.notification.updateMany({
        where: {
          userId: authUser.id,
          isRead: false,
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
