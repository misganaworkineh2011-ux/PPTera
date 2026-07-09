"use client";

import type { CSSProperties } from "react";
import type { Theme } from "~/lib/themes";
import type { SlideData, EditingState } from "~/components/presentation/types";
import EditableText from "~/components/presentation/EditableText";
import { getThemeType } from "./types";

/**
 * Alternate cover (title-slide) compositions. Unlike the per-theme signature
 * covers in TitleSlide.tsx, these are theme-AWARE: they derive their palette
 * from the active theme's colors/fonts, so every composition works with every
 * theme. Selected via slide.coverLayout ("signature" | unset = theme design).
 */
export interface CoverVariantProps {
  slide: SlideData;
  index: number;
  totalSlides: number;
  theme: Theme;
  hasImage: boolean;
  canEdit: boolean;
  disableHover: boolean;
  isEditing: boolean;
  editingText: EditingState | null;
  showPageNumber: boolean;
  onStartEditing: (i: number, f: string, b?: number) => void;
  onUpdateContent: (i: number, f: string, v: string, b?: number) => void;
  onFinishEditing: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

function coverPalette(theme: Theme) {
  const themeType = getThemeType(theme);
  const isLight = themeType === "light" || themeType === "corporate" || themeType === "custom-light";
  const c = theme.colors;
  const accent = c.accent || c.primary || "#22d3ee";
  return {
    isLight,
    accent,
    bg: c.background || (isLight ? "#f8fafc" : "#0a0a0f"),
    ink: c.heading || c.text || (isLight ? "#0f172a" : "#fafafa"),
    sub: c.textMuted || (isLight ? "#475569" : "#a1a1aa"),
    hairline: isLight ? "rgba(15,23,42,0.16)" : "rgba(255,255,255,0.18)",
    ghost: isLight ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.05)",
  };
}

type Palette = ReturnType<typeof coverPalette>;

/** Editable title/subtitle/tagline blocks shared by all cover compositions. */
function CoverTitle({ ink, className = "", style = {}, ...v }: CoverVariantProps & { p: Palette; ink: string; className?: string; style?: CSSProperties }) {
  return (
    <EditableText
      value={v.slide.title}
      isEditing={v.isEditing && v.editingText?.field === "title"}
      onStartEdit={() => v.onStartEditing(v.index, "title")}
      onChange={(val) => v.onUpdateContent(v.index, "title", val)}
      onFinish={v.onFinishEditing}
      className={`title-slide-heading font-bold leading-[1.05] ${className}`}
      style={{ fontFamily: v.theme.fonts.heading.family, color: ink, letterSpacing: "-0.03em", ...style }}
      isOwner={v.canEdit}
      disableHover={v.disableHover}
    />
  );
}

function CoverSubtitle({ sub, className = "", ...v }: CoverVariantProps & { p: Palette; sub: string; className?: string }) {
  if (!v.slide.subtitle) return null;
  return (
    <EditableText
      value={v.slide.subtitle}
      isEditing={v.isEditing && v.editingText?.field === "subtitle"}
      onStartEdit={() => v.onStartEditing(v.index, "subtitle")}
      onChange={(val) => v.onUpdateContent(v.index, "subtitle", val)}
      onFinish={v.onFinishEditing}
      className={`title-slide-subtitle ${className}`}
      style={{ fontFamily: v.theme.fonts.body.family, color: sub }}
      isOwner={v.canEdit}
      disableHover={v.disableHover}
    />
  );
}

function CoverTagline({ color, className = "", ...v }: CoverVariantProps & { p: Palette; color: string; className?: string }) {
  if (!v.slide.tagline) return null;
  return (
    <EditableText
      value={v.slide.tagline}
      isEditing={v.isEditing && v.editingText?.field === "tagline"}
      onStartEdit={() => v.onStartEditing(v.index, "tagline")}
      onChange={(val) => v.onUpdateContent(v.index, "tagline", val)}
      onFinish={v.onFinishEditing}
      className={`text-xs font-semibold uppercase tracking-[0.32em] ${className}`}
      style={{ fontFamily: v.theme.fonts.body.family, color }}
      isOwner={v.canEdit}
      disableHover={v.disableHover}
    />
  );
}

// EDITORIAL SPLIT — left-aligned masthead column + full-height image panel.
export function EditorialCover(props: CoverVariantProps) {
  const { slide, index, totalSlides, theme, showPageNumber } = props;
  const p = coverPalette(theme);
  const imgUrl = slide.image?.url && slide.image.source !== "placeholder" ? slide.image.url : null;

  return (
    <div className="h-full relative overflow-hidden flex" style={{ background: p.bg, fontFamily: theme.fonts.body.family }}>
      {/* Text column */}
      <div className="relative h-full flex flex-col p-12 min-w-0" style={{ width: imgUrl ? "58%" : "100%" }}>
        <div className="flex items-center gap-3">
          {showPageNumber && (
            <span className="font-mono text-sm font-medium" style={{ color: p.accent }}>{pad(index + 1)}</span>
          )}
          <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${p.accent}59, ${p.hairline} 40%, transparent)` }} />
          <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: p.sub }}>/ {pad(totalSlides)}</span>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-0 py-6">
          {slide.tagline && (
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[2px] rounded-full" style={{ background: p.accent }} />
              <CoverTagline {...props} p={p} color={p.accent} />
            </div>
          )}
          <CoverTitle {...props} p={p} ink={p.ink} className="mb-6 max-w-[95%]" />
          <CoverSubtitle {...props} p={p} sub={p.sub} className="max-w-[85%]" />
        </div>

        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rotate-45" style={{ background: p.accent }} />
          <div className="h-px w-24" style={{ background: `linear-gradient(90deg, ${p.accent}66, transparent)` }} />
        </div>

        {/* Ghost numeral fills the right whitespace when there is no image */}
        {!imgUrl && (
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 font-bold leading-none select-none pointer-events-none"
            style={{ fontSize: 300, color: p.ghost, fontFamily: theme.fonts.heading.family }}
          >
            {pad(index + 1)}
          </div>
        )}
      </div>

      {/* Image panel */}
      {imgUrl && (
        <div className="relative h-full" style={{ width: "42%" }}>
          <img src={imgUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
          {/* Blend the panel toward the text column + anchor it to the theme */}
          <div className="absolute inset-y-0 left-0 w-24" style={{ background: `linear-gradient(90deg, ${p.bg}, transparent)` }} />
          <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: `linear-gradient(180deg, transparent, ${p.accent}, transparent)` }} />
          <div className="absolute inset-4 border pointer-events-none" style={{ borderColor: p.isLight ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.22)" }} />
          <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: p.accent }} />
          <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: p.accent }} />
        </div>
      )}
    </div>
  );
}

// CINEMATIC BAND — full-bleed image with a glass title band along the bottom.
export function BandCover(props: CoverVariantProps) {
  const { index, totalSlides, theme, hasImage, showPageNumber } = props;
  const p = coverPalette(theme);
  // Over a photo on a dark theme the band sits on dark glass → force light ink.
  const ink = hasImage && !p.isLight ? "#fafafa" : p.ink;
  const sub = hasImage && !p.isLight ? "rgba(255,255,255,0.75)" : p.sub;

  return (
    <div className="h-full relative overflow-hidden" style={{ fontFamily: theme.fonts.body.family }}>
      {!hasImage && (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(130% 100% at 85% -10%, ${p.accent}26, transparent 55%), linear-gradient(160deg, ${p.bg}, ${p.bg})` }}
        />
      )}
      {hasImage && (
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 40%, transparent 70%)" }} />
      )}

      {showPageNumber && (
        <div
          className="absolute top-8 left-8 flex items-center gap-2.5 px-3 py-1.5 rounded-full backdrop-blur-md"
          style={{
            background: hasImage ? (p.isLight ? "rgba(255,255,255,0.72)" : "rgba(8,8,12,0.5)") : "transparent",
            border: `1px solid ${hasImage ? (p.isLight ? "rgba(15,23,42,0.14)" : "rgba(255,255,255,0.2)") : p.hairline}`,
          }}
        >
          <span className="font-mono text-xs font-medium" style={{ color: p.accent }}>{pad(index + 1)}</span>
          <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: sub }}>/ {pad(totalSlides)}</span>
        </div>
      )}

      <div className="relative h-full flex flex-col justify-end">
        <div
          className="px-12 pt-9 pb-11 backdrop-blur-md"
          style={{
            background: hasImage
              ? p.isLight
                ? "linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.72))"
                : "linear-gradient(to top, rgba(6,6,10,0.72), rgba(6,6,10,0.5))"
              : "transparent",
            borderTop: `1px solid ${hasImage ? (p.isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.16)") : p.hairline}`,
          }}
        >
          {/* Accent rule anchors the band to the theme */}
          <div className="w-14 h-[3px] rounded-full mb-5" style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}66)` }} />
          <div className="flex items-end justify-between gap-10">
            <div className="min-w-0 flex-1">
              <CoverTitle {...props} p={p} ink={ink} className="mb-3 max-w-[90%]" />
              <CoverSubtitle {...props} p={p} sub={sub} className="max-w-[75%]" />
            </div>
            <div className="hidden md:flex flex-col items-end gap-2 pb-2 shrink-0">
              <div className="w-2 h-2 rotate-45" style={{ background: p.accent }} />
              <div className="w-px h-12" style={{ background: `linear-gradient(180deg, ${p.accent}66, transparent)` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// MINIMAL TYPE — pure typography: oversized ghost numeral, hairlines, no image.
export function MinimalCover(props: CoverVariantProps) {
  const { slide, index, totalSlides, theme, showPageNumber } = props;
  const p = coverPalette(theme);

  return (
    <div className="h-full relative overflow-hidden" style={{ background: p.bg, fontFamily: theme.fonts.body.family }}>
      <div
        className="absolute -top-14 right-4 font-bold leading-none select-none pointer-events-none"
        style={{ fontSize: 330, color: p.ghost, fontFamily: theme.fonts.heading.family, letterSpacing: "-0.05em" }}
      >
        {pad(index + 1)}
      </div>
      <div className="absolute left-12 right-12 top-[88px] h-px" style={{ background: p.hairline }} />
      <div className="absolute left-12 right-12 bottom-[76px] h-px" style={{ background: p.hairline }} />

      {showPageNumber && (
        <div className="absolute top-12 left-12 flex items-center gap-3">
          <span className="font-mono text-sm font-medium" style={{ color: p.accent }}>{pad(index + 1)}</span>
          <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: p.sub }}>/ {pad(totalSlides)}</span>
        </div>
      )}

      <div className="relative h-full flex flex-col justify-center px-12" style={{ maxWidth: "82%" }}>
        {slide.tagline && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-[2px]" style={{ background: p.accent }} />
            <CoverTagline {...props} p={p} color={p.sub} />
          </div>
        )}
        <CoverTitle {...props} p={p} ink={p.ink} className="mb-7" style={{ fontSize: "clamp(1.5rem, 4.6cqw + 0.5rem, 5.25rem)" }} />
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-[3px] rounded-full" style={{ background: p.accent }} />
          <div className="h-px flex-1 max-w-[220px]" style={{ background: p.hairline }} />
        </div>
        <CoverSubtitle {...props} p={p} sub={p.sub} className="max-w-2xl" />
      </div>

      <div className="absolute bottom-12 left-12 font-mono text-[11px] tracking-[0.3em]" style={{ color: p.sub }}>
        — {pad(index + 1)} / {pad(totalSlides)}
      </div>
      <div className="absolute bottom-12 right-12 w-2.5 h-2.5" style={{ background: p.accent }} />
    </div>
  );
}

// FRAMED CLASSIC — centered composition inside a fine double frame.
export function FrameCover(props: CoverVariantProps) {
  const { slide, index, totalSlides, theme, hasImage, showPageNumber } = props;
  const p = coverPalette(theme);
  const ink = hasImage && !p.isLight ? "#fafafa" : p.ink;
  const sub = hasImage && !p.isLight ? "rgba(255,255,255,0.75)" : p.sub;
  const frameHairline = hasImage ? (p.isLight ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.28)") : p.hairline;

  return (
    <div className="h-full relative overflow-hidden" style={{ fontFamily: theme.fonts.body.family }}>
      {!hasImage && (
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(85% 70% at 50% 45%, ${p.accent}14, transparent 60%), linear-gradient(180deg, ${p.bg}, ${p.bg})` }}
        />
      )}
      {hasImage && (
        <div className="absolute inset-0" style={{ background: p.isLight ? "rgba(255,255,255,0.7)" : "rgba(5,5,9,0.58)" }} />
      )}

      {/* Double frame + accent corner ticks */}
      <div className="absolute inset-6 border pointer-events-none" style={{ borderColor: frameHairline }} />
      <div className="absolute inset-9 border pointer-events-none" style={{ borderColor: `${p.accent}3D` }} />
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: p.accent }} />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: p.accent }} />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: p.accent }} />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: p.accent }} />

      {showPageNumber && (
        <div className="absolute top-[52px] left-0 right-0 flex justify-center">
          <span className="font-mono text-[11px] tracking-[0.35em]" style={{ color: sub }}>
            {pad(index + 1)} <span style={{ color: p.accent }}>/</span> {pad(totalSlides)}
          </span>
        </div>
      )}

      <div className="relative h-full flex flex-col items-center justify-center text-center px-24">
        {slide.tagline && (
          <div className="flex items-center gap-4 mb-7">
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: p.accent }} />
            <CoverTagline {...props} p={p} color={sub} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: p.accent }} />
          </div>
        )}
        <CoverTitle {...props} p={p} ink={ink} className="mb-6 max-w-4xl" />
        <CoverSubtitle {...props} p={p} sub={sub} className="max-w-2xl" />
        <div className="flex items-center gap-4 mt-10">
          <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p.accent}80)` }} />
          <div className="w-2 h-2 rotate-45" style={{ background: p.accent }} />
          <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, ${p.accent}80, transparent)` }} />
        </div>
      </div>
    </div>
  );
}

// ANGLE SPLIT — dynamic diagonal split; image cropped on a slant with an
// accent edge stripe running along the cut.
export function AngleCover(props: CoverVariantProps) {
  const { slide, index, totalSlides, theme, showPageNumber } = props;
  const p = coverPalette(theme);
  const imgUrl = slide.image?.url && slide.image.source !== "placeholder" ? slide.image.url : null;
  const clip = "polygon(22% 0, 100% 0, 100% 100%, 0 100%)";

  return (
    <div className="h-full relative overflow-hidden" style={{ background: p.bg, fontFamily: theme.fonts.body.family }}>
      {/* Slanted panel — accent stripe sits just behind the image cut */}
      <div className="absolute inset-y-0 right-0 pointer-events-none" style={{ width: "54%", clipPath: clip, background: p.accent, transform: "translateX(-10px)", opacity: 0.9 }} />
      <div className="absolute inset-y-0 right-0 overflow-hidden" style={{ width: "54%", clipPath: clip }}>
        {imgUrl ? (
          <img src={imgUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 80% 20%, ${p.accent}59, ${p.accent}14 60%), linear-gradient(200deg, ${p.bg}, ${p.bg})` }}>
            <div className="absolute bottom-6 right-10 font-bold leading-none select-none" style={{ fontSize: 220, color: p.ghost, fontFamily: theme.fonts.heading.family }}>{pad(index + 1)}</div>
          </div>
        )}
        {imgUrl && <div className="absolute inset-0" style={{ background: `linear-gradient(115deg, ${p.bg}33, transparent 35%)` }} />}
      </div>

      {/* Text column */}
      <div className="relative h-full flex flex-col p-12" style={{ width: "52%" }}>
        {showPageNumber && (
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-medium" style={{ color: p.accent }}>{pad(index + 1)}</span>
            <div className="h-px w-16" style={{ background: `linear-gradient(90deg, ${p.accent}66, transparent)` }} />
            <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: p.sub }}>/ {pad(totalSlides)}</span>
          </div>
        )}
        <div className="flex-1 flex flex-col justify-center py-6 pr-10">
          {slide.tagline && (
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[2px] rounded-full" style={{ background: p.accent }} />
              <CoverTagline {...props} p={p} color={p.accent} />
            </div>
          )}
          <CoverTitle {...props} p={p} ink={p.ink} className="mb-6" />
          <CoverSubtitle {...props} p={p} sub={p.sub} className="max-w-[92%]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rotate-45" style={{ background: p.accent }} />
          <div className="h-px w-20" style={{ background: p.hairline }} />
        </div>
      </div>
    </div>
  );
}

// GLASS CARD — full-bleed image with a floating frosted-glass title card.
export function GlassCardCover(props: CoverVariantProps) {
  const { slide, index, totalSlides, theme, hasImage, showPageNumber } = props;
  const p = coverPalette(theme);
  const cardBg = p.isLight
    ? "linear-gradient(150deg, rgba(255,255,255,0.88), rgba(255,255,255,0.72))"
    : "linear-gradient(150deg, rgba(10,10,16,0.72), rgba(10,10,16,0.5))";
  const cardBorder = p.isLight ? "rgba(15,23,42,0.14)" : "rgba(255,255,255,0.18)";

  return (
    <div className="h-full relative overflow-hidden" style={{ fontFamily: theme.fonts.body.family }}>
      {!hasImage && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(90% 90% at 15% 20%, ${p.accent}26, transparent 55%), radial-gradient(80% 80% at 90% 85%, ${p.accent}1A, transparent 60%), linear-gradient(180deg, ${p.bg}, ${p.bg})` }} />
      )}
      {hasImage && <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.32), transparent 60%)" }} />}

      <div className="relative h-full flex items-center px-14">
        <div
          className="rounded-2xl backdrop-blur-xl p-10 max-w-[52%] shadow-2xl"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div className="w-12 h-[3px] rounded-full mb-6" style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}66)` }} />
          {slide.tagline && (
            <div className="mb-4">
              <CoverTagline {...props} p={p} color={p.accent} />
            </div>
          )}
          <CoverTitle {...props} p={p} ink={p.ink} className="mb-4" />
          <CoverSubtitle {...props} p={p} sub={p.sub} />
          {showPageNumber && (
            <div className="flex items-center gap-2.5 mt-7 pt-5" style={{ borderTop: `1px solid ${p.hairline}` }}>
              <span className="font-mono text-xs font-medium" style={{ color: p.accent }}>{pad(index + 1)}</span>
              <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: p.sub }}>/ {pad(totalSlides)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// VERTICAL RAIL — editorial side rail with vertical meta type and a framed
// image column on the right.
export function RailCover(props: CoverVariantProps) {
  const { slide, index, totalSlides, theme, showPageNumber } = props;
  const p = coverPalette(theme);
  const imgUrl = slide.image?.url && slide.image.source !== "placeholder" ? slide.image.url : null;

  return (
    <div className="h-full relative overflow-hidden flex" style={{ background: p.bg, fontFamily: theme.fonts.body.family }}>
      {/* Accent rail + vertical meta */}
      <div className="relative h-full shrink-0 flex" style={{ width: 76 }}>
        <div className="w-[5px] h-full" style={{ background: `linear-gradient(180deg, ${p.accent}, ${p.accent}33)` }} />
        <div className="flex-1 relative" style={{ borderRight: `1px solid ${p.hairline}` }}>
          {showPageNumber && (
            <span className="absolute top-8 left-1/2 -translate-x-1/2 font-mono text-sm font-medium" style={{ color: p.accent }}>{pad(index + 1)}</span>
          )}
          <span
            className="absolute bottom-8 left-1/2 font-mono text-[10px] tracking-[0.4em] uppercase whitespace-nowrap"
            style={{ color: p.sub, writingMode: "vertical-rl", transform: "translateX(-50%) rotate(180deg)" }}
          >
            {pad(index + 1)} — {pad(totalSlides)}
          </span>
        </div>
      </div>

      {/* Masthead */}
      <div className="relative flex-1 h-full flex flex-col justify-center px-12 min-w-0">
        {slide.tagline && (
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-[2px] rounded-full" style={{ background: p.accent }} />
            <CoverTagline {...props} p={p} color={p.sub} />
          </div>
        )}
        <CoverTitle {...props} p={p} ink={p.ink} className="mb-6" />
        <CoverSubtitle {...props} p={p} sub={p.sub} className="max-w-[90%]" />
        {!imgUrl && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 flex gap-4 pointer-events-none">
            <div className="w-px h-56" style={{ background: p.hairline }} />
            <div className="w-px h-56 mt-10" style={{ background: p.hairline }} />
            <div className="w-px h-56" style={{ background: `linear-gradient(180deg, ${p.accent}66, transparent)` }} />
          </div>
        )}
      </div>

      {/* Framed image column */}
      {imgUrl && (
        <div className="relative h-full shrink-0 p-8 pl-0" style={{ width: "34%" }}>
          <div className="relative w-full h-full overflow-hidden" style={{ border: `1px solid ${p.hairline}` }}>
            <img src={imgUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: p.accent }} />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: p.accent }} />
          </div>
        </div>
      )}
    </div>
  );
}

// POSTER TYPE — oversized poster typography over a deep image wash.
export function PosterCover(props: CoverVariantProps) {
  const { index, totalSlides, theme, hasImage, showPageNumber } = props;
  const p = coverPalette(theme);
  const ink = hasImage ? "#fafafa" : p.ink;
  const sub = hasImage ? "rgba(255,255,255,0.78)" : p.sub;
  const line = hasImage ? "rgba(255,255,255,0.28)" : p.hairline;

  return (
    <div className="h-full relative overflow-hidden" style={{ fontFamily: theme.fonts.body.family }}>
      {!hasImage && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 50% 110%, ${p.accent}21, transparent 55%), linear-gradient(180deg, ${p.bg}, ${p.bg})` }} />
      )}
      {hasImage && <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,4,8,0.55), rgba(4,4,8,0.72))" }} />}

      <div className="relative h-full flex flex-col px-14 py-12">
        <div className="flex items-center justify-between pb-5" style={{ borderBottom: `1px solid ${line}` }}>
          {showPageNumber ? (
            <span className="font-mono text-sm font-medium" style={{ color: p.accent }}>{pad(index + 1)}</span>
          ) : <span />}
          <span className="font-mono text-[11px] tracking-[0.35em]" style={{ color: sub }}>— {pad(totalSlides)}</span>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-0">
          <CoverTitle
            {...props}
            p={p}
            ink={ink}
            className="mb-6"
            style={{ fontSize: "clamp(1.75rem, 5.4cqw + 0.5rem, 6rem)", fontWeight: 800, lineHeight: 1.02 }}
          />
          <div className="w-28 h-[10px]" style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}99)` }} />
        </div>

        <div className="flex items-end justify-between gap-10 pt-5" style={{ borderTop: `1px solid ${line}` }}>
          <div className="min-w-0 flex-1">
            <CoverSubtitle {...props} p={p} sub={sub} className="max-w-[80%]" />
          </div>
          <div className="w-2.5 h-2.5 rotate-45 shrink-0 mb-1" style={{ background: p.accent }} />
        </div>
      </div>
    </div>
  );
}

// SWISS GRID — bottom-anchored Swiss typography with crosshair grid accents.
export function SwissCover(props: CoverVariantProps) {
  const { slide, index, totalSlides, theme, showPageNumber } = props;
  const p = coverPalette(theme);

  return (
    <div className="h-full relative overflow-hidden" style={{ background: p.bg, fontFamily: theme.fonts.body.family }}>
      {/* Faint thirds grid */}
      <div className="absolute inset-y-0 pointer-events-none" style={{ left: "33.33%", width: 1, background: p.ghost }} />
      <div className="absolute inset-y-0 pointer-events-none" style={{ left: "66.66%", width: 1, background: p.ghost }} />
      <div className="absolute inset-x-0 pointer-events-none" style={{ top: "33.33%", height: 1, background: p.ghost }} />

      {/* Crosshair cluster top-right */}
      <div className="absolute top-12 right-12 grid grid-cols-3 gap-3 pointer-events-none">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="font-mono text-sm leading-none" style={{ color: i === 4 ? p.accent : p.hairline }}>+</span>
        ))}
      </div>

      {showPageNumber && (
        <div className="absolute top-12 left-12 flex items-center gap-3">
          <span className="font-mono text-sm font-medium" style={{ color: p.accent }}>{pad(index + 1)}</span>
          <span className="font-mono text-[11px] tracking-[0.3em]" style={{ color: p.sub }}>/ {pad(totalSlides)}</span>
        </div>
      )}

      <div className="relative h-full flex flex-col justify-end px-12 pb-16">
        {slide.tagline && (
          <div className="flex items-center gap-3 mb-5">
            <div className="w-3 h-3" style={{ background: p.accent }} />
            <CoverTagline {...props} p={p} color={p.sub} />
          </div>
        )}
        <CoverTitle {...props} p={p} ink={p.ink} className="mb-5 max-w-[80%]" style={{ fontSize: "clamp(1.6rem, 4.8cqw + 0.5rem, 5.5rem)" }} />
        <CoverSubtitle {...props} p={p} sub={p.sub} className="max-w-[55%]" />
        <div className="flex items-center gap-4 mt-8 pt-5" style={{ borderTop: `1px solid ${p.hairline}` }}>
          <div className="w-10 h-[3px]" style={{ background: p.accent }} />
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: p.sub }}>{pad(index + 1)} / {pad(totalSlides)}</span>
        </div>
      </div>
    </div>
  );
}

// ACCENT WASH — cinematic duotone wash in the theme accent over the image.
export function WashCover(props: CoverVariantProps) {
  const { slide, index, totalSlides, theme, hasImage, showPageNumber } = props;
  const p = coverPalette(theme);

  return (
    <div className="h-full relative overflow-hidden" style={{ fontFamily: theme.fonts.body.family }}>
      {/* Accent duotone wash (over image) or full accent field (no image) */}
      <div
        className="absolute inset-0"
        style={{
          background: hasImage
            ? `linear-gradient(125deg, ${p.accent}E6 0%, ${p.accent}80 42%, rgba(6,6,10,0.55) 100%)`
            : `radial-gradient(130% 110% at 85% -10%, ${p.accent}66, transparent 55%), linear-gradient(150deg, ${p.accent}D9, ${p.accent}59 60%, ${p.bg} 100%)`,
        }}
      />
      <div
        className="absolute -top-10 right-6 font-bold leading-none select-none pointer-events-none"
        style={{ fontSize: 300, color: "rgba(255,255,255,0.08)", fontFamily: theme.fonts.heading.family }}
      >
        {pad(index + 1)}
      </div>

      <div className="relative h-full flex flex-col p-14">
        <div className="flex items-center gap-3">
          {showPageNumber && (
            <span className="font-mono text-sm font-medium px-2.5 py-1 rounded-md" style={{ color: "#ffffff", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.25)" }}>
              {pad(index + 1)} / {pad(totalSlides)}
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-end">
          {slide.tagline && (
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-[2px] rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />
              <CoverTagline {...props} p={p} color="rgba(255,255,255,0.85)" />
            </div>
          )}
          <CoverTitle {...props} p={p} ink="#ffffff" className="mb-5 max-w-[85%]" style={{ textShadow: "0 2px 24px rgba(0,0,0,0.25)" }} />
          <CoverSubtitle {...props} p={p} sub="rgba(255,255,255,0.85)" className="max-w-[65%]" />
          <div className="w-16 h-px mt-9" style={{ background: "rgba(255,255,255,0.5)" }} />
        </div>
      </div>
    </div>
  );
}

// PORTAL — circular image portal with an accent ring beside the masthead.
export function PortalCover(props: CoverVariantProps) {
  const { slide, index, totalSlides, theme, showPageNumber } = props;
  const p = coverPalette(theme);
  const imgUrl = slide.image?.url && slide.image.source !== "placeholder" ? slide.image.url : null;
  const D = 520; // portal diameter in canvas px

  return (
    <div className="h-full relative overflow-hidden" style={{ background: p.bg, fontFamily: theme.fonts.body.family }}>
      {/* Portal */}
      <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ right: -D * 0.18, width: D, height: D }}>
        <div className="absolute rounded-full" style={{ inset: -14, border: `1px solid ${p.hairline}` }} />
        <div className="absolute rounded-full" style={{ inset: -2, border: `2px solid ${p.accent}66` }} />
        <div className="relative w-full h-full rounded-full overflow-hidden" style={{ border: `1px solid ${p.hairline}` }}>
          {imgUrl ? (
            <img src={imgUrl} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: `radial-gradient(80% 80% at 35% 30%, ${p.accent}40, ${p.accent}0D 70%)` }}>
              <span className="font-bold leading-none select-none" style={{ fontSize: 150, color: p.ghost, fontFamily: theme.fonts.heading.family }}>{pad(index + 1)}</span>
            </div>
          )}
        </div>
        {/* Orbit dot */}
        <div className="absolute rounded-full" style={{ width: 12, height: 12, background: p.accent, top: D * 0.09, left: D * 0.09 }} />
      </div>

      {/* Masthead */}
      <div className="relative h-full flex flex-col justify-center pl-14" style={{ width: "56%" }}>
        {showPageNumber && (
          <div className="absolute top-12 left-14 flex items-center gap-3">
            <span className="font-mono text-sm font-medium" style={{ color: p.accent }}>{pad(index + 1)}</span>
            <div className="h-px w-14" style={{ background: `linear-gradient(90deg, ${p.accent}66, transparent)` }} />
            <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: p.sub }}>/ {pad(totalSlides)}</span>
          </div>
        )}
        {slide.tagline && (
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-[2px] rounded-full" style={{ background: p.accent }} />
            <CoverTagline {...props} p={p} color={p.accent} />
          </div>
        )}
        <CoverTitle {...props} p={p} ink={p.ink} className="mb-6" />
        <CoverSubtitle {...props} p={p} sub={p.sub} className="max-w-[95%]" />
        <div className="flex items-center gap-4 mt-9">
          <div className="w-2 h-2 rotate-45" style={{ background: p.accent }} />
          <div className="h-px w-24" style={{ background: p.hairline }} />
        </div>
      </div>
    </div>
  );
}
