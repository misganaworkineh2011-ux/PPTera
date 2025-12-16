"use client";

import { useState } from "react";
import { X, LayoutGrid, Image, BarChart3, Type } from "lucide-react";
import { slideLayouts, type LayoutType, type LayoutDefinition } from "~/lib/slide-layouts";

interface LayoutSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (layoutId: LayoutType) => void;
  currentLayout?: LayoutType;
}

export default function LayoutSelector({
  isOpen,
  onClose,
  onSelectLayout,
  currentLayout,
}: LayoutSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<LayoutDefinition["category"]>("content");

  if (!isOpen) return null;

  const categories = [
    { id: "title" as const, label: "Title", icon: Type },
    { id: "content" as const, label: "Content", icon: LayoutGrid },
    { id: "media" as const, label: "Media", icon: Image },
    { id: "data" as const, label: "Data", icon: BarChart3 },
  ];

  const filteredLayouts = slideLayouts.filter((layout) => layout.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Change Layout</h2>
            <p className="text-sm text-slate-500 mt-1">Choose how your content is arranged</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 p-4 border-b border-slate-200 bg-slate-50">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? "bg-[#06b6d4] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon size={16} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Layout Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-3 gap-4">
            {filteredLayouts.map((layout) => {
              const isSelected = currentLayout === layout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => {
                    onSelectLayout(layout.id);
                    onClose();
                  }}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                    isSelected
                      ? "border-[#06b6d4] bg-[#06b6d4]/5 ring-2 ring-[#06b6d4]/20"
                      : "border-slate-200 hover:border-[#06b6d4]/50"
                  }`}
                >
                  {/* Layout Preview */}
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <LayoutPreview layoutId={layout.id} />
                  </div>
                  
                  {/* Layout Info */}
                  <h3 className="font-semibold text-slate-900 text-sm">{layout.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{layout.description}</p>
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#06b6d4] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual preview component for each layout
function LayoutPreview({ layoutId }: { layoutId: LayoutType }) {
  const previewStyles = {
    "title-center": (
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        <div className="w-16 h-2 bg-slate-400 rounded mb-1" />
        <div className="w-12 h-1.5 bg-slate-300 rounded" />
      </div>
    ),
    "title-left": (
      <div className="w-full h-full flex p-2">
        <div className="w-1/2 flex flex-col justify-center">
          <div className="w-12 h-2 bg-slate-400 rounded mb-1" />
          <div className="w-8 h-1.5 bg-slate-300 rounded" />
        </div>
        <div className="w-1/2 bg-slate-300 rounded" />
      </div>
    ),
    "content-left-image-right": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2" />
        <div className="flex-1 flex gap-2">
          <div className="w-1/2 space-y-1">
            <div className="h-1 bg-slate-300 rounded w-full" />
            <div className="h-1 bg-slate-300 rounded w-4/5" />
            <div className="h-1 bg-slate-300 rounded w-full" />
          </div>
          <div className="w-1/2 bg-slate-300 rounded" />
        </div>
      </div>
    ),
    "content-right-image-left": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2" />
        <div className="flex-1 flex gap-2">
          <div className="w-1/2 bg-slate-300 rounded" />
          <div className="w-1/2 space-y-1">
            <div className="h-1 bg-slate-300 rounded w-full" />
            <div className="h-1 bg-slate-300 rounded w-4/5" />
            <div className="h-1 bg-slate-300 rounded w-full" />
          </div>
        </div>
      </div>
    ),
    "content-grid-2": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-slate-300 rounded" />
          <div className="bg-slate-300 rounded" />
        </div>
      </div>
    ),
    "content-grid-3": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-3 gap-1">
          <div className="bg-slate-300 rounded flex flex-col items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-1" />
            <div className="w-4 h-0.5 bg-slate-400 rounded" />
          </div>
          <div className="bg-slate-300 rounded flex flex-col items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-1" />
            <div className="w-4 h-0.5 bg-slate-400 rounded" />
          </div>
          <div className="bg-slate-300 rounded flex flex-col items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-1" />
            <div className="w-4 h-0.5 bg-slate-400 rounded" />
          </div>
        </div>
      </div>
    ),
    "content-grid-4": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
          <div className="bg-slate-300 rounded" />
          <div className="bg-slate-300 rounded" />
          <div className="bg-slate-300 rounded" />
          <div className="bg-slate-300 rounded" />
        </div>
      </div>
    ),
    "content-cards-2": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-pink-200 rounded p-1">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-1" />
            <div className="w-full h-0.5 bg-pink-300 rounded" />
          </div>
          <div className="bg-pink-200 rounded p-1">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-1" />
            <div className="w-full h-0.5 bg-pink-300 rounded" />
          </div>
        </div>
      </div>
    ),
    "content-cards-3": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-3 gap-1">
          <div className="bg-pink-200 rounded p-1">
            <div className="w-2 h-2 rounded-full bg-pink-400 mb-0.5" />
            <div className="w-full h-0.5 bg-pink-300 rounded" />
          </div>
          <div className="bg-pink-200 rounded p-1">
            <div className="w-2 h-2 rounded-full bg-pink-400 mb-0.5" />
            <div className="w-full h-0.5 bg-pink-300 rounded" />
          </div>
          <div className="bg-pink-200 rounded p-1">
            <div className="w-2 h-2 rounded-full bg-pink-400 mb-0.5" />
            <div className="w-full h-0.5 bg-pink-300 rounded" />
          </div>
        </div>
      </div>
    ),
    "content-full-image": (
      <div className="w-full h-full bg-gradient-to-br from-slate-400 to-slate-500 rounded flex items-center justify-center">
        <div className="w-16 h-2 bg-white/80 rounded" />
      </div>
    ),
    "content-split-diagonal": (
      <div className="w-full h-full relative overflow-hidden rounded">
        <div className="absolute inset-0 bg-slate-400" style={{ clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)" }} />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 space-y-1">
          <div className="w-8 h-1.5 bg-slate-400 rounded" />
          <div className="w-6 h-1 bg-slate-300 rounded" />
        </div>
      </div>
    ),
    "content-timeline": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <div className="w-4 h-0.5 bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <div className="w-4 h-0.5 bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>
        </div>
      </div>
    ),
    "content-comparison": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-green-200 rounded" />
          <div className="bg-red-200 rounded" />
        </div>
      </div>
    ),
    "content-quote": (
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        <div className="text-2xl text-slate-400 mb-1">"</div>
        <div className="w-16 h-1 bg-slate-300 rounded mb-1" />
        <div className="w-8 h-0.5 bg-slate-400 rounded" />
      </div>
    ),
    "content-stats": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-3 gap-1">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-500">99%</div>
            <div className="w-4 h-0.5 bg-slate-300 rounded" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-500">50K</div>
            <div className="w-4 h-0.5 bg-slate-300 rounded" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-500">24/7</div>
            <div className="w-4 h-0.5 bg-slate-300 rounded" />
          </div>
        </div>
      </div>
    ),
  };

  return previewStyles[layoutId] || <div className="text-xs text-slate-400">Preview</div>;
}
