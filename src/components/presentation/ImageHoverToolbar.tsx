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
  const fill = isActive ? (isDark ? "#3b82f6" : "#2563eb") : isDark ? "#a1a1aa" : "#64748b";
  const faint = isActive ? (isDark ? "#3b82f680" : "#2563eb80") : isDark ? "#a1a1aa66" : "#64748b66";
  const baseClass = "w-8 h-6";
  const box: React.CSSProperties = { backgroundColor: fill };

  switch (shape) {
    case "arc":
      return <div className={baseClass} style={{ ...box, borderRadius: "0 0 50% 50% / 0 0 30% 30%" }} />;
    case "rectangle":
      return <div className={baseClass} style={box} />;
    case "rounded":
      return <div className={`${baseClass} rounded-md`} style={box} />;
    case "wave":
      return (
        <div
          className={baseClass}
          style={{ ...box, clipPath: "polygon(0 20%, 25% 0, 50% 15%, 75% 0, 100% 20%, 100% 100%, 0 100%)" }}
        />
      );
    case "frame":
      return (
        <div className={`${baseClass} rounded-[4px] p-[3px]`} style={{ border: `1.5px solid ${fill}` }}>
          <div className="w-full h-full rounded-[2px]" style={box} />
        </div>
      );
    case "archway":
      return <div className="w-6 h-7" style={{ ...box, borderRadius: "999px 999px 3px 3px" }} />;
    case "portal":
      return (
        <div className="w-7 h-7 rounded-full p-[3px]" style={{ border: `1.5px solid ${fill}` }}>
          <div className="w-full h-full rounded-full" style={box} />
        </div>
      );
    case "layered":
      return (
        <div className="relative w-8 h-6">
          <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-[3px]" style={{ backgroundColor: faint }} />
          <div className="absolute inset-0 rounded-[3px]" style={box} />
        </div>
      );
    case "polaroid":
      return (
        <div className="w-7 h-7 rotate-3 rounded-[2px] bg-white p-[2px] pb-[6px] shadow">
          <div className="w-full h-full" style={box} />
        </div>
      );
    case "slats":
      return (
        <div className="flex w-8 h-6 gap-[2px] items-center">
          <div className="flex-1 h-[80%] rounded-sm" style={box} />
          <div className="flex-1 h-full rounded-sm" style={box} />
          <div className="flex-1 h-[80%] rounded-sm" style={box} />
        </div>
      );
    case "organic":
      return <div className="w-7 h-7" style={{ ...box, borderRadius: "58% 42% 55% 45% / 52% 48% 60% 40%" }} />;
    case "cornercut":
      return (
        <div className={baseClass} style={{ ...box, clipPath: "polygon(0 0, 100% 0, 100% 100%, 28% 100%, 0 70%)" }} />
      );
    case "duotone":
      return (
        <div
          className={`${baseClass} rounded-[3px]`}
          style={{ background: `linear-gradient(135deg, ${fill} 0%, ${faint} 55%, transparent 100%)`, border: `1px solid ${faint}` }}
        />
      );
    case "lframe":
      return (
        <div className="relative w-8 h-6">
          <div className="absolute inset-[2px] left-[4px] bottom-[4px] rounded-[2px]" style={box} />
          <div className="absolute left-0 bottom-0 w-[2.5px] h-[75%]" style={{ backgroundColor: fill }} />
          <div className="absolute left-0 bottom-0 h-[2.5px] w-[70%]" style={{ backgroundColor: fill }} />
        </div>
      );
    case "splitpanes":
      return (
        <div className="relative w-8 h-6">
          <div className="absolute top-0 left-0 w-full h-[46%] rounded-[2px]" style={box} />
          <div className="absolute bottom-0 left-[10%] w-full h-[46%] rounded-[2px]" style={{ backgroundColor: faint }} />
        </div>
      );
    case "tape":
      return (
        <div className="relative w-7 h-6 rotate-[-4deg]">
          <div className="absolute inset-0 rounded-[2px]" style={box} />
          <div className="absolute -top-1 left-[10%] w-[45%] h-[5px] -rotate-6 rounded-[1px]" style={{ backgroundColor: faint }} />
        </div>
      );
    case "stamp":
      return (
        <div className="w-7 h-7 p-[3px] bg-white" style={{ border: `1.5px dashed ${fill}` }}>
          <div className="w-full h-full" style={box} />
        </div>
      );
    case "ticket":
      return (
        <div
          className={`${baseClass} rounded-md`}
          style={{
            ...box,
            WebkitMaskImage:
              "radial-gradient(circle 4px at 0% 60%, transparent 98%, black 100%), radial-gradient(circle 4px at 100% 60%, transparent 98%, black 100%)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        />
      );
    case "hexagon":
      return (
        <div className="w-7 h-7" style={{ ...box, clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" }} />
      );
    case "diamond":
      return <div className="w-5 h-5 rotate-45 rounded-[3px]" style={box} />;
    case "ribbon":
      return (
        <div className="relative w-8 h-6 overflow-hidden rounded-[2px]">
          <div className="absolute inset-0" style={{ backgroundColor: faint }} />
          <div className="absolute top-[2px] left-[-8px] w-[24px] h-[4px] -rotate-45" style={{ backgroundColor: fill }} />
        </div>
      );
    case "vignette":
      return (
        <div
          className={`${baseClass} rounded-[3px]`}
          style={{ background: `radial-gradient(ellipse at center, ${faint} 30%, ${fill} 100%)` }}
        />
      );
    case "contour":
      return (
        <div className="relative w-8 h-6">
          <div className="absolute -inset-[3px] rounded-[6px]" style={{ border: `1px solid ${faint}` }} />
          <div className="absolute inset-0 rounded-[4px]" style={box} />
        </div>
      );
    case "collage":
      return (
        <div
          className="w-8 h-6 rotate-2 bg-white p-[2px]"
          style={{ clipPath: "polygon(4% 8%, 50% 0, 96% 6%, 100% 55%, 94% 96%, 40% 100%, 0 92%)" }}
        >
          <div className="w-full h-full" style={{ ...box, clipPath: "polygon(4% 8%, 50% 0, 96% 6%, 100% 55%, 94% 96%, 40% 100%, 0 92%)" }} />
        </div>
      );
    case "tilt3d":
      return (
        <div className={`${baseClass} rounded-[3px]`} style={{ ...box, transform: "perspective(60px) rotateY(-16deg)" }} />
      );
    case "window":
      return (
        <div className="relative w-8 h-6 rounded-[2px] overflow-hidden" style={{ border: `1.5px solid ${fill}` }}>
          <div className="absolute inset-0" style={{ backgroundColor: faint }} />
          <div className="absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2" style={{ backgroundColor: fill }} />
          <div className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2" style={{ backgroundColor: fill }} />
        </div>
      );
    default:
      return <div className={baseClass} style={box} />;
  }
};

const shapeOptions: { shape: ImageShape; label: string }[] = [
  { shape: "rectangle", label: "Rectangle" },
  { shape: "rounded", label: "Rounded" },
  { shape: "arc", label: "Arc" },
  { shape: "wave", label: "Wave" },
  { shape: "frame", label: "Gallery Frame" },
  { shape: "archway", label: "Arch Window" },
  { shape: "portal", label: "Portal" },
  { shape: "layered", label: "Layered" },
  { shape: "polaroid", label: "Polaroid" },
  { shape: "slats", label: "Slats" },
  { shape: "organic", label: "Organic" },
  { shape: "cornercut", label: "Corner Cut" },
  { shape: "duotone", label: "Duotone" },
  { shape: "lframe", label: "L-Frame" },
  { shape: "splitpanes", label: "Split Panes" },
  { shape: "tape", label: "Washi Tape" },
  { shape: "stamp", label: "Postage" },
  { shape: "ticket", label: "Ticket" },
  { shape: "hexagon", label: "Hexagon" },
  { shape: "diamond", label: "Diamond" },
  { shape: "ribbon", label: "Ribbon" },
  { shape: "vignette", label: "Vignette" },
  { shape: "contour", label: "Contour" },
  { shape: "collage", label: "Cutout" },
  { shape: "tilt3d", label: "3D Tilt" },
  { shape: "window", label: "Window" },
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
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 ${bgClass} border ${borderClass} rounded-lg shadow-xl p-2 min-w-[248px]`}
          >
            <p className="text-[10px] text-center mb-2 opacity-60">
              Image Design
            </p>
            <div className="grid grid-cols-3 gap-1.5 max-h-[264px] overflow-y-auto pr-0.5">
              {shapeOptions.map((option) => (
                <button
                  key={option.shape}
                  onClick={() => {
                    onChangeShape(option.shape);
                    setShowShapeMenu(false);
                  }}
                  className={`p-2 rounded-md ${hoverClass} transition-colors flex flex-col items-center justify-end gap-1.5 ${
                    currentShape === option.shape ? activeClass : ""
                  }`}
                  title={option.label}
                >
                  <ShapePreview
                    shape={option.shape}
                    isActive={currentShape === option.shape}
                    isDark={isDark}
                  />
                  <span className="text-[9px] leading-tight text-center whitespace-nowrap">{option.label}</span>
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
