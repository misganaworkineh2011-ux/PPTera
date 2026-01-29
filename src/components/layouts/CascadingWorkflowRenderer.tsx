"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { CascadingContentItem } from "~/lib/layouts/content/cascading";
import EditableText from "~/components/presentation/EditableText";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }
  },
};

// --- Custom Colors ---
function getStepColors(index: number, accentColor?: string, secondaryColor?: string) {
  // If theme colors provided, use them
  if (accentColor) {
    // Create variations of the accent color
    return {
      main: accentColor,
      accent: accentColor,
      bg: `${accentColor}15`, // 15% opacity
    };
  }
  
  // Fallback: Original color scheme
  const STEP_COLORS = [
    { main: "#65a30d", accent: "#84cc16", bg: "#f7fee7" }, // Green
    { main: "#0891b2", accent: "#22d3ee", bg: "#ecfeff" }, // Cyan
    { main: "#0e7490", accent: "#06b6d4", bg: "#f0fdfa" }, // Dark Teal
    { main: "#1e1b4b", accent: "#312e81", bg: "#eef2ff" }, // Navy
  ];
  
  return STEP_COLORS[index % STEP_COLORS.length]!;
}

interface ConnectorLineProps {
  color: string;
  isLeft: boolean;
}

// Compact connector line
const ConnectorLine = ({ color, isLeft }: ConnectorLineProps) => (
  <svg
    className={`w-12 h-10 md:w-20 md:h-12 flex-shrink-0 ${isLeft ? "" : "transform scale-x-[-1]"}`}
    viewBox="0 0 100 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="5" cy="5" r="4" fill="white" stroke={color} strokeWidth="2.5" />
    <path
      d="M 10 5 L 40 5 L 90 55 H 100"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

interface ThemeStyles {
  titleColor: string;
  bodyColor: string;
}

function getThemeStyles(theme?: Theme): ThemeStyles {
  return {
    titleColor: theme?.colors.heading || "#1e293b",
    bodyColor: theme?.colors.textMuted || "#64748b",
  };
}

interface CascadingWorkflowRendererProps {
  items: CascadingContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
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
}

export function CascadingWorkflowRenderer({
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
}: CascadingWorkflowRendererProps) {
  const displayItems = items.slice(0, 4);
  const themeStyles = getThemeStyles(theme);

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
      filter: isHighlighted ? 'none' : 'grayscale(80%)',
      // Ensure highlighted item pops to front
      zIndex: isHighlighted ? 50 : undefined, 
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const ItemWrapper = isPresenting ? motion.div : "div";

  return (
    <Container
      className={`w-full max-w-5xl mx-auto py-8 px-4 ${className}`}
      key={animationKey}
      initial={isPresenting ? "hidden" : undefined}
      animate={isPresenting ? "visible" : undefined}
      variants={containerVariants}
    >
      {/* 
        Using -space-y-6 or -space-y-10 creates the overlap effect.
        This pulls the visual centers of the boxes much closer.
      */}
      <div className="flex flex-col relative">
        {displayItems.map((item, index) => {
          const isTextLeft = index % 2 === 0;
          const colorStep = getStepColors(index, accentColor, theme?.colors.secondary);
          const mainColor = colorStep.main;
          const bgColor = colorStep.bg;

          return (
            <ItemWrapper
              key={index}
              variants={itemVariants}
              // Negative margin top (-mt-10) pulls rows together. 
              // z-index ensures correct stacking order (usually top box over bottom, or vice versa)
              className={`grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 md:gap-4 items-center relative ${index !== 0 ? '-mt-10 md:-mt-12' : ''}`}
              style={{ 
                zIndex: displayItems.length - index, // Stack earlier items on top
                ...getSpotlightStyle(index)
              }}
            >
              
              {/* --- LEFT COLUMN --- */}
              <div className="flex justify-end items-center h-full pointer-events-none">
                {isTextLeft ? (
                  <div className="flex items-start gap-2 md:gap-4 text-right pointer-events-auto pb-8 md:pb-0">
                    <div className="flex flex-col items-end max-w-[280px]">
                      {item.label && (
                        <div className="mb-1">
                           {onStartEditLabel ? (
                            <EditableText
                              value={item.label}
                              isEditing={isEditing && editingText?.field === `content-label-${index}`}
                              onStartEdit={() => onStartEditLabel(index)}
                              onChange={(val) => onUpdateLabel?.(index, val)}
                              onFinish={onFinishEditing || (() => {})}
                              className="font-bold text-lg leading-tight"
                              style={{ color: themeStyles.titleColor }}
                              isOwner={isOwner}
                              isHovered={isHovered}
                            />
                          ) : (
                            <h3 className="font-bold text-lg leading-tight" style={{ color: themeStyles.titleColor }}>
                              {item.label}
                            </h3>
                          )}
                        </div>
                      )}
                      {onStartEditText ? (
                        <EditableText
                          value={item.text}
                          isEditing={isEditing && editingText?.field === `content-text-${index}`}
                          onStartEdit={() => onStartEditText(index)}
                          onChange={(val) => onUpdateText?.(index, val)}
                          onFinish={onFinishEditing || (() => {})}
                          className="text-sm leading-snug"
                          style={{ color: themeStyles.bodyColor }}
                          isOwner={isOwner}
                          isHovered={isHovered}
                        />
                      ) : (
                        <p className="text-sm leading-snug" style={{ color: themeStyles.bodyColor }}>
                          {item.text}
                        </p>
                      )}
                    </div>
                    <div className="pt-1 hidden md:block">
                       <ConnectorLine color={mainColor} isLeft={true} />
                    </div>
                  </div>
                ) : (
                  // Empty spacer for the left side when text is on right
                  <div className="hidden md:flex items-center justify-end pr-6 w-full opacity-10">
                     <span className="text-5xl font-black" style={{ color: mainColor }}>
                        {String(index + 1).padStart(2, '0')}
                     </span>
                  </div>
                )}
              </div>

              {/* --- CENTER COLUMN (The Box) --- */}
              <div className="flex justify-center relative z-10 my-2">
                <div 
                  className="w-48 h-20 md:w-60 md:h-24 rounded border-[3px] flex items-center justify-center relative bg-white shadow-md"
                  style={{ 
                    borderColor: mainColor,
                    background: `linear-gradient(135deg, white 40%, ${bgColor} 100%)`
                  }}
                >
                  {/* Icon */}
                  {item.icon && (
                    <div className="text-3xl md:text-4xl" style={{ color: mainColor }}>
                      {item.icon}
                    </div>
                  )}
                  {/* Inner border decoration */}
                  <div className="absolute inset-1 border opacity-30 rounded-sm pointer-events-none" style={{ borderColor: mainColor }} />
                </div>
              </div>

              {/* --- RIGHT COLUMN --- */}
              <div className="flex justify-start items-center h-full pointer-events-none">
                {!isTextLeft ? (
                  <div className="flex items-start gap-2 md:gap-4 text-left pointer-events-auto pb-8 md:pb-0">
                    <div className="pt-1 hidden md:block">
                        <ConnectorLine color={mainColor} isLeft={false} />
                    </div>
                    <div className="flex flex-col items-start max-w-[280px]">
                      {item.label && (
                        <div className="mb-1">
                           {onStartEditLabel ? (
                            <EditableText
                              value={item.label}
                              isEditing={isEditing && editingText?.field === `content-label-${index}`}
                              onStartEdit={() => onStartEditLabel(index)}
                              onChange={(val) => onUpdateLabel?.(index, val)}
                              onFinish={onFinishEditing || (() => {})}
                              className="font-bold text-lg leading-tight"
                              style={{ color: themeStyles.titleColor }}
                              isOwner={isOwner}
                              isHovered={isHovered}
                            />
                          ) : (
                            <h3 className="font-bold text-lg leading-tight" style={{ color: themeStyles.titleColor }}>
                              {item.label}
                            </h3>
                          )}
                        </div>
                      )}
                      {onStartEditText ? (
                        <EditableText
                          value={item.text}
                          isEditing={isEditing && editingText?.field === `content-text-${index}`}
                          onStartEdit={() => onStartEditText(index)}
                          onChange={(val) => onUpdateText?.(index, val)}
                          onFinish={onFinishEditing || (() => {})}
                          className="text-sm leading-snug"
                          style={{ color: themeStyles.bodyColor }}
                          isOwner={isOwner}
                          isHovered={isHovered}
                        />
                      ) : (
                        <p className="text-sm leading-snug" style={{ color: themeStyles.bodyColor }}>
                          {item.text}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center justify-start pl-6 w-full opacity-10">
                     <span className="text-5xl font-black" style={{ color: mainColor }}>
                        {String(index + 1).padStart(2, '0')}
                     </span>
                  </div>
                )}
              </div>

            </ItemWrapper>
          );
        })}
      </div>
    </Container>
  );
}