"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { tileStyle, SLIDE_FRAME } from "./tile";
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

/**
 * Compute initials from a name.
 * Takes the first letter of the first two words, uppercased.
 * Handles single-word names (uses just the first letter).
 * Falls back to "?" when no usable label is present.
 */
function getInitials(label?: string): string {
  if (!label) return "?";
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) {
    return words[0]!.charAt(0).toUpperCase() || "?";
  }
  const first = words[0]!.charAt(0);
  const second = words[1]!.charAt(0);
  return (first + second).toUpperCase() || "?";
}

interface TeamGridRendererProps {
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

export function TeamGridRenderer({
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
}: TeamGridRendererProps) {
  const displayItems = items.slice(0, 6); // Cap at 6
  const itemCount = displayItems.length;

  // Defensive colors
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg =
    theme?.cardBox?.background ||
    theme?.colors.surface ||
    "rgba(255,255,255,0.05)";
  const border = theme?.colors.border || "rgba(0,0,0,0.08)";

  // grid-cols-2 for <= 4, grid-cols-3 for 5-6
  const gridColsClass = itemCount <= 4 ? "grid-cols-2" : "grid-cols-3";

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

  // ---- Shared bits for the added styles (2-8) ----
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  const editName = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    item.label !== undefined ? (
      onStartEditLabel ? (
        <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${index}`}
          onStartEdit={() => onStartEditLabel(index)} onChange={(val) => onUpdateLabel?.(index, val)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
          className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <h3 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;

  const editRole = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)} onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
    );

  const avatar = (item: BoxContentItem, sizeRem: number, opts: { ring?: boolean; fontRem?: number } = {}) => {
    const inner = (
      <div className="flex items-center justify-center rounded-full font-semibold" style={{ width: `${sizeRem}rem`, height: `${sizeRem}rem`, backgroundColor: alpha(accent, "22"), color: accent, fontSize: `${opts.fontRem ?? sizeRem * 0.36}rem` }}>
        {getInitials(item.label)}
      </div>
    );
    if (!opts.ring) return inner;
    return (
      <div className="flex items-center justify-center rounded-full" style={{ padding: 3, background: `conic-gradient(from 140deg, ${accent}, ${alpha(accent, "33")}, ${accent})` }}>
        <div className="rounded-full" style={{ background: cardBg, padding: 2 }}>{inner}</div>
      </div>
    );
  };

  // == TEAM-STYLE-2: ROSTER ROWS — avatar left, name and role right, dividers
  if (layoutId === "team-style-2") {
    const twoCol = itemCount > 3;
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid gap-x-8 gap-y-1 mx-auto w-full max-w-5xl" style={{ gridTemplateColumns: `repeat(${twoCol ? 2 : 1}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex items-center gap-4 border-b py-3 min-w-0" style={{ borderColor: alpha(bodyColor, "1a"), ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              {avatar(item, 3)}
              <div className="min-w-0 flex-1">
                {editName(item, index, "font-bold text-base leading-tight")}
                {editRole(item, index, "mt-0.5 text-sm leading-snug", { color: accent })}
              </div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == TEAM-STYLE-3: BANNER PROFILES — accent top banner, avatar overlapping
  if (layoutId === "team-style-3") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className={`grid ${gridColsClass} gap-5 mx-auto w-full max-w-5xl`}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="ppt-tile flex flex-col items-center overflow-hidden rounded-2xl text-center" style={{ background: cardBg, border: `1px solid ${border}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <div className="h-12 w-full" style={{ background: `linear-gradient(120deg, ${accent}, ${alpha(accent, "b3")})` }} />
              <div className="-mt-7 rounded-full" style={{ padding: 3, background: cardBg }}>{avatar(item, 3.25)}</div>
              <div className="px-4 pb-5 pt-2">
                {editName(item, index, "font-bold text-base leading-tight")}
                {editRole(item, index, "mt-0.5 text-sm leading-snug")}
              </div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == TEAM-STYLE-4: RING AVATARS — gradient-ring avatars, role in an accent chip
  if (layoutId === "team-style-4") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className={`grid ${gridColsClass} gap-x-6 gap-y-7 mx-auto w-full max-w-5xl`}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex flex-col items-center text-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="mb-3">{avatar(item, 3.75, { ring: true })}</div>
              {editName(item, index, "font-bold text-base leading-tight")}
              {item.text !== undefined && (
                <div className="mt-1.5 rounded-full px-3 py-1" style={{ background: alpha(accent, "1a"), border: `1px solid ${alpha(accent, "2e")}` }}>
                  {editRole(item, index, "text-xs font-semibold leading-none", { color: accent })}
                </div>
              )}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == TEAM-STYLE-5: FEATURED LEAD — one large member beside compact teammates
  if (layoutId === "team-style-5" && displayItems[0]) {
    const leadM = displayItems[0];
    const restM = displayItems.slice(1);
    return (
      <Container className={`${SLIDE_FRAME} flex items-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid w-full grid-cols-2 items-center gap-8">
          <CItem className="ppt-tile flex flex-col items-center rounded-2xl p-6 text-center" style={{ ...tileStyle(cardBg, border, accent, { bar: "top" }), ...getSpotlightStyle(0) }} {...itemMotion(0)}>
            {avatar(leadM, 5, { ring: true })}
            <div className="mt-3">{editName(leadM, 0, "font-bold text-xl leading-tight")}</div>
            {editRole(leadM, 0, "mt-1 text-sm leading-snug", { color: accent })}
          </CItem>
          <div className="flex flex-col gap-3">
            {restM.map((item, i) => {
              const ri = i + 1;
              return (
                <CItem key={ri} className="flex items-center gap-3.5 min-w-0" style={getSpotlightStyle(ri)} {...itemMotion(ri)}>
                  {avatar(item, 2.75)}
                  <div className="min-w-0 flex-1 border-b pb-2.5" style={{ borderColor: alpha(bodyColor, "1a") }}>
                    {editName(item, ri, "font-bold text-sm leading-tight")}
                    {editRole(item, ri, "mt-0.5 text-xs leading-snug", { color: accent })}
                  </div>
                </CItem>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  // == TEAM-STYLE-6: AVATAR STRIP — a horizontal strip of avatars with names beneath
  if (layoutId === "team-style-6") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-6">
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex w-28 flex-col items-center text-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {avatar(item, 3.5, { ring: true })}
              <div className="mt-2.5">{editName(item, index, "font-bold text-sm leading-tight")}</div>
              {editRole(item, index, "mt-0.5 text-xs leading-snug")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == TEAM-STYLE-7: QUOTE CARDS — avatar with name, role and a short bio
  if (layoutId === "team-style-7") {
    const twoCol = itemCount > 2;
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid gap-4 mx-auto w-full max-w-5xl" style={{ gridTemplateColumns: `repeat(${twoCol ? 2 : 1}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="ppt-tile rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${accent}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              {editRole(item, index, "text-sm leading-relaxed italic")}
              <div className="mt-3 flex items-center gap-3 border-t pt-3" style={{ borderColor: alpha(bodyColor, "14") }}>
                {avatar(item, 2.5)}
                <div className="min-w-0">{editName(item, index, "font-bold text-sm leading-tight")}</div>
              </div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == TEAM-STYLE-8: MONO ROSTER — chromeless, square initials, small-caps roles
  if (layoutId === "team-style-8") {
    const twoCol = itemCount > 4;
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid gap-x-10 gap-y-1 mx-auto w-full max-w-5xl" style={{ gridTemplateColumns: `repeat(${twoCol ? 2 : 1}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex items-center gap-3.5 border-b py-3 min-w-0" style={{ borderColor: alpha(bodyColor, "1a"), ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-extrabold" style={{ background: alpha(accent, "14"), border: `1px solid ${alpha(accent, "2e")}`, color: accent }}>
                {getInitials(item.label)}
              </div>
              <div className="min-w-0 flex-1">{editName(item, index, "font-bold text-base leading-tight")}</div>
              {editRole(item, index, "shrink-0 text-[11px] font-semibold uppercase tracking-[0.15em]", { color: bodyColor })}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container
      className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`}
      key={animationKey} {...containerProps}
    >
      <div
        className={`grid ${gridColsClass} gap-5 justify-center mx-auto w-full max-w-5xl`}
      >
        {displayItems.map((item, index) => {
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};
          const initials = getInitials(item.label);

          return (
            <ItemWrapper
              key={index}
              className="ppt-tile flex flex-col items-center text-center rounded-2xl p-5"
              style={{
                ...tileStyle(cardBg, border, accent, { bar: "top" }),
                ...getSpotlightStyle(index),
              }}
              {...variantsProps}
            >
              {/* Avatar with initials */}
              <div
                className="flex items-center justify-center rounded-full mb-3 font-semibold"
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  backgroundColor: accent + "22",
                  color: accent,
                  fontSize: "1.125rem",
                }}
              >
                {initials}
              </div>

              {/* Name (label) */}
              {item.label !== undefined &&
                (onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={
                      isEditing &&
                      editingText?.field === `content-label-${index}`
                    }
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={
                      onDeleteItem ? () => onDeleteItem(index) : undefined
                    }
                    className="font-bold text-base mb-1 leading-tight"
                    style={{ color: titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="font-bold text-base mb-1 leading-tight"
                    style={{ color: titleColor }}
                  >
                    {item.label}
                  </h3>
                ))}

              {/* Role / bio (text) */}
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
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
