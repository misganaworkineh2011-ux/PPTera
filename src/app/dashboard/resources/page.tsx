import { Type, Smile, Image as ImageIcon, Box, Search, Download } from "lucide-react";

export default function ResourcesPage() {
  const categories = [
    { id: "fonts", name: "Fonts", icon: Type, count: 120 },
    { id: "icons", name: "Icons", icon: Smile, count: 2500 },
    { id: "photos", name: "Stock Photos", icon: ImageIcon, count: 5000 },
    { id: "components", name: "Components", icon: Box, count: 50 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
          <p className="text-sm text-slate-500">
            Access a library of assets for your presentations
          </p>
        </div>
        <div className="relative w-full max-w-xs md:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full rounded-full border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <cat.icon size={24} />
            </div>
            <span className="font-semibold text-slate-900">{cat.name}</span>
            <span className="text-xs text-slate-500">{cat.count}+ items</span>
          </button>
        ))}
      </div>

      {/* Featured Resources (Example: Icons) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Trending Icons</h2>
        <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="group flex aspect-square flex-col items-center justify-center rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition"
            >
              <Smile className="text-slate-400 group-hover:text-blue-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

