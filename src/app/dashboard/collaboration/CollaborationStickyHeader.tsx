"use client";

import { Users, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStickyContext } from "~/components/dashboard/DashboardLayout";

export default function CollaborationStickyHeader() {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { setIsTitleSticky, setStickyTitleContent } = useStickyContext();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger when 50% of the header is out of view
        const sticky = entry.intersectionRatio < 0.5;
        setIsSticky(sticky);
        setIsTitleSticky(sticky);
        if (sticky) {
          setStickyTitleContent(
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
                <Users size={18} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#1e3a8a] whitespace-nowrap">Collaboration</h1>
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
        className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all duration-300 ${
          isSticky ? "opacity-0 h-0 overflow-hidden pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
            <Users size={22} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e3a8a]">Collaboration</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#06b6d4]/20 transition-all hover:from-[#172554] hover:to-[#0891b2] hover:scale-[1.02] active:scale-[0.98]">
            <UserPlus size={18} /> Invite Member
          </button>
        </div>
      </div>
    </>
  );
}

