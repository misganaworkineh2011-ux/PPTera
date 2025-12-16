"use client";

import { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  MoreHorizontal,
  ChevronDown,
  LayoutGrid,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
} from "lucide-react";

interface TextEditorToolbarProps {
  onFormatChange: (format: string, value?: string) => void;
  onLayoutChange: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  currentLayout?: string;
  isVisible: boolean;
}

export default function TextEditorToolbar({
  onFormatChange,
  onLayoutChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  currentLayout,
  isVisible,
}: TextEditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  if (!isVisible) return null;

  const colors = [
    "#000000", "#374151", "#6b7280", "#9ca3af",
    "#ef4444", "#f97316", "#f59e0b", "#eab308",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
    "#ec4899", "#f43f5e", "#be185d", "#ffffff",
  ];

  const fontSizes = [
    { label: "Small", value: "14px" },
    { label: "Normal", value: "16px" },
    { label: "Medium", value: "20px" },
    { label: "Large", value: "24px" },
    { label: "XL", value: "32px" },
    { label: "2XL", value: "40px" },
    { label: "3XL", value: "48px" },
  ];

  return (
    <div className="absolute -top-12 left-0 z-50 flex items-center gap-1 bg-white rounded-lg shadow-xl border border-slate-200 p-1.5 animate-fade-in">
      {/* Layout Selector */}
      <button
        onClick={onLayoutChange}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
      >
        <LayoutGrid size={16} />
        <span className="hidden sm:inline">{currentLayout || "Layout"}</span>
        <ChevronDown size={14} />
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Text Formatting */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onFormatChange("bold")}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => onFormatChange("italic")}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => onFormatChange("underline")}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Underline"
        >
          <Underline size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Alignment */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onFormatChange("align", "left")}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => onFormatChange("align", "center")}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => onFormatChange("align", "right")}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Font Size */}
      <div className="relative">
        <button
          onClick={() => setShowFontSize(!showFontSize)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Font Size"
        >
          <Type size={16} />
          <ChevronDown size={14} />
        </button>
        {showFontSize && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[120px] z-50">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => {
                  onFormatChange("fontSize", size.value);
                  setShowFontSize(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
              >
                {size.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color Picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Text Color"
        >
          <Palette size={16} />
          <ChevronDown size={14} />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-50">
            <div className="grid grid-cols-5 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    onFormatChange("color", color);
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* More Options */}
      <div className="relative">
        <button
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="More Options"
        >
          <MoreHorizontal size={16} />
        </button>
        {showMoreOptions && (
          <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[160px] z-50">
            <button
              onClick={() => {
                onDuplicate();
                setShowMoreOptions(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              <Copy size={14} />
              Duplicate
            </button>
            <button
              onClick={() => {
                onMoveUp();
                setShowMoreOptions(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              <MoveUp size={14} />
              Move Up
            </button>
            <button
              onClick={() => {
                onMoveDown();
                setShowMoreOptions(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              <MoveDown size={14} />
              Move Down
            </button>
            <div className="border-t border-slate-200 my-1" />
            <button
              onClick={() => {
                onDelete();
                setShowMoreOptions(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
