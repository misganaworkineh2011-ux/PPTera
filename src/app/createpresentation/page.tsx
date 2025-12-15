import { requireAuth } from "~/lib/clerk-server";
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

  return (
    <CreatePresentationClient
      maxSlides={maxSlides}
      subscriptionPlan={user?.subscriptionPlan}
      mode={mode || "ai"}
    />
  );
}
