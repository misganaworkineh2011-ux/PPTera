import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { Filter, Grid, List as ListIcon, MoreHorizontal, Upload, Import, Star, FileText } from "lucide-react";
import CreateProjectButton from "~/components/dashboard/CreateProjectButton";
import Image from "next/image";
import StickyHeader from "./StickyHeader";

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
        take: 50,
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8 h-full">
      {/* Sticky Header Section */}
      <StickyHeader userId={user.id} credits={user.credits} />

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1e3a8a]/10 px-4 py-2 text-sm font-bold text-[#1e3a8a]">
            <Grid size={16} /> All
          </button>
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]">
            <Star size={16} /> Favorites
          </button>
        </div>

        <div className="flex items-center gap-4">
           <button className="text-slate-400 hover:text-slate-600">
              <Filter size={18} />
           </button>
           <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-[#1e3a8a] shadow-sm transition">
              <Grid size={20} />
              <span className="text-sm font-medium">Grid</span>
            </button>
            <button className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-500 transition hover:text-slate-700">
              <ListIcon size={20} />
              <span className="text-sm font-medium">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className="min-h-[600px]">
        {user.presentations.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-100">
              <Upload size={28} className="text-[#06b6d4]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#1e3a8a]">
              No presentations yet
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
              Create your first AI-powered deck in seconds.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {user.presentations.map((pres) => (
              <div
                key={pres.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-lg hover:shadow-[#06b6d4]/10 cursor-pointer"
              >
                {/* Large Thumbnail (Top Half) */}
                <div className="aspect-[16/10] w-full bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 relative overflow-hidden">
                   {/* Logo as Thumbnail Placeholder */}
                   <div className="absolute inset-0 flex items-center justify-center p-4">
                      <Image
                        src="/logo.png"
                        alt={pres.title}
                        width={200}
                        height={120}
                        className="object-contain opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                   </div>
                   {/* Gradient Overlay */}
                   <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 group-hover:from-[#1e3a8a]/10 group-hover:to-[#06b6d4]/10 transition-colors" />
                </div>

                {/* Content Section */}
                <div className="flex flex-col p-5">
                  <h3 className="mb-3 line-clamp-1 text-lg font-bold text-[#1e3a8a]" title={pres.title}>
                    {pres.title}
                  </h3>
                  
                  {/* Footer Info */}
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                     <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-[10px] text-white font-bold">
                           {user.name ? user.name[0]?.toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-semibold text-slate-700">Created by you</span>
                           <span className="text-[10px] text-slate-400">Last viewed 2h ago</span>
                        </div>
                     </div>
                     <button className="text-slate-300 hover:text-[#06b6d4]">
                        <MoreHorizontal size={16} />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
