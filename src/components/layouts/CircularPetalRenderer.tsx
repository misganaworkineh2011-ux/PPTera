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
  petalColors: string[];
  centerBg: string;
  centerBorder: string;
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
      petalColors: ["#10b981", "#14b8a6", "#0ea5e9", "#1e40af", "#7c3aed"],
      centerBg: "#1e293b",
      centerBorder: "#334155",
      numberBg: "#1e293b",
      numberText: "#ffffff",
      accentColor: defaultAccent,
      titleColor: "#1e293b",
      bodyColor: "#64748b",
      iconColor: "#ffffff",
    };
  }

  const accent = accentColor || theme.colors.accent;
  
  // Generate petal colors with gradient effect
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
    centerBorder: theme.colors.border,
    numberBg: theme.colors.heading,
    numberText: theme.colors.background,
    accentColor: accent,
    titleColor: theme.colors.heading,
    bodyColor: theme.colors.textMuted,
    iconColor: "#ffffff",
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
  centerText = "Cycle\nFlow",
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
}: CircularPetalRendererProps) {
  const displayItems = items.slice(0, 5); // Max 5 items for petal layout
  const themeStyles = getThemeStyles(theme, accentColor);
  const itemCount = displayItems.length;

  // Petal dimensions
  const petalRadius = 85;
  const centerRadius = 50;
  const svgSize = 450;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const orbitRadius = 110; // Distance from center to petal centers

  // Calculate petal positions (arranged in a circle)
  const getPetalPosition = (index: number) => {
    const angle = (index * 360) / itemCount - 90; // Start from top
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + orbitRadius * Math.cos(rad),
      y: centerY + orbitRadius * Math.sin(rad),
      angle,
    };
  };

  // Get content box position (left or right side)
  const getContentPosition = (index: number) => {
    const angle = (index * 360) / itemCount - 90;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    
    // Determine if content should be on left or right
    const isRight = normalizedAngle < 180;
    
    return {
      isRight,
      angle: normalizedAngle,
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
    <Container className={`w-full flex items-center justify-center gap-12 ${className}`} {...containerProps}>
      {/* Left content boxes */}
      <div className="flex-1 max-w-[350px] flex flex-col gap-8 max-h-[500px] overflow-y-auto">
        {displayItems.map((item, index) => {
          const contentPos = getContentPosition(index);
          if (contentPos.isRight) return null;

          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};

          return (
            <ItemWrapper
              key={`left-${index}`}
              className="flex items-start gap-3"
              style={getSpotlightStyle(index)}
              {...variantsProps}
            >
              {/* Number badge */}
              <div
                className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center font-bold text-xl"
                style={{
                  backgroundColor: themeStyles.numberBg,
                  color: themeStyles.numberText,
                }}
              >
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 max-h-[240px] overflow-hidden">
                {item.label && (
                  onStartEditLabel ? (
                    <EditableText
                      value={item.label}
                      isEditing={isEditing && editingText?.field === `content-label-${index}`}
                      onStartEdit={() => onStartEditLabel(index)}
                      onChange={(val) => onUpdateLabel?.(index, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                      className="font-semibold text-lg mb-2 line-clamp-1"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="font-semibold text-lg mb-2 line-clamp-1"
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
                    className="text-base leading-relaxed line-clamp-4"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="text-base leading-relaxed line-clamp-4"
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

      {/* Center SVG with petals */}
      <div className="relative flex-shrink-0" style={{ width: `${svgSize}px`, height: `${svgSize}px` }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="absolute inset-0"
        >
          {/* Draw petals */}
          {displayItems.map((item, index) => {
            const pos = getPetalPosition(index);
            const color = themeStyles.petalColors[index % themeStyles.petalColors.length];
            
            return (
              <g key={`petal-${index}`} style={getSpotlightStyle(index)}>
                {/* Petal circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={petalRadius}
                  fill={color}
                  opacity="0.9"
                />
                
                {/* Icon */}
                {item.icon && (
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="32"
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
        </svg>
      </div>

      {/* Right content boxes */}
      <div className="flex-1 max-w-[350px] flex flex-col gap-8 max-h-[500px] overflow-y-auto">
        {displayItems.map((item, index) => {
          const contentPos = getContentPosition(index);
          if (!contentPos.isRight) return null;

          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};

          return (
            <ItemWrapper
              key={`right-${index}`}
              className="flex items-start gap-3"
              style={getSpotlightStyle(index)}
              {...variantsProps}
            >
              {/* Number badge */}
              <div
                className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center font-bold text-xl"
                style={{
                  backgroundColor: themeStyles.numberBg,
                  color: themeStyles.numberText,
                }}
              >
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 max-h-[240px] overflow-hidden">
                {item.label && (
                  onStartEditLabel ? (
                    <EditableText
                      value={item.label}
                      isEditing={isEditing && editingText?.field === `content-label-${index}`}
                      onStartEdit={() => onStartEditLabel(index)}
                      onChange={(val) => onUpdateLabel?.(index, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                      className="font-semibold text-lg mb-2 line-clamp-1"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="font-semibold text-lg mb-2 line-clamp-1"
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
                    className="text-base leading-relaxed line-clamp-4"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="text-base leading-relaxed line-clamp-4"
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
