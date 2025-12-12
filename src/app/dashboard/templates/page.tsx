import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { Grid, List as ListIcon, Star, Eye, LayoutTemplate } from "lucide-react";
import TemplatesStickyHeader from "./TemplatesStickyHeader";
import Image from "next/image";

export default async function TemplatesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      templates: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const categories = ["All", "Business", "Creative", "Education", "Minimal", "Technology"];

  return (
    <div className="space-y-8 h-full">
      {/* Sticky Header Section */}
      <TemplatesStickyHeader />

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-[#1e3a8a]/10 text-[#1e3a8a] font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]"
              }`}
            >
              {i === 0 && <Grid size={16} />}
              {cat}
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

      {/* Content Display */}
      <div className="min-h-[600px]">
        {user.templates.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-100">
              <LayoutTemplate size={28} className="text-[#06b6d4]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#1e3a8a]">
              No templates yet
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
              Browse templates to get started with your presentation.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {user.templates.map((template) => (
              <div
                key={template.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-lg hover:shadow-[#06b6d4]/10 cursor-pointer"
              >
                {/* Preview Image */}
                <div className="aspect-video w-full bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10 relative overflow-hidden">
                  {/* Logo as Placeholder - replace with actual template preview when available */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Image
                      src="/logo.png"
                      alt={template.name}
                      width={200}
                      height={120}
                      className="object-contain opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 group-hover:from-[#1e3a8a]/10 group-hover:to-[#06b6d4]/10 transition-colors" />

                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition backdrop-blur-sm group-hover:opacity-100">
                    <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#1e3a8a] transition hover:bg-[#e0f2fe]">
                      Use Template
                    </button>
                    <button className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30">
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="border-t border-slate-50 p-4">
                  <h3 className="font-bold text-[#1e3a8a]">{template.name}</h3>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{template.category}</span>
                    <span>Template</span>
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
