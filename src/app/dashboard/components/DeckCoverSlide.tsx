"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import DeckSlideView from "./DeckSlideView";
import { getThemeById } from "~/lib/themes";
import { type SlideData } from "~/components/presentation/types";

function isRenderableSlide(value: unknown): value is SlideData {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as { title?: unknown }).title === "string"
  );
}

/**
 * Static card cover: the deck's REAL first slide rendered live with its own
 * theme, replacing the flat thumbnail image. Mounts lazily (viewport-aware)
 * so 50 cards don't instantiate 50 slide renderers up front. Returns null for
 * custom themes (their palette isn't denormalized) and malformed data — the
 * card's thumbnail/monogram underneath stays visible in those cases.
 */
function DeckCoverSlideInner({
  coverSlide,
  themeId,
  slideCount,
}: {
  coverSlide: unknown;
  themeId?: string | null;
  slideCount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const theme = useMemo(() => {
    if (!themeId || themeId.startsWith("custom-")) return null;
    return getThemeById(themeId) ?? null;
  }, [themeId]);

  if (!theme || !isRenderableSlide(coverSlide)) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-[3] overflow-hidden pointer-events-none select-none"
      aria-hidden
    >
      {inView && (
        <div className="absolute inset-0 animate-in fade-in duration-300">
          <DeckSlideView
            slide={coverSlide}
            theme={theme}
            index={0}
            totalSlides={Math.max(1, slideCount ?? 1)}
          />
        </div>
      )}
    </div>
  );
}

// Memoized: props only change when THIS deck's row is replaced (e.g. its
// slides were edited) — dashboard-wide state churn skips all cover re-renders.
const DeckCoverSlide = memo(DeckCoverSlideInner);
export default DeckCoverSlide;
