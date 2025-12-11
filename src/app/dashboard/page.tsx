import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import PresentationGenerator from "~/components/PresentationGenerator";
import Navbar from "~/components/Navbar";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-purple-50/20">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-20">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5">
                  <span className="text-sm font-semibold text-blue-700">
                    {user.credits} credits
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5">
                  <span className="text-sm font-semibold text-purple-700">
                    {user.subscriptionPlan || "Free"} Plan
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/pricing"
              className="rounded-full border-2 border-blue-600 px-6 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>

        <PresentationGenerator userId={user.id} credits={user.credits} />

        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Recent Presentations
          </h2>
          {user.presentations.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                No presentations yet
              </h3>
              <p className="text-sm text-slate-600">
                Create your first presentation above to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {user.presentations.map((pres) => (
                <div
                  key={pres.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-2xl text-white">
                    📊
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900">
                    {pres.title}
                  </h3>
                  <p className="mb-4 text-sm text-slate-600">
                    {pres.description || "AI-generated presentation"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(pres.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
