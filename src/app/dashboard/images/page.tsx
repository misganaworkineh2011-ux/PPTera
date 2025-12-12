import { Upload, Image as ImageIcon, Search, Filter } from "lucide-react";

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Image Gallery</h1>
          <p className="text-sm text-slate-500">
            Manage your project images and assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
            <Upload size={16} /> Upload Images
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div className="flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 transition hover:bg-rose-50 hover:border-rose-200">
        <div className="flex items-center gap-2 text-rose-600">
          <Upload size={20} />
          <span className="font-semibold">Drop images here to upload</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Supports JPG, PNG, WEBP up to 5MB
        </p>
      </div>

      {/* Search & Tags */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or tag..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", "Backgrounds", "Logos", "Icons", "Team"].map((tag) => (
            <button
              key={tag}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {/* Placeholder Images */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
          >
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <ImageIcon size={32} />
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-3 opacity-0 transition group-hover:opacity-100">
              <div className="self-end">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/50 bg-transparent text-blue-600 focus:ring-0"
                />
              </div>
              <div className="text-white">
                <p className="truncate text-xs font-medium">image-{i + 1}.jpg</p>
                <p className="text-[10px] opacity-75">1.2 MB</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

