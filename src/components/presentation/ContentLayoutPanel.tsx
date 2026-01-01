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
import { sequenceLayouts } from "~/lib/layouts/content/sequence";
import type { ContentLayoutType } from "./types";

// Import actual layout renderers
import BoxLayoutRenderer from "./BoxLayoutRenderer";
import { BulletLayoutRenderer } from "~/components/layouts/BulletLayoutRenderer";
import { StepsLayoutRenderer } from "~/components/layouts/StepsLayoutRenderer";
import { QuotesLayoutRenderer } from "~/components/layouts/QuotesLayoutRenderer";
import { CircleLayoutRenderer } from "~/components/layouts/CircleLayoutRenderer";
import SequenceLayoutRenderer from "./SequenceLayoutRenderer";

import type { BoxLayoutType, BoxContentItem } from "~/lib/layouts/content/boxes";
import type { BulletLayoutType, BulletContentItem } from "~/lib/layouts/content/bullets";
import type { StepsLayoutType, StepContentItem } from "~/lib/layouts/content/steps";
import type { QuotesLayoutType, QuoteContentItem } from "~/lib/layouts/content/quotes";
import type { CircleLayoutType, CircleContentItem } from "~/lib/layouts/content/circles";
import type { SequenceLayoutType, SequenceContentItem } from "~/lib/layouts/content/sequence";

// Panel width constant - used for both panel and main content offset
export const CONTENT_LAYOUT_PANEL_WIDTH = 420;
// Header height - panel starts below the header
const HEADER_HEIGHT = 53;

// Re-export the type for convenience
export type ContentLayoutId = ContentLayoutType;

// Layout category definition
type LayoutCategory = "boxes" | "steps" | "bullets" | "quotes" | "images" | "circles" | "sequence";

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
  if (layoutId.startsWith("sequence-")) return "sequence";
  return "boxes";
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
  {
    id: "sequence",
    name: "Sequence & Timeline",
    description: "Sequential process and timeline flows",
    layouts: sequenceLayouts.map(l => ({ ...l, id: l.id, supportsIcons: true })),
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

// Scaled preview component that renders actual layouts
function ScaledLayoutPreview({
  category,
  layoutId,
  contentItems,
  theme,
}: {
  category: LayoutCategory;
  layoutId: string;
  contentItems: Array<{ label?: string; text: string }>;
  theme: Theme;
}) {
  const accentColor = theme.colors.accent || "#06b6d4";
  
  // Use actual content or fallback to sample content
  const items = contentItems.length > 0 
    ? contentItems 
    : [
        { label: "First Point", text: "Description of the first key point" },
        { label: "Second Point", text: "Description of the second key point" },
        { label: "Third Point", text: "Description of the third key point" },
      ];

  // Scale factor for the preview (renders at full size then scales down)
  // Card width is roughly 180px, so scale = 180/800 ≈ 0.225
  const scale = 0.22;
  const previewWidth = 800; // Virtual width for rendering
  const previewHeight = 450; // Virtual height for rendering

  const renderLayout = () => {
    switch (category) {
      case "boxes":
        return (
          <BoxLayoutRenderer
            layoutId={layoutId as BoxLayoutType}
            items={items as BoxContentItem[]}
            theme={theme}
            compact={false}
          />
        );
      
      case "bullets":
        return (
          <BulletLayoutRenderer
            layoutId={layoutId as BulletLayoutType}
            items={items as BulletContentItem[]}
            accentColor={accentColor}
          />
        );
      
      case "steps":
        return (
          <StepsLayoutRenderer
            layoutId={layoutId as StepsLayoutType}
            items={items as StepContentItem[]}
            accentColor={accentColor}
          />
        );
      
      case "quotes":
        return (
          <QuotesLayoutRenderer
            layoutId={layoutId as QuotesLayoutType}
            items={items as QuoteContentItem[]}
            accentColor={accentColor}
          />
        );
      
      case "circles":
        return (
          <CircleLayoutRenderer
            layoutId={layoutId as CircleLayoutType}
            items={items as CircleContentItem[]}
            accentColor={accentColor}
          />
        );
      
      case "sequence":
        return (
          <SequenceLayoutRenderer
            layoutId={layoutId as SequenceLayoutType}
            items={items as SequenceContentItem[]}
            theme={theme}
          />
        );
      
      case "images":
        // Images layout - show placeholder since we don't have actual images
        return (
          <div className="flex gap-4 p-4">
            {items.slice(0, 3).map((item, i) => (
              <div key={i} className="flex-1 flex flex-col">
                <div 
                  className="aspect-video rounded-lg mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <svg className="w-12 h-12 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                {item.label && (
                  <h3 className="text-base font-semibold text-slate-800 mb-1">{item.label}</h3>
                )}
                <p className="text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <LayoutGrid size={32} className="text-slate-300" />
          </div>
        );
    }
  };

  // Calculate the scaled dimensions to center properly
  const scaledWidth = previewWidth * scale;
  const scaledHeight = previewHeight * scale;

  return (
    <div 
      className="w-full h-full overflow-hidden rounded flex items-center justify-center"
      style={{ 
        backgroundColor: theme.colors.backgroundAlt || "#f8fafc",
      }}
    >
      <div
        className="pointer-events-none"
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            padding: "16px",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <div className="[&_*]:!transition-none [&_*]:hover:!transform-none [&_*]:hover:!shadow-none">
            {renderLayout()}
          </div>
        </div>
      </div>
    </div>
  );
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
              <p className="text-xs text-slate-500 mb-1">
                Choose a layout style. Changes apply instantly.
              </p>
              {contentItems.length > 0 && (
                <p className="text-[10px] text-slate-400">
                  Previews show your actual content ({contentItems.length} item{contentItems.length !== 1 ? "s" : ""})
                </p>
              )}
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
                          className={`relative p-1.5 rounded-lg border-2 transition-all ${
                            !isSuitable && contentItems.length > 0
                              ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                              : isSelected
                                ? "border-[#06b6d4] bg-[#06b6d4]/5 ring-2 ring-[#06b6d4]/20 shadow-md"
                                : "border-slate-200 hover:border-[#06b6d4]/50 hover:shadow-md"
                          }`}
                        >
                          {/* Layout Preview with actual content */}
                          <div
                            className="aspect-[4/3] rounded overflow-hidden flex items-center justify-center"
                            style={{ backgroundColor: theme.colors.backgroundAlt || "#f8fafc" }}
                          >
                            <ScaledLayoutPreview
                              category={category.id}
                              layoutId={layout.id}
                              contentItems={contentItems}
                              theme={theme}
                            />
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
