import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { clerkClient } from "@clerk/nextjs/server";

export async function DELETE(request: Request) {
  try {
    const authUser = await requireAuth();
    const { confirmation } = await request.json();

    // Verify confirmation
    if (confirmation !== "DELETE" && confirmation !== "ELIMINAR" && confirmation !== "SUPPRIMER" && confirmation !== "LÖSCHEN" && confirmation !== "削除") {
      return NextResponse.json({ error: "Invalid confirmation" }, { status: 400 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: authUser.id },
      select: { clerkId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all user data from database
    // The cascade delete should handle related records, but let's be explicit
    await db.$transaction([
      // Delete activities
      db.activity.deleteMany({ where: { userId: authUser.id } }),
      // Delete collaborations
      db.collaboration.deleteMany({ where: { userId: authUser.id } }),
      // Delete notifications
      db.notification.deleteMany({ where: { userId: authUser.id } }),
      // Delete pinned projects
      db.pinnedProject.deleteMany({ where: { userId: authUser.id } }),
      // Delete images
      db.image.deleteMany({ where: { userId: authUser.id } }),
      // Delete charts
      db.chart.deleteMany({ where: { userId: authUser.id } }),
      // Delete templates
      db.template.deleteMany({ where: { userId: authUser.id } }),
      // Delete themes
      db.theme.deleteMany({ where: { userId: authUser.id } }),
      // Delete resources
      db.resource.deleteMany({ where: { userId: authUser.id } }),
      // Delete outlines
      db.outline.deleteMany({ where: { userId: authUser.id } }),
      // Delete presentations (this will cascade delete related records)
      db.presentation.deleteMany({ where: { userId: authUser.id } }),
      // Finally delete the user
      db.user.delete({ where: { id: authUser.id } }),
    ]);

    // Delete user from Clerk
    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(user.clerkId);
    } catch (clerkError) {
      console.error("Error deleting Clerk user:", clerkError);
      // Continue even if Clerk deletion fails - the database user is already deleted
    }

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
