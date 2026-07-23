import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "~/lib/auth-server";
import { db } from "~/server/db";
import { sendShareNotification } from "~/lib/email";

const shareSchema = z.object({
  presentationId: z.string(),
  recipientEmail: z.string().email("Invalid email address"),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { presentationId, recipientEmail, message } = shareSchema.parse(body);

    // Get user and presentation
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const presentation = await db.presentation.findFirst({
      where: {
        id: presentationId,
        userId: user.id,
      },
    });

    if (!presentation) {
      return NextResponse.json(
        { success: false, error: "Presentation not found" },
        { status: 404 }
      );
    }

    // Generate share token if not exists
    let shareToken = presentation.shareToken;
    if (!shareToken) {
      const { nanoid } = await import("nanoid");
      shareToken = nanoid(12);
      await db.presentation.update({
        where: { id: presentationId },
        data: { shareToken, isPublic: true },
      });
    }

    // Send share notification email
    const emailResult = await sendShareNotification({
      to: recipientEmail,
      senderName: user.name,
      presentationTitle: presentation.title,
      presentationSlug: shareToken,
      message,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/presentation/${shareToken}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }

    console.error("[Share API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to share presentation" },
      { status: 500 }
    );
  }
}
