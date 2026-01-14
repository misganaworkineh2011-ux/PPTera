import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { notFound, redirect } from "next/navigation";
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
      promptHint?: string | null; // Legacy
      pexelsPromptHint?: string | null;
      aiPromptHint?: string | null;
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
    promptHint?: string | null; // Legacy
    pexelsPromptHint?: string | null;
    aiPromptHint?: string | null;
  };
  // Content layout hint (e.g., "boxes", "bullets", "sequence")
  contentLayoutHint?: string;
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

  // Redirect to create page if outline has no content (empty slides)
  const storedSlides = outline.slides as StoredSlide[];
  if (!storedSlides || storedSlides.length === 0) {
    redirect(`/createpresentation?mode=${mode || "ai"}`);
  }

  // Determine max slides based on subscription plan
  const getMaxSlides = (plan: string | null | undefined): number => {
    if (!plan) return 10;
    const planLower = plan.toLowerCase();
    if (planLower === "plus") return 20;
    if (planLower === "pro") return 60;
    if (planLower === "ultra") return 75;
    return 10;
  };

  const maxSlides = getMaxSlides(user.subscriptionPlan);
  const userCredits = user.credits ?? 0;
  const metadata = outline.metadata as {
    topic?: string;
    totalSlides?: number;
    tone?: string;
    language?: string;
  };

  // Parse slides with full visual metadata
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
    // Include content layout hint for box layouts
    // Support both new field (contentLayoutHint) and legacy field (contentLayout)
    contentLayoutHint: slide.contentLayoutHint || (slide as any).contentLayout,
  }));

  return (
    <CreatePresentationClient
      maxSlides={maxSlides}
      subscriptionPlan={user.subscriptionPlan}
      userCredits={userCredits}
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

