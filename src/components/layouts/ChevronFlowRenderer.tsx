"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { ChevronContentItem } from "~/lib/layouts/content/chevron";
import { getChevronColors, getChevronPath } from "~/lib/layouts/content/chevron";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -40,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface ThemeStyles {
  titleColor: string;
  bodyColor: string;
  numberColor: string;
  iconColor: string;
}

function getThemeStyles(theme?: Theme): ThemeStyles {
  if (!theme) {
    return {
      titleColor: "#1e293b",
      bodyColor: "#64748b",
      numberColor: "#ffffff",
      iconColor: "#ffffff",
    };
  }

  return {
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    numberColor: "#ffffff",
    iconColor: "#ffffff",
  };
}

interface ChevronFlowRendererProps {
  items: ChevronContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  layoutId?: string;
  isPresenting?: boolean;
  animationKey?: string;
  itemAnimation?: string;
  revealCount?: number;
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

export function ChevronFlowRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId,
  isPresenting = false,
  animationKey,
  itemAnimation,
  revealCount,
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
}: ChevronFlowRendererProps) {
  const displayItems = items.slice(0, 6); // Max 6 items
  const themeStyles = getThemeStyles(theme);
  const itemCount = displayItems.length;
  // Seam between overlapping chevrons — matches the slide background
  // (was hardcoded white, which drew bright outlines on dark themes)
  const seamColor = theme?.colors.background || "#ffffff";

  // Chevron dimensions
  const chevronWidth = 250;
  const chevronHeight = 180;
  const arrowWidth = 30;
  const overlap = 25; // How much chevrons overlap

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: 'all 0.4s ease-out',
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? {    variants: containerVariants,
    initial: "hidden",
    animate: "visible"
  } : {};

  // ---- Shared bits for the added styles (2-10) ----
  const accent = accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const surface = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const cardBorder = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  const editLabel = (item: ChevronContentItem, index: number, cls: string, style?: React.CSSProperties) =>
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
          style={{ color: themeStyles.titleColor, ...style }}
          isOwner={isOwner}
          isHovered={isHovered}
        />
      ) : (
        <h3 className={cls} style={{ color: themeStyles.titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;

  const editText = (item: ChevronContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText
        value={item.text}
        isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)}
        onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls}
        style={{ color: themeStyles.bodyColor, ...style }}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <p className={cls} style={{ color: themeStyles.bodyColor, ...style }}>{item.text}</p>
    );

  const RIGHT_ARROW = "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)";
  const CHEVRON_SEG = "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)";

  // == CHEVRON-STYLE-22: CHEVRON COLUMNS — full-height chevron-topped columns
  if (layoutId === "chevron-style-22") {
    const its = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex items-stretch gap-3 ${className}`} key={animationKey} {...cProps}>
        {its.map((item, index) => (
          <CItem key={index} className="flex flex-1 flex-col min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
            <div className="flex items-end justify-center pb-2 pt-3 text-white" style={{ background: `linear-gradient(180deg, ${accent}, ${alpha(accent, "cc")})`, clipPath: "polygon(0 22%, 50% 0, 100% 22%, 100% 100%, 0 100%)" }}>
              <span className="text-base font-extrabold tabular-nums">{pad2(index + 1)}</span>
            </div>
            <div className="flex-1 rounded-b-xl px-3 py-3" style={{ background: surface, border: `1px solid ${cardBorder}`, borderTop: "none" }}>
              {editLabel(item, index, "text-sm font-bold leading-tight")}
              {editText(item, index, "mt-1 text-[11px] leading-snug break-words")}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == CHEVRON-STYLE-23: INSET ARROWS — arrow segments with an inset number well
  if (layoutId === "chevron-style-23") {
    const its = items.slice(0, 5); const n = its.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex items-stretch" style={{ gap: 4 }}>
          {its.map((item, index) => {
            const first = index === 0; const t = n > 1 ? index / (n - 1) : 0;
            const bg = `color-mix(in srgb, ${accent} ${100 - t * 40}%, #0b1220 ${t * 40}%)`;
            return (
              <CItem key={index} className="relative flex flex-1 items-center gap-2.5 px-4 py-4" style={{ minWidth: 0, background: bg, clipPath: first ? RIGHT_ARROW : CHEVRON_SEG, paddingLeft: first ? 18 : 32, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums text-white" style={{ background: "rgba(0,0,0,0.22)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35)" }}>{index + 1}</span>
                <div className="min-w-0">{editLabel(item, index, "text-sm font-bold leading-tight", { color: "#ffffff" })}{editText(item, index, "text-[11px] leading-snug break-words", { color: "rgba(255,255,255,0.82)" })}</div>
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-24: CHEVRON PATH — a rising chevron trail with cards
  if (layoutId === "chevron-style-24") {
    const its = items.slice(0, 5); const n = its.length;
    return (
      <Container className={`w-full h-full flex flex-col-reverse justify-center gap-1 ${className}`} key={animationKey} {...cProps}>
        {its.map((item, index) => {
          const indent = n > 1 ? (index / (n - 1)) * 40 : 0;
          return (
            <div key={index} className="flex items-center" style={{ marginLeft: `${indent}%` }}>
              <CItem className="ppt-tile flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ width: "58%", background: surface, border: `1px solid ${cardBorder}`, borderLeft: `3px solid ${accent}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                <span className="text-lg font-bold leading-none" style={{ color: alpha(accent, "b3") }} aria-hidden>↗</span>
                <span className="font-mono text-xs font-bold tabular-nums" style={{ color: accent }}>{pad2(index + 1)}</span>
                <div className="min-w-0">{editLabel(item, index, "text-sm font-bold leading-tight")}{editText(item, index, "text-[11px] leading-snug break-words")}</div>
              </CItem>
            </div>
          );
        })}
      </Container>
    );
  }

  // == CHEVRON-STYLE-25: SPLIT CHEVRONS — two-tone arrow halves per step
  if (layoutId === "chevron-style-25") {
    const its = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex items-stretch" style={{ gap: 4 }}>
          {its.map((item, index) => {
            const first = index === 0;
            return (
              <CItem key={index} className="relative flex flex-1 flex-col justify-center overflow-hidden px-5 py-4" style={{ minWidth: 0, clipPath: first ? RIGHT_ARROW : CHEVRON_SEG, paddingLeft: first ? 20 : 34, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                <span aria-hidden className="absolute inset-x-0 top-0 h-1/2" style={{ background: accent }} />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: alpha(accent, "b3") }} />
                <div className="relative">
                  <span className="text-lg font-extrabold tabular-nums" style={{ color: "rgba(255,255,255,0.9)" }}>{pad2(index + 1)}</span>
                  {editLabel(item, index, "text-sm font-bold leading-tight", { color: "#ffffff" })}
                </div>
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-26: ARROW LADDER — vertical down-arrows head to tail
  if (layoutId === "chevron-style-26") {
    const its = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center gap-1 px-6 ${className}`} key={animationKey} {...cProps}>
        {its.map((item, index) => {
          const last = index === its.length - 1;
          return (
            <CItem key={index} className="flex w-full max-w-xl items-center gap-4 px-6 pt-3.5" style={{ paddingBottom: last ? 14 : 26, marginBottom: last ? 0 : -12, background: `linear-gradient(135deg, ${alpha(accent, "24")}, ${alpha(accent, "0d")})`, border: `1px solid ${alpha(accent, "33")}`, clipPath: last ? undefined : "polygon(0 0, 100% 0, 100% calc(100% - 14px), 50% 100%, 0 calc(100% - 14px))", borderRadius: last ? 12 : 0, zIndex: index + 1, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold text-white tabular-nums" style={{ background: accent }}>{index + 1}</span>
              <div className="min-w-0 flex-1">{editLabel(item, index, "text-sm font-bold leading-tight")}{editText(item, index, "text-xs leading-snug break-words")}</div>
            </CItem>
          );
        })}
      </Container>
    );
  }

  // == CHEVRON-STYLE-27: NEON CHEVRONS — glowing outlined chevrons
  if (layoutId === "chevron-style-27") {
    const its = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex w-full items-stretch" style={{ gap: 5 }}>
          {its.map((item, index) => {
            const first = index === 0;
            return (
              <div key={index} className="relative flex-1" style={{ minWidth: 0 }}>
                <div className="absolute inset-0" style={{ background: accent, clipPath: first ? RIGHT_ARROW : CHEVRON_SEG, filter: `drop-shadow(0 0 6px ${alpha(accent, "80")})` }} aria-hidden />
                <CItem className="relative flex h-full flex-col justify-center py-5" style={{ paddingLeft: first ? 20 : 34, paddingRight: 30, background: theme?.colors.background || "#0b1220", clipPath: first ? RIGHT_ARROW : CHEVRON_SEG, margin: 2, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                  <span className="text-sm font-extrabold tabular-nums" style={{ color: accent }}>{pad2(index + 1)}</span>
                  {editLabel(item, index, "mt-1 text-sm font-bold leading-tight", { color: accent })}
                  {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words", { color: alpha(accent, "b3") })}
                </CItem>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-28: CHEVRON FOLD — folded accordion chevron panels
  if (layoutId === "chevron-style-28") {
    const its = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex items-stretch ${className}`} key={animationKey} {...cProps}>
        {its.map((item, index) => {
          const first = index === 0; const lit = index % 2 === 0;
          return (
            <CItem key={index} className="relative flex flex-1 flex-col justify-center px-5 py-4" style={{ minWidth: 0, marginLeft: first ? 0 : -14, background: lit ? `linear-gradient(180deg, ${alpha(accent, "2e")}, ${alpha(accent, "17")})` : `linear-gradient(180deg, ${alpha(accent, "12")}, ${alpha(accent, "05")})`, borderLeft: `1px solid ${alpha(accent, "40")}`, clipPath: first ? RIGHT_ARROW : CHEVRON_SEG, paddingLeft: first ? 20 : 34, zIndex: its.length - index, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <span className="text-sm font-extrabold tabular-nums" style={{ color: accent }}>{pad2(index + 1)}</span>
              {editLabel(item, index, "mt-1 text-sm font-bold leading-tight")}
              {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words")}
            </CItem>
          );
        })}
      </Container>
    );
  }

  // == CHEVRON-STYLE-29: COMPACT ARROWS — dense single-line arrow strip
  if (layoutId === "chevron-style-29") {
    const its = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-4 ${className}`} key={animationKey} {...cProps}>
        <div className="flex items-stretch" style={{ gap: 3 }}>
          {its.map((item, index) => {
            const first = index === 0;
            return (
              <CItem key={index} className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5" style={{ minWidth: 0, background: alpha(accent, index % 2 ? "17" : "2e"), clipPath: first ? RIGHT_ARROW : CHEVRON_SEG, paddingLeft: first ? 12 : 24, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                <span className="text-xs font-extrabold tabular-nums" style={{ color: accent }}>{index + 1}</span>
                {editLabel(item, index, "truncate text-xs font-bold leading-tight") || editText(item, index, "truncate text-xs leading-tight", { color: themeStyles.titleColor })}
              </CItem>
            );
          })}
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${its.length}, minmax(0, 1fr))` }}>
          {its.map((item, index) => (
            <div key={index} className="px-1 text-center">{item.label ? editText(item, index, "text-[11px] leading-snug break-words") : null}</div>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-30: CHEVRON SPOTLIGHT — one emphasized arrow among quiet ones
  if (layoutId === "chevron-style-30") {
    const its = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex w-full items-stretch" style={{ gap: 4 }}>
          {its.map((item, index) => {
            const first = index === 0; const on = index === 0;
            return (
              <CItem key={index} className="relative flex flex-col justify-center px-4 py-5" style={{ flex: on ? 1.6 : 1, minWidth: 0, background: on ? `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})` : alpha(accent, "14"), border: on ? "none" : `1px solid ${alpha(accent, "33")}`, clipPath: first ? RIGHT_ARROW : CHEVRON_SEG, paddingLeft: first ? 18 : 32, boxShadow: on ? `0 6px 18px ${alpha(accent, "4d")}` : undefined, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
                <span className="text-sm font-extrabold tabular-nums" style={{ color: on ? "rgba(255,255,255,0.85)" : accent }}>{pad2(index + 1)}</span>
                {editLabel(item, index, `mt-1 font-bold leading-tight ${on ? "text-base" : "text-sm"}`, { color: on ? "#ffffff" : themeStyles.titleColor })}
                {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words", { color: on ? "rgba(255,255,255,0.85)" : themeStyles.bodyColor })}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-11: OUTLINE CHEVRONS — stroke-only segments, content inside
  if (layoutId === "chevron-style-11") {
    const oItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex w-full items-stretch" style={{ gap: 3 }}>
          {oItems.map((item, index) => {
            const first = index === 0;
            return (
              <div key={index} className="relative flex-1" style={{ minWidth: 0 }}>
                {/* outline shape */}
                <div className="absolute inset-0" style={{ background: alpha(accent, "40"), clipPath: first ? RIGHT_ARROW : CHEVRON_SEG }} aria-hidden />
                <CItem
                  className="relative flex h-full flex-col justify-center py-5"
                  style={{
                    paddingLeft: first ? 20 : 34,
                    paddingRight: 30,
                    background: surface,
                    clipPath: first ? RIGHT_ARROW : CHEVRON_SEG,
                    margin: 1.5,
                    ...getSpotlightStyle(index),
                  }}
                  {...itemMotion(index)}
                >
                  <span className="font-mono text-[11px] font-bold tracking-[0.2em]" style={{ color: accent }}>{pad2(index + 1)}</span>
                  {editLabel(item, index, "mt-1 text-sm font-bold leading-tight")}
                  {editText(item, index, "mt-1 text-[11px] leading-snug break-words")}
                </CItem>
              </div>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-12: RIBBON BANNERS — forked-tail pennant strips
  if (layoutId === "chevron-style-12") {
    const rItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-3 px-2 ${className}`} key={animationKey} {...cProps}>
        {rItems.map((item, index) => (
          <CItem
            key={index}
            className="flex items-center gap-4 py-3 pl-6 pr-12 min-w-0"
            style={{
              width: "88%",
              background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "b3")})`,
              clipPath: "polygon(0 0, calc(100% - 22px) 0, 100% 50%, calc(100% - 22px) 100%, 0 100%, 22px 50%)",
              boxShadow: `0 3px 10px ${alpha(accent, "26")}`,
              ...getSpotlightStyle(index),
            }}
            {...itemMotion(index)}
          >
            <span className="text-lg font-extrabold tabular-nums" style={{ color: "rgba(255,255,255,0.85)" }}>{pad2(index + 1)}</span>
            <div className="min-w-0 flex-1">
              {editLabel(item, index, "text-sm font-bold leading-tight", { color: "#ffffff" })}
              {editText(item, index, "text-[11px] leading-snug break-words", { color: "rgba(255,255,255,0.82)" })}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == CHEVRON-STYLE-13: GRADIENT MERGE — one gradient across all segments
  if (layoutId === "chevron-style-13") {
    const gItems = items.slice(0, 5);
    const n = gItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative flex items-stretch" style={{ gap: 3 }}>
          {gItems.map((item, index) => {
            const first = index === 0;
            const c0 = `color-mix(in srgb, ${accent} ${100 - (index / Math.max(n - 1, 1)) * 55}%, #0b1220 ${(index / Math.max(n - 1, 1)) * 55}%)`;
            return (
              <CItem
                key={index}
                className="relative flex flex-1 flex-col justify-center px-5 py-5"
                style={{ minWidth: 0, background: c0, clipPath: first ? RIGHT_ARROW : CHEVRON_SEG, paddingLeft: first ? 20 : 34, ...getSpotlightStyle(index) }}
                {...itemMotion(index)}
              >
                {editLabel(item, index, "text-sm font-bold leading-tight", { color: "#ffffff" })}
                {editText(item, index, "mt-1 text-[11px] leading-snug break-words", { color: "rgba(255,255,255,0.82)" })}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-14: CHEVRON TIMELINE — baseline dots + chevron marks
  if (layoutId === "chevron-style-14") {
    const tItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative mb-5 flex items-center justify-between px-8">
          <div className="absolute left-8 right-8 top-1/2 h-[2px] -translate-y-1/2" style={{ background: alpha(accent, "33") }} aria-hidden />
          {tItems.map((_, index) => (
            <React.Fragment key={index}>
              <span
                className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold tabular-nums text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 0 0 4px ${surface}` }}
              >
                {index + 1}
              </span>
              {index < tItems.length - 1 && (
                <span className="relative z-10 text-lg font-bold" style={{ color: alpha(accent, "8c") }} aria-hidden>›</span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between gap-3 px-4">
          {tItems.map((item, index) => (
            <CItem key={index} className="min-w-0 flex-1 text-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-15: NESTED CHEVRONS — growing » markers
  if (layoutId === "chevron-style-15") {
    const nItems = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-3.5 px-3 ${className}`} key={animationKey} {...cProps}>
        {nItems.map((item, index) => (
          <CItem key={index} className="flex items-start gap-3.5 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
            <span className="shrink-0 font-mono text-base font-extrabold leading-tight tabular-nums" style={{ color: accent, width: 52, letterSpacing: "-1px" }} aria-hidden>
              {"»".repeat(Math.min(index + 1, 4))}
            </span>
            <div className="min-w-0">
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-relaxed break-words")}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == CHEVRON-STYLE-16: CHEVRON GRID — 2-col cards with a chevron corner
  if (layoutId === "chevron-style-16") {
    const gItems = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid w-full grid-cols-2 gap-3">
          {gItems.map((item, index) => (
            <CItem
              key={index}
              className="relative overflow-hidden rounded-xl p-4 pl-11 min-w-0"
              style={{ background: surface, border: `1px solid ${cardBorder}`, ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              {/* chevron corner */}
              <span
                className="absolute left-0 top-0 flex h-full w-9 items-center justify-center text-xs font-extrabold tabular-nums text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, clipPath: "polygon(0 0, 100% 0, 60% 50%, 100% 100%, 0 100%)" }}
              >
                {index + 1}
              </span>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-17: PENNANT FLAGS — triangular flags on a string
  if (layoutId === "chevron-style-17") {
    const pItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-start pt-6 ${className}`} key={animationKey} {...cProps}>
        <div className="mb-1 h-[3px] rounded-full" style={{ background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "40")})` }} aria-hidden />
        <div className="flex items-start justify-between gap-3 px-2">
          {pItems.map((item, index) => (
            <CItem key={index} className="flex min-w-0 flex-1 flex-col items-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {/* triangular pennant */}
              <div
                className="flex w-full items-start justify-center pt-2 text-white"
                style={{ height: 54, background: `linear-gradient(180deg, ${accent}, ${alpha(accent, "b3")})`, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              >
                <span className="text-sm font-extrabold tabular-nums">{index + 1}</span>
              </div>
              {editLabel(item, index, "mt-2 text-center text-xs font-bold leading-tight")}
              {editText(item, index, "mt-1 text-center text-[11px] leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-18: BOOMERANG STACK — wide angle-bracket shapes
  if (layoutId === "chevron-style-18") {
    const bItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-2 px-2 ${className}`} key={animationKey} {...cProps}>
        {bItems.map((item, index) => (
          <CItem
            key={index}
            className="flex items-center gap-4 py-3 pl-6 pr-6 min-w-0"
            style={{
              background: `linear-gradient(135deg, ${alpha(accent, "26")}, ${alpha(accent, "0f")})`,
              border: `1px solid ${alpha(accent, "33")}`,
              clipPath: "polygon(0 0, 100% 0, calc(100% - 24px) 50%, 100% 100%, 0 100%, 24px 50%)",
              ...getSpotlightStyle(index),
            }}
            {...itemMotion(index)}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold tabular-nums text-white" style={{ background: accent }}>
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == CHEVRON-STYLE-19: CHEVRON PROGRESS — segmented notched bar, labels below
  if (layoutId === "chevron-style-19") {
    const pItems = items.slice(0, 5);
    const n = pItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="mb-5 flex items-stretch overflow-hidden rounded-lg" style={{ gap: 2, height: 30 }}>
          {pItems.map((_, index) => {
            const first = index === 0;
            const c0 = `color-mix(in srgb, ${accent} ${100 - (index / Math.max(n - 1, 1)) * 50}%, #0b1220 ${(index / Math.max(n - 1, 1)) * 50}%)`;
            return (
              <div
                key={index}
                className="flex flex-1 items-center justify-center text-[11px] font-extrabold tabular-nums text-white"
                style={{ background: c0, clipPath: first ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)" : "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)" }}
              >
                {index + 1}
              </div>
            );
          })}
        </div>
        <div className="flex" style={{ gap: 2 }}>
          {pItems.map((item, index) => (
            <CItem key={index} className="min-w-0 flex-1 px-1 text-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {editLabel(item, index, "text-xs font-bold leading-tight")}
              {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-20: DIRECTIONAL TILES — tiles with chevron watermark
  if (layoutId === "chevron-style-20") {
    const dItems = items.slice(0, 6);
    const cols = dItems.length <= 4 ? 2 : 3;
    return (
      <Container className={`w-full h-full flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {dItems.map((item, index) => (
            <CItem
              key={index}
              className="relative overflow-hidden rounded-xl p-4 min-w-0"
              style={{ background: surface, border: `1px solid ${cardBorder}`, ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              {/* big chevron watermark */}
              <span
                className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 select-none font-black leading-none"
                style={{ fontSize: 72, color: alpha(accent, "14") }}
                aria-hidden
              >
                ›
              </span>
              <span className="relative font-mono text-[11px] font-bold tracking-[0.2em]" style={{ color: accent }}>{pad2(index + 1)}</span>
              {editLabel(item, index, "relative mt-1 text-sm font-bold tracking-tight")}
              {editText(item, index, "relative mt-0.5 text-xs leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-21: CHEVRON MILESTONES — vertical rail of » badges
  if (layoutId === "chevron-style-21") {
    const mItems = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-2.5 px-2 ${className}`} key={animationKey} {...cProps}>
        <div className="relative flex flex-col gap-2.5">
          <div className="absolute bottom-3 top-3 w-[2px]" style={{ left: 17, background: alpha(accent, "33") }} aria-hidden />
          {mItems.map((item, index) => (
            <CItem key={index} className="relative flex items-center gap-4 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span
                className="z-10 flex h-9 w-9 shrink-0 items-center justify-center text-xs font-extrabold tabular-nums text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, clipPath: "polygon(0 0, 74% 0, 100% 50%, 74% 100%, 0 100%, 26% 50%)", boxShadow: `0 0 0 4px ${surface}` }}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 rounded-xl px-4 py-2.5" style={{ background: surface, border: `1px solid ${cardBorder}` }}>
                {editLabel(item, index, "text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-2: SOLID ARROW ROW — filled accent arrow segments
  if (layoutId === "chevron-style-2") {
    const aItems = items.slice(0, 5);
    const n = aItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex items-stretch" style={{ gap: 4 }}>
          {aItems.map((item, index) => {
            const first = index === 0;
            const t = n > 1 ? index / (n - 1) : 0;
            const bg = `color-mix(in srgb, ${accent} ${100 - t * 42}%, #0b1220 ${t * 42}%)`;
            return (
              <CItem
                key={index}
                className="relative flex flex-1 flex-col justify-center px-5 py-4"
                style={{
                  minWidth: 0,
                  background: bg,
                  clipPath: first ? RIGHT_ARROW : CHEVRON_SEG,
                  paddingLeft: first ? 20 : 34,
                  ...getSpotlightStyle(index),
                }}
                {...itemMotion(index)}
              >
                <span className="text-lg font-extrabold tabular-nums leading-none" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {pad2(index + 1)}
                </span>
                {editLabel(item, index, "mt-1.5 text-sm font-bold leading-tight", { color: "#ffffff" })}
                {editText(item, index, "mt-1 text-[11px] leading-snug break-words", { color: "rgba(255,255,255,0.82)" })}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-3: CHEVRON STACK — downward chevron bars stacked
  if (layoutId === "chevron-style-3") {
    const sItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-1 px-6 ${className}`} key={animationKey} {...cProps}>
        {sItems.map((item, index) => {
          const last = index === sItems.length - 1;
          return (
            <CItem
              key={index}
              className="relative flex items-center gap-4 px-6 pt-4"
              style={{
                paddingBottom: last ? 16 : 30,
                marginBottom: last ? 0 : -14,
                background: `linear-gradient(135deg, ${alpha(accent, "26")}, ${alpha(accent, "0f")})`,
                border: `1px solid ${alpha(accent, "33")}`,
                clipPath: last ? undefined : "polygon(0 0, 100% 0, 100% calc(100% - 16px), 50% 100%, 0 calc(100% - 16px))",
                borderRadius: last ? 12 : 0,
                zIndex: index + 1,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold tabular-nums text-white"
                style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 3px 8px ${alpha(accent, "40")}` }}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {editLabel(item, index, "text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
            </CItem>
          );
        })}
      </Container>
    );
  }

  // == CHEVRON-STYLE-4: ARROW CARDS — cards clipped into right arrows
  if (layoutId === "chevron-style-4") {
    const cItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex w-full items-stretch" style={{ gap: 2 }}>
          {cItems.map((item, index) => {
            const first = index === 0;
            const tint = index % 2 === 0;
            return (
              <CItem
                key={index}
                className="relative flex flex-1 flex-col justify-center py-5"
                style={{
                  minWidth: 0,
                  paddingLeft: first ? 18 : 34,
                  paddingRight: 30,
                  background: tint ? alpha(accent, "1a") : surface,
                  border: `1px solid ${cardBorder}`,
                  clipPath: first ? RIGHT_ARROW : CHEVRON_SEG,
                  ...getSpotlightStyle(index),
                }}
                {...itemMotion(index)}
              >
                <span className="font-mono text-[11px] font-bold tracking-[0.2em]" style={{ color: accent }}>
                  {pad2(index + 1)}
                </span>
                {editLabel(item, index, "mt-1 text-sm font-bold leading-tight")}
                {editText(item, index, "mt-1 text-[11px] leading-snug break-words")}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-5: ANGLE BRACKETS — text blocks split by chevron glyphs
  if (layoutId === "chevron-style-5") {
    const bItems = items.slice(0, 4);
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex w-full items-center justify-between">
          {bItems.map((item, index) => (
            <React.Fragment key={index}>
              <CItem className="min-w-0 flex-1 text-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold tabular-nums text-white" style={{ background: accent }}>
                  {index + 1}
                </div>
                {editLabel(item, index, "text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-1 text-xs leading-snug break-words")}
              </CItem>
              {index < bItems.length - 1 && (
                <span className="shrink-0 px-2 text-4xl font-light leading-none" style={{ color: alpha(accent, "8c") }} aria-hidden>
                  ›
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-6: CHEVRON RAIL — numbered chevron pills on a rail
  if (layoutId === "chevron-style-6") {
    const rItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="relative mb-6 flex justify-between px-6">
          {/* Chevron-patterned rail */}
          <div
            className="absolute left-6 right-6 top-1/2 h-2 -translate-y-1/2 rounded-full"
            style={{
              background: `repeating-linear-gradient(115deg, ${accent} 0 8px, ${alpha(accent, "40")} 8px 16px)`,
              opacity: 0.5,
            }}
            aria-hidden
          />
          {rItems.map((_, index) => (
            <span
              key={index}
              className="relative z-10 flex items-center justify-center text-sm font-extrabold tabular-nums text-white"
              style={{
                width: 46,
                height: 34,
                background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
                clipPath: "polygon(0 0, 78% 0, 100% 50%, 78% 100%, 0 100%, 22% 50%)",
                boxShadow: `0 3px 10px ${alpha(accent, "40")}`,
              }}
            >
              {index + 1}
            </span>
          ))}
        </div>
        <div className="flex justify-between gap-3 px-4">
          {rItems.map((item, index) => (
            <CItem key={index} className="min-w-0 flex-1 text-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-7: ZIGZAG TABS — alternating up/down chevron tabs
  if (layoutId === "chevron-style-7") {
    const zItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex w-full items-stretch" style={{ gap: 6 }}>
          {zItems.map((item, index) => {
            const up = index % 2 === 0;
            return (
              <CItem
                key={index}
                className="flex flex-1 flex-col items-center px-3 py-5 min-w-0"
                style={{
                  background: up ? `linear-gradient(180deg, ${alpha(accent, "26")}, ${alpha(accent, "0f")})` : `linear-gradient(180deg, ${alpha(accent, "0f")}, ${alpha(accent, "26")})`,
                  border: `1px solid ${alpha(accent, "33")}`,
                  clipPath: up
                    ? "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)"
                    : "polygon(0 18%, 50% 0, 100% 18%, 100% 100%, 0 100%)",
                  ...getSpotlightStyle(index),
                }}
                {...itemMotion(index)}
              >
                <span className="mb-1.5 text-sm font-extrabold tabular-nums" style={{ color: accent }}>{pad2(index + 1)}</span>
                {editLabel(item, index, "text-center text-xs font-bold leading-tight")}
                {editText(item, index, "mt-1 text-center text-[11px] leading-snug break-words")}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-8: ASCENDING STEPS — chevron blocks rising, labels below
  if (layoutId === "chevron-style-8") {
    const asItems = items.slice(0, 5);
    const n = asItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="mb-4 flex items-end" style={{ gap: 3, height: 150 }}>
          {asItems.map((_, index) => {
            const h = 70 + (index * 70) / Math.max(n - 1, 1);
            return (
              <div
                key={index}
                className="flex flex-1 items-start justify-center pt-2.5 text-white"
                style={{
                  height: h,
                  background: `linear-gradient(180deg, ${accent}, ${alpha(accent, "b3")})`,
                  clipPath: "polygon(0 14px, 50% 0, 100% 14px, 100% 100%, 0 100%)",
                }}
                aria-hidden
              >
                <span className="text-base font-extrabold tabular-nums">{pad2(index + 1)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex" style={{ gap: 3 }}>
          {asItems.map((item, index) => (
            <CItem key={index} className="min-w-0 flex-1 text-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {editLabel(item, index, "text-xs font-bold leading-tight")}
              {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == CHEVRON-STYLE-9: DOUBLE CHEVRON — mono » markers, indented list
  if (layoutId === "chevron-style-9") {
    const dItems = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-3.5 px-3 ${className}`} key={animationKey} {...cProps}>
        {dItems.map((item, index) => (
          <CItem key={index} className="flex items-start gap-3.5 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
            <span className="shrink-0 font-mono text-lg font-extrabold leading-tight" style={{ color: accent }} aria-hidden>
              »
            </span>
            <div className="min-w-0 pl-3.5" style={{ borderLeft: `2px solid ${alpha(accent, "33")}` }}>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-relaxed break-words")}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == CHEVRON-STYLE-10: SIGNPOST CHEVRONS — direction sign boards
  if (layoutId === "chevron-style-10") {
    const sgItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-2.5 px-4 ${className}`} key={animationKey} {...cProps}>
        {sgItems.map((item, index) => {
          const solid = index % 2 === 0;
          return (
            <CItem
              key={index}
              className="flex items-center gap-4 py-3 pl-5 pr-10 min-w-0"
              style={{
                width: "82%",
                background: solid ? `linear-gradient(90deg, ${accent}, ${alpha(accent, "cc")})` : alpha(accent, "1a"),
                border: solid ? "none" : `1px solid ${alpha(accent, "40")}`,
                clipPath: "polygon(0 0, calc(100% - 26px) 0, 100% 50%, calc(100% - 26px) 100%, 0 100%)",
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums"
                style={{ background: solid ? "rgba(255,255,255,0.22)" : accent, color: "#ffffff" }}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {editLabel(item, index, "text-sm font-bold leading-tight", { color: solid ? "#ffffff" : themeStyles.titleColor })}
                {editText(item, index, "mt-0.5 text-[11px] leading-snug break-words", { color: solid ? "rgba(255,255,255,0.85)" : themeStyles.bodyColor })}
              </div>
            </CItem>
          );
        })}
      </Container>
    );
  }

  return (
    <Container className={`w-full py-8 ${className}`} key={animationKey} {...containerProps}>
      {/* Chevron arrows */}
      <div className="flex items-center justify-center mb-8" style={{ marginLeft: `${arrowWidth}px` }}>
        <div className="flex items-center" style={{ marginLeft: `-${overlap * (itemCount - 1)}px` }}>
          {displayItems.map((item, index) => {
            const colors = getChevronColors(index, itemCount, accentColor, theme?.colors.secondary);
            const chevronPath = getChevronPath(chevronWidth, chevronHeight, arrowWidth);
            
            const ItemWrapper = isPresenting ? motion.div : "div";
            const variantsProps = isPresenting ? { variants: itemVariants } : {};

            return (
              <ItemWrapper
                key={index}
                className="relative flex-shrink-0"
                style={{
                  width: `${chevronWidth}px`,
                  height: `${chevronHeight}px`,
                  marginLeft: index > 0 ? `-${overlap}px` : "0",
                  zIndex: itemCount - index,
                  ...getSpotlightStyle(index),
                }}
                {...variantsProps}
              >
                {/* SVG Chevron */}
                <svg
                  width={chevronWidth}
                  height={chevronHeight}
                  viewBox={`0 0 ${chevronWidth} ${chevronHeight}`}
                  className="absolute inset-0"
                  style={{
                    overflow: "visible",
                    filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.12))",
                  }}
                >
                  <path
                    d={chevronPath}
                    fill={colors.bg}
                    stroke={seamColor}
                    strokeWidth="3"
                  />
                </svg>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-6">
                  {/* Number */}
                  <div
                    className="text-2xl font-extrabold mb-4 tabular-nums"
                    style={{ color: themeStyles.numberColor, letterSpacing: "-0.02em" }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Icon */}
                  {item.icon && (
                    <div
                      className="text-4xl mb-2"
                      style={{ color: themeStyles.iconColor }}
                    >
                      {item.icon}
                    </div>
                  )}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </div>

      {/* Content descriptions below */}
      <div className="flex items-start justify-center gap-4 px-8">
        {displayItems.map((item, index) => {
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};
          const colors = getChevronColors(index, itemCount, accentColor, theme?.colors.secondary);

          return (
            <ItemWrapper
              key={index}
              className="flex-1"
              style={{
                maxWidth: `${chevronWidth - 10}px`,
                ...getSpotlightStyle(index),
              }}
              {...variantsProps}
            >
              {/* Label */}
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                    className="font-bold text-base mb-2 leading-tight"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="font-bold text-base mb-2 leading-tight"
                    style={{ color: themeStyles.titleColor }}
                  >
                    {item.label}
                  </h3>
                )
              )}

              {/* Description */}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${index}`}
                  onStartEdit={() => onStartEditText(index)}
                  onChange={(val) => onUpdateText?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                >
                  {item.text}
                </p>
              )}

              {/* Color indicator bar */}
              <div
                className="mt-3 h-1 rounded-full"
                style={{
                  backgroundColor: colors.bg,
                  width: "70%",
                }}
              />
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
