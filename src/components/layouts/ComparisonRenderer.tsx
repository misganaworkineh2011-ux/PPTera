"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { ComparisonContentItem } from "~/lib/layouts/content/comparison";
import { splitLeftAndRight } from "~/lib/layouts/content/comparison";
import EditableText from "~/components/presentation/EditableText";

// --- Constants ---
const CANVAS_HEIGHT = 600;
const CANVAS_WIDTH = 1000;
const ANCHOR_RADIUS = 160; // BIGGER: Large radius for the gray circles
const ARC_RADIUS = 320;    // Pushed out further to clear the big circles
const BUBBLE_RADIUS = 20;

// --- Colors ---
const DEFAULT_COLORS = {
  left: "#009688", // Teal
  right: "#f97316", // Orange
  grayBg: "#f1f5f9", 
  text: "#334155",
  line: "#cbd5e1"
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
};

interface ComparisonRendererProps {
  items: ComparisonContentItem[];
  theme?: Theme;
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
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

export function ComparisonRenderer({
  items,
  theme,
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
}: ComparisonRendererProps) {
  const { left, right } = splitLeftAndRight(items);
  const displayLeft = left.slice(0, 6);
  const displayRight = right.slice(0, 6);

  // Colors
  const leftColor = theme?.colors.primary || DEFAULT_COLORS.left;
  const rightColor = theme?.colors.secondary || theme?.colors.accent || DEFAULT_COLORS.right;

  // --- Math Helpers ---
  const getPosition = (index: number, total: number, isLeft: boolean) => {
    let angle;
    let anchorX;
    
    // Spread Angle: A bit wider since the circles are bigger
    const spread = Math.PI * 0.5; // 90 degrees

    if (isLeft) {
      anchorX = 0; 
      const startAngle = -spread / 2;
      const endAngle = spread / 2;
      const step = total > 1 ? (endAngle - startAngle) / (total - 1) : 0;
      angle = startAngle + (index * step);
    } else {
      anchorX = CANVAS_WIDTH;
      const startAngle = Math.PI + (spread / 2);
      const endAngle = Math.PI - (spread / 2);
      const step = total > 1 ? (endAngle - startAngle) / (total - 1) : 0;
      angle = startAngle + (index * step);
    }

    // Coordinates for the bubble center
    const x = anchorX + ARC_RADIUS * Math.cos(angle);
    const y = (CANVAS_HEIGHT / 2) + ARC_RADIUS * Math.sin(angle);

    // Anchor point (Start of line)
    // Starts exactly at the edge of the big circle
    const lineStartX = anchorX + (ANCHOR_RADIUS) * Math.cos(angle);
    const lineStartY = (CANVAS_HEIGHT / 2) + (ANCHOR_RADIUS) * Math.sin(angle);

    return { x, y, lineStartX, lineStartY };
  };

  const Container = isPresenting ? motion.div : "div";
  const ItemWrapper = isPresenting ? motion.div : "div";

  return (
    <Container
      className={`w-full max-w-7xl mx-auto py-8 relative ${className}`}
      variants={containerVariants}
      initial={isPresenting ? "hidden" : undefined}
      animate={isPresenting ? "visible" : undefined}
    >
      {/* Aspect Ratio Box with Overflow Hidden to cut the circles in half */}
      <div className="relative w-full aspect-[16/9] md:aspect-[2/1] max-h-[600px] overflow-hidden bg-white/5 rounded-xl">
        
        {/* --- 1. Background Anchors (Big Half Circles) --- */}
        
        {/* Left Anchor - Centered on Left Edge (0%) */}
        <div 
          className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 rounded-full z-10 shadow-sm"
          style={{ 
            width: ANCHOR_RADIUS * 2, 
            height: ANCHOR_RADIUS * 2, 
            backgroundColor: DEFAULT_COLORS.grayBg 
          }}
        />

        {/* Right Anchor - Centered on Right Edge (100%) */}
        <div 
          className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 rounded-full z-10 shadow-sm"
          style={{ 
            width: ANCHOR_RADIUS * 2, 
            height: ANCHOR_RADIUS * 2, 
            backgroundColor: DEFAULT_COLORS.grayBg 
          }}
        />

        {/* --- 2. SVG Connector Layer --- */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-0" 
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          preserveAspectRatio="none"
        >
           {/* Left Lines */}
           {displayLeft.map((_, i) => {
             const pos = getPosition(i, displayLeft.length, true);
             return (
               <g key={`line-left-${i}`}>
                 {/* Dot on the rim of the big circle */}
                 <circle cx={pos.lineStartX} cy={pos.lineStartY} r="4" fill={leftColor} />
                 <line 
                    x1={pos.lineStartX} 
                    y1={pos.lineStartY} 
                    x2={pos.x} 
                    y2={pos.y} 
                    stroke={DEFAULT_COLORS.line} 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
               </g>
             );
           })}
           {/* Right Lines */}
           {displayRight.map((_, i) => {
             const pos = getPosition(i, displayRight.length, false);
             return (
               <g key={`line-right-${i}`}>
                 {/* Dot on the rim of the big circle */}
                 <circle cx={pos.lineStartX} cy={pos.lineStartY} r="4" fill={rightColor} />
                 <line 
                    x1={pos.lineStartX} 
                    y1={pos.lineStartY} 
                    x2={pos.x} 
                    y2={pos.y} 
                    stroke={DEFAULT_COLORS.line} 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
               </g>
             );
           })}
        </svg>

        {/* --- 3. Items Layer --- */}
        
        {/* Left Items */}
        {displayLeft.map((item, index) => {
          const pos = getPosition(index, displayLeft.length, true);
          const leftPct = (pos.x / CANVAS_WIDTH) * 100;
          const topPct = (pos.y / CANVAS_HEIGHT) * 100;

          return (
            <ItemWrapper
              key={`left-item-${index}`}
              variants={itemVariants}
              className="absolute flex items-center gap-3 pointer-events-auto"
              style={{ 
                left: `${leftPct}%`, 
                top: `${topPct}%`,
                transform: `translate(-${BUBBLE_RADIUS}px, -50%)`,
                width: 'max-content',
                maxWidth: '240px'
              }}
            >
              <div 
                className="shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                style={{ width: BUBBLE_RADIUS * 2, height: BUBBLE_RADIUS * 2, backgroundColor: leftColor }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="flex-1 text-left">
                {onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${index}`}
                    onStartEdit={() => onStartEditLabel(index)}
                    onChange={(val) => onUpdateLabel?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="font-medium text-sm md:text-base leading-tight text-slate-700"
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

        {/* Right Items */}
        {displayRight.map((item, index) => {
          const pos = getPosition(index, displayRight.length, false);
          const leftPct = (pos.x / CANVAS_WIDTH) * 100;
          const topPct = (pos.y / CANVAS_HEIGHT) * 100;
          const globalIndex = displayLeft.length + index;

          return (
            <ItemWrapper
              key={`right-item-${index}`}
              variants={itemVariants}
              className="absolute flex flex-row-reverse items-center gap-3 pointer-events-auto"
              style={{ 
                left: `${leftPct}%`, 
                top: `${topPct}%`,
                transform: `translate(calc(-100% + ${BUBBLE_RADIUS}px), -50%)`,
                width: 'max-content',
                maxWidth: '240px'
              }}
            >
              <div 
                className="shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                style={{ width: BUBBLE_RADIUS * 2, height: BUBBLE_RADIUS * 2, backgroundColor: rightColor }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="flex-1 text-right">
                {onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${globalIndex}`}
                    onStartEdit={() => onStartEditLabel(globalIndex)}
                    onChange={(val) => onUpdateLabel?.(globalIndex, val)}
                    onFinish={onFinishEditing || (() => {})}
                    className="font-medium text-sm md:text-base leading-tight text-slate-700"
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
    </Container>
  );
}