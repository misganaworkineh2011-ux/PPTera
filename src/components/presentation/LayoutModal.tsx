"use client";

import { useState } from "react";
import { X, Type, LayoutGrid, ImageIcon, ChevronDown, CheckCircle2 } from "lucide-react";
import { slideLayouts, type LayoutType } from "~/lib/slide-layouts";
import LayoutPreview from "./LayoutPreview";

interface LayoutModalProps {
  currentLayout?: LayoutType;
  onSelect: (layoutId: LayoutType) => void;
  onClose: () => void;
}

export default function LayoutModal({ currentLayout, onSelect, onClose }: LayoutModalProps) {
  const [activeCategory, setActiveCategory] = useState<"title" | "content" | "media" | "data">("content");

  const categories = [
    { id: "title" as const, label: "Title", icon: Type },
    { id: "content" as const, label: "Content", icon: LayoutGrid },
    { id: "media" as const, label: "Media", icon: ImageIcon },
    { id: "data" as const, label: "Data", icon: ChevronDown },
  ];

  const filteredLayouts = slideLayouts.filter((l) => l.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[80vh] overflow-hidden">
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

        <div className="flex gap-2 p-4 border-b border-slate-200 bg-slate-50">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-[#06b6d4] text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-3 gap-4">
            {filteredLayouts.map((layout) => {
              const isSelected = currentLayout === layout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => onSelect(layout.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                    isSelected
                      ? "border-[#06b6d4] bg-[#06b6d4]/5 ring-2 ring-[#06b6d4]/20"
                      : "border-slate-200 hover:border-[#06b6d4]/50"
                  }`}
                >
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <LayoutPreview layoutId={layout.id} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{layout.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{layout.description}</p>
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
    </div>
  );
}
