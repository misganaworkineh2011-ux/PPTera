import { Suspense } from "react";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import ImagesPageClient from "./ImagesPageClient";
import ImagesGridSkeleton from "~/app/dashboard/images/ImagesGridSkeleton";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

// Async component for images data
async function ImagesGrid({ userId }: { userId: string }) {
  const [user, images] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        credits: true,
        subscriptionPlan: true,
      },
    }),
    db.image.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        url: true,
        filename: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) return null;

  return (
    <ImagesPageClient
      userId={user.id}
      credits={user.credits}
      userName={user.name}
      initialImages={images}
      subscriptionPlan={user.subscriptionPlan}
    />
  );
}

export default async function ImagesPage() {
  const authUser = await requireAuth();

  return (
    <Suspense fallback={<ImagesGridSkeleton />}>
      <ImagesGrid userId={authUser.id} />
    </Suspense>
  );
}
