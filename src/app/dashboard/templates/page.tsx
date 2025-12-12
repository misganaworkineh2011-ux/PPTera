import { LayoutTemplate, Filter, Search, Eye } from "lucide-react";

export default function TemplatesPage() {
  const categories = ["All", "Business", "Creative", "Education", "Minimal", "Technology"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
          <p className="text-sm text-slate-500">
            Start your next project with a professionally designed template
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <input
               type="text"
               placeholder="Search templates..."
               className="rounded-full border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
             />
           </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              i === 0
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
          >
            {/* Preview Image */}
            <div className="aspect-video w-full bg-slate-100 transition group-hover:scale-105">
              <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
                 <div className="mb-2 h-2 w-16 rounded-full bg-slate-300"></div>
                 <div className="mb-4 h-4 w-32 rounded-full bg-slate-800"></div>
                 <div className="grid w-full grid-cols-2 gap-4">
                    <div className="h-16 rounded-lg bg-slate-200"></div>
                    <div className="h-16 rounded-lg bg-slate-200"></div>
                 </div>
              </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition backdrop-blur-sm group-hover:opacity-100">
              <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-blue-50">
                Use Template
              </button>
              <button className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
                <Eye size={20} />
              </button>
            </div>

            {/* Info */}
            <div className="border-t border-slate-100 p-4">
              <h3 className="font-bold text-slate-900">Modern Pitch Deck</h3>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Business</span>
                <span>12 slides</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

