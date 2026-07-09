"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

interface AgendaListRendererProps {
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

export function AgendaListRenderer({
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
}: AgendaListRendererProps) {
  // Defensive color fallbacks
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const surface =
    theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const border = theme?.colors.border || "rgba(0,0,0,0.08)";
  const pad2 = (n: number) => String(n).padStart(2, "0");

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

  /* ---------------- agenda-style-2: DOTTED CONTENTS (classic TOC) ---------- */
  if (layoutId === "agenda-style-2") {
    const displayItems = items.slice(0, 8);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="flex flex-col gap-1">
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} className="py-2 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="flex items-baseline gap-3">
                <div className="min-w-0 shrink">
                  {editLabel(item, index, "text-base font-bold tracking-tight leading-snug")}
                </div>
                {/* Dotted leader running to the page-style number */}
                <div
                  className="flex-1 translate-y-[-3px]"
                  style={{ borderBottom: `2px dotted ${alpha(accent, "40")}` }}
                />
                <span className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color: accent }}>
                  {pad2(index + 1)}
                </span>
              </div>
              {editText(item, index, "mt-0.5 max-w-[85%] text-xs leading-relaxed break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* --------------- agenda-style-3: SESSION CARDS (boarding rows) ----------- */
  if (layoutId === "agenda-style-3") {
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
              className="flex items-stretch overflow-hidden rounded-xl min-w-0"
              style={{ border: `1px solid ${border}`, background: surface, ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              {/* Accent number block */}
              <div
                className="flex w-14 shrink-0 items-center justify-center"
                style={{ background: `linear-gradient(160deg, ${accent}, ${alpha(accent, "cc")})` }}
              >
                <span className="text-lg font-extrabold tabular-nums text-white">{pad2(index + 1)}</span>
              </div>
              {/* Perforation */}
              <div className="w-px self-stretch" style={{ borderLeft: `2px dashed ${alpha(accent, "33")}` }} />
              <div className="min-w-0 flex-1 px-4 py-2.5">
                {editLabel(item, index, "text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
              <div className="flex items-center pr-3.5">
                <ChevronRight size={16} style={{ color: alpha(accent, "8c") }} />
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------------ agenda-style-4: TAB STOPS (line + tabs) -------------- */
  if (layoutId === "agenda-style-4") {
    const displayItems = items.slice(0, 8);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="relative flex flex-col gap-3.5">
          {/* Continuous line through the tab centers */}
          <div className="absolute bottom-2 top-2 w-px" style={{ left: 17, background: `linear-gradient(180deg, ${alpha(accent, "59")}, ${alpha(accent, "1a")})` }} />
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} className="relative flex items-start gap-4 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <span
                className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold tabular-nums"
                style={{
                  background: index === 0 ? accent : surface,
                  color: index === 0 ? "#ffffff" : accent,
                  border: `1.5px solid ${index === 0 ? accent : alpha(accent, "59")}`,
                  boxShadow: `0 0 0 4px ${surface}`,
                }}
              >
                {pad2(index + 1)}
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

  /* --------------- agenda-style-5: TWIN COLUMNS (center rule) -------------- */
  if (layoutId === "agenda-style-5") {
    const displayItems = items.slice(0, 8);
    const half = Math.ceil(displayItems.length / 2);
    const columns = [displayItems.slice(0, half), displayItems.slice(half)];
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="grid w-full items-start gap-10" style={{ gridTemplateColumns: "1fr 1px 1fr" }}>
          {columns[0] && (
            <div className="flex flex-col gap-5">
              {columns[0].map((item, i) => (
                <ItemWrapper key={i} className="min-w-0" style={getSpotlightStyle(i)} {...itemMotion(i)}>
                  <span className="font-mono text-[11px] font-semibold tracking-[0.2em]" style={{ color: accent }}>
                    {pad2(i + 1)}
                  </span>
                  {editLabel(item, i, "mt-0.5 text-base font-bold tracking-tight")}
                  {editText(item, i, "mt-0.5 text-xs leading-snug break-words")}
                </ItemWrapper>
              ))}
            </div>
          )}
          <div className="self-stretch" style={{ background: border }} />
          <div className="flex flex-col gap-5">
            {columns[1]?.map((item, i) => {
              const index = i + half;
              return (
                <ItemWrapper key={index} className="min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
                  <span className="font-mono text-[11px] font-semibold tracking-[0.2em]" style={{ color: accent }}>
                    {pad2(index + 1)}
                  </span>
                  {editLabel(item, index, "mt-0.5 text-base font-bold tracking-tight")}
                  {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
                </ItemWrapper>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  /* ------------- agenda-style-6: DISPLAY CONTENTS (headline rows) ---------- */
  if (layoutId === "agenda-style-6") {
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
              className="group flex items-baseline gap-4 py-3.5 min-w-0"
              style={{
                borderBottom: index === displayItems.length - 1 ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <sup className="shrink-0 font-mono text-xs font-bold" style={{ color: accent }}>
                {pad2(index + 1)}
              </sup>
              <div className="min-w-0 shrink">
                {editLabel(item, index, "text-xl font-extrabold tracking-tight leading-tight", {
                  fontFamily: theme?.fonts.heading.family,
                })}
              </div>
              <div className="min-w-0 flex-1 text-right">
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* -------------- agenda-style-7: CORNER INDEX (ghost cards) --------------- */
  if (layoutId === "agenda-style-7") {
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
              className="relative overflow-hidden rounded-xl p-4 min-w-0"
              style={{ background: surface, border: `1px solid ${border}`, ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              {/* Ghost corner numeral */}
              <span
                className="pointer-events-none absolute -bottom-4 right-1 select-none font-extrabold leading-none"
                style={{ fontSize: 72, color: alpha(accent, "14") }}
              >
                {pad2(index + 1)}
              </span>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              <div className="my-2 h-[2px] w-7 rounded-full" style={{ background: accent }} />
              {editText(item, index, "relative text-xs leading-snug break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------ agenda-style-8: RIBBON BOOKMARKS (hanging flags) ----------- */
  if (layoutId === "agenda-style-8") {
    const displayItems = items.slice(0, 5);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="relative">
          {/* The rule the bookmarks hang from */}
          <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "26")})` }} />
          <div className="grid gap-6 pt-0" style={{ gridTemplateColumns: `repeat(${displayItems.length}, minmax(0, 1fr))` }}>
            {displayItems.map((item, index) => (
              <ItemWrapper key={index} className="min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
                {/* Bookmark ribbon */}
                <div
                  className="flex h-14 w-10 items-start justify-center pt-2"
                  style={{
                    background: index === 0
                      ? `linear-gradient(180deg, ${accent}, ${alpha(accent, "cc")})`
                      : alpha(accent, "26"),
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%)",
                    boxShadow: index === 0 ? `0 4px 12px ${alpha(accent, "40")}` : "none",
                  }}
                >
                  <span
                    className="text-sm font-extrabold tabular-nums"
                    style={{ color: index === 0 ? "#ffffff" : accent }}
                  >
                    {pad2(index + 1)}
                  </span>
                </div>
                {editLabel(item, index, "mt-3 text-sm font-bold tracking-tight")}
                {editText(item, index, "mt-1 text-xs leading-snug break-words")}
              </ItemWrapper>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  /* ----------------- agenda-style-9: UP NEXT (hero + rows) ----------------- */
  if (layoutId === "agenda-style-9") {
    const displayItems = items.slice(0, 6);
    const hero = displayItems[0];
    const rest = displayItems.slice(1);
    return (
      <Container
        className={`${SLIDE_FRAME} flex flex-col justify-center gap-4 ${className}`}
        key={animationKey} {...containerProps}
      >
        {hero && (
          <ItemWrapper
            key={0}
            className="flex items-center gap-5 rounded-2xl px-5 py-4"
            style={{
              background: `linear-gradient(135deg, ${alpha(accent, "1f")}, ${alpha(accent, "0a")})`,
              border: `1px solid ${alpha(accent, "40")}`,
              ...getSpotlightStyle(0),
            }}
            {...itemMotion(0)}
          >
            <span className="shrink-0 text-4xl font-extrabold leading-none tabular-nums" style={{ color: accent }}>
              {pad2(1)}
            </span>
            <div className="min-w-0">
              {editLabel(hero, 0, "text-lg font-extrabold tracking-tight")}
              {editText(hero, 0, "mt-0.5 text-sm leading-relaxed break-words")}
            </div>
          </ItemWrapper>
        )}
        <div className="flex flex-col px-1.5">
          {rest.map((item, i) => {
            const index = i + 1;
            return (
              <ItemWrapper
                key={index}
                className="flex items-baseline gap-3.5 py-2.5 min-w-0"
                style={{
                  borderBottom: i === rest.length - 1 ? "none" : `1px solid ${border}`,
                  ...getSpotlightStyle(index),
                }}
                {...itemMotion(index)}
              >
                <span className="shrink-0 font-mono text-xs font-bold tabular-nums" style={{ color: alpha(accent, "8c") }}>
                  {pad2(index + 1)}
                </span>
                <div className="min-w-0 shrink">
                  {editLabel(item, index, "text-sm font-bold tracking-tight")}
                </div>
                <div className="min-w-0 flex-1">
                  {editText(item, index, "text-xs leading-snug break-words")}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  /* --------------- agenda-style-10: FOLDER TABS (tab columns) -------------- */
  if (layoutId === "agenda-style-10") {
    const displayItems = items.slice(0, 4);
    return (
      <Container
        className={`${SLIDE_FRAME} flex items-center ${className}`}
        key={animationKey} {...containerProps}
      >
        <div className="grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${displayItems.length}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => {
            const active = index === 0;
            return (
              <ItemWrapper key={index} className="min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
                {/* Folder tab */}
                <div
                  className="flex h-9 w-[72%] items-center gap-2 px-3"
                  style={{
                    background: active ? accent : alpha(accent, "21"),
                    clipPath: "polygon(0 100%, 6% 0, 88% 0, 100% 100%)",
                  }}
                >
                  <span className="text-xs font-extrabold tabular-nums" style={{ color: active ? "#ffffff" : accent }}>
                    {pad2(index + 1)}
                  </span>
                </div>
                {/* Folder body */}
                <div
                  className="rounded-b-xl rounded-tr-xl p-4"
                  style={{
                    background: surface,
                    border: `1px solid ${active ? alpha(accent, "59") : border}`,
                    boxShadow: active ? `0 6px 18px ${alpha(accent, "1f")}` : "none",
                  }}
                >
                  {editLabel(item, index, "text-sm font-bold tracking-tight")}
                  {editText(item, index, "mt-1.5 text-xs leading-snug break-words")}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </Container>
    );
  }

  /* -------------- agenda-style-1: NUMBERED AGENDA (default) ---------------- */
  const displayItems = items.slice(0, 8); // Cap at 8 items
  const itemCount = displayItems.length;
  const isTwoColumn = itemCount > 4;

  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div
        className={
          isTwoColumn
            ? "grid grid-cols-2 gap-x-8 gap-y-1 sm:gap-y-2"
            : "flex flex-col"
        }
      >
        {displayItems.map((item, index) => {
          // No divider after the last row in a column.
          // Two-column grid fills row-major, so a cell is bottom-most in its
          // column when there is no item two positions later.
          const isLastInColumn = isTwoColumn
            ? index + 2 >= itemCount
            : index === itemCount - 1;

          return (
            <ItemWrapper
              key={index}
              className="flex items-start gap-4 py-3 sm:py-4"
              style={{
                borderBottom: isLastInColumn ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              {/* Premium numbered badge (squircle chip w/ accent tint + glow) */}
              <div
                className="flex-shrink-0 flex items-center justify-center tabular-nums"
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${alpha(accent, "26")}, ${alpha(accent, "0d")})`,
                  border: `1px solid ${alpha(accent, "3d")}`,
                  color: accent,
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  letterSpacing: "-0.02em",
                  boxShadow: `0 2px 10px ${alpha(accent, "1f")}`,
                }}
              >
                {pad2(index + 1)}
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                {editLabel(item, index, "font-bold text-base sm:text-lg leading-tight")}
                {editText(item, index, "text-sm leading-relaxed mt-0.5")}
              </div>
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
