"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type {
  BoxLayout,
  BoxLayoutType,
  BoxContentItem,
} from "~/lib/layouts/content/boxes";
import {
  getBoxLayoutById,
  getBoxLayoutGridTemplate,
  getBaseBoxStyles,
  getRecommendedBoxLayout,
} from "~/lib/layouts/content/boxes";
import EditableText from "./EditableText";

// Animation variants for staggered box animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const boxVariants = {
  hidden: { 
    opacity: 0, 
    y: 25, 
    scale: 0.95,
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

interface BoxLayoutRendererProps {
  layoutId?: BoxLayoutType;
  items: BoxContentItem[];
  theme: Theme;
  compact?: boolean;
  showIcons?: boolean;
  className?: string;
  isNarrowSpace?: boolean;
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
  isPresenting?: boolean;
  animationKey?: string;
}

export default function BoxLayoutRenderer({
  layoutId,
  items,
  theme,
  compact = false,
  className = "",
  isNarrowSpace = false,
  hasImage = false,
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
  isPresenting = false,
  animationKey,
}: BoxLayoutRendererProps & { hasImage?: boolean }) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragRefs = useRef<(HTMLDivElement | null)[]>([]);

  const layout = layoutId
    ? getBoxLayoutById(layoutId) || getRecommendedBoxLayout(items.length)
    : getRecommendedBoxLayout(items.length);

  if (!layout || items.length === 0) return null;

  const gridStyles = getBoxLayoutGridTemplate(items.length, isNarrowSpace, hasImage);
  const baseStyles = getBaseBoxStyles(theme);

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

  const renderBoxContent = (item: BoxContentItem, idx: number) => {
    const labelElement = item.label && (
      onStartEditLabel ? (
        <EditableText
          value={item.label}
          isEditing={isEditing && editingText?.field === `content-label-${idx}`}
          onStartEdit={() => onStartEditLabel(idx)}
          onChange={(val) => onUpdateLabel?.(idx, val)}
          onFinish={onFinishEditing || (() => {})}
          onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
          className="font-serif mb-3"
          style={{
            color: baseStyles.titleColor,
            fontSize: compact ? "1.1rem" : "1.25rem",
            textAlign: "center",
            fontWeight: "600",
          }}
          isOwner={isOwner}
          isHovered={isHovered}
        />
      ) : (
        <h3
          className="font-serif mb-3"
          style={{
            color: baseStyles.titleColor,
            fontSize: compact ? "1.1rem" : "1.25rem",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          {item.label}
        </h3>
      )
    );

    const textElement = onStartEditText ? (
      <EditableText
        value={item.text}
        isEditing={isEditing && editingText?.field === `content-text-${idx}`}
        onStartEdit={() => onStartEditText(idx)}
        onChange={(val) => onUpdateText?.(idx, val)}
        onFinish={onFinishEditing || (() => {})}
        onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
        style={{
          color: baseStyles.bodyColor,
          fontSize: compact ? "1rem" : "1.1rem",
          lineHeight: 1.5,
          textAlign: "center",
        }}
        isOwner={isOwner}
        isHovered={isHovered}
      />
    ) : (
      <p
        style={{
          color: baseStyles.bodyColor,
          fontSize: compact ? "1rem" : "1.1rem",
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        {item.text}
      </p>
    );

    return { labelElement, textElement };
  };

  const renderBox = (item: BoxContentItem, idx: number) => {
    const commonClasses = "flex flex-col h-full w-full transition-all duration-200 hover:shadow-lg relative";
    const isDragging = draggedIndex === idx;
    const isDragOver = dragOverIndex === idx;
    const canDrag = isOwner && onReorderItems && items.length > 1 && !isPresenting;
    const { labelElement, textElement } = renderBoxContent(item, idx);

    const dragProps = canDrag ? {
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, idx),
      onDragEnd: handleDragEnd,
      onDragOver: (e: React.DragEvent) => handleDragOver(e, idx),
      onDragLeave: handleDragLeave,
      onDrop: (e: React.DragEvent) => handleDrop(e, idx),
    } : {};

    const wrapperClasses = `relative group/drag-item h-full ${isDragging ? "opacity-50" : ""} ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2" : ""}`;
    const wrapperStyle: React.CSSProperties = { cursor: canDrag ? "grab" : "default" };

    const dragHandle = canDrag && (
      <div 
        className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag-item:opacity-60 transition-opacity cursor-grab z-20"
        title="Drag to reorder"
      >
        <GripVertical size={14} className="text-current" />
      </div>
    );

    const renderBoxContent1 = () => (
      <div className={commonClasses} style={{
        backgroundColor: baseStyles.bgColor,
        borderRadius: baseStyles.borderRadius,
        boxShadow: baseStyles.shadow,
        borderLeft: `6px solid ${baseStyles.accentColor}`,
        padding: compact ? "1.25rem 0.875rem" : "2rem 1.25rem",
      }}>
        {labelElement}
        {textElement}
      </div>
    );

    const renderBoxContent2 = () => (
      <div className={commonClasses} style={{
        backgroundColor: baseStyles.bgColor,
        borderRadius: baseStyles.borderRadius,
        boxShadow: baseStyles.shadow,
        border: `1px solid ${baseStyles.borderColor}`,
        padding: compact ? "1.25rem 0.875rem" : "2rem 1.25rem",
      }}>
        {labelElement}
        {textElement}
      </div>
    );

    const renderBoxContent3 = () => (
      <div className={commonClasses} style={{
        backgroundColor: baseStyles.bgColor,
        borderRadius: baseStyles.borderRadius,
        boxShadow: baseStyles.shadow,
        border: `1px solid ${baseStyles.borderColor}`,
        padding: compact ? "1.25rem 0.875rem" : "2rem 1.25rem",
      }}>
        {item.icon && (
          <div className="flex justify-center mb-4">
            <div className="rounded-full flex items-center justify-center" style={{
              backgroundColor: baseStyles.accentColor,
              width: compact ? "36px" : "48px",
              height: compact ? "36px" : "48px",
              color: "white",
              fontSize: compact ? "18px" : "24px",
            }}>
              {item.icon}
            </div>
          </div>
        )}
        {labelElement}
        {textElement}
      </div>
    );

    const renderBoxContent4 = () => (
      <div className={commonClasses} style={{
        backgroundColor: baseStyles.bgColor,
        borderRadius: baseStyles.borderRadius,
        boxShadow: baseStyles.shadow,
        border: `1px solid ${baseStyles.borderColor}`,
        paddingTop: compact ? "2.5rem" : "3rem",
      }}>
        <div className="absolute top-0 left-0 right-0" style={{ height: "6px", backgroundColor: baseStyles.accentColor }} />
        {item.icon && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[3px]" style={{ zIndex: 10 }}>
            <div className="rounded-full flex items-center justify-center" style={{
              backgroundColor: baseStyles.accentColor,
              width: compact ? "36px" : "48px",
              height: compact ? "36px" : "48px",
              color: "white",
              fontSize: compact ? "18px" : "24px",
            }}>
              {item.icon}
            </div>
          </div>
        )}
        <div style={{ padding: compact ? "0 0.875rem 1.25rem" : "0 1.25rem 2rem" }}>
          {labelElement}
          {textElement}
        </div>
      </div>
    );

    const getBoxContent = () => {
      switch (layout.id) {
        case "box-style-1": return renderBoxContent1();
        case "box-style-2": return renderBoxContent2();
        case "box-style-3": return renderBoxContent3();
        case "box-style-4": return renderBoxContent4();
        default: return null;
      }
    };

    // When presenting, use motion.div for animations
    if (isPresenting) {
      return (
        <motion.div 
          key={idx} 
          className={wrapperClasses} 
          style={wrapperStyle}
          variants={boxVariants}
        >
          {getBoxContent()}
        </motion.div>
      );
    }

    // When not presenting, use regular div with drag support
    return (
      <div 
        key={idx} 
        ref={(el) => { dragRefs.current[idx] = el; }} 
        className={wrapperClasses} 
        style={wrapperStyle} 
        {...dragProps}
      >
        {dragHandle}
        {getBoxContent()}
      </div>
    );
  };

  if (gridStyles.specialLayout === "image-2-1" || gridStyles.specialLayout === "narrow-3") {
    if (items.length === 3) {
      if (isPresenting) {
        return (
          <motion.div 
            key={animationKey}
            className={className} 
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: gridStyles.gap, width: "100%" }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {items.slice(0, 2).map((item, idx) => renderBox(item, idx))}
            <div style={{ gridColumn: "1 / -1" }}>{renderBox(items[2]!, 2)}</div>
          </motion.div>
        );
      }
      
      return (
        <div className={className} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: gridStyles.gap, width: "100%" }}>
          {items.slice(0, 2).map((item, idx) => renderBox(item, idx))}
          <div style={{ gridColumn: "1 / -1" }}>{renderBox(items[2]!, 2)}</div>
        </div>
      );
    }
  }

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: hasImage ? gridStyles.gridTemplateColumns : `repeat(${items.length}, minmax(0, 1fr))`,
    gridTemplateRows: gridStyles.gridTemplateRows,
    gap: gridStyles.gap,
    width: "100%",
  };

  // Use motion.div container when presenting for staggered animations
  if (isPresenting) {
    return (
      <motion.div 
        key={animationKey}
        className={className} 
        style={gridStyle}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, idx) => renderBox(item, idx))}
      </motion.div>
    );
  }

  return (
    <div className={className} style={gridStyle}>
      {items.map((item, idx) => renderBox(item, idx))}
    </div>
  );
}


export function BoxLayoutPreview({
  layout,
  itemCount = 3,
  theme,
  hasImage = false,
}: {
  layout: BoxLayout;
  itemCount?: number;
  theme?: Theme;
  hasImage?: boolean;
}) {
  const gridStyles = getBoxLayoutGridTemplate(itemCount, false, hasImage);
  const items = Array.from({ length: itemCount }, (_, i) => i);
  const baseStyles = getBaseBoxStyles(theme || {} as Theme);

  return (
    <div style={{ display: "grid", gridTemplateColumns: gridStyles.gridTemplateColumns, gridTemplateRows: gridStyles.gridTemplateRows, gap: "4px", padding: "4px", width: "100%", height: "100%" }}>
      {items.map((_, i) => (
        <div key={i} className="rounded-sm relative overflow-hidden" style={{ backgroundColor: baseStyles.bgColor, border: `1px solid ${baseStyles.borderColor}` }}>
          {layout.id === "box-style-1" && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: baseStyles.accentColor }} />}
          {(layout.id === "box-style-3" || layout.id === "box-style-4") && <div className="flex justify-center mt-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: baseStyles.accentColor }} /></div>}
          {layout.id === "box-style-4" && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: baseStyles.accentColor }} />}
          <div className="mt-4 mx-auto w-3/4 h-1 bg-slate-300 rounded-sm" />
          <div className="mt-1 mx-auto w-1/2 h-0.5 bg-slate-200 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export function BoxLayoutPreviewWithContent({
  layout,
  items,
  theme,
  hasImage = false,
}: {
  layout: BoxLayout;
  items: BoxContentItem[];
  theme: Theme;
  hasImage?: boolean;
}) {
  const displayItems = items.slice(0, layout.maxItems);
  const gridStyles = getBoxLayoutGridTemplate(displayItems.length, false, hasImage);
  const baseStyles = getBaseBoxStyles(theme);

  return (
    <div style={{ display: "grid", gridTemplateColumns: gridStyles.gridTemplateColumns, gridTemplateRows: gridStyles.gridTemplateRows, gap: "4px", padding: "4px", width: "100%", height: "100%" }}>
      {displayItems.map((item, i) => (
        <div key={i} className="rounded-sm relative overflow-hidden flex flex-col items-center p-1" style={{ backgroundColor: baseStyles.bgColor, border: `1px solid ${baseStyles.borderColor}` }}>
          {layout.id === "box-style-1" && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: baseStyles.accentColor }} />}
          {layout.id === "box-style-4" && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: baseStyles.accentColor }} />}
          {(layout.id === "box-style-3" || layout.id === "box-style-4") && item.icon && (
            <div className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] text-white mb-0.5" style={{ backgroundColor: baseStyles.accentColor }}>{item.icon}</div>
          )}
          <div className="text-[5px] font-bold truncate w-full text-center" style={{ color: baseStyles.titleColor }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}
