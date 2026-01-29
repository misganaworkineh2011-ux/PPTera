"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { CircleContentItem } from "~/lib/layouts/content/circles";
import EditableText from "~/components/presentation/EditableText";

// Animation variants
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

const itemVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
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
  circleBgColor: string;
  circleBorderColor: string;
  arrowColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  accentColor: string;
  titleColor: string;
  bodyColor: string;
  numberBgColor: string;
  numberTextColor: string;
}

function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  const defaultAccent = accentColor || "#10b981";

  if (!theme) {
    return {
      circleBgColor: `${defaultAccent}30`,
      circleBorderColor: `${defaultAccent}50`,
      arrowColor: defaultAccent,
      cardBgColor: "#ffffff",
      cardBorderColor: "#e5e7eb",
      accentColor: defaultAccent,
      titleColor: "#1e293b",
      bodyColor: "#64748b",
      numberBgColor: "#1e293b",
      numberTextColor: "#ffffff",
    };
  }

  const cardBox = theme.cardBox;
  const accent = accentColor || cardBox?.accentColor || theme.colors.accent;

  return {
    circleBgColor: `${accent}30`,
    circleBorderColor: `${accent}50`,
    arrowColor: accent,
    cardBgColor: cardBox?.background || theme.colors.background,
    cardBorderColor: cardBox?.borderColor || `${accent}20`,
    accentColor: accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
    numberBgColor: theme.colors.heading,
    numberTextColor: theme.colors.background,
  };
}

interface CircularWorkflowRendererProps {
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

export function CircularWorkflowRenderer({
  items,
  theme,
  accentColor = "#10b981",
  className = "",
  isPresenting = false,
  animationKey,
  centerText = "Workflow\nProcess\nStages",
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
}: CircularWorkflowRendererProps) {
  const displayItems = items.slice(0, 6);
  const themeStyles = getThemeStyles(theme, accentColor);
  const itemCount = displayItems.length;

  // Circle dimensions - good size for workflow
  const radius = 160;
  const svgSize = 420;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Arrow dimensions
  const arrowWidth = 70;
  const arrowHeight = 50;
  const arrowHeadWidth = 25;

  // Calculate positions for each segment
  const getSegmentAngle = (index: number) => {
    return (360 / itemCount) * index - 90; // Start from top
  };

  const getArrowPosition = (index: number) => {
    const angle = getSegmentAngle(index);
    const rad = (angle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(rad);
    const y = centerY + radius * Math.sin(rad);
    return { x, y, angle: angle + 90 }; // Rotate arrow to point clockwise
  };

  const getIconPosition = (index: number) => {
    const angle = getSegmentAngle(index) + (360 / itemCount) / 2; // Middle of segment
    const rad = (angle * Math.PI) / 180;
    const iconRadius = radius * 0.7;
    const x = centerX + iconRadius * Math.cos(rad);
    const y = centerY + iconRadius * Math.sin(rad);
    return { x, y };
  };

  // Generate gradient colors for circle segments using theme colors
  const getSegmentColor = (index: number) => {
    // Use theme colors if available, otherwise fallback to default gradient
    if (theme && accentColor) {
      // Create variations of the accent color
      return accentColor;
    }
    
    // Fallback: default color gradient
    const colors = [
      "#10b981", // green
      "#14b8a6", // teal
      "#06b6d4", // cyan
      "#0ea5e9", // blue
      "#3b82f6", // indigo
      "#6366f1", // violet
    ];
    return colors[index % colors.length];
  };

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? {
    key: animationKey,
    variants: containerVariants,
    initial: "hidden",
    animate: "visible"
  } : {};

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      transition: 'all 0.4s ease-out',
    };
  };

  return (
    <Container
      className={`w-full flex items-center justify-center gap-8 ${className}`}
      {...containerProps}
    >
      {/* Circular diagram */}
      <div className="flex-shrink-0">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ overflow: "visible" }}
        >
          {/* Draw circle segments */}
          {displayItems.map((item, index) => {
            const startAngle = getSegmentAngle(index);
            const endAngle = getSegmentAngle(index + 1);
            const segmentAngle = 360 / itemCount;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const innerRadius = radius * 0.5;
            const outerRadius = radius;
            
            // Calculate arc path
            const x1 = centerX + outerRadius * Math.cos(startRad);
            const y1 = centerY + outerRadius * Math.sin(startRad);
            const x2 = centerX + outerRadius * Math.cos(endRad);
            const y2 = centerY + outerRadius * Math.sin(endRad);
            const x3 = centerX + innerRadius * Math.cos(endRad);
            const y3 = centerY + innerRadius * Math.sin(endRad);
            const x4 = centerX + innerRadius * Math.cos(startRad);
            const y4 = centerY + innerRadius * Math.sin(startRad);
            
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            
            const pathData = `
              M ${x1} ${y1}
              A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
              L ${x3} ${y3}
              A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
              Z
            `;
            
            const segmentColor = getSegmentColor(index);
            
            return (
              <path
                key={`segment-${index}`}
                d={pathData}
                fill={`${segmentColor}40`}
                stroke={`${segmentColor}60`}
                strokeWidth="2"
                style={getSpotlightStyle(index)}
              />
            );
          })}

          {/* Draw arrows between segments */}
          {displayItems.map((_, index) => {
            const arrowPos = getArrowPosition(index);
            const color = getSegmentColor(index);
            
            return (
              <g
                key={`arrow-${index}`}
                transform={`translate(${arrowPos.x}, ${arrowPos.y}) rotate(${arrowPos.angle})`}
                style={getSpotlightStyle(index)}
              >
                {/* Arrow body */}
                <rect
                  x={-arrowWidth / 2}
                  y={-arrowHeight / 2}
                  width={arrowWidth}
                  height={arrowHeight}
                  fill={color}
                  rx="4"
                />
                {/* Arrow head */}
                <path
                  d={`M ${arrowWidth / 2} ${-arrowHeight / 2} L ${arrowWidth / 2 + arrowHeadWidth} 0 L ${arrowWidth / 2} ${arrowHeight / 2} Z`}
                  fill={color}
                />
              </g>
            );
          })}

          {/* Draw icons */}
          {displayItems.map((item, index) => {
            const iconPos = getIconPosition(index);
            
            return (
              <g key={`icon-${index}`} style={getSpotlightStyle(index)}>
                <circle
                  cx={iconPos.x}
                  cy={iconPos.y}
                  r={28}
                  fill="white"
                  stroke={themeStyles.circleBorderColor}
                  strokeWidth="2"
                />
                {item.icon ? (
                  <text
                    x={iconPos.x}
                    y={iconPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="22"
                  >
                    {item.icon}
                  </text>
                ) : (
                  <circle
                    cx={iconPos.x}
                    cy={iconPos.y}
                    r={5}
                    fill={themeStyles.accentColor}
                  />
                )}
              </g>
            );
          })}

          {/* Center circle with text */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.45}
            fill="white"
            stroke={themeStyles.circleBorderColor}
            strokeWidth="2"
          />
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="16"
            fontWeight="600"
            fill={themeStyles.titleColor}
          >
            {centerText.split('\n').map((line, i, arr) => (
              <tspan
                key={i}
                x={centerX}
                dy={i === 0 ? -(arr.length - 1) * 9 : 18}
              >
                {line}
              </tspan>
            ))}
          </text>
        </svg>
      </div>

      {/* Content list on the right */}
      <div className="flex-1 max-w-md flex flex-col gap-5">
        {displayItems.map((item, index) => {
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};
          
          return (
            <ItemWrapper
              key={index}
              className="flex gap-3 items-start"
              style={getSpotlightStyle(index)}
              {...variantsProps}
            >
              {/* Number badge */}
              <div
                className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: themeStyles.numberBgColor,
                  color: themeStyles.numberTextColor,
                }}
              >
                {String(index + 1).padStart(2, '0')}
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
                      className="font-semibold text-base mb-1.5 leading-tight"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="font-semibold text-base mb-1.5 leading-tight"
                      style={{ color: themeStyles.titleColor }}
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
                  <p
                    className="text-sm leading-relaxed"
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
