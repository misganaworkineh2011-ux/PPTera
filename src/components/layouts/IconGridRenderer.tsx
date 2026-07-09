"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { tileStyle, SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (subtle entrance, gated on isPresenting)
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
    y: 16,
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

interface IconGridRendererProps {
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

export function IconGridRenderer({
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
}: IconGridRendererProps) {
  const displayItems = items.slice(0, 6); // Cap at 6
  const itemCount = displayItems.length;

  // Defensive colors
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor ||
    theme?.colors.accent ||
    theme?.colors.primary ||
    "#6366f1";

  // Premium squircle chip — accent gradient wash + hairline border + glow
  const chipBg = `linear-gradient(135deg, ${alpha(accent, "26")}, ${alpha(accent, "0d")})`;
  const chipBorder = `1px solid ${alpha(accent, "3d")}`;
  const chipShadow = `0 4px 14px ${alpha(accent, "1a")}`;

  // Choose columns by count: 2 cols for <=4, 3 cols for 5-6
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

  // ---- Shared bits for the added styles (2-6) ----
  const cardBg = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const cardBorder = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const glyph = (item: BoxContentItem, index: number) =>
    typeof item.icon === "string" && item.icon.trim().length > 0 ? item.icon : pad2(index + 1);

  const editLabel = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${index}`}
          onStartEdit={() => onStartEditLabel(index)} onChange={(val) => onUpdateLabel?.(index, val)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
          className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <h3 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;

  const editText = (item: BoxContentItem, index: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${index}`}
        onStartEdit={() => onStartEditText(index)} onChange={(val) => onUpdateText?.(index, val)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
        className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
    );

  const cols = itemCount <= 4 ? 2 : 3;

  // == ICONGRID-STYLE-2: ICON CARDS — each feature in a surface card, chip on top
  if (layoutId === "icongrid-style-2") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="ppt-tile flex flex-col items-center rounded-2xl p-5 text-center" style={{ ...tileStyle(cardBg, cardBorder, accent, { bar: "top" }), ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: chipBg, border: chipBorder, boxShadow: chipShadow }}>
                <span className="text-xl leading-none" style={{ color: accent }}>{glyph(item, index)}</span>
              </div>
              {editLabel(item, index, "text-base font-bold leading-tight")}
              {editText(item, index, "mt-1 text-sm leading-relaxed")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == ICONGRID-STYLE-3: ICON ROWS — chip left, label and text right, list layout
  if (layoutId === "icongrid-style-3") {
    const twoCol = itemCount > 4;
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid gap-x-8 gap-y-4" style={{ gridTemplateColumns: `repeat(${twoCol ? 2 : 1}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex items-start gap-4 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: chipBg, border: chipBorder, boxShadow: chipShadow }}>
                <span className="text-xl leading-none" style={{ color: accent }}>{glyph(item, index)}</span>
              </div>
              <div className="min-w-0 flex-1 border-b pb-3" style={{ borderColor: alpha(bodyColor, "1a") }}>
                {editLabel(item, index, "text-base font-bold leading-tight")}
                {editText(item, index, "mt-0.5 text-sm leading-relaxed")}
              </div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == ICONGRID-STYLE-4: RING BADGES — icon inside a gradient ring, centered grid
  if (layoutId === "icongrid-style-4") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid gap-x-8 gap-y-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex flex-col items-center text-center" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ padding: 3, background: `conic-gradient(from 140deg, ${accent}, ${alpha(accent, "33")}, ${accent})` }}>
                <div className="flex h-full w-full items-center justify-center rounded-full" style={{ background: cardBg }}>
                  <span className="text-2xl leading-none" style={{ color: accent }}>{glyph(item, index)}</span>
                </div>
              </div>
              {editLabel(item, index, "text-base font-bold leading-tight")}
              {editText(item, index, "mt-1 text-sm leading-relaxed")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == ICONGRID-STYLE-5: TOP ACCENT CARDS — accent top bar + icon chip
  if (layoutId === "icongrid-style-5") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="ppt-tile relative flex flex-col overflow-hidden rounded-2xl p-5 pt-6" style={{ background: cardBg, border: `1px solid ${cardBorder}`, ...getSpotlightStyle(index) }} {...itemMotion(index)}>
              <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${accent}, ${alpha(accent, "66")})` }} />
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 6px 16px -4px ${alpha(accent, "80")}` }}>
                <span className="text-lg leading-none">{glyph(item, index)}</span>
              </div>
              {editLabel(item, index, "text-base font-bold leading-tight")}
              {editText(item, index, "mt-1 text-sm leading-relaxed")}
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == ICONGRID-STYLE-6: NUMBERED ICONS — big numeral paired with a small icon
  if (layoutId === "icongrid-style-6") {
    const hasIconAny = displayItems.some((it) => typeof it.icon === "string" && it.icon.trim().length > 0);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid gap-x-8 gap-y-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((item, index) => (
            <CItem key={index} className="flex flex-col items-start text-left min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="font-extrabold tabular-nums leading-none" style={{ fontSize: "2.4rem", color: alpha(accent, "de"), letterSpacing: "-0.04em" }}>{pad2(index + 1)}</span>
                {hasIconAny && item.icon && <span className="text-lg leading-none" style={{ color: accent }}>{item.icon}</span>}
              </div>
              <span aria-hidden className="mb-2 block h-0.5 w-10 rounded-full" style={{ background: accent }} />
              {editLabel(item, index, "text-base font-bold leading-tight")}
              {editText(item, index, "mt-1 text-sm leading-relaxed")}
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
      <div className={`grid ${gridColsClass} gap-x-8 gap-y-7`}>
        {displayItems.map((item, index) => {
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};
          const hasIcon =
            typeof item.icon === "string" && item.icon.trim().length > 0;

          return (
            <ItemWrapper
              key={index}
              className="flex flex-col items-start text-left"
              style={getSpotlightStyle(index)}
              {...variantsProps}
            >
              {/* Icon chip — premium squircle w/ accent gradient + glow */}
              <div
                className="flex items-center justify-center mb-3.5"
                style={{
                  width: "3.25rem",
                  height: "3.25rem",
                  borderRadius: 16,
                  background: chipBg,
                  border: chipBorder,
                  boxShadow: chipShadow,
                }}
              >
                {hasIcon ? (
                  <span
                    className="text-2xl leading-none"
                    style={{ color: accent }}
                  >
                    {item.icon}
                  </span>
                ) : (
                  // Numbered anchor so every cell reads as a distinct feature
                  <span
                    className="text-lg font-extrabold tabular-nums leading-none"
                    style={{ color: accent, letterSpacing: "-0.02em" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </div>

              {/* Label */}
              {item.label &&
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

              {/* Text */}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={
                    isEditing &&
                    editingText?.field === `content-text-${index}`
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
