"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { tileStyle } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
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
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface TimelineRoadmapRendererProps {
  items: BoxContentItem[];
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

export function TimelineRoadmapRenderer({
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
}: TimelineRoadmapRendererProps) {
  const displayItems = items.slice(0, 5); // Cap at 5 milestones

  // Defensive color fallbacks
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg =
    theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.06)";
  const cardBorder =
    theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";

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
        variants: containerVariantsFor(itemAnimation),
        initial: "hidden" as const,
        animate: "visible" as const,
      }
    : {};

  const ItemWrapper = isPresenting ? motion.div : "div";
  // Per-item motion: user-picked entrance style + optional click-to-reveal.
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const pad2 = (n: number) => String(n).padStart(2, "0");

  // Shared editable label/text used by the added styles (2-6). Style 1 keeps
  // its original inline blocks below.
  const editLabel = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
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
          style={{ color: titleColor, ...style }}
          isOwner={isOwner}
          isHovered={isHovered}
        />
      ) : (
        <h3 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;

  const editText = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText
        value={item.text}
        isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)}
        onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls}
        style={{ color: bodyColor, ...style }}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
    );

  const numberDot = (index: number, size = "2.1rem") => (
    <div
      className="flex items-center justify-center rounded-full flex-shrink-0 font-bold text-xs tabular-nums z-10"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
        color: "#ffffff",
        boxShadow: `0 0 0 4px ${cardBg}, 0 3px 10px ${alpha(accent, "4d")}`,
        letterSpacing: "-0.02em",
      }}
    >
      {index + 1}
    </div>
  );

  // == TIMELINE-STYLE-2: METRO LINE — thick transit line, station rings, cards below
  if (layoutId === "timeline-style-2") {
    const metroItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center px-6 py-6 ${className}`} key={animationKey} {...containerProps}>
        <div className="relative flex items-start justify-between gap-3">
          {/* Transit line through the station centers */}
          <div
            className="absolute left-0 right-0 rounded-full"
            style={{
              top: 24,
              height: 10,
              background: `linear-gradient(90deg, ${alpha(accent, "26")}, ${accent} 10%, ${accent} 90%, ${alpha(accent, "26")})`,
              boxShadow: `0 3px 14px ${alpha(accent, "40")}`,
            }}
          />
          {metroItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative flex-1 flex flex-col items-center min-w-0"
              style={getSpotlightStyle(index)}
              {...itemMotion(index)}
            >
              {/* Station ring punched through the line */}
              <div
                className="z-10 flex items-center justify-center rounded-full font-bold tabular-nums"
                style={{
                  width: 34,
                  height: 34,
                  marginTop: 12,
                  fontSize: 12,
                  background: cardBg,
                  border: `4px solid ${accent}`,
                  color: titleColor,
                  boxShadow: `0 0 0 4px ${alpha(accent, "1f")}`,
                }}
              >
                {index + 1}
              </div>
              <div className="w-[2px] h-3.5 flex-shrink-0" style={{ backgroundColor: accent, opacity: 0.5 }} />
              <div className="ppt-tile w-full rounded-xl px-3.5 py-2.5" style={tileStyle(cardBg, cardBorder, accent)}>
                {editLabel(item, index, "font-bold text-sm leading-tight mb-1")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == TIMELINE-STYLE-3: VERTICAL SPINE — center spine, alternating cards
  if (layoutId === "timeline-style-3") {
    const vItems = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex flex-col justify-center px-8 py-4 ${className}`} key={animationKey} {...containerProps}>
        <div className="relative flex flex-col justify-center gap-2">
          <div
            className="absolute left-1/2 top-1 bottom-1 w-[2px] -translate-x-1/2 rounded-full"
            style={{ background: `linear-gradient(180deg, ${alpha(accent, "26")}, ${accent}, ${alpha(accent, "26")})` }}
          />
          {vItems.map((item, index) => {
            const onLeft = index % 2 === 0;
            const card = (
              <div className="ppt-tile inline-block max-w-full rounded-xl px-3.5 py-2 text-left" style={tileStyle(cardBg, cardBorder, accent)}>
                {editLabel(item, index, "font-bold text-sm leading-tight mb-0.5")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            );
            return (
              <ItemWrapper
                key={index}
                className="relative grid items-center gap-3"
                style={{ gridTemplateColumns: "1fr 2.4rem 1fr", ...getSpotlightStyle(index) }}
                {...itemMotion(index)}
              >
                <div className="flex justify-end min-w-0">{onLeft ? card : null}</div>
                <div className="flex items-center justify-center">{numberDot(index, "1.9rem")}</div>
                <div className="flex justify-start min-w-0">{onLeft ? null : card}</div>
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  // == TIMELINE-STYLE-4: MILESTONE FLAGS — poles rising step by step from a baseline
  if (layoutId === "timeline-style-4") {
    const fItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-end px-6 pt-6 pb-10 ${className}`} key={animationKey} {...containerProps}>
        <div className="relative flex items-end justify-between gap-3">
          {/* Baseline through the footing centers */}
          <div
            className="absolute left-0 right-0 rounded-full"
            style={{ bottom: 12, height: 2, background: `linear-gradient(90deg, ${alpha(accent, "33")}, ${accent}, ${alpha(accent, "33")})` }}
          />
          {fItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative flex-1 flex flex-col items-center justify-end min-w-0"
              style={getSpotlightStyle(index)}
              {...itemMotion(index)}
            >
              <div
                className="ppt-tile w-full rounded-xl px-3.5 py-2.5"
                style={{ ...tileStyle(cardBg, cardBorder, accent), borderLeft: `3px solid ${accent}` }}
              >
                {editLabel(item, index, "font-bold text-sm leading-tight mb-1")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
              {/* Pole grows with progress */}
              <div
                className="flex-shrink-0"
                style={{ width: 2, height: 26 + index * 20, background: `linear-gradient(180deg, ${accent}, ${alpha(accent, "40")})` }}
              />
              <div
                className="z-10 flex items-center justify-center rounded-full font-bold tabular-nums flex-shrink-0"
                style={{
                  width: 26,
                  height: 26,
                  fontSize: 11,
                  background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
                  color: "#ffffff",
                  boxShadow: `0 0 0 4px ${cardBg}`,
                }}
              >
                {index + 1}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == TIMELINE-STYLE-5: ERA COLUMNS — chapter columns under a ticked top rule
  if (layoutId === "timeline-style-5") {
    const eItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center px-6 py-6 ${className}`} key={animationKey} {...containerProps}>
        <div className="relative flex items-stretch" style={{ borderTop: `1px solid ${cardBorder}` }}>
          {eItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative flex-1 flex flex-col pt-7 pb-4 px-4 min-w-0"
              style={{ borderLeft: index > 0 ? `1px solid ${cardBorder}` : undefined, ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              {/* Chapter tick on the top rule — the current era reads solid */}
              <div
                className="absolute left-4 rounded-sm"
                style={{ top: -5, width: 26, height: 9, background: index === 0 ? accent : alpha(accent, "59") }}
              />
              {/* Ghost period numeral */}
              <div
                className="absolute right-2 top-4 font-bold leading-none select-none pointer-events-none"
                style={{ fontSize: 76, color: alpha(titleColor, "0d") }}
              >
                {pad2(index + 1)}
              </div>
              <span className="font-mono text-[11px] font-semibold tracking-[0.2em] mb-2" style={{ color: accent }}>
                {pad2(index + 1)}
              </span>
              {editLabel(item, index, "font-bold text-sm leading-tight mb-2")}
              <div className="w-8 h-[2px] rounded-full mb-2 flex-shrink-0" style={{ background: accent }} />
              {editText(item, index, "text-xs leading-snug break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == TIMELINE-STYLE-6: ARC JOURNEY — milestones climbing an ascending curve
  if (layoutId === "timeline-style-6") {
    const aItems = items.slice(0, 5);
    const n = aItems.length;
    const P0 = { x: 7, y: 80 };
    const P1 = { x: 46, y: 76 };
    const P2 = { x: 93, y: 18 };
    const pointAt = (t: number) => ({
      x: (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x,
      y: (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y,
    });
    // Canvas-px path so stroke widths scale with the slide (screen-px strokes
    // bloat in scaled thumbnails and panel previews).
    const d = `M ${P0.x * 12.8} ${P0.y * 7.2} Q ${P1.x * 12.8} ${P1.y * 7.2} ${P2.x * 12.8} ${P2.y * 7.2}`;
    return (
      <Container className={`w-full h-full relative px-6 py-6 ${className}`} key={animationKey} {...containerProps}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 720" preserveAspectRatio="none" aria-hidden>
          <path d={d} fill="none" stroke={alpha(accent, "21")} strokeWidth={16} strokeLinecap="round" />
          <path d={d} fill="none" stroke={accent} strokeWidth={3} strokeLinecap="round" />
        </svg>
        {/* Summit marker */}
        <div className="absolute" style={{ left: `${P2.x}%`, top: `${P2.y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="rotate-45" style={{ width: 10, height: 10, background: accent, boxShadow: `0 0 14px ${alpha(accent, "66")}` }} />
        </div>
        {aItems.map((item, index) => {
          const t = n === 1 ? 0.5 : index / (n - 1);
          const p = pointAt(t);
          const cardBelow = p.y < 46; // high on the curve → card hangs below
          const anchorX = index === 0 ? "-14%" : index === n - 1 ? "-86%" : "-50%";
          return (
            <div key={index} className="absolute z-10" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}>
              <ItemWrapper style={getSpotlightStyle(index)} {...itemMotion(index)}>
                {numberDot(index, "2rem")}
                <div
                  className="absolute w-44"
                  style={
                    cardBelow
                      ? { top: "2.7rem", left: "50%", transform: `translateX(${anchorX})` }
                      : { bottom: "2.7rem", left: "50%", transform: `translateX(${anchorX})` }
                  }
                >
                  <div className="ppt-tile rounded-xl px-3 py-2" style={tileStyle(cardBg, cardBorder, accent)}>
                    {editLabel(item, index, "font-bold text-[13px] leading-tight mb-0.5")}
                    {editText(item, index, "text-[11px] leading-snug break-words")}
                  </div>
                </div>
              </ItemWrapper>
            </div>
          );
        })}
      </Container>
    );
  }

  // == TIMELINE-STYLE-7: SERPENTINE PATH — S-shaped path over two rows
  if (layoutId === "timeline-style-7") {
    const sItems = items.slice(0, 6);
    const n = sItems.length;
    const topCount = Math.ceil(n / 2);
    const Y1 = 32;
    const Y2 = 72;
    const XL = 8;
    const XR = 78;
    const TURN = 93;
    // Path coordinates in canvas px (1280x720) so stroke widths scale with the
    // slide instead of staying screen-px (which bloats thumbnails/previews).
    const d = `M ${XL * 12.8} ${Y1 * 7.2} H ${XR * 12.8} Q ${TURN * 12.8} ${Y1 * 7.2} ${TURN * 12.8} ${((Y1 + Y2) / 2) * 7.2} Q ${TURN * 12.8} ${Y2 * 7.2} ${XR * 12.8} ${Y2 * 7.2} H ${XL * 12.8}`;
    // Center nodes within each row segment so small counts don't pin to the corners
    const xFor = (idx: number, count: number) =>
      XL + ((idx + 0.5) * (XR - XL)) / count;
    const nodes = sItems.map((item, i) => {
      const onTop = i < topCount;
      const rowCount = onTop ? topCount : n - topCount;
      const rowIdx = onTop ? i : i - topCount;
      // Bottom row runs right → left so the numbering follows the path
      const x = onTop ? xFor(rowIdx, rowCount) : xFor(rowCount - 1 - rowIdx, rowCount);
      return { item, i, x, y: onTop ? Y1 : Y2, onTop };
    });
    return (
      <Container className={`w-full h-full relative px-6 py-4 ${className}`} key={animationKey} {...containerProps}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 720" preserveAspectRatio="none" aria-hidden>
          <path d={d} fill="none" stroke={alpha(accent, "1f")} strokeWidth={14} strokeLinecap="round" />
          <path d={d} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" />
        </svg>
        {nodes.map(({ item, i, x, y, onTop }) => (
          <div key={i} className="absolute z-10" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
            <ItemWrapper style={getSpotlightStyle(i)} {...itemMotion(i)}>
              {numberDot(i, "1.9rem")}
              <div
                className="absolute w-44"
                style={
                  onTop
                    ? { bottom: "2.4rem", left: "50%", transform: "translateX(-50%)" }
                    : { top: "2.4rem", left: "50%", transform: "translateX(-50%)" }
                }
              >
                <div className="ppt-tile rounded-xl px-3 py-2" style={tileStyle(cardBg, cardBorder, accent)}>
                  {editLabel(item, i, "font-bold text-[13px] leading-tight mb-0.5")}
                  {editText(item, i, "text-[11px] leading-snug break-words")}
                </div>
              </div>
            </ItemWrapper>
          </div>
        ))}
      </Container>
    );
  }

  // == TIMELINE-STYLE-8: PHASE BARS — Gantt-style waterfall over a faint grid
  if (layoutId === "timeline-style-8") {
    const gItems = items.slice(0, 5);
    const n = gItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center px-8 py-6 ${className}`} key={animationKey} {...containerProps}>
        <div className="relative flex flex-col gap-4">
          {/* Faint period gridlines */}
          {[1, 2, 3, 4].map((g) => (
            <div key={g} className="absolute top-0 bottom-0 w-px pointer-events-none" style={{ left: `${g * 20}%`, background: alpha(titleColor, "0f") }} />
          ))}
          {gItems.map((item, index) => {
            const startPct = n <= 1 ? 0 : (index * 46) / (n - 1);
            const widthPct = Math.min(100 - startPct, 44);
            return (
              <ItemWrapper key={index} className="relative min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
                <div
                  className="flex items-center gap-2.5 h-9 rounded-lg px-2.5"
                  style={{
                    marginLeft: `${startPct}%`,
                    width: `${widthPct}%`,
                    minWidth: "34%",
                    background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "8c")})`,
                    boxShadow: `0 3px 12px ${alpha(accent, "33")}`,
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-md font-bold tabular-nums flex-shrink-0"
                    style={{ width: 22, height: 22, fontSize: 11, background: "rgba(255,255,255,0.22)", color: "#ffffff" }}
                  >
                    {index + 1}
                  </span>
                  {editLabel(item, index, "font-bold text-[13px] leading-tight truncate", { color: "#ffffff" })}
                </div>
                <div className="mt-1" style={{ marginLeft: `${startPct}%`, maxWidth: "56%" }}>
                  {editText(item, index, "text-[11px] leading-snug break-words")}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  // == TIMELINE-STYLE-9: PROGRESS TRACK — filled bar, checkpoints, percent markers
  if (layoutId === "timeline-style-9") {
    const pItems = items.slice(0, 5);
    const n = pItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center px-6 py-6 ${className}`} key={animationKey} {...containerProps}>
        <div className="flex justify-between gap-3 mb-2">
          {pItems.map((_, index) => (
            <div
              key={index}
              className="flex-1 text-center font-mono text-[11px] font-semibold tracking-wide"
              style={{ color: index === n - 1 ? accent : bodyColor }}
            >
              {Math.round(n <= 1 ? 100 : (index / (n - 1)) * 100)}%
            </div>
          ))}
        </div>
        <div className="relative mb-5" style={{ height: 30 }}>
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
            style={{ height: 12, background: cardBg, border: `1px solid ${cardBorder}` }}
          />
          {/* Fill strengthens toward the goal */}
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full"
            style={{ height: 12, background: `linear-gradient(90deg, ${alpha(accent, "40")}, ${accent})`, boxShadow: `0 2px 10px ${alpha(accent, "33")}` }}
          />
          {pItems.map((_, index) => (
            <div
              key={index}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 flex items-center justify-center rounded-full font-bold tabular-nums"
              style={{
                left: `${((index + 0.5) / n) * 100}%`,
                width: 26,
                height: 26,
                fontSize: 11,
                background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
                color: "#ffffff",
                boxShadow: `0 0 0 4px ${cardBg}`,
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-3">
          {pItems.map((item, index) => (
            <ItemWrapper key={index} className="flex-1 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="ppt-tile h-full rounded-xl px-3.5 py-2.5" style={tileStyle(cardBg, cardBorder, accent)}>
                {editLabel(item, index, "font-bold text-sm leading-tight mb-1")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == TIMELINE-STYLE-10: DOTTED TRAIL — dotted connector, period chips, arrowhead
  if (layoutId === "timeline-style-10") {
    const tItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center px-6 py-6 ${className}`} key={animationKey} {...containerProps}>
        <div className="relative flex items-start justify-between gap-3">
          <div className="absolute left-0 right-5" style={{ top: 14, borderTop: `3px dotted ${alpha(accent, "59")}` }} />
          <div
            className="absolute right-0"
            style={{
              top: 7,
              width: 0,
              height: 0,
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: `12px solid ${accent}`,
            }}
          />
          {tItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative flex-1 flex flex-col items-center min-w-0"
              style={getSpotlightStyle(index)}
              {...itemMotion(index)}
            >
              <div
                className="z-10 font-mono text-[11px] font-bold tracking-[0.15em] px-2.5 py-1 rounded-md"
                style={{ background: cardBg, border: `1.5px solid ${accent}`, color: accent, boxShadow: `0 0 0 4px ${alpha(accent, "14")}` }}
              >
                {pad2(index + 1)}
              </div>
              <div className="w-[2px] h-3 flex-shrink-0" style={{ backgroundColor: accent, opacity: 0.5 }} />
              <div className="ppt-tile w-full rounded-xl px-3.5 py-2.5" style={tileStyle(cardBg, cardBorder, accent)}>
                {editLabel(item, index, "font-bold text-sm leading-tight mb-1")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={`w-full h-full flex flex-col justify-center px-6 py-6 ${className}`}
      key={animationKey} {...containerProps}
    >
      <div className="relative flex items-stretch justify-between gap-3">
        {/* Horizontal connector line at vertical middle (accent gradient) */}
        <div
          className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${alpha(accent, "33")}, ${accent}, ${alpha(accent, "33")})`,
          }}
        />

        {displayItems.map((item, index) => {
          const isAbove = index % 2 === 0; // odd milestone (1st) above, even below
          const ItemWrapper = isPresenting ? motion.div : "div";

          // The card rendered for this milestone
          const card = (
            <div
              className="ppt-tile w-full rounded-xl px-3.5 py-2.5"
              style={tileStyle(cardBg, cardBorder, accent)}
            >
              {/* Label / phase title */}
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
                    className="font-bold text-sm leading-tight mb-1"
                    style={{ color: titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="font-bold text-sm leading-tight mb-1"
                    style={{ color: titleColor }}
                  >
                    {item.label}
                  </h3>
                ))}

              {/* Text / description */}
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
                  className="text-xs leading-snug break-words"
                  style={{ color: bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p
                  className="text-xs leading-snug break-words"
                  style={{ color: bodyColor }}
                >
                  {item.text}
                </p>
              )}
            </div>
          );

          // A short vertical tick connecting the dot to the card
          const tick = (
            <div
              className="w-[2px] h-3 flex-shrink-0"
              style={{ backgroundColor: accent, opacity: 0.5 }}
            />
          );

          // Milestone dot with its number (gradient fill + accent glow ring)
          const dot = (
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0 font-bold text-xs tabular-nums z-10"
              style={{
                width: "2.1rem",
                height: "2.1rem",
                background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
                color: "#ffffff",
                boxShadow: `0 0 0 4px ${cardBg}, 0 3px 10px ${alpha(accent, "4d")}`,
                letterSpacing: "-0.02em",
              }}
            >
              {index + 1}
            </div>
          );

          return (
            <ItemWrapper
              key={index}
              className="relative flex-1 flex flex-col items-center justify-center"
              style={getSpotlightStyle(index)}
              {...itemMotion(index)}
            >
              {isAbove ? (
                <>
                  <div className="flex w-full flex-col items-center justify-end pb-1">
                    {card}
                    {tick}
                  </div>
                  {dot}
                  {/* Spacer below to balance the row height */}
                  <div className="flex w-full flex-col items-center pt-1 invisible">
                    {tick}
                    {card}
                  </div>
                </>
              ) : (
                <>
                  {/* Spacer above to balance the row height */}
                  <div className="flex w-full flex-col items-center justify-end pb-1 invisible">
                    {card}
                    {tick}
                  </div>
                  {dot}
                  <div className="flex w-full flex-col items-center pt-1">
                    {tick}
                    {card}
                  </div>
                </>
              )}
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
