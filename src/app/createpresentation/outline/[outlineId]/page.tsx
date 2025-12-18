import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import CreatePresentationClient from "../../CreatePresentationClient";
import type { Slide } from "~/lib/dashboard/hooks/useOutlineStream";

interface OutlinePageProps {
  params: Promise<{ outlineId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

// Type for the raw slide data stored in the database
interface StoredSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  // Visual metadata from outline generation
  semanticIntent?: string;
  visualStrategy?: {
    primary: string;
    pattern: string;
    emphasis: string;
  };
  assets?: {
    icons: string[];
    image: {
      required: boolean;
      style?: string | null;
      promptHint?: string | null;
    };
    chart?: {
      type: string;
      purpose: string;
    } | null;
  };
  // Title slide specific image metadata
  image?: {
    required: boolean;
    style?: string | null;
    promptHint?: string | null;
  };
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

  // Parse slides with full visual metadata
  const storedSlides = outline.slides as StoredSlide[];
  const slides: Slide[] = storedSlides.map(slide => ({
    type: slide.type,
    title: slide.title,
    subtitle: slide.subtitle,
    bulletPoints: slide.bulletPoints,
    // Include visual metadata
    semanticIntent: slide.semanticIntent,
    visualStrategy: slide.visualStrategy,
    assets: slide.assets,
    image: slide.image,
  }));

  return (
    <CreatePresentationClient
      maxSlides={maxSlides}
      subscriptionPlan={user.subscriptionPlan}
      mode={mode || "ai"}
      existingOutline={{
        id: outline.id,
        slides,
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

