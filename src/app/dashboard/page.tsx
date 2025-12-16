import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import StickyHeader from "./StickyHeader";
import DashboardContentWrapper from "./DashboardContentWrapper";

export default async function DashboardPage() {
  const authUser = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: authUser.id },
    include: {
      presentations: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8 h-full">
      <StickyHeader userId={user.id} credits={user.credits} />
      <DashboardContentWrapper presentations={user.presentations} userName={user.name} />
    </div>
  );
}
