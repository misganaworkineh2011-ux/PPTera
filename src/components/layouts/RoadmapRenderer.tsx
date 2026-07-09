"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { tileStyle, SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (subtle, gated on isPresenting)
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
    x: -24,
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

interface RoadmapRendererProps {
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

export function RoadmapRenderer({
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
}: RoadmapRendererProps) {
  const displayItems = items.slice(0, 6); // Cap at 6 milestones

  // Defensive color resolution
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg =
    theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const border = theme?.colors.border || "rgba(0,0,0,0.08)";

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

  // Shared editable label/text for the added styles (2-5); style 1 keeps its
  // original inline blocks below.
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

  const numChip = (index: number, size = 30) => (
    <div
      className="z-10 flex items-center justify-center rounded-full font-bold tabular-nums flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size < 28 ? 11 : 12,
        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
        color: "#ffffff",
        boxShadow: `0 0 0 4px ${cardBg}, 0 3px 10px ${accent}4d`,
      }}
    >
      {index + 1}
    </div>
  );

  // == ROADMAP-STYLE-2: SUMMIT ROUTE — dashed route climbing a ridge to a flag
  if (layoutId === "roadmap-style-2") {
    const sItems = items.slice(0, 5);
    const n = sItems.length;
    // Camp coordinates in the route area's own SVG space (1280 x 520)
    const camps = sItems.map((_, i) => ({
      x: ((i + 0.5) / n) * 1280,
      y: n <= 1 ? 300 : 470 - i * (360 / (n - 1)) + (i % 2) * 26,
    }));
    const last = camps[n - 1]!;
    const peak = { x: Math.min(last.x + 110, 1240), y: Math.max(last.y - 70, 40) };
    const ridge = [
      `0,520`,
      `0,${Math.min(camps[0]!.y + 40, 510)}`,
      ...camps.map((c) => `${c.x},${c.y + 34}`),
      `${peak.x},${peak.y + 26}`,
      `1280,${Math.min(peak.y + 130, 500)}`,
      `1280,520`,
    ].join(" ");
    return (
      <Container className={`w-full h-full flex flex-col px-6 pt-4 pb-6 ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="relative flex-1 min-h-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 520" preserveAspectRatio="none" aria-hidden>
            <polygon points={ridge} fill={`${accent}12`} stroke={`${accent}33`} strokeWidth={2} />
            <polyline
              points={camps.map((c) => `${c.x},${c.y}`).join(" ")}
              fill="none"
              stroke={accent}
              strokeWidth={3}
              strokeDasharray="12 10"
              strokeLinecap="round"
            />
            {/* Summit flag */}
            <line x1={peak.x} y1={peak.y} x2={peak.x} y2={peak.y - 54} stroke={accent} strokeWidth={3.5} strokeLinecap="round" />
            <polygon points={`${peak.x},${peak.y - 54} ${peak.x + 44},${peak.y - 42} ${peak.x},${peak.y - 30}`} fill={accent} />
          </svg>
          {camps.map((c, index) => (
            <React.Fragment key={index}>
              <div
                className="absolute"
                style={{ left: `${(c.x / 1280) * 100}%`, top: `${(c.y / 520) * 100}%`, transform: "translate(-50%, -50%)" }}
              >
                {numChip(index, 28)}
              </div>
              {/* Dotted drop line from camp to its card below */}
              <div
                className="absolute"
                style={{
                  left: `${(c.x / 1280) * 100}%`,
                  top: `calc(${(c.y / 520) * 100}% + 16px)`,
                  bottom: 0,
                  borderLeft: `2px dotted ${accent}40`,
                }}
              />
            </React.Fragment>
          ))}
        </div>
        <div className="flex gap-2.5 mt-2">
          {sItems.map((item, index) => (
            <ItemWrapper key={index} className="flex-1 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="ppt-tile h-full rounded-xl px-3.5 py-2.5" style={tileStyle(cardBg, border, accent)}>
                {editLabel(item, index, "font-bold text-sm leading-tight mb-1")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-3: RUNWAY — perspective runway, milestones along the centerline
  if (layoutId === "roadmap-style-3") {
    const rItems = items.slice(0, 6);
    const dashes = [
      { top: "8%", w: 10, h: 12 },
      { top: "26%", w: 13, h: 15 },
      { top: "44%", w: 17, h: 18 },
      { top: "62%", w: 22, h: 22 },
      { top: "80%", w: 28, h: 26 },
    ];
    return (
      <Container className={`w-full h-full relative px-8 py-5 ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        {/* Runway receding to the horizon */}
        <div
          className="absolute inset-y-0 left-0 right-0 pointer-events-none"
          style={{
            clipPath: "polygon(43% 0, 57% 0, 76% 100%, 24% 100%)",
            background: `linear-gradient(180deg, ${accent}0a, ${accent}24)`,
            borderTop: `2px solid ${accent}33`,
          }}
        />
        {dashes.map((d2, i) => (
          <div
            key={i}
            className="absolute left-1/2 -translate-x-1/2 rounded-[2px] pointer-events-none"
            style={{ top: d2.top, width: d2.w, height: d2.h, background: `${accent}59` }}
          />
        ))}
        {/* Bottom row = now; rows recede upward */}
        <div className="relative h-full flex flex-col-reverse justify-between py-3">
          {rItems.map((item, index) => {
            const onLeft = index % 2 === 0;
            const card = (
              <div className="ppt-tile inline-block max-w-full rounded-xl px-3.5 py-2 text-left" style={tileStyle(cardBg, border, accent)}>
                {editLabel(item, index, "font-bold text-sm leading-tight mb-0.5")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            );
            return (
              <ItemWrapper
                key={index}
                className="relative grid items-center gap-3"
                style={{ gridTemplateColumns: "1fr 3.5rem 1fr", ...getSpotlightStyle(index) }}
                {...itemMotion(index)}
              >
                <div className="flex justify-end min-w-0">{onLeft ? card : null}</div>
                <div className="flex items-center justify-center">{numChip(index, 28)}</div>
                <div className="flex justify-start min-w-0">{onLeft ? null : card}</div>
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-4: HORIZON BANDS — bands narrow toward the horizon
  if (layoutId === "roadmap-style-4") {
    const hItems = items.slice(0, 5);
    const n = hItems.length;
    const bandAlpha = ["2b", "21", "1a", "12", "0d"];
    return (
      <Container className={`w-full h-full flex flex-col justify-center px-6 py-6 ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        {/* Horizon line */}
        <div className="relative mx-auto mb-4" style={{ width: "46%" }}>
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}66, transparent)` }} />
          <div className="absolute left-1/2 -translate-x-1/2 -top-[3px] w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        </div>
        <div className="flex flex-col-reverse items-center gap-2.5">
          {hItems.map((item, index) => {
            const width = n <= 1 ? 100 : 100 - index * (44 / (n - 1));
            return (
              <ItemWrapper
                key={index}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 min-w-0"
                style={{
                  width: `${width}%`,
                  background: `${accent}${bandAlpha[index] ?? "0d"}`,
                  border: `1px solid ${accent}${index === 0 ? "40" : "21"}`,
                  ...getSpotlightStyle(index),
                }}
                {...itemMotion(index)}
              >
                {numChip(index, 26)}
                <div className="min-w-0 flex-1">
                  {editLabel(item, index, "font-bold text-sm leading-tight")}
                  {editText(item, index, "text-xs leading-snug break-words")}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-5: SIGNPOSTS — sign boards pointing alternately off a post
  if (layoutId === "roadmap-style-5") {
    const pItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full relative px-8 py-6 ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        {/* Central post with cap and ground mound */}
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none" style={{ top: "7%", bottom: "9%", width: 6, background: `linear-gradient(180deg, ${accent}, ${accent}59)` }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none" style={{ top: "4%", width: 14, height: 14, background: accent, boxShadow: `0 0 12px ${accent}66` }} />
        <div className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none" style={{ bottom: "6%", width: 110, height: 10, background: `${accent}26` }} />
        <div className="relative h-full flex flex-col justify-center gap-3 py-6">
          {pItems.map((item, index) => {
            const onRight = index % 2 === 0;
            const notch = 18;
            const board = (
              <div
                className="inline-block max-w-full"
                style={{
                  background: `${accent}1c`,
                  border: `1px solid ${accent}33`,
                  clipPath: onRight
                    ? `polygon(0 0, calc(100% - ${notch}px) 0, 100% 50%, calc(100% - ${notch}px) 100%, 0 100%)`
                    : `polygon(${notch}px 0, 100% 0, 100% 100%, ${notch}px 100%, 0 50%)`,
                  padding: onRight ? `9px ${notch + 12}px 9px 14px` : `9px 14px 9px ${notch + 12}px`,
                }}
              >
                {editLabel(item, index, "font-bold text-sm leading-tight mb-0.5")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            );
            return (
              <ItemWrapper
                key={index}
                className="relative grid items-center gap-2.5"
                style={{ gridTemplateColumns: "1fr 2.6rem 1fr", ...getSpotlightStyle(index) }}
                {...itemMotion(index)}
              >
                <div className="flex justify-end min-w-0 text-right">{onRight ? null : board}</div>
                <div className="flex items-center justify-center">{numChip(index, 26)}</div>
                <div className="flex justify-start min-w-0">{onRight ? board : null}</div>
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-6: WINDING ROAD — curving road ribbon with location pins
  if (layoutId === "roadmap-style-6") {
    const rItems = items.slice(0, 5);
    const n = rItems.length;
    const xFor = (i: number) => 70 + (i * (1140 / Math.max(n - 1, 1)));
    const yFor = (i: number) => (i % 2 === 0 ? 210 : 90);
    let d = `M ${xFor(0) - 60} ${yFor(0)}`;
    for (let i = 0; i < n; i++) {
      const x0 = i === 0 ? xFor(0) - 60 : xFor(i - 1);
      const x1 = xFor(i);
      const dx = (x1 - x0) / 2.2;
      d += ` C ${x0 + dx} ${i === 0 ? yFor(0) : yFor(i - 1)}, ${x1 - dx} ${yFor(i)}, ${x1} ${yFor(i)}`;
    }
    d += ` C ${xFor(n - 1) + 40} ${yFor(n - 1)}, ${xFor(n - 1) + 70} ${yFor(n - 1)}, ${Math.min(xFor(n - 1) + 90, 1250)} ${yFor(n - 1)}`;
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="relative mb-4" style={{ height: 280 }}>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1280 280" preserveAspectRatio="none" aria-hidden>
            {/* Road bed + dashed centerline */}
            <path d={d} fill="none" stroke={`${accent}29`} strokeWidth={40} strokeLinecap="round" />
            <path d={d} fill="none" stroke={accent} strokeWidth={3} strokeDasharray="20 16" strokeLinecap="round" />
          </svg>
          {rItems.map((_, index) => (
            <div
              key={index}
              className="absolute z-10 flex flex-col items-center"
              style={{ left: `${(xFor(index) / 1280) * 100}%`, top: `${(yFor(index) / 280) * 100}%`, transform: "translate(-50%, -100%)" }}
            >
              {numChip(index, 30)}
              {/* Pin tail */}
              <span
                aria-hidden
                style={{ width: 0, height: 0, marginTop: -2, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: `11px solid ${accent}` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-3">
          {rItems.map((item, index) => (
            <ItemWrapper key={index} className="min-w-0 flex-1" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {editLabel(item, index, "text-sm font-bold tracking-tight text-center")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words text-center")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-7: MILESTONE GATES — checkpoint arches over a road
  if (layoutId === "roadmap-style-7") {
    const gItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="relative mb-6" style={{ height: 120 }}>
          {/* The road */}
          <div className="absolute inset-x-0 bottom-0 h-9 rounded-md" style={{ background: `${accent}14`, border: `1px solid ${accent}21` }}>
            <div className="absolute inset-x-3 top-1/2 -translate-y-1/2" style={{ borderTop: `2px dashed ${accent}59` }} />
          </div>
          <div className="flex h-full">
            {gItems.map((_, index) => (
              <div key={index} className="relative flex flex-1 items-end justify-center">
                {/* Checkpoint arch straddling the road */}
                <div
                  className="relative flex h-[104px] w-20 items-start justify-center rounded-t-full pt-2.5"
                  style={{ border: `5px solid ${index === 0 ? accent : `${accent}66`}`, borderBottom: "none" }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold tabular-nums"
                    style={{ background: index === 0 ? accent : `${accent}26`, color: index === 0 ? "#ffffff" : accent }}
                  >
                    {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between gap-3">
          {gItems.map((item, index) => (
            <ItemWrapper key={index} className="min-w-0 flex-1" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {editLabel(item, index, "text-sm font-bold tracking-tight text-center")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words text-center")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-8: COMPASS LEGS — journey legs with turning dials
  if (layoutId === "roadmap-style-8") {
    const cItems = items.slice(0, 6);
    const n = cItems.length;
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="relative flex flex-col gap-3">
          <div className="absolute bottom-4 top-4 w-px" style={{ left: 21, borderLeft: `2px dashed ${accent}40` }} />
          {cItems.map((item, index) => {
            const bearing = n <= 1 ? 0 : -60 + (index * 120) / (n - 1);
            return (
              <ItemWrapper key={index} className="relative flex items-center gap-4 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
                {/* Compass dial with a turning needle */}
                <span
                  className="z-10 relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ background: cardBg, border: `2px solid ${accent}59`, boxShadow: `0 0 0 4px ${cardBg}` }}
                >
                  <span className="absolute inset-1 rounded-full" style={{ border: `1px dotted ${accent}40` }} />
                  <span aria-hidden className="absolute" style={{ transform: `rotate(${bearing}deg)` }}>
                    <span className="block" style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `16px solid ${accent}`, marginBottom: 8 }} />
                  </span>
                  <span className="absolute h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                </span>
                <span className="shrink-0 font-mono text-[10px] font-bold tracking-[0.2em]" style={{ color: accent }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  {editLabel(item, index, "text-sm font-bold tracking-tight")}
                  {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-9: STEPPING STONES — stones crossing a stream band
  if (layoutId === "roadmap-style-9") {
    const sItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div
          className="relative mb-6 flex items-center rounded-3xl px-6"
          style={{ height: 110, background: `${accent}0d`, borderTop: `1px solid ${accent}21`, borderBottom: `1px solid ${accent}21` }}
        >
          {/* Stream ripples */}
          <div className="absolute inset-x-10 top-4" style={{ borderTop: `1.5px dashed ${accent}1f` }} aria-hidden />
          <div className="absolute inset-x-16 bottom-4" style={{ borderTop: `1.5px dashed ${accent}1f` }} aria-hidden />
          <div className="flex w-full justify-between">
            {sItems.map((_, index) => (
              <span
                key={index}
                className="flex items-center justify-center font-extrabold tabular-nums"
                style={{
                  width: 74,
                  height: 52,
                  borderRadius: "50%",
                  transform: `translateY(${index % 2 === 0 ? -8 : 10}px) rotate(${index % 2 === 0 ? -4 : 5}deg)`,
                  background: cardBg,
                  border: `2px solid ${index === sItems.length - 1 ? accent : border}`,
                  boxShadow: `0 6px 14px ${accent}1f`,
                  color: titleColor,
                  fontSize: 15,
                }}
              >
                {index + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between gap-3">
          {sItems.map((item, index) => (
            <ItemWrapper key={index} className="min-w-0 flex-1" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {editLabel(item, index, "text-sm font-bold tracking-tight text-center")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words text-center")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-10: MILE MARKERS — posts rising from a road strip
  if (layoutId === "roadmap-style-10") {
    const mItems = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex flex-col justify-end ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="flex justify-between gap-3">
          {mItems.map((item, index) => (
            <ItemWrapper key={index} className="min-w-0 flex-1 flex flex-col" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="flex-1">
                {editLabel(item, index, "text-sm font-bold tracking-tight text-center")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words text-center")}
              </div>
              {/* Marker sign + post */}
              <div className="mt-3 flex flex-col items-center">
                <span
                  className="flex h-8 w-11 items-center justify-center rounded-md text-xs font-extrabold tabular-nums text-white"
                  style={{ background: `linear-gradient(160deg, ${accent}, ${accent}cc)`, boxShadow: `0 3px 8px ${accent}40` }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-8 w-1 rounded-b-sm" style={{ background: `${accent}59` }} />
              </div>
            </ItemWrapper>
          ))}
        </div>
        <div className="relative mt-0 h-10 rounded-lg" style={{ background: `${accent}14`, border: `1px solid ${accent}21` }}>
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2" style={{ borderTop: `2px dashed ${accent}59` }} />
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-11: DESTINATION BOARD — departure rows with status dots
  if (layoutId === "roadmap-style-11") {
    const dItems = items.slice(0, 6);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${border}` }}>
          {dItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="grid items-center gap-4 px-4 py-3 min-w-0"
              style={{
                gridTemplateColumns: "2.6rem 1.1fr 2fr auto",
                background: index % 2 === 0 ? cardBg : "transparent",
                borderBottom: index === dItems.length - 1 ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span className="font-mono text-sm font-bold tabular-nums" style={{ color: accent }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              {editLabel(item, index, "font-mono text-sm font-bold uppercase tracking-[0.08em] truncate")}
              {editText(item, index, "text-xs leading-snug break-words")}
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}8c` }} aria-hidden />
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  // == ROADMAP-STYLE-12: JOURNEY TICKET — one perforated strip, text below
  if (layoutId === "roadmap-style-12") {
    const tItems = items.slice(0, 5);
    const notchBg = theme?.colors.background || "#ffffff";
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="flex overflow-hidden rounded-2xl" style={{ border: `1px solid ${border}` }} aria-hidden={false}>
          {tItems.map((item, index) => (
            <div
              key={index}
              className="relative min-w-0 flex-1 px-4 py-3.5"
              style={{
                background: index % 2 === 0 ? cardBg : `${accent}0a`,
                borderLeft: index === 0 ? "none" : `2px dashed ${accent}40`,
              }}
            >
              {/* Perforation notches */}
              {index > 0 && (
                <>
                  <span className="absolute -top-2 h-4 w-4 rounded-full" style={{ left: -9, background: notchBg, border: `1px solid ${border}` }} aria-hidden />
                  <span className="absolute -bottom-2 h-4 w-4 rounded-full" style={{ left: -9, background: notchBg, border: `1px solid ${border}` }} aria-hidden />
                </>
              )}
              <span className="font-mono text-[10px] font-bold tracking-[0.25em]" style={{ color: accent }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              {editLabel(item, index, "mt-0.5 text-sm font-bold tracking-tight truncate")}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          {tItems.map((item, index) => (
            <ItemWrapper key={index} className="min-w-0 flex-1 px-1" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {editText(item, index, "text-xs leading-snug break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
      data-layout-id={layoutId}
      key={animationKey} {...containerProps}
    >
      <div className="relative flex flex-col gap-4">
        {/* Continuous accent spine behind the dots */}
        {displayItems.length > 1 && (
          <div
            aria-hidden
            className="absolute top-0 bottom-0 w-[2px] rounded-full"
            style={{
              left: "1.125rem", // center of the 2.25rem (w-9) dot column
              background: `linear-gradient(to bottom, ${accent}, ${accent}55)`,
              opacity: 0.6,
            }}
          />
        )}

        {displayItems.map((item, index) => {
          return (
            <ItemWrapper
              key={index}
              className="relative flex items-start gap-4"
              style={getSpotlightStyle(index)}
              {...itemMotion(index)}
            >
              {/* Numbered accent dot sitting ON the spine */}
              <div
                className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                style={{ backgroundColor: accent }}
              >
                {index + 1}
              </div>

              {/* Content block inside a subtle card */}
              <div
                className="ppt-tile flex-1 rounded-xl px-4 py-3"
                style={tileStyle(cardBg, border, accent)}
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
                      onDelete={
                        onDeleteItem ? () => onDeleteItem(index) : undefined
                      }
                      className="mb-1 text-base font-bold leading-snug"
                      style={{ color: titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="mb-1 text-base font-bold leading-snug"
                      style={{ color: titleColor }}
                    >
                      {item.label}
                    </h3>
                  ))}

                {/* Description / milestone text — wraps fully */}
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
                    className="text-sm leading-relaxed"
                    style={{ color: bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: bodyColor }}
                  >
                    {item.text}
                  </p>
                )}
              </div>
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
