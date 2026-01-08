import { redirect } from "next/navigation";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import DashboardLayout from "~/components/dashboard/DashboardLayout";
import { SettingsProvider } from "~/contexts/SettingsContext";
import { DashboardProvider } from "~/contexts/DashboardContext";

const LOG_PREFIX = "[Dashboard Layout]";

export default async function Layout({ children }: { children: React.ReactNode }) {
  try {
    // requireAuth will handle user creation if needed and redirect on failure
    const authUser = await requireAuth();

    // Fetch minimal user data for initial render - avoid over-fetching
    // Use the user returned from requireAuth directly, but fetch fresh data for consistency
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

    // If user still not found (shouldn't happen, but handle gracefully)
    if (!user) {
      console.error(`${LOG_PREFIX} ERROR: User not found after requireAuth`, {
        authUserId: authUser.id,
        clerkId: authUser.clerkId,
      });
      redirect("/sign-in?error=user_not_found");
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
            {children}
          </DashboardLayout>
        </DashboardProvider>
      </SettingsProvider>
    );
  } catch (error) {
    // Catch any unexpected errors and redirect gracefully
    console.error(`${LOG_PREFIX} Unexpected error:`, error);
    redirect("/sign-in?error=unexpected_error");
  }
}
