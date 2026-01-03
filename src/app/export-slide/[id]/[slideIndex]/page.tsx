"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import SlideRenderer from "~/components/presentation/SlideRenderer";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import { type SlideData } from "~/components/presentation/types";

interface ExportSlidePageProps {
  params: Promise<{ id: string; slideIndex: string }>;
}

function ExportSlideContent({ params }: ExportSlidePageProps) {
  const { id, slideIndex: slideIndexStr } = use(params);
  const searchParams = useSearchParams();
  const slideIndex = parseInt(slideIndexStr);
  const addWatermark = searchParams.get("watermark") === "true";
  const themeId = searchParams.get("theme");

  const [slide, setSlide] = useState<SlideData | null>(null);
  const [totalSlides, setTotalSlides] = useState(1);
  const [theme, setTheme] = useState<Theme>(getDefaultTheme());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSlide() {
      try {
        // Use the internal export-data endpoint that doesn't require auth
        const res = await fetch(`/api/export-data/${id}`);
        if (!res.ok) throw new Error("Failed to load presentation");
        const data = await res.json();

        const slides = data.slides || [];
        setTotalSlides(slides.length);

        if (slideIndex >= 0 && slideIndex < slides.length) {
          setSlide(slides[slideIndex]);
        } else {
          throw new Error("Slide not found");
        }

        // Resolve theme
        const resolvedThemeId = themeId || data.themeId || "sprout";
        const customThemeData = data.customTheme;

        if (resolvedThemeId.startsWith("custom-")) {
          if (customThemeData) {
            const customTheme = convertCustomThemeToTheme(customThemeData);
            setTheme(customTheme);
          }
        } else {
          const staticTheme = getThemeById(resolvedThemeId);
          if (staticTheme) setTheme(staticTheme);
        }
      } catch (err: unknown) {
        console.error("ExportSlidePage Load Error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load presentation"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchSlide();
  }, [id, slideIndex, themeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-[1920px] h-[1080px] bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error || !slide) {
    return (
      <div className="flex items-center justify-center w-[1920px] h-[1080px] bg-slate-100 text-slate-800">
        <p className="text-lg font-medium">{error || "Slide not found"}</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-[1920px] h-[1080px] overflow-hidden"
      data-slide-container="true"
      style={{ background: theme.pageBackgroundGradient || theme.pageBackground || theme.colors.background }}
    >
      <SlideRenderer
        slide={slide}
        index={slideIndex}
        totalSlides={totalSlides}
        theme={theme}
        isOwner={false}
        isFullscreen={true}
        isHovered={false}
        isEditing={false}
        editingText={null}
        onStartEditing={() => {}}
        onUpdateContent={() => {}}
        onFinishEditing={() => {}}
        onAddBullet={() => {}}
        onDeleteBullet={() => {}}
      />

      {/* Watermark for free users - larger with solid background */}
      {addWatermark && (
        <div 
          className="absolute bottom-8 right-10 flex items-center gap-3 z-50 px-5 py-3 rounded-lg"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <img src="/logo.png" alt="PPTMaster" className="h-8 w-auto" />
          <span className="text-xl font-semibold text-white">
            Made with PPTMaster
          </span>
        </div>
      )}
    </div>
  );
}

export default function ExportSlidePage(props: ExportSlidePageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-[1920px] h-[1080px] bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      }
    >
      <ExportSlideContent {...props} />
    </Suspense>
  );
}
