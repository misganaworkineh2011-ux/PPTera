import { requireAuth } from "~/lib/clerk-server";
import DashboardLayout from "~/components/dashboard/DashboardLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();

  return <DashboardLayout subscriptionPlan={user.subscriptionPlan ?? "Free"}>{children}</DashboardLayout>;
}
