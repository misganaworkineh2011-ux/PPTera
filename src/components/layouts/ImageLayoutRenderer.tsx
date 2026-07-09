"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, GripVertical } from "lucide-react";
import type { ImageLayoutType, ImageContentItem } from "~/lib/layouts/content/images";
import { calculateImageGridDimensions } from "~/lib/layouts/content/images";
import type { Theme } from "~/lib/themes";
import EditableText from "~/components/presentation/EditableText";
import { CONTENT_FONT_SIZE } from "~/components/presentation/slide-typography";
import { alpha } from "~/components/presentation/PremiumComponents";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

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
  itemAnimation?: string;
  revealCount?: number;
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
  itemAnimation,
  revealCount,
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

  if (/^image-style-(?:[5-9]|1[0-4])$/.test(layoutId)) {
    return (
      <ExtendedImageGallery
        layoutId={layoutId}
        items={displayItems}
        themeStyles={themeStyles}
        columns={columns}
        className={className}
        isPresenting={isPresenting}
        animationKey={animationKey}
        itemAnimation={itemAnimation}
        revealCount={revealCount}
        isEditing={isEditing}
        editingText={editingText}
        onStartEditLabel={onStartEditLabel}
        onStartEditText={onStartEditText}
        onUpdateLabel={onUpdateLabel}
        onUpdateText={onUpdateText}
        onFinishEditing={onFinishEditing}
        onDeleteItem={onDeleteItem}
        onChangeImage={onChangeImage}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    );
  }

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
                    className="leading-relaxed"
                    style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p className="leading-relaxed" style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}>
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
                    className="leading-relaxed"
                    style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}
                    isOwner={isOwner}
                    isHovered={isHovered}
                  />
                ) : (
                  <p className="leading-relaxed" style={{ color: themeStyles.bodyColor, fontSize: CONTENT_FONT_SIZE.compact }}>
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

// Styles 5-14: additional gallery treatments (mosaic, filmstrip, polaroids, etc.)
function ExtendedImageGallery({
  layoutId,
  items,
  themeStyles,
  columns,
  className,
  isPresenting = false,
  animationKey,
  itemAnimation,
  revealCount,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  onDeleteItem,
  onChangeImage,
  isOwner = false,
  isHovered = false,
}: {
  layoutId: string;
  items: ImageContentItem[];
  themeStyles: ThemeStyles;
  columns: number;
  className: string;
  isPresenting?: boolean;
  animationKey?: string;
  itemAnimation?: string;
  revealCount?: number;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  onDeleteItem?: (index: number) => void;
  onChangeImage?: (index: number) => void;
  isOwner?: boolean;
  isHovered?: boolean;
}) {
  const accent = themeStyles.accentColor;
  const titleColor = themeStyles.titleColor;
  const bodyColor = themeStyles.bodyColor;
  const canEdit = isOwner && isHovered && !isPresenting;

  const Container = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const CItem = isPresenting ? motion.div : "div";
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  const imgBox = (item: ImageContentItem, idx: number, cls: string, iconSize = 32) => (
    <div
      className={`relative overflow-hidden ${cls} ${canEdit && onChangeImage ? "cursor-pointer" : ""}`}
      style={{ backgroundColor: item.image ? undefined : alpha(accent, "17"), border: item.image ? "none" : `1px dashed ${alpha(accent, "40")}` }}
      onClick={() => canEdit && onChangeImage?.(idx)}
    >
      {item.image ? (
        <img src={item.image} alt={item.label || ""} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center"><ImageIcon size={iconSize} style={{ color: alpha(accent, "66") }} /></div>
      )}
      {canEdit && onChangeImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"><ImageIcon size={20} className="text-white" /></div>
      )}
    </div>
  );

  const eLabel = (item: ImageContentItem, idx: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${idx}`}
          onStartEdit={() => onStartEditLabel(idx)} onChange={(val) => onUpdateLabel?.(idx, val)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
          className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <h3 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;
  const eText = (item: ImageContentItem, idx: number, cls: string, style?: React.CSSProperties) =>
    onStartEditText ? (
      <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${idx}`}
        onStartEdit={() => onStartEditText(idx)} onChange={(val) => onUpdateText?.(idx, val)}
        onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
        className={cls} style={{ color: bodyColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
    ) : (
      <p className={cls} style={{ color: bodyColor, ...style }}>{item.text}</p>
    );

  const frame = `w-full ${className}`;
  const n = items.length;

  // == STYLE-5: MASONRY — true varied-height Pinterest columns
  if (layoutId === "image-style-5") {
    const ar = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[5/4]", "aspect-[3/5]", "aspect-[4/3]"];
    return (
      <Container className={`columns-2 sm:columns-3 gap-3 ${frame}`} key={animationKey} {...cProps}>
        {items.map((item, idx) => (
          <CItem key={idx} className="relative mb-3 break-inside-avoid overflow-hidden rounded-xl" {...itemMotion(idx)}>
            {imgBox(item, idx, `w-full ${ar[idx % 6]}`)}
            {item.label && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-8">{eLabel(item, idx, "text-sm font-bold leading-tight", { color: "#fff" })}</div>}
          </CItem>
        ))}
      </Container>
    );
  }

  // == STYLE-6: FILM REEL — a cinematic strip with sprocket perforations
  if (layoutId === "image-style-6") {
    const reel = "#161616";
    const sprockets = (
      <div className="flex justify-around px-1" aria-hidden>
        {Array.from({ length: Math.max(items.length * 3, 9) }).map((_, s) => (
          <span key={s} className="h-2 w-3 rounded-[2px]" style={{ background: "rgba(255,255,255,0.16)" }} />
        ))}
      </div>
    );
    return (
      <Container className={`flex flex-col items-center justify-center ${frame}`} key={animationKey} {...cProps}>
        <div className="w-full rounded-lg py-2" style={{ background: reel, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          {sprockets}
          <div className="my-2 flex gap-1.5 px-2">
            {items.map((item, idx) => (
              <CItem key={idx} className="flex-1 overflow-hidden rounded-sm" style={{ border: "2px solid rgba(255,255,255,0.12)" }} {...itemMotion(idx)}>
                {imgBox(item, idx, "aspect-[4/5] w-full", 28)}
              </CItem>
            ))}
          </div>
          {sprockets}
        </div>
        <div className="mt-3 flex w-full gap-1.5 px-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex-1 text-center">{eLabel(item, idx, "text-xs font-bold leading-tight")}</div>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-7: POLAROID SCATTER — overlapping tilted instant photos
  if (layoutId === "image-style-7") {
    const rot = ["-7deg", "4deg", "-3deg", "6deg", "-5deg", "2deg"];
    return (
      <Container className={`flex flex-wrap items-center justify-center ${frame}`} key={animationKey} {...cProps}>
        {items.map((item, idx) => (
          <CItem key={idx} className="w-48 bg-white p-2.5 pb-6 shadow-2xl" style={{ transform: `rotate(${rot[idx % 6]})`, marginLeft: idx > 0 ? "-1.75rem" : 0, marginTop: idx % 2 ? "1.25rem" : 0, zIndex: idx }} {...itemMotion(idx)}>
            {imgBox(item, idx, "aspect-square w-full", 32)}
            <div className="mt-2.5 text-center font-[cursive]">{eLabel(item, idx, "text-sm font-bold leading-tight", { color: "#1e293b" })}</div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == STYLE-8: CINEMATIC OVERLAY — full-bleed portraits with a scrim caption
  if (layoutId === "image-style-8") {
    return (
      <Container className={`grid gap-4 ${frame}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} key={animationKey} {...cProps}>
        {items.map((item, idx) => (
          <CItem key={idx} className="relative overflow-hidden rounded-2xl" {...itemMotion(idx)}>
            {imgBox(item, idx, "aspect-[3/4] w-full", 40)}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-12">
              {eLabel(item, idx, "text-base font-bold leading-tight", { color: "#fff" })}
              {eText(item, idx, "mt-0.5 text-xs leading-snug", { color: "rgba(255,255,255,0.85)" })}
            </div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == STYLE-9: HERO FEATURE — a wide hero with a title chip + thumbnail strip
  if (layoutId === "image-style-9" && items[0]) {
    return (
      <Container className={`flex flex-col gap-3 ${frame}`} key={animationKey} {...cProps}>
        <CItem className="relative overflow-hidden rounded-2xl" {...itemMotion(0)}>
          {imgBox(items[0]!, 0, "aspect-[21/9] w-full", 56)}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 pt-14">
            {eLabel(items[0]!, 0, "text-xl font-bold leading-tight", { color: "#fff" })}
            {eText(items[0]!, 0, "mt-0.5 text-sm leading-snug", { color: "rgba(255,255,255,0.85)" })}
          </div>
        </CItem>
        {items.length > 1 && (
          <div className="flex gap-3">
            {items.slice(1, 5).map((item, i) => {
              const idx = i + 1;
              return (
                <CItem key={idx} className="flex flex-1 flex-col" {...itemMotion(idx)}>
                  {imgBox(item, idx, "aspect-video w-full rounded-lg", 22)}
                  <div className="mt-1.5">{eLabel(item, idx, "text-xs font-bold leading-tight")}</div>
                </CItem>
              );
            })}
          </div>
        )}
      </Container>
    );
  }

  // == STYLE-10: PORTRAIT CIRCLES — gradient-ring circular photos with names
  if (layoutId === "image-style-10") {
    return (
      <Container className={`flex flex-wrap items-start justify-center gap-8 ${frame}`} key={animationKey} {...cProps}>
        {items.map((item, idx) => (
          <CItem key={idx} className="flex w-40 flex-col items-center text-center" {...itemMotion(idx)}>
            <div className="rounded-full p-1" style={{ background: `conic-gradient(from 140deg, ${accent}, ${alpha(accent, "33")}, ${accent})` }}>
              {imgBox(item, idx, "h-28 w-28 rounded-full", 40)}
            </div>
            <div className="mt-3">{eLabel(item, idx, "text-sm font-bold leading-tight")}{eText(item, idx, "text-xs leading-snug", { color: accent, fontSize: CONTENT_FONT_SIZE.compact })}</div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == STYLE-11: PASSE-PARTOUT — museum matted frames on a gallery wall
  if (layoutId === "image-style-11") {
    return (
      <Container className={`grid gap-6 ${frame}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} key={animationKey} {...cProps}>
        {items.map((item, idx) => (
          <CItem key={idx} className="flex flex-col p-4 pb-3" style={{ background: "#f7f6f2", boxShadow: "0 12px 26px -10px rgba(0,0,0,0.45)", border: "1px solid rgba(0,0,0,0.08)" }} {...itemMotion(idx)}>
            <div style={{ border: "1px solid rgba(0,0,0,0.15)", padding: 2 }}>
              {imgBox(item, idx, "aspect-square w-full", 34)}
            </div>
            <div className="pt-2.5 text-center">{eLabel(item, idx, "text-sm font-bold leading-tight", { color: "#1e293b" })}{eText(item, idx, "text-xs leading-snug", { color: "#64748b" })}</div>
          </CItem>
        ))}
      </Container>
    );
  }

  // == STYLE-12: EDITORIAL BANDS — full-width alternating image | text bands
  if (layoutId === "image-style-12") {
    return (
      <Container className={`flex flex-col gap-3 ${frame}`} key={animationKey} {...cProps}>
        {items.slice(0, 4).map((item, idx) => {
          const flip = idx % 2 === 1;
          return (
            <CItem key={idx} className={`flex items-stretch overflow-hidden rounded-xl ${flip ? "flex-row-reverse" : ""}`} style={{ background: alpha(accent, "0d"), border: `1px solid ${alpha(accent, "1a")}`, minHeight: "6.5rem" }} {...itemMotion(idx)}>
              {imgBox(item, idx, "w-2/5 shrink-0 self-stretch", 32)}
              <div className={`flex flex-1 flex-col justify-center p-5 ${flip ? "text-right" : ""}`}>
                {eLabel(item, idx, "text-lg font-bold leading-tight")}
                {eText(item, idx, "mt-1 text-sm leading-relaxed", { fontSize: CONTENT_FONT_SIZE.compact })}
              </div>
            </CItem>
          );
        })}
      </Container>
    );
  }

  // == STYLE-13: PHOTO STACK — an overlapping pile of prints beside a caption list
  if (layoutId === "image-style-13") {
    const stack = items.slice(0, 4);
    const rot = [-6, -1, 4, 9];
    return (
      <Container className={`flex items-center gap-8 ${frame}`} key={animationKey} {...cProps}>
        <div className="relative h-60 w-60 shrink-0">
          {stack.map((item, i) => {
            const idx = stack.length - 1 - i; // render back-to-front so idx 0 lands on top
            return (
              <CItem key={idx} className="absolute inset-0 bg-white p-2.5 pb-6 shadow-2xl" style={{ transform: `rotate(${rot[idx]}deg)`, zIndex: stack.length - idx }} {...itemMotion(idx)}>
                {imgBox(item, idx, "h-full w-full", 40)}
              </CItem>
            );
          })}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          {items.map((item, idx) => (
            <CItem key={idx} className="flex items-start gap-3 min-w-0" {...itemMotion(idx)}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white tabular-nums" style={{ background: accent }}>{String(idx + 1).padStart(2, "0")}</span>
              <div className="min-w-0">{eLabel(item, idx, "text-sm font-bold leading-tight")}{eText(item, idx, "text-xs leading-snug break-words", { fontSize: CONTENT_FONT_SIZE.compact })}</div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-14: BENTO MOSAIC — an asymmetric edge-to-edge tile wall
  if (layoutId === "image-style-14") {
    return (
      <Container className={`grid auto-rows-fr grid-flow-dense grid-cols-3 gap-2 ${frame}`} style={{ minHeight: "17rem" }} key={animationKey} {...cProps}>
        {items.map((item, idx) => (
          <CItem key={idx} className={`relative overflow-hidden rounded-lg ${idx === 0 ? "col-span-2 row-span-2" : ""}`} {...itemMotion(idx)}>
            {imgBox(item, idx, "h-full min-h-[5rem] w-full", idx === 0 ? 44 : 26)}
            {item.label && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-1.5">{eLabel(item, idx, `font-bold leading-tight ${idx === 0 ? "text-sm" : "text-[11px]"}`, { color: "#fff" })}</div>}
          </CItem>
        ))}
      </Container>
    );
  }

  return null;
}

export default ImageLayoutRenderer;
