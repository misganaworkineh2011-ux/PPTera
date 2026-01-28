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
  const displayItems = items.slice(0, 4); // Max 4 items for this layout
  const themeStyles = getThemeStyles(theme, accentColor);
  const itemCount = displayItems.length;

  // Circle dimensions - much smaller to fit in slide
  const centerRadius = 60;
  const segmentInnerRadius = 75;
  const segmentOuterRadius = 140;
  const svgSize = 350;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Calculate segment positions (starting from top-right, going clockwise)
  const getSegmentAngle = (index: number) => {
    const baseAngle = -45; // Start from top-right
    const angleStep = 360 / itemCount;
    return baseAngle + (angleStep * index);
  };

  const getSegmentPath = (index: number) => {
    const startAngle = getSegmentAngle(index);
    const endAngle = getSegmentAngle(index + 1);
    const gap = 8; // Gap between segments in degrees
    
    const adjustedStart = startAngle + gap / 2;
    const adjustedEnd = endAngle - gap / 2;
    
    const startRad = (adjustedStart * Math.PI) / 180;
    const endRad = (adjustedEnd * Math.PI) / 180;
    
    // Outer arc points
    const x1 = centerX + segmentOuterRadius * Math.cos(startRad);
    const y1 = centerY + segmentOuterRadius * Math.sin(startRad);
    const x2 = centerX + segmentOuterRadius * Math.cos(endRad);
    const y2 = centerY + segmentOuterRadius * Math.sin(endRad);
    
    // Inner arc points
    const x3 = centerX + segmentInnerRadius * Math.cos(endRad);
    const y3 = centerY + segmentInnerRadius * Math.sin(endRad);
    const x4 = centerX + segmentInnerRadius * Math.cos(startRad);
    const y4 = centerY + segmentInnerRadius * Math.sin(startRad);
    
    const largeArc = (adjustedEnd - adjustedStart) > 180 ? 1 : 0;
    
    return `
      M ${x1} ${y1}
      A ${segmentOuterRadius} ${segmentOuterRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${segmentInnerRadius} ${segmentInnerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
  };

  const getIconPosition = (index: number) => {
    const angle = getSegmentAngle(index) + (360 / itemCount) / 2;
    const rad = (angle * Math.PI) / 180;
    const iconRadius = (segmentInnerRadius + segmentOuterRadius) / 2;
    
    return {
      x: centerX + iconRadius * Math.cos(rad),
      y: centerY + iconRadius * Math.sin(rad),
    };
  };

  // Callout positions with better spacing from edges
  const getCalloutPosition = (index: number) => {
    const angle = getSegmentAngle(index) + (360 / itemCount) / 2;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Determine if callout should be on left or right
    const isRight = normalizedAngle < 180;
    
    // Add vertical offset to avoid top/bottom edges
    let verticalOffset = 0;
    if (normalizedAngle > 315 || normalizedAngle < 45) {
      // Top area - push down
      verticalOffset = 40;
    } else if (normalizedAngle > 135 && normalizedAngle < 225) {
      // Bottom area - push up
      verticalOffset = -40;
    }
    
    return {
      isRight,
      angle: normalizedAngle,
      verticalOffset,
    };
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
    <Container className={`w-full flex items-center justify-center py-12 ${className}`} {...containerProps}>
      <div className="relative" style={{ width: `${svgSize}px`, height: `${svgSize}px` }}>
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

          {/* Connecting lines from segments to callouts */}
          {displayItems.map((_, index) => {
            const calloutPos = getCalloutPosition(index);
            const angle = getSegmentAngle(index) + (360 / itemCount) / 2;
            const rad = (angle * Math.PI) / 180;
            
            const startX = centerX + segmentOuterRadius * Math.cos(rad);
            const startY = centerY + segmentOuterRadius * Math.sin(rad);
            
            const lineLength = 60;
            const endX = startX + lineLength * Math.cos(rad);
            const endY = startY + lineLength * Math.sin(rad);
            
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

        {/* Callout boxes positioned absolutely */}
        {displayItems.map((item, index) => {
          const calloutPos = getCalloutPosition(index);
          const angle = getSegmentAngle(index) + (360 / itemCount) / 2;
          const rad = (angle * Math.PI) / 180;
          
          // Calculate position for callout
          const distance = segmentOuterRadius + 100;
          const x = centerX + distance * Math.cos(rad);
          const y = centerY + distance * Math.sin(rad);
          
          // Convert to percentage for absolute positioning
          const leftPercent = (x / svgSize) * 100;
          const topPercent = (y / svgSize) * 100;
          
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};
          
          return (
            <ItemWrapper
              key={`callout-${index}`}
              className="absolute flex items-start gap-2"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent + (calloutPos.verticalOffset / svgSize) * 100}%`,
                transform: calloutPos.isRight 
                  ? 'translate(0, -50%)' 
                  : 'translate(-100%, -50%)',
                width: '320px', // Increased from 280px
                ...getSpotlightStyle(index),
              }}
              {...variantsProps}
            >
              {/* Number badge */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                style={{
                  backgroundColor: themeStyles.numberBg,
                  color: themeStyles.numberText,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>

              {/* Content card with fixed height and text truncation */}
              <div
                className="flex-1 p-5 rounded-lg shadow-md overflow-hidden"
                style={{
                  backgroundColor: themeStyles.calloutBg,
                  border: `1px solid ${themeStyles.calloutBorder}`,
                  height: '140px', // Increased from 120px
                  display: 'flex',
                  flexDirection: 'column',
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
                      onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                      className="font-semibold text-base mb-2 line-clamp-1"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="font-semibold text-base mb-2 line-clamp-1"
                      style={{ color: themeStyles.titleColor }}
                      title={item.label}
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
                    className="text-sm leading-relaxed line-clamp-3"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="text-sm leading-relaxed line-clamp-3"
                    style={{ color: themeStyles.bodyColor }}
                    title={item.text}
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
