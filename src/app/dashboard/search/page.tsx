import { Search as SearchIcon, FileText, Image as ImageIcon, BarChart } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      {/* Header with Search Input */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Search</h1>
          <p className="text-sm text-slate-500">
            Find everything across your workspace
          </p>
        </div>
        <div className="relative w-full max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for presentations, images, charts..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            autoFocus
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["All", "Presentations", "Images", "Charts", "Templates"].map((filter, i) => (
          <button
            key={filter}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              i === 0
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-8">
        {/* Presentations Group */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" /> Presentations
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <div className="rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition">
                <h3 className="font-semibold text-slate-900">Q4 Marketing Strategy</h3>
                <p className="text-xs text-slate-500">Updated 2 hours ago</p>
             </div>
             <div className="rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer transition">
                <h3 className="font-semibold text-slate-900">Project Alpha Pitch</h3>
                <p className="text-xs text-slate-500">Updated yesterday</p>
             </div>
          </div>
        </div>

        {/* Images Group */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon size={20} className="text-purple-500" /> Images
          </h2>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 lg:grid-cols-8">
             {Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="aspect-square rounded-lg bg-slate-100 hover:opacity-80 cursor-pointer"></div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

