"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { CircleContentItem } from "~/lib/layouts/content/circles";
import EditableText from "~/components/presentation/EditableText";

const BADGE_SIZE = 36;
const BADGE_GAP = 8;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.85,
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

interface ThemeStyles {
  segmentColors: string[];
  centerBg: string;
  centerBorder: string;
  calloutBg: string;
  calloutBorder: string;
  numberBg: string;
  numberText: string;
  accentColor: string;
  titleColor: string;
  bodyColor: string;
  iconColor: string;
}

function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  const defaultAccent = accentColor || "#10b981";

  if (!theme) {
    return {
      segmentColors: ["#10b981", "#14b8a6", "#0ea5e9", "#1e293b"],
      centerBg: "#ffffff",
      centerBorder: "#e5e7eb",
      calloutBg: "#ffffff",
      calloutBorder: "#e5e7eb",
      numberBg: "#10b981",
      numberText: "#ffffff",
      accentColor: defaultAccent,
      titleColor: "#1e293b",
      bodyColor: "#64748b",
      iconColor: "#ffffff",
    };
  }

  const accent = accentColor || theme.colors.accent;
  
  // Generate segment colors based on theme
  const segmentColors = [
    accent,
    theme.colors.secondary || `${accent}dd`,
    theme.colors.primary || `${accent}bb`,
    theme.colors.heading || "#1e293b",
  ];

  return {
    segmentColors,
    centerBg: theme.colors.background,
    centerBorder: theme.colors.border,
    calloutBg: theme.colors.background,
    calloutBorder: theme.colors.border,
    numberBg: accent,
    numberText: theme.colors.background,
    accentColor: accent,
    titleColor: theme.colors.heading,
    bodyColor: theme.colors.textMuted,
    iconColor: "#ffffff",
  };
}

interface CircularFocusRendererProps {
  items: CircleContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  isPresenting?: boolean;
  animationKey?: string;
  centerText?: string;
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

export function CircularFocusRenderer({
  items,
  theme,
  accentColor = "#10b981",
  className = "",
  isPresenting = false,
  animationKey,
  centerText = "Core Focus\nAreas",
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
}: CircularFocusRendererProps) {
  const displayItems = items.slice(0, 6);
  const themeStyles = getThemeStyles(theme, accentColor);
  const itemCount = Math.max(2, Math.min(6, displayItems.length));
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [boxSize, setBoxSize] = useState<{ w: number } | null>(null);

  const centerRadius = 52;
  const segmentInnerRadius = 64;
  const segmentOuterRadius = 115;
  const svgSize = 420;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Slot-based angles: place segments (and callouts) to avoid overlap.
  const getSlotAngles = (): number[] => {
    if (itemCount === 2) return [180, 0]; // left, right
    if (itemCount === 3) return [270, 150, 30]; // top, bottom-left, bottom-right
    if (itemCount === 4) return [270, 0, 90, 180]; // top, right, bottom, left
    const step = 360 / itemCount;
    return Array.from({ length: itemCount }, (_, i) => -90 + i * step);
  };
  const slotAngles = getSlotAngles();

  const getSegmentAngle = (index: number) => slotAngles[index] ?? -90;

  const getSegmentPath = (index: number) => {
    const baseAngle = getSegmentAngle(index);
    const span = 360 / itemCount;
    const gap = Math.min(6, span * 0.12);
    const startAngle = baseAngle - span / 2 + gap / 2;
    const endAngle = baseAngle + span / 2 - gap / 2;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + segmentOuterRadius * Math.cos(startRad);
    const y1 = centerY + segmentOuterRadius * Math.sin(startRad);
    const x2 = centerX + segmentOuterRadius * Math.cos(endRad);
    const y2 = centerY + segmentOuterRadius * Math.sin(endRad);
    const x3 = centerX + segmentInnerRadius * Math.cos(endRad);
    const y3 = centerY + segmentInnerRadius * Math.sin(endRad);
    const x4 = centerX + segmentInnerRadius * Math.cos(startRad);
    const y4 = centerY + segmentInnerRadius * Math.sin(startRad);

    const largeArc = span > 180 ? 1 : 0;
    return `
      M ${x1} ${y1}
      A ${segmentOuterRadius} ${segmentOuterRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${segmentInnerRadius} ${segmentInnerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  const getIconPosition = (index: number) => {
    const angle = getSegmentAngle(index);
    const rad = (angle * Math.PI) / 180;
    const iconRadius = (segmentInnerRadius + segmentOuterRadius) / 2;
    return {
      x: centerX + iconRadius * Math.cos(rad),
      y: centerY + iconRadius * Math.sin(rad),
    };
  };

  // REDUCED DISTANCE: Controls how long the lines are and how close boxes sit
  const lineLength = 40; 
  const calloutDistance = segmentOuterRadius + lineLength;
  
  const measureMaxWidth = 380;
  const measureMinWidth = 220;
  const measureMinHeight = 60;

  const contentKey = displayItems
    .map((i) => `${i.label ?? ""}|${i.text ?? ""}`)
    .join("\n");
  useLayoutEffect(() => {
    const refs = boxRefs.current;
    let maxW = 0;
    let maxH = 0;
    for (let i = 0; i < displayItems.length; i++) {
      const el = refs[i];
      if (!el) continue;
      const { width, height } = el.getBoundingClientRect();
      if (width > maxW) maxW = width;
      if (height > maxH) maxH = height;
    }
    if (maxW > 0 && maxH > 0) {
      const w = Math.max(measureMinWidth, Math.ceil(maxW));
      const h = Math.max(measureMinHeight, Math.ceil(maxH));
      setBoxSize((prev) => (prev?.w === w && prev?.h === h ? prev : { w, h }));
    }
  }, [displayItems.length, contentKey]);

  const getCalloutPosition = (index: number) => {
    const angle = getSegmentAngle(index);
    const rad = (angle * Math.PI) / 180;
    const x = centerX + calloutDistance * Math.cos(rad);
    const y = centerY + calloutDistance * Math.sin(rad);
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const isRight = normalizedAngle >= 270 || normalizedAngle < 90;
    const isBottom = normalizedAngle >= 45 && normalizedAngle < 135;
    const isTop = normalizedAngle >= 225 && normalizedAngle < 315;
    return { x, y, isRight, isBottom, isTop, angle: normalizedAngle };
  };

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: 'all 0.4s ease-out',
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? {
    key: animationKey,
    variants: containerVariants,
    initial: "hidden",
    animate: "visible"
  } : {};

  return (
    <Container className={`w-full flex items-center justify-center py-8 ${className}`} {...containerProps}>
      <div
        className="relative overflow-visible"
        style={{
          width: `${svgSize}px`,
          height: `${svgSize}px`,
          minWidth: `${svgSize}px`,
          minHeight: `${svgSize}px`,
        }}
      >
        {/* SVG with segments */}
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="absolute inset-0"
          style={{ overflow: "visible" }}
        >
          {/* Draw segments */}
          {displayItems.map((item, index) => {
            const path = getSegmentPath(index);
            const iconPos = getIconPosition(index);
            const color = themeStyles.segmentColors[index % themeStyles.segmentColors.length];
            
            return (
              <g key={`segment-${index}`} style={getSpotlightStyle(index)}>
                <path
                  d={path}
                  fill={color}
                  stroke="none"
                />
                {/* Icon */}
                {item.icon && (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="24"
                    fill={themeStyles.iconColor}
                  >
                    {item.icon}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={centerRadius}
            fill={themeStyles.centerBg}
            stroke={themeStyles.centerBorder}
            strokeWidth="2"
          />
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="13"
            fontWeight="600"
            fill={themeStyles.titleColor}
          >
            {centerText.split('\n').map((line, i, arr) => (
              <tspan
                key={i}
                x={centerX}
                dy={i === 0 ? -(arr.length - 1) * 12 : 24}
              >
                {line}
              </tspan>
            ))}
          </text>

          {/* Connecting lines: segment edge → callout box */}
          {displayItems.map((_, index) => {
            const angle = getSegmentAngle(index);
            const rad = (angle * Math.PI) / 180;
            const startX = centerX + segmentOuterRadius * Math.cos(rad);
            const startY = centerY + segmentOuterRadius * Math.sin(rad);
            // End exactly where the calloutDistance is, so it touches the wrapper div
            const endX = centerX + calloutDistance * Math.cos(rad);
            const endY = centerY + calloutDistance * Math.sin(rad);
            return (
              <line
                key={`line-${index}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={themeStyles.centerBorder}
                strokeWidth="2"
                style={getSpotlightStyle(index)}
              />
            );
          })}
        </svg>

        {/* Callout boxes */}
        {displayItems.map((item, index) => {
          const pos = getCalloutPosition(index);
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};
          const cw = boxSize?.w ?? measureMinWidth;
          
          // Position logic:
          // Top/Bottom: center horizontally (left = x - w/2). Vertical: Top above (y-h), Bottom below (y).
          // Right: starts at x (left=x). Vertical center.
          // Left: ends at x (left=x-w). Vertical center.
          const isTopOrBottom = pos.isTop || pos.isBottom;
          const leftPx = isTopOrBottom ? pos.x - cw / 2 : pos.isRight ? pos.x : pos.x - cw;
          const topPx = pos.y;
          const transformY = pos.isTop ? "translateY(-100%)" : pos.isBottom ? "translateY(0)" : "translateY(-50%)";
          
          const isMeasuring = !boxSize;
          
          // Badge layout: Badge always on the side closest to the connecting line
          // Top/Bottom: row (badge left) is fine? Or column? 
          // Standard boxes are usually horizontal [Badge] [Text].
          // For Left box (line on right), we want [Text] [Badge] so Badge is near line.
          // For Right box (line on left), we want [Badge] [Text] so Badge is near line.
          // For Top/Bottom (line on bottom/top): maybe standard [Badge] [Text] is fine.
          const flexDirection = !isTopOrBottom && !pos.isRight ? "flex-row-reverse text-right" : "flex-row text-left";

          return (
            <ItemWrapper
              key={`callout-${index}`}
              ref={(el) => {
                boxRefs.current[index] = el as HTMLDivElement | null;
              }}
              className={`absolute p-4 rounded-lg shadow-md flex flex-col`}
              style={{
                left: `${leftPx}px`,
                top: `${topPx}px`,
                transform: transformY,
                width: isMeasuring ? "fit-content" : `${cw}px`,
                maxWidth: isMeasuring ? measureMaxWidth : undefined,
                minWidth: isMeasuring ? measureMinWidth : undefined,
                height: "auto",
                minHeight: `${measureMinHeight}px`,
                backgroundColor: themeStyles.calloutBg,
                border: `1px solid ${themeStyles.calloutBorder}`,
                ...getSpotlightStyle(index),
              }}
              {...variantsProps}
            >
              <div className={`flex items-start gap-3 ${flexDirection}`}>
                <div
                  className="flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{
                    width: BADGE_SIZE,
                    height: BADGE_SIZE,
                    backgroundColor: themeStyles.numberBg,
                    color: themeStyles.numberText,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className={`flex-1 min-w-0 flex flex-col ${isMeasuring ? "" : "h-full"}`}>
                  {item.label && (
                    onStartEditLabel ? (
                      <EditableText
                        value={item.label}
                        isEditing={isEditing && editingText?.field === `content-label-${index}`}
                        onStartEdit={() => onStartEditLabel(index)}
                        onChange={(val) => onUpdateLabel?.(index, val)}
                        onFinish={onFinishEditing || (() => {})}
                        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                        className="font-semibold text-sm mb-1.5 break-words"
                        style={{ color: themeStyles.titleColor }}
                        isOwner={isOwner}
                        isHovered={isHovered}
                      />
                    ) : (
                      <h3
                        className="font-semibold text-sm mb-1.5 break-words"
                        style={{ color: themeStyles.titleColor }}
                      >
                        {item.label}
                      </h3>
                    )
                  )}
                  <div
                    className="text-sm leading-relaxed break-words flex-1"
                    style={{ color: themeStyles.bodyColor }}
                  >
                    {onStartEditText ? (
                      <EditableText
                        value={item.text}
                        isEditing={isEditing && editingText?.field === `content-text-${index}`}
                        onStartEdit={() => onStartEditText(index)}
                        onChange={(val) => onUpdateText?.(index, val)}
                        onFinish={onFinishEditing || (() => {})}
                        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                        className="block"
                        style={{ color: themeStyles.bodyColor }}
                        isOwner={isOwner}
                        isHovered={isHovered}
                      />
                    ) : (
                      <p className="block">{item.text}</p>
                    )}
                  </div>
                </div>
              </div>
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}