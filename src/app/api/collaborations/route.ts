import { NextResponse } from "next/server";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";

// Get all collaborations for the current user with optimized queries
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // "all", "shared-with-me", "shared-by-me"

    let collaborations: unknown[] = [];
    let sharedByMe: unknown[] = [];

    // Only fetch what's needed based on type
    if (type === "all" || type === "shared-with-me") {
      // Get presentations where user is a collaborator
      collaborations = await db.collaboration.findMany({
        where: { 
          OR: [
            { userId: user.id },
            { email: user.email },
          ],
          status: "accepted",
        },
        select: {
          id: true,
          role: true,
          createdAt: true,
          presentation: {
            select: {
              id: true,
              title: true,
              updatedAt: true,
              user: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50, // Limit results
      });
    }

    if (type === "all" || type === "shared-by-me") {
      // Get presentations owned by user with collaborators - optimized query
      const ownedWithCollabs = await db.presentation.findMany({
        where: { 
          userId: user.id,
          collaborations: { some: {} }, // Only get presentations with collaborators
        },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          collaborations: {
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              user: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 50, // Limit results
      });

      sharedByMe = ownedWithCollabs;
    }

    return NextResponse.json(
      { collaborations, sharedByMe },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching collaborations:", error);
    return NextResponse.json({ error: "Failed to fetch collaborations" }, { status: 500 });
  }
}
