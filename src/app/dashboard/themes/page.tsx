import { Palette, Check, Plus } from "lucide-react";

export default function ThemesPage() {
  const themes = [
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Themes</h1>
          <p className="text-sm text-slate-500">
            Customize the look and feel of your presentations
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
          <Plus size={16} /> Create Custom Theme
        </button>
      </div>

      {/* Themes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* Preview */}
            <div className="flex h-32">
              {theme.colors.map((color) => (
                <div
                  key={color}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{theme.name}</h3>
                  <p className="text-xs text-slate-500">{theme.font}</p>
                </div>
                {theme.id === "modern-blue" && (
                   <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                     <Check size={12} /> Active
                   </span>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                   Preview
                </button>
                <button className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800">
                   Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

