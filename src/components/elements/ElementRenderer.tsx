"use client";

import { useRef } from "react";
import * as LucideIcons from "lucide-react";
import { type SlideElement } from "~/components/presentation/types";
import { type Theme } from "~/lib/themes";
import DraggableElement, { type SnapZoneData, type ElementPosition } from "./DraggableElement";

interface ElementRendererProps {
  elements: SlideElement[];
  theme: Theme;
  isEditing?: boolean;
  snapZones?: SnapZoneData[];
  onElementClick?: (element: SlideElement) => void;
  onElementDelete?: (elementId: string) => void;
  onElementPositionChange?: (elementId: string, position: ElementPosition) => void;
}

export default function ElementRenderer({ 
  elements, 
  theme, 
  isEditing = false,
  snapZones = [],
  onElementClick,
  onElementDelete,
  onElementPositionChange,
}: ElementRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!elements || elements.length === 0) return null;

  // If editing mode with drag support
  if (isEditing && onElementPositionChange) {
    return (
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            theme={theme}
            isEditing={isEditing}
            containerRef={containerRef}
            snapZones={snapZones}
            onPositionChange={onElementPositionChange}
            onEdit={(el) => onElementClick?.(el)}
            onDelete={(id) => onElementDelete?.(id)}
          />
        ))}
      </div>
    );
  }

  // Non-editing mode - static rendering
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => (
        <StaticElementItem
          key={element.id}
          element={element}
          theme={theme}
        />
      ))}
    </div>
  );
}

// Static element rendering (non-draggable)
function StaticElementItem({ element, theme }: { element: SlideElement; theme: Theme }) {
  const { type, x, y, width, height, content, variant, icon, color, backgroundColor, opacity, fontSize, zIndex } = element;

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

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    transform: "translate(-50%, -50%)",
    width: `${width}%`,
    opacity: (opacity || 100) / 100,
    zIndex: zIndex || 10,
    pointerEvents: "none",
  };

  switch (type) {
    case "shape":
      return (
        <div
          style={{
            ...baseStyle,
            aspectRatio: variant === "circle" ? "1" : undefined,
            height: variant === "circle" ? undefined : `${height}%`,
            backgroundColor: backgroundColor || color,
            borderRadius: variant === "circle" ? "50%" : variant === "rounded-rectangle" ? "0.75rem" : undefined,
            clipPath: variant === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" 
              : variant === "diamond" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
              : variant === "hexagon" ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
              : variant === "star" ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
              : undefined,
          }}
        />
      );

    case "callout": {
      const defaultCalloutStyle = { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", iconColor: "#3b82f6" };
      const calloutColors: Record<string, { bg: string; border: string; iconColor: string }> = {
        info: defaultCalloutStyle,
        success: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)", iconColor: "#22c55e" },
        warning: { bg: "rgba(234, 179, 8, 0.1)", border: "rgba(234, 179, 8, 0.3)", iconColor: "#eab308" },
        tip: { bg: "rgba(6, 182, 212, 0.1)", border: "rgba(6, 182, 212, 0.3)", iconColor: "#06b6d4" },
        note: { bg: "rgba(100, 116, 139, 0.1)", border: "rgba(100, 116, 139, 0.3)", iconColor: "#64748b" },
      };
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
        <div
          className="text-3xl sm:text-4xl font-light"
          style={{ ...baseStyle, color }}
        >
          {variant === "left" ? "{" : "}"}
        </div>
      );

    default:
      return null;
  }
}

// Export types for use in other components
export type { SnapZoneData, ElementPosition };
