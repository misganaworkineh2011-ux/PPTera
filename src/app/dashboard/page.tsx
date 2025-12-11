import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import PresentationGenerator from "~/components/PresentationGenerator";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      presentations: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Credits: {user.credits} | Plan: {user.subscriptionPlan || "Free"}
            </p>
          </div>
        </div>

        <PresentationGenerator userId={user.id} credits={user.credits} />

        <div className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Recent Presentations</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.presentations.map((pres) => (
              <div
                key={pres.id}
                className="rounded-lg border bg-white p-6 shadow-sm"
              >
                <h3 className="mb-2 font-semibold">{pres.title}</h3>
                <p className="mb-4 text-sm text-gray-600">
                  {pres.description || "No description"}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(pres.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
