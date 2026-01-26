"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import type { StepsLayoutType, StepContentItem } from "~/lib/layouts/content/steps";
import EditableText from "~/components/presentation/EditableText";
import type { Theme } from "~/lib/themes";
import { CONTENT_FONT_SIZE } from "~/components/presentation/slide-typography";

// Animation variants for staggered step animations
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

const stepVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
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
  const defaultAccent = accentColor || "#047857";

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

interface StepsLayoutRendererProps {
  layoutId: StepsLayoutType;
  items: StepContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  isNarrowSpace?: boolean;
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
    filter: isHighlighted ? 'drop-shadow(0 0 30px rgba(255,255,255,0.4))' : 'blur(2px)',
    position: 'relative' as const,
    zIndex: isHighlighted ? 10 : 1,
  };
};

export function StepsLayoutRenderer({
  layoutId,
  items,
  theme,
  accentColor = "#047857",
  className = "",
  isNarrowSpace = false,
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
  onReorderItems,
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: StepsLayoutRendererProps) {
  const displayItems = items.slice(0, 6);
  const themeStyles = getThemeStyles(theme, accentColor);

  // Spotlight is controlled only by arrow keys via props - no hover interaction
  const effectiveSpotlightIndex = isSpotlightMode && spotlightIndex !== undefined
    ? spotlightIndex 
    : -1;
  
  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex && onReorderItems) {
      onReorderItems(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const dragProps = {
    draggedIndex,
    dragOverIndex,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
    canDrag: isOwner && !!onReorderItems && !isPresenting,
  };

  if (layoutId === "steps-pyramid") {
    return (
      <PyramidSteps
        items={displayItems}
        themeStyles={themeStyles}
        className={className}
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
        {...dragProps}
        highlightedIndex={effectiveSpotlightIndex}
      />
    );
  }

  if (layoutId === "steps-arrows") {
    return (
      <ArrowSteps
        items={displayItems}
        themeStyles={themeStyles}
        className={className}
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
        {...dragProps}
        highlightedIndex={effectiveSpotlightIndex}
      />
    );
  }

  if (layoutId === "steps-cards") {
    return (
      <CardSteps
        items={displayItems}
        themeStyles={themeStyles}
        className={className}
        isNarrowSpace={isNarrowSpace}
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
        {...dragProps}
        highlightedIndex={effectiveSpotlightIndex}
      />
    );
  }

  return (
    <BarSteps
      items={displayItems}
      themeStyles={themeStyles}
      className={className}
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
      {...dragProps}
      highlightedIndex={effectiveSpotlightIndex}
    />
  );
}

// Drag props interface for sub-components
interface DragProps {
  draggedIndex: number | null;
  dragOverIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  canDrag: boolean;
}

// Common props for step sub-components
interface StepSubComponentProps {
  items: StepContentItem[];
  themeStyles: ThemeStyles;
  className: string;
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
}

// Style 1: Pyramid Steps - Sharp triangle with gaps between sections, text staggered diagonally
// Pyramid sections sized to match text content height
function PyramidSteps({
  items,
  themeStyles,
  className,
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
  draggedIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  canDrag,
  highlightedIndex,
}: {
  items: StepContentItem[];
  themeStyles: ThemeStyles;
  className: string;
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
} & DragProps & {
  highlightedIndex?: number;
}) {
  const getStyle = (index: number) => {
    return getSpotlightStyle(index, highlightedIndex, highlightedIndex !== undefined && highlightedIndex !== -1);
  };

  const itemCount = items.length;
  const pyramidWidth = 280;
  const gap = 15; // Visible gap between sections
  const minSectionHeight = 50; // Minimum height per section

  // Refs to measure text content heights
  const contentRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [sectionHeights, setSectionHeights] = React.useState<number[]>(() => 
    items.map(() => minSectionHeight)
  );
  const hasInitialized = React.useRef(false);

  // Measure content heights once after initial render
  React.useLayoutEffect(() => {
    if (hasInitialized.current) return;
    
    const newHeights = contentRefs.current.map((ref) => {
      if (ref) {
        const height = ref.offsetHeight;
        return Math.max(height, minSectionHeight);
      }
      return minSectionHeight;
    });
    
    hasInitialized.current = true;
    setSectionHeights(newHeights);
  }, []);

  // Reset when items change
  React.useEffect(() => {
    hasInitialized.current = false;
  }, [items.length]);

  // Calculate cumulative Y positions based on measured heights
  const getYPositions = () => {
    const positions: { topY: number; bottomY: number; height: number }[] = [];
    let currentY = 0;

    for (let i = 0; i < itemCount; i++) {
      const height = sectionHeights[i] || minSectionHeight;
      positions.push({
        topY: currentY,
        bottomY: currentY + height,
        height,
      });
      currentY += height + gap;
    }
    return positions;
  };

  const yPositions = getYPositions();
  const totalHeight =
    yPositions.length > 0
      ? (yPositions[yPositions.length - 1]?.bottomY ?? 0)
      : minSectionHeight;

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Pyramid on left */}
      <div className="flex-shrink-0" style={{ width: `${pyramidWidth}px` }}>
        <svg
          width={pyramidWidth}
          height={totalHeight}
          viewBox={`0 0 ${pyramidWidth} ${totalHeight}`}
          style={{ overflow: "visible" }}
        >
          {items.map((_, index) => {
            const pos = yPositions[index];
            if (!pos) return null;

            const { topY, bottomY, height } = pos;

            // Calculate width at each Y position for sharp triangle
            const getWidthAtY = (y: number) => {
              return (y / totalHeight) * pyramidWidth;
            };

            const topWidth = getWidthAtY(topY);
            const bottomWidth = getWidthAtY(bottomY);

            const centerX = pyramidWidth / 2;
            const topLeftX = centerX - topWidth / 2;
            const topRightX = centerX + topWidth / 2;
            const bottomLeftX = centerX - bottomWidth / 2;
            const bottomRightX = centerX + bottomWidth / 2;

            // For first section, make it a triangle (point at top)
            if (index === 0) {
              return (
                <g key={index}>
                  <path
                    d={`M ${centerX} 0 L ${bottomRightX} ${bottomY} L ${bottomLeftX} ${bottomY} Z`}
                    fill={themeStyles.shapeBgColor}
                    stroke={themeStyles.shapeBorderColor}
                    strokeWidth="1"
                  />
                  <text
                    x={centerX}
                    y={height * 0.65}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xl"
                    fill={`${themeStyles.accentColor}60`}
                    style={{ fontWeight: 300 }}
                  >
                    {index + 1}
                  </text>
                </g>
              );
            }

            // Other sections are trapezoids with gap from previous section
            return (
              <g key={index}>
                <path
                  d={`M ${topLeftX} ${topY} L ${topRightX} ${topY} L ${bottomRightX} ${bottomY} L ${bottomLeftX} ${bottomY} Z`}
                  fill={themeStyles.shapeBgColor}
                  stroke={themeStyles.shapeBorderColor}
                  strokeWidth="1"
                />
                <text
                  x={centerX}
                  y={topY + height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xl"
                  fill={`${themeStyles.accentColor}60`}
                  style={{ fontWeight: 300 }}
                >
                  {index + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Content on right - text drives the height */}
      <div className="flex-1 flex flex-col" style={{ gap: `${gap}px` }}>
        {items.map((item, index) => {
          const staggerPadding = index * 40;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={index}
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              draggable={canDrag}
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, index)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-2 transition-all ${
                isDragging ? "opacity-50 scale-95" : ""
              } ${isDragOver ? "ring-2 ring-cyan-500 rounded-lg" : ""} ${
                canDrag ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              style={{
                minHeight: `${minSectionHeight}px`,
                paddingLeft: `${staggerPadding}px`,
                ...getStyle(index),
              }}
            >
              {/* Drag handle */}
              {canDrag && isHovered && !isPresenting && (
                <div className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                  <GripVertical size={16} style={{ color: themeStyles.bodyColor }} />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center">
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
                      className="text-lg font-semibold mb-1"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="text-lg font-semibold mb-1"
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Style 2: Arrow Steps - Thick downward arrows, staggered to the right
// Dynamic heights based on content
function ArrowSteps({
  items,
  themeStyles,
  className,
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
  draggedIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  canDrag,
  highlightedIndex,
}: {
  items: StepContentItem[];
  themeStyles: ThemeStyles;
  className: string;
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
} & DragProps & {
  highlightedIndex?: number;
}) {
  const getStyle = (index: number) => {
    return getSpotlightStyle(index, highlightedIndex, highlightedIndex !== undefined && highlightedIndex !== -1);
  };

  const minRowHeight = 60; // Minimum row height
  const contentRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [rowHeights, setRowHeights] = React.useState<number[]>(() => 
    items.map(() => minRowHeight)
  );
  const hasInitialized = React.useRef(false);

  // Measure content heights
  React.useLayoutEffect(() => {
    if (hasInitialized.current) return;
    
    const newHeights = contentRefs.current.map((ref) => {
      if (ref) {
        const height = ref.offsetHeight;
        return Math.max(height + 20, minRowHeight); // Add padding
      }
      return minRowHeight;
    });
    
    hasInitialized.current = true;
    setRowHeights(newHeights);
  }, []);

  // Reset when items change
  React.useEffect(() => {
    hasInitialized.current = false;
  }, [items.length]);

  // Each arrow is offset more to the right (staggered effect)
  const getLeftPadding = (index: number) => {
    return index * 35;
  };

  // Arrow dimensions - dynamic height based on content
  const arrowWidth = 50;
  const bodyWidth = 30;
  const headHeight = 25;

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? { 
    variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};

  return (
    <Container className={`flex flex-col gap-3 ${className}`} {...containerProps}>
      {items.map((item, index) => {
        const arrowHeight = rowHeights[index] || minRowHeight;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        
        const itemContent = (
          <>
            {/* Drag handle */}
            {canDrag && !isPresenting && isHovered && (
              <div className="flex-shrink-0 flex items-center opacity-50 hover:opacity-100 transition-opacity">
                <GripVertical size={16} style={{ color: themeStyles.bodyColor }} />
              </div>
            )}
            {/* Thick arrow pointing down - dynamic size */}
            <div className="flex-shrink-0 flex items-center">
              <svg 
                width={arrowWidth} 
                height={arrowHeight} 
                viewBox={`0 0 ${arrowWidth} ${arrowHeight}`} 
                fill="none"
                style={{ overflow: 'visible' }}
              >
                <rect 
                  x={(arrowWidth - bodyWidth) / 2} 
                  y="0" 
                  width={bodyWidth} 
                  height={arrowHeight - headHeight} 
                  fill={themeStyles.shapeBgColor} 
                />
                <polygon 
                  points={`${arrowWidth / 2},${arrowHeight} 0,${arrowHeight - headHeight} ${arrowWidth},${arrowHeight - headHeight}`} 
                  fill={themeStyles.shapeBgColor} 
                />
              </svg>
            </div>

            {/* Content */}
            <div 
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className="flex-1 flex flex-col justify-center py-2"
            >
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                    className="text-lg font-semibold mb-1"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-lg font-semibold mb-1" style={{ color: themeStyles.titleColor }}>
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
                <p className="leading-relaxed" style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}>
                  {item.text}
                </p>
              )}
            </div>
          </>
        );

        const baseClassName = `flex items-stretch gap-5 transition-all ${
          isDragging ? "opacity-50 scale-95" : ""
        } ${isDragOver ? "ring-2 ring-cyan-500 rounded-lg" : ""} ${
          canDrag && !isPresenting ? "cursor-grab active:cursor-grabbing" : ""
        }`;
        
        const baseStyle = { 
          paddingLeft: `${getLeftPadding(index)}px`,
          minHeight: `${arrowHeight}px`,
        };

        if (isPresenting) {
          return (
            <motion.div
              key={index}
              className={baseClassName}
              style={baseStyle}
              variants={stepVariants}
            >
              {itemContent}
            </motion.div>
          );
        }
        
        return (
          <div
            key={index}
            draggable={canDrag}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            className={baseClassName}
            style={{
               ...baseStyle,
               ...getStyle(index),
            }}
          >
            {itemContent}
          </div>
        );
      })}
    </Container>
  );
}

// Style 3: Card Steps - Horizontal cards with INCREASING HEIGHT (stairs going up), height matches content
function CardSteps({
  items,
  themeStyles,
  className,
  isNarrowSpace,
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
  draggedIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  canDrag,
  highlightedIndex,
}: {
  items: StepContentItem[];
  themeStyles: ThemeStyles;
  className: string;
  isNarrowSpace: boolean;
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
} & DragProps & {
  highlightedIndex?: number;
}) {
  const getStyle = (index: number) => {
    return getSpotlightStyle(index, highlightedIndex, highlightedIndex !== undefined && highlightedIndex !== -1);
  };
  
  const itemCount = items.length;
  const baseMinHeight = 120;
  const baseMaxHeight = 200;
  const contentRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [contentHeights, setContentHeights] = React.useState<number[]>(() => 
    items.map(() => baseMinHeight)
  );
  const hasInitialized = React.useRef(false);

  // Measure content heights
  React.useLayoutEffect(() => {
    if (hasInitialized.current) return;
    
    const newHeights = contentRefs.current.map((ref) => {
      if (ref) {
        const height = ref.offsetHeight;
        return Math.max(height + 40, baseMinHeight); // Add padding
      }
      return baseMinHeight;
    });
    
    hasInitialized.current = true;
    setContentHeights(newHeights);
  }, []);

  // Reset when items change
  React.useEffect(() => {
    hasInitialized.current = false;
  }, [items.length]);
  
  // Heights increase from left to right (like stairs) - ORIGINAL DESIGN
  // But each card's height matches its content (dynamic)
  const getHeight = (index: number) => {
    const contentHeight = contentHeights[index] || baseMinHeight;
    // Calculate the increasing base height
    const step = (baseMaxHeight - baseMinHeight) / Math.max(itemCount - 1, 1);
    const increasingBase = baseMinHeight + step * index;
    // Use the larger of content height or increasing base height
    return Math.max(contentHeight, increasingBase);
  };

  if (isNarrowSpace) {
    // Stack vertically in narrow space
    return (
      <div className={`flex flex-col gap-4 ${className}`}>
        {items.map((item, index) => {
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          
          return (
            <div
              key={index}
              draggable={canDrag}
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, index)}
              onDragEnd={onDragEnd}
              className={`rounded-xl p-5 transition-all ${
                isDragging ? "opacity-50 scale-95" : ""
              } ${isDragOver ? "ring-2 ring-cyan-500" : ""} ${
                canDrag ? "cursor-grab active:cursor-grabbing" : ""
              }`}
              style={{
                backgroundColor: themeStyles.cardBgColor,
                border: `1px solid ${themeStyles.cardBorderColor}`,
                borderLeftWidth: "3px",
                borderLeftColor: themeStyles.accentColor,
                ...getStyle(index),
              }}
            >
              {canDrag && isHovered && !isPresenting && (
                <div className="flex justify-end mb-2 opacity-50 hover:opacity-100 transition-opacity">
                  <GripVertical size={16} style={{ color: themeStyles.bodyColor }} />
                </div>
              )}
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                    className="text-base font-semibold mb-2"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-base font-semibold mb-2" style={{ color: themeStyles.titleColor }}>
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
                <p className="leading-relaxed" style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}>
                  {item.text}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {items.map((item, index) => {
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        
        return (
          <div
            key={index}
            ref={(el) => {
              contentRefs.current[index] = el;
            }}
            draggable={canDrag}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            className={`flex-1 rounded-2xl p-6 flex flex-col transition-all ${
              isDragging ? "opacity-50 scale-95" : ""
            } ${isDragOver ? "ring-2 ring-cyan-500" : ""} ${
              canDrag ? "cursor-grab active:cursor-grabbing" : ""
            }`}
            style={{
              backgroundColor: themeStyles.cardBgColor,
              border: `1px solid ${themeStyles.cardBorderColor}`,
              borderLeftWidth: "4px",
              borderLeftColor: themeStyles.accentColor,
              minHeight: `${getHeight(index)}px`,
              ...getStyle(index),
            }}
          >
            {canDrag && isHovered && !isPresenting && (
              <div className="flex justify-end mb-2 opacity-50 hover:opacity-100 transition-opacity">
                <GripVertical size={16} style={{ color: themeStyles.bodyColor }} />
              </div>
            )}
            {item.label && (
              onStartEditLabel ? (
                <EditableText
                  value={item.label}
                  isEditing={isEditing && editingText?.field === `content-label-${index}`}
                  onStartEdit={() => onStartEditLabel(index)}
                  onChange={(val) => onUpdateLabel?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                  className="text-base font-semibold mb-2"
                  style={{ color: themeStyles.titleColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <h3 className="text-base font-semibold mb-2" style={{ color: themeStyles.titleColor }}>
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
        );
      })}
    </div>
  );
}

// Style 4: Bar Steps - Vertical bars with INCREASING WIDTH (original design), dynamic HEIGHT based on content
function BarSteps({
  items,
  themeStyles,
  className,
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
  draggedIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  canDrag,
  highlightedIndex,
}: {
  items: StepContentItem[];
  themeStyles: ThemeStyles;
  className: string;
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
} & DragProps & {
  highlightedIndex?: number;
}) {
  const getStyle = (index: number) => {
    return getSpotlightStyle(index, highlightedIndex, highlightedIndex !== undefined && highlightedIndex !== -1);
  };
  
  const itemCount = items.length;
  const minBarHeight = 60; // Minimum height for bar
  const contentRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [barHeights, setBarHeights] = React.useState<number[]>(() => 
    items.map(() => minBarHeight)
  );
  const hasInitialized = React.useRef(false);

  // Measure content heights to determine bar height
  React.useLayoutEffect(() => {
    if (hasInitialized.current) return;
    
    const newHeights = contentRefs.current.map((ref) => {
      if (ref) {
        const height = ref.offsetHeight;
        return Math.max(height + 20, minBarHeight); // Add padding
      }
      return minBarHeight;
    });
    
    hasInitialized.current = true;
    setBarHeights(newHeights);
  }, []);

  // Reset when items change
  React.useEffect(() => {
    hasInitialized.current = false;
  }, [items.length]);

  // Widths increase from top to bottom (like steps) - ORIGINAL DESIGN
  const getWidth = (index: number) => {
    const minWidth = 25; // percentage
    const maxWidth = 45;
    const step = (maxWidth - minWidth) / Math.max(itemCount - 1, 1);
    return minWidth + step * index;
  };

  // Get dynamic height based on content
  const getHeight = (index: number) => {
    return barHeights[index] || minBarHeight;
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {items.map((item, index) => {
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        
        return (
          <div 
            key={index} 
            draggable={canDrag}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-5 transition-all ${
              isDragging ? "opacity-50 scale-95" : ""
            } ${isDragOver ? "ring-2 ring-cyan-500 rounded-lg" : ""} ${
              canDrag ? "cursor-grab active:cursor-grabbing" : ""
            }`}
             style={getStyle(index)}
          >
            {/* Drag handle */}
            {canDrag && isHovered && !isPresenting && (
              <div className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <GripVertical size={16} style={{ color: themeStyles.bodyColor }} />
              </div>
            )}
            {/* Number bar - only contains the number, width increases downward, height matches content */}
            <div
              className="flex-shrink-0 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: themeStyles.shapeBgColor,
                border: `1px solid ${themeStyles.shapeBorderColor}`,
                width: `${getWidth(index)}%`,
                minWidth: "80px",
                height: `${getHeight(index)}px`,
                minHeight: `${minBarHeight}px`,
              }}
            >
              <span
                className="text-2xl"
                style={{ color: `${themeStyles.accentColor}70`, fontWeight: 300 }}
              >
                {index + 1}
              </span>
            </div>

            {/* Content section - OUTSIDE the bar */}
            <div 
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className="flex-1"
            >
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                    className="text-base font-semibold mb-1"
                    style={{ color: themeStyles.accentColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: themeStyles.accentColor }}
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
                  className="text-sm leading-relaxed"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="leading-relaxed" style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}>
                  {item.text}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StepsLayoutRenderer;
