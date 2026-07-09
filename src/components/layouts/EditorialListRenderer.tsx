"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import type { EditorialLayoutType } from "~/lib/layouts/content/editorial";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (subtle staggered entrance, gated on isPresenting)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface EditorialListRendererProps {
  layoutId?: EditorialLayoutType;
  items: BoxContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
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

export function EditorialListRenderer({
  layoutId = "editorial-numbers",
  items,
  theme,
  accentColor,
  className = "",
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
}: EditorialListRendererProps) {
  // Defensive color fallbacks
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const surface =
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

  // Editable-or-static label/text helpers so all four anatomies share the
  // same editing wiring.
  const renderLabel = (
    item: BoxContentItem,
    index: number,
    labelClass: string,
    labelStyle: React.CSSProperties,
  ) => {
    if (!item.label) return null;
    return onStartEditLabel ? (
      <EditableText
        value={item.label}
        isEditing={isEditing && editingText?.field === `content-label-${index}`}
        onStartEdit={() => onStartEditLabel(index)}
        onChange={(val) => onUpdateLabel?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={labelClass}
        style={labelStyle}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <h3 className={labelClass} style={labelStyle}>
        {item.label}
      </h3>
    );
  };

  const renderText = (
    item: BoxContentItem,
    index: number,
    textClass: string,
    textStyle: React.CSSProperties,
  ) => {
    return onStartEditText ? (
      <EditableText
        value={item.text}
        isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)}
        onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={textClass}
        style={textStyle}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <p className={textClass} style={textStyle}>
        {item.text}
      </p>
    );
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

  /* --------------------- editorial-numbers (ghost numerals) ---------------- */
  if (layoutId === "editorial-numbers") {
    const displayItems = items.slice(0, 5);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex flex-col">
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="flex items-start gap-5 py-3.5"
              style={{
                borderBottom:
                  index === displayItems.length - 1 ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span
                className="w-16 shrink-0 text-right text-4xl font-extrabold leading-none tabular-nums tracking-tight"
                style={{ color: alpha(accent, "59") }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                {renderLabel(item, index, "text-base font-bold uppercase tracking-[0.06em]", {
                  color: titleColor,
                })}
                {renderText(item, index, "mt-1 text-sm leading-relaxed break-words", {
                  color: bodyColor,
                })}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* -------------------- editorial-edge-cards (badge on edge) --------------- */
  if (layoutId === "editorial-edge-cards") {
    const displayItems = items.slice(0, 5);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex flex-col gap-3.5 pl-5">
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative rounded-xl py-3 pl-8 pr-5"
              style={{
                backgroundColor: surface,
                border: `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span
                className="absolute -left-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-sm font-extrabold tabular-nums text-white"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
                  boxShadow: `0 0 0 4px ${alpha(accent, "1a")}, 0 3px 10px ${alpha(accent, "4d")}`,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {renderLabel(item, index, "text-base font-bold tracking-tight", {
                color: titleColor,
              })}
              {renderText(item, index, "mt-0.5 text-sm leading-relaxed break-words", {
                color: bodyColor,
              })}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------- editorial-split-cards (header band) ----------------- */
  if (layoutId === "editorial-split-cards") {
    const displayItems = items.slice(0, 6);
    const cols = displayItems.length <= 2 ? displayItems.length : displayItems.length === 4 ? 2 : Math.min(3, Math.ceil(displayItems.length / 2));
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {displayItems.map((item, index) => {
            const hot = index === 0;
            return (
              <ItemWrapper
                key={index}
                className="overflow-hidden rounded-xl"
                style={{ border: `1px solid ${border}`, ...getSpotlightStyle(index) }}
                {...itemMotion(index)}
              >
                <div
                  className="flex items-center gap-2.5 px-4 py-2.5"
                  style={{
                    background: hot
                      ? `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`
                      : alpha(accent, "1a"),
                  }}
                >
                  <span
                    className="text-sm font-extrabold tabular-nums"
                    style={{
                      color: hot ? "#ffffff" : accent,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {renderLabel(
                    item,
                    index,
                    "min-w-0 flex-1 text-sm font-bold tracking-tight",
                    { color: hot ? "#ffffff" : titleColor },
                  )}
                </div>
                <div className="px-4 py-3" style={{ backgroundColor: surface }}>
                  {renderText(item, index, "text-sm leading-relaxed break-words", {
                    color: bodyColor,
                  })}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  /* -------------------- editorial-rule-grid (number + rule cols) ----------- */
  if (layoutId === "editorial-rule-grid") {
    const displayItems = items.slice(0, 6);
    const cols = Math.min(3, Math.max(2, Math.ceil(displayItems.length / 2)));
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid gap-x-10 gap-y-7"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div
                className="text-sm font-semibold tabular-nums"
                style={{ color: bodyColor }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <div
                className="mb-3 mt-1.5 h-[2px] w-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "26")})` }}
              />
              {renderLabel(item, index, "text-base font-bold tracking-tight", {
                color: titleColor,
              })}
              {renderText(item, index, "mt-1.5 text-sm leading-relaxed break-words", {
                color: bodyColor,
              })}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ----------------------- editorial-ledger (hairline rows) ---------------- */
  if (layoutId === "editorial-ledger") {
    const displayItems = items.slice(0, 6);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex flex-col gap-5">
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-extrabold tabular-nums"
                  style={{ color: accent }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {renderLabel(item, index, "shrink-0 text-base font-bold tracking-tight", {
                  color: titleColor,
                })}
                <span className="h-px min-w-6 flex-1" style={{ backgroundColor: border }} />
              </div>
              {renderText(item, index, "mt-1 pl-8 text-sm leading-relaxed break-words", {
                color: bodyColor,
              })}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------------ editorial-chips (tinted chips) ----------------- */
  if (layoutId === "editorial-chips") {
    const displayItems = items.slice(0, 6);
    const cols = displayItems.length <= 3 ? displayItems.length : Math.ceil(displayItems.length / 2);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid gap-3.5"
          style={{ gridTemplateColumns: `repeat(${Math.min(3, cols)}, minmax(0, 1fr))` }}
        >
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="rounded-xl px-4 py-3.5"
              style={{
                backgroundColor: alpha(accent, "14"),
                border: `1px solid ${alpha(accent, "2b")}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              {renderLabel(item, index, "text-sm font-bold tracking-tight", {
                color: titleColor,
              })}
              {renderText(item, index, "mt-1 text-xs leading-relaxed break-words", {
                color: bodyColor,
              })}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------- editorial-dropcap (drop-cap columns) ---------------- */
  if (layoutId === "editorial-dropcap") {
    const displayItems = items.slice(0, 4);
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid w-full gap-7"
          style={{ gridTemplateColumns: `repeat(${displayItems.length}, minmax(0, 1fr))` }}
        >
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="min-w-0"
              style={{
                borderLeft: index > 0 ? `1px solid ${border}` : "none",
                paddingLeft: index > 0 ? 26 : 0,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              {renderLabel(item, index, "text-sm font-bold uppercase tracking-[0.08em] mb-2.5", {
                color: titleColor,
              })}
              <div className="min-w-0">
                <span
                  className="float-left mr-2.5 mt-1 font-extrabold leading-[0.78] select-none"
                  style={{ fontSize: 52, color: accent, fontFamily: theme?.fonts.heading.family }}
                >
                  {index + 1}
                </span>
                {renderText(item, index, "text-xs leading-relaxed break-words", {
                  color: bodyColor,
                })}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* --------------------- editorial-margin (margin notes) ------------------- */
  if (layoutId === "editorial-margin") {
    const displayItems = items.slice(0, 6);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="relative flex flex-col gap-1">
          {/* Continuous reading spine */}
          <div className="absolute top-1 bottom-1 w-px" style={{ left: "9.5rem", background: border }} />
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative grid items-start gap-6 py-2.5"
              style={{ gridTemplateColumns: "9.5rem 1fr", ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              {/* Margin cell: mono index + small-caps label, right-aligned */}
              <div className="min-w-0 pr-5 text-right">
                <span className="mb-0.5 block font-mono text-[11px] font-semibold" style={{ color: accent }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {renderLabel(item, index, "text-xs font-bold uppercase tracking-[0.1em] leading-snug", {
                  color: titleColor,
                })}
              </div>
              {/* Accent tick where this entry meets the spine */}
              <div
                className="absolute top-4 h-[2px] w-3.5 rounded-full"
                style={{ left: "calc(9.5rem - 6px)", background: accent }}
              />
              {renderText(item, index, "min-w-0 pt-0.5 text-sm leading-relaxed break-words", {
                color: bodyColor,
              })}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ----------------------- editorial-lede (lede & deck) -------------------- */
  if (layoutId === "editorial-lede") {
    const displayItems = items.slice(0, 5);
    const lede = displayItems[0];
    const rest = displayItems.slice(1);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center gap-6 ${className}`}
        key={animationKey} {...containerProps}
      >
        {lede && (
          <ItemWrapper key={0} className="flex items-start gap-5" style={getSpotlightStyle(0)} {...itemMotion(0)}>
            <div
              className="w-[5px] shrink-0 self-stretch rounded-full"
              style={{ background: `linear-gradient(180deg, ${accent}, ${alpha(accent, "40")})` }}
            />
            <div className="min-w-0">
              {renderLabel(lede, 0, "mb-1.5 text-xl font-extrabold tracking-tight", { color: titleColor })}
              {renderText(lede, 0, "max-w-3xl text-sm leading-relaxed break-words", { color: bodyColor })}
            </div>
          </ItemWrapper>
        )}
        {rest.length > 0 && (
          <div
            className="grid gap-6 pt-5"
            style={{
              gridTemplateColumns: `repeat(${rest.length}, minmax(0, 1fr))`,
              borderTop: `1px solid ${border}`,
            }}
          >
            {rest.map((item, i) => {
              const index = i + 1;
              return (
                <ItemWrapper key={index} className="min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
                  <span className="font-mono text-[11px] font-semibold" style={{ color: accent }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {renderLabel(item, index, "mt-1 mb-1 text-sm font-bold", { color: titleColor })}
                  {renderText(item, index, "text-xs leading-snug break-words", { color: bodyColor })}
                </ItemWrapper>
              );
            })}
          </div>
        )}
      </Container>
    );
  }

  /* --------------------- editorial-verso (center spine) -------------------- */
  if (layoutId === "editorial-verso") {
    const displayItems = items.slice(0, 5);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="relative flex flex-col gap-4">
          <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2" style={{ background: border }} />
          {displayItems.map((item, index) => {
            const onLeft = index % 2 === 0;
            const entry = (
              <>
                <span className="font-mono text-[11px] font-semibold" style={{ color: accent }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {renderLabel(item, index, "mt-0.5 mb-1 text-base font-bold tracking-tight", { color: titleColor })}
                {renderText(item, index, "text-xs leading-snug break-words", { color: bodyColor })}
              </>
            );
            return (
              <ItemWrapper
                key={index}
                className="relative grid items-center gap-12"
                style={{ gridTemplateColumns: "1fr 1fr", ...getSpotlightStyle(index) }}
                {...itemMotion(index)}
              >
                <div className={`min-w-0 ${onLeft ? "pr-2 text-right" : ""}`}>{onLeft ? entry : null}</div>
                <div className="min-w-0 pl-2">{onLeft ? null : entry}</div>
                {/* Spine diamond */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
                  style={{ width: 9, height: 9, background: accent, boxShadow: `0 0 0 4px ${surface}` }}
                />
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  /* --------------------- editorial-roman (roman chapters) ------------------ */
  if (layoutId === "editorial-roman") {
    const displayItems = items.slice(0, 5);
    const romans = ["I", "II", "III", "IV", "V"];
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${displayItems.length}, minmax(0, 1fr))` }}
        >
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="flex min-w-0 flex-col items-center px-5 text-center"
              style={{
                borderLeft: index > 0 ? `1px solid ${border}` : "none",
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span
                className="mb-3 leading-none"
                style={{
                  fontSize: 34,
                  color: accent,
                  fontFamily: theme?.fonts.heading.family,
                  fontStyle: "italic",
                  fontWeight: 700,
                }}
              >
                {romans[index] ?? index + 1}
              </span>
              <div className="mb-3 h-px w-7" style={{ background: alpha(accent, "66") }} />
              {renderLabel(item, index, "mb-2 text-sm font-bold uppercase tracking-[0.12em]", {
                color: titleColor,
              })}
              {renderText(item, index, "text-xs leading-relaxed break-words", { color: bodyColor })}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ---------------------- editorial-cascade (widening bars) ---------------- */
  const displayItems = items.slice(0, 5);
  const n = Math.max(displayItems.length, 1);
  const minWidth = 62;
  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div className="flex flex-col gap-3">
        {displayItems.map((item, index) => {
          const w = n === 1 ? 100 : minWidth + ((100 - minWidth) / (n - 1)) * index;
          return (
            <ItemWrapper
              key={index}
              className="flex items-center gap-4 rounded-xl px-4 py-2.5"
              style={{
                width: `${w}%`,
                background: `linear-gradient(90deg, ${alpha(accent, "24")}, ${alpha(accent, "0a")})`,
                border: `1px solid ${alpha(accent, "30")}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold tabular-nums text-white"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
                  boxShadow: `0 3px 8px ${alpha(accent, "40")}`,
                }}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {renderLabel(item, index, "text-sm font-bold tracking-tight", {
                  color: titleColor,
                })}
                {renderText(item, index, "text-xs leading-snug break-words", {
                  color: bodyColor,
                })}
              </div>
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
