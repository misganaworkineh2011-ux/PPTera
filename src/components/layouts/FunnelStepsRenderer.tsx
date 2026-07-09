"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { FunnelContentItem } from "~/lib/layouts/content/funnel";
import { getFunnelColors } from "~/lib/layouts/content/funnel";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Faster stagger
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20, // Less movement
    scale: 0.98,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface ThemeStyles {
  titleColor: string;
  bodyColor: string;
  iconBg: string;
  iconBorder: string;
}

function getThemeStyles(theme?: Theme): ThemeStyles {
  if (!theme) {
    return {
      titleColor: "#1e293b",
      bodyColor: "#64748b",
      iconBg: "#ffffff",
      iconBorder: "#e5e7eb",
    };
  }

  return {
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    // Theme-aware icon chip (was hardcoded white — glared on dark themes)
    iconBg: theme.cardBox?.background || theme.colors.surface || "#ffffff",
    iconBorder: theme.colors.border || "#e5e7eb",
  };
}

interface FunnelStepsRendererProps {
  items: FunnelContentItem[];
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

export function FunnelStepsRenderer({
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
}: FunnelStepsRendererProps) {
  const displayItems = items.slice(0, 6); 
  const themeStyles = getThemeStyles(theme);
  const itemCount = displayItems.length;

  // UPDATED: Much smaller dimensions
  const barHeight = 42; // Reduced from 60
  const iconSize = 32;  // Reduced from 50
  
  // UPDATED: Control width in pixels to keep it narrow
  const maxBarWidthPx = 220; 
  const minBarWidthPx = 120;

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

  // ---- Shared bits for the added styles (2-6) ----
  const accent = accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const surface = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const cardBorder = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const FItem = isPresenting ? motion.div : "div";
  const fProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  const editLabel = (item: FunnelContentItem, index: number, cls: string, style?: React.CSSProperties) =>
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

  const editText = (item: FunnelContentItem, index: number, cls: string, style?: React.CSSProperties) =>
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

  // == FUNNEL-STYLE-2: CENTERED FUNNEL — symmetric narrowing trapezoids
  if (layoutId === "funnel-style-2") {
    const fItems = items.slice(0, 5);
    const n = fItems.length;
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center gap-1.5 ${className}`} key={animationKey} {...fProps}>
        {fItems.map((item, index) => {
          const t = n > 1 ? index / (n - 1) : 0;
          const width = 92 - t * 46;
          const shade = `color-mix(in srgb, ${accent} ${100 - t * 40}%, #0b1220 ${t * 40}%)`;
          return (
            <FItem
              key={index}
              className="flex items-center justify-center gap-3 px-6 text-center"
              style={{
                width: `${width}%`,
                minHeight: 52,
                background: `linear-gradient(135deg, ${shade}, ${alpha(shade, "d9")})`,
                clipPath: "polygon(3% 0, 97% 0, 90% 100%, 10% 100%)",
                boxShadow: `0 3px 10px ${alpha(accent, "26")}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span className="text-sm font-extrabold tabular-nums" style={{ color: "rgba(255,255,255,0.85)" }}>{pad2(index + 1)}</span>
              <div className="min-w-0">
                {editLabel(item, index, "text-sm font-bold leading-tight", { color: "#ffffff" })}
                {editText(item, index, "text-[11px] leading-snug break-words", { color: "rgba(255,255,255,0.82)" })}
              </div>
            </FItem>
          );
        })}
      </Container>
    );
  }

  // == FUNNEL-STYLE-3: SPLIT FUNNEL — narrowing trapezoid tabs + content right
  if (layoutId === "funnel-style-3") {
    const fItems = items.slice(0, 5);
    const n = fItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-2.5 px-2 ${className}`} key={animationKey} {...fProps}>
        {fItems.map((item, index) => {
          const t = n > 1 ? index / (n - 1) : 0;
          const width = 240 - t * 90;
          const shade = `color-mix(in srgb, ${accent} ${100 - t * 38}%, #0b1220 ${t * 38}%)`;
          return (
            <FItem key={index} className="flex items-center gap-4 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div
                className="flex shrink-0 items-center justify-center gap-2"
                style={{
                  width,
                  height: 46,
                  background: `linear-gradient(135deg, ${shade}, ${alpha(shade, "cc")})`,
                  clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)",
                }}
              >
                <span className="text-xs font-extrabold tabular-nums text-white">STEP {index + 1}</span>
              </div>
              <div className="min-w-0 flex-1">
                {editLabel(item, index, "text-sm font-bold leading-tight")}
                {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
              </div>
            </FItem>
          );
        })}
      </Container>
    );
  }

  // == FUNNEL-STYLE-4: CONVERSION DROP — shrinking bars with percent tags
  if (layoutId === "funnel-style-4") {
    const fItems = items.slice(0, 5);
    const n = fItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-2 px-3 ${className}`} key={animationKey} {...fProps}>
        {fItems.map((item, index) => {
          const t = n > 1 ? index / (n - 1) : 0;
          const width = 100 - t * 48;
          const pct = Math.round(100 - t * (n <= 1 ? 0 : 72));
          const shade = `color-mix(in srgb, ${accent} ${100 - t * 34}%, #0b1220 ${t * 34}%)`;
          return (
            <FItem key={index} className="flex items-center gap-3 min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              <div
                className="flex items-center rounded-lg px-4 py-2.5 min-w-0"
                style={{ width: `${width}%`, minWidth: "45%", background: `linear-gradient(90deg, ${shade}, ${alpha(shade, "cc")})`, boxShadow: `0 3px 10px ${alpha(accent, "26")}` }}
              >
                <div className="min-w-0 flex-1">
                  {editLabel(item, index, "text-sm font-bold leading-tight truncate", { color: "#ffffff" })}
                  {editText(item, index, "text-[11px] leading-snug break-words", { color: "rgba(255,255,255,0.82)" })}
                </div>
              </div>
              <span className="shrink-0 font-mono text-lg font-extrabold tabular-nums" style={{ color: accent }}>
                {pct}%
              </span>
            </FItem>
          );
        })}
      </Container>
    );
  }

  // == FUNNEL-STYLE-5: FUNNEL SILHOUETTE — SVG funnel outline + stage nodes
  if (layoutId === "funnel-style-5") {
    const fItems = items.slice(0, 5);
    const n = fItems.length;
    return (
      <Container className={`w-full h-full flex items-stretch gap-6 px-2 ${className}`} key={animationKey} {...fProps}>
        <div className="relative w-40 shrink-0">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 300" preserveAspectRatio="none" aria-hidden>
            <path d="M 8 20 L 152 20 L 96 170 L 96 280 L 64 280 L 64 170 Z" fill={alpha(accent, "17")} stroke={alpha(accent, "59")} strokeWidth={2} />
          </svg>
          <div className="relative flex h-full flex-col justify-around py-4">
            {fItems.map((_, index) => (
              <div key={index} className="flex justify-center">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold tabular-nums text-white"
                  style={{ background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`, boxShadow: `0 0 0 4px ${surface}` }}
                >
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-around py-2">
          {fItems.map((item, index) => (
            <FItem key={index} className="min-w-0" style={getSpotlightStyle(index)} {...itemMotion(index)}>
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              {editText(item, index, "mt-0.5 text-xs leading-snug break-words")}
            </FItem>
          ))}
        </div>
      </Container>
    );
  }

  // == FUNNEL-STYLE-6: NARROWING CARDS — centered readable cards shrinking
  if (layoutId === "funnel-style-6") {
    const fItems = items.slice(0, 5);
    const n = fItems.length;
    return (
      <Container className={`w-full h-full flex flex-col items-center justify-center gap-2 ${className}`} key={animationKey} {...fProps}>
        {fItems.map((item, index) => {
          const t = n > 1 ? index / (n - 1) : 0;
          const width = 96 - t * 40;
          return (
            <FItem
              key={index}
              className="flex items-center gap-3.5 rounded-xl px-5 py-3 min-w-0"
              style={{
                width: `${width}%`,
                background: `linear-gradient(135deg, ${alpha(accent, "1f")}, ${alpha(accent, "0a")})`,
                border: `1px solid ${alpha(accent, "33")}`,
                borderLeft: `3px solid ${accent}`,
                ...getSpotlightStyle(index),
              }}
              {...itemMotion(index)}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold tabular-nums text-white" style={{ background: accent }}>
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                {editLabel(item, index, "text-sm font-bold leading-tight")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </FItem>
          );
        })}
      </Container>
    );
  }

  return (
    <Container className={`w-full py-2 px-4 ${className}`} key={animationKey} {...containerProps}>
      {/* UPDATED: Reduced gap from gap-3 to gap-2 (0.5rem) */}
      <div className="flex flex-col gap-2">
        {displayItems.map((item, index) => {
          const colors = getFunnelColors(index, itemCount, accentColor, theme?.colors.secondary);
          
          // Calculate specific width in pixels so it doesn't take over the screen
          const widthStep = (maxBarWidthPx - minBarWidthPx) / (itemCount - 1 || 1);
          const currentWidthPx = maxBarWidthPx - (index * widthStep);
          
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};

          return (
            <ItemWrapper
              key={index}
              className="flex items-center gap-4"
              style={getSpotlightStyle(index)}
              {...variantsProps}
            >
              {/* Funnel bar with icon (gradient sheen + soft color glow) */}
              <div
                className="relative flex items-center rounded-full flex-shrink-0"
                style={{
                  width: `${currentWidthPx}px`,
                  height: `${barHeight}px`,
                  background: `linear-gradient(135deg, ${colors.bg}, ${alpha(colors.bg, "d9")})`,
                  boxShadow: `0 4px 14px ${alpha(colors.bg, "40")}`,
                }}
              >
                {/* Icon circle */}
                <div
                  className="absolute left-1.5 flex items-center justify-center rounded-full shadow-sm"
                  style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    backgroundColor: themeStyles.iconBg,
                    border: `2px solid ${themeStyles.iconBorder}`,
                  }}
                >
                  {item.icon ? (
                    <span className="text-sm">{item.icon}</span>
                  ) : (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: colors.text }}
                    />
                  )}
                </div>

                {/* Step label - Text size reduced to fit smaller bar */}
                <div
                  className="ml-12 font-bold text-xs tracking-wider tabular-nums"
                  style={{ color: colors.text }}
                >
                  STEP {index + 1}
                </div>
              </div>

              {/* Content on the right - flex-1 takes all remaining space */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
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
                      className="font-bold text-sm leading-tight mb-0.5"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="font-bold text-sm leading-tight mb-0.5"
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
                    className="text-xs leading-relaxed"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: themeStyles.bodyColor }}
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