"use client";

import React from "react";
import { motion } from "framer-motion";
import type {
  CircleLayoutType,
  CircleContentItem,
} from "~/lib/layouts/content/circles";
import {
  getArcSegmentPath,
  getRingSegmentPath,
  getArcIconPosition,
  getRingIconPosition,
} from "~/lib/layouts/content/circles";
import EditableText from "~/components/presentation/EditableText";
import type { Theme } from "~/lib/themes";

// Animation variants for staggered circle animations
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

const circleVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

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

// Helper to get theme-aware styles
function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  const defaultAccent = accentColor || "#0d9488";

  if (!theme) {
    return {
      shapeBgColor: `${defaultAccent}20`,
      shapeBorderColor: `${defaultAccent}40`,
      cardBgColor: `${defaultAccent}15`,
      cardBorderColor: `${defaultAccent}30`,
      accentColor: defaultAccent,
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
    shapeBgColor: bgColor,
    shapeBorderColor: borderColor,
    cardBgColor: bgColor,
    cardBorderColor: borderColor,
    accentColor: accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
  };
}

interface CircleLayoutRendererProps {
  layoutId: CircleLayoutType;
  items: CircleContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  isPresenting?: boolean;
  animationKey?: string;
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
}

export function CircleLayoutRenderer({
  layoutId,
  items,
  theme,
  accentColor = "#0d9488",
  className = "",
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
}: CircleLayoutRendererProps) {
  const displayItems = items.slice(0, 8);
  const themeStyles = getThemeStyles(theme, accentColor);

  if (layoutId === "circle-arc") {
    return (
      <ArcLayout
        items={displayItems}
        themeStyles={themeStyles}
        className={className}
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
      />
    );
  }

  return (
    <RingLayout
      items={displayItems}
      themeStyles={themeStyles}
      className={className}
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
    />
  );
}

// Arc Layout - Text positioned above each arc segment following the curve
function ArcLayout({
  items,
  themeStyles,
  className,
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
}: {
  items: CircleContentItem[];
  themeStyles: ThemeStyles;
  className: string;
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
}) {
  const itemCount = items.length;

  // Arc sizes - bigger arc
  const outerRadius = itemCount <= 3 ? 170 : itemCount <= 5 ? 150 : 130;
  const innerRadius = itemCount <= 3 ? 95 : itemCount <= 5 ? 82 : 70;
  const gapAngle = itemCount <= 3 ? 10 : itemCount <= 5 ? 8 : 6;

  const fontSize = itemCount <= 4 ? "0.875rem" : "0.75rem";
  const labelSize = itemCount <= 4 ? "1rem" : "0.875rem";

  // Calculate position info for each item
  const getItemPosition = (index: number) => {
    const totalArcAngle = 180 - (itemCount - 1) * gapAngle;
    const segmentAngle = totalArcAngle / itemCount;
    const startAngle = -180 + index * (segmentAngle + gapAngle);
    const midAngle = startAngle + segmentAngle / 2;

    // Normalize to 0-1 range where 0 = leftmost (-180°), 1 = rightmost (0°)
    const normalizedPos = (midAngle + 180) / 180;

    // Calculate vertical offset - center items are higher (smaller offset), edge items are lower
    // Using sine curve: edges (0, 1) have sin close to 0, center (0.5) has sin = 1
    const verticalFactor = Math.sin(normalizedPos * Math.PI);

    let textAlign: "left" | "center" | "right" = "center";
    if (midAngle < -120) textAlign = "right";
    else if (midAngle > -60) textAlign = "left";

    return { normalizedPos, verticalFactor, textAlign };
  };

  // Grid columns based on item count
  const gridCols = Math.min(itemCount, 6);

  // Container and item wrapper for animations
  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? { 
    key: animationKey,
    variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};

  return (
    <Container className={`w-full flex flex-col items-center ${className}`} {...containerProps}>
      {/* Text row - items spread horizontally, with vertical offset following arc curve */}
      <div
        className="w-full grid gap-2 px-4"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        }}
      >
        {items.slice(0, gridCols).map((item, index) => {
          const pos = getItemPosition(index);
          // Vertical margin: center items have less top margin (appear higher)
          // Edge items have more top margin (appear lower) - increased for wing texts
          const topMargin = Math.round((1 - pos.verticalFactor) * 100);

          const ItemWrapper = isPresenting ? motion.div : "div";
          const itemProps = isPresenting ? { variants: circleVariants } : {};

          return (
            <ItemWrapper
              key={index}
              className="flex flex-col"
              style={{
                marginTop: `${topMargin}px`,
                textAlign: pos.textAlign,
              }}
              {...itemProps}
            >
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
                    onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                    className="font-semibold mb-1 leading-tight"
                    style={{ fontSize: labelSize, color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="font-semibold mb-1 leading-tight"
                    style={{ fontSize: labelSize, color: themeStyles.titleColor }}
                  >
                    {item.label}
                  </h3>
                ))}
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
                  className="leading-snug"
                  style={{ fontSize, color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="leading-snug" style={{ fontSize, color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </ItemWrapper>
          );
        })}
      </div>

      {/* Arc SVG */}
      <svg
        width="480"
        height="250"
        viewBox="-240 -240 480 250"
        className="flex-shrink-0 -mt-20"
      >
        {Array.from({ length: itemCount }).map((_, index) => {
          const path = getArcSegmentPath(
            index,
            itemCount,
            outerRadius,
            innerRadius,
            gapAngle
          );
          const iconPos = getArcIconPosition(
            index,
            itemCount,
            (outerRadius + innerRadius) / 2
          );
          const item = items[index];

          return (
            <g key={index}>
              <path
                d={path}
                fill={themeStyles.shapeBgColor}
                stroke={themeStyles.shapeBorderColor}
                strokeWidth="1"
              />
              <circle
                cx={iconPos.x}
                cy={iconPos.y}
                r={itemCount <= 4 ? 16 : 13}
                fill="white"
                stroke={`${themeStyles.accentColor}40`}
                strokeWidth="1"
              />
              {item?.icon ? (
                <text
                  x={iconPos.x}
                  y={iconPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fill={themeStyles.accentColor}
                >
                  {item.icon}
                </text>
              ) : (
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r={3}
                  fill={`${themeStyles.accentColor}40`}
                />
              )}
            </g>
          );
        })}
      </svg>
    </Container>
  );
}

// Ring Layout
function RingLayout({
  items,
  themeStyles,
  className,
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
}: {
  items: CircleContentItem[];
  themeStyles: ThemeStyles;
  className: string;
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
}) {
  const itemCount = items.length;

  const outerRadius = itemCount <= 4 ? 100 : itemCount <= 6 ? 85 : 75;
  const innerRadius = itemCount <= 4 ? 50 : itemCount <= 6 ? 42 : 36;
  const svgSize = itemCount <= 4 ? 240 : itemCount <= 6 ? 200 : 180;
  const gapAngle = itemCount <= 4 ? 15 : itemCount <= 6 ? 12 : 10;

  // Container and item wrapper for animations
  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? { 
    key: animationKey,
    variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};

  // For more than 4 items, use grid below
  if (itemCount > 4) {
    return (
      <Container className={`w-full flex flex-col items-center gap-4 ${className}`} {...containerProps}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`}
        >
          {Array.from({ length: itemCount }).map((_, index) => {
            const path = getRingSegmentPath(
              index,
              itemCount,
              outerRadius,
              innerRadius,
              gapAngle
            );
            const iconPos = getRingIconPosition(
              index,
              itemCount,
              (outerRadius + innerRadius) / 2
            );
            const item = items[index];

            return (
              <g key={index}>
                <path
                  d={path}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="1"
                />
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r={11}
                  fill="white"
                  stroke={`${themeStyles.accentColor}40`}
                  strokeWidth="1"
                />
                {item?.icon ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill={themeStyles.accentColor}
                  >
                    {item.icon}
                  </text>
                ) : (
                  <circle
                    cx={iconPos.x}
                    cy={iconPos.y}
                    r={2}
                    fill={`${themeStyles.accentColor}40`}
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div
          className="w-full grid gap-2 px-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(itemCount, 4)}, 1fr)`,
          }}
        >
          {items.map((item, index) => {
            const ItemWrapper = isPresenting ? motion.div : "div";
            const itemProps = isPresenting ? { variants: circleVariants } : {};
            
            return (
              <ItemWrapper
                key={index}
                className="p-2 rounded-lg text-center"
                style={{ backgroundColor: themeStyles.cardBgColor }}
                {...itemProps}
              >
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
                      onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeStyles.titleColor }}
                    >
                      {item.label}
                    </h3>
                  ))}
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
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: themeStyles.bodyColor }}
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

  // Standard layout - content on sides
  const leftItems = items.filter((_, i) => i % 2 === 0);
  const rightItems = items.filter((_, i) => i % 2 === 1);
  const leftIndices = items.map((_, i) => i).filter((i) => i % 2 === 0);
  const rightIndices = items.map((_, i) => i).filter((i) => i % 2 === 1);

  return (
    <Container
      className={`w-full flex items-center justify-center gap-6 ${className}`}
      {...containerProps}
    >
      <div
        className="flex flex-col justify-center items-end text-right space-y-4"
        style={{ maxWidth: "180px" }}
      >
        {leftItems.map((item, idx) => {
          const actualIndex = leftIndices[idx]!;
          const ItemWrapper = isPresenting ? motion.div : "div";
          const itemProps = isPresenting ? { variants: circleVariants } : {};
          
          return (
            <ItemWrapper key={idx} {...itemProps}>
              {item.label &&
                (onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={
                      isEditing &&
                      editingText?.field === `content-label-${actualIndex}`
                    }
                    onStartEdit={() => onStartEditLabel(actualIndex)}
                    onChange={(val) => onUpdateLabel?.(actualIndex, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(actualIndex) : undefined}
                    className="text-base font-semibold mb-1"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: themeStyles.titleColor }}
                  >
                    {item.label}
                  </h3>
                ))}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={
                    isEditing &&
                    editingText?.field === `content-text-${actualIndex}`
                  }
                  onStartEdit={() => onStartEditText(actualIndex)}
                  onChange={(val) => onUpdateText?.(actualIndex, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(actualIndex) : undefined}
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                >
                  {item.text}
                </p>
              )}
            </ItemWrapper>
          );
        })}
      </div>

      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`}
      >
        {Array.from({ length: itemCount }).map((_, index) => {
          const path = getRingSegmentPath(
            index,
            itemCount,
            outerRadius,
            innerRadius,
            15
          );
          const iconPos = getRingIconPosition(
            index,
            itemCount,
            (outerRadius + innerRadius) / 2
          );
          const item = items[index];

          return (
            <g key={index}>
              <path
                d={path}
                fill={themeStyles.shapeBgColor}
                stroke={themeStyles.shapeBorderColor}
                strokeWidth="1"
              />
              <circle
                cx={iconPos.x}
                cy={iconPos.y}
                r="14"
                fill="white"
                stroke={`${themeStyles.accentColor}40`}
                strokeWidth="1"
              />
              {item?.icon ? (
                <text
                  x={iconPos.x}
                  y={iconPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fill={themeStyles.accentColor}
                >
                  {item.icon}
                </text>
              ) : (
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r="3"
                  fill={`${themeStyles.accentColor}40`}
                />
              )}
            </g>
          );
        })}
      </svg>

      <div
        className="flex flex-col justify-center items-start text-left space-y-4"
        style={{ maxWidth: "180px" }}
      >
        {rightItems.map((item, idx) => {
          const actualIndex = rightIndices[idx]!;
          const ItemWrapper = isPresenting ? motion.div : "div";
          const itemProps = isPresenting ? { variants: circleVariants } : {};
          
          return (
            <ItemWrapper key={idx} {...itemProps}>
              {item.label &&
                (onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={
                      isEditing &&
                      editingText?.field === `content-label-${actualIndex}`
                    }
                    onStartEdit={() => onStartEditLabel(actualIndex)}
                    onChange={(val) => onUpdateLabel?.(actualIndex, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(actualIndex) : undefined}
                    className="text-base font-semibold mb-1"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: themeStyles.titleColor }}
                  >
                    {item.label}
                  </h3>
                ))}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={
                    isEditing &&
                    editingText?.field === `content-text-${actualIndex}`
                  }
                  onStartEdit={() => onStartEditText(actualIndex)}
                  onChange={(val) => onUpdateText?.(actualIndex, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(actualIndex) : undefined}
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
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

export default CircleLayoutRenderer;
