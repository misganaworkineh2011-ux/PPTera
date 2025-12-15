import { requireAuth } from "~/lib/clerk-server";
import CreatePresentationForm from "./CreatePresentationForm";

export default async function CreatePresentationPage() {
  const user = await requireAuth();

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

  return <CreatePresentationForm maxSlides={maxSlides} subscriptionPlan={user?.subscriptionPlan} />;
}
