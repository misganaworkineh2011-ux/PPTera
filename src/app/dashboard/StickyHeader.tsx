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
  const { setIsTitleSticky } = useStickyContext();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const sticky = !entry.isIntersecting;
        setIsSticky(sticky);
        setIsTitleSticky(sticky);
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
    };
  }, [setIsTitleSticky]);

  return (
    <>
      {/* Sentinel element to detect when header should stick */}
      <div ref={sentinelRef} className="h-0 -mt-8" />
      
      {/* Header that becomes sticky - hides when sticky, title moves to TopBar */}
      <div
        ref={headerRef}
        className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between transition-all ${
          isSticky ? "opacity-0 h-0 overflow-hidden" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
            <FileText size={22} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1e3a8a]">Presentations</h1>
        </div>
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

