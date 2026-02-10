"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BeforeAfterContentItem } from "~/lib/layouts/content/beforeafter";
import { splitBeforeAndAfter } from "~/lib/layouts/content/beforeafter";
import EditableText from "~/components/presentation/EditableText";

// --- Configuration ---
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 500;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;
const HUB_RADIUS = 80; // Radius of the central white circle
const ITEM_RADIUS = 240; // Distance from center to item nodes

// --- Styles & Colors ---
interface ThemeStyles {
  beforeColor: string;
  afterColor: string;
  titleColor: string;
  bodyColor: string;
}

function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  const primaryColor = accentColor || theme?.colors.accent || "#f97316"; // Orange for before
  const secondaryColor = theme?.colors.secondary || theme?.colors.primary || "#14b8a6"; // Teal for after
  
  return {
    beforeColor: primaryColor,
    afterColor: secondaryColor,
    titleColor: theme?.colors.heading || "#1e293b",
    bodyColor: theme?.colors.textMuted || "#64748b",
  };
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
};

interface BeforeAfterRendererProps {
  items: BeforeAfterContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  isPresenting?: boolean;
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

export function BeforeAfterRenderer({
  items,
  theme,
  accentColor,
  className = "",
  isPresenting = false,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  isOwner = false,
  isHovered = false,
}: BeforeAfterRendererProps) {
  const themeStyles = getThemeStyles(theme, accentColor);
  const { before, after } = splitBeforeAndAfter(items);
  
  // Limit to 6 items per side to maintain the visual arc
  const displayBefore = before.slice(0, 6);
  const displayAfter = after.slice(0, 6);

  // Helper to calculate position on the arc
  // We want the items to span roughly 120 degrees vertically on each side
  const getPosition = (index: number, total: number, isLeft: boolean) => {
    // Angles in radians. 
    // Left side center is PI (180deg). We want to span from approx 240deg to 120deg (Top to Bottom)
    // Right side center is 0 (0deg). We want to span from approx 300deg (-60) to 60deg
    
    const spread = Math.PI * 0.65; // Total angle spread
    const startAngleLeft = Math.PI + (spread / 2); 
    const step = spread / (Math.max(total - 1, 1));
    
    let angle;
    if (isLeft) {
      // For left side, iterate top-down
      angle = startAngleLeft - (index * step);
    } else {
      // For right side, iterate top-down (which is negative angle to positive angle)
      const startAngleRight = -(spread / 2);
      angle = startAngleRight + (index * step);
    }

    return {
      x: CENTER_X + ITEM_RADIUS * Math.cos(angle),
      y: CENTER_Y + ITEM_RADIUS * Math.sin(angle),
      angle
    };
  };

  const Container = isPresenting ? motion.div : "div";
  const ItemWrapper = isPresenting ? motion.div : "div";

  return (
    <Container 
      className={`w-full max-w-[1000px] mx-auto py-4 relative ${className}`}
      variants={containerVariants}
      initial={isPresenting ? "hidden" : undefined}
      animate={isPresenting ? "visible" : undefined}
    >
      {/* Aspect Ratio Box to keep geometry intact */}
      <div className="relative w-full aspect-[16/9] md:aspect-[2/1] max-h-[600px]">
        
        {/* --- 1. SVG Layer for Connecting Lines --- */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-0" 
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        >
          {/* Before Lines */}
          {displayBefore.map((_, i) => {
            const pos = getPosition(i, displayBefore.length, true);
            return (
              <line
                key={`line-before-${i}`}
                x1={pos.x}
                y1={pos.y}
                x2={CENTER_X}
                y2={CENTER_Y}
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            );
          })}
          {/* After Lines */}
          {displayAfter.map((_, i) => {
            const pos = getPosition(i, displayAfter.length, false);
            return (
              <line
                key={`line-after-${i}`}
                x1={pos.x}
                y1={pos.y}
                x2={CENTER_X}
                y2={CENTER_Y}
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            );
          })}
        </svg>


        {/* --- 2. Central Hub --- */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center z-20"
          style={{ width: `${HUB_RADIUS * 2}px`, height: `${HUB_RADIUS * 2}px` }}
        >
          {/* Inner gray ring/border decoration */}
          <div className="absolute inset-2 rounded-full border border-gray-100" />
          
          <h2 className="text-xl md:text-2xl font-black text-center leading-tight px-4 text-slate-800 z-10">
            Business<br/>Automation
          </h2>
        </div>
        
        {/* Headers */}
        <div className="absolute top-4 left-[25%] text-xl font-bold" style={{ color: themeStyles.beforeColor }}>Before</div>
        <div className="absolute top-4 right-[25%] text-xl font-bold" style={{ color: themeStyles.afterColor }}>After</div>


        {/* --- 3. Items Layer --- */}
        <div className="absolute inset-0 w-full h-full z-10">
          
          {/* Left Side (Before) */}
          {displayBefore.map((item, index) => {
            // Calculate pixel positions scaled to % for responsiveness
            const rawPos = getPosition(index, displayBefore.length, true);
            const leftPct = (rawPos.x / CANVAS_WIDTH) * 100;
            const topPct = (rawPos.y / CANVAS_HEIGHT) * 100;

            return (
              <ItemWrapper
                key={`before-${index}`}
                variants={itemVariants}
                className="absolute flex items-center justify-end gap-4 w-[250px]"
                style={{ 
                  left: `${leftPct}%`, 
                  top: `${topPct}%`,
                  transform: 'translate(-100%, -50%)', // Anchor right side of the wrapper to the point
                }}
              >
                {/* Text Label (Left aligned) */}
                <div className="flex flex-col items-end text-right">
                  {onStartEditLabel ? (
                    <EditableText
                      value={item.label || ""}
                      isEditing={isEditing && editingText?.field === `content-label-${index}`}
                      onStartEdit={() => onStartEditLabel(index)}
                      onChange={(val) => onUpdateLabel?.(index, val)}
                      onFinish={onFinishEditing || (() => {})}
                      className="font-medium text-sm md:text-base leading-tight text-slate-700"
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <span className="font-medium text-sm md:text-base leading-tight text-slate-700">
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Number Bubble (The Anchor) */}
                <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                  {/* Outer Ring */}
                  <div 
                    className="absolute inset-0 rounded-full border-2 opacity-60" 
                    style={{ borderColor: themeStyles.beforeColor }} 
                  />
                  {/* Inner Gap - simulated by just sizing the inner circle down */}
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: themeStyles.beforeColor }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </ItemWrapper>
            );
          })}

          {/* Right Side (After) */}
          {displayAfter.map((item, index) => {
            const rawPos = getPosition(index, displayAfter.length, false);
            const leftPct = (rawPos.x / CANVAS_WIDTH) * 100;
            const topPct = (rawPos.y / CANVAS_HEIGHT) * 100;
            const globalIndex = displayBefore.length + index;

            return (
              <ItemWrapper
                key={`after-${index}`}
                variants={itemVariants}
                className="absolute flex items-center justify-start gap-4 w-[250px]"
                style={{ 
                  left: `${leftPct}%`, 
                  top: `${topPct}%`,
                  transform: 'translate(0%, -50%)', // Anchor left side of the wrapper to the point
                }}
              >
                {/* Number Bubble (The Anchor) */}
                <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                  {/* Outer Ring */}
                  <div 
                    className="absolute inset-0 rounded-full border-2 opacity-60" 
                    style={{ borderColor: themeStyles.afterColor }} 
                  />
                  {/* Inner Circle */}
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{ backgroundColor: themeStyles.afterColor }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Text Label (Right aligned) */}
                <div className="flex flex-col items-start text-left">
                   {onStartEditLabel ? (
                    <EditableText
                      value={item.label || ""}
                      isEditing={isEditing && editingText?.field === `content-label-${globalIndex}`}
                      onStartEdit={() => onStartEditLabel(globalIndex)}
                      onChange={(val) => onUpdateLabel?.(globalIndex, val)}
                      onFinish={onFinishEditing || (() => {})}
                      className="font-medium text-sm md:text-base leading-tight text-slate-700"
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <span className="font-medium text-sm md:text-base leading-tight text-slate-700">
                      {item.label}
                    </span>
                  )}
                </div>
              </ItemWrapper>
            );
          })}
        </div>
      </div>
    </Container>
  );
}