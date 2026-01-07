"use client";

import { useState } from "react";
import { X, ImageIcon, LayoutGrid, CheckCircle2 } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { slideLayouts, type SlideLayoutType, type ImageSize, type ImageShape } from "~/lib/layouts/slide";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import type { ContentLayoutType } from "./types";

interface LayoutModalProps {
  slideType?: "title" | "content";
  currentSlideLayout?: SlideLayoutType;
  currentContentLayout?: ContentLayoutType;
  currentImageSize?: ImageSize;
  currentImageShape?: ImageShape;
  contentItems?: BoxContentItem[];
  theme: Theme;
  onSelectSlideLayout: (layoutId: SlideLayoutType, imageSize: ImageSize, imageShape: ImageShape) => void;
  onOpenContentLayoutPanel: () => void;
  onClose: () => void;
}

// Helper to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

type ThemeType = "dark" | "light" | "corporate";

function getThemeType(theme: Theme): ThemeType {
  if (theme.id === "arctic-frost") return "light";
  if (theme.id === "corporate-clean") return "corporate";
  if (theme.id.startsWith("custom-")) {
    return isColorDark(theme.colors.background) ? "dark" : "light";
  }
  return "dark";
}

// Visual preview for slide layouts - shows position only, no shape (shape is separate option)
function SlideLayoutPreview({ layoutId, imageSize = "medium" }: { layoutId: SlideLayoutType; imageSize?: ImageSize }) {
  const layout = slideLayouts.find((l) => l.id === layoutId);
  if (!layout) return null;

  const sizeValue = layout.sizes[imageSize];
  const accentColor = "#06b6d4";
  const bgColor = "#e2e8f0";

  // Render different previews based on layout type - NO clip-path shapes, just position
  switch (layoutId) {
    case "image-left":
      // Image on LEFT, content on right
      return (
        <div className="w-full h-full flex">
          <div className="flex-1 p-2 flex flex-col justify-center gap-1" style={{ backgroundColor: bgColor }}>
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: accentColor }} />
            <div className="h-1.5 w-full bg-slate-300 rounded" />
            <div className="h-1.5 w-2/3 bg-slate-300 rounded" />
          </div>
          <div
            className="bg-slate-400 flex-shrink-0"
            style={{ width: `${sizeValue}%` }}
          />
        </div>
      );

    case "image-right":
      // Image on RIGHT, content on left
      return (
        <div className="w-full h-full flex">
          <div
            className="bg-slate-400 flex-shrink-0"
            style={{ width: `${sizeValue}%` }}
          />
          <div className="flex-1 p-2 flex flex-col justify-center gap-1" style={{ backgroundColor: bgColor }}>
            <div className="h-2 w-3/4 rounded" style={{ backgroundColor: accentColor }} />
            <div className="h-1.5 w-full bg-slate-300 rounded" />
            <div className="h-1.5 w-2/3 bg-slate-300 rounded" />
          </div>
        </div>
      );

    case "image-top":
      return (
        <div className="w-full h-full flex flex-col">
          <div
            className="bg-slate-400 flex-shrink-0"
            style={{ height: `${sizeValue}%` }}
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
            style={{ height: `${sizeValue}%` }}
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
  currentContentLayout: _currentContentLayout = "box-style-1",
  currentImageSize = "medium",
  currentImageShape = "arc",
  contentItems: _contentItems = [],
  theme,
  onSelectSlideLayout,
  onOpenContentLayoutPanel,
  onClose,
}: LayoutModalProps) {
  const isTitleSlide = slideType === "title";
  const [selectedSlideLayout, setSelectedSlideLayout] = useState<SlideLayoutType>(currentSlideLayout);
  const [selectedImageSize, setSelectedImageSize] = useState<ImageSize>(currentImageSize);
  const [selectedImageShape, setSelectedImageShape] = useState<ImageShape>(currentImageShape);

  // Theme-aware colors
  const themeType = getThemeType(theme);
  const isLight = themeType === "light" || themeType === "corporate";
  const accentColor = theme.colors.primary;
  
  // Use theme's pageBackground for dark themes
  const panelBg = theme.pageBackground || (isLight ? "#ffffff" : theme.colors.background);
  const headerBg = isLight ? "#f8fafc" : theme.colors.surface;

  const colors = isLight ? {
    bg: "bg-white",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    border: "border-slate-200",
    headerBg: "bg-slate-50",
    cardBg: "bg-slate-50",
    cardBorder: "border-slate-200",
    cardHover: "hover:border-slate-300",
    closeHover: "hover:bg-slate-100 text-slate-400 hover:text-slate-600",
  } : {
    bg: "",
    text: "",
    textMuted: "",
    border: "",
    headerBg: "",
    cardBg: "",
    cardBorder: "",
    cardHover: "",
    closeHover: "",
  };
  
  // Theme-aware inline styles for dark themes
  const themeStyles = !isLight ? {
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    border: theme.colors.border,
    surface: theme.colors.surface,
    surfaceHover: theme.colors.surfaceHover,
  } : null;

  const imageSizes: { id: ImageSize; label: string }[] = [
    { id: "small", label: "S" },
    { id: "medium", label: "M" },
    { id: "large", label: "L" },
    { id: "full", label: "XL" },
  ];

  const imageShapes: { id: ImageShape; label: string; icon: React.ReactNode }[] = [
    { id: "rectangle", label: "Straight", icon: <div className="w-6 h-4 bg-current" /> },
    { id: "arc", label: "Arc", icon: <div className="w-6 h-4 bg-current" style={{ clipPath: "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)" }} /> },
    { id: "rounded", label: "Rounded", icon: <div className="w-6 h-4 bg-current" style={{ clipPath: "polygon(0 0, 85% 0, 90% 15%, 100% 35%, 100% 65%, 90% 85%, 85% 100%, 0 100%)" }} /> },
    { id: "wave", label: "Wave", icon: <div className="w-6 h-4 bg-current" style={{ clipPath: "polygon(0 0, 80% 0, 100% 25%, 80% 50%, 100% 75%, 80% 100%, 0 100%)" }} /> },
  ];

  // Filter out "no-image" for layouts that have images
  const slideLayoutsWithImage = slideLayouts.filter((l) => l.imagePosition !== "none" && l.imagePosition !== "full");
  const otherSlideLayouts = slideLayouts.filter((l) => l.imagePosition === "none" || l.imagePosition === "full");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div 
        className={`relative w-full max-w-[95vw] sm:max-w-4xl rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden ${isLight ? colors.bg : ""}`}
        style={themeStyles ? { background: panelBg } : {}}
      >
        {/* Header */}
        <div 
          className={`flex items-center justify-between p-4 sm:p-6 border-b ${isLight ? colors.border : ""}`}
          style={themeStyles ? { borderColor: themeStyles.border } : {}}
        >
          <div className="flex-1 min-w-0">
            <h2 
              className={`text-lg sm:text-xl font-bold ${isLight ? colors.text : ""}`}
              style={themeStyles ? { color: themeStyles.text } : {}}
            >
              Change Layout
            </h2>
            <p 
              className={`text-xs sm:text-sm mt-1 hidden sm:block ${isLight ? colors.textMuted : ""}`}
              style={themeStyles ? { color: themeStyles.textMuted } : {}}
            >
              {isTitleSlide 
                ? "Choose how your title slide image is positioned" 
                : "Choose how your content is arranged"}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isLight ? colors.closeHover : ""}`}
            style={themeStyles ? { color: themeStyles.textMuted } : {}}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs - Hide content layout tab for title slides */}
        {!isTitleSlide && (
          <div 
            className={`flex gap-2 p-3 sm:p-4 border-b overflow-x-auto ${isLight ? `${colors.border} ${colors.headerBg}` : ""}`}
            style={themeStyles ? { borderColor: themeStyles.border, backgroundColor: headerBg } : {}}
          >
            <div 
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-white shadow-md flex-shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <ImageIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>Slide Layout</span>
              <span className="text-[10px] sm:text-xs text-white/70 hidden sm:inline">(Image position)</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenContentLayoutPanel();
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium border transition-colors flex-shrink-0 ${
                isLight 
                  ? "bg-white text-slate-600 hover:bg-slate-100 border-slate-200" 
                  : ""
              }`}
              style={themeStyles ? { 
                backgroundColor: themeStyles.surface, 
                color: themeStyles.text,
                borderColor: themeStyles.border,
              } : {}}
            >
              <LayoutGrid size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>Content Layout</span>
              <span 
                className={`text-[10px] sm:text-xs hidden sm:inline ${isLight ? colors.textMuted : ""}`}
                style={themeStyles ? { color: themeStyles.textMuted } : {}}
              >
                (Box style)
              </span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[60vh] sm:max-h-[55vh]">
          <div className="space-y-4 sm:space-y-6">
            {/* Image Position Layouts */}
            <div>
              <h3 
                className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${isLight ? colors.text : ""}`}
                style={themeStyles ? { color: themeStyles.text } : {}}
              >
                <ImageIcon size={14} className="sm:w-4 sm:h-4" />
                Image Position
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {slideLayoutsWithImage.map((layout) => {
                  const isSelected = selectedSlideLayout === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => {
                        setSelectedSlideLayout(layout.id);
                        onSelectSlideLayout(layout.id, selectedImageSize, selectedImageShape);
                      }}
                      className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                        isSelected
                          ? `ring-2 ring-opacity-20 ${isLight ? colors.cardBg : ""}`
                          : `${isLight ? `${colors.cardBorder} ${colors.cardHover} ${colors.cardBg}` : ""}`
                      }`}
                      style={isSelected ? { 
                        borderColor: accentColor, 
                        backgroundColor: `${accentColor}10`,
                        ["--tw-ring-color" as string]: accentColor 
                      } : themeStyles ? {
                        borderColor: themeStyles.border,
                        backgroundColor: themeStyles.surface,
                      } : {}}
                    >
                      <div 
                        className={`aspect-video rounded-md sm:rounded-lg mb-1.5 sm:mb-2 overflow-hidden ${isLight ? "bg-slate-100" : ""}`}
                        style={themeStyles ? { backgroundColor: themeStyles.surfaceHover } : {}}
                      >
                        <SlideLayoutPreview layoutId={layout.id} imageSize={selectedImageSize} />
                      </div>
                      <h4 
                        className={`font-semibold text-xs sm:text-sm truncate ${isLight ? colors.text : ""}`}
                        style={themeStyles ? { color: themeStyles.text } : {}}
                      >
                        {layout.name}
                      </h4>
                      <p 
                        className={`text-[10px] sm:text-xs mt-0.5 line-clamp-1 hidden sm:block ${isLight ? colors.textMuted : ""}`}
                        style={themeStyles ? { color: themeStyles.textMuted } : {}}
                      >
                        {layout.description}
                      </p>
                      {isSelected && (
                        <div 
                          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: accentColor }}
                        >
                          <CheckCircle2 size={10} className="sm:w-3 sm:h-3 text-white" />
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
                  <h3 
                    className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${isLight ? colors.text : ""}`}
                    style={themeStyles ? { color: themeStyles.text } : {}}
                  >
                    Image Size
                  </h3>
                  <div className="flex gap-1.5 sm:gap-2">
                    {imageSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => {
                          setSelectedImageSize(size.id);
                          onSelectSlideLayout(selectedSlideLayout, size.id, selectedImageShape);
                        }}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          selectedImageSize === size.id
                            ? "text-white shadow-md"
                            : isLight 
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : ""
                        }`}
                        style={selectedImageSize === size.id 
                          ? { backgroundColor: accentColor } 
                          : themeStyles 
                            ? { backgroundColor: themeStyles.surface, color: themeStyles.textMuted }
                            : {}
                        }
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                  <p 
                    className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${isLight ? colors.textMuted : ""}`}
                    style={themeStyles ? { color: themeStyles.textMuted } : {}}
                  >
                    {selectedImageSize === "small" && "30% of slide"}
                    {selectedImageSize === "medium" && "40% of slide"}
                    {selectedImageSize === "large" && "50% of slide"}
                    {selectedImageSize === "full" && "60% of slide"}
                  </p>
                </div>
              )}

              {/* Image Shape Selector */}
              {selectedSlideLayout !== "no-image" && selectedSlideLayout !== "image-full" && (
                <div>
                  <h3 
                    className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${isLight ? colors.text : ""}`}
                    style={themeStyles ? { color: themeStyles.text } : {}}
                  >
                    Image Shape
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {imageShapes.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => {
                          setSelectedImageShape(shape.id);
                          onSelectSlideLayout(selectedSlideLayout, selectedImageSize, shape.id);
                        }}
                        className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          selectedImageShape === shape.id
                            ? "text-white shadow-md"
                            : isLight 
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : ""
                        }`}
                        style={selectedImageShape === shape.id 
                          ? { backgroundColor: accentColor } 
                          : themeStyles 
                            ? { backgroundColor: themeStyles.surface, color: themeStyles.textMuted }
                            : {}
                        }
                      >
                        <span className={selectedImageShape === shape.id ? "text-white/80" : "opacity-60"}>{shape.icon}</span>
                        <span className="hidden sm:inline">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Layouts (No Image, Full Image) */}
              <div>
                <h3 
                  className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${isLight ? colors.text : ""}`}
                  style={themeStyles ? { color: themeStyles.text } : {}}
                >
                  Other Options
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                  {otherSlideLayouts.map((layout) => {
                    const isSelected = selectedSlideLayout === layout.id;
                    return (
                      <button
                        key={layout.id}
                        onClick={() => {
                          setSelectedSlideLayout(layout.id);
                          onSelectSlideLayout(layout.id, selectedImageSize, selectedImageShape);
                        }}
                        className={`relative p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                          isSelected
                            ? `ring-2 ring-opacity-20 ${isLight ? colors.cardBg : ""}`
                            : `${isLight ? `${colors.cardBorder} ${colors.cardHover} ${colors.cardBg}` : ""}`
                        }`}
                        style={isSelected ? { 
                          borderColor: accentColor, 
                          backgroundColor: `${accentColor}10`,
                          ["--tw-ring-color" as string]: accentColor 
                        } : themeStyles ? {
                          borderColor: themeStyles.border,
                          backgroundColor: themeStyles.surface,
                        } : {}}
                      >
                        <div 
                          className={`aspect-video rounded-md sm:rounded-lg mb-1.5 sm:mb-2 overflow-hidden ${isLight ? "bg-slate-100" : ""}`}
                          style={themeStyles ? { backgroundColor: themeStyles.surfaceHover } : {}}
                        >
                          <SlideLayoutPreview layoutId={layout.id} imageSize={selectedImageSize} />
                        </div>
                        <h4 
                          className={`font-semibold text-xs sm:text-sm truncate ${isLight ? colors.text : ""}`}
                          style={themeStyles ? { color: themeStyles.text } : {}}
                        >
                          {layout.name}
                        </h4>
                        <p 
                          className={`text-[10px] sm:text-xs mt-0.5 line-clamp-1 hidden sm:block ${isLight ? colors.textMuted : ""}`}
                          style={themeStyles ? { color: themeStyles.textMuted } : {}}
                        >
                          {layout.description}
                        </p>
                        {isSelected && (
                          <div 
                            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: accentColor }}
                          >
                            <CheckCircle2 size={10} className="sm:w-3 sm:h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
        </div>

        {/* Footer */}
        <div 
          className={`border-t px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 ${isLight ? `${colors.border} ${colors.headerBg}` : ""}`}
          style={themeStyles ? { borderColor: themeStyles.border, backgroundColor: headerBg } : {}}
        >
          <div 
            className={`text-xs sm:text-sm truncate flex-1 min-w-0 ${isLight ? colors.textMuted : ""}`}
            style={themeStyles ? { color: themeStyles.textMuted } : {}}
          >
            <span className="font-medium">Current:</span>{" "}
            <span style={themeStyles ? { color: themeStyles.text } : {}} className={isLight ? colors.text : ""}>
              {slideLayouts.find((l) => l.id === selectedSlideLayout)?.name || "Unknown"}
            </span>
            {selectedSlideLayout !== "no-image" && selectedSlideLayout !== "image-full" && selectedSlideLayout !== "image-background" && (
              <span style={themeStyles ? { color: themeStyles.textMuted } : {}}> ({selectedImageSize}, {selectedImageShape})</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg text-white transition-colors hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
