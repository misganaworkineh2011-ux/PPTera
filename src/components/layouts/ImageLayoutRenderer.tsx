"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, GripVertical } from "lucide-react";
import type { ImageLayoutType, ImageContentItem } from "~/lib/layouts/content/images";
import { calculateImageGridDimensions } from "~/lib/layouts/content/images";
import type { Theme } from "~/lib/themes";
import EditableText from "~/components/presentation/EditableText";

// Animation variants for staggered image animations
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

const imageVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
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
  accentColor: string;
  titleColor: string;
  bodyColor: string;
}

// Helper to get theme-aware styles
function getThemeStyles(theme?: Theme, accentColor?: string): ThemeStyles {
  const defaultAccent = accentColor || "#047857";

  if (!theme) {
    return {
      accentColor: defaultAccent,
      titleColor: "#1e293b",
      bodyColor: "#64748b",
    };
  }

  const cardBox = theme.cardBox;
  const accent = accentColor || cardBox?.accentColor || theme.colors.accent;

  return {
    accentColor: accent,
    titleColor: cardBox?.titleColor || theme.colors.heading,
    bodyColor: cardBox?.bodyColor || theme.colors.textMuted,
  };
}

interface ImageLayoutRendererProps {
  layoutId: ImageLayoutType;
  items: ImageContentItem[];
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
  onChangeImage?: (index: number) => void;
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

export function ImageLayoutRenderer({
  layoutId,
  items,
  theme,
  accentColor = "#047857",
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
  onChangeImage,
  onReorderItems,
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: ImageLayoutRendererProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Spotlight is controlled only by arrow keys via props - no hover interaction
  const effectiveIsSpotlightMode = isSpotlightMode;
  const effectiveSpotlightIndex = isSpotlightMode && spotlightIndex !== undefined
    ? spotlightIndex 
    : undefined;
    
  const displayItems = items.slice(0, 6);
  const { columns } = calculateImageGridDimensions(displayItems.length, isNarrowSpace);
  const themeStyles = getThemeStyles(theme, accentColor);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex && onReorderItems) {
      onReorderItems(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const canDrag = isOwner && isHovered && onReorderItems && !isPresenting;

  // Common drag props for each item
  const getDragProps = (idx: number) => canDrag ? {
    draggable: true,
    onDragStart: (e: React.DragEvent) => handleDragStart(e, idx),
    onDragOver: (e: React.DragEvent) => handleDragOver(e, idx),
    onDragLeave: handleDragLeave,
    onDrop: (e: React.DragEvent) => handleDrop(e, idx),
    onDragEnd: handleDragEnd,
  } : {};

  const getItemStyle = (idx: number) => ({
    opacity: draggedIndex === idx ? 0.5 : 1,
    transform: dragOverIndex === idx ? "scale(1.02)" : "scale(1)",
    transition: "transform 0.2s, opacity 0.2s",
    outline: dragOverIndex === idx ? `2px dashed ${themeStyles.accentColor}` : "none",
    outlineOffset: "4px",
  });

  // Drag handle component - no hover effects during presentation
  const DragHandle = () => canDrag ? (
    <div 
      className={`absolute top-2 left-2 p-1 rounded bg-black/40 cursor-grab active:cursor-grabbing z-10 ${
        isPresenting ? "opacity-0" : "opacity-0 group-hover:opacity-100 transition-opacity"
      }`}
      title="Drag to reorder"
    >
      <GripVertical size={14} className="text-white" />
    </div>
  ) : null;

  // Container and item wrapper for animations
  const Container = isPresenting ? motion.div : "div";
  const containerProps = isPresenting ? { 
    variants: containerVariants, 
    initial: "hidden", 
    animate: "visible" 
  } : {};

  // Style 1: Small rounded square left, text right (horizontal layout per item)
  if (layoutId === "image-style-1") {
    return (
      <Container
        className={`grid gap-6 ${className}`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        {...containerProps}
      >
        {displayItems.map((item, idx) => {
          const baseClassName = `flex items-start gap-4 group relative ${canDrag ? "cursor-grab active:cursor-grabbing" : ""}`;
          const content = (
            <>
              <DragHandle />
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden relative ${isOwner && isHovered && !isPresenting ? "cursor-pointer" : ""}`}
                style={{
                  backgroundColor: item.image ? undefined : `${themeStyles.accentColor}15`,
                  border: item.image ? "none" : `1px dashed ${themeStyles.accentColor}40`,
                }}
                onClick={() => isOwner && isHovered && !isPresenting && onChangeImage?.(idx)}
              >
                {item.image ? (
                  <img src={item.image} alt={item.label || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} style={{ color: `${themeStyles.accentColor}50` }} />
                  </div>
                )}
                {isOwner && isHovered && !isPresenting && onChangeImage && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {item.label && (
                  onStartEditLabel ? (
                    <EditableText
                      value={item.label}
                      isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                      onStartEdit={() => onStartEditLabel(idx)}
                      onChange={(val) => onUpdateLabel?.(idx, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                      className="text-base font-semibold mb-1"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3 className="text-base font-semibold mb-1" style={{ color: themeStyles.titleColor }}>
                      {item.label}
                    </h3>
                  )
                )}
                {onStartEditText ? (
                  <EditableText
                    value={item.text}
                    isEditing={isEditing && editingText?.field === `content-text-${idx}`}
                    onStartEdit={() => onStartEditText(idx)}
                    onChange={(val) => onUpdateText?.(idx, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                    className="text-sm leading-relaxed"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p className="text-sm leading-relaxed" style={{ color: themeStyles.bodyColor }}>
                    {item.text}
                  </p>
                )}
              </div>
            </>
          );
          
          const spotlightStyle = getSpotlightStyle(idx, effectiveSpotlightIndex, effectiveIsSpotlightMode);
          
          if (isPresenting) {
            return (
              <motion.div 
                key={idx} 
                className={baseClassName} 
                variants={imageVariants}
                style={spotlightStyle}
              >
                {content}
              </motion.div>
            );
          }
          
          return (
            <div 
              key={idx} 
              className={baseClassName} 
              {...getDragProps(idx)} 
              style={{ ...getItemStyle(idx), ...spotlightStyle }}
            >
              {content}
            </div>
          );
        })}
      </Container>
    );
  }

  // Style 2: Larger rounded square top, text below
  if (layoutId === "image-style-2") {
    return (
      <Container
        className={`grid gap-6 ${className}`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        {...containerProps}
      >
        {displayItems.map((item, idx) => {
          const baseClassName = `flex flex-col group relative ${canDrag ? "cursor-grab active:cursor-grabbing" : ""}`;
          const content = (
            <>
              <DragHandle />
              <div
                className={`w-full aspect-square rounded-2xl overflow-hidden mb-4 relative ${isOwner && isHovered && !isPresenting ? "cursor-pointer" : ""}`}
                style={{
                  backgroundColor: item.image ? undefined : `${themeStyles.accentColor}15`,
                  border: item.image ? "none" : `1px dashed ${themeStyles.accentColor}40`,
                  maxWidth: "180px",
                }}
                onClick={() => isOwner && isHovered && !isPresenting && onChangeImage?.(idx)}
              >
                {item.image ? (
                  <img src={item.image} alt={item.label || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={40} style={{ color: `${themeStyles.accentColor}50` }} />
                  </div>
                )}
                {isOwner && isHovered && !isPresenting && onChangeImage && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon size={28} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                {item.label && (
                  onStartEditLabel ? (
                    <EditableText
                      value={item.label}
                      isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                      onStartEdit={() => onStartEditLabel(idx)}
                      onChange={(val) => onUpdateLabel?.(idx, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                      className="text-lg font-semibold mb-2"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3 className="text-lg font-semibold mb-2" style={{ color: themeStyles.titleColor }}>
                      {item.label}
                    </h3>
                  )
                )}
                {onStartEditText ? (
                  <EditableText
                    value={item.text}
                    isEditing={isEditing && editingText?.field === `content-text-${idx}`}
                    onStartEdit={() => onStartEditText(idx)}
                    onChange={(val) => onUpdateText?.(idx, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                    className="text-sm leading-relaxed"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p className="text-sm leading-relaxed" style={{ color: themeStyles.bodyColor }}>
                    {item.text}
                  </p>
                )}
              </div>
            </>
          );
          
          const spotlightStyle = getSpotlightStyle(idx, effectiveSpotlightIndex, effectiveIsSpotlightMode);
          
          if (isPresenting) {
            return (
              <motion.div 
                key={idx} 
                className={baseClassName} 
                variants={imageVariants}
                style={spotlightStyle}
              >
                {content}
              </motion.div>
            );
          }
          
          return (
            <div 
              key={idx} 
              className={baseClassName} 
              {...getDragProps(idx)} 
              style={{ ...getItemStyle(idx), ...spotlightStyle }}
            >
              {content}
            </div>
          );
        })}
      </Container>
    );
  }

  // Style 3: Large circle top, text below centered
  if (layoutId === "image-style-3") {
    return (
      <Container
        className={`grid gap-8 ${className}`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        {...containerProps}
      >
        {displayItems.map((item, idx) => {
          const baseClassName = `flex flex-col items-center text-center group relative ${canDrag ? "cursor-grab active:cursor-grabbing" : ""}`;
          const content = (
            <>
              <DragHandle />
              <div
                className={`w-40 h-40 rounded-full overflow-hidden mb-4 flex-shrink-0 relative ${isOwner && isHovered && !isPresenting ? "cursor-pointer" : ""}`}
                style={{
                  backgroundColor: item.image ? undefined : `${themeStyles.accentColor}15`,
                  border: item.image ? "none" : `1px dashed ${themeStyles.accentColor}40`,
                }}
                onClick={() => isOwner && isHovered && !isPresenting && onChangeImage?.(idx)}
              >
                {item.image ? (
                  <img src={item.image} alt={item.label || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} style={{ color: `${themeStyles.accentColor}50` }} />
                  </div>
                )}
                {isOwner && isHovered && !isPresenting && onChangeImage && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <ImageIcon size={32} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                {item.label && (
                  onStartEditLabel ? (
                    <EditableText
                      value={item.label}
                      isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                      onStartEdit={() => onStartEditLabel(idx)}
                      onChange={(val) => onUpdateLabel?.(idx, val)}
                      onFinish={onFinishEditing || (() => {})}
                      onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                      className="text-lg font-semibold mb-2"
                      style={{ color: themeStyles.titleColor }}
                      isOwner={isOwner}
                      isHovered={isHovered}
                    />
                  ) : (
                    <h3 className="text-lg font-semibold mb-2" style={{ color: themeStyles.titleColor }}>
                      {item.label}
                    </h3>
                  )
                )}
                {onStartEditText ? (
                  <EditableText
                    value={item.text}
                    isEditing={isEditing && editingText?.field === `content-text-${idx}`}
                    onStartEdit={() => onStartEditText(idx)}
                    onChange={(val) => onUpdateText?.(idx, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                    className="text-sm leading-relaxed max-w-[250px]"
                    style={{ color: themeStyles.bodyColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p className="text-sm leading-relaxed max-w-[250px]" style={{ color: themeStyles.bodyColor }}>
                    {item.text}
                  </p>
                )}
              </div>
            </>
          );
          
          const spotlightStyle = getSpotlightStyle(idx, effectiveSpotlightIndex, effectiveIsSpotlightMode);
          
          if (isPresenting) {
            return (
              <motion.div 
                key={idx} 
                className={baseClassName} 
                variants={imageVariants}
                style={spotlightStyle}
              >
                {content}
              </motion.div>
            );
          }
          
          return (
            <div 
              key={idx} 
              className={baseClassName} 
              {...getDragProps(idx)} 
              style={{ ...getItemStyle(idx), ...spotlightStyle }}
            >
              {content}
            </div>
          );
        })}
      </Container>
    );
  }

  // Style 4: Large rounded rectangle top, text below centered
  return (
    <Container
      className={`grid gap-6 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      {...containerProps}
    >
      {displayItems.map((item, idx) => {
        const baseClassName = `flex flex-col items-center text-center group relative ${canDrag ? "cursor-grab active:cursor-grabbing" : ""}`;
        const content = (
          <>
            <DragHandle />
            <div
              className={`w-full rounded-2xl overflow-hidden mb-4 relative ${isOwner && isHovered && !isPresenting ? "cursor-pointer" : ""}`}
              style={{
                aspectRatio: "4/3",
                maxWidth: "280px",
                backgroundColor: item.image ? undefined : `${themeStyles.accentColor}15`,
                border: item.image ? "none" : `1px dashed ${themeStyles.accentColor}40`,
              }}
              onClick={() => isOwner && isHovered && !isPresenting && onChangeImage?.(idx)}
            >
              {item.image ? (
                <img src={item.image} alt={item.label || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={48} style={{ color: `${themeStyles.accentColor}50` }} />
                </div>
              )}
              {isOwner && isHovered && !isPresenting && onChangeImage && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <ImageIcon size={32} className="text-white" />
                </div>
              )}
            </div>
            <div>
              {item.label && (
                onStartEditLabel ? (
                  <EditableText
                    value={item.label}
                    isEditing={isEditing && editingText?.field === `content-label-${idx}`}
                    onStartEdit={() => onStartEditLabel(idx)}
                    onChange={(val) => onUpdateLabel?.(idx, val)}
                    onFinish={onFinishEditing || (() => {})}
                    onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                    className="text-lg font-semibold mb-2"
                    style={{ color: themeStyles.titleColor }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <h3 className="text-lg font-semibold mb-2" style={{ color: themeStyles.titleColor }}>
                    {item.label}
                  </h3>
                )
              )}
              {onStartEditText ? (
                <EditableText
                  value={item.text}
                  isEditing={isEditing && editingText?.field === `content-text-${idx}`}
                  onStartEdit={() => onStartEditText(idx)}
                  onChange={(val) => onUpdateText?.(idx, val)}
                  onFinish={onFinishEditing || (() => {})}
                  onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
                  className="text-sm leading-relaxed max-w-[280px]"
                  style={{ color: themeStyles.bodyColor }}
                  isOwner={isOwner}
                  isHovered={isHovered}
                />
              ) : (
                <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: themeStyles.bodyColor }}>
                  {item.text}
                </p>
              )}
            </div>
          </>
        );
        
        const spotlightStyle = getSpotlightStyle(idx, effectiveSpotlightIndex, effectiveIsSpotlightMode);
        
        if (isPresenting) {
          return (
            <motion.div 
              key={idx} 
              className={baseClassName} 
              variants={imageVariants}
              style={spotlightStyle}
            >
              {content}
            </motion.div>
          );
        }
        
        return (
          <div 
            key={idx} 
            className={baseClassName} 
            {...getDragProps(idx)} 
            style={{ ...getItemStyle(idx), ...spotlightStyle }}
          >
            {content}
          </div>
        );
      })}
    </Container>
  );
}

export default ImageLayoutRenderer;
