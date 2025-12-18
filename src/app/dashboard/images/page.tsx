import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { Grid, List as ListIcon, Star, Image as ImageIcon, MoreHorizontal, Search } from "lucide-react";
import ImagesStickyHeader from "./ImagesStickyHeader";
import Image from "next/image";

export default async function ImagesPage() {
  const authUser = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: authUser.id },
    include: {
      images: {
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
      {/* Sticky Header Section */}
      <ImagesStickyHeader userId={user.id} credits={user.credits} />

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1e3a8a]/10 px-4 py-2 text-sm font-bold text-[#1e3a8a]">
            <Grid size={16} /> All
          </button>
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]">
            <Star size={16} /> Favorites
          </button>
          {["Backgrounds", "Logos", "Icons", "Team"].map((tag) => (
            <button
              key={tag}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]"
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or tag..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
          </div>
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

      {/* Drag & Drop Zone */}
      <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition hover:bg-[#e0f2fe]/30 hover:border-[#06b6d4]/50">
        <div className="flex items-center gap-2 text-[#06b6d4]">
          <ImageIcon size={20} />
          <span className="font-semibold">Drop images here to upload</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Supports JPG, PNG, WEBP up to 5MB
        </p>
      </div>

      {/* Content Display */}
      <div className="min-h-[600px]">
        {user.images.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-100">
              <ImageIcon size={28} className="text-[#06b6d4]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#1e3a8a]">
              No images yet
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
              Upload your first image to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {user.images.map((img) => (
              <div
                key={img.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-lg hover:shadow-[#06b6d4]/10 cursor-pointer"
              >
                {/* Image Thumbnail */}
                <div className="aspect-square w-full bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 relative overflow-hidden">
                  {/* Actual image thumbnail (fallback to logo if url missing) */}
                  {img.url ? (
                    <Image
                      src={img.url}
                      alt={img.filename}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <Image
                        src="/logo.png"
                        alt={img.filename}
                        width={150}
                        height={150}
                        className="object-contain opacity-60 group-hover:opacity-80 transition-opacity"
                      />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 group-hover:from-[#1e3a8a]/10 group-hover:to-[#06b6d4]/10 transition-colors" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="self-end">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/50 bg-transparent text-[#06b6d4] focus:ring-[#06b6d4]"
                      />
                    </div>
                    <div className="text-white">
                      <p className="truncate text-xs font-medium">{img.filename}</p>
                      <p className="text-[10px] opacity-75">Uploaded</p>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col p-4">
                  <h3 className="mb-2 line-clamp-1 text-sm font-bold text-[#1e3a8a]" title={img.filename}>
                    {img.filename}
                  </h3>
                  
                  {/* Tags */}
                  {img.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {img.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-semibold text-[#06b6d4]"
                        >
                          {tag}
                        </span>
                      ))}
                      {img.tags.length > 2 && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          +{img.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Footer Info */}
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] flex items-center justify-center text-[10px] text-white font-bold">
                        {user.name ? user.name[0]?.toUpperCase() : "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-slate-700">Uploaded by you</span>
                        <span className="text-[10px] text-slate-400">Recently</span>
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
