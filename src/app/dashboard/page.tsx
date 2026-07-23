import { Suspense } from "react";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import StickyHeader from "./StickyHeader";
import DashboardContentWrapper from "./DashboardContentWrapper";
import PresentationsGridSkeleton from "./PresentationsGridSkeleton";

// Force dynamic rendering to always get fresh data
export const dynamic = "force-dynamic";

// Separate async component for presentations data
async function PresentationsGrid({ userId, userName }: { userId: string; userName: string }) {
  // Fetch presentations and total count in parallel
  // Keep this select in lockstep with the one in src/app/page.tsx — both
  // routes render the same dashboard and must ship the same card data
  // (soft-deleted decks excluded, live-cover + tag fields included).
  const [presentations, totalCount] = await Promise.all([
    db.presentation.findMany({
      where: { userId, deletedAt: null },
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
        outlineId: true,
        tags: true,
        viewCount: true,
        slideCount: true,
        previewImages: true,
        coverSlide: true,
        themeId: true,
      },
    }),
    db.presentation.count({
      where: { userId, deletedAt: null },
    }),
  ]);

  return <DashboardContentWrapper presentations={presentations} userName={userName} totalCount={totalCount} />;
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
