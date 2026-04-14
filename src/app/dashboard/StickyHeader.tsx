"use client";

import { FileText, Import } from "lucide-react";
import CreateProjectButton from "~/components/dashboard/CreateProjectButton";
import { useEffect, useRef, useState } from "react";
import { useStickyContext } from "~/components/dashboard/DashboardLayout";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

import { useRouter } from "next/navigation";

interface StickyHeaderProps {
  userId: string;
  credits: number;
}

export default function StickyHeader({ userId, credits }: StickyHeaderProps) {
  const router = useRouter();
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { setIsTitleSticky, setStickyTitleContent } = useStickyContext();
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

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
              <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#006482] to-[#007ea3] text-white shadow-md">
                <FileText size={16} className="lg:hidden" />
                <FileText size={18} className="hidden lg:block" />
              </div>
              <h1 className="text-lg lg:text-xl font-bold font-headline tracking-tight text-[#001f2a] whitespace-nowrap">{t.presentations || "Presentations"}</h1>
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
  }, [setIsTitleSticky, setStickyTitleContent, t]);

  return (
    <>
      {/* Sentinel element at the top to detect when header starts going out of view */}
      <div ref={sentinelRef} className="h-0 -mb-1" />

      {/* Header that becomes sticky - hidden completely based on new UI rules */}
      <div className="hidden">
      </div>
    </>
  );
}

