import { requireAuth } from "~/lib/clerk-server";
import { db } from "~/server/db";
import { Grid, List as ListIcon, Star, Check, Palette } from "lucide-react";
import ThemesStickyHeader from "./ThemesStickyHeader";

export default async function ThemesPage() {
  const authUser = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: authUser.id },
    include: {
      themes: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!user) {
    return null;
  }

  // Default themes if user has none
  const defaultThemes = [
    {
      id: "modern-blue",
      name: "Modern Blue",
      colors: ["#1e40af", "#3b82f6", "#60a5fa", "#f8fafc"],
      font: "Inter",
    },
    {
      id: "corporate",
      name: "Corporate",
      colors: ["#0f172a", "#334155", "#cbd5e1", "#ffffff"],
      font: "Roboto",
    },
    {
      id: "creative",
      name: "Creative Pop",
      colors: ["#be185d", "#ec4899", "#fbcfe8", "#fff1f2"],
      font: "Poppins",
    },
    {
      id: "nature",
      name: "Green Nature",
      colors: ["#166534", "#22c55e", "#86efac", "#f0fdf4"],
      font: "Montserrat",
    },
    {
      id: "dark-mode",
      name: "Dark Mode",
      colors: ["#000000", "#1e293b", "#475569", "#94a3b8"],
      font: "Inter",
    },
    {
      id: "warm",
      name: "Warm Sunset",
      colors: ["#9a3412", "#f97316", "#fdba74", "#fff7ed"],
      font: "Lato",
    },
  ];

  const themes = user.themes.length > 0 
    ? user.themes.map(t => ({
        id: t.id,
        name: t.name,
        colors: (t.colors as { colors: string[] }).colors || [],
        font: (t.fonts as { font: string }).font || "Inter",
        isDefault: t.isDefault,
      }))
    : defaultThemes.map(t => ({ ...t, isDefault: t.id === "modern-blue" }));

  return (
    <div className="space-y-8 h-full">
      {/* Sticky Header Section */}
      <ThemesStickyHeader />

      {/* Filters & View Toggle */}
      <div className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#1e3a8a]/10 px-4 py-2 text-sm font-bold text-[#1e3a8a]">
            <Grid size={16} /> All
          </button>
          <button className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-[#1e3a8a]">
            <Star size={16} /> Favorites
          </button>
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

      {/* Content Display */}
      <div className="min-h-[600px]">
        {themes.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-100">
              <Palette size={28} className="text-[#06b6d4]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#1e3a8a]">
              No themes yet
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
              Create your first custom theme to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#06b6d4]/50 hover:shadow-lg hover:shadow-[#06b6d4]/10"
              >
                {/* Preview */}
                <div className="flex h-32">
                  {theme.colors.length > 0 ? (
                    theme.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1e3a8a]/10 to-[#06b6d4]/10">
                      <Palette className="text-[#06b6d4] opacity-50" size={32} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-[#1e3a8a]">{theme.name}</h3>
                      <p className="text-xs text-slate-500">{theme.font}</p>
                    </div>
                    {theme.isDefault && (
                      <span className="flex items-center gap-1 rounded-full bg-[#e0f2fe] px-2 py-1 text-xs font-bold text-[#06b6d4]">
                        <Check size={12} /> Active
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 transition hover:border-[#06b6d4] hover:bg-[#e0f2fe] hover:text-[#06b6d4]">
                      Preview
                    </button>
                    <button className="flex-1 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] py-2 text-sm font-semibold text-white shadow-md transition hover:from-[#172554] hover:to-[#0891b2]">
                      Apply
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
