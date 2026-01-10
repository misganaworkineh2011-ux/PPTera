import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { nanoid } from "nanoid";
import { sendCollaborationInvite } from "~/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: presentationId } = await params;
    const { emails, role } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 });
    }

    if (!role || !["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get presentation and verify ownership
    const presentation = await db.presentation.findUnique({
      where: { id: presentationId },
      select: { id: true, title: true, userId: true },
    });

    if (!presentation || presentation.userId !== user.id) {
      return NextResponse.json(
        { error: "Presentation not found or unauthorized" },
        { status: 404 }
      );
    }

    const results = {
      invited: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const email of emails) {
      const normalizedEmail = email.trim().toLowerCase();

      // Check if already a collaborator
      const existing = await db.collaboration.findUnique({
        where: {
          presentationId_email: {
            presentationId,
            email: normalizedEmail,
          },
        },
      });

      if (existing) {
        results.skipped++;
        continue;
      }

      // Check if the email belongs to an existing user
      const existingUser = await db.user.findFirst({
        where: { email: normalizedEmail },
      });

      // Generate unique invite token for this user
      const inviteToken = nanoid(32);

      // Create collaboration record
      await db.collaboration.create({
        data: {
          presentationId,
          email: normalizedEmail,
          role,
          userId: existingUser?.id,
          status: "pending",
          inviteToken,
        },
      });

      // Send invitation email
      try {
        await sendCollaborationInvite({
          to: normalizedEmail,
          senderName: user.name || "Someone",
          presentationTitle: presentation.title,
          presentationId,
          inviteToken,
          role,
        });
        results.invited++;
      } catch (emailError) {
        console.error(`Failed to send invite to ${normalizedEmail}:`, emailError);
        results.errors.push(normalizedEmail);
      }
    }

    // Log activity
    if (results.invited > 0) {
      await db.activity.create({
        data: {
          userId: user.id,
          type: "share",
          description: `Invited ${results.invited} people to "${presentation.title}"`,
          presentationId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      invited: results.invited,
      skipped: results.skipped,
      errors: results.errors,
    });
  } catch (error) {
    console.error("Error sending invitations:", error);
    return NextResponse.json(
      { error: "Failed to send invitations" },
      { status: 500 }
    );
  }
}
