import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "~/lib/auth-server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get current user (optional, might be null)
        const { userId: clerkUserId } = await auth();

        // Get the internal user ID if authenticated
        let internalUserId: string | null = null;
        if (clerkUserId) {
            const user = await db.user.findUnique({
                where: { clerkId: clerkUserId },
                select: { id: true }
            });
            internalUserId = user?.id || null;
        }

        const presentation = await db.presentation.findUnique({
            where: { id },
            include: {
                collaborations: true,
            },
        });

        if (!presentation) {
            return NextResponse.json({ error: "Presentation not found" }, { status: 404 });
        }

        // Check access using internal user ID
        const isOwner = internalUserId && presentation.userId === internalUserId;
        const isCollaborator = internalUserId && presentation.collaborations.some((c) => c.userId === internalUserId);
        const isPublic = presentation.isPublic;

        if (!isOwner && !isCollaborator && !isPublic) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Determine current user's role
        let role = "viewer";
        if (isOwner) role = "owner";
        else if (isCollaborator) {
            const collab = presentation.collaborations.find((c) => c.userId === internalUserId);
            if (collab) role = collab.role; // "editor" or "viewer"
        }

        // Return partial data for public view? Or full data?
        // Embed needs full slides.
        return NextResponse.json({
            ...presentation,
            isOwner,
            collaboratorRole: isOwner ? "owner" : role,
        });

    } catch (error) {
        console.error("[Presentation GET] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
