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
import { CONTENT_FONT_SIZE } from "~/components/presentation/slide-typography";
import type { Theme } from "~/lib/themes";
import { CircularWorkflowRenderer } from "./CircularWorkflowRenderer";
import { CircularFocusRenderer } from "./CircularFocusRenderer";
import { CircularPetalRenderer } from "./CircularPetalRenderer";

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
  spotlightIndex,
  isSpotlightMode = false,
}: CircleLayoutRendererProps) {
  const displayItems = items.slice(0, 8);
  const themeStyles = getThemeStyles(theme, accentColor);

  const effectiveIsSpotlightMode = isSpotlightMode;
  const effectiveSpotlightIndex = isSpotlightMode && spotlightIndex !== undefined
    ? spotlightIndex 
    : undefined;

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
        spotlightIndex={effectiveSpotlightIndex}
        isSpotlightMode={effectiveIsSpotlightMode}
      />
    );
  }

  if (layoutId === "circle-workflow") {
    return (
      <CircularWorkflowRenderer
        items={displayItems}
        theme={theme}
        accentColor={accentColor}
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
        spotlightIndex={effectiveSpotlightIndex}
        isSpotlightMode={effectiveIsSpotlightMode}
      />
    );
  }

  if (layoutId === "circle-focus") {
    return (
      <CircularFocusRenderer
        items={displayItems}
        theme={theme}
        accentColor={accentColor}
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
        spotlightIndex={effectiveSpotlightIndex}
        isSpotlightMode={effectiveIsSpotlightMode}
      />
    );
  }

  if (layoutId === "circle-petal") {
    return (
      <CircularPetalRenderer
        items={displayItems}
        theme={theme}
        accentColor={accentColor}
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
        spotlightIndex={effectiveSpotlightIndex}
        isSpotlightMode={effectiveIsSpotlightMode}
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
      spotlightIndex={effectiveSpotlightIndex}
      isSpotlightMode={effectiveIsSpotlightMode}
    />
  );
}

// Arc Layout - Content-aware positioning based on item count
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
  spotlightIndex,
  isSpotlightMode = false,
  onHover,
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
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
  onHover?: (index: number | null) => void;
}) {
  const itemCount = items.length;

  // Arc sizes - fixed size regardless of item count (reduced by ~10%)
  const outerRadius = 252; // 280 * 0.9
  const innerRadius = 135; // 150 * 0.9
  const gapAngle = 5;

  const fontSize = "0.875rem";
  const labelSize = "1.125rem";

  // Content position type
  type ContentPosition = "left" | "right" | "top-right" | "bottom-right" | "top-left" | "bottom-left";

  // Determine layout configuration based on item count
  let startOffset = -90;
  let contentPositions: ContentPosition[] = [];

  if (itemCount === 2) {
    // 2 items: One arc left, one arc right - gaps at top/bottom
    startOffset = 0; // Start from right, so gaps are at top and bottom
    contentPositions = ["right", "left"];
  } else if (itemCount === 3) {
    // 3 items: One arc fully on LEFT, two arcs on RIGHT
    // For first arc centered at 180° (left): startOffset = 180 - (segmentAngle/2)
    // segmentAngle = (360 - 3*5) / 3 = 115°, half = 57.5°
    startOffset = 122; // First arc centered on left (180°)
    contentPositions = ["left", "top-right", "bottom-right"];
  } else if (itemCount === 4) {
    // 4 items: One in each quadrant
    startOffset = -45; // Rotate so arcs are in corners
    contentPositions = ["top-right", "bottom-right", "bottom-left", "top-left"];
  } else {
    // 5+ items: Default to top-start
    startOffset = -90;
    contentPositions = items.map((_, i) => 
      i === 0 ? "top-right" : i === 1 ? "right" : i === 2 ? "bottom-right" : "left"
    ) as ContentPosition[];
  }

  // Render content item
  const renderContentItem = (item: CircleContentItem, index: number, position: ContentPosition) => {
    const ItemWrapper = isPresenting ? motion.div : "div";
    const variantsProps = isPresenting ? { variants: circleVariants } : {};
    const spotlightStyle = isPresenting ? getSpotlightStyle(index, spotlightIndex, isSpotlightMode) : {};

    return (
      <ItemWrapper
        key={index}
        className="flex flex-col"
        style={spotlightStyle}
        {...(!isPresenting ? {
          onMouseEnter: () => onHover?.(index),
          onMouseLeave: () => onHover?.(null),
        } : {})}
        {...variantsProps}
      >
        {item.label &&
          (onStartEditLabel ? (
            <EditableText
              value={item.label}
              isEditing={isEditing && editingText?.field === `content-label-${index}`}
              onStartEdit={() => onStartEditLabel(index)}
              onChange={(val) => onUpdateLabel?.(index, val)}
              onFinish={onFinishEditing || (() => {})}
              onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
              className="font-semibold mb-2 leading-tight"
              style={{ fontSize: labelSize, color: themeStyles.titleColor }}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ) : (
            <h3 className="font-semibold mb-2 leading-tight" style={{ fontSize: labelSize, color: themeStyles.titleColor }}>
              {item.label}
            </h3>
          ))}
        {onStartEditText ? (
          <EditableText
            value={item.text}
            isEditing={isEditing && editingText?.field === `content-text-${index}`}
            onStartEdit={() => onStartEditText(index)}
            onChange={(val) => onUpdateText?.(index, val)}
            onFinish={onFinishEditing || (() => {})}
            onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
            className="leading-relaxed"
            style={{ fontSize, color: themeStyles.bodyColor }}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        ) : (
          <p className="leading-relaxed" style={{ fontSize, color: themeStyles.bodyColor }}>
            {item.text}
          </p>
        )}
      </ItemWrapper>
    );
  };

  // For 3 items: special layout with left content + circle + right content (stacked)
  if (itemCount === 3) {
    const content = (
      <div className="w-full flex items-center justify-center gap-8">
        {/* Left content - single item */}
        <div className="flex-1 max-w-[35%] min-w-[280px] text-right pr-4">
          {renderContentItem(items[0]!, 0, "left")}
        </div>

        {/* Circle SVG */}
        <svg
          width="500"
          height="500"
          viewBox="-250 -250 500 500"
          className="flex-shrink-0"
          style={{ width: "500px", height: "500px", flexShrink: 0 }}
          suppressHydrationWarning
        >
          {[0, 1, 2].map((segmentIndex) => {
            const path = getArcSegmentPath(segmentIndex, 3, outerRadius, innerRadius, gapAngle);
            const iconPos = getArcIconPosition(segmentIndex, 3, (outerRadius + innerRadius) / 2, gapAngle);
            const item = items[segmentIndex];
            const style = getSpotlightStyle(segmentIndex, spotlightIndex, isSpotlightMode);
            const { transform, position, zIndex, ...svgStyle } = style as any;

            return (
              <g
                key={segmentIndex}
                style={{ ...svgStyle, transformOrigin: 'center', transition: 'all 0.4s ease-out' }}
                {...(!isPresenting ? {
                  onMouseEnter: () => onHover?.(segmentIndex),
                  onMouseLeave: () => onHover?.(null),
                  cursor: "pointer",
                } : {})}
              >
                <path
                  d={path}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="1"
                  suppressHydrationWarning
                />
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r={28}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="2"
                  suppressHydrationWarning
                />
                {item?.icon ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="22"
                    fill={themeStyles.accentColor}
                    suppressHydrationWarning
                  >
                    {item.icon}
                  </text>
                ) : (
                  <circle cx={iconPos.x} cy={iconPos.y} r={5} fill={`${themeStyles.accentColor}40`} suppressHydrationWarning />
                )}
              </g>
            );
          })}
        </svg>

        {/* Right content - two items stacked */}
        <div className="flex-1 max-w-[35%] min-w-[280px] flex flex-col justify-center gap-24 pl-4 text-left">
          {renderContentItem(items[1]!, 1, "top-right")}
          {renderContentItem(items[2]!, 2, "bottom-right")}
        </div>
      </div>
    );

    const containerClassName = `w-full flex items-center justify-center ${className}`;

    if (isPresenting) {
      return (
        <motion.div key={animationKey} className={containerClassName} variants={containerVariants} initial="hidden" animate="visible">
          {content}
        </motion.div>
      );
    }
    return <div className={containerClassName}>{content}</div>;
  }

  // For 2 items: left and right
  if (itemCount === 2) {
    const content = (
      <div className="w-full flex items-center justify-center gap-8">
        {/* Left content */}
        <div className="flex-1 max-w-[35%] min-w-[280px] text-right pr-4">
          {renderContentItem(items[0]!, 0, "left")}
        </div>

        {/* Circle SVG - fixed size (reduced by ~10%) */}
        <svg
          width="450"
          height="450"
          viewBox="-225 -225 450 450"
          className="flex-shrink-0"
          style={{ width: "450px", height: "450px", flexShrink: 0 }}
          suppressHydrationWarning
        >
          {[0, 1].map((segmentIndex) => {
            const path = getArcSegmentPath(segmentIndex, 2, outerRadius, innerRadius, gapAngle);
            const iconPos = getArcIconPosition(segmentIndex, 2, (outerRadius + innerRadius) / 2, gapAngle);
            const item = items[segmentIndex];
            const style = getSpotlightStyle(segmentIndex, spotlightIndex, isSpotlightMode);
            const { transform, position, zIndex, ...svgStyle } = style as any;

            return (
              <g
                key={segmentIndex}
                style={{ ...svgStyle, transformOrigin: 'center', transition: 'all 0.4s ease-out' }}
                {...(!isPresenting ? {
                  onMouseEnter: () => onHover?.(segmentIndex),
                  onMouseLeave: () => onHover?.(null),
                  cursor: "pointer",
                } : {})}
              >
                <path
                  d={path}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="1"
                  suppressHydrationWarning
                />
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r={28}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="2"
                  suppressHydrationWarning
                />
                {item?.icon ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="22"
                    fill={themeStyles.accentColor}
                    suppressHydrationWarning
                  >
                    {item.icon}
                  </text>
                ) : (
                  <circle cx={iconPos.x} cy={iconPos.y} r={5} fill={`${themeStyles.accentColor}40`} suppressHydrationWarning />
                )}
              </g>
            );
          })}
        </svg>

        {/* Right content */}
        <div className="flex-1 max-w-[35%] min-w-[280px] text-left pl-4">
          {renderContentItem(items[1]!, 1, "right")}
        </div>
      </div>
    );

    const containerClassName = `w-full flex items-center justify-center ${className}`;

    if (isPresenting) {
      return (
        <motion.div key={animationKey} className={containerClassName} variants={containerVariants} initial="hidden" animate="visible">
          {content}
        </motion.div>
      );
    }
    return <div className={containerClassName}>{content}</div>;
  }

  // Use side-by-side distribution for 4-8 items (prevent linear grid)
  if (itemCount >= 4 && itemCount <= 8) {
    const leftIndices = items.map((_, i) => i).filter(i => i % 2 === 0);
    const rightIndices = items.map((_, i) => i).filter(i => i % 2 === 1);
    
    const content = (
      <div className="w-full flex items-center justify-center gap-8">
        {/* Left content */}
        <div className="flex-1 max-w-[35%] min-w-[280px] text-right pr-4 flex flex-col justify-center gap-12">
          {leftIndices.map(idx => renderContentItem(items[idx]!, idx, "left"))}
        </div>

        {/* Circle SVG */}
        <svg
          width="480"
          height="480"
          viewBox="-240 -240 480 480"
          className="flex-shrink-0"
          style={{ width: "480px", height: "480px", flexShrink: 0 }}
          suppressHydrationWarning
        >
          {items.map((item, segmentIndex) => {
            const path = getArcSegmentPath(segmentIndex, itemCount, outerRadius, innerRadius, gapAngle);
            const iconPos = getArcIconPosition(segmentIndex, itemCount, (outerRadius + innerRadius) / 2, gapAngle);
            const style = getSpotlightStyle(segmentIndex, spotlightIndex, isSpotlightMode);
            const { transform, position, zIndex, ...svgStyle } = style as any;

            return (
              <g
                key={segmentIndex}
                style={{ ...svgStyle, transformOrigin: 'center', transition: 'all 0.4s ease-out' }}
                {...(!isPresenting ? {
                  onMouseEnter: () => onHover?.(segmentIndex),
                  onMouseLeave: () => onHover?.(null),
                  cursor: "pointer",
                } : {})}
              >
                <path
                  d={path}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="1"
                  suppressHydrationWarning
                />
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r={24}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="2"
                  suppressHydrationWarning
                />
                {item?.icon ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="20"
                    fill={themeStyles.accentColor}
                    suppressHydrationWarning
                  >
                    {item.icon}
                  </text>
                ) : (
                  <circle cx={iconPos.x} cy={iconPos.y} r={4} fill={`${themeStyles.accentColor}40`} suppressHydrationWarning />
                )}
              </g>
            );
          })}
        </svg>

        {/* Right content */}
        <div className="flex-1 max-w-[35%] min-w-[280px] text-left pl-4 flex flex-col justify-center gap-12">
          {rightIndices.map(idx => renderContentItem(items[idx]!, idx, "right"))}
        </div>
      </div>
    );

    const containerClassName = `w-full flex items-center justify-center ${className}`;

    if (isPresenting) {
      return (
        <motion.div key={animationKey} className={containerClassName} variants={containerVariants} initial="hidden" animate="visible">
          {content}
        </motion.div>
      );
    }
    return <div className={containerClassName}>{content}</div>;
  }

    // Default layout for 9+ items - grid below circle
  const containerClassName = `w-full flex flex-col items-center justify-center ${className}`;

  const content = (
    <>
      <svg
        width="500"
        height="500"
        viewBox="-250 -250 500 500"
        className="flex-shrink-0"
        style={{ width: "500px", height: "500px", flexShrink: 0 }}
        suppressHydrationWarning
      >
        {items.map((item, index) => {
          const path = getArcSegmentPath(index, itemCount, outerRadius, innerRadius, gapAngle);
          const iconPos = getArcIconPosition(index, itemCount, (outerRadius + innerRadius) / 2, gapAngle);
          const style = getSpotlightStyle(index, spotlightIndex, isSpotlightMode);
          const { transform, position, zIndex, ...svgStyle } = style as any;

          return (
            <g
              key={index}
              style={{ ...svgStyle, transformOrigin: 'center', transition: 'all 0.4s ease-out' }}
              {...(!isPresenting ? {
                onMouseEnter: () => onHover?.(index),
                onMouseLeave: () => onHover?.(null),
                cursor: "pointer",
              } : {})}
            >
              <path
                d={path}
                fill={themeStyles.shapeBgColor}
                stroke={themeStyles.shapeBorderColor}
                strokeWidth="1"
                suppressHydrationWarning
              />
              <circle
                cx={iconPos.x}
                cy={iconPos.y}
                r={24}
                fill={themeStyles.shapeBgColor}
                stroke={themeStyles.shapeBorderColor}
                strokeWidth="2"
                suppressHydrationWarning
              />
              {item?.icon ? (
                <text
                  x={iconPos.x}
                  y={iconPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="20"
                  fill={themeStyles.accentColor}
                  suppressHydrationWarning
                >
                  {item.icon}
                </text>
              ) : (
                <circle cx={iconPos.x} cy={iconPos.y} r={4} fill={`${themeStyles.accentColor}40`} suppressHydrationWarning />
              )}
            </g>
          );
        })}
      </svg>

      <div
        className="w-full grid gap-4 px-4 mt-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(itemCount, 4)}, 1fr)` }}
      >
        {items.map((item, index) => {
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: circleVariants } : {};
          const spotlightStyle = isPresenting ? getSpotlightStyle(index, spotlightIndex, isSpotlightMode) : {};

          return (
            <ItemWrapper
              key={index}
              className="text-center"
              style={spotlightStyle}
              {...(!isPresenting ? {
                onMouseEnter: () => onHover?.(index),
                onMouseLeave: () => onHover?.(null),
              } : {})}
              {...variantsProps}
            >
              {item.label && (
                <h3 className="font-semibold mb-1" style={{ fontSize: "0.875rem", color: themeStyles.titleColor }}>
                  {item.label}
                </h3>
              )}
              <p className="leading-snug" style={{ fontSize: "0.75rem", color: themeStyles.bodyColor }}>
                {item.text}
              </p>
            </ItemWrapper>
          );
        })}
      </div>
    </>
  );

  if (isPresenting) {
    return (
      <motion.div key={animationKey} className={containerClassName} variants={containerVariants} initial="hidden" animate="visible">
        {content}
      </motion.div>
    );
  }

  return <div className={containerClassName}>{content}</div>;
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
  spotlightIndex,
  isSpotlightMode = false,
  onHover,
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
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
  onHover?: (index: number | null) => void;
}) {
  const itemCount = items.length;

  // Ring sizes - fixed size regardless of item count (reduced by ~10%)
  const outerRadius = 180; // 200 * 0.9
  const innerRadius = 90; // 100 * 0.9
  const svgSize = 432; // 480 * 0.9 - Fixed size
  // Smaller gaps so segments visually connect (reference has very tight joins)
  const gapAngle = itemCount <= 4 ? 6 : itemCount <= 6 ? 5 : 4;

  // For more than 8 items, use grid below
  if (itemCount > 8) {
    const gridContent = (
      <>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`}
          suppressHydrationWarning
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
              (outerRadius + innerRadius) / 2,
              gapAngle
            );
            const item = items[index];

            return (
              <g key={index}>
                <path
                  d={path}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  suppressHydrationWarning
                />
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r={22}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="2"
                  suppressHydrationWarning
                />
                {item?.icon ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="20"
                    fill={themeStyles.accentColor}
                    suppressHydrationWarning
                  >
                    {item.icon}
                  </text>
                ) : (
                  <circle
                    cx={iconPos.x}
                    cy={iconPos.y}
                    r={4}
                    fill={`${themeStyles.accentColor}40`}
                    suppressHydrationWarning
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
            const variantsProps = isPresenting ? { variants: circleVariants } : {};
            const spotlightStyle = isPresenting ? getSpotlightStyle(index, spotlightIndex, isSpotlightMode) : {};
            
            return (
              <ItemWrapper
                key={index}
                className="p-2 rounded-lg text-center"
                style={{ backgroundColor: themeStyles.cardBgColor, ...spotlightStyle }}
                {...(!isPresenting ? {
                  onMouseEnter: () => onHover?.(index),
                  onMouseLeave: () => onHover?.(null),
                } : {})}
                {...variantsProps}
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
      </>
    );

    const gridClassName = `w-full flex flex-col items-center justify-center gap-4 ${className}`;

    if (isPresenting) {
      return (
        <motion.div
          key={animationKey}
          className={gridClassName}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {gridContent}
        </motion.div>
      );
    }

    return <div className={gridClassName}>{gridContent}</div>;
  }

  // Standard layout - content on sides
  // For 3 items: 1 on left, 2 on right (matching the arc orientation)
  // For other counts: alternate left/right
  let leftItems: CircleContentItem[];
  let rightItems: CircleContentItem[];
  let leftIndices: number[];
  let rightIndices: number[];
  let startOffset = -90; // Default rotation

  if (itemCount === 3) {
    // Special case: 1 item left, 2 items right
    leftItems = [items[0]!];
    rightItems = [items[1]!, items[2]!];
    leftIndices = [0];
    rightIndices = [1, 2];
    // Rotate circle so first arc is on left (centered at 180°)
    startOffset = 122;
  } else {
    leftItems = items.filter((_, i) => i % 2 === 0);
    rightItems = items.filter((_, i) => i % 2 === 1);
    leftIndices = items.map((_, i) => i).filter((i) => i % 2 === 0);
    rightIndices = items.map((_, i) => i).filter((i) => i % 2 === 1);
  }

  const standardContent = (
    <>
      <div
        className="flex flex-col justify-center items-end text-right space-y-4"
        style={{ maxWidth: "35%", minWidth: "280px" }}
      >
        {leftItems.map((item, idx) => {
          const actualIndex = leftIndices[idx]!;
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: circleVariants } : {};
          const spotlightStyle = isPresenting ? getSpotlightStyle(actualIndex, spotlightIndex, isSpotlightMode) : {};
          
          return (
            <ItemWrapper 
              key={idx} 
              style={spotlightStyle}
              {...(!isPresenting ? {
                onMouseEnter: () => onHover?.(actualIndex),
                onMouseLeave: () => onHover?.(null),
              } : {})}
              {...variantsProps}
            >
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
                  className="leading-relaxed"
                  style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p
                  className="leading-relaxed"
                  style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}
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
        style={{ width: `${svgSize}px`, height: `${svgSize}px`, flexShrink: 0 }}
        suppressHydrationWarning
      >
        {Array.from({ length: itemCount }).map((_, index) => {
          const path = getRingSegmentPath(
            index,
            itemCount,
            outerRadius,
            innerRadius,
            gapAngle,
            startOffset
          );
          const iconPos = getRingIconPosition(
            index,
            itemCount,
            (outerRadius + innerRadius) / 2,
            gapAngle,
            startOffset
          );
          const item = items[index];
          const style = getSpotlightStyle(index, spotlightIndex, isSpotlightMode);
          // Remove transform/position properties that don't work well on SVG groups
          const { transform, position, zIndex, ...svgStyle } = style as any;

          return (
            <g 
              key={index}
              style={{ ...svgStyle, transformOrigin: 'center', transition: 'all 0.4s ease-out' }}
              {...(!isPresenting ? {
                onMouseEnter: () => onHover?.(index),
                onMouseLeave: () => onHover?.(null),
                cursor: "pointer",
              } : {})}
            >
              <path
                d={path}
                fill={themeStyles.shapeBgColor}
                stroke={themeStyles.shapeBorderColor}
                strokeWidth="1"
                suppressHydrationWarning
              />
              <circle
                cx={iconPos.x}
                cy={iconPos.y}
                r="28"
                fill={themeStyles.shapeBgColor}
                stroke={themeStyles.shapeBorderColor}
                strokeWidth="2"
                suppressHydrationWarning
              />
              {item?.icon ? (
                <text
                  x={iconPos.x}
                  y={iconPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="22"
                  fill={themeStyles.accentColor}
                  suppressHydrationWarning
                >
                  {item.icon}
                </text>
              ) : (
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r="6"
                  fill={`${themeStyles.accentColor}40`}
                  suppressHydrationWarning
                />
              )}
            </g>
          );
        })}
      </svg>

      <div
        className="flex flex-col justify-center items-start text-left space-y-16"
        style={{ maxWidth: "35%", minWidth: "280px" }}
      >
        {rightItems.map((item, idx) => {
          const actualIndex = rightIndices[idx]!;
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: circleVariants } : {};
          const spotlightStyle = isPresenting ? getSpotlightStyle(actualIndex, spotlightIndex, isSpotlightMode) : {};
          
          return (
            <ItemWrapper 
              key={idx} 
              style={spotlightStyle}
              {...(!isPresenting ? {
                onMouseEnter: () => onHover?.(actualIndex),
                onMouseLeave: () => onHover?.(null),
              } : {})}
              {...variantsProps}
            >
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
                  className="leading-relaxed"
                  style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p
                  className="leading-relaxed"
                  style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}
                >
                  {item.text}
                </p>
              )}
            </ItemWrapper>
          );
        })}
      </div>
    </>
  );

  const standardClassName = `w-full flex items-center justify-center gap-6 ${className}`;

  if (isPresenting) {
    return (
      <motion.div
        key={animationKey}
        className={standardClassName}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {standardContent}
      </motion.div>
    );
  }

  return <div className={standardClassName}>{standardContent}</div>;
}

export default CircleLayoutRenderer;
