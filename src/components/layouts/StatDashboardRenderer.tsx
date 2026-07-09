"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { tileStyle, SLIDE_FRAME } from "./tile";

// Animation variants (subtle entrance, gated on isPresenting)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

// Decorative mini bar chart heights (fixed, in rem — purely decorative)
const MINI_BAR_HEIGHTS = ["0.5rem", "0.9rem", "0.7rem", "1.1rem", "0.6rem"];

// Treat the text as a metric ONLY when it genuinely leads with a short number
// (optionally a currency symbol and a one-word unit) — e.g. "1,965", "85%",
// "$2.4B", "40.7 million". A prose sentence that merely mentions a figure
// ("Reaching a monumental 1.3 Trillion Birr, this vast asset base…") is NOT a
// metric: pulling the number out of it mangles the sentence and looks broken,
// so we render those as a normal card instead.
function extractMetric(text: string): { value: string | null; caption: string } {
  const trimmed = text.trim();
  const match = trimmed.match(
    /^[\$£€]?\d[\d,.]*\s*(%|\+|k|m|bn|b|billion|million|thousand|trillion)?\b/i,
  );
  if (!match || match.index !== 0) {
    return { value: null, caption: trimmed };
  }
  const value = match[0].trim();
  const caption = trimmed
    .slice(match[0].length)
    .replace(/^[\s,:–—-]+/, "")
    .replace(/\s+/g, " ")
    .trim();
  // If a long phrase remains after the number, it was an incidental figure in a
  // sentence — not a headline stat. Fall back to rendering the whole thing.
  if (caption.length > 48) {
    return { value: null, caption: trimmed };
  }
  return { value, caption };
}

interface StatDashboardRendererProps {
  items: BoxContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  layoutId?: string;
  isPresenting?: boolean;
  animationKey?: string;
  // Editing props
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  onDeleteItem?: (index: number) => void;
  isOwner?: boolean;
  isHovered?: boolean;
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

export function StatDashboardRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId,
  isPresenting = false,
  animationKey,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  onDeleteItem,
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: StatDashboardRendererProps) {
  const displayItems = items.slice(0, 6); // Cap at 6
  const itemCount = displayItems.length;

  // Colors (defensive)
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg =
    theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const border = theme?.colors.border || "rgba(0,0,0,0.08)";

  // grid-cols-2 for 2-4 items, grid-cols-3 for 5-6 (choose by count)
  const gridColsClass = itemCount >= 5 ? "grid-cols-3" : "grid-cols-2";

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: "all 0.4s ease-out",
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting
    ? {
        variants: containerVariants,
        initial: "hidden",
        animate: "visible",
      }
    : {};

  // Shared editable helpers for the alternative dashboard styles
  const editLabel = (item: BoxContentItem, index: number, cls: string, style: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText
          value={item.label}
          isEditing={isEditing && editingText?.field === `content-label-${index}`}
          onStartEdit={() => onStartEditLabel(index)}
          onChange={(val) => onUpdateLabel?.(index, val)}
          onFinish={onFinishEditing || (() => {})}
          onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
          className={cls}
          style={style}
          isOwner={isOwner}
          isHovered={isHovered}
        />
      ) : (
        <div className={cls} style={style}>{item.label}</div>
      )
    ) : null;

  const editText = (item: BoxContentItem, index: number, cls: string, style: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText
        value={item.text}
        isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)}
        onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls}
        style={style}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <p className={cls} style={style}>{item.text}</p>
    );

  const gradientNumeral: React.CSSProperties = {
    background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  /* ---------------- dashboard-style-2: Stat Rail (open columns) ------------ */
  if (layoutId === "dashboard-style-2") {
    const railItems = displayItems.slice(0, 4);
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex w-full items-stretch">
          {railItems.map((item, index) => {
            const { value, caption } = extractMetric(item.text);
            const ItemWrapper = isPresenting ? motion.div : "div";
            const variantsProps = isPresenting ? { variants: itemVariants } : {};
            return (
              <ItemWrapper
                key={index}
                className="flex min-w-0 flex-1 flex-col px-5"
                style={{
                  borderLeft: index === 0 ? "none" : `1px solid ${border}`,
                  ...getSpotlightStyle(index),
                }}
                {...variantsProps}
              >
                <div
                  className="text-4xl font-extrabold leading-none tabular-nums tracking-tight sm:text-5xl"
                  style={gradientNumeral}
                >
                  {value ?? String(index + 1).padStart(2, "0")}
                </div>
                {editLabel(item, index, "mt-2.5 text-xs font-bold uppercase tracking-[0.12em]", { color: titleColor })}
                {editText(item, index, "mt-1 text-xs leading-snug break-words", { color: bodyColor })}
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------- dashboard-style-3: Metric Pills ------------------------ */
  if (layoutId === "dashboard-style-3") {
    const pillItems = displayItems.slice(0, 4);
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid w-full gap-x-6 gap-y-6"
          style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, pillItems.length))}, minmax(0, 1fr))` }}
        >
          {pillItems.map((item, index) => {
            const { value, caption } = extractMetric(item.text);
            const ItemWrapper = isPresenting ? motion.div : "div";
            const variantsProps = isPresenting ? { variants: itemVariants } : {};
            return (
              <ItemWrapper
                key={index}
                className="flex flex-col items-center text-center"
                style={getSpotlightStyle(index)}
                {...variantsProps}
              >
                <div
                  className="flex items-center justify-center rounded-full px-7 py-2.5 text-2xl font-extrabold tabular-nums tracking-tight"
                  style={{
                    background: `linear-gradient(135deg, ${accent}26, ${accent}0d)`,
                    border: `1px solid ${accent}3d`,
                    color: accent,
                    boxShadow: `0 4px 14px ${accent}1a`,
                  }}
                >
                  {value ?? String(index + 1).padStart(2, "0")}
                </div>
                {editLabel(item, index, "mt-2.5 text-sm font-bold tracking-tight", { color: titleColor })}
                {editText(item, index, "mt-1 max-w-[220px] text-xs leading-snug break-words", { color: bodyColor })}
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  // Parse a percentage for gauge/bar fills; deterministic fallback by index
  // so decorative fills stay stable across renders.
  const percentFor = (text: string, index: number): number => {
    const m = text.match(/(\d{1,3}(?:\.\d+)?)\s*%/);
    if (m) return Math.max(4, Math.min(100, parseFloat(m[1]!)));
    return Math.max(38, 88 - index * 14);
  };

  /* ---------------- dashboard-style-9: Dot Matrix -------------------------- */
  if (layoutId === "dashboard-style-9") {
    const dotItems = displayItems.slice(0, 3);
    const DOTS_PER_ROW = 10;
    const ROWS = 4;
    const TOTAL = DOTS_PER_ROW * ROWS;
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid w-full gap-x-10 gap-y-6"
          style={{ gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, dotItems.length))}, minmax(0, 1fr))` }}
        >
          {dotItems.map((item, index) => {
            const { value } = extractMetric(item.text);
            const pct = percentFor(item.text, index);
            const filled = Math.round((pct / 100) * TOTAL);
            return (
              <div key={index} style={getSpotlightStyle(index)}>
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${DOTS_PER_ROW}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: TOTAL }, (_, d) => (
                    <span
                      key={d}
                      className="aspect-square rounded-full"
                      style={
                        d < filled
                          ? { backgroundColor: accent }
                          : { border: `1.5px solid ${accent}40` }
                      }
                    />
                  ))}
                </div>
                <div className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight" style={{ color: titleColor }}>
                  {value ?? `${Math.round(pct)}%`}
                </div>
                {editLabel(item, index, "mt-0.5 text-sm font-bold tracking-tight", { color: titleColor })}
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------- dashboard-style-10: Corner Stats ------------------------ */
  if (layoutId === "dashboard-style-10") {
    const quadItems = displayItems.slice(0, 4);
    const anchors = [
      "items-start text-left",
      "items-end text-right",
      "items-start text-left",
      "items-end text-right",
    ];
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="relative grid w-full grid-cols-2 gap-y-10">
          {/* Crosshair divider */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
            style={{ background: `linear-gradient(180deg, transparent, ${accent}59, transparent)` }}
          />
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2"
            style={{ background: `linear-gradient(90deg, transparent, ${accent}59, transparent)` }}
          />
          {quadItems.map((item, index) => {
            const { value } = extractMetric(item.text);
            return (
              <div
                key={index}
                className={`flex flex-col px-8 ${anchors[index]}`}
                style={getSpotlightStyle(index)}
              >
                <div className="text-5xl font-extrabold leading-none tabular-nums tracking-tight" style={gradientNumeral}>
                  {value ?? String(index + 1).padStart(2, "0")}
                </div>
                {editLabel(item, index, "mt-2 text-xs font-bold uppercase tracking-[0.12em]", { color: titleColor })}
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------- dashboard-style-11: Sparkline Cards --------------------- */
  if (layoutId === "dashboard-style-11") {
    const sparkItems = displayItems.slice(0, 4);
    // Deterministic decorative trend points, stable per card
    const sparkPoints = (i: number): string => {
      const pts = Array.from({ length: 8 }, (_, j) => {
        const y = 34 - ((i * 17 + j * 23) % 26) - (j >= 6 ? 4 : 0);
        return `${(j * 100) / 7},${Math.max(4, y)}`;
      });
      return pts.join(" ");
    };
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid w-full gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, sparkItems.length)) <= 2 ? sparkItems.length : 2}, minmax(0, 1fr))` }}
        >
          {sparkItems.map((item, index) => {
            const { value } = extractMetric(item.text);
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${border}`,
                  ...getSpotlightStyle(index),
                }}
              >
                <div className="px-5 pt-4">
                  {editLabel(item, index, "text-[0.65rem] font-bold uppercase tracking-[0.14em]", { color: bodyColor })}
                  <div className="mt-1 text-3xl font-extrabold leading-none tabular-nums tracking-tight" style={{ color: titleColor }}>
                    {value ?? String(index + 1).padStart(2, "0")}
                  </div>
                </div>
                {/* Decorative area sparkline */}
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="mt-2 h-12 w-full" aria-hidden="true">
                  <polygon points={`0,40 ${sparkPoints(index)} 100,40`} fill={`${accent}26`} />
                  <polyline points={sparkPoints(index)} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------- dashboard-style-12: Badge Stack ------------------------- */
  if (layoutId === "dashboard-style-12") {
    const badgeItems = displayItems.slice(0, 4);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex w-full flex-col gap-3.5">
          {badgeItems.map((item, index) => {
            const { value, caption } = extractMetric(item.text);
            return (
              <div key={index} className="flex items-center gap-4" style={getSpotlightStyle(index)}>
                <div
                  className="flex h-16 min-w-16 shrink-0 items-center justify-center rounded-2xl px-3 text-xl font-extrabold tabular-nums tracking-tight text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    boxShadow: `0 6px 16px ${accent}40`,
                  }}
                >
                  {value ?? String(index + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  {editLabel(item, index, "text-base font-bold tracking-tight", { color: titleColor })}
                  {editText(item, index, "mt-0.5 text-xs leading-snug break-words", { color: bodyColor })}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------- dashboard-style-5: Progress Bars ----------------------- */
  if (layoutId === "dashboard-style-5") {
    const barItems = displayItems.slice(0, 5);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex w-full flex-col gap-5">
          {barItems.map((item, index) => {
            const { value } = extractMetric(item.text);
            const pct = percentFor(item.text, index);
            return (
              <div key={index} style={getSpotlightStyle(index)}>
                <div className="flex items-baseline justify-between gap-3">
                  {editLabel(item, index, "min-w-0 flex-1 text-sm font-bold tracking-tight", { color: titleColor })}
                  <span className="shrink-0 text-lg font-extrabold tabular-nums tracking-tight" style={{ color: accent }}>
                    {value ?? `${Math.round(pct)}%`}
                  </span>
                </div>
                <div
                  className="mt-2 h-2.5 overflow-hidden rounded-full"
                  style={{ backgroundColor: `${accent}1f`, border: `1px solid ${accent}26` }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${accent}cc, ${accent})`,
                      boxShadow: `0 0 8px ${accent}59`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------- dashboard-style-6: Ring Gauges -------------------------- */
  if (layoutId === "dashboard-style-6") {
    const ringItems = displayItems.slice(0, 4);
    const R = 40;
    const CIRC = 2 * Math.PI * R;
    const SPAN = 0.75;
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid w-full gap-x-6 gap-y-5"
          style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, ringItems.length))}, minmax(0, 1fr))` }}
        >
          {ringItems.map((item, index) => {
            const { value } = extractMetric(item.text);
            const pct = percentFor(item.text, index) / 100;
            return (
              <div key={index} className="flex flex-col items-center text-center" style={getSpotlightStyle(index)}>
                <div className="relative" style={{ width: 116, height: 116 }}>
                  <svg viewBox="0 0 100 100" className="h-full w-full" style={{ transform: "rotate(135deg)" }}>
                    <circle cx="50" cy="50" r={R} fill="none" stroke={`${accent}26`} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${SPAN * CIRC} ${CIRC}`} />
                    <circle cx="50" cy="50" r={R} fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${SPAN * CIRC * pct} ${CIRC}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center px-3">
                    <span className="text-lg font-extrabold tabular-nums tracking-tight" style={{ color: titleColor }}>
                      {value ?? `${Math.round(pct * 100)}%`}
                    </span>
                  </div>
                </div>
                {editLabel(item, index, "mt-2 text-sm font-bold tracking-tight", { color: titleColor })}
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------- dashboard-style-7: Ticker Board ------------------------- */
  if (layoutId === "dashboard-style-7") {
    const tickerItems = displayItems.slice(0, 4);
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid w-full gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, tickerItems.length))}, minmax(0, 1fr))` }}
        >
          {tickerItems.map((item, index) => {
            const { value, caption } = extractMetric(item.text);
            return (
              <div
                key={index}
                className="relative flex flex-col overflow-hidden rounded-2xl px-5 py-4"
                style={{
                  // Inverted contrast tile, but ANCHORED TO THE THEME: the
                  // heading-color base carries an accent corner glow + accent
                  // top rule so the tiles read as "this theme, inverted"
                  // rather than unrelated dark slabs.
                  background: `radial-gradient(130% 110% at 85% -10%, ${accent}66, transparent 55%), linear-gradient(150deg, ${titleColor}, ${titleColor})`,
                  border: `1px solid ${accent}40`,
                  boxShadow: `0 8px 24px ${accent}26`,
                  ...getSpotlightStyle(index),
                }}
              >
                {/* Accent top rule ties the tile to the deck's accent system */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-[3px] w-full"
                  style={{ background: `linear-gradient(90deg, ${accent}, ${accent}33)` }}
                />
                {editLabel(item, index, "text-[0.65rem] font-bold uppercase tracking-[0.14em]", {
                  color: accent,
                })}
                <div
                  className="mt-1.5 text-3xl font-extrabold leading-none tabular-nums tracking-tight"
                  style={{ color: theme?.colors.background || "#ffffff" }}
                >
                  {value ?? String(index + 1).padStart(2, "0")}
                </div>
                {editText(item, index, "mt-2 text-[0.7rem] leading-snug break-words opacity-70", {
                  color: theme?.colors.background || "#ffffff",
                })}
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------- dashboard-style-8: Leaderboard -------------------------- */
  if (layoutId === "dashboard-style-8") {
    const rankItems = displayItems.slice(0, 6);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex w-full flex-col">
          {rankItems.map((item, index) => {
            const { value } = extractMetric(item.text);
            const isDown = /^[-−▼]/.test(item.text.trim());
            return (
              <div
                key={index}
                className="flex items-center gap-4 py-3"
                style={{
                  borderBottom: index === rankItems.length - 1 ? "none" : `1px solid ${border}`,
                  ...getSpotlightStyle(index),
                }}
              >
                <span
                  className="w-9 shrink-0 text-right text-2xl font-extrabold leading-none tabular-nums"
                  style={{ color: `${accent}59` }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {editLabel(item, index, "text-sm font-bold tracking-tight", { color: titleColor })}
                </div>
                <span className="shrink-0 text-lg font-extrabold tabular-nums tracking-tight" style={{ color: titleColor }}>
                  {value ?? ""}
                </span>
                <span
                  className="flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.6rem] font-bold"
                  style={{
                    backgroundColor: isDown ? "rgba(239,68,68,0.14)" : `${accent}1f`,
                    color: isDown ? "#ef4444" : accent,
                  }}
                >
                  {isDown ? "▼" : "▲"}
                </span>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  /* ---------------- dashboard-style-4: Hero Metric ------------------------- */
  if (layoutId === "dashboard-style-4") {
    const [hero, ...rest] = displayItems;
    const sideItems = rest.slice(0, 4);
    const heroMetric = hero ? extractMetric(hero.text) : { value: null, caption: "" };
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="grid w-full grid-cols-5 items-center gap-8">
          {/* Dominant KPI */}
          {hero && (
            <div className="col-span-3" style={getSpotlightStyle(0)}>
              <div
                className="text-7xl font-extrabold leading-none tabular-nums tracking-tight sm:text-8xl"
                style={gradientNumeral}
              >
                {heroMetric.value ?? "№1"}
              </div>
              {editLabel(hero, 0, "mt-4 text-lg font-bold tracking-tight", { color: titleColor })}
              {editText(hero, 0, "mt-1.5 max-w-md text-sm leading-relaxed break-words", { color: bodyColor })}
            </div>
          )}
          {/* Supporting stats rail */}
          <div className="col-span-2 flex flex-col gap-3">
            {sideItems.map((item, i) => {
              const index = i + 1;
              const { value } = extractMetric(item.text);
              return (
                <div
                  key={index}
                  className="rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${border}`,
                    borderLeft: `3px solid ${accent}`,
                    ...getSpotlightStyle(index),
                  }}
                >
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xl font-extrabold tabular-nums tracking-tight" style={{ color: accent }}>
                      {value ?? String(index).padStart(2, "0")}
                    </span>
                    {editLabel(item, index, "min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wide", { color: titleColor })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div className={`grid ${gridColsClass} gap-4 sm:gap-5`}>
        {displayItems.map((item, index) => {
          const { value, caption } = extractMetric(item.text);
          const isStat = value !== null;
          // In stat mode the big number carries the figure, so the supporting
          // line is the remainder; in prose mode the whole text is the body.
          const description = isStat ? caption : item.text;

          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};

          const labelClass = isStat
            ? "text-xs font-medium uppercase tracking-wide mb-2"
            : "text-sm sm:text-base font-bold leading-snug mb-1.5";
          const descClass = isStat
            ? "text-xs sm:text-sm mt-2 leading-snug break-words"
            : "text-xs sm:text-sm mt-0.5 leading-relaxed break-words";

          return (
            <ItemWrapper
              key={index}
              className="ppt-tile flex flex-col rounded-2xl p-4 sm:p-5"
              style={{
                ...tileStyle(cardBg, border, accent, { bar: "top" }),
                ...getSpotlightStyle(index),
              }}
              {...variantsProps}
            >
              {/* Metric name — small caps for stats, a bold heading for prose */}
              {item.label &&
                (onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={
                      isEditing && editingText?.field === `content-label-${index}`
                    }
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                    className={labelClass}
                    style={{ color: isStat ? bodyColor : titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <span className={labelClass} style={{ color: isStat ? bodyColor : titleColor }}>
                    {item.label}
                  </span>
                ))}

              {/* Big metric value — only for genuine, short, number-led stats */}
              {isStat && (
                <div
                  className="text-3xl sm:text-4xl font-bold leading-none"
                  style={{ color: accent }}
                >
                  {value}
                </div>
              )}

              {/* Supporting description — keeps the full text (numbers intact) */}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={
                    isEditing && editingText?.field === `content-text-${index}`
                  }
                  onStartEdit={() => onStartEditText(index)}
                  onChange={(val) => onUpdateText?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                  className={descClass}
                  style={{ color: bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                description && (
                  <span className={descClass} style={{ color: bodyColor }}>
                    {description}
                  </span>
                )
              )}

              {/* Decorative mini bar chart — only meaningful alongside a stat */}
              {isStat && (
                <div className="flex items-end gap-1 mt-4" aria-hidden="true">
                  {MINI_BAR_HEIGHTS.slice(0, 4).map((h, barIndex) => (
                    <span
                      key={barIndex}
                      className="w-1.5 rounded-sm"
                      style={{
                        height: h,
                        backgroundColor: accent,
                        opacity: 0.35 + barIndex * 0.15,
                      }}
                    />
                  ))}
                </div>
              )}
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
