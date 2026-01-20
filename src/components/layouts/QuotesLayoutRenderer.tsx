"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import type {
  QuotesLayoutType,
  QuoteContentItem,
} from "~/lib/layouts/content/quotes";
import EditableText from "~/components/presentation/EditableText";
import type { Theme } from "~/lib/themes";
import { CONTENT_FONT_SIZE } from "~/components/presentation/SlideRenderer";

// Animation variants for staggered quote animations
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

const quoteVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9,
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

// Theme styles type
interface ThemeStyles {
  shapeBgColor: string;
  shapeBorderColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  accentColor: string;
  titleColor: string;
  bodyColor: string;
}

// Helper to get theme-aware styles
function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  const defaultAccent = accentColor || "#047857";

  if (!theme) {
    return {
      shapeBgColor: defaultAccent,
      shapeBorderColor: `${defaultAccent}20`,
      cardBgColor: "#ffffff",
      cardBorderColor: `${defaultAccent}30`,
      accentColor: defaultAccent,
      titleColor: "#1e293b",
      bodyColor: "#64748b",
    };
  }

  const cardBox = theme.cardBox;
  const layoutElements = theme.layoutElements;
  const accent = accentColor || cardBox?.accentColor || theme.colors.accent;

  // Use layoutElements if available for better theme consistency
  const cardBg = layoutElements?.background || theme.colors.surface || "#ffffff";
  const cardBorder = layoutElements?.borderColor || `${accent}30`;

  return {
    shapeBgColor: accent,
    shapeBorderColor: `${accent}20`,
    cardBgColor: cardBg,
    cardBorderColor: cardBorder,
    accentColor: accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
  };
}

interface QuotesLayoutRendererProps {
  layoutId: QuotesLayoutType;
  items: QuoteContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  isNarrowSpace?: boolean;
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
  onReorderItems?: (fromIndex: number, toIndex: number) => void;
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
    filter: isHighlighted ? 'drop-shadow(0 0 30px rgba(255,255,255,0.4))' : 'blur(2px)',
    position: 'relative' as const,
    zIndex: isHighlighted ? 10 : 1,
  };
};

export function QuotesLayoutRenderer({
  layoutId,
  items,
  theme,
  accentColor = "#047857",
  className = "",
  isNarrowSpace = false,
  hasImage = false, // New prop to indicate if slide has image
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
  onReorderItems,
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: QuotesLayoutRendererProps & { hasImage?: boolean }) {
  const displayItems = items.slice(0, 6);
  const themeStyles = getThemeStyles(theme, accentColor);

  // Spotlight is controlled only by arrow keys via props - no hover interaction
  const effectiveSpotlightIndex = isSpotlightMode && spotlightIndex !== undefined
    ? spotlightIndex 
    : -1;
  
  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    if (!isOwner || !onReorderItems) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", idx.toString());
    setDraggedIndex(idx);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    if (!isOwner || !onReorderItems || draggedIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (idx !== draggedIndex) {
      setDragOverIndex(idx);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    if (!isOwner || !onReorderItems) return;
    e.preventDefault();
    const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!isNaN(fromIdx) && fromIdx !== toIdx) {
      onReorderItems(fromIdx, toIdx);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  const canDrag = isOwner && onReorderItems && items.length > 1;
  
  const dragProps = (idx: number) => canDrag ? {
    draggable: true,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, idx),
    onDragEnd: handleDragEnd,
    onDragOver: (e: React.DragEvent) => handleDragOver(e, idx),
    onDragLeave: handleDragLeave,
    onDrop: (e: React.DragEvent) => handleDrop(e, idx),
  } : {};
  
  const getDragClasses = (idx: number) => {
    const isDragging = draggedIndex === idx;
    const isDragOver = dragOverIndex === idx;
    return `${isDragging ? "opacity-50" : ""} ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2" : ""}`;
  };

  if (layoutId === "quote-bubble") {
    return (
      <BubbleQuotes
        items={displayItems}
        themeStyles={themeStyles}
        className={className}
        hasImage={hasImage}
        isPresenting={isPresenting}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        onDeleteItem={onDeleteItem}
        isOwner={isOwner}
        isHovered={isHovered}
        canDrag={canDrag}
        dragProps={dragProps}
        getDragClasses={getDragClasses}
        highlightedIndex={effectiveSpotlightIndex}
      />
    );
  }

  return (
    <MarksQuotes
      items={displayItems}
      themeStyles={themeStyles}
      className={className}
      hasImage={hasImage}
      isPresenting={isPresenting}
      isEditing={isEditing}
      editingText={editingText}
      onStartEditLabel={onStartEditLabel}
      onStartEditText={onStartEditText}
      onUpdateLabel={onUpdateLabel}
      onUpdateText={onUpdateText}
      onFinishEditing={onFinishEditing}
      onDeleteItem={onDeleteItem}
      isOwner={isOwner}
      isHovered={isHovered}
      canDrag={canDrag}
      dragProps={dragProps}
      getDragClasses={getDragClasses}
      highlightedIndex={effectiveSpotlightIndex}
    />
  );
}

// Quote Icon Component
function QuoteIcon({ className, color }: { className?: string; color?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className} 
      style={{ color }}
    >
      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 16.6569 20.6739 18 19.017 18H16.017C15.4647 18 15.017 18.4477 15.017 19V21L14.017 21ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 16.6569 11.6735 18 10.0166 18H7.0166C6.46432 18 6.0166 18.4477 6.0166 19V21L5.0166 21Z" />
    </svg>
  );
}

// Style 1: Thought Bubble - Solid color card with tail and white quotes
function BubbleQuotes({
  items,
  themeStyles,
  className,
  hasImage = false,
  isPresenting = false,
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
  canDrag = false,
  dragProps,
  getDragClasses,
  highlightedIndex,
}: {
  items: QuoteContentItem[];
  themeStyles: ThemeStyles;
  className: string;
  hasImage?: boolean;
  isPresenting?: boolean;
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
  canDrag?: boolean;
  dragProps?: (idx: number) => Record<string, unknown>;
  getDragClasses?: (idx: number) => string;
  highlightedIndex?: number;
}) {
  const getStyle = (index: number) => {
    return getSpotlightStyle(index, highlightedIndex, highlightedIndex !== undefined && highlightedIndex !== -1);
  };

  // When no image, use row layout with content-driven sizing
  const containerClass = hasImage
    ? `flex flex-wrap gap-8 justify-center items-start ${className}`
    : `flex gap-6 items-stretch w-full ${className}`;
  
  const itemClass = hasImage
    ? "flex-1 min-w-[300px] max-w-[500px] flex flex-col"
    : "flex-1 min-w-0 flex flex-col"; // min-w-0 allows flex shrinking, content-driven sizing

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? { 
    variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};

  return (
    <Container className={containerClass} {...containerProps}>
      {items.map((item, index) => {
        const dragClasses = getDragClasses ? getDragClasses(index) : "";
        const props = dragProps && !isPresenting ? dragProps(index) : {};
        
        const Wrapper = isPresenting ? motion.div : "div";
        const wrapperStyle = getStyle(index);
        // No hover handlers - spotlight is controlled by arrow keys only
        const wrapperProps = isPresenting ? { 
          variants: quoteVariants,
        } : {};
        
        // Disable hover classes during presentation
        const wrapperClassName = isPresenting 
          ? `${itemClass} relative ${dragClasses}`
          : `${itemClass} relative group/drag-item ${dragClasses}`;
        
        return (
          <Wrapper 
            key={index} 
            className={wrapperClassName}
            style={{ 
              cursor: canDrag && !isPresenting ? "grab" : "default",
              ...wrapperStyle
            }}
            {...wrapperProps}
            {...props}
          >
            {/* Drag handle */}
            {canDrag && !isPresenting && (
              <div 
                className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag-item:opacity-60 transition-opacity cursor-grab z-20"
                title="Drag to reorder"
              >
                <GripVertical size={14} className="text-current" />
              </div>
            )}
            {/* Main Bubble Card - disable hover effects during presentation */}
            <div className={isPresenting ? "relative filter drop-shadow-md" : "relative group filter drop-shadow-md transition-transform hover:-translate-y-1"}>
              <div
                className="relative rounded-2xl p-8"
                style={{
                  backgroundColor: themeStyles.accentColor, // Solid fill
                  color: "white", // White text
                }}
              >
                {/* Top-left opening quote */}
                <div className="absolute top-4 left-4 opacity-50">
                  <QuoteIcon className="w-8 h-8 rotate-180" color="white" />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3 relative z-10 px-4 text-center">
                  {item.label &&
                    (onStartEditLabel ? (
                      <EditableText
                        value={item.label}
                        isEditing={
                          isEditing &&
                          editingText?.field === `content-label-${index}`
                        }
                        onStartEdit={() => onStartEditLabel(index)}
                        onChange={(val) => onUpdateLabel?.(index, val)}
                        onFinish={onFinishEditing || (() => {})}
                        onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                        className="text-lg font-bold mb-1 text-white opacity-90"
                        isOwner={isOwner}
                        isHovered={isHovered}
                      />
                    ) : (
                      <h3 className="text-lg font-bold mb-1 text-white opacity-90">
                        {item.label}
                      </h3>
                    ))}

                  {onStartEditText ? (
                    <EditableText
                      value={item.text}
                      isEditing={
                        isEditing && editingText?.field === `content-text-${index}`
                      }
                      onStartEdit={() => onStartEditText(index)}
                      onChange={(val) => onUpdateText?.(index, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                      className="leading-relaxed font-medium"
                      style={{ fontSize: CONTENT_FONT_SIZE.normal }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <p className="text-base leading-relaxed font-medium">
                      {item.text}
                    </p>
                  )}

                  {item.author && (
                    <div className="mt-2 border-t border-white/20 pt-2 inline-block mx-auto">
                      <span className="text-sm font-semibold opacity-90">
                        {item.author}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom-right closing quote */}
                <div className="absolute bottom-4 right-4 opacity-50">
                  <QuoteIcon className="w-8 h-8" color="white" />
                </div>
              </div>

              {/* Seamless Tail - Slightly smaller */}
              <svg
                className="absolute -bottom-[28px] left-12 filter drop-shadow-sm"
                width="35"
                height="30"
                viewBox="0 0 50 50"
                style={{ color: themeStyles.accentColor }}
              >
                {/* Triangle tail */}
                <path d="M0 0 L25 50 L50 0 Z" fill="currentColor" />
              </svg>
            </div>
          </Wrapper>
        );
      })}
    </Container>
  );
}

// Style 2: Quote Marks - Elegant clean cards with positioned quotes
function MarksQuotes({
  items,
  themeStyles,
  className,
  hasImage = false,
  isPresenting = false,
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
  canDrag = false,
  dragProps,
  getDragClasses,
  highlightedIndex,
}: {
  items: QuoteContentItem[];
  themeStyles: ThemeStyles;
  className: string;
  hasImage?: boolean;
  isPresenting?: boolean;
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
  canDrag?: boolean;
  dragProps?: (idx: number) => Record<string, unknown>;
  getDragClasses?: (idx: number) => string;
  highlightedIndex?: number;
}) {
  const getStyle = (index: number) => {
    return getSpotlightStyle(index, highlightedIndex, highlightedIndex !== undefined && highlightedIndex !== -1);
  };

  // When no image, use row layout with content-driven sizing
  const containerClass = hasImage
    ? `flex flex-wrap gap-8 justify-center ${className}`
    : `flex gap-6 items-stretch w-full ${className}`;
  
  const itemClass = hasImage
    ? "flex-1 min-w-[320px] max-w-[500px]"
    : "flex-1 min-w-0"; // min-w-0 allows flex shrinking, content-driven sizing

  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? { 
    variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};

  return (
    <Container className={containerClass} {...containerProps}>
      {items.map((item, index) => {
        const dragClasses = getDragClasses ? getDragClasses(index) : "";
        const props = dragProps && !isPresenting ? dragProps(index) : {};
        
        const Wrapper = isPresenting ? motion.div : "div";
        const wrapperStyle = getStyle(index);
        // No hover handlers - spotlight is controlled by arrow keys only
        const wrapperProps = isPresenting ? { 
          variants: quoteVariants,
        } : {};
        
        // Disable hover classes during presentation
        const wrapperClassName = isPresenting 
          ? `${itemClass} relative ${dragClasses}`
          : `${itemClass} relative group/drag-item ${dragClasses}`;
        
        return (
          <Wrapper 
            key={index} 
            className={wrapperClassName}
            style={{ 
              cursor: canDrag && !isPresenting ? "grab" : "default",
              ...wrapperStyle
            }}
            {...wrapperProps}
            {...props}
          >
            {/* Drag handle */}
            {canDrag && !isPresenting && (
              <div 
                className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag-item:opacity-60 transition-opacity cursor-grab z-20"
                title="Drag to reorder"
              >
                <GripVertical size={14} className="text-current" />
              </div>
            )}
            <div
              className={isPresenting ? "h-full rounded-xl p-8 pt-10 relative shadow-sm border" : "h-full rounded-xl p-8 pt-10 relative shadow-sm border hover:shadow-md transition-all"}
              style={{
                backgroundColor: themeStyles.cardBgColor,
                borderColor: themeStyles.cardBorderColor,
              }}
            >
              {/* Opening Quote - Top Left, positioned distinctly */}
              <div
                className="absolute -top-3 left-8 px-2"
                style={{ color: themeStyles.accentColor, backgroundColor: themeStyles.cardBgColor }}
              >
                <QuoteIcon className="w-6 h-6 rotate-180" />
              </div>

              <div className="flex flex-col h-full">
                {item.label &&
                  (onStartEditLabel ? (
                    <EditableText
                      value={item.label}
                      isEditing={
                        isEditing &&
                        editingText?.field === `content-label-${index}`
                      }
                      onStartEdit={() => onStartEditLabel(index)}
                      onChange={(val) => onUpdateLabel?.(index, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                      className="text-lg font-bold mb-3"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3
                      className="text-lg font-bold mb-3"
                      style={{ color: themeStyles.titleColor }}
                    >
                      {item.label}
                    </h3>
                  ))}

                {onStartEditText ? (
                  <EditableText
                    value={item.text}
                    isEditing={
                      isEditing && editingText?.field === `content-text-${index}`
                    }
                    onStartEdit={() => onStartEditText(index)}
                    onChange={(val) => onUpdateText?.(index, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(index) : undefined}
                    className="leading-relaxed italic flex-1"
                    style={{ fontSize: CONTENT_FONT_SIZE.normal }}
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p
                    className="leading-relaxed italic flex-1"
                    style={{ fontSize: CONTENT_FONT_SIZE.normal }}
                    style={{ color: themeStyles.bodyColor }}
                  >
                    {item.text}
                  </p>
                )}

                {item.author && (
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <div
                      className="h-px w-8"
                      style={{ backgroundColor: themeStyles.cardBorderColor }}
                    />
                    <span
                      className="text-sm font-bold uppercase tracking-wider"
                      style={{ color: themeStyles.accentColor }}
                    >
                      {item.author}
                    </span>
                  </div>
                )}
              </div>

              {/* Closing Quote - Bottom Right, matches top style */}
              <div
                className="absolute -bottom-3 right-8 px-2"
                style={{ color: themeStyles.accentColor, backgroundColor: themeStyles.cardBgColor }}
              >
                <QuoteIcon className="w-6 h-6" />
              </div>
            </div>
          </Wrapper>
        );
      })}
    </Container>
  );
}

export default QuotesLayoutRenderer;
