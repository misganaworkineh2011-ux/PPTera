import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import ImagesPageClient from "./ImagesPageClient";

export default async function ImagesPage() {
  const authUser = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: authUser.id },
    include: {
      images: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!user) {
    return null;
  }

  return (
    <ImagesPageClient 
      userId={user.id} 
      credits={user.credits} 
      userName={user.name}
      initialImages={user.images}
      subscriptionPlan={user.subscriptionPlan}
    />
  );
}
