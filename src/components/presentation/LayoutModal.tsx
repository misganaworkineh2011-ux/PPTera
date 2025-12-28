"use client";

import { useState } from "react";
import { X, ImageIcon, LayoutGrid, CheckCircle2 } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { slideLayouts, type SlideLayoutType, type ImageSize } from "~/lib/layouts/slide";
import { boxLayouts, type BoxLayoutType, type BoxContentItem } from "~/lib/layouts/content/boxes";
import { BoxLayoutPreview } from "./BoxLayoutRenderer";

interface LayoutModalProps {
  slideType?: "title" | "content";
  currentSlideLayout?: SlideLayoutType;
  currentContentLayout?: BoxLayoutType;
  currentImageSize?: ImageSize;
  contentItems?: BoxContentItem[];
  theme: Theme;
  onSelectSlideLayout: (layoutId: SlideLayoutType, imageSize: ImageSize) => void;
  onSelectContentLayout: (layoutId: BoxLayoutType) => void;
  onClose: () => void;
}

// Visual preview for slide layouts
function SlideLayoutPreview({ layoutId, imageSize = "medium" }: { layoutId: SlideLayoutType; imageSize?: ImageSize }) {
  const layout = slideLayouts.find((l) => l.id === layoutId);
  if (!layout) return null;

  const sizeValue = layout.sizes[imageSize];
  const accentColor = "#06b6d4";
  const bgColor = "#e2e8f0";

  // Render different previews based on layout type
  switch (layoutId) {
    case "image-left":
      return (
        <div className="w-full h-full flex">
          <div
            className="bg-slate-400 flex-shrink-0"
            style={{
              width: `${sizeValue}%`,
              clipPath: "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)",
            }}
          />
          <div className="flex-1 p-2 flex flex-col justify-center gap-1" style={{ backgroundColor: bgColor }}>
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: accentColor }} />
            <div className="h-1.5 w-full bg-slate-300 rounded" />
            <div className="h-1.5 w-2/3 bg-slate-300 rounded" />
          </div>
        </div>
      );

    case "image-right":
      return (
        <div className="w-full h-full flex">
          <div className="flex-1 p-2 flex flex-col justify-center gap-1" style={{ backgroundColor: bgColor }}>
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: accentColor }} />
            <div className="h-1.5 w-full bg-slate-300 rounded" />
            <div className="h-1.5 w-2/3 bg-slate-300 rounded" />
          </div>
          <div
            className="bg-slate-400 flex-shrink-0"
            style={{
              width: `${sizeValue}%`,
              clipPath: "polygon(15px 0, 100% 0, 100% 100%, 15px 100%, 0 50%)",
            }}
          />
        </div>
      );

    case "image-top":
      return (
        <div className="w-full h-full flex flex-col">
          <div
            className="bg-slate-400 flex-shrink-0"
            style={{
              height: `${sizeValue}%`,
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), 50% 100%, 0 calc(100% - 10px))",
            }}
          />
          <div className="flex-1 p-2 flex flex-col justify-center items-center gap-1" style={{ backgroundColor: bgColor }}>
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: accentColor }} />
            <div className="h-1.5 w-full bg-slate-300 rounded" />
          </div>
        </div>
      );

    case "image-bottom":
      return (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 p-2 flex flex-col justify-center items-center gap-1" style={{ backgroundColor: bgColor }}>
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: accentColor }} />
            <div className="h-1.5 w-full bg-slate-300 rounded" />
          </div>
          <div
            className="bg-slate-400 flex-shrink-0"
            style={{
              height: `${sizeValue}%`,
              clipPath: "polygon(0 10px, 50% 0, 100% 10px, 100% 100%, 0 100%)",
            }}
          />
        </div>
      );

    case "image-background":
      return (
        <div className="w-full h-full relative bg-slate-400">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
            <div className="h-3 w-4/5 rounded bg-white/90" />
            <div className="h-2 w-full bg-white/70 rounded" />
            <div className="h-2 w-3/4 bg-white/70 rounded" />
            <div className="h-2 w-5/6 bg-white/70 rounded" />
          </div>
        </div>
      );

    case "image-full":
      return (
        <div className="w-full h-full bg-slate-400 flex items-center justify-center">
          <ImageIcon size={24} className="text-slate-600" />
        </div>
      );

    case "no-image":
      return (
        <div className="w-full h-full p-2 flex flex-col justify-center gap-1" style={{ backgroundColor: bgColor }}>
          <div className="h-2 w-3/4 rounded" style={{ backgroundColor: accentColor }} />
          <div className="h-1.5 w-full bg-slate-300 rounded" />
          <div className="h-1.5 w-2/3 bg-slate-300 rounded" />
          <div className="h-1.5 w-4/5 bg-slate-300 rounded" />
        </div>
      );

    default:
      return null;
  }
}

export default function LayoutModal({
  slideType = "content",
  currentSlideLayout = "image-right",
  currentContentLayout = "box-style-1",
  currentImageSize = "medium",
  contentItems = [],
  theme,
  onSelectSlideLayout,
  onSelectContentLayout,
  onClose,
}: LayoutModalProps) {
  const isTitleSlide = slideType === "title";
  const [activeTab, setActiveTab] = useState<"slide" | "content">("slide");
  const [selectedSlideLayout, setSelectedSlideLayout] = useState<SlideLayoutType>(currentSlideLayout);
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize>(currentImageSize);

  const tabs = [
    { id: "slide" as const, label: "Slide Layout", icon: ImageIcon, description: "Image position" },
    { id: "content" as const, label: "Content Layout", icon: LayoutGrid, description: "Box style" },
  ];

  const imageSizes: { id: ImageSize; label: string }[] = [
    { id: "small", label: "S" },
    { id: "medium", label: "M" },
    { id: "large", label: "L" },
    { id: "full", label: "XL" },
  ];

  // Filter out "no-image" for layouts that have images
  const slideLayoutsWithImage = slideLayouts.filter((l) => l.imagePosition !== "none" && l.imagePosition !== "full");
  const otherSlideLayouts = slideLayouts.filter((l) => l.imagePosition === "none" || l.imagePosition === "full");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Change Layout</h2>
            <p className="text-sm text-slate-500 mt-1">
              {isTitleSlide 
                ? "Choose how your title slide image is positioned" 
                : "Choose how your content is arranged"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs - Hide content layout tab for title slides */}
        {!isTitleSlide && (
          <div className="flex gap-2 p-4 border-b border-slate-200 bg-slate-50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#06b6d4] text-white shadow-md"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                  <span className={`text-xs ${activeTab === tab.id ? "text-white/70" : "text-slate-400"}`}>
                    ({tab.description})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          {(activeTab === "slide" || isTitleSlide) && (
            <div className="space-y-6">
              {/* Image Position Layouts */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <ImageIcon size={16} />
                  Image Position
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {slideLayoutsWithImage.map((layout) => {
                    const isSelected = selectedSlideLayout === layout.id;
                    return (
                      <button
                        key={layout.id}
                        onClick={() => {
                          setSelectedSlideLayout(layout.id);
                          onSelectSlideLayout(layout.id, selectedImageSize);
                        }}
                        className={`relative p-3 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                          isSelected
                            ? "border-[#06b6d4] bg-[#06b6d4]/5 ring-2 ring-[#06b6d4]/20"
                            : "border-slate-200 hover:border-[#06b6d4]/50"
                        }`}
                      >
                        <div className="aspect-video bg-slate-100 rounded-lg mb-2 overflow-hidden">
                          <SlideLayoutPreview layoutId={layout.id} imageSize={selectedImageSize} />
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">{layout.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{layout.description}</p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#06b6d4] flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Size Selector */}
              {selectedSlideLayout !== "no-image" && selectedSlideLayout !== "image-full" && selectedSlideLayout !== "image-background" && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Image Size</h3>
                  <div className="flex gap-2">
                    {imageSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => {
                          setSelectedImageSize(size.id);
                          onSelectSlideLayout(selectedSlideLayout, size.id);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedImageSize === size.id
                            ? "bg-[#06b6d4] text-white shadow-md"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {selectedImageSize === "small" && "30% of slide"}
                    {selectedImageSize === "medium" && "40% of slide"}
                    {selectedImageSize === "large" && "50% of slide"}
                    {selectedImageSize === "full" && "60% of slide"}
                  </p>
                </div>
              )}

              {/* Other Layouts (No Image, Full Image) */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Other Options</h3>
                <div className="grid grid-cols-4 gap-4">
                  {otherSlideLayouts.map((layout) => {
                    const isSelected = selectedSlideLayout === layout.id;
                    return (
                      <button
                        key={layout.id}
                        onClick={() => {
                          setSelectedSlideLayout(layout.id);
                          onSelectSlideLayout(layout.id, selectedImageSize);
                        }}
                        className={`relative p-3 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                          isSelected
                            ? "border-[#06b6d4] bg-[#06b6d4]/5 ring-2 ring-[#06b6d4]/20"
                            : "border-slate-200 hover:border-[#06b6d4]/50"
                        }`}
                      >
                        <div className="aspect-video bg-slate-100 rounded-lg mb-2 overflow-hidden">
                          <SlideLayoutPreview layoutId={layout.id} imageSize={selectedImageSize} />
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">{layout.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{layout.description}</p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#06b6d4] flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <LayoutGrid size={16} />
                Box Styles
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {boxLayouts.map((layout) => {
                  const isSelected = currentContentLayout === layout.id;
                  const isSuitable =
                    contentItems.length === 0 ||
                    (contentItems.length >= layout.minItems && contentItems.length <= layout.maxItems);

                  return (
                    <button
                      key={layout.id}
                      onClick={() => onSelectContentLayout(layout.id)}
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
                        className="aspect-[4/3] rounded-lg mb-2 overflow-hidden"
                        style={{ backgroundColor: theme.colors.backgroundAlt || "#f8fafc" }}
                      >
                        <BoxLayoutPreview
                          layout={layout}
                          itemCount={layout.idealItems}
                          theme={theme}
                        />
                      </div>

                      <h4 className="font-semibold text-slate-900 text-sm">{layout.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{layout.description}</p>

                      {/* Item count badge */}
                      <div className="mt-2 flex items-center gap-1">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${theme.colors.accent}15`,
                            color: theme.colors.accent,
                          }}
                        >
                          {layout.minItems}-{layout.maxItems} items
                        </span>
                        {layout.supportsIcons && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            Icons
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#06b6d4] flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                      )}

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
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <span className="font-medium">Current:</span>{" "}
            <span className="text-slate-900">
              {slideLayouts.find((l) => l.id === selectedSlideLayout)?.name || "Unknown"}
            </span>
            {selectedSlideLayout !== "no-image" && selectedSlideLayout !== "image-full" && selectedSlideLayout !== "image-background" && (
              <span className="text-slate-500"> ({selectedImageSize})</span>
            )}
            {!isTitleSlide && (
              <>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-900">
                  {boxLayouts.find((l) => l.id === currentContentLayout)?.name || "Side Accent"}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#06b6d4] text-white hover:bg-[#0891b2] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
