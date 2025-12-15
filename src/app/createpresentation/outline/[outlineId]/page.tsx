import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import CreatePresentationClient from "../../CreatePresentationClient";

interface OutlinePageProps {
  params: Promise<{ outlineId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function OutlinePage({ params, searchParams }: OutlinePageProps) {
  const user = await requireAuth();
  const { outlineId } = await params;
  const { mode } = await searchParams;

  // Fetch the outline from database
  const outline = await db.outline.findUnique({
    where: { id: outlineId },
  });

  // Verify outline exists and belongs to user
  if (!outline || outline.userId !== user.id) {
    notFound();
  }

  // Determine max slides based on subscription plan
  const getMaxSlides = (plan: string | null | undefined): number => {
    if (!plan) return 10;
    const planLower = plan.toLowerCase();
    if (planLower === "starter") return 25;
    if (planLower === "pro") return 50;
    if (planLower === "enterprise") return 70;
    return 10;
  };

  const maxSlides = getMaxSlides(user.subscriptionPlan);
  const metadata = outline.metadata as {
    topic?: string;
    totalSlides?: number;
    tone?: string;
    language?: string;
  };

  return (
    <CreatePresentationClient
      maxSlides={maxSlides}
      subscriptionPlan={user.subscriptionPlan}
      mode={mode || "ai"}
      existingOutline={{
        id: outline.id,
        slides: outline.slides as Array<{
          type: "title" | "content";
          title: string;
          subtitle?: string;
          bulletPoints?: string[];
        }>,
        metadata: {
          topic: metadata.topic || "",
          totalSlides: metadata.totalSlides || 0,
          tone: metadata.tone || "professional",
          language: metadata.language || "english",
        },
        status: outline.status,
      }}
    />
  );
}

