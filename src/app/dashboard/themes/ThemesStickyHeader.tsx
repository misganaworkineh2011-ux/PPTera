"use client";

import { Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStickyContext } from "~/components/dashboard/DashboardLayout";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

export default function ThemesStickyHeader() {
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white shadow-md">
                <Palette size={18} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#0f766e] dark:text-white whitespace-nowrap">{t.themes || "Themes"}</h1>
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
        className={`transition-all duration-300 ${
          isSticky ? "opacity-0 h-0 overflow-hidden pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Empty div to maintain spacing */}
      </div>
    </>
  );
}

