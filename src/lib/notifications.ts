import { db } from "~/server/db";

export type NotificationType = "success" | "info" | "warning" | "error" | "promo";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  try {
    await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}
