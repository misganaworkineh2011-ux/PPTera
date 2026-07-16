import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { LandingPageClient } from "~/app/LandingPageClient";
import DashboardLayout from "~/components/dashboard/DashboardLayout";
import { SettingsProvider } from "~/contexts/SettingsContext";
import { DashboardProvider } from "~/contexts/DashboardContext";
import StickyHeader from "./dashboard/StickyHeader";
import DashboardContentWrapper from "./dashboard/DashboardContentWrapper";
import PresentationsGridSkeleton from "./dashboard/PresentationsGridSkeleton";

// Separate async component for presentations data
async function PresentationsGrid({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
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
      },
    }),
    db.presentation.count({ where: { userId, deletedAt: null } }),
  ]);

  return (
    <DashboardContentWrapper presentations={presentations} userName={userName} totalCount={totalCount} />
  );
}

// Dashboard content for logged-in users
async function DashboardContent({ userId }: { userId: string }) {
  // Use requireAuth to ensure user exists in database (creates if missing)
  const { requireAuth } = await import("~/lib/clerk-server");
  const authUser = await requireAuth();
  
  // Fetch user data
  const user = await db.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      credits: true,
      subscriptionPlan: true,
      image: true,
    },
  });

  if (!user) {
    // This should never happen since requireAuth creates the user
    // But if it does, redirect to dashboard which will handle it properly
    redirect("/dashboard");
  }

  const initialUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    credits: user.credits,
    subscriptionPlan: user.subscriptionPlan,
    image: user.image,
  };

  return (
    <SettingsProvider>
      <DashboardProvider initialUser={initialUser}>
        <DashboardLayout
          subscriptionPlan={user.subscriptionPlan ?? "Free"}
          credits={user.credits ?? 0}
        >
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 h-full">
            <StickyHeader userId={user.id} credits={user.credits} />
            <Suspense fallback={<PresentationsGridSkeleton />}>
              <PresentationsGrid userId={user.id} userName={user.name ?? ""} />
            </Suspense>
          </div>
        </DashboardLayout>
      </DashboardProvider>
    </SettingsProvider>
  );
}

// Server-rendered landing page with critical SEO content
function LandingPageServer() {
  return <LandingPageClient currentLang="en" />;
}

export default async function HomePage() {
  const { userId } = await auth();

  // If logged in, show dashboard directly on home page
  if (userId) {
    return <DashboardContent userId={userId} />;
  }

  // If not logged in, show server-rendered landing page for SEO
  return <LandingPageServer />;
}
