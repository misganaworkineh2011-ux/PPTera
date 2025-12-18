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
    if (planLower === "starter") return 25;
    if (planLower === "pro") return 50;
    if (planLower === "enterprise") return 70;
    return 10; // Default to free
  };

  const maxSlides = getMaxSlides(user?.subscriptionPlan);

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

  // Extract title from metadata
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
    };
  });

  return (
    <CreatePresentationClient
      maxSlides={maxSlides}
      subscriptionPlan={user?.subscriptionPlan}
      mode={mode || "ai"}
      recentOutlines={recentOutlines}
    />
  );
}
