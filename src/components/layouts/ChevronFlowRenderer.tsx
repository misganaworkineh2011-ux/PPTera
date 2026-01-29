"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { ChevronContentItem } from "~/lib/layouts/content/chevron";
import { getChevronColors, getChevronPath } from "~/lib/layouts/content/chevron";
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
    x: -40,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface ThemeStyles {
  titleColor: string;
  bodyColor: string;
  numberColor: string;
  iconColor: string;
}

function getThemeStyles(theme?: Theme): ThemeStyles {
  if (!theme) {
    return {
      titleColor: "#1e293b",
      bodyColor: "#64748b",
      numberColor: "#ffffff",
      iconColor: "#ffffff",
    };
  }

  return {
    titleColor: theme.colors.heading || "#1e293b",
    bodyColor: theme.colors.textMuted || "#64748b",
    numberColor: "#ffffff",
    iconColor: "#ffffff",
  };
}

interface ChevronFlowRendererProps {
  items: ChevronContentItem[];
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

export function ChevronFlowRenderer({
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
}: ChevronFlowRendererProps) {
  const displayItems = items.slice(0, 6); // Max 6 items
  const themeStyles = getThemeStyles(theme);
  const itemCount = displayItems.length;

  // Chevron dimensions
  const chevronWidth = 250;
  const chevronHeight = 180;
  const arrowWidth = 30;
  const overlap = 25; // How much chevrons overlap

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
    <Container className={`w-full py-8 ${className}`} {...containerProps}>
      {/* Chevron arrows */}
      <div className="flex items-center justify-center mb-8" style={{ marginLeft: `${arrowWidth}px` }}>
        <div className="flex items-center" style={{ marginLeft: `-${overlap * (itemCount - 1)}px` }}>
          {displayItems.map((item, index) => {
            const colors = getChevronColors(index, itemCount, accentColor, theme?.colors.secondary);
            const chevronPath = getChevronPath(chevronWidth, chevronHeight, arrowWidth);
            
            const ItemWrapper = isPresenting ? motion.div : "div";
            const variantsProps = isPresenting ? { variants: itemVariants } : {};

            return (
              <ItemWrapper
                key={index}
                className="relative flex-shrink-0"
                style={{
                  width: `${chevronWidth}px`,
                  height: `${chevronHeight}px`,
                  marginLeft: index > 0 ? `-${overlap}px` : "0",
                  zIndex: itemCount - index,
                  ...getSpotlightStyle(index),
                }}
                {...variantsProps}
              >
                {/* SVG Chevron */}
                <svg
                  width={chevronWidth}
                  height={chevronHeight}
                  viewBox={`0 0 ${chevronWidth} ${chevronHeight}`}
                  className="absolute inset-0"
                  style={{ overflow: "visible" }}
                >
                  <path
                    d={chevronPath}
                    fill={colors.bg}
                    stroke="white"
                    strokeWidth="3"
                  />
                </svg>

                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-6">
                  {/* Number */}
                  <div
                    className="text-2xl font-bold mb-4"
                    style={{ color: themeStyles.numberColor }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Icon */}
                  {item.icon && (
                    <div
                      className="text-4xl mb-2"
                      style={{ color: themeStyles.iconColor }}
                    >
                      {item.icon}
                    </div>
                  )}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </div>

      {/* Content descriptions below */}
      <div className="flex items-start justify-center gap-4 px-8">
        {displayItems.map((item, index) => {
          const ItemWrapper = isPresenting ? motion.div : "div";
          const variantsProps = isPresenting ? { variants: itemVariants } : {};
          const colors = getChevronColors(index, itemCount, accentColor, theme?.colors.secondary);

          return (
            <ItemWrapper
              key={index}
              className="flex-1"
              style={{
                maxWidth: `${chevronWidth - 10}px`,
                ...getSpotlightStyle(index),
              }}
              {...variantsProps}
            >
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
                    className="font-bold text-base mb-2 leading-tight"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3
                    className="font-bold text-base mb-2 leading-tight"
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

              {/* Color indicator bar */}
              <div
                className="mt-3 h-1 rounded-full"
                style={{
                  backgroundColor: colors.bg,
                  width: "70%",
                }}
              />
            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}
