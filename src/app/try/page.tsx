"use client";

import { useState } from "react";
import { LayoutGrid, Image } from "lucide-react";
import { getDefaultTheme } from "~/lib/themes";
import type { BoxLayoutType, BoxContentItem } from "~/lib/layouts/content/boxes";
import { boxLayouts } from "~/lib/layouts/content/boxes";
import BoxLayoutRenderer from "~/components/presentation/BoxLayoutRenderer";
import ContentLayoutSelector from "~/components/presentation/ContentLayoutSelector";

// Define layouts inline to avoid any import issues
const LAYOUTS = [
  { id: "image-left", name: "Left", position: "left" },
  { id: "image-right", name: "Right", position: "right" },
  { id: "image-top", name: "Top", position: "top" },
  { id: "image-bottom", name: "Bottom", position: "bottom" },
] as const;

type LayoutId = (typeof LAYOUTS)[number]["id"];
type ImageSize = "small" | "medium" | "large" | "full";

const SIZES: Record<ImageSize, number> = {
  small: 30,
  medium: 40,
  large: 50,
  full: 60,
};

// Fixed pixel heights for top/bottom images (always medium size)
const FIXED_IMAGE_HEIGHTS: Record<ImageSize, string> = {
  small: "200px",
  medium: "300px", // Fixed medium size
  large: "400px",
  full: "500px",
};

const SAMPLE_IMAGE =
  "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

const slideTitle = "What If Creativity Was Your Superpower?";
const slideContent = [
  { heading: "Explore Untapped Potential", description: "Unlock the hidden depths of your creative mind and harness its full power." },
  { heading: "Transform Engagement", description: "Discover how innovative content can revolutionize audience interaction and connection." },
  { heading: "Challenge Norms", description: "Dare to break free from traditional content creation methods and forge new paths." },
];

// Convert to BoxContentItem format
// Icons are optional - only included if content has them
const boxContentItems: BoxContentItem[] = slideContent.map((item, idx) => ({
  label: item.heading,
  text: item.description,
  // Icons are optional - uncomment to test with icons:
  // icon: ["💡", "🚀", "🛠️"][idx],
}));

export default function TryPage() {
  const [mode, setMode] = useState<"slide" | "box">("box");
  const [layoutId, setLayoutId] = useState<LayoutId>("image-right");
  const [size, setSize] = useState<ImageSize>("small"); // Default smaller to give room for boxes
  const [boxLayoutId, setBoxLayoutId] = useState<BoxLayoutType>("box-style-1");
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  
  const theme = getDefaultTheme();
  
  // Custom theme overrides for the green style in the user image
  const greenTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      accent: "#047857", // Emerald 700
      surface: "#d1fae5", // Emerald 100
      border: "#a7f3d0", // Emerald 200
    },
    cardBox: {
      background: "#d1fae5", // Emerald 100
      borderColor: "#a7f3d0", // Emerald 200
      accentColor: "#047857", // Emerald 700
      titleColor: "#064e3b", // Emerald 900
      bodyColor: "#065f46", // Emerald 800
      shadow: "none",
    }
  };

  const activeTheme = greenTheme; // Use green theme to match image style

  const layout = LAYOUTS.find((l) => l.id === layoutId)!;
  const sizeValue = SIZES[size];
  const pos = layout.position;

  // Arc clip path for image edge
  const getClipPath = () => {
    const i = 50; // arc intensity
    if (pos === "left") return `polygon(0 0, calc(100% - ${i}px) 0, 100% 50%, calc(100% - ${i}px) 100%, 0 100%)`;
    if (pos === "right") return `polygon(${i}px 0, 100% 0, 100% 100%, ${i}px 100%, 0 50%)`;
    if (pos === "top") return `polygon(0 0, 100% 0, 100% calc(100% - ${i}px), 50% 100%, 0 calc(100% - ${i}px))`;
    if (pos === "bottom") return `polygon(0 ${i}px, 50% 0, 100% ${i}px, 100% 100%, 0 100%)`;
    return "none";
  };

  const renderSlide = () => {
    // For flexible height, we need different approaches based on image position
    const isVerticalImage = pos === "top" || pos === "bottom";
    
    if (isVerticalImage) {
      // Image on top/bottom - use fixed medium height, content area flexible
      const fixedImageHeight = FIXED_IMAGE_HEIGHTS.medium; // Always use medium size
      
      return (
        <div className="relative w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
          {/* Image Layer */}
          {pos === "top" && (
            <div
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width: "100%",
                height: fixedImageHeight,
                clipPath: getClipPath(),
              }}
            >
              <img src={SAMPLE_IMAGE} alt="Slide" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Content Layer - Flexible height */}
          <div
            className="flex flex-col flex-1"
            style={{
              width: "100%",
              paddingLeft: "3rem",
              paddingRight: "3rem",
              paddingTop: "3rem",
              paddingBottom: "3rem",
            }}
          >
            {/* Slide Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-serif font-bold text-slate-800">{slideTitle}</h1>
            </div>

            {/* Box Layout Renderer */}
            <div className="w-full">
              <BoxLayoutRenderer
                layoutId={boxLayoutId}
                items={boxContentItems}
                theme={activeTheme}
                compact={size === "large" || size === "full"}
                showIcons={true}
                className="w-full"
                isNarrowSpace={false}
              />
            </div>
          </div>

          {/* Image Layer - Bottom */}
          {pos === "bottom" && (
            <div
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width: "100%",
                height: fixedImageHeight,
                clipPath: getClipPath(),
              }}
            >
              <img src={SAMPLE_IMAGE} alt="Slide" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      );
    }

    // Image on left/right - use flex layout for natural height matching
    return (
      <div className="relative w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-stretch">
        {/* Image Layer */}
        {pos === "left" && (
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{
              width: `${sizeValue}%`,
              clipPath: getClipPath(),
            }}
          >
            <img src={SAMPLE_IMAGE} alt="Slide" className="w-full h-full object-cover" style={{ display: "block", minHeight: "100%" }} />
          </div>
        )}

        {/* Content Layer - Flexible width and height */}
        <div
          className="flex flex-col flex-1"
          style={{
            width: `${100 - sizeValue}%`,
            paddingLeft: "3rem",
            paddingRight: "3rem",
            paddingTop: "3rem",
            paddingBottom: "3rem",
          }}
        >
          {/* Slide Title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif font-bold text-slate-800">{slideTitle}</h1>
          </div>

          {/* Box Layout Renderer */}
          <div className="w-full">
            <BoxLayoutRenderer
              layoutId={boxLayoutId}
              items={boxContentItems}
              theme={activeTheme}
              compact={size === "large" || size === "full"}
              showIcons={true}
              className="w-full"
              isNarrowSpace={true}
            />
          </div>
        </div>

        {/* Image Layer - Right */}
        {pos === "right" && (
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{
              width: `${sizeValue}%`,
              clipPath: getClipPath(),
            }}
          >
            <img src={SAMPLE_IMAGE} alt="Slide" className="w-full h-full object-cover" style={{ display: "block", minHeight: "100%" }} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Layout Playground</h1>
          <button
            onClick={() => setShowLayoutSelector(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors shadow-sm"
          >
            <LayoutGrid size={18} />
            Change Layout
          </button>
        </div>

        <div className="flex gap-6">
          {/* Main Preview Area */}
          <div className="flex-1">
            <div className="w-full border border-slate-300 rounded-xl overflow-hidden shadow-2xl bg-white">
               {renderSlide()}
               
               {/* Hover Trigger Area for Demo (simulating hover over content) */}
               <div className="absolute top-4 right-4 z-50">
                   <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                       Hover content to change layout
                   </span>
               </div>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-72 space-y-4 overflow-y-auto h-full pr-2">
            {/* Slide Layout Controls */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Image size={16}/> Slide Structure
              </h2>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-xs text-slate-500 mb-1 block">Image Position</label>
                      <div className="grid grid-cols-2 gap-2">
                        {LAYOUTS.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => setLayoutId(l.id)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              layoutId === l.id
                                ? "bg-teal-500 text-white shadow-md"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {l.name}
                          </button>
                        ))}
                      </div>
                  </div>
                  
                  <div>
                      <label className="text-xs text-slate-500 mb-1 block">Image Size</label>
                      <div className="grid grid-cols-4 gap-1">
                          {(["small", "medium", "large", "full"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => setSize(s)}
                              className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                                size === s
                                  ? "bg-teal-500 text-white shadow-md"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              {s[0]?.toUpperCase()}
                            </button>
                          ))}
                        </div>
                  </div>
              </div>
            </div>

            {/* Box Layout Controls */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <LayoutGrid size={16}/> Content Layout
              </h2>
              <div className="space-y-2">
                {boxLayouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => setBoxLayoutId(layout.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg text-xs font-medium transition-all border ${
                      boxLayoutId === layout.id
                        ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500"
                        : "bg-slate-50 border-slate-200 hover:border-teal-300"
                    }`}
                  >
                    <div className="font-semibold text-slate-800 mb-0.5">{layout.name}</div>
                    <div className="text-slate-500 text-[10px]">{layout.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Theme Info */}
            <div className="bg-slate-800 rounded-xl p-4 text-white">
                <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider opacity-70">Theme Context</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <div className="w-full h-8 rounded mb-1" style={{ backgroundColor: activeTheme.cardBox?.background }}></div>
                        <span className="opacity-60">Surface</span>
                    </div>
                    <div>
                        <div className="w-full h-8 rounded mb-1" style={{ backgroundColor: activeTheme.cardBox?.accentColor }}></div>
                        <span className="opacity-60">Accent</span>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Content Layout Selector Modal */}
        <ContentLayoutSelector
          isOpen={showLayoutSelector}
          currentLayout={boxLayoutId}
          contentItems={boxContentItems}
          theme={activeTheme}
          onSelect={(layoutId) => {
            setBoxLayoutId(layoutId);
            setShowLayoutSelector(false);
          }}
          onClose={() => setShowLayoutSelector(false)}
        />
      </div>
    </div>
  );
}
