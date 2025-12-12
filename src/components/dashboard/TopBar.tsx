"use client";

import { Bell, Search } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex h-20 items-center justify-between bg-transparent px-8">
      {/* Left: Spacer or Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Can add breadcrumbs here */}
      </div>

      {/* Center: Modern Search */}
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="relative w-full max-w-lg transition-transform focus-within:scale-105">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Try searching 'insights'..."
            className="w-full rounded-full border-none bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Credits Badge */}
        <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 md:flex">
          <span className="flex h-2 w-2 rounded-full bg-[#06b6d4]"></span>
          <span>10 Credits</span>
        </div>
        
        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-white bg-[#06b6d4]"></span>
        </button>
      </div>
    </header>
  );
}
