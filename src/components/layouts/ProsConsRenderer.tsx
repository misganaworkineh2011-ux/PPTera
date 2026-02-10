"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { ProsConsContentItem } from "~/lib/layouts/content/proscons";
import { splitProsAndCons } from "~/lib/layouts/content/proscons";
import EditableText from "~/components/presentation/EditableText";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
};

// --- Styles & Colors ---
interface ThemeStyles {
  prosColor: string;
  consColor: string;
  titleColor: string;
  bodyColor: string;
}

function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  // Use theme colors instead of hardcoded values
  const primaryColor = accentColor || theme?.colors.accent || "#009688";
  const secondaryColor = theme?.colors.secondary || theme?.colors.primary || "#ff8a65";
  
  return {
    prosColor: primaryColor,
    consColor: secondaryColor,
    titleColor: theme?.colors.heading || "#1e293b",
    bodyColor: theme?.colors.textMuted || "#64748b",
  };
}

// --- Icons for Center Diagram ---
const ChatIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="9" cy="10" r="1" fill="white" stroke="none" />
    <circle cx="12" cy="10" r="1" fill="white" stroke="none" />
    <circle cx="15" cy="10" r="1" fill="white" stroke="none" />
  </svg>
);

const MobileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <path d="M12 18h.01" />
    <path d="M17 6H7" /> 
    {/* Added a small chat bubble overlay to match reference feeling */}
    <path d="M17 14l3-3V8a2 2 0 0 0-2-2h-2" strokeWidth="1.5" className="opacity-80"/> 
  </svg>
);

interface ProsConsRendererProps {
  items: ProsConsContentItem[];
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

export function ProsConsRenderer({
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
}: ProsConsRendererProps) {
  const themeStyles = getThemeStyles(theme, accentColor);
  const { pros, cons } = splitProsAndCons(items);
  
  // Ensure we display enough items to fill the lists (up to 6 per side to match layout)
  const displayPros = pros.slice(0, 6);
  const displayCons = cons.slice(0, 6);

  const Container = isPresenting ? motion.div : "div";
  const ItemWrapper = isPresenting ? motion.div : "div";

  // --- SVG Paths for Puzzle Circle ---
  // Size 300x300. 
  // Left side (Teal): Has a "male" bump on top, "female" slot on bottom.
  // Right side (Orange): Has "female" slot on top, "male" bump on bottom.
  const center = 150;
  const r = 150;
  
  // Left Path (Teal)
  // Start Top Center -> Bump Out (Right) -> Center -> Bump In (Left) -> Bottom Center -> Arc around left
  const leftPath = `
    M ${center},0 
    L ${center},50 
    C ${center + 40},50 ${center + 40},100 ${center},100
    L ${center},200
    C ${center - 40},200 ${center - 40},250 ${center},250
    L ${center},300
    A ${r},${r} 0 0 1 ${center},0
    Z
  `;

  // Right Path (Orange)
  // Exact inverse of the left path logic for the middle seam
  const rightPath = `
    M ${center},0 
    L ${center},50 
    C ${center + 40},50 ${center + 40},100 ${center},100
    L ${center},200
    C ${center - 40},200 ${center - 40},250 ${center},250
    L ${center},300
    A ${r},${r} 0 0 0 ${center},0
    Z
  `;

  const getSpotlightStyle = (index: number): React.CSSProperties => {
    if (!isSpotlightMode || spotlightIndex === undefined) return {};
    const isHighlighted = spotlightIndex === index;
    return {
      opacity: isHighlighted ? 1 : 0.3,
    };
  };

  return (
    <Container 
      className={`w-full max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 ${className}`}
      key={animationKey}
      variants={containerVariants}
      initial={isPresenting ? "hidden" : undefined}
      animate={isPresenting ? "visible" : undefined}
    >
      
      {/* --- LEFT SECTION (Pros) --- */}
      <div className="flex-1 flex gap-4 w-full justify-end">
        {/* Text Column */}
        <div className="flex flex-col gap-6 py-4 flex-1">
          {displayPros.map((item, index) => (
            <ItemWrapper 
              key={`pro-text-${index}`}
              variants={itemVariants}
              className="flex flex-col items-end text-right h-12 justify-center" // Fixed height to align with pills
              style={getSpotlightStyle(index)}
            >
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="font-bold text-xs md:text-sm leading-tight text-gray-800"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h4 className="font-bold text-xs md:text-sm leading-tight text-gray-800">
                    {item.label}
                  </h4>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${index}`}
                  onStartEdit={() => onStartEditText(index)}
                  onChange={(val) => onUpdateText?.(index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-[10px] md:text-xs leading-tight opacity-75 mt-0.5"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-[10px] md:text-xs leading-tight opacity-75 mt-0.5" style={{ color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </ItemWrapper>
          ))}
        </div>

        {/* Number Pill Column (Left) */}
        <div className="hidden md:flex flex-col items-center bg-gray-100 rounded-full py-4 px-1.5 gap-6 h-fit shrink-0">
          {displayPros.map((_, index) => (
            <ItemWrapper 
              key={`pro-num-${index}`}
              variants={itemVariants}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm z-10"
              style={{ backgroundColor: themeStyles.prosColor }}
            >
              {String(index + 1).padStart(2, '0')}
            </ItemWrapper>
          ))}
        </div>
      </div>


      {/* --- CENTER SECTION (Diagram) --- */}
      <div 
        className="shrink-0 relative w-[220px] h-[220px] md:w-[300px] md:h-[300px]"
      >
        <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-xl">
          {/* Left Piece (Teal) */}
          <path d={leftPath} fill={themeStyles.prosColor} />
          
          {/* Right Piece (Orange) */}
          <path d={rightPath} fill={themeStyles.consColor} />
          
          {/* Center Hole */}
          <circle cx={center} cy={center} r="50" fill="white" />
        </svg>

        {/* Labels Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Pros Label */}
          <div className="absolute top-[35%] left-[20%] text-center flex flex-col items-center">
            <div className="mb-2"><ChatIcon /></div>
            <span className="text-white text-xl md:text-2xl font-bold tracking-wide">Pros</span>
          </div>

          {/* Cons Label */}
          <div className="absolute bottom-[35%] right-[20%] text-center flex flex-col items-center">
            <span className="text-white text-xl md:text-2xl font-bold tracking-wide mb-2">Cons</span>
            <div><MobileIcon /></div>
          </div>
        </div>
      </div>


      {/* --- RIGHT SECTION (Cons) --- */}
      <div className="flex-1 flex gap-4 w-full justify-start">
        {/* Number Pill Column (Right) */}
        <div className="hidden md:flex flex-col items-center bg-gray-100 rounded-full py-4 px-1.5 gap-6 h-fit shrink-0">
          {displayCons.map((_, index) => (
            <ItemWrapper 
              key={`con-num-${index}`}
              variants={itemVariants}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm z-10"
              style={{ backgroundColor: themeStyles.consColor }}
            >
              {String(index + 1).padStart(2, '0')}
            </ItemWrapper>
          ))}
        </div>

        {/* Text Column */}
        <div className="flex flex-col gap-6 py-4 flex-1">
          {displayCons.map((item, index) => (
            <ItemWrapper 
              key={`con-text-${index}`}
              variants={itemVariants}
              className="flex flex-col items-start text-left h-12 justify-center"
              style={getSpotlightStyle(displayPros.length + index)}
            >
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${displayPros.length + index}`}
                    onStartEdit={() => onStartEditLabel(displayPros.length + index)}
                    onChange={(val) => onUpdateLabel?.(displayPros.length + index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="font-bold text-xs md:text-sm leading-tight text-gray-800"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h4 className="font-bold text-xs md:text-sm leading-tight text-gray-800">
                    {item.label}
                  </h4>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${displayPros.length + index}`}
                  onStartEdit={() => onStartEditText(displayPros.length + index)}
                  onChange={(val) => onUpdateText?.(displayPros.length + index, val)}
                  onFinish={onFinishEditing || (() => {})}
                  className="text-[10px] md:text-xs leading-tight opacity-75 mt-0.5"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-[10px] md:text-xs leading-tight opacity-75 mt-0.5" style={{ color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </ItemWrapper>
          ))}
        </div>
      </div>

    </Container>
  );
}