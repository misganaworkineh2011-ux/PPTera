"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { GripVertical, X, Edit3 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { type SlideElement } from "~/components/presentation/types";
import { type Theme } from "~/lib/themes";

// Snap zone types for different positions in the slide
export type SnapZone = 
  | "before-title"
  | "after-title"
  | "before-content"
  | "after-content"
  | "before-chart"
  | "after-chart"
  | "between-bullets"
  | "free"; // Free positioning anywhere

export interface ElementPosition {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  snapZone?: SnapZone;
  bulletIndex?: number; // For between-bullets positioning
}

interface DraggableElementProps {
  element: SlideElement;
  theme: Theme;
  isEditing: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  snapZones?: SnapZoneData[];
  onPositionChange: (elementId: string, position: ElementPosition) => void;
  onEdit: (element: SlideElement) => void;
  onDelete: (elementId: string) => void;
}

export interface SnapZoneData {
  id: string;
  type: SnapZone;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  bulletIndex?: number;
}

export default function DraggableElement({
  element,
  theme,
  isEditing,
  containerRef,
  snapZones = [],
  onPositionChange,
  onEdit,
  onDelete,
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ x: element.x, y: element.y });
  const [activeSnapZone, setActiveSnapZone] = useState<SnapZoneData | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const { type, content, variant, icon, color, backgroundColor, opacity, fontSize, zIndex } = element;

  const fontSizeClass = {
    xs: "text-[0.5rem] sm:text-xs",
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-base sm:text-lg",
    xl: "text-lg sm:text-xl",
  }[fontSize || "md"];

  const renderIcon = (iconName: string, size: number = 16) => {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>>)[iconName];
    if (IconComponent) return <IconComponent size={size} style={{ color }} />;
    return null;
  };

  // Find the closest snap zone to current position
  const findClosestSnapZone = useCallback((x: number, y: number): SnapZoneData | null => {
    if (snapZones.length === 0) return null;
    
    const SNAP_THRESHOLD = 15; // percentage distance to snap
    let closest: SnapZoneData | null = null;
    let minDistance = Infinity;

    for (const zone of snapZones) {
      const zoneCenterX = zone.x + zone.width / 2;
      const zoneCenterY = zone.y + zone.height / 2;
      const distance = Math.sqrt(Math.pow(x - zoneCenterX, 2) + Math.pow(y - zoneCenterY, 2));
      
      if (distance < SNAP_THRESHOLD && distance < minDistance) {
        minDistance = distance;
        closest = zone;
      }
    }

    return closest;
  }, [snapZones]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditing || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const elementRect = elementRef.current?.getBoundingClientRect();
    
    if (!elementRect) return;

    // Calculate offset from element center
    const offsetX = e.clientX - (elementRect.left + elementRect.width / 2);
    const offsetY = e.clientY - (elementRect.top + elementRect.height / 2);
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  }, [isEditing, containerRef]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate position as percentage
    const x = ((e.clientX - dragOffset.x - rect.left) / rect.width) * 100;
    const y = ((e.clientY - dragOffset.y - rect.top) / rect.height) * 100;
    
    // Clamp to container bounds
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    
    // Check for snap zones
    const snapZone = findClosestSnapZone(clampedX, clampedY);
    setActiveSnapZone(snapZone);
    
    if (snapZone) {
      // Snap to zone center
      setCurrentPosition({
        x: snapZone.x + snapZone.width / 2,
        y: snapZone.y + snapZone.height / 2,
      });
    } else {
      setCurrentPosition({ x: clampedX, y: clampedY });
    }
  }, [isDragging, containerRef, dragOffset, findClosestSnapZone]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Commit the position change
    onPositionChange(element.id, {
      x: currentPosition.x,
      y: currentPosition.y,
      snapZone: activeSnapZone?.type,
      bulletIndex: activeSnapZone?.bulletIndex,
    });
    
    setActiveSnapZone(null);
  }, [isDragging, element.id, currentPosition, activeSnapZone, onPositionChange]);

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Render the element content based on type
  const renderElementContent = () => {
    const baseStyle: React.CSSProperties = {
      opacity: (opacity || 100) / 100,
    };

    switch (type) {
      case "shape":
        return (
          <div
            style={{
              ...baseStyle,
              width: "100%",
              aspectRatio: variant === "circle" ? "1" : undefined,
              backgroundColor: backgroundColor || color,
              borderRadius: variant === "circle" ? "50%" : variant === "rounded-rectangle" ? "0.75rem" : undefined,
              clipPath: variant === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" 
                : variant === "diamond" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                : variant === "hexagon" ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
                : variant === "star" ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                : undefined,
              minHeight: "40px",
              minWidth: "40px",
            }}
          />
        );

      case "callout": {
        const calloutColors: Record<string, { bg: string; border: string; iconColor: string }> = {
          info: { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", iconColor: "#3b82f6" },
          success: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)", iconColor: "#22c55e" },
          warning: { bg: "rgba(234, 179, 8, 0.1)", border: "rgba(234, 179, 8, 0.3)", iconColor: "#eab308" },
          tip: { bg: "rgba(6, 182, 212, 0.1)", border: "rgba(6, 182, 212, 0.3)", iconColor: "#06b6d4" },
          note: { bg: "rgba(100, 116, 139, 0.1)", border: "rgba(100, 116, 139, 0.3)", iconColor: "#64748b" },
        };
        const defaultCalloutStyle = { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", iconColor: "#3b82f6" };
        const calloutStyle = calloutColors[variant || "info"] ?? defaultCalloutStyle;
        return (
          <div
            style={{
              ...baseStyle,
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              border: `1px solid ${calloutStyle.border}`,
              backgroundColor: calloutStyle.bg,
            }}
          >
            {icon && (
              <span style={{ color: calloutStyle.iconColor, flexShrink: 0 }}>
                {renderIcon(icon, 18)}
              </span>
            )}
            <span className={fontSizeClass} style={{ color: theme.colors.text }}>
              {content}
            </span>
          </div>
        );
      }

      case "badge":
        return (
          <span
            className={`${fontSizeClass} font-semibold`}
            style={{
              ...baseStyle,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.25rem 0.75rem",
              borderRadius: variant === "pill" ? "9999px" : "0.375rem",
              backgroundColor: variant === "outline" ? "transparent" : (backgroundColor || color),
              border: variant === "outline" ? `2px solid ${color}` : undefined,
              color: variant === "outline" ? color : (backgroundColor ? color : "#fff"),
              whiteSpace: "nowrap",
            }}
          >
            {content}
          </span>
        );

      case "divider":
        return (
          <div
            style={{
              ...baseStyle,
              width: "100%",
              height: variant === "double" ? "4px" : "2px",
              backgroundColor: variant === "gradient" ? undefined : (variant === "dashed" || variant === "dotted" ? "transparent" : color),
              background: variant === "gradient" ? `linear-gradient(90deg, transparent, ${color}, transparent)` : undefined,
              borderTop: variant === "dashed" ? `2px dashed ${color}` : variant === "dotted" ? `2px dotted ${color}` : variant === "double" ? `4px double ${color}` : undefined,
            }}
          />
        );

      case "quote-box":
        return (
          <div
            style={{
              ...baseStyle,
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              borderLeft: `4px solid ${color}`,
              backgroundColor: `${color}10`,
            }}
          >
            <span className={`${fontSizeClass} italic`} style={{ color: theme.colors.text }}>
              "{content}"
            </span>
          </div>
        );

      case "stat-card":
        return (
          <div
            style={{
              ...baseStyle,
              textAlign: "center",
              padding: "1rem",
              borderRadius: "0.75rem",
              backgroundColor: backgroundColor || `${color}15`,
            }}
          >
            <div className="text-2xl sm:text-3xl font-bold" style={{ color }}>
              {content}
            </div>
            <div className="text-[0.6rem] sm:text-xs mt-1" style={{ color: theme.colors.textMuted }}>
              Statistic
            </div>
          </div>
        );

      case "highlight-box":
        return (
          <div
            className={`${fontSizeClass} font-medium`}
            style={{
              ...baseStyle,
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              backgroundColor: `${color}20`,
              color,
            }}
          >
            {content}
          </div>
        );

      case "arrow":
        return (
          <div style={{ ...baseStyle, color }}>
            {renderIcon(variant === "down" ? "ArrowDown" : variant === "up" ? "ArrowUp" : variant === "left" ? "ArrowLeft" : "ArrowRight", 32)}
          </div>
        );

      case "bracket":
        return (
          <div className="text-3xl sm:text-4xl font-light" style={{ ...baseStyle, color }}>
            {variant === "left" ? "{" : "}"}
          </div>
        );

      default:
        return null;
    }
  };

  const displayPosition = isDragging ? currentPosition : { x: element.x, y: element.y };

  return (
    <>
      {/* Element */}
      <div
        ref={elementRef}
        className={`absolute group ${isDragging ? "cursor-grabbing z-50" : isEditing ? "cursor-grab" : ""}`}
        style={{
          left: `${displayPosition.x}%`,
          top: `${displayPosition.y}%`,
          transform: "translate(-50%, -50%)",
          width: `${element.width}%`,
          zIndex: isDragging ? 1000 : (zIndex || 10),
          pointerEvents: isEditing ? "auto" : "none",
          transition: isDragging ? "none" : "all 0.2s ease-out",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Edit controls - visible on hover when editing */}
        {isEditing && (
          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 ${isDragging ? "opacity-0" : "opacity-0 group-hover:opacity-100"} transition-opacity bg-zinc-900/95 rounded-lg p-1 shadow-lg border border-zinc-700`}>
            <div className="p-1 text-zinc-400 cursor-grab">
              <GripVertical size={14} />
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(element); }}
              className="p-1.5 text-cyan-400 hover:bg-cyan-500/20 rounded transition"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition"
            >
              <X size={14} />
            </button>
          </div>
        )}
        
        {/* Element content with hover ring */}
        <div className={`${isEditing ? "ring-2 ring-transparent group-hover:ring-cyan-500/50 rounded transition-all" : ""}`}>
          {renderElementContent()}
        </div>
      </div>

      {/* Snap zone indicator when dragging */}
      {isDragging && activeSnapZone && (
        <div
          className="absolute pointer-events-none z-40"
          style={{
            left: `${activeSnapZone.x}%`,
            top: `${activeSnapZone.y}%`,
            width: `${activeSnapZone.width}%`,
            height: `${activeSnapZone.height}%`,
          }}
        >
          <div className="w-full h-full border-2 border-dashed border-cyan-400 bg-cyan-400/10 rounded-lg flex items-center justify-center">
            <span className="text-xs font-medium text-cyan-400 bg-zinc-900/80 px-2 py-1 rounded">
              {activeSnapZone.label}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
