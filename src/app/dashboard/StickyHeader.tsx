"use client";

import { FileText, Import } from "lucide-react";
import CreateProjectButton from "~/components/dashboard/CreateProjectButton";
import { useEffect, useRef, useState } from "react";
import { useStickyContext } from "~/components/dashboard/DashboardLayout";

interface StickyHeaderProps {
  userId: string;
  credits: number;
}

export default function StickyHeader({ userId, credits }: StickyHeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { setIsTitleSticky, setStickyTitleContent } = useStickyContext();

  useEffect(() => {
    // Only enable sticky behavior on md+ screens
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
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
              <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
                <FileText size={16} className="lg:hidden" />
                <FileText size={18} className="hidden lg:block" />
              </div>
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-[#1e3a8a] whitespace-nowrap">Presentations</h1>
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
      
      {/* Header that becomes sticky - hides when sticky */}
      <div
        ref={headerRef}
        className={`flex flex-row items-center justify-between gap-4 transition-all duration-300 ${
          isSticky ? "opacity-0 h-0 overflow-hidden pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
            <FileText size={22} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e3a8a]">Presentations</h1>
        </div>
        
        {/* Action buttons - right aligned */}
        <div className="flex items-center gap-2 md:gap-3">
          <CreateProjectButton userId={userId} credits={credits} />
          <button className="flex items-center gap-1.5 md:gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-[#1e3a8a] hover:border-[#1e3a8a]/20 whitespace-nowrap">
            <Import size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>
      </div>
    </>
  );
}

