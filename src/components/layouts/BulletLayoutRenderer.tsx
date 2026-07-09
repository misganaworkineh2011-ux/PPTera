"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, GripVertical } from "lucide-react";
import type { BulletLayoutType, BulletContentItem } from "~/lib/layouts/content/bullets";
import { calculateBulletGridDimensions } from "~/lib/layouts/content/bullets";
import EditableText from "~/components/presentation/EditableText";
import type { Theme } from "~/lib/themes";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

// Animation variants for staggered bullet animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const bulletVariants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

// Helper to get theme-aware styles
function getThemeStyles(theme?: Theme, accentColor?: string) {
  const defaultAccent = accentColor || "#047857";
  
  if (!theme) {
    return {
      // For shapes - use visible accent with good opacity
      shapeBgColor: `${defaultAccent}20`,
      shapeBorderColor: `${defaultAccent}40`,
      // For cards - more visible
      cardBgColor: `${defaultAccent}15`,
      cardBorderColor: `${defaultAccent}30`,
      // Accent for bullets, icons
      accentColor: defaultAccent,
      // Text colors - default slate
      titleColor: "#1e293b",
      bodyColor: "#64748b",
    };
  }

  const cardBox = theme.cardBox;
  const layoutElements = theme.layoutElements;
  const accent = accentColor || cardBox?.accentColor || theme.colors.accent;

  // Use layoutElements if available for better theme consistency
  const bgColor = layoutElements?.background || `${accent}15`;
  const borderColor = layoutElements?.borderColor || `${accent}30`;

  return {
    // For shapes (pyramids, arrows, etc.) - use theme's layout element colors or accent
    shapeBgColor: bgColor,
    shapeBorderColor: borderColor,
    // For cards - use theme's layout element colors
    cardBgColor: bgColor,
    cardBorderColor: borderColor,
    // Accent color for bullets, icons, highlights
    accentColor: accent,
    // Text colors from theme
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
  };
}

// Theme styles type
interface ThemeStyles {
  shapeBgColor: string;
  shapeBorderColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  accentColor: string;
  titleColor: string;
  bodyColor: string;
}

interface BulletLayoutRendererProps {
  layoutId: BulletLayoutType;
  items: BulletContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  isNarrowSpace?: boolean;
  isPresenting?: boolean;
  animationKey?: string; // Stable key to prevent animation replay
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
  onReorderItems?: (fromIndex: number, toIndex: number) => void;
  isOwner?: boolean;
  isHovered?: boolean;
  // Spotlight props
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

// Helper function to get spotlight styling for content elements
const getSpotlightStyle = (itemIndex: number, spotlightIndex?: number, isSpotlightMode?: boolean): React.CSSProperties => {
  if (!isSpotlightMode || spotlightIndex === undefined) return {};
  const isHighlighted = spotlightIndex === itemIndex;
  return {
    opacity: isHighlighted ? 1 : 0.15,
    transform: isHighlighted ? 'scale(1.02)' : 'scale(0.98)',
    transition: 'all 0.4s ease-out',
    filter: isHighlighted ? 'drop-shadow(0 0 30px rgba(255,255,255,0.4))' : 'blur(2px)',
    position: 'relative' as const,
    zIndex: isHighlighted ? 10 : 1,
  };
};

export function BulletLayoutRenderer({
  layoutId,
  items,
  theme,
  accentColor = "#047857",
  className = "",
  isNarrowSpace = false,
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
  onReorderItems,
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: BulletLayoutRendererProps) {
  const displayItems = items.slice(0, 8);
  const themeStyles = getThemeStyles(theme, accentColor);

  // Spotlight is controlled only by arrow keys via props - no hover interaction
  const effectiveSpotlightIndex = isSpotlightMode && spotlightIndex !== undefined
    ? spotlightIndex
    : -1;
  
  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (!isOwner || !onReorderItems) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", idx.toString());
    setDraggedIndex(idx);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    if (!isOwner || !onReorderItems || draggedIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (idx !== draggedIndex) {
      setDragOverIndex(idx);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    if (!isOwner || !onReorderItems) return;
    e.preventDefault();
    const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(fromIdx) && fromIdx !== toIdx) {
      onReorderItems(fromIdx, toIdx);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  const canDrag = isOwner && onReorderItems && items.length > 1;
  
  const dragProps = (idx: number) => canDrag ? {
    draggable: true,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, idx),
    onDragEnd: handleDragEnd,
    onDragOver: (e: React.DragEvent) => handleDragOver(e, idx),
    onDragLeave: handleDragLeave,
    onDrop: (e: React.DragEvent) => handleDrop(e, idx),
  } : {};
  
  const getDragClasses = (idx: number) => {
    const isDragging = draggedIndex === idx;
    const isDragOver = dragOverIndex === idx;
    return `${isDragging ? "opacity-50" : ""} ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2" : ""}`;
  };

  // ---- Shared bits for the added styles (5-9) ----
  const BContainer = isPresenting ? motion.div : "div";
  const bContainerProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const BItem = isPresenting ? motion.div : "div";
  // Per-item motion: user-picked entrance style + optional click-to-reveal.
  const bItemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const spotStyle = (i: number): React.CSSProperties =>
    effectiveSpotlightIndex >= 0
      ? { opacity: effectiveSpotlightIndex === i ? 1 : 0.3, transition: "all 0.4s ease-out" }
      : {};

  const editLabel = (item: BulletContentItem, index: number, cls: string, style?: React.CSSProperties) =>
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

  const editText = (item: BulletContentItem, index: number, cls: string, style?: React.CSSProperties) =>
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

  // == BULLET-STYLE-5: DIAMOND MARKERS — airy two-column with hairline stems
  if (layoutId === "bullet-style-5") {
    const dItems = items.slice(0, 6);
    return (
      <BContainer
        className={`w-full h-full flex items-center px-2 ${className}`}
        key={animationKey}
        {...bContainerProps}
      >
        <div className="grid w-full grid-cols-2 gap-x-12 gap-y-6">
          {dItems.map((item, index) => (
            <BItem key={index} className="flex items-start gap-3.5 min-w-0" style={spotStyle(index)} {...bItemMotion(index)}>
              <span className="mt-1.5 flex items-center gap-2 shrink-0">
                <span
                  className="rotate-45"
                  style={{ width: 10, height: 10, background: themeStyles.accentColor, boxShadow: `0 0 8px ${themeStyles.accentColor}59` }}
                />
                <span className="h-px w-4" style={{ background: themeStyles.cardBorderColor }} />
              </span>
              <div className="min-w-0">
                {editLabel(item, index, "text-sm font-bold tracking-tight mb-0.5")}
                {editText(item, index, "text-xs leading-relaxed break-words")}
              </div>
            </BItem>
          ))}
        </div>
      </BContainer>
    );
  }

  // == BULLET-STYLE-6: HIGHLIGHT LINES — marker-pen sweep behind each lead-in
  if (layoutId === "bullet-style-6") {
    const hItems = items.slice(0, 5);
    return (
      <BContainer
        className={`w-full h-full flex flex-col justify-center px-2 ${className}`}
        key={animationKey}
        {...bContainerProps}
      >
        <div className="flex flex-col">
          {hItems.map((item, index) => (
            <BItem
              key={index}
              className="py-3 min-w-0"
              style={{
                borderBottom: index === hItems.length - 1 ? "none" : `1px solid ${themeStyles.cardBorderColor}`,
                ...spotStyle(index),
              }}
              {...bItemMotion(index)}
            >
              <span
                className="inline-block px-1.5 -mx-1"
                style={{ background: `linear-gradient(180deg, transparent 52%, ${themeStyles.accentColor}40 52%)` }}
              >
                {editLabel(item, index, "inline text-base font-extrabold tracking-tight")}
              </span>
              {editText(item, index, "mt-1 text-xs leading-relaxed break-words")}
            </BItem>
          ))}
        </div>
      </BContainer>
    );
  }

  // == BULLET-STYLE-7: LEAD-IN DASH — bold inline lead-ins with an accent dash
  if (layoutId === "bullet-style-7") {
    const lItems = items.slice(0, 6);
    return (
      <BContainer
        className={`w-full h-full flex items-center px-2 ${className}`}
        key={animationKey}
        {...bContainerProps}
      >
        <div className="grid w-full grid-cols-2 gap-x-12 gap-y-1">
          {lItems.map((item, index) => (
            <BItem
              key={index}
              className="flex items-baseline flex-wrap gap-x-2 py-2.5 min-w-0"
              style={{ borderBottom: `1px solid ${themeStyles.cardBorderColor}`, ...spotStyle(index) }}
              {...bItemMotion(index)}
            >
              <span className="shrink-0 self-center" style={{ width: 7, height: 7, background: themeStyles.accentColor }} />
              {editLabel(item, index, "text-sm font-bold tracking-tight")}
              <span className="font-bold" style={{ color: themeStyles.accentColor }}>—</span>
              {editText(item, index, "text-xs leading-relaxed break-words flex-1 min-w-[55%]")}
            </BItem>
          ))}
        </div>
      </BContainer>
    );
  }

  // == BULLET-STYLE-8: NOTCH CARDS — clipped corner with an accent notch fill
  if (layoutId === "bullet-style-8") {
    const nItems = items.slice(0, 6);
    const cols = nItems.length <= 3 ? nItems.length : nItems.length === 4 ? 2 : 3;
    return (
      <BContainer
        className={`w-full h-full flex items-center px-2 ${className}`}
        key={animationKey}
        {...bContainerProps}
      >
        <div className="grid w-full gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {nItems.map((item, index) => (
            <BItem key={index} className="relative min-w-0" style={spotStyle(index)} {...bItemMotion(index)}>
              <div
                className="relative h-full px-4 pt-4 pb-3.5"
                style={{
                  background: themeStyles.cardBgColor,
                  border: `1px solid ${themeStyles.cardBorderColor}`,
                  clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)",
                }}
              >
                {/* Accent fill inside the clipped corner */}
                <div
                  className="absolute top-0 right-0 pointer-events-none"
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: `24px solid ${themeStyles.accentColor}`,
                    borderLeft: "24px solid transparent",
                  }}
                />
                <span className="font-mono text-[11px] font-semibold" style={{ color: themeStyles.accentColor }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {editLabel(item, index, "mt-1 mb-1 text-sm font-bold tracking-tight")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </div>
            </BItem>
          ))}
        </div>
      </BContainer>
    );
  }

  // == BULLET-STYLE-9: KEYWORD BLOCKS — oversized keywords with accent periods
  if (layoutId === "bullet-style-9") {
    const kItems = items.slice(0, 4);
    return (
      <BContainer
        className={`w-full h-full flex items-center px-2 ${className}`}
        key={animationKey}
        {...bContainerProps}
      >
        <div className="grid w-full gap-8" style={{ gridTemplateColumns: `repeat(${kItems.length}, minmax(0, 1fr))` }}>
          {kItems.map((item, index) => (
            <BItem key={index} className="min-w-0" style={spotStyle(index)} {...bItemMotion(index)}>
              <div className="flex items-baseline">
                {editLabel(item, index, "text-xl font-extrabold tracking-tight leading-tight break-words", {
                  fontFamily: theme?.fonts.heading.family,
                })}
                <span className="text-2xl font-extrabold leading-none" style={{ color: themeStyles.accentColor }}>.</span>
              </div>
              <div className="my-2.5 h-px w-full" style={{ background: themeStyles.cardBorderColor }} />
              {editText(item, index, "text-xs leading-relaxed break-words")}
            </BItem>
          ))}
        </div>
      </BContainer>
    );
  }

  // == BULLET-STYLE-10: SLASH LIST — mono double-slash markers, indent guide
  if (layoutId === "bullet-style-10") {
    const sItems = items.slice(0, 5);
    return (
      <BContainer
        className={`w-full h-full flex flex-col justify-center px-2 ${className}`}
        key={animationKey}
        {...bContainerProps}
      >
        <div className="flex flex-col gap-4">
          {sItems.map((item, index) => (
            <BItem key={index} className="flex items-start gap-3.5 min-w-0" style={spotStyle(index)} {...bItemMotion(index)}>
              <span
                className="shrink-0 font-mono text-lg font-bold leading-tight select-none"
                style={{ color: themeStyles.accentColor }}
              >
                {"//"}
              </span>
              <div
                className="min-w-0 pl-3.5"
                style={{ borderLeft: `1px solid ${themeStyles.cardBorderColor}` }}
              >
                {editLabel(item, index, "font-mono text-sm font-bold tracking-tight mb-0.5")}
                {editText(item, index, "text-xs leading-relaxed break-words")}
              </div>
            </BItem>
          ))}
        </div>
      </BContainer>
    );
  }

  // == BULLET-STYLE-11: PILL ROWS — label pills alternating solid and soft
  if (layoutId === "bullet-style-11") {
    const pItems = items.slice(0, 6);
    return (
      <BContainer
        className={`w-full h-full flex flex-col justify-center px-2 ${className}`}
        key={animationKey}
        {...bContainerProps}
      >
        <div className="flex flex-col gap-3">
          {pItems.map((item, index) => {
            const solid = index % 2 === 0;
            return (
              <BItem key={index} className="flex items-center gap-4 min-w-0" style={spotStyle(index)} {...bItemMotion(index)}>
                <span
                  className="shrink-0 rounded-full px-3.5 py-1.5"
                  style={{
                    background: solid ? themeStyles.accentColor : `${themeStyles.accentColor}1f`,
                    border: solid ? "none" : `1px solid ${themeStyles.accentColor}59`,
                  }}
                >
                  {editLabel(item, index, "text-xs font-bold tracking-tight whitespace-nowrap", {
                    color: solid ? "#ffffff" : themeStyles.accentColor,
                  })}
                </span>
                {editText(item, index, "flex-1 min-w-0 text-xs leading-relaxed break-words")}
              </BItem>
            );
          })}
        </div>
      </BContainer>
    );
  }

  // == BULLET-STYLE-12: BASELINE NUMBERS — thin numerals on one shared rule
  if (layoutId === "bullet-style-12") {
    const nItems = items.slice(0, 5);
    return (
      <BContainer
        className={`w-full h-full flex items-center px-2 ${className}`}
        key={animationKey}
        {...bContainerProps}
      >
        <div className="relative w-full">
          {/* The continuous baseline every numeral stands on */}
          <div className="absolute left-0 right-0" style={{ top: 52, height: 2, background: themeStyles.cardBorderColor }} />
          <div className="absolute left-0" style={{ top: 52, height: 2, width: 56, background: themeStyles.accentColor }} />
          <div className="grid gap-7" style={{ gridTemplateColumns: `repeat(${nItems.length}, minmax(0, 1fr))` }}>
            {nItems.map((item, index) => (
              <BItem key={index} className="min-w-0" style={spotStyle(index)} {...bItemMotion(index)}>
                <div className="flex h-[52px] items-end">
                  <span
                    className="font-light leading-none tabular-nums"
                    style={{ fontSize: 46, color: themeStyles.accentColor, fontFamily: theme?.fonts.heading.family }}
                  >
                    {index + 1}
                  </span>
                </div>
                {editLabel(item, index, "mt-3 mb-1 text-sm font-bold tracking-tight")}
                {editText(item, index, "text-xs leading-snug break-words")}
              </BItem>
            ))}
          </div>
        </div>
      </BContainer>
    );
  }

  // == BULLET-STYLE-13: CHECKER TINTS — checkerboard of tint and hairline cells
  if (layoutId === "bullet-style-13") {
    const cItems = items.slice(0, 6);
    return (
      <BContainer
        className={`w-full h-full flex items-center px-2 ${className}`}
        key={animationKey}
        {...bContainerProps}
      >
        <div className="grid w-full grid-cols-2 gap-3">
          {cItems.map((item, index) => {
            const tinted = (Math.floor(index / 2) + (index % 2)) % 2 === 0;
            return (
              <BItem
                key={index}
                className="rounded-xl p-4 min-w-0"
                style={{
                  background: tinted ? `${themeStyles.accentColor}12` : "transparent",
                  border: `1px solid ${tinted ? `${themeStyles.accentColor}30` : themeStyles.cardBorderColor}`,
                  ...spotStyle(index),
                }}
                {...bItemMotion(index)}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-full" style={{ width: 7, height: 7, background: themeStyles.accentColor }} />
                  {editLabel(item, index, "text-sm font-bold tracking-tight")}
                </div>
                {editText(item, index, "text-xs leading-snug break-words")}
              </BItem>
            );
          })}
        </div>
      </BContainer>
    );
  }

  // Style 1: Cards with filled circle bullets, grid layout
  if (layoutId === "bullet-style-1") {
    return (
      <CardBullets
        items={displayItems}
        themeStyles={themeStyles}
        bulletType="circle"
        className={className}
        isNarrowSpace={isNarrowSpace}
        isPresenting={isPresenting}
        animationKey={animationKey}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        onDeleteItem={onDeleteItem}
        isOwner={isOwner}
        isHovered={isHovered}
        canDrag={canDrag}
        dragProps={dragProps}
        getDragClasses={getDragClasses}
        highlightedIndex={effectiveSpotlightIndex}
      />
    );
  }

  // Style 2: Simple text with filled circle bullets, no cards
  if (layoutId === "bullet-style-2") {
    return (
      <SimpleBullets
        items={displayItems}
        themeStyles={themeStyles}
        bulletType="circle"
        className={className}
        isNarrowSpace={isNarrowSpace}
        isPresenting={isPresenting}
        animationKey={animationKey}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        onDeleteItem={onDeleteItem}
        isOwner={isOwner}
        isHovered={isHovered}
        canDrag={canDrag}
        dragProps={dragProps}
        getDragClasses={getDragClasses}
        highlightedIndex={effectiveSpotlightIndex}
      />
    );
  }

  // Style 3: Checkmark bullets in cards
  if (layoutId === "bullet-style-3") {
    return (
      <CardBullets
        items={displayItems}
        themeStyles={themeStyles}
        bulletType="checkmark"
        className={className}
        isNarrowSpace={isNarrowSpace}
        isPresenting={isPresenting}
        animationKey={animationKey}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        onDeleteItem={onDeleteItem}
        isOwner={isOwner}
        isHovered={isHovered}
        canDrag={canDrag}
        dragProps={dragProps}
        getDragClasses={getDragClasses}
        highlightedIndex={effectiveSpotlightIndex}
      />
    );
  }

  // Style 4: Arrow bullets, minimal list
  return (
    <ArrowBullets
      items={displayItems}
      themeStyles={themeStyles}
      className={className}
      isNarrowSpace={isNarrowSpace}
      isPresenting={isPresenting}
      animationKey={animationKey}
      isEditing={isEditing}
      editingText={editingText}
      onStartEditLabel={onStartEditLabel}
      onStartEditText={onStartEditText}
      onUpdateLabel={onUpdateLabel}
      onUpdateText={onUpdateText}
      onFinishEditing={onFinishEditing}
      onDeleteItem={onDeleteItem}
      isOwner={isOwner}
      isHovered={isHovered}
      canDrag={canDrag}
      dragProps={dragProps}
      getDragClasses={getDragClasses}
      highlightedIndex={effectiveSpotlightIndex}
    />
  );
}

// Theme styles type
interface ThemeStyles {
  shapeBgColor: string;
  shapeBorderColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  accentColor: string;
  titleColor: string;
  bodyColor: string;
}

// Card Bullets Component (Style 1 & 3)
function CardBullets({
  items,
  themeStyles,
  bulletType,
  className,
  isNarrowSpace,
  isPresenting = false,
  animationKey,
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
  canDrag = false,
  dragProps,
  getDragClasses,
  highlightedIndex,
  onHover,
}: {
  items: BulletContentItem[];
  themeStyles: ThemeStyles;
  bulletType: "circle" | "checkmark";
  className: string;
  isNarrowSpace: boolean;
  isPresenting?: boolean;
  animationKey?: string;
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
  canDrag?: boolean;
  dragProps?: (idx: number) => Record<string, unknown>;
  getDragClasses?: (idx: number) => string;
  highlightedIndex?: number;
  onHover?: (index: number | null) => void;
}) {
  const { columns, specialLayout } = calculateBulletGridDimensions(items.length, isNarrowSpace);

  const getSpotlightStyle = (index: number) => {
    if (highlightedIndex === undefined || highlightedIndex === -1) return {};
    const isHighlighted = index === highlightedIndex;
    
    if (isHighlighted) {
      return {
        zIndex: 10,
        transform: "scale(1.02)",
        transition: "all 0.3s ease",
        opacity: 1,
        filter: "none",
      };
    }
    
    return {
      zIndex: 1,
      transform: "scale(0.98)",
      transition: "all 0.3s ease",
      opacity: 0.4,
      filter: "blur(1px)",
    };
  };

  // Special 2-1 layout for 3 items
  if (specialLayout === "2-1" && items.length === 3) {
    const Container = isPresenting ? motion.div : "div";
    const containerProps = isPresenting ? {       variants: containerVariants, 
      initial: "hidden", 
      animate: "visible" 
    } : {};
    
    return (
      <Container className={`flex flex-col gap-4 ${className}`} key={animationKey} {...containerProps}>
        {/* Top row - 2 items */}
        <div className="grid grid-cols-2 gap-4">
          {items.slice(0, 2).map((item, idx) => (
            <BulletCard
              key={idx}
              item={item}
              index={idx}
              themeStyles={themeStyles}
              bulletType={bulletType}
              isPresenting={isPresenting}
              isEditing={isEditing}
              editingText={editingText}
              onStartEditLabel={onStartEditLabel}
              onStartEditText={onStartEditText}
              onUpdateLabel={onUpdateLabel}
              onUpdateText={onUpdateText}
              onFinishEditing={onFinishEditing}
              onDeleteItem={onDeleteItem}
              isOwner={isOwner}
              isHovered={isHovered}
              canDrag={canDrag}
              dragProps={dragProps}
              getDragClasses={getDragClasses}
              style={getSpotlightStyle(idx)}
              onMouseEnter={() => onHover?.(idx)}
              onMouseLeave={() => onHover?.(null)}
            />
          ))}
        </div>
        {/* Bottom row - 1 full-width item */}
        <div>
          <BulletCard
            item={items[2]!}
            index={2}
            themeStyles={themeStyles}
            bulletType={bulletType}
            isPresenting={isPresenting}
            isEditing={isEditing}
            editingText={editingText}
            onStartEditLabel={onStartEditLabel}
            onStartEditText={onStartEditText}
            onUpdateLabel={onUpdateLabel}
            onUpdateText={onUpdateText}
            onFinishEditing={onFinishEditing}
            onDeleteItem={onDeleteItem}
            isOwner={isOwner}
            isHovered={isHovered}
            canDrag={canDrag}
            dragProps={dragProps}
            getDragClasses={getDragClasses}
            style={getSpotlightStyle(2)}
            onMouseEnter={() => onHover?.(2)}
            onMouseLeave={() => onHover?.(null)}
          />
        </div>
      </Container>
    );
  }

  // Use motion container when presenting
  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? {     variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};

  return (
    <Container
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
      key={animationKey} {...containerProps}
    >
      {items.map((item, idx) => (
        <BulletCard
          key={idx}
          item={item}
          index={idx}
          themeStyles={themeStyles}
          bulletType={bulletType}
          isPresenting={isPresenting}
          isEditing={isEditing}
          editingText={editingText}
          onStartEditLabel={onStartEditLabel}
          onStartEditText={onStartEditText}
          onUpdateLabel={onUpdateLabel}
          onUpdateText={onUpdateText}
          onFinishEditing={onFinishEditing}
          onDeleteItem={onDeleteItem}
          isOwner={isOwner}
          isHovered={isHovered}
          canDrag={canDrag}
          dragProps={dragProps}
          getDragClasses={getDragClasses}
          style={getSpotlightStyle(idx)}
          onMouseEnter={() => onHover?.(idx)}
          onMouseLeave={() => onHover?.(null)}
        />
      ))}
    </Container>
  );
}

// Single Bullet Card
function BulletCard({
  item,
  index,
  themeStyles,
  bulletType,
  isPresenting = false,
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
  canDrag = false,
  dragProps,
  getDragClasses,
  style,
  onMouseEnter,
  onMouseLeave,
}: {
  item: BulletContentItem;
  index: number;
  themeStyles: ThemeStyles;
  bulletType: "circle" | "checkmark";
  isPresenting?: boolean;
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
  canDrag?: boolean;
  dragProps?: (idx: number) => Record<string, unknown>;
  getDragClasses?: (idx: number) => string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const dragClasses = getDragClasses ? getDragClasses(index) : "";
  const props = dragProps ? dragProps(index) : {};
  
  const Wrapper = isPresenting ? motion.div : "div";
  const itemHandlers = isPresenting ? {} : { onMouseEnter, onMouseLeave };
  const wrapperProps = isPresenting ? { variants: bulletVariants } : { ...itemHandlers };
  
  // Disable hover classes during presentation
  const accentHex = /^#[0-9a-f]{6}$/i.test(themeStyles.accentColor) ? themeStyles.accentColor : null;
  const premiumBg = accentHex
    ? `radial-gradient(110% 110% at 0% 0%, ${accentHex}1f 0%, transparent 55%), ${themeStyles.cardBgColor}`
    : themeStyles.cardBgColor;
  const wrapperClassName = isPresenting
    ? `rounded-2xl p-5 relative ppt-tile ${dragClasses}`
    : `rounded-2xl p-5 relative group/drag-item ppt-tile ${dragClasses}`;

  return (
    <Wrapper
      className={wrapperClassName}
      style={{
        background: premiumBg,
        border: `1px solid ${themeStyles.cardBorderColor}`,
        cursor: canDrag && !isPresenting ? "grab" : "default",
        ...style,
      }}
      {...wrapperProps}
      {...(isPresenting ? {} : props)}
    >
      {/* Drag handle */}
      {canDrag && !isPresenting && (
        <div 
          className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag-item:opacity-60 transition-opacity cursor-grab z-20"
          title="Drag to reorder"
        >
          <GripVertical size={14} className="text-current" />
        </div>
      )}
      <div className="flex items-start gap-3">
        {/* Bullet */}
        <div className="flex-shrink-0 mt-1">
          {bulletType === "circle" ? (
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: themeStyles.accentColor }}
            />
          ) : (
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${themeStyles.accentColor}20` }}
            >
              <Check size={12} style={{ color: themeStyles.accentColor }} strokeWidth={3} />
            </div>
          )}
        </div>
        {/* Content */}
        <div className="flex-1">
          {item.label && (
            onStartEditLabel ? (
              <EditableText
                value={item.label}
                isEditing={isEditing && editingText?.field === `content-label-${index}`}
                onStartEdit={() => onStartEditLabel(index)}
                onChange={(val) => onUpdateLabel?.(index, val)}
                onFinish={onFinishEditing || (() => {})}
                onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                className="text-lg font-bold tracking-tight mb-2"
                style={{ color: themeStyles.titleColor }}
                isOwner={isOwner}
                isHovered={isHovered}
              />
            ) : (
              <h3 className="text-lg font-bold tracking-tight mb-2" style={{ color: themeStyles.titleColor }}>
                {item.label}
              </h3>
            )
          )}
          {onStartEditText ? (
            <EditableText
              value={item.text}
              isEditing={isEditing && editingText?.field === `content-text-${index}`}
              onStartEdit={() => onStartEditText(index)}
              onChange={(val) => onUpdateText?.(index, val)}
              onFinish={onFinishEditing || (() => {})}
              onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
              className="text-sm leading-relaxed"
              style={{ color: themeStyles.bodyColor }}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: themeStyles.bodyColor }}>
              {item.text}
            </p>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

// Simple Bullets Component (Style 2)
function SimpleBullets({
  items,
  themeStyles,
  bulletType,
  className,
  isNarrowSpace,
  isPresenting = false,
  animationKey,
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
  canDrag = false,
  dragProps,
  getDragClasses,
  highlightedIndex,
  onHover,
}: {
  items: BulletContentItem[];
  themeStyles: ThemeStyles;
  bulletType: "circle";
  className: string;
  isNarrowSpace: boolean;
  isPresenting?: boolean;
  animationKey?: string;
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
  canDrag?: boolean;
  dragProps?: (idx: number) => Record<string, unknown>;
  getDragClasses?: (idx: number) => string;
  highlightedIndex?: number;
  onHover?: (index: number | null) => void;
}) {
  const getSpotlightStyle = (index: number) => {
    if (highlightedIndex === undefined || highlightedIndex === -1) return {};
    const isHighlighted = index === highlightedIndex;
    
    if (isHighlighted) {
      return {
        zIndex: 10,
        transform: "translateX(8px)",
        transition: "all 0.3s ease",
        opacity: 1,
        filter: "none",
      };
    }
    
    return {
      zIndex: 1,
      transition: "all 0.3s ease",
      opacity: 0.4,
      filter: "blur(1px)",
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? {     variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};

  // For 3 items: 2 columns on top row, 1 on bottom
  if (items.length === 3 && !isNarrowSpace) {
    return (
      <Container className={`flex flex-col gap-6 ${className}`} key={animationKey} {...containerProps}>
        {/* Top row - 2 items */}
        <div className="grid grid-cols-2 gap-8">
          {items.slice(0, 2).map((item, idx) => (
            <SimpleBulletItem
              key={idx}
              item={item}
              index={idx}
              themeStyles={themeStyles}
              isPresenting={isPresenting}
              isEditing={isEditing}
              editingText={editingText}
              onStartEditLabel={onStartEditLabel}
              onStartEditText={onStartEditText}
              onUpdateLabel={onUpdateLabel}
              onUpdateText={onUpdateText}
              onFinishEditing={onFinishEditing}
              onDeleteItem={onDeleteItem}
              isOwner={isOwner}
              isHovered={isHovered}
              canDrag={canDrag}
              dragProps={dragProps}
              getDragClasses={getDragClasses}
              style={getSpotlightStyle(idx)}
              onMouseEnter={() => onHover?.(idx)}
              onMouseLeave={() => onHover?.(null)}
            />
          ))}
        </div>
        {/* Bottom row - 1 item */}
        <div>
          <SimpleBulletItem
            item={items[2]!}
            index={2}
            themeStyles={themeStyles}
            isPresenting={isPresenting}
            isEditing={isEditing}
            editingText={editingText}
            onStartEditLabel={onStartEditLabel}
            onStartEditText={onStartEditText}
            onUpdateLabel={onUpdateLabel}
            onUpdateText={onUpdateText}
            onFinishEditing={onFinishEditing}
            onDeleteItem={onDeleteItem}
            isOwner={isOwner}
            isHovered={isHovered}
            canDrag={canDrag}
            dragProps={dragProps}
            getDragClasses={getDragClasses}
            style={getSpotlightStyle(2)}
            onMouseEnter={() => onHover?.(2)}
            onMouseLeave={() => onHover?.(null)}
          />
        </div>
      </Container>
    );
  }

  // Default: columns based on item count
  const columns = isNarrowSpace ? 1 : items.length <= 2 ? items.length : 2;

  return (
    <Container
      className={`grid gap-6 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
      variants={containerProps.variants}
      initial={containerProps.initial}
      animate={containerProps.animate}
    >
      {items.map((item, idx) => (
        <SimpleBulletItem
          key={idx}
          item={item}
          index={idx}
          themeStyles={themeStyles}
          isPresenting={isPresenting}
          isEditing={isEditing}
          editingText={editingText}
          onStartEditLabel={onStartEditLabel}
          onStartEditText={onStartEditText}
          onUpdateLabel={onUpdateLabel}
          onUpdateText={onUpdateText}
          onFinishEditing={onFinishEditing}
          onDeleteItem={onDeleteItem}
          isOwner={isOwner}
          isHovered={isHovered}
          canDrag={canDrag}
          dragProps={dragProps}
          getDragClasses={getDragClasses}
          style={getSpotlightStyle(idx)}
          onMouseEnter={() => onHover?.(idx)}
          onMouseLeave={() => onHover?.(null)}
        />
      ))}
    </Container>
  );
}

// Single Simple Bullet Item
function SimpleBulletItem({
  item,
  index,
  themeStyles,
  isPresenting = false,
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
  canDrag = false,
  dragProps,
  getDragClasses,
  style,
  onMouseEnter,
  onMouseLeave,
}: {
  item: BulletContentItem;
  index: number;
  themeStyles: ThemeStyles;
  isPresenting?: boolean;
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
  canDrag?: boolean;
  dragProps?: (idx: number) => Record<string, unknown>;
  getDragClasses?: (idx: number) => string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const dragClasses = getDragClasses ? getDragClasses(index) : "";
  const props = dragProps ? dragProps(index) : {};
  
  const Wrapper = isPresenting ? motion.div : "div";
  const itemHandlers = isPresenting ? {} : { onMouseEnter, onMouseLeave };
  const wrapperProps = isPresenting ? { variants: bulletVariants } : { ...itemHandlers };
  
  // Disable hover classes during presentation
  const wrapperClassName = isPresenting 
    ? `flex items-start gap-3 relative ${dragClasses}`
    : `flex items-start gap-3 relative group/drag-item ${dragClasses}`;
  
  return (
    <Wrapper 
      className={wrapperClassName}
      style={{ 
        cursor: canDrag && !isPresenting ? "grab" : "default",
        ...style 
      }}
      {...wrapperProps}
      {...(isPresenting ? {} : props)}
    >
      {/* Drag handle */}
      {canDrag && !isPresenting && (
        <div 
          className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag-item:opacity-60 transition-opacity cursor-grab z-20"
          title="Drag to reorder"
        >
          <GripVertical size={14} className="text-current" />
        </div>
      )}
      {/* Bullet */}
      <div className="flex-shrink-0 mt-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: themeStyles.accentColor }}
        />
      </div>
      {/* Content */}
      <div className="flex-1">
        {item.label && (
          onStartEditLabel ? (
            <EditableText
              value={item.label}
              isEditing={isEditing && editingText?.field === `content-label-${index}`}
              onStartEdit={() => onStartEditLabel(index)}
              onChange={(val) => onUpdateLabel?.(index, val)}
              onFinish={onFinishEditing || (() => {})}
              onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
              className="text-lg font-bold tracking-tight mb-1"
              style={{ color: themeStyles.titleColor }}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ) : (
            <h3 className="text-lg font-bold tracking-tight mb-1" style={{ color: themeStyles.titleColor }}>
              {item.label}
            </h3>
          )
        )}
        {onStartEditText ? (
          <EditableText
            value={item.text}
            isEditing={isEditing && editingText?.field === `content-text-${index}`}
            onStartEdit={() => onStartEditText(index)}
            onChange={(val) => onUpdateText?.(index, val)}
            onFinish={onFinishEditing || (() => {})}
            onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
            className="text-sm leading-relaxed"
            style={{ color: themeStyles.bodyColor }}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        ) : (
          <p className="text-sm leading-relaxed" style={{ color: themeStyles.bodyColor }}>
            {item.text}
          </p>
        )}
      </div>
    </Wrapper>
  );
}

// Arrow Bullets Component (Style 4)
function ArrowBullets({
  items,
  themeStyles,
  className,
  isNarrowSpace,
  isPresenting = false,
  animationKey,
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
  canDrag = false,
  dragProps,
  getDragClasses,
  highlightedIndex,
  onHover,
}: {
  items: BulletContentItem[];
  themeStyles: ThemeStyles;
  className: string;
  isNarrowSpace: boolean;
  isPresenting?: boolean;
  animationKey?: string;
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
  canDrag?: boolean;
  dragProps?: (idx: number) => Record<string, unknown>;
  getDragClasses?: (idx: number) => string;
  highlightedIndex?: number;
  onHover?: (index: number | null) => void;
}) {
  const getSpotlightStyle = (index: number) => {
    if (highlightedIndex === undefined || highlightedIndex === -1) return {};
    const isHighlighted = index === highlightedIndex;
    
    if (isHighlighted) {
      return {
        zIndex: 10,
        transform: "translateX(8px)",
        transition: "all 0.3s ease",
        opacity: 1,
        filter: "none",
      };
    }
    
    return {
      zIndex: 1,
      transition: "all 0.3s ease",
      opacity: 0.4,
      filter: "blur(1px)",
    };
  };

  // Vertical list layout
  const columns = isNarrowSpace ? 1 : items.length <= 4 ? 1 : 2;

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? {     variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};
  
  const ItemWrapper = isPresenting ? motion.div : "div";

  return (
    <Container
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
      key={animationKey} {...containerProps}
    >
      {items.map((item, idx) => {
        const dragClasses = getDragClasses ? getDragClasses(idx) : "";
        const props = dragProps ? dragProps(idx) : {};
        
        const spotlightStyle = getSpotlightStyle(idx);
        // Disable hover handlers during presentation
        const itemHandlers = isPresenting ? {} : { 
          onMouseEnter: () => onHover?.(idx),
          onMouseLeave: () => onHover?.(null)
        };
        const itemProps = isPresenting ? { 
          variants: bulletVariants,
        } : { ...itemHandlers };
        
        // Disable hover classes during presentation
        const wrapperClassName = isPresenting 
          ? `flex items-start gap-3 relative ${dragClasses}`
          : `flex items-start gap-3 relative group/drag-item ${dragClasses}`;
        
        return (
          <ItemWrapper 
            key={idx} 
            className={wrapperClassName}
            style={{ 
              cursor: canDrag && !isPresenting ? "grab" : "default",
              ...spotlightStyle
            }}
            {...itemProps}
            {...(isPresenting ? {} : props)}
          >
            {/* Drag handle */}
            {canDrag && !isPresenting && (
              <div 
                className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag-item:opacity-60 transition-opacity cursor-grab z-20"
                title="Drag to reorder"
              >
                <GripVertical size={14} className="text-current" />
              </div>
            )}
            {/* Arrow bullet */}
            <div className="flex-shrink-0 mt-1">
              <ChevronRight size={18} style={{ color: themeStyles.accentColor }} strokeWidth={2.5} />
            </div>
            {/* Content */}
            <div className="flex-1">
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                    onStartEdit={() => onStartEditLabel(idx)}
                    onChange={(val) => onUpdateLabel?.(idx, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                    className="text-base font-bold tracking-tight mb-1"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-base font-bold tracking-tight mb-1" style={{ color: themeStyles.titleColor }}>
                    {item.label}
                  </h3>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${idx}`}
                  onStartEdit={() => onStartEditText(idx)}
                  onChange={(val) => onUpdateText?.(idx, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </div>
          </ItemWrapper>
        );
      })}
    </Container>
  );
}

export default BulletLayoutRenderer;
