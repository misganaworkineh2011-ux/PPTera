import { Suspense } from "react";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import StickyHeader from "./StickyHeader";
import DashboardContentWrapper from "./DashboardContentWrapper";
import PresentationsGridSkeleton from "./PresentationsGridSkeleton";

// Separate async component for presentations data
async function PresentationsGrid({ userId, userName }: { userId: string; userName: string }) {
  const presentations = await db.presentation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      isPublic: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      thumbnailUrl: true,
      shareToken: true,
    },
  });

  return <DashboardContentWrapper presentations={presentations} userName={userName} />;
}

export default async function DashboardPage() {
  const authUser = await requireAuth();

  // Fetch only user data first (fast query)
  const user = await db.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      credits: true,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 h-full">
      <StickyHeader userId={user.id} credits={user.credits} />
      <Suspense fallback={<PresentationsGridSkeleton />}>
        <PresentationsGrid userId={user.id} userName={user.name ?? ""} />
      </Suspense>
    </div>
  );
}
