"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { tileStyle, SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

interface ChecklistRendererProps {
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

export function ChecklistRenderer({
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
}: ChecklistRendererProps) {
  // Defensive color resolution
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor ||
    theme?.colors.accent ||
    theme?.colors.primary ||
    "#6366f1";
  const cardBg =
    theme?.cardBox?.background ||
    theme?.colors.surface ||
    "rgba(255,255,255,0.05)";
  const border = theme?.colors.border || "rgba(0,0,0,0.08)";

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: "all 0.4s ease-out",
    };
  };

  // Editable-or-static label/text shared by every anatomy.
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

  /* --------------- checklist-style-2: SQUARE TICKS (airy grid) ------------- */
  if (layoutId === "checklist-style-2") {
    const displayItems = items.slice(0, 8);
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="grid w-full grid-cols-2 gap-x-8 gap-y-5">
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} className="flex items-start gap-3 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span
                className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md"
                style={{ background: accent, boxShadow: `0 2px 8px ${alpha(accent, "40")}` }}
              >
                <Check size={14} strokeWidth={3.5} color="#ffffff" />
              </span>
              <div className="min-w-0">
                {editLabel(item, index, "text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ----------------- checklist-style-3: PILL CHECKS (rows) ----------------- */
  if (layoutId === "checklist-style-3") {
    const displayItems = items.slice(0, 6);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex flex-col gap-2.5">
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="flex items-center gap-3.5 rounded-full px-4 py-2.5 min-w-0"
              style={{
                background: alpha(accent, "0f"),
                border: `1px solid ${alpha(accent, "26")}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ border: `2px solid ${accent}` }}
              >
                <Check size={13} strokeWidth={3.5} color={accent} />
              </span>
              <div className="min-w-0 shrink">
                {editLabel(item, index, "text-sm font-bold tracking-tight whitespace-nowrap")}
              </div>
              <div className="min-w-0 flex-1">
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* --------------- checklist-style-4: LEDGER CHECKS (end check) ------------ */
  if (layoutId === "checklist-style-4") {
    const displayItems = items.slice(0, 8);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex flex-col">
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="flex items-center gap-4 py-3 min-w-0"
              style={{
                borderBottom: index === displayItems.length - 1 ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <div className="min-w-0 flex-1">
                {editLabel(item, index, "text-base font-bold tracking-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ background: alpha(accent, "14"), border: `1px solid ${alpha(accent, "40")}` }}
              >
                <Check size={15} strokeWidth={3} color={accent} />
              </span>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ----------------- checklist-style-5: RING CHECKS (gauges) --------------- */
  if (layoutId === "checklist-style-5") {
    const displayItems = items.slice(0, 6);
    const cols = displayItems.length <= 4 ? 2 : 3;
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="grid w-full gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} className="flex items-start gap-3.5 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  border: `3px solid ${accent}`,
                  boxShadow: `0 0 0 3px ${alpha(accent, "1a")}, 0 4px 12px ${alpha(accent, "26")}`,
                }}
              >
                <Check size={17} strokeWidth={3.5} color={accent} />
              </span>
              <div className="min-w-0 pt-0.5">
                {editLabel(item, index, "text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ---------------- checklist-style-6: STAMP CARDS (watermark) ------------- */
  if (layoutId === "checklist-style-6") {
    const displayItems = items.slice(0, 6);
    const cols = displayItems.length <= 4 ? 2 : 3;
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="ppt-tile relative overflow-hidden rounded-xl p-4 min-w-0"
              style={{ ...tileStyle(cardBg, border, accent), ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              {/* Ghost check stamp */}
              <span className="pointer-events-none absolute -bottom-4 -right-2 -rotate-12 select-none">
                <Check size={76} strokeWidth={2.5} color={alpha(accent, "17")} />
              </span>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "relative mt-1 text-xs leading-snug break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------ checklist-style-7: CHECK RAIL (spine) ---------------- */
  if (layoutId === "checklist-style-7") {
    const displayItems = items.slice(0, 6);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="relative flex flex-col gap-4">
          <div
            className="absolute bottom-2 top-2 w-[3px] rounded-full"
            style={{ left: 13, background: `linear-gradient(180deg, ${accent}, ${alpha(accent, "26")})` }}
          />
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} className="relative flex items-start gap-4 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span
                className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: accent, boxShadow: `0 0 0 4px ${cardBg}, 0 3px 10px ${alpha(accent, "40")}` }}
              >
                <Check size={14} strokeWidth={3.5} color="#ffffff" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                {editLabel(item, index, "text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* --------------- checklist-style-8: MONO CHECKLIST ([x] list) ------------ */
  if (layoutId === "checklist-style-8") {
    const displayItems = items.slice(0, 8);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex flex-col gap-3.5 pl-2" style={{ borderLeft: `2px solid ${alpha(accent, "33")}` }}>
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} className="flex items-start gap-3 pl-3 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span className="shrink-0 font-mono text-sm font-bold" style={{ color: accent }}>
                [x]
              </span>
              <div className="min-w-0">
                {editLabel(item, index, "font-mono text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* --------------- checklist-style-9: SHIELD CHECKS (verified) ------------- */
  if (layoutId === "checklist-style-9") {
    const displayItems = items.slice(0, 6);
    const cols = displayItems.length <= 4 ? 2 : 3;
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="grid w-full gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} className="flex items-start gap-3.5 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${alpha(accent, "26")}, ${alpha(accent, "0d")})`,
                  border: `1px solid ${alpha(accent, "3d")}`,
                }}
              >
                <ShieldCheck size={22} color={accent} />
              </span>
              <div className="min-w-0 pt-0.5">
                {editLabel(item, index, "text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* --------------- checklist-style-10: SPLIT DOMINO (two cells) ------------ */
  if (layoutId === "checklist-style-10") {
    const displayItems = items.slice(0, 6);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex flex-col gap-2.5">
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="grid items-stretch overflow-hidden rounded-xl min-w-0"
              style={{
                gridTemplateColumns: "2fr 3fr",
                border: `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <div
                className="flex items-center gap-2.5 px-4 py-2.5 min-w-0"
                style={{ background: alpha(accent, "14"), borderRight: `1px solid ${alpha(accent, "26")}` }}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: accent }}
                >
                  <Check size={12} strokeWidth={3.5} color="#ffffff" />
                </span>
                {editLabel(item, index, "text-sm font-bold tracking-tight leading-snug")}
              </div>
              <div className="flex items-center px-4 py-2.5 min-w-0" style={{ background: cardBg }}>
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* --------------- checklist-style-1: CHECK TILES (default) ---------------- */
  const displayItems = items.slice(0, 8); // Cap at 8 items
  const itemCount = displayItems.length;
  const isTwoColumn = itemCount > 5;

  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div
        className={`grid ${isTwoColumn ? "grid-cols-2" : "grid-cols-1"} gap-3`}
      >
        {displayItems.map((item, index) => (
          <ItemWrapper
            key={index}
            className="ppt-tile flex items-start gap-3 rounded-xl px-4 py-3"
            style={{
              ...tileStyle(cardBg, border, accent, { bar: "left" }),
              ...getSpotlightStyle(index),
            }}
            {...itemMotion(index)}
          >
            {/* Check badge */}
            <div
              className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            >
              <Check size={16} strokeWidth={3} color="#ffffff" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {editLabel(item, index, "font-bold text-base leading-snug break-words")}
              {editText(item, index, `text-sm leading-relaxed break-words ${item.label ? "mt-1" : ""}`)}
            </div>
          </ItemWrapper>
        ))}
      </div>
    </Container>
  );
}
