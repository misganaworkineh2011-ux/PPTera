import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { Type, Smile, Image as ImageIcon, Box, Grid, List as ListIcon, Star } from "lucide-react";
import ResourcesStickyHeader from "./ResourcesStickyHeader";

export default async function ResourcesPage() {
  const authUser = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: authUser.id },
    include: {
      resources: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!user) {
    return null;
  }

  const categories = [
    { id: "fonts", name: "Fonts", icon: Type, count: 120 },
    { id: "icons", name: "Icons", icon: Smile, count: 2500 },
    { id: "photos", name: "Stock Photos", icon: ImageIcon, count: 5000 },
    { id: "components", name: "Components", icon: Box, count: 50 },
  ];

  return (
    <div className="space-y-8 h-full">
      {/* Sticky Header Section */}
      <ResourcesStickyHeader />

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1e3a8a]/10 px-4 py-2 text-sm font-bold text-[#1e3a8a]">
            <Grid size={16} /> All
          </button>
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]">
            <Star size={16} /> Favorites
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              <cat.icon size={16} />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
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

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[#06b6d4] hover:bg-[#e0f2fe]/30 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 text-[#06b6d4] transition-colors group-hover:from-[#1e3a8a]/20 group-hover:to-[#06b6d4]/20">
              <cat.icon size={24} />
            </div>
            <span className="font-bold text-slate-900">{cat.name}</span>
            <span className="text-xs font-medium text-slate-500">{cat.count}+ items</span>
          </button>
        ))}
      </div>

      {/* Content Display */}
      <div className="min-h-[600px]">
        {user.resources.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-100">
              <Box size={28} className="text-[#06b6d4]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#1e3a8a]">
              No resources yet
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
              Browse categories to explore available resources.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Resources Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[#1e3a8a]">Trending Icons</h2>
              <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {user.resources.filter(r => r.type === "icon").slice(0, 20).map((resource) => (
                  <div
                    key={resource.id}
                    className="group flex aspect-square flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 transition-all hover:border-[#06b6d4] hover:bg-[#e0f2fe]/30 cursor-pointer"
                  >
                    <Smile className="text-slate-400 transition-colors group-hover:text-[#06b6d4]" size={24} />
                  </div>
                ))}
                {user.resources.filter(r => r.type === "icon").length === 0 && (
                  Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="group flex aspect-square flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 transition-all hover:border-[#06b6d4] hover:bg-[#e0f2fe]/30 cursor-pointer"
                    >
                      <Smile className="text-slate-400 transition-colors group-hover:text-[#06b6d4]" size={24} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
