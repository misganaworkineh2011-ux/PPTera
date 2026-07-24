import { redirect, unstable_rethrow } from "next/navigation";
import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import DashboardLayout from "~/components/dashboard/DashboardLayout";
import { SettingsProvider } from "~/contexts/SettingsContext";
import { DashboardProvider } from "~/contexts/DashboardContext";

// The dashboard is auth-gated (Clerk reads request headers), so it can never
// be statically prerendered. Declaring that stops `next build` from even
// attempting it — without this, the prerender bails with DYNAMIC_SERVER_USAGE
// errors on every /dashboard/* route.
export const dynamic = "force-dynamic";

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
          {/* Subtle background gradient to add a modern touch to the content area */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden object-cover select-none isolate z-0">
             <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#14b8a6]/5 blur-[120px] mix-blend-screen" />
             <div className="absolute top-1/2 right-[10%] w-[500px] h-[500px] rounded-full bg-[#14b8a6]/5 blur-[100px] opacity-70 mix-blend-screen" />
             <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] rounded-full bg-[#10b981]/5 blur-[100px] opacity-50 mix-blend-screen" />
          </div>
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
    // Next.js control-flow errors (redirect from requireAuth, notFound,
    // dynamic-server-usage during prerender) MUST propagate — swallowing them
    // breaks builds and turns clean sign-in redirects into error redirects.
    unstable_rethrow(error);
    // Catch any genuinely unexpected errors and redirect gracefully
    console.error(`${LOG_PREFIX} Unexpected error:`, error);
    redirect("/sign-in?error=unexpected_error");
  }
}
