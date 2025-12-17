"use client";

import { Palette, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStickyContext } from "~/components/dashboard/DashboardLayout";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface ThemesStickyHeaderProps {
  onCreateClick?: () => void;
}

export default function ThemesStickyHeader({ onCreateClick }: ThemesStickyHeaderProps) {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { setIsTitleSticky, setStickyTitleContent } = useStickyContext();
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
                <Palette size={18} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#1e3a8a] dark:text-white whitespace-nowrap">{t.themes || "Themes"}</h1>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-md">
            <Palette size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1e3a8a] dark:text-white">{t.myThemes || "My Themes"}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.themesSubtitle || "Create and manage your custom presentation themes"}</p>
          </div>
        </div>
        <button 
          onClick={onCreateClick}
          className="flex items-center gap-1.5 md:gap-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-white shadow-lg shadow-[#06b6d4]/20 transition-all hover:from-[#172554] hover:to-[#0891b2] hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
        >
          <Plus size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">{t.createCustomTheme || "Create Custom Theme"}</span>
          <span className="sm:hidden">{t.createBtn || "Create"}</span>
        </button>
      </div>
    </>
  );
}

