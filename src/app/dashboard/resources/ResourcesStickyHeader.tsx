"use client";

import { Shapes, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStickyContext } from "~/components/dashboard/DashboardLayout";

export default function ResourcesStickyHeader() {
  const [isSticky, setIsSticky] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setIsTitleSticky, setStickyTitleContent } = useStickyContext();

  useEffect(() => {
    // Only enable sticky behavior on md+ screens
    const checkMobile = () => window.innerWidth < 768;
    if (checkMobile()) {
      setIsSticky(false);
      setIsTitleSticky(false);
      setStickyTitleContent(null);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        // Trigger when 50% of the header is out of view
        const sticky = entry.intersectionRatio < 0.5;
        setIsSticky(sticky);
        setIsTitleSticky(sticky);
        if (sticky) {
          setStickyTitleContent(
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 text-white shadow-md">
                <Shapes size={18} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#1e3a8a] whitespace-nowrap">Slide Elements</h1>
            </>
          );
        } else {
          setStickyTitleContent(null);
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
      setStickyTitleContent(null);
    };
  }, [setIsTitleSticky, setStickyTitleContent]);

  return (
    <>
      {/* Sentinel element at the top to detect when header starts going out of view */}
      <div ref={sentinelRef} className="h-0 -mb-1" />
      
      {/* Header that becomes sticky - hides when sticky, title moves to TopBar */}
      <div
        ref={headerRef}
        className={`flex flex-row items-center justify-between gap-4 transition-all duration-300 ${
          isSticky ? "opacity-0 h-0 overflow-hidden pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 text-white shadow-md">
            <Shapes size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1e3a8a]">Slide Elements</h1>
            <p className="text-sm text-slate-500">Shapes, callouts, badges & icons for your slides</p>
          </div>
        </div>
        {/* Search - responsive: icon button on mobile, full bar on desktop */}
        <div className="flex items-center gap-2">
          {/* Mobile: Search icon button */}
          {!isSearchOpen && (
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="md:hidden p-2.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] transition"
            >
              <Search size={22} />
            </button>
          )}
          
          {/* Mobile: Expanded search input - fixed overlay */}
          {isSearchOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="md:hidden fixed inset-0 bg-black/20 z-40"
                onClick={() => setIsSearchOpen(false)}
              />
              {/* Search bar */}
              <div className="md:hidden fixed top-20 left-4 right-4 z-50">
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search assets..."
                    className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm font-medium text-slate-700 shadow-xl ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Desktop: Always visible search bar */}
          <div className="hidden md:block relative flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            />
          </div>
        </div>
      </div>
    </>
  );
}

