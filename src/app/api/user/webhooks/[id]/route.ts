import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  try {
    const webhook = await db.webhookConfig.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!webhook || webhook.userId !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.webhookConfig.delete({
      where: { id },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("Failed to delete webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
