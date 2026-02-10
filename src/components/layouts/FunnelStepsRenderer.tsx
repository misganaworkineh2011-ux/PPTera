"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { FunnelContentItem } from "~/lib/layouts/content/funnel";
import { getFunnelColors } from "~/lib/layouts/content/funnel";
import EditableText from "~/components/presentation/EditableText";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Faster stagger
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20, // Less movement
    scale: 0.98,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface ThemeStyles {
  titleColor: string;
  bodyColor: string;
  iconBg: string;
  iconBorder: string;
}

function getThemeStyles(theme?: Theme): ThemeStyles {
  if (!theme) {
    return {
      titleColor: "#1e293b",
      bodyColor: "#64748b",
      iconBg: "#ffffff",
      iconBorder: "#e5e7eb",
    };
  }

  return {
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    iconBg: "#ffffff",
    iconBorder: theme.colors.border || "#e5e7eb",
  };
}

interface FunnelStepsRendererProps {
  items: FunnelContentItem[];
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
  isOwner?: boolean;
  isHovered?: boolean;
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

export function FunnelStepsRenderer({
  items,
  theme,
  accentColor,
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
}: FunnelStepsRendererProps) {
  const displayItems = items.slice(0, 6); 
  const themeStyles = getThemeStyles(theme);
  const itemCount = displayItems.length;

  // UPDATED: Much smaller dimensions
  const barHeight = 42; // Reduced from 60
  const iconSize = 32;  // Reduced from 50
  
  // UPDATED: Control width in pixels to keep it narrow
  const maxBarWidthPx = 220; 
  const minBarWidthPx = 120;

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
    <Container className={`w-full py-2 px-4 ${className}`} {...containerProps}>
      {/* UPDATED: Reduced gap from gap-3 to gap-2 (0.5rem) */}
      <div className="flex flex-col gap-2">
        {displayItems.map((item, index) => {
          const colors = getFunnelColors(index, itemCount, accentColor, theme?.colors.secondary);
          
          // Calculate specific width in pixels so it doesn't take over the screen
          const widthStep = (maxBarWidthPx - minBarWidthPx) / (itemCount - 1 || 1);
          const currentWidthPx = maxBarWidthPx - (index * widthStep);
          
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};

          return (
            <ItemWrapper
              key={index}
              className="flex items-center gap-4"
              style={getSpotlightStyle(index)}
              {...variantsProps}
            >
              {/* Funnel bar with icon */}
              <div 
                className="relative flex items-center rounded-full shadow-md flex-shrink-0"
                style={{
                  width: `${currentWidthPx}px`,
                  height: `${barHeight}px`,
                  background: colors.bg,
                }}
              >
                {/* Icon circle */}
                <div
                  className="absolute left-1.5 flex items-center justify-center rounded-full shadow-sm"
                  style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    backgroundColor: themeStyles.iconBg,
                    border: `2px solid ${themeStyles.iconBorder}`,
                  }}
                >
                  {item.icon ? (
                    <span className="text-sm">{item.icon}</span>
                  ) : (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: colors.text }}
                    />
                  )}
                </div>

                {/* Step label - Text size reduced to fit smaller bar */}
                <div
                  className="ml-12 font-bold text-xs tracking-wider"
                  style={{ color: colors.text }}
                >
                  STEP {index + 1}
                </div>
              </div>

              {/* Content on the right - flex-1 takes all remaining space */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                {/* Label */}
                {item.label && (
                  onStartEditLabel ? (
                    <EditableText
                      value={item.label}
                      isEditing={isEditing && editingText?.field === `content-label-${index}`}
                      onStartEdit={() => onStartEditLabel(index)}
                      onChange={(val) => onUpdateLabel?.(index, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                      className="font-bold text-sm leading-tight mb-0.5"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="font-bold text-sm leading-tight mb-0.5"
                      style={{ color: themeStyles.titleColor }}
                    >
                      {item.label}
                    </h3>
                  )
                )}

                {/* Description */}
                {onStartEditText ? (
                  <EditableText
                    value={item.text}
                    isEditing={isEditing && editingText?.field === `content-text-${index}`}
                    onStartEdit={() => onStartEditText(index)}
                    onChange={(val) => onUpdateText?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                    className="text-xs leading-relaxed"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="text-xs leading-relaxed"
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