"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type {
  SequenceLayout,
  SequenceLayoutType,
  SequenceContentItem,
} from "~/lib/layouts/content/sequence";
import {
  getSequenceLayoutById,
  getBaseSequenceStyles,
  getRecommendedSequenceLayout,
} from "~/lib/layouts/content/sequence";
import EditableText from "./EditableText";

// Animation variants for staggered sequence animations
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

const sequenceVariants = {
  hidden: { 
    opacity: 0, 
    y: 15,
    scale: 0.97,
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface SequenceLayoutRendererProps {
  layoutId?: SequenceLayoutType;
  items: SequenceContentItem[];
  theme: Theme;
  compact?: boolean;
  showIcons?: boolean;
  className?: string;
  isNarrowSpace?: boolean; // true when image is left/right, false when top/bottom
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
  // Spotlight props
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

// Helper function to get spotlight styling for content elements
const getSpotlightStyle = (itemIndex: number, spotlightIndex?: number, isSpotlightMode?: boolean): React.CSSProperties => {
  if (!isSpotlightMode || spotlightIndex === undefined) return {};
  const isHighlighted = spotlightIndex === itemIndex;
  return {
    opacity: isHighlighted ? 1 : 0.15,
    transform: isHighlighted ? 'scale(1.02)' : 'scale(0.98)',
    transition: 'all 0.4s ease-out',
    filter: isHighlighted ? 'drop-shadow(0 0 30px rgba(255,255,255,0.4))' : 'none',
    position: 'relative' as const,
    zIndex: isHighlighted ? 10 : 1,
  };
};

export default function SequenceLayoutRenderer({
  layoutId,
  items,
  theme,
  compact = false,
  showIcons = true,
  className = "",
  isNarrowSpace = false,
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
}: SequenceLayoutRendererProps) {
  const [hoveredBoxIndex, setHoveredBoxIndex] = useState<number | null>(null);

  // Determine effective spotlight state (prop or local hover)
  // Apply spotlight effects in editor mode too when hovering
  const effectiveIsSpotlightMode = isSpotlightMode;
  const effectiveSpotlightIndex = spotlightIndex;

  const getStyle = (index: number) => {
    const spotlightStyle = getSpotlightStyle(index, effectiveSpotlightIndex ?? undefined, effectiveIsSpotlightMode);
    return spotlightStyle;
  };
  
  const layout = layoutId
    ? getSequenceLayoutById(layoutId) || getRecommendedSequenceLayout(items.length, isNarrowSpace)
    : getRecommendedSequenceLayout(items.length, isNarrowSpace);

  if (!layout || items.length === 0) return null;

  const baseStyles = getBaseSequenceStyles(theme);

  // Container and item wrapper for animations
  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? { 
    key: animationKey,
    variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};

  // Render dot or icon marker
  const renderMarker = (item: SequenceContentItem, index: number) => {
    const markerSize = compact ? "12px" : "16px";
    const iconSize = compact ? "24px" : "32px";
    
    if (item.icon && showIcons) {
      return (
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0 z-10"
          style={{
            backgroundColor: baseStyles.dotColor,
            width: iconSize,
            height: iconSize,
            color: "white",
            fontSize: compact ? "14px" : "18px",
            boxShadow: "0 0 0 4px rgba(255,255,255,0.5)", // White halo effect
          }}
        >
          {item.icon}
        </div>
      );
    }
    
    // Default dot
    return (
      <div
        className="rounded-full flex-shrink-0 z-10"
        style={{
          backgroundColor: baseStyles.dotColor,
          width: markerSize,
          height: markerSize,
          boxShadow: "0 0 0 4px rgba(255,255,255,0.5)", // White halo effect
        }}
      />
    );
  };

  // Render content item (title + text)
  const renderContent = (item: SequenceContentItem, index: number, align: "left" | "center" | "right" = "left") => {
    const isCenter = align === "center";
    const isRight = align === "right";
    
    return (
      <div className={`flex flex-col ${isCenter ? "items-center text-center" : isRight ? "items-end text-right" : "items-start text-left"}`}>
        {item.label && (
          onStartEditLabel ? (
            <EditableText
              value={item.label}
              isEditing={isEditing && editingText?.field === `content-label-${index}`}
              onStartEdit={() => onStartEditLabel(index)}
              onChange={(val) => onUpdateLabel?.(index, val)}
              onFinish={onFinishEditing || (() => {})}
              onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
              className="font-serif mb-2"
              style={{
                color: baseStyles.textColor,
                fontSize: compact ? "1.1rem" : "1.35rem",
                fontWeight: "600",
                textAlign: align,
                width: "100%",
              }}
              isOwner={isOwner}
              isHovered={isHovered}
            />
          ) : (
            <h3
              className="font-serif mb-2"
              style={{
                color: baseStyles.textColor,
                fontSize: compact ? "1.1rem" : "1.35rem",
                fontWeight: "600",
                width: "100%",
              }}
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
            style={{
              color: baseStyles.dimColor,
              fontSize: compact ? "0.85rem" : "0.95rem",
              lineHeight: 1.6,
              textAlign: align,
              width: "100%",
            }}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        ) : (
          <p
            style={{
              color: baseStyles.dimColor,
              fontSize: compact ? "0.85rem" : "0.95rem",
              lineHeight: 1.6,
              width: "100%",
            }}
          >
            {item.text}
          </p>
        )}
      </div>
    );
  };

  // Style 1: Horizontal Top Process
  if (layout.id === "sequence-style-1") {
    return (
      <Container className={className} style={{ width: "100%" }} {...containerProps}>
        {/* Top horizontal line */}
        <div className="relative mb-8 pt-4">
          <div
            className="absolute top-4 left-0 right-0"
            style={{
              height: "2px",
              backgroundColor: `${baseStyles.lineColor}40`, // More subtle line
            }}
          />
          <div className="relative flex justify-between items-start">
            {items.map((item, index) => {
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);
              
              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper key={index} className="flex flex-col items-center flex-1" {...itemProps}>
                  {/* Marker on line */}
                  <div className="relative z-10 -mt-[calc(8px)]"> {/* Half height offset */}
                    {renderMarker(item, index)}
                  </div>
                  
                  {/* Vertical connector line */}
                  <div 
                    className="w-px h-8 mb-4" 
                    style={{ backgroundColor: `${baseStyles.lineColor}40` }}
                  />
                  
                  {/* Content */}
                  <div className="px-2 w-full">
                    {renderContent(item, index, "center")}
                  </div>
                </ItemWrapper>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  // Style 2: Horizontal Timeline (centered with vertical connectors)
  // Content alternates above and below the center line
  if (layout.id === "sequence-style-2") {
    return (
      <Container className={className} style={{ width: "100%" }} {...containerProps}>
        {/* Container with grid layout for precise positioning */}
        <div className="relative w-full">
          
          {/* TOP ROW - Content that appears ABOVE the line */}
          <div className="flex justify-between w-full mb-4">
            {items.map((item, index) => {
              const isAbove = index % 2 === 0;
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);

              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper key={index} className="flex-1 px-2" {...itemProps}>
                  {isAbove ? (
                    <div className="text-center">
                      {renderContent(item, index, "center")}
                    </div>
                  ) : (
                    <div className="h-full" /> // Empty spacer for items below the line
                  )}
                </ItemWrapper>
              );
            })}
          </div>

          {/* MIDDLE ROW - The horizontal line with dots and vertical connectors */}
          <div className="relative flex justify-between items-center w-full py-2">
            {/* The horizontal line */}
            <div
              className="absolute top-1/2 left-0 right-0 -translate-y-1/2"
              style={{
                height: "2px",
                backgroundColor: `${baseStyles.lineColor}40`,
              }}
            />
            
            {/* Dots and vertical connectors */}
            {items.map((item, index) => {
              const isAbove = index % 2 === 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center relative">
                  {/* Vertical connector going UP (for content above) */}
                  {isAbove && (
                    <div 
                      className="w-px absolute bottom-full mb-0"
                      style={{ 
                        backgroundColor: `${baseStyles.lineColor}40`,
                        height: "24px",
                      }}
                    />
                  )}
                  
                  {/* The dot marker */}
                  <div className="relative z-10">
                    {renderMarker(item, index)}
                  </div>
                  
                  {/* Vertical connector going DOWN (for content below) */}
                  {!isAbove && (
                    <div 
                      className="w-px absolute top-full mt-0"
                      style={{ 
                        backgroundColor: `${baseStyles.lineColor}40`,
                        height: "24px",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* BOTTOM ROW - Content that appears BELOW the line */}
          <div className="flex justify-between w-full mt-4">
            {items.map((item, index) => {
              const isAbove = index % 2 === 0;
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);

              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper key={index} className="flex-1 px-2" {...itemProps}>
                  {!isAbove ? (
                    <div className="text-center">
                      {renderContent(item, index, "center")}
                    </div>
                  ) : (
                    <div className="h-full" /> // Empty spacer for items above the line
                  )}
                </ItemWrapper>
              );
            })}
          </div>
          
        </div>
      </Container>
    );
  }

  // Style 3: Vertical Steps (line on left with horizontal connectors)
  if (layout.id === "sequence-style-3") {
    const dotSize = compact ? 12 : 16;
    const connectorLength = 32; // Length of horizontal connector
    const gapAfterConnector = 16; // Gap between connector and content
    const lineLeftPosition = 20; // Fixed position for the vertical line from left edge
    
    return (
      <Container className={className} style={{ width: "100%" }} {...containerProps}>
        <div className="relative" style={{ paddingLeft: `${lineLeftPosition + dotSize/2 + connectorLength + gapAfterConnector}px` }}>
          {/* Vertical line - positioned to pass through dot centers */}
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: `${lineLeftPosition + dotSize/2 - 1}px`, // Center of dots
              width: "2px",
              backgroundColor: `${baseStyles.lineColor}40`,
            }}
          />
          
          {/* Content items with dots */}
          <div className="flex flex-col gap-10">
            {items.map((item, index) => {
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);

              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper key={index} className="relative flex items-start" {...itemProps}>
                  {/* Dot - positioned on the vertical line, aligned with title text */}
                  <div 
                    className="absolute z-10"
                    style={{
                      left: `-${dotSize/2 + connectorLength + gapAfterConnector}px`,
                      top: "8px", // Aligned with title text baseline
                    }}
                  >
                    {renderMarker(item, index)}
                  </div>
                  
                  {/* Horizontal connector line from dot to gap */}
                  <div 
                    className="absolute"
                    style={{ 
                      left: `-${connectorLength + gapAfterConnector}px`,
                      top: `${8 + dotSize/2 - 1}px`, // Center of dot (adjusted for new top position)
                      width: `${connectorLength}px`,
                      height: "2px",
                      backgroundColor: `${baseStyles.lineColor}40`,
                    }}
                  />

                  {/* Content - title aligns with dot */}
                  <div className="w-full">
                    {renderContent(item, index, "left")}
                  </div>
                </ItemWrapper>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  // Style 4: Vertical Alternating (line in center with horizontal connectors)
  if (layout.id === "sequence-style-4") {
    const dotSize = compact ? 12 : 16;
    const connectorLength = 32; // Length of horizontal connector
    const gapAfterConnector = 16; // Gap between connector and content
    
    return (
      <Container className={className} style={{ width: "100%" }} {...containerProps}>
        <div className="relative w-full">
          {/* Center vertical line - passes through all dots */}
          <div
            className="absolute top-0 bottom-0 left-1/2"
            style={{
              width: "2px",
              backgroundColor: `${baseStyles.lineColor}40`,
              transform: "translateX(-50%)",
            }}
          />
          
          {/* Items with alternating layout */}
          <div className="relative w-full flex flex-col gap-10">
            {items.map((item, index) => {
              const isLeft = index % 2 === 0;
              const ItemWrapper = isPresenting ? motion.div : "div";
              const itemStyle = getStyle(index);

              const itemProps = isPresenting ? { 
                variants: sequenceVariants,
                style: itemStyle,
              } : {
                 style: itemStyle,
              };
              
              return (
                <ItemWrapper
                  key={index}
                  className="relative flex items-start w-full"
                  {...itemProps}
                >
                  {/* Left content (for even indices) */}
                  <div className="flex-1" style={{ paddingRight: `${connectorLength + gapAfterConnector + dotSize/2}px` }}>
                    {isLeft ? (
                      <div className="text-right">
                        {renderContent(item, index, "right")}
                      </div>
                    ) : (
                      <div /> // Empty spacer
                    )}
                  </div>

                  {/* Center: Dot on the line with horizontal connectors */}
                  <div 
                    className="absolute left-1/2 z-10"
                    style={{
                      transform: "translateX(-50%)",
                      top: "8px", // Aligned with title text baseline
                    }}
                  >
                    {/* Horizontal connector to left */}
                    {isLeft && (
                      <div 
                        className="absolute right-full"
                        style={{ 
                          width: `${connectorLength}px`,
                          height: "2px",
                          backgroundColor: `${baseStyles.lineColor}40`,
                          top: `${dotSize/2 - 1}px`,
                        }}
                      />
                    )}
                    
                    {/* The dot */}
                    <div>
                      {renderMarker(item, index)}
                    </div>
                    
                    {/* Horizontal connector to right */}
                    {!isLeft && (
                      <div 
                        className="absolute left-full"
                        style={{ 
                          width: `${connectorLength}px`,
                          height: "2px",
                          backgroundColor: `${baseStyles.lineColor}40`,
                          top: `${dotSize/2 - 1}px`,
                        }}
                      />
                    )}
                  </div>

                  {/* Right content (for odd indices) */}
                  <div className="flex-1" style={{ paddingLeft: `${connectorLength + gapAfterConnector + dotSize/2}px` }}>
                    {!isLeft ? (
                      <div className="text-left">
                        {renderContent(item, index, "left")}
                      </div>
                    ) : (
                      <div /> // Empty spacer
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

  return null;
}

// Preview component for sequence layouts
export function SequenceLayoutPreview({
  layout,
  itemCount = 3,
  theme,
}: {
  layout: SequenceLayout;
  itemCount?: number;
  theme?: Theme;
}) {
  const baseStyles = getBaseSequenceStyles(theme || {} as Theme);
  const items = Array.from({ length: itemCount }, (_, i) => i);

  if (layout.id === "sequence-style-1") {
    return (
      <div className="relative w-full h-full p-2 flex flex-col justify-center">
        <div className="relative w-full">
           <div className="absolute top-[3px] left-0 right-0 h-px bg-slate-300" />
           <div className="flex justify-between relative">
             {items.map((_, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                   <div className="w-1.5 h-1.5 rounded-full z-10" style={{ backgroundColor: baseStyles.dotColor }} />
                   <div className="w-px h-2 bg-slate-300 my-0.5" />
                   <div className="space-y-0.5 flex flex-col items-center">
                      <div className="h-0.5 w-6 bg-slate-400 rounded-sm" />
                      <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                   </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  if (layout.id === "sequence-style-2") {
    return (
      <div className="relative w-full h-full p-2 flex items-center">
        <div className="relative w-full">
           <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300 -translate-y-1/2" />
           <div className="flex justify-between relative items-center">
             {items.map((_, i) => {
                const isAbove = i % 2 === 0;
                return (
                  <div key={i} className="flex flex-col items-center flex-1" style={{ height: '100%' }}>
                     {isAbove ? (
                        <>
                          <div className="space-y-0.5 flex flex-col items-center mb-0.5">
                              <div className="h-0.5 w-6 bg-slate-400 rounded-sm" />
                              <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                           </div>
                           <div className="w-px h-2 bg-slate-300" />
                           <div className="w-1.5 h-1.5 rounded-full z-10 my-0.5" style={{ backgroundColor: baseStyles.dotColor }} />
                           <div className="h-[14px]" /> {/* Spacer balance */}
                        </>
                     ) : (
                        <>
                           <div className="h-[14px]" /> {/* Spacer balance */}
                           <div className="w-1.5 h-1.5 rounded-full z-10 my-0.5" style={{ backgroundColor: baseStyles.dotColor }} />
                           <div className="w-px h-2 bg-slate-300" />
                           <div className="space-y-0.5 flex flex-col items-center mt-0.5">
                              <div className="h-0.5 w-6 bg-slate-400 rounded-sm" />
                              <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                           </div>
                        </>
                     )}
                  </div>
                );
             })}
           </div>
        </div>
      </div>
    );
  }

  if (layout.id === "sequence-style-3") {
    return (
      <div className="relative w-full h-full p-2 flex items-center">
         <div className="relative w-full pl-4">
            {/* Vertical line positioned to pass through dot centers */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-slate-300" 
              style={{ left: "5px" }} 
            />
            <div className="flex flex-col gap-2">
               {items.map((_, i) => (
                  <div key={i} className="flex items-center relative">
                     {/* Dot centered on the line */}
                     <div 
                       className="absolute w-1.5 h-1.5 rounded-full z-10" 
                       style={{ backgroundColor: baseStyles.dotColor, left: "2px" }} 
                     />
                     {/* Horizontal connector */}
                     <div className="w-3 h-px bg-slate-300 ml-3 mr-1" />
                     {/* Content placeholder */}
                     <div className="space-y-0.5 flex-1">
                        <div className="h-0.5 w-8 bg-slate-400 rounded-sm" />
                        <div className="h-0.5 w-12 bg-slate-200 rounded-sm" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  if (layout.id === "sequence-style-4") {
    return (
      <div className="relative w-full h-full p-2 flex items-center justify-center">
         {/* Center vertical line - passes through all dots */}
         <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-300" style={{ transform: "translateX(-50%)" }} />
         <div className="w-full flex flex-col gap-2">
            {items.map((_, i) => {
               const isLeft = i % 2 === 0;
               return (
                  <div key={i} className="relative flex items-center w-full">
                     {/* Left side content */}
                     <div className="flex-1 flex justify-end pr-1">
                        {isLeft && (
                          <div className="flex flex-col items-end">
                            <div className="h-0.5 w-6 bg-slate-400 rounded-sm mb-0.5" />
                            <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                          </div>
                        )}
                     </div>
                     
                     {/* Connector + Dot in center */}
                     <div className="flex items-center">
                        {isLeft && <div className="w-1 h-px bg-slate-300" />}
                        <div className="w-1.5 h-1.5 rounded-full z-10 shrink-0" style={{ backgroundColor: baseStyles.dotColor }} />
                        {!isLeft && <div className="w-1 h-px bg-slate-300" />}
                     </div>
                     
                     {/* Right side content */}
                     <div className="flex-1 pl-1">
                        {!isLeft && (
                          <div className="flex flex-col items-start">
                            <div className="h-0.5 w-6 bg-slate-400 rounded-sm mb-0.5" />
                            <div className="h-0.5 w-4 bg-slate-200 rounded-sm" />
                          </div>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
    );
  }

  return null;
}
