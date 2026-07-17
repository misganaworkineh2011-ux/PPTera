"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SlideScaler from "~/components/presentation/SlideScaler";
import { TitleSlide } from "~/app/presentation/[slug]/components/TitleSlide";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import { coverUsesFullBleed, type SlideData } from "~/components/presentation/types";

// Heavy renderer loads on demand — only when a card is actually hovered.
const SlideRenderer = dynamic(() => import("~/components/presentation/SlideRenderer"), {
  ssr: false,
});

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
  const theme = data.theme;
  const isTitleCover = slide.type === "title" && !slide.slideLayout;
  const coverFullBleed = coverUsesFullBleed(slide.coverLayout);
  const titleImageUrl =
    slide.image?.url && slide.image.source !== "placeholder" ? slide.image.url : null;

  return (
    <div
      className="absolute inset-0 z-[6] overflow-hidden pointer-events-none animate-in fade-in duration-300"
      style={{
        background:
          theme.pageBackgroundGradient || theme.pageBackground || theme.colors.background,
      }}
    >
      {isTitleCover ? (
        <>
          {coverFullBleed && titleImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={titleImageUrl}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <SlideScaler>
            <TitleSlide
              slide={slide}
              index={index}
              totalSlides={data.slides.length}
              theme={theme}
              hasImage={!!titleImageUrl && coverFullBleed}
              isOwner={false}
              isFullscreen={false}
              isHovered={false}
              isEditing={false}
              editingText={null}
              onStartEditing={() => {}}
              onUpdateContent={() => {}}
              onFinishEditing={() => {}}
            />
          </SlideScaler>
        </>
      ) : (
        <SlideScaler>
          <SlideRenderer
            slide={slide}
            index={index}
            totalSlides={data.slides.length}
            theme={theme}
            isOwner={false}
            isFullscreen={false}
            isHovered={false}
            isEditing={false}
            editingText={null}
            onStartEditing={() => {}}
            onUpdateContent={() => {}}
            onFinishEditing={() => {}}
            onAddBullet={() => {}}
            onDeleteBullet={() => {}}
          />
        </SlideScaler>
      )}

      {/* Slide position dots */}
      <div className="absolute bottom-2 right-2 flex gap-1">
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
