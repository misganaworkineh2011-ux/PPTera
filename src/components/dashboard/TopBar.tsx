"use client";

import { Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useStickyContext } from "./DashboardLayout";

export default function TopBar() {
  const { isTitleSticky, stickyTitleContent } = useStickyContext();
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between bg-[#F8F9FA] px-8 border-b border-slate-100/50 backdrop-blur-sm">
      {/* Left: Shows sticky title when active */}
      <div className={`flex items-center gap-4 transition-all ${isTitleSticky ? "flex-1 min-w-[280px]" : "flex-1"}`}>
        {isTitleSticky && stickyTitleContent && (
          <div className="flex items-center gap-3">
            {stickyTitleContent}
          </div>
        )}
      </div>

      {/* Center: Modern Search - Adjusts when title is sticky */}
      <div className={`flex items-center transition-all ${isTitleSticky ? "flex-1 justify-end px-4" : "flex-1 justify-center px-8"}`}>
        <div className={`relative transition-all ${isTitleSticky ? "w-full max-w-xs" : "w-full max-w-lg"}`}>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Try searching 'insights'..."
            className={`w-full rounded-full border-none bg-white pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 transition-all ${isTitleSticky ? "py-2.5" : "py-3"}`}
          />
        </div>
      </div>

      {/* Right: Actions - Always Fixed */}
      <div className="flex items-center gap-3 shrink-0">
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
        
        {/* User Profile */}
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-10 w-10 ring-2 ring-slate-200 hover:ring-[#06b6d4] transition-all",
            },
          }}
        />
      </div>
    </header>
  );
}
