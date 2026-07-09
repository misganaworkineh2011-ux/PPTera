"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { tileStyle, SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

interface DefinitionListRendererProps {
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

export function DefinitionListRenderer({
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
}: DefinitionListRendererProps) {
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
  const headingFont = theme?.fonts.heading.family;
  const pad2 = (n: number) => String(n).padStart(2, "0");

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: "all 0.4s ease-out",
    };
  };

  // Editable-or-static term/definition shared by every anatomy.
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

  /* --------- definitionlist-style-2: DICTIONARY ENTRIES (hanging indent) --- */
  if (layoutId === "definitionlist-style-2") {
    const displayItems = items.slice(0, 6);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="flex flex-col">
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="py-3 min-w-0"
              style={{
                borderBottom: index === displayItems.length - 1 ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <div className="flex items-baseline gap-2.5">
                <sup className="shrink-0 font-mono text-[10px] font-bold" style={{ color: accent }}>
                  {index + 1}
                </sup>
                {editLabel(item, index, "text-lg font-bold tracking-tight", { fontFamily: headingFont })}
                <span className="h-1 w-1 shrink-0 rotate-45" style={{ background: accent }} aria-hidden />
              </div>
              {editText(item, index, "mt-1 pl-6 text-sm leading-relaxed break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* -------------- definitionlist-style-3: FLASH CARDS (term band) ---------- */
  if (layoutId === "definitionlist-style-3") {
    const displayItems = items.slice(0, 6);
    const cols = displayItems.length <= 4 ? 2 : 3;
    return (
      <Container className={`${SLIDE_FRAME} flex items-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="overflow-hidden rounded-xl min-w-0"
              style={{ border: `1px solid ${border}`, background: cardBg, ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              <div
                className="px-4 py-2.5 text-center"
                style={{ background: `linear-gradient(135deg, ${alpha(accent, "26")}, ${alpha(accent, "0f")})`, borderBottom: `1px solid ${alpha(accent, "26")}` }}
              >
                {editLabel(item, index, "text-sm font-bold tracking-tight")}
              </div>
              <div className="px-4 py-3 text-center">
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------- definitionlist-style-4: GLOSSARY TABLE (rule split) ------- */
  if (layoutId === "definitionlist-style-4") {
    const displayItems = items.slice(0, 6);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="flex flex-col">
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="grid items-start gap-6 py-3 min-w-0"
              style={{
                gridTemplateColumns: "1fr 2.2fr",
                borderBottom: index === displayItems.length - 1 ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <div className="min-w-0 pr-6 text-right" style={{ borderRight: `2px solid ${index === 0 ? accent : alpha(accent, "33")}` }}>
                {editLabel(item, index, "text-sm font-bold uppercase tracking-[0.1em] leading-snug")}
              </div>
              {editText(item, index, "min-w-0 text-sm leading-relaxed break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* --------------- definitionlist-style-5: BRACE NOTES (accent {) ---------- */
  if (layoutId === "definitionlist-style-5") {
    const displayItems = items.slice(0, 5);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-4 ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        {displayItems.map((item, index) => (
          <ItemWrapper key={index} className="min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
            {editLabel(item, index, "mb-1 text-base font-bold tracking-tight")}
            <div className="flex items-stretch gap-3">
              <span
                className="shrink-0 select-none leading-none"
                style={{ fontSize: 38, color: accent, fontFamily: headingFont, transform: "translateY(-2px)" }}
                aria-hidden
              >
                {"{"}
              </span>
              {editText(item, index, "min-w-0 flex-1 self-center text-sm leading-relaxed break-words")}
            </div>
          </ItemWrapper>
        ))}
      </Container>
    );
  }

  /* ------------ definitionlist-style-6: EQUALS NOTATION (term = def) ------- */
  if (layoutId === "definitionlist-style-6") {
    const displayItems = items.slice(0, 6);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="flex flex-col gap-4">
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="grid items-center gap-4 min-w-0"
              style={{ gridTemplateColumns: "1fr 2.5rem 2fr", ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              <div className="min-w-0 text-right">
                {editLabel(item, index, "text-base font-bold tracking-tight")}
              </div>
              <span className="text-center font-mono text-xl font-bold" style={{ color: accent }} aria-hidden>
                =
              </span>
              {editText(item, index, "min-w-0 text-sm leading-relaxed break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ---------- definitionlist-style-7: HIGHLIGHT TERMS (inline flow) -------- */
  if (layoutId === "definitionlist-style-7") {
    const displayItems = items.slice(0, 6);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-5 ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        {displayItems.map((item, index) => (
          <ItemWrapper key={index} className="min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span
                className="inline-block px-1.5"
                style={{ background: `linear-gradient(180deg, transparent 52%, ${alpha(accent, "40")} 52%)` }}
              >
                {editLabel(item, index, "text-base font-bold tracking-tight")}
              </span>
              {editText(item, index, "min-w-0 flex-1 text-sm leading-relaxed break-words")}
            </div>
          </ItemWrapper>
        ))}
      </Container>
    );
  }

  /* ------------- definitionlist-style-8: CORNER TAGS (folded tag) ---------- */
  if (layoutId === "definitionlist-style-8") {
    const displayItems = items.slice(0, 6);
    const cols = displayItems.length <= 4 ? 2 : 3;
    return (
      <Container className={`${SLIDE_FRAME} flex items-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative overflow-hidden rounded-xl pb-4 pl-4 pr-4 pt-11 min-w-0"
              style={{ background: cardBg, border: `1px solid ${border}`, ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              {/* Folded corner tag holding the term */}
              <div
                className="absolute left-0 top-0 max-w-[85%] rounded-br-xl px-3 py-1.5"
                style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 3px 8px ${alpha(accent, "33")}` }}
              >
                {editLabel(item, index, "truncate text-xs font-bold tracking-tight", { color: "#ffffff" })}
              </div>
              {editText(item, index, "text-xs leading-snug break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ---------- definitionlist-style-9: NUMBERED LEXICON (dotted rule) ------- */
  if (layoutId === "definitionlist-style-9") {
    const displayItems = items.slice(0, 6);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="flex flex-col gap-3.5">
          {displayItems.map((item, index) => (
            <ItemWrapper key={index} className="min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="flex items-baseline gap-3">
                <span className="shrink-0 font-mono text-[11px] font-bold" style={{ color: accent }}>
                  {pad2(index + 1)}
                </span>
                {editLabel(item, index, "text-sm font-bold uppercase tracking-[0.14em]")}
                <span className="flex-1 translate-y-[-3px]" style={{ borderBottom: `2px dotted ${alpha(accent, "33")}` }} aria-hidden />
              </div>
              {editText(item, index, "mt-1 pl-8 text-xs leading-relaxed break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* --------------- definitionlist-style-10: ARROW MAP (term → def) --------- */
  if (layoutId === "definitionlist-style-10") {
    const displayItems = items.slice(0, 6);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="flex flex-col gap-4">
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="grid items-center gap-4 min-w-0"
              style={{ gridTemplateColumns: "1fr 4.5rem 2fr", ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              <div className="min-w-0 text-right">
                {editLabel(item, index, "text-base font-bold tracking-tight")}
              </div>
              {/* Accent arrow */}
              <span className="relative flex items-center" aria-hidden>
                <span className="h-[2px] flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${alpha(accent, "40")}, ${accent})` }} />
                <span
                  style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: `9px solid ${accent}` }}
                />
              </span>
              {editText(item, index, "min-w-0 text-sm leading-relaxed break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ------------- definitionlist-style-11: STICKY NOTES (tilted) ------------ */
  if (layoutId === "definitionlist-style-11") {
    const displayItems = items.slice(0, 6);
    const cols = displayItems.length <= 4 ? 2 : 3;
    return (
      <Container className={`${SLIDE_FRAME} flex items-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="grid w-full gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative rounded-md p-4 min-w-0"
              style={{
                background: alpha(accent, "12"),
                border: `1px solid ${alpha(accent, "26")}`,
                transform: `rotate(${index % 2 === 0 ? -1.4 : 1.3}deg)`,
                boxShadow: `0 8px 18px ${alpha(accent, "1f")}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              {/* Folded note corner */}
              <span
                className="absolute bottom-0 right-0"
                style={{ width: 0, height: 0, borderLeft: "16px solid transparent", borderBottom: `16px solid ${alpha(accent, "40")}` }}
                aria-hidden
              />
              {editLabel(item, index, "mb-1.5 text-sm font-bold tracking-tight")}
              {editText(item, index, "text-xs leading-snug break-words")}
            </ItemWrapper>
          ))}
        </div>
      </Container>
    );
  }

  /* ----------- definitionlist-style-12: GHOST INITIALS (watermark) --------- */
  if (layoutId === "definitionlist-style-12") {
    const displayItems = items.slice(0, 6);
    const cols = displayItems.length <= 4 ? 2 : 3;
    return (
      <Container className={`${SLIDE_FRAME} flex items-center ${className}`} data-layout-id={layoutId} key={animationKey} {...containerProps}>
        <div className="grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <ItemWrapper
              key={index}
              className="relative overflow-hidden rounded-xl p-4 min-w-0"
              style={{ background: cardBg, border: `1px solid ${border}`, ...getSpotlightStyle(index) }}
              {...itemMotion(index)}
            >
              {/* The term's oversized initial as a watermark */}
              <span
                className="pointer-events-none absolute -bottom-6 -right-1 select-none font-bold leading-none"
                style={{ fontSize: 96, color: alpha(accent, "14"), fontFamily: headingFont }}
                aria-hidden
              >
                {(item.label || "•").charAt(0).toUpperCase()}
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

  /* ------------- definitionlist-style-1: GLOSSARY (default tile) ----------- */
  const displayItems = items.slice(0, 6); // Cap at 6 rows

  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
      data-layout-id={layoutId}
      key={animationKey} {...containerProps}
    >
      <div
        className="ppt-tile flex flex-col rounded-2xl overflow-hidden"
        style={tileStyle(cardBg, border, accent)}
      >
        {displayItems.map((item, index) => {
          const hasLabel = Boolean(item.label && item.label.trim().length > 0);
          const isLast = index === displayItems.length - 1;

          return (
            <ItemWrapper
              key={index}
              className="flex items-stretch gap-5 px-6 py-4"
              style={{
                borderBottom: isLast ? "none" : `1px solid ${border}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              {hasLabel ? (
                <>
                  {/* LEFT — term column (narrower, fixed-ish) */}
                  <div className="flex w-[34%] flex-shrink-0 items-start gap-3">
                    <span
                      className="mt-1 block w-[3px] flex-shrink-0 self-stretch rounded-full"
                      style={{ backgroundColor: accent }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      {item.icon && (
                        <span className="mb-1 block text-lg leading-none" style={{ color: accent }}>
                          {item.icon}
                        </span>
                      )}
                      {editLabel(item, index, "text-base font-bold leading-snug break-words")}
                    </div>
                  </div>

                  {/* RIGHT — definition (wraps fully) */}
                  <div className="min-w-0 flex-1 flex items-start">
                    {editText(item, index, "text-sm leading-relaxed break-words")}
                  </div>
                </>
              ) : (
                /* No label — text spans full width */
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    className="mt-2 block w-[3px] flex-shrink-0 self-stretch rounded-full"
                    style={{ backgroundColor: accent }}
                    aria-hidden="true"
                  />
                  {editText(item, index, "text-sm leading-relaxed break-words flex-1")}
                </div>
              )}
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
