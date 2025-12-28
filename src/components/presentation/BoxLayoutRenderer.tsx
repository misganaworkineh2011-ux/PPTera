"use client";

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

interface BoxLayoutRendererProps {
  layoutId?: BoxLayoutType;
  items: BoxContentItem[];
  theme: Theme;
  compact?: boolean;
  showIcons?: boolean;
  className?: string;
  isNarrowSpace?: boolean; // true when image is left/right, false when top/bottom
}

export default function BoxLayoutRenderer({
  layoutId,
  items,
  theme,
  compact = false,
  showIcons = true,
  className = "",
  isNarrowSpace = false,
}: BoxLayoutRendererProps) {
  const layout = layoutId
    ? getBoxLayoutById(layoutId) || getRecommendedBoxLayout(items.length)
    : getRecommendedBoxLayout(items.length);

  if (!layout || items.length === 0) return null;

  const gridStyles = getBoxLayoutGridTemplate(items.length, isNarrowSpace);
  const baseStyles = getBaseBoxStyles(theme);

  // Style-specific rendering
  const renderBox = (item: BoxContentItem, index: number) => {
    const commonClasses = "flex flex-col h-full w-full transition-all duration-200 hover:shadow-lg relative overflow-hidden";
    
    switch (layout.id) {
      case "box-style-1": // Side Accent
        return (
          <div
            key={index}
            className={commonClasses}
            style={{
              backgroundColor: baseStyles.bgColor,
              borderRadius: baseStyles.borderRadius,
              boxShadow: baseStyles.shadow,
              borderLeft: `6px solid ${baseStyles.accentColor}`,
              padding: compact ? "1.25rem" : "2rem",
            }}
          >
            {item.label && (
              <h3
                className="font-serif mb-3"
                style={{
                  color: baseStyles.titleColor,
                  fontSize: compact ? "1.1rem" : "1.25rem",
                  textAlign: "center",
                }}
              >
                {item.label}
              </h3>
            )}
            <p
              style={{
                color: baseStyles.bodyColor,
                fontSize: compact ? "0.8rem" : "0.9rem",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              {item.text}
            </p>
          </div>
        );

      case "box-style-2": // Minimal
        return (
          <div
            key={index}
            className={commonClasses}
            style={{
              backgroundColor: baseStyles.bgColor,
              borderRadius: baseStyles.borderRadius,
              boxShadow: baseStyles.shadow,
              border: `1px solid ${baseStyles.borderColor}`,
              padding: compact ? "1.25rem" : "2rem",
            }}
          >
            {item.label && (
              <h3
                className="font-serif mb-3"
                style={{
                  color: baseStyles.titleColor,
                  fontSize: compact ? "1.1rem" : "1.25rem",
                  textAlign: "center",
                }}
              >
                {item.label}
              </h3>
            )}
            <p
              style={{
                color: baseStyles.bodyColor,
                fontSize: compact ? "0.8rem" : "0.9rem",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              {item.text}
            </p>
          </div>
        );

      case "box-style-3": // Icon Focus - has room for icon
        return (
          <div
            key={index}
            className={commonClasses}
            style={{
              backgroundColor: baseStyles.bgColor,
              borderRadius: baseStyles.borderRadius,
              boxShadow: baseStyles.shadow,
              border: `1px solid ${baseStyles.borderColor}`,
              padding: compact ? "1.25rem" : "2rem",
            }}
          >
            {/* Icon placeholder area - only shows if icon exists */}
            {item.icon && (
              <div className="flex justify-center mb-4">
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: baseStyles.accentColor,
                    width: compact ? "36px" : "48px",
                    height: compact ? "36px" : "48px",
                    color: "white",
                    fontSize: compact ? "18px" : "24px",
                  }}
                >
                  {item.icon}
                </div>
              </div>
            )}
            {item.label && (
              <h3
                className="font-serif mb-3"
                style={{
                  color: baseStyles.titleColor,
                  fontSize: compact ? "1.1rem" : "1.25rem",
                  textAlign: "center",
                }}
              >
                {item.label}
              </h3>
            )}
            <p
              style={{
                color: baseStyles.bodyColor,
                fontSize: compact ? "0.8rem" : "0.9rem",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              {item.text}
            </p>
          </div>
        );

      case "box-style-4": // Header Accent - has room for icon
        return (
          <div
            key={index}
            className={commonClasses}
            style={{
              backgroundColor: baseStyles.bgColor,
              borderRadius: baseStyles.borderRadius,
              boxShadow: baseStyles.shadow,
              border: `1px solid ${baseStyles.borderColor}`,
              paddingTop: compact ? "2.5rem" : "3rem", // Space reserved for the top overlapping icon
            }}
          >
            {/* Top Accent Bar - always visible as part of design */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: "6px",
                backgroundColor: baseStyles.accentColor,
              }}
            />
            
            {/* Overlapping Icon placeholder - only shows if icon exists */}
            {item.icon && (
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[3px]"
                style={{
                  zIndex: 10
                }}
              >
                 <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: baseStyles.accentColor,
                    width: compact ? "36px" : "48px",
                    height: compact ? "36px" : "48px",
                    color: "white",
                    fontSize: compact ? "18px" : "24px",
                  }}
                >
                  {item.icon}
                </div>
              </div>
            )}

            <div style={{ padding: compact ? "0 1.25rem 1.25rem" : "0 2rem 2rem" }}>
              <h3
                className="font-serif mb-3 mt-4"
                style={{
                  color: baseStyles.titleColor,
                  fontSize: compact ? "1.1rem" : "1.25rem",
                  textAlign: "center",
                }}
              >
                {item.label}
              </h3>
              <p
                style={{
                  color: baseStyles.bodyColor,
                  fontSize: compact ? "0.8rem" : "0.9rem",
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                {item.text}
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Special handling for narrow-3 layout (2 on top, 1 full-width below)
  if (gridStyles.specialLayout === "narrow-3") {
    return (
      <div
        className={className}
        style={{
          display: "grid",
          gridTemplateColumns: gridStyles.gridTemplateColumns,
          gridTemplateRows: gridStyles.gridTemplateRows,
          gap: gridStyles.gap,
          width: "100%",
        }}
      >
        {/* First two items on top row */}
        {items.slice(0, 2).map((item, index) => renderBox(item, index))}
        {/* Third item spans full width on bottom row */}
        <div style={{ gridColumn: "1 / -1" }}>
          {renderBox(items[2]!, 2)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: gridStyles.gridTemplateColumns,
        gridTemplateRows: gridStyles.gridTemplateRows,
        gap: gridStyles.gap,
        width: "100%",
      }}
    >
      {items.map((item, index) => renderBox(item, index))}
    </div>
  );
}

// Preview components remain similar but simplified for the 4 styles
export function BoxLayoutPreview({
  layout,
  itemCount = 3,
  theme,
}: {
  layout: BoxLayout;
  itemCount?: number;
  theme?: Theme;
}) {
  const gridStyles = getBoxLayoutGridTemplate(itemCount);
  const items = Array.from({ length: itemCount }, (_, i) => i);
  const baseStyles = getBaseBoxStyles(theme || {} as Theme);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridStyles.gridTemplateColumns,
        gridTemplateRows: gridStyles.gridTemplateRows,
        gap: "4px",
        padding: "4px",
        width: "100%",
        height: "100%",
      }}
    >
      {items.map((_, i) => (
        <div 
          key={i} 
          className="rounded-sm relative overflow-hidden"
          style={{ 
            backgroundColor: baseStyles.bgColor,
            border: `1px solid ${baseStyles.borderColor}`,
          }} 
        >
          {layout.id === "box-style-1" && (
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: baseStyles.accentColor }} />
          )}
          {(layout.id === "box-style-3" || layout.id === "box-style-4") && (
            <div className="flex justify-center mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: baseStyles.accentColor }} />
            </div>
          )}
          {layout.id === "box-style-4" && (
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: baseStyles.accentColor }} />
          )}
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
}: {
  layout: BoxLayout;
  items: BoxContentItem[];
  theme: Theme;
}) {
  const displayItems = items.slice(0, layout.maxItems);
  const gridStyles = getBoxLayoutGridTemplate(displayItems.length);
  const baseStyles = getBaseBoxStyles(theme);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridStyles.gridTemplateColumns,
        gridTemplateRows: gridStyles.gridTemplateRows,
        gap: "4px",
        padding: "4px",
        width: "100%",
        height: "100%",
      }}
    >
      {displayItems.map((item, i) => (
        <div 
          key={i} 
          className="rounded-sm relative overflow-hidden flex flex-col items-center p-1"
          style={{ 
            backgroundColor: baseStyles.bgColor,
            border: `1px solid ${baseStyles.borderColor}`,
          }} 
        >
          {layout.id === "box-style-1" && (
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: baseStyles.accentColor }} />
          )}
          {layout.id === "box-style-4" && (
             <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: baseStyles.accentColor }} />
          )}
          
          {(layout.id === "box-style-3" || layout.id === "box-style-4") && item.icon && (
            <div 
              className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] text-white mb-0.5"
              style={{ backgroundColor: baseStyles.accentColor }}
            >
              {item.icon}
            </div>
          )}
          
          <div className="text-[5px] font-bold truncate w-full text-center" style={{ color: baseStyles.titleColor }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
