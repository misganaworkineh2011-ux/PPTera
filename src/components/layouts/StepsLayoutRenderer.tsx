"use client";

import React from "react";
import type { StepsLayoutType, StepContentItem } from "~/lib/layouts/content/steps";
import EditableText from "~/components/presentation/EditableText";
import type { Theme } from "~/lib/themes";

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
  // Editing props
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}

export function StepsLayoutRenderer({
  layoutId,
  items,
  theme,
  accentColor = "#047857",
  className = "",
  isNarrowSpace = false,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: StepsLayoutRendererProps) {
  const displayItems = items.slice(0, 6);
  const themeStyles = getThemeStyles(theme, accentColor);

  if (layoutId === "steps-pyramid") {
    return (
      <PyramidSteps
        items={displayItems}
        themeStyles={themeStyles}
        className={className}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    );
  }

  if (layoutId === "steps-arrows") {
    return (
      <ArrowSteps
        items={displayItems}
        themeStyles={themeStyles}
        className={className}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        isOwner={isOwner}
        isHovered={isHovered}
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
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    );
  }

  return (
    <BarSteps
      items={displayItems}
      themeStyles={themeStyles}
      className={className}
      isEditing={isEditing}
      editingText={editingText}
      onStartEditLabel={onStartEditLabel}
      onStartEditText={onStartEditText}
      onUpdateLabel={onUpdateLabel}
      onUpdateText={onUpdateText}
      onFinishEditing={onFinishEditing}
      isOwner={isOwner}
      isHovered={isHovered}
    />
  );
}

// Style 1: Pyramid Steps - Sharp triangle with gaps between sections, text staggered diagonally
// Pyramid sections sized to match text content height
function PyramidSteps({
  items,
  themeStyles,
  className,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  items: StepContentItem[];
  themeStyles: ThemeStyles;
  className: string;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
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

          return (
            <div
              key={index}
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className="flex flex-col justify-center"
              style={{
                minHeight: `${minSectionHeight}px`,
                paddingLeft: `${staggerPadding}px`,
              }}
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
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  items: StepContentItem[];
  themeStyles: ThemeStyles;
  className: string;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
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

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item, index) => {
        const arrowHeight = rowHeights[index] || minRowHeight;
        
        return (
          <div
            key={index}
            className="flex items-stretch gap-5"
            style={{ 
              paddingLeft: `${getLeftPadding(index)}px`,
              minHeight: `${arrowHeight}px`,
            }}
          >
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
        );
      })}
    </div>
  );
}

// Style 3: Card Steps - Horizontal cards with INCREASING HEIGHT (stairs going up), height matches content
function CardSteps({
  items,
  themeStyles,
  className,
  isNarrowSpace,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  items: StepContentItem[];
  themeStyles: ThemeStyles;
  className: string;
  isNarrowSpace: boolean;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
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
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl p-5"
            style={{
              backgroundColor: themeStyles.cardBgColor,
              border: `1px solid ${themeStyles.cardBorderColor}`,
              borderLeftWidth: "3px",
              borderLeftColor: themeStyles.accentColor,
            }}
          >
            {item.label && (
              onStartEditLabel ? (
                <EditableText
                  value={item.label}
                  isEditing={isEditing && editingText?.field === `content-label-${index}`}
                  onStartEdit={() => onStartEditLabel(index)}
                  onChange={(val) => onUpdateLabel?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
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
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          ref={(el) => {
            contentRefs.current[index] = el;
          }}
          className="flex-1 rounded-2xl p-6 flex flex-col"
          style={{
            backgroundColor: themeStyles.cardBgColor,
            border: `1px solid ${themeStyles.cardBorderColor}`,
            borderLeftWidth: "4px",
            borderLeftColor: themeStyles.accentColor,
            minHeight: `${getHeight(index)}px`,
          }}
        >
          {item.label && (
            onStartEditLabel ? (
              <EditableText
                value={item.label}
                isEditing={isEditing && editingText?.field === `content-label-${index}`}
                onStartEdit={() => onStartEditLabel(index)}
                onChange={(val) => onUpdateLabel?.(index, val)}
                onFinish={onFinishEditing || (() => {})}
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
      ))}
    </div>
  );
}

// Style 4: Bar Steps - Vertical bars with INCREASING WIDTH (original design), dynamic HEIGHT based on content
function BarSteps({
  items,
  themeStyles,
  className,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: {
  items: StepContentItem[];
  themeStyles: ThemeStyles;
  className: string;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
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
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-5">
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
      ))}
    </div>
  );
}

export default StepsLayoutRenderer;
