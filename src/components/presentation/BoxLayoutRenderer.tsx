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
import { CONTENT_FONT_SIZE } from "./slide-typography";
import { containerVariantsFor, itemMotionProps } from "./item-animations";

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
  itemAnimation?: string;
  revealCount?: number;
  // Spotlight props
  spotlightIndex?: number; // Which item is highlighted (undefined = no spotlight)
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
  itemAnimation,
  revealCount,
  spotlightIndex,
  isSpotlightMode = false,
}: BoxLayoutRendererProps & { hasImage?: boolean }) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredBoxIndex, setHoveredBoxIndex] = useState<number | null>(null); // New local hover state
  const dragRefs = useRef<(HTMLDivElement | null)[]>([]);

  const layout = layoutId
    ? getBoxLayoutById(layoutId) || getRecommendedBoxLayout(items.length)
    : getRecommendedBoxLayout(items.length);

  if (!layout || items.length === 0) return null;

  const gridStyles = getBoxLayoutGridTemplate(items.length, isNarrowSpace, hasImage);
  const baseStyles = getBaseBoxStyles(theme);

  // Premium card background: a soft accent corner-glow over the card colour reads
  // more dimensional than a flat fill. Falls back to the flat colour for any
  // non-hex accent. Depth + hover come from the shared `.ppt-tile` class.
  const accentHex = /^#[0-9a-f]{6}$/i.test(baseStyles.accentColor) ? baseStyles.accentColor : null;
  const cardBg = accentHex
    ? `radial-gradient(120% 115% at 0% 0%, ${accentHex}14 0%, transparent 48%), ${baseStyles.bgColor}`
    : baseStyles.bgColor;

  // Determine effective spotlight state (prop or local hover)
  const effectiveSpotlightIndex = spotlightIndex;
  const effectiveIsSpotlightMode = isSpotlightMode;

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
    const labelTextStyle: React.CSSProperties = {
      color: baseStyles.titleColor,
      fontSize: compact ? "1.1rem" : "1.25rem",
      textAlign: "center",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      lineHeight: 1.2,
    };
    const labelElement = item.label && (
      <div className="flex w-full flex-col items-center">
        {onStartEditLabel ? (
          <EditableText
            value={item.label}
            isEditing={isEditing && editingText?.field === `content-label-${idx}`}
            onStartEdit={() => onStartEditLabel(idx)}
            onChange={(val) => onUpdateLabel?.(idx, val)}
            onFinish={onFinishEditing || (() => {})}
            onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
            className="font-serif"
            style={labelTextStyle}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        ) : (
          <h3 className="font-serif" style={labelTextStyle}>
            {item.label}
          </h3>
        )}
        {/* Editorial accent rule — a small premium detail under each card title. */}
        <span
          aria-hidden
          className="mt-2 mb-3 rounded-full"
          style={{ width: 26, height: 2, backgroundColor: baseStyles.accentColor, opacity: 0.75 }}
        />
      </div>
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
          fontSize: compact ? CONTENT_FONT_SIZE.compact : CONTENT_FONT_SIZE.normal,
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
          fontSize: compact ? CONTENT_FONT_SIZE.compact : CONTENT_FONT_SIZE.normal,
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
    // Disable hover effects during presentation mode
    const commonClasses = isPresenting
      ? "flex flex-col h-full w-full relative ppt-tile"
      : "flex flex-col h-full w-full transition-all duration-200 relative ppt-tile";
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

    // Disable hover classes during presentation
    const wrapperClasses = isPresenting 
      ? `relative h-full ${isDragging ? "opacity-50" : ""} ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2" : ""}`
      : `relative group/drag-item h-full ${isDragging ? "opacity-50" : ""} ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2" : ""}`;
    const wrapperStyle: React.CSSProperties = { cursor: canDrag ? "grab" : "default" };

    // No drag handle during presentation
    const dragHandle = canDrag && !isPresenting && (
      <div 
        className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag-item:opacity-60 transition-opacity cursor-grab z-20"
        title="Drag to reorder"
      >
        <GripVertical size={14} className="text-current" />
      </div>
    );

    const renderBoxContent1 = () => (
      <div className={commonClasses} style={{
        background: cardBg,
        borderRadius: baseStyles.borderRadius,
        borderLeft: `6px solid ${baseStyles.accentColor}`,
        padding: compact ? "1.25rem 0.875rem" : "2rem 1.25rem",
      }}>
        {labelElement}
        {textElement}
      </div>
    );

    const renderBoxContent2 = () => (
      <div className={commonClasses} style={{
        background: cardBg,
        borderRadius: baseStyles.borderRadius,
        border: `1px solid ${baseStyles.borderColor}`,
        padding: compact ? "1.25rem 0.875rem" : "2rem 1.25rem",
      }}>
        {labelElement}
        {textElement}
      </div>
    );

    const renderBoxContent3 = () => (
      <div className={commonClasses} style={{
        background: cardBg,
        borderRadius: baseStyles.borderRadius,
        border: `1px solid ${baseStyles.borderColor}`,
        padding: compact ? "1.25rem 0.875rem" : "2rem 1.25rem",
      }}>
        {item.icon && (
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl flex items-center justify-center" style={{
              backgroundColor: baseStyles.accentColor,
              width: compact ? "36px" : "48px",
              height: compact ? "36px" : "48px",
              color: "white",
              fontSize: compact ? "18px" : "24px",
              boxShadow: accentHex ? `0 8px 18px -6px ${accentHex}77` : undefined,
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
        background: cardBg,
        borderRadius: baseStyles.borderRadius,
        border: `1px solid ${baseStyles.borderColor}`,
        paddingTop: compact ? "2.5rem" : "3rem",
      }}>
        <div className="absolute top-0 left-0 right-0" style={{ height: "6px", backgroundColor: baseStyles.accentColor }} />
        {/* Accent badge: the item's icon, or a numbered badge (templates' "01/02" style). */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[3px]" style={{ zIndex: 10 }}>
          <div className="rounded-2xl flex items-center justify-center tabular-nums" style={{
            backgroundColor: baseStyles.accentColor,
            width: compact ? "36px" : "48px",
            height: compact ? "36px" : "48px",
            color: "white",
            fontSize: compact ? "18px" : "24px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            boxShadow: accentHex ? `0 8px 18px -6px ${accentHex}77` : undefined,
          }}>
            {item.icon || String(idx + 1).padStart(2, "0")}
          </div>
        </div>
        <div style={{ padding: compact ? "0 0.875rem 1.25rem" : "0 1.25rem 2rem" }}>
          {labelElement}
          {textElement}
        </div>
      </div>
    );

    // Left-aligned, sans-serif content used by the added card designs (5-14).
    // Same edit wiring as renderBoxContent, different typography.
    const alignedContent = (align: "left" | "center" = "left", labelColor?: string, bodyColor?: string) => {
      const lStyle: React.CSSProperties = {
        color: labelColor || baseStyles.titleColor,
        fontSize: compact ? "1rem" : "1.15rem",
        textAlign: align,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        lineHeight: 1.25,
      };
      const tStyle: React.CSSProperties = {
        color: bodyColor || baseStyles.bodyColor,
        fontSize: compact ? CONTENT_FONT_SIZE.compact : CONTENT_FONT_SIZE.normal,
        lineHeight: 1.5,
        textAlign: align,
      };
      const labelEl = item.label ? (
        onStartEditLabel ? (
          <EditableText
            value={item.label}
            isEditing={isEditing && editingText?.field === `content-label-${idx}`}
            onStartEdit={() => onStartEditLabel(idx)}
            onChange={(val) => onUpdateLabel?.(idx, val)}
            onFinish={onFinishEditing || (() => {})}
            onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
            style={lStyle}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        ) : (
          <h3 style={lStyle}>{item.label}</h3>
        )
      ) : null;
      const textEl = onStartEditText ? (
        <EditableText
          value={item.text}
          isEditing={isEditing && editingText?.field === `content-text-${idx}`}
          onStartEdit={() => onStartEditText(idx)}
          onChange={(val) => onUpdateText?.(idx, val)}
          onFinish={onFinishEditing || (() => {})}
          onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
          style={tStyle}
          isOwner={isOwner}
          isHovered={isHovered}
        />
      ) : (
        <p style={tStyle}>{item.text}</p>
      );
      return { labelEl, textEl };
    };

    // Style 5: Corner Number — translucent number watermark, left-aligned
    const renderBoxContent5 = () => {
      const { labelEl, textEl } = alignedContent("left");
      return (
        <div className={commonClasses} style={{
          background: cardBg,
          borderRadius: baseStyles.borderRadius,
          border: `1px solid ${baseStyles.borderColor}`,
          padding: compact ? "1.1rem 1rem" : "1.5rem 1.35rem",
          overflow: "hidden",
        }}>
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 right-2 select-none font-black leading-none tabular-nums"
            style={{ fontSize: compact ? "3.4rem" : "4.6rem", color: baseStyles.accentColor, opacity: 0.14, letterSpacing: "-0.05em" }}
          >
            {String(idx + 1).padStart(2, "0")}
          </span>
          <div className="relative">
            {labelEl}
            <div className="mt-2">{textEl}</div>
          </div>
        </div>
      );
    };

    // Style 6: Gradient Frame — thin accent gradient ring around the card
    const renderBoxContent6 = () => (
      <div className="h-full w-full" style={{
        padding: "1.5px",
        borderRadius: baseStyles.borderRadius,
        background: accentHex
          ? `linear-gradient(135deg, ${accentHex}, ${accentHex}22 45%, ${accentHex} 100%)`
          : baseStyles.accentColor,
      }}>
        <div className={commonClasses} style={{
          background: baseStyles.bgColor,
          borderRadius: `calc(${baseStyles.borderRadius} - 1.5px)`,
          padding: compact ? "1.2rem 0.875rem" : "1.9rem 1.25rem",
        }}>
          {labelElement}
          {textElement}
        </div>
      </div>
    );

    // Style 7: Glass Icon Tile — glowing chip top-left, left-aligned
    const renderBoxContent7 = () => {
      const { labelEl, textEl } = alignedContent("left");
      return (
        <div className={commonClasses} style={{
          background: accentHex
            ? `linear-gradient(160deg, ${accentHex}1f 0%, ${accentHex}08 55%), ${baseStyles.bgColor}`
            : cardBg,
          borderRadius: baseStyles.borderRadius,
          border: `1px solid ${accentHex ? `${accentHex}40` : baseStyles.borderColor}`,
          padding: compact ? "1.1rem 1rem" : "1.5rem 1.35rem",
          alignItems: "flex-start",
        }}>
          <div className="mb-3 flex items-center justify-center rounded-xl text-white" style={{
            width: compact ? "34px" : "42px",
            height: compact ? "34px" : "42px",
            fontSize: compact ? "16px" : "20px",
            fontWeight: 800,
            background: `linear-gradient(135deg, ${baseStyles.accentColor}, ${accentHex ? `${accentHex}b3` : baseStyles.accentColor})`,
            boxShadow: accentHex ? `0 6px 16px -4px ${accentHex}88` : undefined,
          }}>
            {item.icon || idx + 1}
          </div>
          {labelEl}
          <div className="mt-1.5">{textEl}</div>
        </div>
      );
    };

    // Style 8: Underline Stack — chromeless, thick accent underline
    const renderBoxContent8 = () => {
      const { labelEl, textEl } = alignedContent("left");
      return (
        <div className={commonClasses} style={{
          background: "transparent",
          padding: compact ? "0.5rem 0.25rem" : "0.75rem 0.5rem",
          alignItems: "flex-start",
        }}>
          <span aria-hidden className="mb-2.5 block h-[3.5px] w-12 rounded-full" style={{ backgroundColor: baseStyles.accentColor }} />
          <span className="mb-1 font-mono text-[11px] font-bold tracking-[0.2em]" style={{ color: baseStyles.accentColor }}>
            {String(idx + 1).padStart(2, "0")}
          </span>
          {labelEl}
          <div className="mt-1.5">{textEl}</div>
        </div>
      );
    };

    // Style 9: Duotone Panel — tinted header band + surface body
    const renderBoxContent9 = () => {
      const { labelEl, textEl } = alignedContent("left", "#ffffff");
      return (
        <div className={commonClasses} style={{
          background: baseStyles.bgColor,
          borderRadius: baseStyles.borderRadius,
          border: `1px solid ${baseStyles.borderColor}`,
          overflow: "hidden",
          padding: 0,
        }}>
          <div className="flex items-center gap-2.5" style={{
            background: `linear-gradient(120deg, ${baseStyles.accentColor}, ${accentHex ? `${accentHex}cc` : baseStyles.accentColor})`,
            padding: compact ? "0.7rem 1rem" : "0.9rem 1.25rem",
          }}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums" style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "#ffffff" }}>
              {item.icon || idx + 1}
            </span>
            <div className="min-w-0 flex-1">{labelEl}</div>
          </div>
          <div style={{ padding: compact ? "0.9rem 1rem" : "1.15rem 1.25rem" }}>{textEl}</div>
        </div>
      );
    };

    // Style 10: Notched Card — clipped corner with mono number
    const renderBoxContent10 = () => {
      const { labelEl, textEl } = alignedContent("left");
      return (
        <div className={commonClasses} style={{
          background: cardBg,
          border: `1px solid ${baseStyles.borderColor}`,
          clipPath: "polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 0 100%)",
          borderRadius: `calc(${baseStyles.borderRadius} / 2)`,
          padding: compact ? "1.1rem 1rem" : "1.5rem 1.35rem",
          alignItems: "flex-start",
        }}>
          <span aria-hidden className="absolute right-0 top-0" style={{
            width: 26, height: 26,
            background: baseStyles.accentColor,
            clipPath: "polygon(0 0, 100% 100%, 0 100%)",
            opacity: 0.85,
          }} />
          <span className="mb-1.5 font-mono text-[11px] font-bold tracking-[0.2em]" style={{ color: baseStyles.accentColor }}>
            {String(idx + 1).padStart(2, "0")}
          </span>
          {labelEl}
          <div className="mt-1.5">{textEl}</div>
        </div>
      );
    };

    // Style 11: Shadow Lift — solid offset shadow, print poster look
    const renderBoxContent11 = () => (
      <div className={commonClasses} style={{
        background: baseStyles.bgColor,
        borderRadius: baseStyles.borderRadius,
        border: `2px solid ${baseStyles.titleColor}`,
        boxShadow: `6px 6px 0 0 ${baseStyles.accentColor}`,
        padding: compact ? "1.2rem 0.875rem" : "1.9rem 1.25rem",
        marginRight: 6,
        marginBottom: 6,
      }}>
        {labelElement}
        {textElement}
      </div>
    );

    // Style 12: Badge Left — number badge overlapping the top-left edge
    const renderBoxContent12 = () => {
      const { labelEl, textEl } = alignedContent("left");
      return (
        <div className={commonClasses} style={{
          background: cardBg,
          borderRadius: baseStyles.borderRadius,
          border: `1px solid ${baseStyles.borderColor}`,
          padding: compact ? "1.1rem 1rem 1.1rem 1.6rem" : "1.5rem 1.25rem 1.5rem 1.9rem",
          marginLeft: compact ? 14 : 18,
          alignItems: "flex-start",
          overflow: "visible",
        }}>
          <span className="absolute flex items-center justify-center rounded-full font-extrabold text-white tabular-nums" style={{
            left: compact ? -14 : -18,
            top: compact ? "0.9rem" : "1.2rem",
            width: compact ? 28 : 36,
            height: compact ? 28 : 36,
            fontSize: compact ? 12 : 15,
            background: `linear-gradient(135deg, ${baseStyles.accentColor}, ${accentHex ? `${accentHex}cc` : baseStyles.accentColor})`,
            boxShadow: accentHex ? `0 4px 12px -2px ${accentHex}77` : "0 4px 12px rgba(0,0,0,0.18)",
          }}>
            {item.icon || idx + 1}
          </span>
          {labelEl}
          <div className="mt-1.5">{textEl}</div>
        </div>
      );
    };

    // Style 13: Pill Header — label in an accent pill, dashed card
    const renderBoxContent13 = () => {
      const lStyle: React.CSSProperties = {
        color: "#ffffff",
        fontSize: compact ? "0.85rem" : "0.95rem",
        fontWeight: 700,
        lineHeight: 1.25,
        textAlign: "center",
      };
      const pillLabel = item.label ? (
        onStartEditLabel ? (
          <EditableText
            value={item.label}
            isEditing={isEditing && editingText?.field === `content-label-${idx}`}
            onStartEdit={() => onStartEditLabel(idx)}
            onChange={(val) => onUpdateLabel?.(idx, val)}
            onFinish={onFinishEditing || (() => {})}
            onDelete={onDeleteItem ? () => onDeleteItem(idx) : undefined}
            style={lStyle}
            isOwner={isOwner}
            isHovered={isHovered}
          />
        ) : (
          <h3 style={lStyle}>{item.label}</h3>
        )
      ) : null;
      const { textEl } = alignedContent("center");
      return (
        <div className={commonClasses} style={{
          background: "transparent",
          borderRadius: baseStyles.borderRadius,
          border: `1.5px dashed ${accentHex ? `${accentHex}66` : baseStyles.borderColor}`,
          padding: compact ? "1.1rem 0.875rem" : "1.6rem 1.15rem",
          alignItems: "center",
        }}>
          {pillLabel && (
            <div className="mb-2.5 rounded-full px-4 py-1.5" style={{
              background: `linear-gradient(120deg, ${baseStyles.accentColor}, ${accentHex ? `${accentHex}cc` : baseStyles.accentColor})`,
              boxShadow: accentHex ? `0 4px 12px -4px ${accentHex}88` : undefined,
            }}>
              {pillLabel}
            </div>
          )}
          {textEl}
        </div>
      );
    };

    // Style 14: Ticket Stub — perforated stub edge with the number
    const renderBoxContent14 = () => {
      const { labelEl, textEl } = alignedContent("left");
      const stubW = compact ? 34 : 44;
      return (
        <div className={commonClasses} style={{
          background: cardBg,
          borderRadius: baseStyles.borderRadius,
          border: `1px solid ${baseStyles.borderColor}`,
          padding: compact ? `1.1rem 1rem 1.1rem ${stubW + 12}px` : `1.5rem 1.25rem 1.5rem ${stubW + 16}px`,
          alignItems: "flex-start",
          overflow: "hidden",
        }}>
          {/* Stub area */}
          <span aria-hidden className="absolute bottom-0 left-0 top-0 flex items-center justify-center" style={{
            width: stubW,
            background: accentHex ? `${accentHex}1a` : baseStyles.bgColor,
            borderRight: `1.5px dashed ${accentHex ? `${accentHex}59` : baseStyles.borderColor}`,
          }}>
            <span className="font-mono font-extrabold tabular-nums" style={{ color: baseStyles.accentColor, fontSize: compact ? 13 : 16, transform: "rotate(-90deg)", letterSpacing: "0.15em" }}>
              {String(idx + 1).padStart(2, "0")}
            </span>
          </span>
          {/* Punched notches on the perforation */}
          <span aria-hidden className="absolute rounded-full" style={{ left: stubW - 5, top: -5, width: 10, height: 10, background: theme.colors.background || "#0b1220", border: `1px solid ${baseStyles.borderColor}` }} />
          <span aria-hidden className="absolute rounded-full" style={{ left: stubW - 5, bottom: -5, width: 10, height: 10, background: theme.colors.background || "#0b1220", border: `1px solid ${baseStyles.borderColor}` }} />
          {labelEl}
          <div className="mt-1.5">{textEl}</div>
        </div>
      );
    };

    const getBoxContent = () => {
      switch (layout.id) {
        case "box-style-1": return renderBoxContent1();
        case "box-style-2": return renderBoxContent2();
        case "box-style-3": return renderBoxContent3();
        case "box-style-4": return renderBoxContent4();
        case "box-style-5": return renderBoxContent5();
        case "box-style-6": return renderBoxContent6();
        case "box-style-7": return renderBoxContent7();
        case "box-style-8": return renderBoxContent8();
        case "box-style-9": return renderBoxContent9();
        case "box-style-10": return renderBoxContent10();
        case "box-style-11": return renderBoxContent11();
        case "box-style-12": return renderBoxContent12();
        case "box-style-13": return renderBoxContent13();
        case "box-style-14": return renderBoxContent14();
        default: return null;
      }
    };

    const handleMouseEnter = () => setHoveredBoxIndex(idx);
    const handleMouseLeave = () => setHoveredBoxIndex(null);

    // When presenting, use motion.div for animations
    if (isPresenting) {
      return (
        <motion.div 
          key={idx} 
          className={wrapperClasses} 
          style={{
            ...wrapperStyle,
            ...getSpotlightStyle(idx, effectiveSpotlightIndex ?? undefined, effectiveIsSpotlightMode),
          }}
          {...itemMotionProps(true, itemAnimation, revealCount, idx)}
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
        style={{
          ...wrapperStyle,
          // Apply spotlight effects in editor mode too for consistent behavior
          ...getSpotlightStyle(idx, effectiveSpotlightIndex ?? undefined, effectiveIsSpotlightMode),
        }} 
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
            variants={containerVariantsFor(itemAnimation)}
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
        variants={containerVariantsFor(itemAnimation)}
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
        <div key={i} className="rounded-sm relative overflow-hidden" style={{ backgroundColor: baseStyles.bgColor, border: layout.id === "box-style-13" ? `1px dashed ${baseStyles.accentColor}` : layout.id === "box-style-11" ? `1px solid ${baseStyles.titleColor}` : `1px solid ${baseStyles.borderColor}`, boxShadow: layout.id === "box-style-11" ? `2px 2px 0 0 ${baseStyles.accentColor}` : undefined }}>
          {layout.id === "box-style-1" && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: baseStyles.accentColor }} />}
          {(layout.id === "box-style-3" || layout.id === "box-style-4") && <div className="flex justify-center mt-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: baseStyles.accentColor }} /></div>}
          {layout.id === "box-style-4" && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: baseStyles.accentColor }} />}
          {layout.id === "box-style-5" && <div className="absolute top-0 right-0.5 text-[7px] font-black" style={{ color: baseStyles.accentColor, opacity: 0.4 }}>01</div>}
          {layout.id === "box-style-6" && <div className="absolute inset-0 rounded-sm" style={{ border: `1px solid ${baseStyles.accentColor}`, opacity: 0.7 }} />}
          {(layout.id === "box-style-7" || layout.id === "box-style-12") && <div className="absolute left-1 top-1 w-1.5 h-1.5 rounded-[2px]" style={{ backgroundColor: baseStyles.accentColor }} />}
          {layout.id === "box-style-8" && <div className="absolute left-1 top-1 w-3 h-0.5 rounded-full" style={{ backgroundColor: baseStyles.accentColor }} />}
          {layout.id === "box-style-9" && <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: baseStyles.accentColor, opacity: 0.85 }} />}
          {layout.id === "box-style-10" && <div className="absolute right-0 top-0 w-1.5 h-1.5" style={{ backgroundColor: baseStyles.accentColor, clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />}
          {layout.id === "box-style-13" && <div className="mx-auto mt-1 w-3 h-1 rounded-full" style={{ backgroundColor: baseStyles.accentColor }} />}
          {layout.id === "box-style-14" && <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: baseStyles.accentColor, opacity: 0.25, borderRight: `1px dashed ${baseStyles.accentColor}` }} />}
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
