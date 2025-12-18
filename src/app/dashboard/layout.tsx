import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import DashboardLayout from "~/components/dashboard/DashboardLayout";
import { SettingsProvider } from "~/contexts/SettingsContext";
import { DashboardProvider } from "~/contexts/DashboardContext";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const authUser = await requireAuth();
  
  // Fetch minimal user data for initial render - avoid over-fetching
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

  const initialUser = user ? {
    id: user.id,
    name: user.name,
    email: user.email,
    credits: user.credits,
    subscriptionPlan: user.subscriptionPlan,
    image: user.image,
  } : null;

  return (
    <SettingsProvider>
      <DashboardProvider initialUser={initialUser}>
        <DashboardLayout 
          subscriptionPlan={user?.subscriptionPlan ?? "Free"}
          credits={user?.credits ?? 0}
        >
          {children}
        </DashboardLayout>
      </DashboardProvider>
    </SettingsProvider>
  );
}
