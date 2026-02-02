"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
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
    y: 10, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface ThemeStyles {
  petalColors: string[];
  centerBg: string;
  centerIcon: string;
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
      petalColors: [
        defaultAccent,
        `${defaultAccent}dd`,
        `${defaultAccent}bb`,
        `${defaultAccent}99`,
        `${defaultAccent}77`,
      ],
      centerBg: "#0f172a",
      centerIcon: "#ffffff",
      numberBg: "#0f172a",
      numberText: "#ffffff",
      accentColor: defaultAccent,
      titleColor: "#1e293b",
      bodyColor: "#64748b",
      iconColor: "#ffffff",
    };
  }

  const accent = accentColor || theme.colors.accent;
  
  // Generate petal colors based on theme accent with varying opacity
  const petalColors = [
    accent,
    theme.colors.secondary || `${accent}dd`,
    theme.colors.primary || `${accent}bb`,
    `${accent}99`,
    `${accent}77`,
  ];
  
  return {
    petalColors,
    centerBg: theme.colors.heading,
    centerIcon: theme.colors.background,
    numberBg: theme.colors.heading,
    numberText: theme.colors.background,
    accentColor: accent,
    titleColor: theme.colors.heading,
    bodyColor: theme.colors.textMuted,
    iconColor: theme.colors.background,
  };
}

interface CircularPetalRendererProps {
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
  onStartEditCenterText?: () => void;
  onUpdateCenterText?: (value: string) => void;
  onFinishEditing?: () => void;
  onDeleteItem?: (index: number) => void;
  isOwner?: boolean;
  isHovered?: boolean;
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

export function CircularPetalRenderer({
  items,
  theme,
  accentColor = "#10b981",
  className = "",
  isPresenting = false,
  animationKey,
  centerText = "Iterative Cycle Flow",
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onStartEditCenterText,
  onUpdateCenterText,
  onFinishEditing,
  onDeleteItem,
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: CircularPetalRendererProps) {
  const displayItems = items.slice(0, 6);
  const themeStyles = getThemeStyles(theme, accentColor);
  const itemCount = displayItems.length;
  
  // Layout Dimensions
  const svgSize = 500;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  
  // Adjusted radii to match image proportions
  const orbitRadius = 100; // Distance from center to petal center
  const petalSize = 130;   // Length of petal
  const petalWidth = 110;  // Width of petal
  
  const contentRadius = 260; // Radius where content starts

  // Helper to get angle for each item
  const getAngle = (index: number) => {
    // Start from left-ish to match image numbering flow?
    // Image: 1 (Left), 2 (Bottom Left), 3 (Bottom Right), 4 (Right), 5 (Top)
    // This is basically counter-clockwise starting from Left?
    // Let's use standard clockwise for simplicity, but rotated so 1 is at Left.
    // 1 at 180 deg?
    // Let's distribute evenly.
    return (index * 360) / itemCount + 180; 
  };

  const getPetalPath = () => {
    // Teardrop / Leaf shape
    // Pointing RIGHT (0 deg)
    // Tip at (petalSize/2, 0)
    // Base at (-petalSize/2, 0)
    
    const len = petalSize;
    const wid = petalWidth;
    
    // M base
    // C control1, control2, tip
    // C control3, control4, base
    
    // A nice bulbous leaf shape
    return `
      M ${-len * 0.4} 0
      C ${-len * 0.4} ${-wid * 0.6}, ${len * 0.2} ${-wid * 0.6}, ${len * 0.6} 0
      C ${len * 0.2} ${wid * 0.6}, ${-len * 0.4} ${wid * 0.6}, ${-len * 0.4} 0
      Z
    `;
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
    <Container className={`relative w-full h-full min-h-[600px] flex items-center justify-center ${className}`} {...containerProps}>
      {/* Central SVG Diagram */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{ overflow: "visible" }}
        >
          {/* Center Dark Circle (Hub) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={50}
            fill={themeStyles.centerBg}
          />
          
          {/* Center Text (Editable) */}
          <foreignObject
            x={centerX - 45}
            y={centerY - 45}
            width={90}
            height={90}
          >
            <div className="w-full h-full flex items-center justify-center">
              {onStartEditCenterText && onUpdateCenterText ? (
                <EditableText
                  value={centerText}
                  isEditing={isEditing && editingText?.field === 'introText'}
                  onStartEdit={onStartEditCenterText}
                  onChange={onUpdateCenterText}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-center font-bold text-xs leading-tight px-1"
                  style={{ color: themeStyles.centerIcon }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <div
                  className="text-center font-bold text-xs leading-tight px-1 select-none"
                  style={{ color: themeStyles.centerIcon }}
                >
                  {centerText}
                </div>
              )}
            </div>
          </foreignObject>

          {/* Petals */}
          {displayItems.map((item, index) => {
            const angle = getAngle(index);
            const rad = (angle * Math.PI) / 180;
            
            // Position of petal center
            const x = centerX + orbitRadius * Math.cos(rad);
            const y = centerY + orbitRadius * Math.sin(rad);
            
            // Rotation: Point OUTWARDS from center
            // So rotation = angle
            
            const color = themeStyles.petalColors[index % themeStyles.petalColors.length];
            
            return (
              <g 
                key={`petal-${index}`} 
                transform={`translate(${x}, ${y}) rotate(${angle})`}
                style={getSpotlightStyle(index)}
              >
                <path
                  d={getPetalPath()}
                  fill={color}
                  stroke={themeStyles.centerIcon}
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
                {/* Icon inside petal - counter-rotate to keep upright */}
                <g transform={`rotate(${-angle})`}>
                   {item.icon ? (
                     <text
                       x="0"
                       y="0"
                       textAnchor="middle"
                       dominantBaseline="central"
                       fontSize="32"
                       fill={themeStyles.iconColor}
                       style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.2))" }}
                     >
                       {item.icon}
                     </text>
                   ) : (
                     <circle r="6" fill={themeStyles.iconColor} fillOpacity="0.8" />
                   )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Content Blocks - Absolutely Positioned */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {displayItems.map((item, index) => {
          const angle = getAngle(index);
          const rad = (angle * Math.PI) / 180;
          
          // Determine position quadrant for alignment
          const normalizedAngle = ((angle % 360) + 360) % 360;
          const isLeft = normalizedAngle > 90 && normalizedAngle < 270;
          const isRight = !isLeft;
          
          // Calculate position using fixed pixels from center to ensure consistent gap
          // Layout radius is roughly 180px, so we anchor content slightly outside that
          const contentRadiusPx = 220; 
          const xOffset = contentRadiusPx * Math.cos(rad);
          const yOffset = contentRadiusPx * Math.sin(rad);
          
          // Alignment styles
          const alignClass = isLeft ? "flex-row-reverse text-right" : "flex-row text-left";
          
          // Dynamic offset with calc to maintain fixed distance from center regardless of container size
          // Also constraint max-width to ensure content doesn't overflow screen edges
          // Available space to edge = 50% width - absolute x offset - padding
          const maxWidthStyle = `calc(50% - ${Math.abs(xOffset)}px - 32px)`;
          
          const style: React.CSSProperties = {
            left: `calc(50% + ${xOffset}px)`,
            top: `calc(50% + ${yOffset}px)`,
            transform: `translate(${isLeft ? "-100%" : "0"}, -50%)`,
            maxWidth: maxWidthStyle,
            width: "max-content", // Allow it to shrink/grow but cap at maxWidth
            ...getSpotlightStyle(index)
          };

          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};

          return (
            <div
              key={`content-${index}`}
              className="absolute pointer-events-auto"
              style={style}
            >
              <ItemWrapper
                className={`flex items-start gap-4 ${alignClass} w-full`}
                {...variantsProps}
              >
                {/* Number Badge */}
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center font-bold text-sm shadow-md mt-1"
                  style={{ backgroundColor: themeStyles.numberBg, color: themeStyles.numberText }}
                >
                  {index + 1}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                   {item.label && (
                      onStartEditLabel ? (
                        <div className={`w-full ${isLeft ? "flex justify-end" : ""}`}>
                          <EditableText
                            value={item.label}
                            isEditing={isEditing && editingText?.field === `content-label-${index}`}
                            onStartEdit={() => onStartEditLabel(index)}
                            onChange={(val) => onUpdateLabel?.(index, val)}
                            onFinish={onFinishEditing || (() => {})}
                            className="font-bold text-base mb-1 block"
                            style={{ color: themeStyles.titleColor }}
                            isOwner={isOwner}
                          />
                        </div>
                      ) : (
                        <h3 className="font-bold text-base mb-1" style={{ color: themeStyles.titleColor }}>
                          {item.label}
                        </h3>
                      )
                    )}
                    
                    <div className={isLeft ? "ml-auto" : ""}>
                      {onStartEditText ? (
                        <EditableText
                          value={item.text}
                          isEditing={isEditing && editingText?.field === `content-text-${index}`}
                          onStartEdit={() => onStartEditText(index)}
                          onChange={(val) => onUpdateText?.(index, val)}
                          onFinish={onFinishEditing || (() => {})}
                          className="text-sm leading-relaxed opacity-90"
                          style={{ color: themeStyles.bodyColor }}
                          isOwner={isOwner}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed opacity-90" style={{ color: themeStyles.bodyColor }}>
                          {item.text}
                        </p>
                      )}
                    </div>
                </div>
              </ItemWrapper>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
