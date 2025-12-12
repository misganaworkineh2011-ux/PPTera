import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import CreatePresentationForm from "./CreatePresentationForm";

export default async function CreatePresentationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      subscriptionPlan: true,
    },
  });

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
