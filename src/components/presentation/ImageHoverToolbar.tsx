"use client";

import { useState } from "react";
import {
  ImageIcon,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Layers,
  Move,
} from "lucide-react";
import type { ImageShape, SlideLayoutType } from "~/lib/layouts/slide";

interface ImageHoverToolbarProps {
  slideIndex: number;
  imageIndex: number;
  currentShape?: ImageShape;
  currentPosition?: "left" | "right" | "top" | "bottom" | "none" | "full";
  onChangeImage: () => void;
  onRemoveImage: () => void;
  onChangeShape: (shape: ImageShape) => void;
  onChangePosition?: (position: SlideLayoutType) => void;
  onMoveImage?: (direction: "left" | "right") => void;
  theme: "dark" | "light";
}

// Shape preview components with accurate visual representation
const ShapePreview = ({
  shape,
  isActive,
  isDark,
}: {
  shape: ImageShape;
  isActive: boolean;
  isDark: boolean;
}) => {
  const baseClass = `w-8 h-6 ${isActive ? (isDark ? "bg-blue-500" : "bg-blue-600") : isDark ? "bg-zinc-400" : "bg-slate-500"}`;

  switch (shape) {
    case "arc":
      return (
        <div
          className={`${baseClass} relative overflow-hidden`}
          style={{ borderRadius: "0 0 50% 50% / 0 0 30% 30%" }}
        />
      );
    case "rectangle":
      return <div className={baseClass} />;
    case "rounded":
      return <div className={`${baseClass} rounded-md`} />;
    case "wave":
      return (
        <div
          className={`${baseClass} relative`}
          style={{
            clipPath:
              "polygon(0 20%, 25% 0, 50% 15%, 75% 0, 100% 20%, 100% 100%, 0 100%)",
          }}
        />
      );
    default:
      return <div className={baseClass} />;
  }
};

const shapeOptions: { shape: ImageShape; label: string }[] = [
  { shape: "rectangle", label: "Rectangle" },
  { shape: "rounded", label: "Rounded" },
  { shape: "arc", label: "Arc" },
  { shape: "wave", label: "Wave" },
];

export default function ImageHoverToolbar({
  currentShape = "arc",
  currentPosition = "right",
  onChangeImage,
  onRemoveImage,
  onChangeShape,
  onChangePosition,
  onMoveImage,
  theme,
}: ImageHoverToolbarProps) {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showPositionMenu, setShowPositionMenu] = useState(false);

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-zinc-900/95" : "bg-white/95";
  const textClass = isDark ? "text-white" : "text-slate-900";
  const hoverClass = isDark ? "hover:bg-zinc-700" : "hover:bg-slate-100";
  const borderClass = isDark ? "border-zinc-700" : "border-slate-200";
  const activeClass = isDark ? "bg-zinc-700" : "bg-slate-200";

  return (
    <div
      className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 rounded-lg ${bgClass} ${textClass} border ${borderClass} shadow-xl backdrop-blur-sm`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Change Image */}
      <button
        onClick={onChangeImage}
        className={`p-1.5 rounded-md ${hoverClass} transition-colors flex items-center gap-1`}
        title="Change image"
      >
        <ImageIcon size={16} />
      </button>

      {/* Shape Selector */}
      <div className="relative">
        <button
          onClick={() => {
            setShowShapeMenu(!showShapeMenu);
            setShowPositionMenu(false);
          }}
          className={`p-1.5 rounded-md ${hoverClass} transition-colors flex items-center gap-1`}
          title="Change shape"
        >
          <Layers size={16} />
        </button>

        {showShapeMenu && (
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 ${bgClass} border ${borderClass} rounded-lg shadow-xl p-2 min-w-[160px]`}
          >
            <p className="text-[10px] text-center mb-2 opacity-60">
              Image Shape
            </p>
            <div className="grid grid-cols-2 gap-2">
              {shapeOptions.map((option) => (
                <button
                  key={option.shape}
                  onClick={() => {
                    onChangeShape(option.shape);
                    setShowShapeMenu(false);
                  }}
                  className={`p-2 rounded-md ${hoverClass} transition-colors flex flex-col items-center gap-1.5 ${
                    currentShape === option.shape ? activeClass : ""
                  }`}
                  title={option.label}
                >
                  <ShapePreview
                    shape={option.shape}
                    isActive={currentShape === option.shape}
                    isDark={isDark}
                  />
                  <span className="text-[10px]">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Position Selector */}
      {onChangePosition && (
        <div className="relative">
          <button
            onClick={() => {
              setShowPositionMenu(!showPositionMenu);
              setShowShapeMenu(false);
            }}
            className={`p-1.5 rounded-md ${hoverClass} transition-colors flex items-center gap-1`}
            title="Move image position"
          >
            <Move size={16} />
          </button>

          {showPositionMenu && (
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 ${bgClass} border ${borderClass} rounded-lg shadow-xl p-3 min-w-[120px]`}
            >
              <p className="text-[10px] text-center mb-3 opacity-60">
                Image Position
              </p>
              {/* Position grid - visual layout */}
              <div className="flex flex-col items-center gap-1">
                {/* Top */}
                <button
                  onClick={() => {
                    onChangePosition("image-top");
                    setShowPositionMenu(false);
                  }}
                  className={`w-16 h-7 rounded ${hoverClass} transition-colors flex items-center justify-center ${
                    currentPosition === "top" ? activeClass : ""
                  }`}
                  title="Top"
                >
                  <ArrowUp size={14} />
                </button>
                {/* Left - Center - Right */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      onChangePosition("image-left");
                      setShowPositionMenu(false);
                    }}
                    className={`w-7 h-10 rounded ${hoverClass} transition-colors flex items-center justify-center ${
                      currentPosition === "left" ? activeClass : ""
                    }`}
                    title="Left"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <div
                    className={`w-10 h-10 rounded border ${borderClass} flex items-center justify-center opacity-30`}
                  >
                    <ImageIcon size={16} />
                  </div>
                  <button
                    onClick={() => {
                      onChangePosition("image-right");
                      setShowPositionMenu(false);
                    }}
                    className={`w-7 h-10 rounded ${hoverClass} transition-colors flex items-center justify-center ${
                      currentPosition === "right" ? activeClass : ""
                    }`}
                    title="Right"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                {/* Bottom */}
                <button
                  onClick={() => {
                    onChangePosition("image-bottom");
                    setShowPositionMenu(false);
                  }}
                  className={`w-16 h-7 rounded ${hoverClass} transition-colors flex items-center justify-center ${
                    currentPosition === "bottom" ? activeClass : ""
                  }`}
                  title="Bottom"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Move buttons (if multiple images) */}
      {onMoveImage && (
        <>
          <div
            className={`w-px h-4 ${isDark ? "bg-zinc-700" : "bg-slate-300"}`}
          />
          <button
            onClick={() => onMoveImage("left")}
            className={`p-1.5 rounded-md ${hoverClass} transition-colors`}
            title="Swap with previous"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            onClick={() => onMoveImage("right")}
            className={`p-1.5 rounded-md ${hoverClass} transition-colors`}
            title="Swap with next"
          >
            <ArrowRight size={14} />
          </button>
        </>
      )}

      {/* Divider */}
      <div className={`w-px h-4 ${isDark ? "bg-zinc-700" : "bg-slate-300"}`} />

      {/* Remove Image */}
      <button
        onClick={onRemoveImage}
        className="p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-500 transition-colors"
        title="Remove image"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
