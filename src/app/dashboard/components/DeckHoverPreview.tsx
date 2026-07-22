"use client";

import { useEffect, useState } from "react";
import DeckSlideView from "./DeckSlideView";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import { type SlideData } from "~/components/presentation/types";

interface PreviewData {
  slides: SlideData[];
  theme: Theme;
}

// One in-flight/settled fetch per deck for the whole dashboard session.
const previewCache = new Map<string, Promise<PreviewData | null>>();

function loadPreview(presentationId: string): Promise<PreviewData | null> {
  const cached = previewCache.get(presentationId);
  if (cached) return cached;
  const promise = fetch(`/api/export-data/${presentationId}`)
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      const slides: SlideData[] = (data.slides ?? []).slice(0, 3);
      if (slides.length === 0) return null;

      let theme = getDefaultTheme();
      const themeId: string = data.themeId || "corporate-clean";
      if (themeId.startsWith("custom-") && data.customTheme) {
        theme = convertCustomThemeToTheme(data.customTheme);
      } else {
        theme = getThemeById(themeId) ?? getDefaultTheme();
      }
      return { slides, theme };
    })
    .catch(() => null);
  previewCache.set(presentationId, promise);
  return promise;
}

/**
 * Live hover preview: renders the deck's ACTUAL first slides (real theme,
 * layouts and text) inside the card thumbnail, cycling with `tick`.
 * Renders nothing until the deck data arrives — the card's static cover
 * stays visible underneath meanwhile.
 */
export default function DeckHoverPreview({
  presentationId,
  tick,
}: {
  presentationId: string;
  tick: number;
}) {
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPreview(presentationId).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [presentationId]);

  if (!data) return null;

  const index = tick % data.slides.length;
  const slide = data.slides[index]!;

  return (
    <div className="absolute inset-0 z-[6] overflow-hidden pointer-events-none animate-in fade-in duration-300">
      <DeckSlideView
        slide={slide}
        theme={data.theme}
        index={index}
        totalSlides={data.slides.length}
      />

      {/* Slide position dots */}
      <div className="absolute bottom-2 right-2 z-[2] flex gap-1">
        {data.slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white/90" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
