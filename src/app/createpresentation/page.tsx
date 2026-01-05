import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import CreatePresentationClient from "./CreatePresentationClient";

interface PageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function CreatePresentationPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const { mode } = await searchParams;

  // Determine max slides based on subscription plan
  const getMaxSlides = (plan: string | null | undefined): number => {
    if (!plan) return 10; // Free account
    const planLower = plan.toLowerCase();
    if (planLower === "plus") return 20;
    if (planLower === "pro") return 60;
    if (planLower === "ultra") return 75;
    return 10; // Default to free
  };

  const maxSlides = getMaxSlides(user?.subscriptionPlan);
  const userCredits = user?.credits ?? 0;

  // Fetch only the first 3 completed outlines for initial display
  const outlines = await db.outline.findMany({
    where: {
      userId: user.id,
      status: "completed",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3, // Only fetch 3 initially, more will be loaded on "See More" click
  });

  // Get presentation counts for these outlines using the outlineId column
  const outlineIds = outlines.map(o => o.id);
  const presentationCounts = outlineIds.length > 0 
    ? await db.presentation.groupBy({
        by: ['outlineId'],
        where: {
          userId: user.id,
          outlineId: {
            in: outlineIds,
          },
        },
        _count: {
          id: true,
        },
      })
    : [];

  // Build a map of outlineId -> count
  const presentationCountByOutline = new Map<string, number>();
  for (const item of presentationCounts) {
    if (item.outlineId) {
      presentationCountByOutline.set(item.outlineId, item._count.id);
    }
  }

  // Extract title from metadata and include presentation count
  const recentOutlines = outlines.map((outline) => {
    const metadata = outline.metadata as {
      topic?: string;
      totalSlides?: number;
      tone?: string;
      language?: string;
    };

    return {
      id: outline.id,
      title: metadata.topic || "Untitled Presentation",
      createdAt: outline.createdAt.toISOString(),
      presentationCount: presentationCountByOutline.get(outline.id) || 0,
    };
  });

  return (
    <CreatePresentationClient
      maxSlides={maxSlides}
      subscriptionPlan={user?.subscriptionPlan}
      userCredits={userCredits}
      mode={mode || "ai"}
      recentOutlines={recentOutlines}
    />
  );
}
