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
    const observer = new IntersectionObserver(
      ([entry]) => {
        const sticky = !entry.isIntersecting;
        setIsSticky(sticky);
        setIsTitleSticky(sticky);
        // Don't show sticky title anymore since it's always in TopBar
        setStickyTitleContent(null);
      },
      { threshold: [0] }
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
      {/* Sentinel element to detect when header should stick */}
      <div ref={sentinelRef} className="h-0 -mt-8" />
      
      {/* Header that becomes sticky - hides when sticky */}
      <div
        ref={headerRef}
        className={`transition-all ${
          isSticky ? "opacity-0 h-0 overflow-hidden" : ""
        }`}
      >
        {/* Action buttons on the left */}
        <div className="flex items-center gap-3">
          <CreateProjectButton userId={userId} credits={credits} />
          <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-[#1e3a8a] hover:border-[#1e3a8a]/20">
            <Import size={18} /> Import
          </button>
        </div>
      </div>
    </>
  );
}

