"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { tileStyle, SLIDE_FRAME } from "./tile";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants (subtle fade/scale stagger, gated on isPresenting)
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
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface BentoGridRendererProps {
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

// Grid placement per item count. The first item is always the hero.
// Returns the CSS grid template + per-item gridArea/gridColumn/gridRow strings.
function getGridConfig(count: number): {
  templateColumns: string;
  templateRows: string;
  cells: React.CSSProperties[];
} {
  // Hero spans a larger region; remaining items fill the rest.
  switch (count) {
    case 1:
      return {
        templateColumns: "1fr",
        templateRows: "1fr",
        cells: [{ gridColumn: "1 / 2", gridRow: "1 / 2" }],
      };
    case 2:
      return {
        templateColumns: "3fr 2fr",
        templateRows: "1fr",
        cells: [
          { gridColumn: "1 / 2", gridRow: "1 / 2" },
          { gridColumn: "2 / 3", gridRow: "1 / 2" },
        ],
      };
    case 3:
      // Hero spans left full height + 2 stacked on the right.
      return {
        templateColumns: "3fr 2fr",
        templateRows: "1fr 1fr",
        cells: [
          { gridColumn: "1 / 2", gridRow: "1 / 3" },
          { gridColumn: "2 / 3", gridRow: "1 / 2" },
          { gridColumn: "2 / 3", gridRow: "2 / 3" },
        ],
      };
    case 4:
      // Hero spans left full height + 3 stacked on the right.
      return {
        templateColumns: "3fr 2fr",
        templateRows: "1fr 1fr 1fr",
        cells: [
          { gridColumn: "1 / 2", gridRow: "1 / 4" },
          { gridColumn: "2 / 3", gridRow: "1 / 2" },
          { gridColumn: "2 / 3", gridRow: "2 / 3" },
          { gridColumn: "2 / 3", gridRow: "3 / 4" },
        ],
      };
    case 5:
      // Hero spans the full left column; the remaining 4 form a 2-col grid on the right.
      return {
        templateColumns: "2fr 1fr 1fr",
        templateRows: "1fr 1fr",
        cells: [
          { gridColumn: "1 / 2", gridRow: "1 / 3" },
          { gridColumn: "2 / 3", gridRow: "1 / 2" },
          { gridColumn: "3 / 4", gridRow: "1 / 2" },
          { gridColumn: "2 / 3", gridRow: "2 / 3" },
          { gridColumn: "3 / 4", gridRow: "2 / 3" },
        ],
      };
    case 6:
    default:
      // Hero spans the full left column; the remaining 5 form a 2-col grid (hero
      // covers the bottom-left slot so the mosaic stays balanced).
      return {
        templateColumns: "2fr 1fr 1fr",
        templateRows: "1fr 1fr 1fr",
        cells: [
          { gridColumn: "1 / 2", gridRow: "1 / 3" },
          { gridColumn: "2 / 3", gridRow: "1 / 2" },
          { gridColumn: "3 / 4", gridRow: "1 / 2" },
          { gridColumn: "2 / 3", gridRow: "2 / 3" },
          { gridColumn: "3 / 4", gridRow: "2 / 3" },
          { gridColumn: "1 / 4", gridRow: "3 / 4" },
        ],
      };
  }
}

export function BentoGridRenderer({
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
}: BentoGridRendererProps) {
  const displayItems = items.slice(0, 6); // Cap at 6 items
  const itemCount = displayItems.length;

  // Colors (read defensively with fallbacks)
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent =
    accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg =
    theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.06)";
  const cardBorder =
    theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";
  const heroTextColor = theme?.colors.textInverse || "#ffffff";

  const gridConfig = getGridConfig(itemCount);

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
        initial: "hidden" as const,
        animate: "visible" as const,
      }
    : {};

  // ---- Shared bits for the added styles (2-6) ----
  const CItem = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  // Unified tile used by the added mosaics. `hero` = accent-filled emphasis,
  // `tint` = soft accent wash, otherwise a plain surface tile.
  const renderTile = (
    item: BoxContentItem,
    index: number,
    opts: { hero?: boolean; tint?: boolean; cell?: React.CSSProperties } = {},
  ) => {
    const { hero = false, tint = false, cell } = opts;
    const labelColor = hero ? heroTextColor : titleColor;
    const textColor = hero ? heroTextColor : bodyColor;
    const iconColor = hero ? heroTextColor : accent;
    const base: React.CSSProperties = hero
      ? { background: `linear-gradient(140deg, ${accent} 0%, ${alpha(accent, "cc")} 100%)`, color: heroTextColor }
      : tint
        ? { background: `linear-gradient(150deg, ${alpha(accent, "1f")}, ${alpha(accent, "08")})`, border: `1px solid ${alpha(accent, "2e")}` }
        : tileStyle(cardBg, cardBorder, accent, { bar: "top" });
    return (
      <CItem
        key={index}
        className="ppt-tile relative flex h-full flex-col justify-center overflow-hidden rounded-2xl p-4 sm:p-5"
        style={{ ...base, ...cell, ...getSpotlightStyle(index) }}
        {...itemMotion(index)}
      >
        {item.icon && (
          <div className="absolute right-3 top-3 text-lg leading-none opacity-80" style={{ color: iconColor }}>{item.icon}</div>
        )}
        {item.label &&
          (onStartEditLabel ? (
            <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${index}`}
              onStartEdit={() => onStartEditLabel(index)} onChange={(val) => onUpdateLabel?.(index, val)}
              onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
              className={`font-bold leading-tight ${hero ? "text-xl sm:text-2xl mb-2" : "text-base mb-1.5"} ${item.icon ? "pr-6" : ""}`}
              style={{ color: labelColor }} isOwner={isOwner} isHovered={isHovered} />
          ) : (
            <h3 className={`font-bold leading-tight ${hero ? "text-xl sm:text-2xl mb-2" : "text-base mb-1.5"} ${item.icon ? "pr-6" : ""}`} style={{ color: labelColor }}>{item.label}</h3>
          ))}
        {onStartEditText ? (
          <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${index}`}
            onStartEdit={() => onStartEditText(index)} onChange={(val) => onUpdateText?.(index, val)}
            onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
            className={`leading-relaxed ${hero ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}
            style={{ color: textColor, opacity: hero ? 0.95 : 1 }} isOwner={isOwner} isHovered={isHovered} />
        ) : (
          <p className={`leading-relaxed ${hero ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`} style={{ color: textColor, opacity: hero ? 0.95 : 1 }}>{item.text}</p>
        )}
      </CItem>
    );
  };

  const hero = displayItems[0];
  const rest = displayItems.slice(1);

  // == BENTO-STYLE-2: BANNER HERO — hero spans the full top row, tiles beneath
  if (layoutId === "bento-style-2" && hero) {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid h-full w-full gap-3 sm:gap-4" style={{ gridTemplateRows: rest.length ? "1.05fr 1fr" : "1fr" }}>
          {renderTile(hero, 0, { hero: true })}
          {rest.length > 0 && (
            <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(${rest.length}, minmax(0, 1fr))` }}>
              {rest.map((it, i) => renderTile(it, i + 1, {}))}
            </div>
          )}
        </div>
      </Container>
    );
  }

  // == BENTO-STYLE-3: EVEN QUILT — uniform tiles, alternating accent tint
  if (layoutId === "bento-style-3") {
    const cols = itemCount <= 4 ? 2 : 3;
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid h-full w-full gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {displayItems.map((it, i) => renderTile(it, i, { tint: i % 2 === 1 }))}
        </div>
      </Container>
    );
  }

  // == BENTO-STYLE-4: RIGHT HERO — hero full-height on the right, tiles stacked left
  if (layoutId === "bento-style-4" && hero) {
    const rows = Math.max(rest.length, 1);
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid h-full w-full gap-3 sm:gap-4" style={{ gridTemplateColumns: "2fr 3fr", gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
          {rest.map((it, i) => renderTile(it, i + 1, { cell: { gridColumn: "1 / 2", gridRow: `${i + 1} / ${i + 2}` } }))}
          {renderTile(hero, 0, { hero: true, cell: { gridColumn: "2 / 3", gridRow: `1 / ${rows + 1}` } })}
        </div>
      </Container>
    );
  }

  // == BENTO-STYLE-5: PINWHEEL — center accent tile framed by surrounding tiles
  if (layoutId === "bento-style-5" && hero) {
    // Edges first (clean plus at 5 items), then corners for a 6th.
    const spots: React.CSSProperties[] = [
      { gridColumn: "2 / 3", gridRow: "1 / 2" },
      { gridColumn: "3 / 4", gridRow: "2 / 3" },
      { gridColumn: "2 / 3", gridRow: "3 / 4" },
      { gridColumn: "1 / 2", gridRow: "2 / 3" },
      { gridColumn: "1 / 2", gridRow: "1 / 2" },
    ];
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid h-full w-full gap-3 sm:gap-4" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridTemplateRows: "repeat(3, minmax(0, 1fr))" }}>
          {renderTile(hero, 0, { hero: true, cell: { gridColumn: "2 / 3", gridRow: "2 / 3" } })}
          {rest.slice(0, 5).map((it, i) => renderTile(it, i + 1, { cell: spots[i] }))}
        </div>
      </Container>
    );
  }

  // == BENTO-STYLE-6: STACK BENTO — full-width rows, first an accent hero
  if (layoutId === "bento-style-6" && hero) {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center ${className}`} key={animationKey} {...cProps}>
        <div className="grid h-full w-full gap-3" style={{ gridTemplateRows: `1.3fr ${Array(Math.max(itemCount - 1, 1)).fill("1fr").join(" ")}` }}>
          {displayItems.map((it, i) => renderTile(it, i, { hero: i === 0 }))}
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
        className="grid w-full h-full gap-3 sm:gap-4"
        style={{
          gridTemplateColumns: gridConfig.templateColumns,
          gridTemplateRows: gridConfig.templateRows,
        }}
      >
        {displayItems.map((item, index) => {
          const isHero = index === 0;
          const cell = gridConfig.cells[index] ?? {};

          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};

          // Per-card colors
          const labelColor = isHero ? heroTextColor : titleColor;
          const textColor = isHero ? heroTextColor : bodyColor;
          const iconColor = isHero ? heroTextColor : accent;

          const cardStyle: React.CSSProperties = isHero
            ? {
                background: `linear-gradient(140deg, ${accent} 0%, ${accent}cc 100%)`,
                color: heroTextColor,
              }
            : tileStyle(cardBg, cardBorder, accent, { bar: "top" });

          return (
            <ItemWrapper
              key={index}
              className="ppt-tile relative flex flex-col justify-center overflow-hidden rounded-2xl p-4 sm:p-5"
              style={{
                ...cell,
                ...cardStyle,
                ...getSpotlightStyle(index),
              }}
              {...variantsProps}
            >
              {/* Icon (small, in the corner) */}
              {item.icon && (
                <div
                  className="absolute right-3 top-3 text-lg leading-none opacity-80"
                  style={{ color: iconColor }}
                >
                  {item.icon}
                </div>
              )}

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
                    className={`font-bold leading-tight ${
                      isHero ? "text-xl sm:text-2xl mb-2" : "text-base mb-1.5"
                    } ${item.icon ? "pr-6" : ""}`}
                    style={{ color: labelColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className={`font-bold leading-tight ${
                      isHero ? "text-xl sm:text-2xl mb-2" : "text-base mb-1.5"
                    } ${item.icon ? "pr-6" : ""}`}
                    style={{ color: labelColor }}
                  >
                    {item.label}
                  </h3>
                ))}

              {/* Text */}
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
                  className={`leading-relaxed ${
                    isHero ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                  } ${item.icon && !item.label ? "pr-6" : ""}`}
                  style={{ color: textColor, opacity: isHero ? 0.95 : 1 }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p
                  className={`leading-relaxed ${
                    isHero ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                  } ${item.icon && !item.label ? "pr-6" : ""}`}
                  style={{ color: textColor, opacity: isHero ? 0.95 : 1 }}
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
