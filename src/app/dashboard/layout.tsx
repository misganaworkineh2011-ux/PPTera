import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import DashboardLayout from "~/components/dashboard/DashboardLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const authUser = await requireAuth();
  
  const user = await db.user.findUnique({
    where: { id: authUser.id },
    select: {
      credits: true,
      subscriptionPlan: true,
    },
  });

  return (
    <DashboardLayout 
      subscriptionPlan={user?.subscriptionPlan ?? "Free"}
      credits={user?.credits ?? 0}
    >
      {children}
    </DashboardLayout>
  );
}
