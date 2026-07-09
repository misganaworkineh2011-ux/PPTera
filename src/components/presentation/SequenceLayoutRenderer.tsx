"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type {
  SequenceLayout,
  SequenceLayoutType,
  SequenceContentItem,
} from "~/lib/layouts/content/sequence";
import {
  getSequenceLayoutById,
  getBaseSequenceStyles,
  getRecommendedSequenceLayout,
} from "~/lib/layouts/content/sequence";
import EditableText from "./EditableText";
import { alpha } from "./PremiumComponents";
import { CONTENT_FONT_SIZE } from "./slide-typography";
import { containerVariantsFor, itemMotionProps } from "./item-animations";

// Animation variants for staggered sequence animations
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

const sequenceVariants = {
  hidden: { 
    opacity: 0, 
    y: 15,
    scale: 0.97,
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface SequenceLayoutRendererProps {
  layoutId?: SequenceLayoutType;
  items: SequenceContentItem[];
  theme: Theme;
  compact?: boolean;
  showIcons?: boolean;
  className?: string;
  isNarrowSpace?: boolean; // true when image is left/right, false when top/bottom
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
    filter: isHighlighted ? 'drop-shadow(0 0 30px rgba(255,255,255,0.4))' : 'none',
    position: 'relative' as const,
    zIndex: isHighlighted ? 10 : 1,
  };
};

export default function SequenceLayoutRenderer({
  layoutId,
  items,
  theme,
  compact = false,
  showIcons = true,
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
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: SequenceLayoutRendererProps) {
  const [hoveredBoxIndex, setHoveredBoxIndex] = useState<number | null>(null);

  // Determine effective spotlight state (prop or local hover)
  // Apply spotlight effects in editor mode too when hovering
  const effectiveIsSpotlightMode = isSpotlightMode;
  const effectiveSpotlightIndex = spotlightIndex;

  const getStyle = (index: number) => {
    const spotlightStyle = getSpotlightStyle(index, effectiveSpotlightIndex ?? undefined, effectiveIsSpotlightMode);
    return spotlightStyle;
  };
  
  const layout = layoutId
    ? getSequenceLayoutById(layoutId) || getRecommendedSequenceLayout(items.length, isNarrowSpace)
    : getRecommendedSequenceLayout(items.length, isNarrowSpace);

  if (!layout || items.length === 0) return null;

  const baseStyles = getBaseSequenceStyles(theme);

  // Container and item wrapper for animations
  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? {
    variants: containerVariantsFor(itemAnimation),
    initial: "hidden",
    animate: "visible"
  } : {};
  const SItem = isPresenting ? motion.div : "div";
  // Per-item motion: user-picked entrance style + optional click-to-reveal.
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);
  const accent = baseStyles.dotColor;
  const surface = theme.cardBox?.background || theme.colors.surface || "rgba(255,255,255,0.05)";
  const cardBorder = theme.cardBox?.borderColor || theme.colors.border || "rgba(0,0,0,0.08)";
  const pad2 = (n: number) => String(n).padStart(2, "0");

  // Render dot or icon marker
  const renderMarker = (item: SequenceContentItem, index: number) => {
    const markerSize = compact ? "12px" : "16px";
    const iconSize = compact ? "24px" : "32px";
    
    // Accent halo ring + soft glow (was a hardcoded white halo, which drew
    // fuzzy bright rings on dark themes)
    const markerGlow = `0 0 0 4px ${alpha(baseStyles.dotColor, "1f")}, 0 3px 10px ${alpha(baseStyles.dotColor, "4d")}`;

    if (item.icon && showIcons) {
      return (
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0 z-10"
          style={{
            background: `linear-gradient(135deg, ${baseStyles.dotColor}, ${alpha(baseStyles.dotColor, "cc")})`,
            width: iconSize,
            height: iconSize,
            color: "white",
            fontSize: compact ? "14px" : "18px",
            boxShadow: markerGlow,
          }}
        >
          {item.icon}
        </div>
      );
    }

    // Default dot
    return (
      <div
        className="rounded-full flex-shrink-0 z-10"
        style={{
          backgroundColor: baseStyles.dotColor,
          width: markerSize,
          height: markerSize,
          boxShadow: markerGlow,
        }}
      />
    );
  };

  // Render content item (title + text)
  const renderContent = (item: SequenceContentItem, index: number, align: "left" | "center" | "right" = "left") => {
    const isCenter = align === "center";
    const isRight = align === "right";
    
    return (
      <div className={`flex flex-col ${isCenter ? "items-center text-center" : isRight ? "items-end text-right" : "items-start text-left"}`}>
        {item.label && (
          onStartEditLabel ? (
            <EditableText
              value={item.label}
              isEditing={isEditing && editingText?.field === `content-label-${index}`}
              onStartEdit={() => onStartEditLabel(index)}
              onChange={(val) => onUpdateLabel?.(index, val)}
              onFinish={onFinishEditing || (() => {})}
              onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
              className="font-serif mb-2"
              style={{
                color: baseStyles.textColor,
                fontSize: compact ? "1.1rem" : "1.35rem",
                fontWeight: "600",
                textAlign: align,
                width: "100%",
              }}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ) : (
            <h3
              className="font-serif mb-2"
              style={{
                color: baseStyles.textColor,
                fontSize: compact ? "1.1rem" : "1.35rem",
                fontWeight: "600",
                width: "100%",
              }}
            >
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
            style={{
              color: baseStyles.dimColor,
              fontSize: compact ? CONTENT_FONT_SIZE.compact : CONTENT_FONT_SIZE.normal,
              lineHeight: 1.6,
              textAlign: align,
              width: "100%",
            }}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        ) : (
          <p
            style={{
              color: baseStyles.dimColor,
              fontSize: compact ? "0.85rem" : "0.95rem",
              lineHeight: 1.6,
              width: "100%",
            }}
          >
            {item.text}
          </p>
        )}
      </div>
    );
  };

  // == SEQUENCE-STYLE-5: WAVE FLOW — nodes riding a flowing wave connector
  if (layout.id === "sequence-style-5") {
    const wItems = items.slice(0, 5);
    const n = wItems.length;
    const xFor = (i: number) => ((i + 0.5) / n) * 1280;
    const yFor = (i: number) => (i % 2 === 0 ? 70 : 175);
    let d = `M ${xFor(0)} ${yFor(0)}`;
    for (let i = 1; i < n; i++) {
      const x0 = xFor(i - 1);
      const x1 = xFor(i);
      const dx = (x1 - x0) / 2.4;
      d += ` C ${x0 + dx} ${yFor(i - 1)}, ${x1 - dx} ${yFor(i)}, ${x1} ${yFor(i)}`;
    }
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...containerProps}>
        <div className="relative mb-4" style={{ height: 240 }}>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1280 240" preserveAspectRatio="none" aria-hidden>
            <path d={d} fill="none" stroke={alpha(accent, "21")} strokeWidth={13} strokeLinecap="round" />
            <path d={d} fill="none" stroke={accent} strokeWidth={2.5} strokeLinecap="round" />
          </svg>
          {wItems.map((_, index) => (
            <div
              key={index}
              className="absolute z-10 flex items-center justify-center rounded-full font-bold tabular-nums"
              style={{
                left: `${((index + 0.5) / n) * 100}%`,
                top: `${(yFor(index) / 240) * 100}%`,
                transform: "translate(-50%, -50%)",
                width: 34,
                height: 34,
                fontSize: 13,
                background: `linear-gradient(135deg, ${accent}, ${alpha(accent, "cc")})`,
                color: "#ffffff",
                boxShadow: `0 0 0 4px ${surface}, 0 3px 10px ${alpha(accent, "4d")}`,
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-4">
          {wItems.map((item, index) => (
            <SItem key={index} className="min-w-0 flex-1" style={getStyle(index)} {...itemMotion(index)}>
              {renderContent(item, index, "center")}
            </SItem>
          ))}
        </div>
      </Container>
    );
  }

  // == SEQUENCE-STYLE-6: HOP ARCS — dotted arcs hopping node to node
  if (layout.id === "sequence-style-6") {
    const hItems = items.slice(0, 5);
    const n = hItems.length;
    const xFor = (i: number) => ((i + 0.5) / n) * 1280;
    const BASE = 96;
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...containerProps}>
        <div className="relative mb-5" style={{ height: 118 }}>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1280 118" preserveAspectRatio="none" aria-hidden>
            <line x1={40} y1={BASE} x2={1240} y2={BASE} stroke={alpha(accent, "33")} strokeWidth={2} />
            {hItems.slice(0, -1).map((_, i) => {
              const x0 = xFor(i);
              const x1 = xFor(i + 1);
              return (
                <g key={i}>
                  <path
                    d={`M ${x0} ${BASE - 14} Q ${(x0 + x1) / 2} 6, ${x1 - 26} ${BASE - 22}`}
                    fill="none"
                    stroke={accent}
                    strokeWidth={2.5}
                    strokeDasharray="7 7"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${x1 - 30},${BASE - 34} ${x1 - 12},${BASE - 20} ${x1 - 34},${BASE - 12}`}
                    fill={accent}
                  />
                </g>
              );
            })}
          </svg>
          {hItems.map((_, index) => (
            <div
              key={index}
              className="absolute z-10 flex items-center justify-center rounded-full font-bold tabular-nums"
              style={{
                left: `${((index + 0.5) / n) * 100}%`,
                top: `${(BASE / 118) * 100}%`,
                transform: "translate(-50%, -50%)",
                width: 30,
                height: 30,
                fontSize: 12,
                background: surface,
                border: `3px solid ${accent}`,
                color: baseStyles.textColor,
                boxShadow: `0 0 0 4px ${alpha(accent, "14")}`,
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-4">
          {hItems.map((item, index) => (
            <SItem key={index} className="min-w-0 flex-1" style={getStyle(index)} {...itemMotion(index)}>
              {renderContent(item, index, "center")}
            </SItem>
          ))}
        </div>
      </Container>
    );
  }

  // == SEQUENCE-STYLE-7: PAPER CHAIN — cards joined by interlocked rings
  if (layout.id === "sequence-style-7") {
    const cItems = items.slice(0, 4);
    return (
      <Container className={`w-full h-full flex items-center ${className}`} key={animationKey} {...containerProps}>
        <div className="flex w-full items-stretch">
          {cItems.map((item, index) => (
            <React.Fragment key={index}>
              <SItem
                className="min-w-0 flex-1 rounded-2xl p-4"
                style={{ background: surface, border: `1px solid ${cardBorder}`, ...getStyle(index) }}
                {...itemMotion(index)}
              >
                <span
                  className="mb-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold tabular-nums"
                  style={{ background: alpha(accent, "1f"), color: accent, border: `1px solid ${alpha(accent, "40")}` }}
                >
                  {index + 1}
                </span>
                {renderContent(item, index, "left")}
              </SItem>
              {index < cItems.length - 1 && (
                <div className="flex shrink-0 items-center px-1.5" aria-hidden>
                  <span className="block h-4 w-4 rounded-full" style={{ border: `3px solid ${accent}` }} />
                  <span className="-ml-1.5 mt-2 block h-4 w-4 rounded-full" style={{ border: `3px solid ${alpha(accent, "66")}` }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Container>
    );
  }

  // == SEQUENCE-STYLE-8: HANDOFF LANES — indented bars passing the baton
  if (layout.id === "sequence-style-8") {
    const lItems = items.slice(0, 5);
    const n = lItems.length;
    return (
      <Container className={`w-full h-full flex flex-col justify-center gap-2.5 px-2 ${className}`} key={animationKey} {...containerProps}>
        {lItems.map((item, index) => {
          const indent = n <= 1 ? 0 : (index * 50) / (n - 1);
          return (
            <SItem
              key={index}
              className="relative min-w-0 rounded-xl px-4 py-2.5"
              style={{
                marginLeft: `${indent}%`,
                width: "50%",
                minWidth: "42%",
                background: surface,
                border: `1px solid ${cardBorder}`,
                borderLeft: `3px solid ${accent}`,
                ...getStyle(index),
              }}
              {...itemMotion(index)}
            >
              {/* Corner connector picking up from the lane above */}
              {index > 0 && (
                <div
                  className="absolute rounded-bl-lg"
                  style={{ left: -16, top: -12, width: 14, height: 26, borderLeft: `2px solid ${alpha(accent, "59")}`, borderBottom: `2px solid ${alpha(accent, "59")}` }}
                  aria-hidden
                />
              )}
              <span className="font-mono text-[10px] font-bold tracking-[0.2em]" style={{ color: accent }}>
                {pad2(index + 1)}
              </span>
              {renderContent(item, index, "left")}
            </SItem>
          );
        })}
      </Container>
    );
  }

  // == SEQUENCE-STYLE-9: BREADCRUMB TRAIL — chips with accent separators
  if (layout.id === "sequence-style-9") {
    const bItems = items.slice(0, 6);
    return (
      <Container className={`w-full h-full flex items-center justify-center ${className}`} key={animationKey} {...containerProps}>
        <div className="flex flex-wrap items-center justify-center gap-y-5">
          {bItems.map((item, index) => (
            <React.Fragment key={index}>
              <SItem
                className="min-w-0 max-w-[30%] rounded-xl px-4 py-3"
                style={{
                  background: alpha(accent, "0f"),
                  border: `1px solid ${alpha(accent, "26")}`,
                  ...getStyle(index),
                }}
                {...itemMotion(index)}
              >
                <span className="font-mono text-[10px] font-bold tracking-[0.2em]" style={{ color: accent }}>
                  {pad2(index + 1)}
                </span>
                {renderContent(item, index, "left")}
              </SItem>
              {index < bItems.length - 1 && (
                <span className="px-2.5 text-xl font-bold" style={{ color: alpha(accent, "8c") }} aria-hidden>
                  ›
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </Container>
    );
  }

  // == SEQUENCE-STYLE-10: FOLD RIBBON — folded facets alternating light/dark
  if (layout.id === "sequence-style-10") {
    const fItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...containerProps}>
        <div className="mb-6 flex" aria-hidden>
          {fItems.map((_, index) => {
            const up = index % 2 === 0;
            return (
              <div
                key={index}
                className="flex h-14 flex-1 items-center justify-center"
                style={{
                  background: up
                    ? `linear-gradient(180deg, ${accent}, ${alpha(accent, "d9")})`
                    : `linear-gradient(180deg, ${alpha(accent, "8c")}, ${alpha(accent, "66")})`,
                  clipPath: up
                    ? "polygon(0 0, 100% 16%, 100% 100%, 0 84%)"
                    : "polygon(0 16%, 100% 0, 100% 84%, 0 100%)",
                }}
              >
                <span className="text-base font-extrabold tabular-nums text-white">{pad2(index + 1)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between gap-4">
          {fItems.map((item, index) => (
            <SItem key={index} className="min-w-0 flex-1" style={getStyle(index)} {...itemMotion(index)}>
              {renderContent(item, index, "center")}
            </SItem>
          ))}
        </div>
      </Container>
    );
  }

  // == SEQUENCE-STYLE-11: SIGNAL PATH — dashed line through amplifier nodes
  if (layout.id === "sequence-style-11") {
    const sgItems = items.slice(0, 5);
    return (
      <Container className={`w-full h-full flex flex-col justify-center ${className}`} key={animationKey} {...containerProps}>
        <div className="relative mb-6" style={{ height: 58 }}>
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2" style={{ borderTop: `2px dashed ${alpha(accent, "59")}` }} />
          <div className="flex h-full">
            {sgItems.map((_, index) => (
              <div key={index} className="relative flex flex-1 items-center justify-center">
                <span className="absolute -top-1 font-mono text-[10px] font-bold tracking-[0.25em]" style={{ color: accent }}>
                  {pad2(index + 1)}
                </span>
                {/* Pulse dot feeding the amplifier */}
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${alpha(accent, "8c")}` }} />
                {/* Amplifier triangle */}
                <span
                  aria-hidden
                  style={{
                    width: 0,
                    height: 0,
                    borderTop: "10px solid transparent",
                    borderBottom: "10px solid transparent",
                    borderLeft: `16px solid ${accent}`,
                    filter: `drop-shadow(0 2px 6px ${alpha(accent, "40")})`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between gap-4">
          {sgItems.map((item, index) => (
            <SItem key={index} className="min-w-0 flex-1" style={getStyle(index)} {...itemMotion(index)}>
              {renderContent(item, index, "center")}
            </SItem>
          ))}
        </div>
      </Container>
    );
  }

  // Style 1: Horizontal Top Process
  if (layout.id === "sequence-style-1") {
    return (
      <Container className={className} style={{ width: "100%" }} key={animationKey} {...containerProps}>
        {/* Top horizontal line */}
        <div className="relative mb-8 pt-4">
          <div
            className="absolute top-4 left-0 right-0"
            style={{
              height: "2px",
              backgroundColor: `${baseStyles.lineColor}40`, // More subtle line
            }}
          />
          <div className="relative flex justify-between items-start">
            {items.map((item, index) => {
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);
              
              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper key={index} className="flex flex-col items-center flex-1" {...itemProps}>
                  {/* Marker on line */}
                  <div className="relative z-10 -mt-[calc(8px)]"> {/* Half height offset */}
                    {renderMarker(item, index)}
                  </div>
                  
                  {/* Vertical connector line */}
                  <div 
                    className="w-px h-8 mb-4" 
                    style={{ backgroundColor: `${baseStyles.lineColor}40` }}
                  />
                  
                  {/* Content */}
                  <div className="px-2 w-full">
                    {renderContent(item, index, "center")}
                  </div>
                </ItemWrapper>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  // Style 2: Horizontal Timeline (centered with vertical connectors)
  // Content alternates above and below the center line
  if (layout.id === "sequence-style-2") {
    return (
      <Container className={className} style={{ width: "100%" }} key={animationKey} {...containerProps}>
        {/* Container with grid layout for precise positioning */}
        <div className="relative w-full">
          
          {/* TOP ROW - Content that appears ABOVE the line */}
          <div className="flex justify-between w-full mb-4">
            {items.map((item, index) => {
              const isAbove = index % 2 === 0;
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);

              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper key={index} className="flex-1 px-2" {...itemProps}>
                  {isAbove ? (
                    <div className="text-center">
                      {renderContent(item, index, "center")}
                    </div>
                  ) : (
                    <div className="h-full" /> // Empty spacer for items below the line
                  )}
                </ItemWrapper>
              );
            })}
          </div>

          {/* MIDDLE ROW - The horizontal line with dots and vertical connectors */}
          <div className="relative flex justify-between items-center w-full py-2">
            {/* The horizontal line */}
            <div
              className="absolute top-1/2 left-0 right-0 -translate-y-1/2"
              style={{
                height: "2px",
                backgroundColor: `${baseStyles.lineColor}40`,
              }}
            />
            
            {/* Dots and vertical connectors */}
            {items.map((item, index) => {
              const isAbove = index % 2 === 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center relative">
                  {/* Vertical connector going UP (for content above) */}
                  {isAbove && (
                    <div 
                      className="w-px absolute bottom-full mb-0"
                      style={{ 
                        backgroundColor: `${baseStyles.lineColor}40`,
                        height: "24px",
                      }}
                    />
                  )}
                  
                  {/* The dot marker */}
                  <div className="relative z-10">
                    {renderMarker(item, index)}
                  </div>
                  
                  {/* Vertical connector going DOWN (for content below) */}
                  {!isAbove && (
                    <div 
                      className="w-px absolute top-full mt-0"
                      style={{ 
                        backgroundColor: `${baseStyles.lineColor}40`,
                        height: "24px",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM ROW - Content that appears BELOW the line */}
          <div className="flex justify-between w-full mt-4">
            {items.map((item, index) => {
              const isAbove = index % 2 === 0;
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);

              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper key={index} className="flex-1 px-2" {...itemProps}>
                  {!isAbove ? (
                    <div className="text-center">
                      {renderContent(item, index, "center")}
                    </div>
                  ) : (
                    <div className="h-full" /> // Empty spacer for items above the line
                  )}
                </ItemWrapper>
              );
            })}
          </div>
          
        </div>
      </Container>
    );
  }

  // Style 3: Vertical Steps (line on left with horizontal connectors)
  if (layout.id === "sequence-style-3") {
    const dotSize = compact ? 12 : 16;
    const connectorLength = 32; // Length of horizontal connector
    const gapAfterConnector = 16; // Gap between connector and content
    const lineLeftPosition = 20; // Fixed position for the vertical line from left edge
    
    return (
      <Container className={className} style={{ width: "100%" }} key={animationKey} {...containerProps}>
        <div className="relative" style={{ paddingLeft: `${lineLeftPosition + dotSize/2 + connectorLength + gapAfterConnector}px` }}>
          {/* Vertical line - positioned to pass through dot centers */}
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: `${lineLeftPosition + dotSize/2 - 1}px`, // Center of dots
              width: "2px",
              backgroundColor: `${baseStyles.lineColor}40`,
            }}
          />
          
          {/* Content items with dots */}
          <div className="flex flex-col gap-10">
            {items.map((item, index) => {
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);

              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper key={index} className="relative flex items-start" {...itemProps}>
                  {/* Dot - positioned on the vertical line, aligned with title text */}
                  <div 
                    className="absolute z-10"
                    style={{
                      left: `-${dotSize/2 + connectorLength + gapAfterConnector}px`,
                      top: "8px", // Aligned with title text baseline
                    }}
                  >
                    {renderMarker(item, index)}
                  </div>
                  
                  {/* Horizontal connector line from dot to gap */}
                  <div 
                    className="absolute"
                    style={{ 
                      left: `-${connectorLength + gapAfterConnector}px`,
                      top: `${8 + dotSize/2 - 1}px`, // Center of dot (adjusted for new top position)
                      width: `${connectorLength}px`,
                      height: "2px",
                      backgroundColor: `${baseStyles.lineColor}40`,
                    }}
                  />

                  {/* Content - title aligns with dot */}
                  <div className="w-full">
                    {renderContent(item, index, "left")}
                  </div>
                </ItemWrapper>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  // Style 4: Vertical Alternating (line in center with horizontal connectors)
  if (layout.id === "sequence-style-4") {
    const dotSize = compact ? 12 : 16;
    const connectorLength = 32; // Length of horizontal connector
    const gapAfterConnector = 16; // Gap between connector and content
    
    return (
      <Container className={className} style={{ width: "100%" }} key={animationKey} {...containerProps}>
        <div className="relative w-full">
          {/* Center vertical line - passes through all dots */}
          <div
            className="absolute top-0 bottom-0 left-1/2"
            style={{
              width: "2px",
              backgroundColor: `${baseStyles.lineColor}40`,
              transform: "translateX(-50%)",
            }}
          />
          
          {/* Items with alternating layout */}
          <div className="relative w-full flex flex-col gap-10">
            {items.map((item, index) => {
              const isLeft = index % 2 === 0;
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);

              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper
                  key={index}
                  className="relative flex items-start w-full"
                  {...itemProps}
                >
                  {/* Left content (for even indices) */}
                  <div className="flex-1" style={{ paddingRight: `${connectorLength + gapAfterConnector + dotSize/2}px` }}>
                    {isLeft ? (
                      <div className="text-right">
                        {renderContent(item, index, "right")}
                      </div>
                    ) : (
                      <div /> // Empty spacer
                    )}
                  </div>

                  {/* Center: Dot on the line with horizontal connectors */}
                  <div 
                    className="absolute left-1/2 z-10"
                    style={{
                      transform: "translateX(-50%)",
                      top: "8px", // Aligned with title text baseline
                    }}
                  >
                    {/* Horizontal connector to left */}
                    {isLeft && (
                      <div 
                        className="absolute right-full"
                        style={{ 
                          width: `${connectorLength}px`,
                          height: "2px",
                          backgroundColor: `${baseStyles.lineColor}40`,
                          top: `${dotSize/2 - 1}px`,
                        }}
                      />
                    )}
                    
                    {/* The dot */}
                    <div>
                      {renderMarker(item, index)}
                    </div>
                    
                    {/* Horizontal connector to right */}
                    {!isLeft && (
                      <div 
                        className="absolute left-full"
                        style={{ 
                          width: `${connectorLength}px`,
                          height: "2px",
                          backgroundColor: `${baseStyles.lineColor}40`,
                          top: `${dotSize/2 - 1}px`,
                        }}
                      />
                    )}
                  </div>

                  {/* Right content (for odd indices) */}
                  <div className="flex-1" style={{ paddingLeft: `${connectorLength + gapAfterConnector + dotSize/2}px` }}>
                    {!isLeft ? (
                      <div className="text-left">
                        {renderContent(item, index, "left")}
                      </div>
                    ) : (
                      <div /> // Empty spacer
                    )}
                  </div>
                </ItemWrapper>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  return null;
}

// Preview component for sequence layouts
export function SequenceLayoutPreview({
  layout,
  itemCount = 3,
  theme,
}: {
  layout: SequenceLayout;
  itemCount?: number;
  theme?: Theme;
}) {
  const baseStyles = getBaseSequenceStyles(theme || {} as Theme);
  const items = Array.from({ length: itemCount }, (_, i) => i);

  if (layout.id === "sequence-style-1") {
    return (
      <div className="relative w-full h-full p-2 flex flex-col justify-center">
        <div className="relative w-full">
           <div className="absolute top-[3px] left-0 right-0 h-px bg-slate-300" />
           <div className="flex justify-between relative">
             {items.map((_, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                   <div className="w-1.5 h-1.5 rounded-full z-10" style={{ backgroundColor: baseStyles.dotColor }} />
                   <div className="w-px h-2 bg-slate-300 my-0.5" />
                   <div className="space-y-0.5 flex flex-col items-center">
                      <div className="h-0.5 w-6 bg-slate-400 rounded-sm" />
                      <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  if (layout.id === "sequence-style-2") {
    return (
      <div className="relative w-full h-full p-2 flex items-center">
        <div className="relative w-full">
           <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300 -translate-y-1/2" />
           <div className="flex justify-between relative items-center">
             {items.map((_, i) => {
                const isAbove = i % 2 === 0;
                return (
                  <div key={i} className="flex flex-col items-center flex-1" style={{ height: '100%' }}>
                     {isAbove ? (
                        <>
                          <div className="space-y-0.5 flex flex-col items-center mb-0.5">
                              <div className="h-0.5 w-6 bg-slate-400 rounded-sm" />
                              <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                           </div>
                           <div className="w-px h-2 bg-slate-300" />
                           <div className="w-1.5 h-1.5 rounded-full z-10 my-0.5" style={{ backgroundColor: baseStyles.dotColor }} />
                           <div className="h-[14px]" /> {/* Spacer balance */}
                        </>
                     ) : (
                        <>
                           <div className="h-[14px]" /> {/* Spacer balance */}
                           <div className="w-1.5 h-1.5 rounded-full z-10 my-0.5" style={{ backgroundColor: baseStyles.dotColor }} />
                           <div className="w-px h-2 bg-slate-300" />
                           <div className="space-y-0.5 flex flex-col items-center mt-0.5">
                              <div className="h-0.5 w-6 bg-slate-400 rounded-sm" />
                              <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                           </div>
                        </>
                     )}
                  </div>
                );
             })}
           </div>
        </div>
      </div>
    );
  }

  if (layout.id === "sequence-style-3") {
    return (
      <div className="relative w-full h-full p-2 flex items-center">
         <div className="relative w-full pl-4">
            {/* Vertical line positioned to pass through dot centers */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-slate-300" 
              style={{ left: "5px" }} 
            />
            <div className="flex flex-col gap-2">
               {items.map((_, i) => (
                  <div key={i} className="flex items-center relative">
                     {/* Dot centered on the line */}
                     <div 
                       className="absolute w-1.5 h-1.5 rounded-full z-10" 
                       style={{ backgroundColor: baseStyles.dotColor, left: "2px" }} 
                     />
                     {/* Horizontal connector */}
                     <div className="w-3 h-px bg-slate-300 ml-3 mr-1" />
                     {/* Content placeholder */}
                     <div className="space-y-0.5 flex-1">
                        <div className="h-0.5 w-8 bg-slate-400 rounded-sm" />
                        <div className="h-0.5 w-12 bg-slate-200 rounded-sm" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  if (layout.id === "sequence-style-4") {
    return (
      <div className="relative w-full h-full p-2 flex items-center justify-center">
         {/* Center vertical line - passes through all dots */}
         <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-300" style={{ transform: "translateX(-50%)" }} />
         <div className="w-full flex flex-col gap-2">
            {items.map((_, i) => {
               const isLeft = i % 2 === 0;
               return (
                  <div key={i} className="relative flex items-center w-full">
                     {/* Left side content */}
                     <div className="flex-1 flex justify-end pr-1">
                        {isLeft && (
                          <div className="flex flex-col items-end">
                            <div className="h-0.5 w-6 bg-slate-400 rounded-sm mb-0.5" />
                            <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                          </div>
                        )}
                     </div>
                     
                     {/* Connector + Dot in center */}
                     <div className="flex items-center">
                        {isLeft && <div className="w-1 h-px bg-slate-300" />}
                        <div className="w-1.5 h-1.5 rounded-full z-10 shrink-0" style={{ backgroundColor: baseStyles.dotColor }} />
                        {!isLeft && <div className="w-1 h-px bg-slate-300" />}
                     </div>
                     
                     {/* Right side content */}
                     <div className="flex-1 pl-1">
                        {!isLeft && (
                          <div className="flex flex-col items-start">
                            <div className="h-0.5 w-6 bg-slate-400 rounded-sm mb-0.5" />
                            <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                          </div>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
    );
  }

  return null;
}
