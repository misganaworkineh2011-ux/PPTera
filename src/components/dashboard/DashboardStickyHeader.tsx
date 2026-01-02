"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useStickyContext } from "~/components/dashboard/DashboardLayout";

interface DashboardStickyHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  stickyIcon: ReactNode;
  stickyTitle: string;
  actions?: ReactNode;
}

export default function DashboardStickyHeader({
  icon,
  title,
  subtitle,
  stickyIcon,
  stickyTitle,
  actions,
}: DashboardStickyHeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
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
              <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
                {stickyIcon}
              </div>
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-[#1e3a8a] dark:text-white whitespace-nowrap">
                {stickyTitle}
              </h1>
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
  }, [setIsTitleSticky, setStickyTitleContent, stickyIcon, stickyTitle]);

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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1e3a8a] dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-neutral-400">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 md:gap-3">{actions}</div>}
      </div>
    </>
  );
}
