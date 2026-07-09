"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SlideData } from "~/components/presentation/types";
import type { Theme } from "~/lib/themes";
import { alpha } from "~/components/presentation/PremiumComponents";

interface WebPageViewProps {
  presentationId: string;
  title: string;
  slides: SlideData[];
  theme: Theme;
  fontsUrl?: string;
  showWatermark?: boolean;
}

interface CardItem {
  label?: string;
  text: string;
}

/** Mirror the editor's content extraction so web cards show the same items. */
function extractItems(slide: SlideData): CardItem[] {
  if (slide.transformedContent?.items?.length) {
    return slide.transformedContent.items.map((it) => ({
      label: it.label,
      text: it.text,
    }));
  }
  if (slide.sections?.length) {
    return slide.sections.map((s) => ({ label: s.heading, text: s.description }));
  }
  if (slide.bulletPoints?.length) {
    return slide.bulletPoints.map((raw) => {
      const bp = (typeof raw === "string" ? raw : ((raw as { text?: string }).text ?? ""))
        .replace(/\s+/g, " ")
        .trim();
      const colonIndex = bp.indexOf(":");
      if (colonIndex > 0 && colonIndex < 50) {
        return {
          label: bp.substring(0, colonIndex).trim(),
          text: bp.substring(colonIndex + 1).trim(),
        };
      }
      return { text: bp };
    });
  }
  return [];
}

/**
 * Gamma-style "publish to web": the deck rendered as a scrolling, responsive
 * page of cards instead of a 16:9 canvas. Fires per-slide engagement beacons
 * while public viewers read.
 */
export default function WebPageView({
  presentationId,
  title,
  slides,
  theme,
  fontsUrl,
  showWatermark = false,
}: WebPageViewProps) {
  const c = theme.colors;
  const accent = c.accent || c.primary || "#6366f1";
  const containerRef = useRef<HTMLDivElement>(null);

  const titleSlide = slides[0];
  const contentSlides = useMemo(() => slides.slice(1), [slides]);
  const heroImage = titleSlide?.image?.url || titleSlide?.images?.[0]?.url;

  // ---- Engagement beacons -------------------------------------------------
  // Track per-slide visible time; send accumulated beacons on exit/pagehide.
  const watchRef = useRef<Map<number, { enteredAt: number | null; ms: number; viewed: boolean }>>(
    new Map(),
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const flush = (slideIndex: number) => {
      const rec = watchRef.current.get(slideIndex);
      if (!rec) return;
      if (rec.enteredAt !== null) {
        rec.ms += Date.now() - rec.enteredAt;
        rec.enteredAt = null;
      }
      if (rec.ms < 500 && rec.viewed) return; // ignore drive-by noise after first view
      const payload = JSON.stringify({ slideIndex, ms: rec.ms });
      try {
        navigator.sendBeacon(
          `/api/presentations/${presentationId}/engagement`,
          new Blob([payload], { type: "application/json" }),
        );
      } catch {
        // beacon best-effort
      }
      rec.ms = 0;
      rec.viewed = true;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = Number((entry.target as HTMLElement).dataset.slideIndex);
          if (!Number.isInteger(idx)) continue;
          const rec =
            watchRef.current.get(idx) ??
            ({ enteredAt: null, ms: 0, viewed: false } as {
              enteredAt: number | null;
              ms: number;
              viewed: boolean;
            });
          watchRef.current.set(idx, rec);
          if (entry.isIntersecting) {
            rec.enteredAt = Date.now();
            entry.target.classList.add("wpv-visible");
          } else if (rec.enteredAt !== null) {
            flush(idx);
          }
        }
      },
      { threshold: 0.45 },
    );

    root.querySelectorAll("[data-slide-index]").forEach((el) => observer.observe(el));

    const onPageHide = () => {
      watchRef.current.forEach((_rec, idx) => flush(idx));
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      observer.disconnect();
      window.removeEventListener("pagehide", onPageHide);
      onPageHide();
    };
  }, [presentationId, slides.length]);

  // -------------------------------------------------------------------------

  return (
    <div
      className="min-h-screen"
      style={{
        background: c.background,
        color: c.text,
        fontFamily: theme.fonts.body.family,
      }}
    >
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <style>{`
        [data-slide-index] { opacity: 0; transform: translateY(18px); transition: opacity .6s ease, transform .6s ease; }
        [data-slide-index].wpv-visible { opacity: 1; transform: none; }
      `}</style>

      {/* Hero from the title slide */}
      <header
        className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24 text-center"
        data-slide-index={0}
      >
        {heroImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.65))",
              }}
            />
          </>
        )}
        <div className="relative z-10 mx-auto max-w-3xl">
          {titleSlide?.kicker && (
            <span
              className="mb-5 inline-block rounded-full px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em]"
              style={{
                backgroundColor: heroImage ? "rgba(255,255,255,0.14)" : alpha(accent, "1f"),
                color: heroImage ? "#ffffff" : accent,
                border: `1px solid ${heroImage ? "rgba(255,255,255,0.3)" : alpha(accent, "3d")}`,
              }}
            >
              {titleSlide.kicker}
            </span>
          )}
          <h1
            className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
            style={{
              color: heroImage ? "#ffffff" : c.heading,
              fontFamily: theme.fonts.heading.family,
            }}
          >
            {titleSlide?.title || title}
          </h1>
          {titleSlide?.subtitle && (
            <p
              className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed sm:text-xl"
              style={{ color: heroImage ? "rgba(255,255,255,0.85)" : c.textMuted }}
            >
              {titleSlide.subtitle}
            </p>
          )}
          {titleSlide?.tagline && (
            <p
              className="mt-3 text-sm font-semibold uppercase tracking-[0.14em]"
              style={{ color: heroImage ? "rgba(255,255,255,0.7)" : accent }}
            >
              {titleSlide.tagline}
            </p>
          )}
        </div>
      </header>

      {/* Content cards */}
      <main className="mx-auto flex max-w-4xl flex-col gap-14 px-5 pb-24 pt-16 sm:px-8">
        {contentSlides.map((slide, i) => {
          const slideIndex = i + 1;
          const items = extractItems(slide);
          const image = slide.image?.url || slide.images?.[0]?.url;
          const twoCol = items.length >= 4;
          return (
            <section
              key={slideIndex}
              data-slide-index={slideIndex}
              className="rounded-3xl px-7 py-9 sm:px-10 sm:py-11"
              style={{
                backgroundColor: theme.cardBox?.background || c.surface || "transparent",
                border: `1px solid ${c.border || "rgba(0,0,0,0.08)"}`,
                boxShadow:
                  "0 1px 2px rgba(15,23,42,0.05), 0 12px 32px rgba(15,23,42,0.07)",
              }}
            >
              {slide.kicker && (
                <span
                  className="mb-4 inline-block rounded-full px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.16em]"
                  style={{
                    backgroundColor: alpha(accent, "1f"),
                    color: accent,
                    border: `1px solid ${alpha(accent, "3d")}`,
                  }}
                >
                  {slide.kicker}
                </span>
              )}
              <h2
                className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
                style={{ color: c.heading, fontFamily: theme.fonts.heading.family }}
              >
                {slide.title}
              </h2>
              <div
                className="mt-3 h-1 w-14 rounded-full"
                style={{ background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "33")})` }}
              />
              {(slide.slideDescription || slide.introText) && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: c.textMuted }}>
                  {slide.slideDescription || slide.introText}
                </p>
              )}

              {image && (
                <div className="mt-6 overflow-hidden rounded-2xl" style={{ border: `1px solid ${c.border}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={slide.image?.alt || ""} className="max-h-[420px] w-full object-cover" />
                </div>
              )}

              {items.length > 0 && (
                <div className={`mt-7 grid gap-x-8 gap-y-5 ${twoCol ? "sm:grid-cols-2" : ""}`}>
                  {items.map((it, idx) => (
                    <div key={idx} className="flex items-start gap-3.5">
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[0.7rem] font-extrabold tabular-nums"
                        style={{
                          background: `linear-gradient(135deg, ${alpha(accent, "26")}, ${alpha(accent, "0d")})`,
                          border: `1px solid ${alpha(accent, "3d")}`,
                          color: accent,
                        }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        {it.label && (
                          <h3 className="text-sm font-bold tracking-tight" style={{ color: c.heading }}>
                            {it.label}
                          </h3>
                        )}
                        <p className="mt-0.5 text-sm leading-relaxed" style={{ color: c.textMuted }}>
                          {it.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* Footer */}
      <footer
        className="border-t px-6 py-10 text-center text-xs"
        style={{ borderColor: c.border, color: c.textMuted }}
      >
        {showWatermark ? (
          <a
            href="https://www.pptmaster.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
            style={{ color: accent }}
          >
            Made with PPTMaster — create yours free
          </a>
        ) : (
          <span>{title}</span>
        )}
      </footer>
    </div>
  );
}
