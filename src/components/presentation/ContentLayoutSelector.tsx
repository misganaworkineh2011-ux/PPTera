"use client";

import { X, CheckCircle2, LayoutGrid } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { BoxLayoutType, BoxContentItem } from "~/lib/layouts/content/boxes";
import { boxLayouts } from "~/lib/layouts/content/boxes";
import { BoxLayoutPreview, BoxLayoutPreviewWithContent } from "./BoxLayoutRenderer";

interface ContentLayoutSelectorProps {
  isOpen: boolean;
  currentLayout?: BoxLayoutType;
  contentItems: BoxContentItem[];
  theme: Theme;
  onSelect: (layoutId: BoxLayoutType) => void;
  onClose: () => void;
}

/**
 * Modal for selecting box content layouts
 * Shows preview of each layout with actual slide content
 */
export default function ContentLayoutSelector({
  isOpen,
  currentLayout,
  contentItems,
  theme,
  onSelect,
  onClose,
}: ContentLayoutSelectorProps) {
  if (!isOpen) return null;

  // Show with content preview if we have content items
  const hasContent = contentItems.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${theme.colors.accent}15` }}
            >
              <LayoutGrid size={20} style={{ color: theme.colors.accent }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Change Content Layout</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Choose how your {contentItems.length} content items are arranged
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category indicator */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 bg-slate-50">
          <div
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: theme.colors.accent,
              color: "white",
            }}
          >
            Box Layouts
          </div>
          <span className="text-sm text-slate-500">
            {boxLayouts.length} layouts available
          </span>
        </div>

        {/* Layout Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-4 gap-4">
            {boxLayouts.map((layout) => {
              const isSelected = currentLayout === layout.id;
              // Check if layout is suitable for current content count
              const isSuitable =
                contentItems.length >= layout.minItems &&
                contentItems.length <= layout.maxItems;

              return (
                <button
                  key={layout.id}
                  onClick={() => onSelect(layout.id)}
                  disabled={!isSuitable && contentItems.length > 0}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                    !isSuitable && contentItems.length > 0
                      ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                      : isSelected
                        ? "border-[#06b6d4] bg-[#06b6d4]/5 ring-2 ring-[#06b6d4]/20 shadow-md"
                        : "border-slate-200 hover:border-[#06b6d4]/50 hover:shadow-lg"
                  }`}
                >
                  {/* Layout Preview */}
                  <div
                    className="aspect-[4/3] rounded-lg mb-3 overflow-hidden"
                    style={{
                      backgroundColor: theme.colors.backgroundAlt || "#f8fafc",
                    }}
                  >
                    {hasContent ? (
                      <BoxLayoutPreviewWithContent
                        layout={layout}
                        items={contentItems}
                        theme={theme}
                      />
                    ) : (
                      <BoxLayoutPreview
                        layout={layout}
                        itemCount={layout.idealItems}
                        theme={theme}
                      />
                    )}
                  </div>

                  {/* Layout Info */}
                  <h3 className="font-semibold text-slate-900 text-sm">{layout.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {layout.description}
                  </p>

                  {/* Item count badge */}
                  <div className="mt-2 flex items-center gap-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${theme.colors.accent}15`,
                        color: theme.colors.accent,
                      }}
                    >
                      {layout.minItems === layout.maxItems
                        ? `${layout.idealItems} items`
                        : `${layout.minItems}-${layout.maxItems} items`}
                    </span>
                    {layout.adaptive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        Adaptive
                      </span>
                    )}
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.accent }}
                    >
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  )}

                  {/* Not suitable indicator */}
                  {!isSuitable && contentItems.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded shadow-sm">
                        {contentItems.length < layout.minItems
                          ? `Needs ${layout.minItems}+ items`
                          : `Max ${layout.maxItems} items`}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer with content summary */}
        {hasContent && (
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                <span className="font-medium">Current content:</span>{" "}
                {contentItems.slice(0, 3).map((item, i) => (
                  <span key={i}>
                    {i > 0 && ", "}
                    <span className="text-slate-900">{item.label || `Item ${i + 1}`}</span>
                  </span>
                ))}
                {contentItems.length > 3 && (
                  <span className="text-slate-500">
                    {" "}
                    +{contentItems.length - 3} more
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

