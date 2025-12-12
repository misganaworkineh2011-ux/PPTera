import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import DashboardLayout from "~/components/dashboard/DashboardLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { subscriptionPlan: true },
  });

  return <DashboardLayout subscriptionPlan={user?.subscriptionPlan}>{children}</DashboardLayout>;
}

