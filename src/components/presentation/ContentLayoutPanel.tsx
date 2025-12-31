"use client";

import { useEffect, useRef, useMemo } from "react";
import { X, LayoutGrid, CheckCircle2 } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { boxLayouts } from "~/lib/layouts/content/boxes";
import { stepsLayouts } from "~/lib/layouts/content/steps";
import { bulletLayouts } from "~/lib/layouts/content/bullets";
import { quotesLayouts } from "~/lib/layouts/content/quotes";
import { imageLayouts } from "~/lib/layouts/content/images";
import { circleLayouts } from "~/lib/layouts/content/circles";
import { BoxLayoutPreview } from "./BoxLayoutRenderer";
import type { ContentLayoutType } from "./types";

// Panel width constant - used for both panel and main content offset
export const CONTENT_LAYOUT_PANEL_WIDTH = 380;
// Header height - panel starts below the header
const HEADER_HEIGHT = 53;

// Re-export the type for convenience
export type ContentLayoutId = ContentLayoutType;

// Layout category definition
type LayoutCategory = "boxes" | "steps" | "bullets" | "quotes" | "images" | "circles";

interface LayoutCategoryConfig {
  id: LayoutCategory;
  name: string;
  description: string;
  layouts: Array<{
    id: string;
    name: string;
    description: string;
    minItems: number;
    maxItems: number;
    idealItems: number;
    supportsIcons?: boolean;
  }>;
}

// Get category from layout ID
function getCategoryFromLayoutId(layoutId: string): LayoutCategory {
  if (layoutId.startsWith("box-")) return "boxes";
  if (layoutId.startsWith("steps-")) return "steps";
  if (layoutId.startsWith("bullet-")) return "bullets";
  if (layoutId.startsWith("quote-")) return "quotes";
  if (layoutId.startsWith("image-")) return "images";
  if (layoutId.startsWith("circle-")) return "circles";
  return "boxes"; // default
}

// All layout categories with their layouts
const allCategories: LayoutCategoryConfig[] = [
  {
    id: "boxes",
    name: "Box Cards",
    description: "Content in styled card boxes",
    layouts: boxLayouts.map(l => ({ ...l, id: l.id })),
  },
  {
    id: "steps",
    name: "Steps & Process",
    description: "Step-by-step process flows",
    layouts: stepsLayouts.map(l => ({ ...l, id: l.id })),
  },
  {
    id: "bullets",
    name: "Bullet Points",
    description: "Traditional bullet lists",
    layouts: bulletLayouts.map(l => ({ ...l, id: l.id })),
  },
  {
    id: "quotes",
    name: "Quotes & Testimonials",
    description: "Quote and testimonial styles",
    layouts: quotesLayouts.map(l => ({ ...l, id: l.id })),
  },
  {
    id: "images",
    name: "Image Gallery",
    description: "Image-focused layouts",
    layouts: imageLayouts.map(l => ({ ...l, id: l.id })),
  },
  {
    id: "circles",
    name: "Circular Layouts",
    description: "Circular and arc arrangements",
    layouts: circleLayouts.map(l => ({ ...l, id: l.id, supportsIcons: true })),
  },
];

interface ContentLayoutPanelProps {
  isOpen: boolean;
  currentContentLayout: ContentLayoutId;
  contentItems: Array<{ label?: string; text: string }>;
  theme: Theme;
  onSelectContentLayout: (layoutId: ContentLayoutId) => void;
  onClose: () => void;
}

export default function ContentLayoutPanel({
  isOpen,
  currentContentLayout,
  contentItems,
  theme,
  onSelectContentLayout,
  onClose,
}: ContentLayoutPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const currentCategory = getCategoryFromLayoutId(currentContentLayout);

  // Sort categories to put current category first
  const sortedCategories = useMemo(() => {
    return [...allCategories].sort((a, b) => {
      if (a.id === currentCategory) return -1;
      if (b.id === currentCategory) return 1;
      return 0;
    });
  }, [currentCategory]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Find current layout name
  const currentLayoutName = useMemo(() => {
    for (const category of allCategories) {
      const layout = category.layouts.find(l => l.id === currentContentLayout);
      if (layout) return layout.name;
    }
    return "Unknown";
  }, [currentContentLayout]);

  if (!isOpen) return null;

  return (
    <>
      {/* Panel - fixed at right edge */}
      <div
        ref={panelRef}
        className="fixed right-0 z-40 bg-white shadow-2xl border-l border-slate-200 animate-slide-in-right"
        style={{ 
          width: `${CONTENT_LAYOUT_PANEL_WIDTH}px`,
          top: `${HEADER_HEIGHT}px`,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-[#06b6d4]" />
            <h3 className="font-semibold text-slate-900">Content Layout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content - visible scrollbar on right edge */}
        <div 
          className="overflow-y-auto scrollbar-thin" 
          style={{ height: "calc(100% - 57px)" }}
        >
          <div>
            <div className="p-3">
              <p className="text-xs text-slate-500 mb-3">
                Choose a layout style. Changes apply instantly.
              </p>
            </div>

          {/* Categories - All expanded by default */}
          {sortedCategories.map((category) => {
            const isCurrentCategory = category.id === currentCategory;
            
            return (
              <div key={category.id} className="border-b border-slate-100 last:border-b-0">
                {/* Category Header */}
                <div
                  className={`px-4 py-2 ${
                    isCurrentCategory 
                      ? "bg-[#06b6d4]/5" 
                      : "bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-medium ${isCurrentCategory ? "text-[#06b6d4]" : "text-slate-700"}`}>
                      {category.name}
                    </h4>
                    {isCurrentCategory && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#06b6d4] text-white">
                        Current
                      </span>
                    )}
                  </div>
                </div>

                {/* Category Layouts - Always visible */}
                <div className="px-3 pb-3 pt-2 grid grid-cols-2 gap-2">
                  {category.layouts.map((layout) => {
                    const isSelected = currentContentLayout === layout.id;
                    const isSuitable =
                      contentItems.length === 0 ||
                      (contentItems.length >= layout.minItems && contentItems.length <= layout.maxItems);

                    return (
                      <button
                        key={layout.id}
                        onClick={() => onSelectContentLayout(layout.id as ContentLayoutId)}
                        disabled={!isSuitable && contentItems.length > 0}
                        className={`relative p-2 rounded-lg border-2 text-left transition-all ${
                          !isSuitable && contentItems.length > 0
                            ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                            : isSelected
                              ? "border-[#06b6d4] bg-[#06b6d4]/5 ring-2 ring-[#06b6d4]/20 shadow-md"
                              : "border-slate-200 hover:border-[#06b6d4]/50 hover:shadow-md"
                        }`}
                      >
                        {/* Layout Preview */}
                        <div
                          className="aspect-[4/3] rounded mb-1.5 overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: theme.colors.backgroundAlt || "#f8fafc" }}
                        >
                          {category.id === "boxes" ? (
                            <BoxLayoutPreview
                              layout={boxLayouts.find(l => l.id === layout.id)!}
                              itemCount={layout.idealItems}
                              theme={theme}
                            />
                          ) : (
                            <LayoutPreviewPlaceholder 
                              category={category.id} 
                              layoutId={layout.id}
                              theme={theme}
                            />
                          )}
                        </div>

                        <h4 className="font-medium text-slate-900 text-[11px] leading-tight">{layout.name}</h4>
                        
                        {/* Item count badge */}
                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className="text-[8px] px-1 py-0.5 rounded"
                            style={{
                              backgroundColor: `${theme.colors.accent}15`,
                              color: theme.colors.accent,
                            }}
                          >
                            {layout.minItems}-{layout.maxItems}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#06b6d4] flex items-center justify-center">
                            <CheckCircle2 size={8} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Current selection info */}
          <div className="p-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600">
                <span className="font-medium">Current:</span>{" "}
                <span className="text-slate-900">{currentLayoutName}</span>
              </div>
              {contentItems.length > 0 && (
                <div className="text-[10px] text-slate-400 mt-1">
                  {contentItems.length} content item{contentItems.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Simple preview placeholder for non-box layouts
function LayoutPreviewPlaceholder({ 
  category, 
  layoutId,
  theme 
}: { 
  category: LayoutCategory; 
  layoutId: string;
  theme: Theme;
}) {
  const accentColor = theme.colors.accent || "#06b6d4";
  const bgColor = theme.colors.surface || "#f8fafc";
  
  switch (category) {
    case "steps":
      if (layoutId === "steps-pyramid") {
        return (
          <div className="w-full h-full p-2 flex flex-col justify-center gap-1">
            <div className="h-2 w-1/3 mx-auto rounded" style={{ backgroundColor: accentColor }} />
            <div className="h-2 w-1/2 mx-auto rounded" style={{ backgroundColor: accentColor, opacity: 0.7 }} />
            <div className="h-2 w-2/3 mx-auto rounded" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
          </div>
        );
      }
      if (layoutId === "steps-arrows") {
        return (
          <div className="w-full h-full p-2 flex flex-col justify-center items-center gap-0.5">
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: bgColor, border: `1px solid ${accentColor}` }} />
            <div className="text-[8px]" style={{ color: accentColor }}>↓</div>
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: bgColor, border: `1px solid ${accentColor}` }} />
            <div className="text-[8px]" style={{ color: accentColor }}>↓</div>
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: bgColor, border: `1px solid ${accentColor}` }} />
          </div>
        );
      }
      return (
        <div className="w-full h-full p-2 flex gap-1 items-center justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-3/4 rounded" style={{ backgroundColor: bgColor, borderLeft: `2px solid ${accentColor}` }} />
          ))}
        </div>
      );

    case "bullets":
      return (
        <div className="w-full h-full p-2 flex flex-col justify-center gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <div className="h-1.5 flex-1 rounded bg-slate-300" />
            </div>
          ))}
        </div>
      );

    case "quotes":
      return (
        <div className="w-full h-full p-2 flex items-center justify-center">
          <div className="w-3/4 h-3/4 rounded p-1 relative" style={{ backgroundColor: bgColor, border: `1px solid ${accentColor}20` }}>
            <span className="absolute top-0 left-1 text-lg leading-none" style={{ color: accentColor }}>"</span>
            <div className="mt-2 space-y-0.5">
              <div className="h-1 w-full bg-slate-300 rounded" />
              <div className="h-1 w-2/3 bg-slate-300 rounded" />
            </div>
          </div>
        </div>
      );

    case "images":
      return (
        <div className="w-full h-full p-2 flex gap-1 items-center justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-3/4 rounded bg-slate-300 flex items-center justify-center">
              <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          ))}
        </div>
      );

    case "circles":
      if (layoutId === "circle-arc") {
        return (
          <div className="w-full h-full flex items-end justify-center pb-1">
            <svg viewBox="0 0 60 30" className="w-4/5 h-auto">
              <path d="M5,30 A25,25 0 0,1 55,30" fill="none" stroke={accentColor} strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
        );
      }
      return (
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-3/5 h-auto">
            <circle cx="20" cy="20" r="15" fill="none" stroke={accentColor} strokeWidth="6" strokeDasharray="20 8" />
          </svg>
        </div>
      );

    default:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <LayoutGrid size={16} className="text-slate-300" />
        </div>
      );
  }
}
