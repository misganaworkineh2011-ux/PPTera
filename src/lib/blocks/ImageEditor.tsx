"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Check, Crop, Circle, Square, Hexagon, Move, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { ImageBlock } from "./types";

interface ImageEditorProps {
  block: ImageBlock;
  onSave: (block: ImageBlock) => void;
  onCancel: () => void;
}

type MaskType = "none" | "circle" | "rounded" | "blob" | "hexagon";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageEditor({ block, onSave, onCancel }: ImageEditorProps) {
  const [activeTab, setActiveTab] = useState<"crop" | "mask" | "adjust">("crop");
  const [mask, setMask] = useState<MaskType>(block.mask || "none");
  const [cropArea, setCropArea] = useState<CropArea>(block.crop || { x: 0, y: 0, width: 100, height: 100 });
  const [brightness, setBrightness] = useState(block.filter?.brightness || 100);
  const [contrast, setContrast] = useState(block.filter?.contrast || 100);
  const [saturation, setSaturation] = useState(block.filter?.saturation || 100);
  const [objectFit, setObjectFit] = useState<"cover" | "contain" | "fill">(
    block.objectFit === "none" ? "cover" : (block.objectFit || "cover")
  );
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Crop interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState<"move" | "resize-nw" | "resize-ne" | "resize-sw" | "resize-se" | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: typeof dragType) => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragType || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

    setCropArea(prev => {
      let newArea = { ...prev };

      if (dragType === "move") {
        newArea.x = Math.max(0, Math.min(100 - prev.width, prev.x + deltaX));
        newArea.y = Math.max(0, Math.min(100 - prev.height, prev.y + deltaY));
      } else if (dragType === "resize-se") {
        newArea.width = Math.max(10, Math.min(100 - prev.x, prev.width + deltaX));
        newArea.height = Math.max(10, Math.min(100 - prev.y, prev.height + deltaY));
      } else if (dragType === "resize-nw") {
        const newX = Math.max(0, prev.x + deltaX);
        const newY = Math.max(0, prev.y + deltaY);
        newArea.width = prev.width - (newX - prev.x);
        newArea.height = prev.height - (newY - prev.y);
        newArea.x = newX;
        newArea.y = newY;
      }

      return newArea;
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragType, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    const updatedBlock: ImageBlock = {
      ...block,
      mask,
      crop: cropArea,
      filter: {
        brightness,
        contrast,
        saturation,
      },
      objectFit,
    };
    onSave(updatedBlock);
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const maskOptions: { type: MaskType; label: string; icon: React.ReactNode }[] = [
    { type: "none", label: "None", icon: <Square size={20} /> },
    { type: "rounded", label: "Rounded", icon: <Square size={20} className="rounded" /> },
    { type: "circle", label: "Circle", icon: <Circle size={20} /> },
    { type: "hexagon", label: "Hexagon", icon: <Hexagon size={20} /> },
    { type: "blob", label: "Blob", icon: <div className="w-5 h-5 bg-current rounded-[30%_70%_70%_30%/30%_30%_70%_70%]" /> },
  ];

  const imageStyle: React.CSSProperties = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    objectFit,
  };

  const getMaskClass = (m: MaskType) => {
    switch (m) {
      case "circle": return "rounded-full";
      case "rounded": return "rounded-2xl";
      case "blob": return "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]";
      case "hexagon": return "clip-path-hexagon";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Edit Image</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
            >
              <Check size={18} />
              Save
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("crop")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "crop"
                ? "bg-slate-100 text-slate-900 border-b-2 border-cyan-500"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Crop size={18} />
            Crop
          </button>
          <button
            onClick={() => setActiveTab("mask")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "mask"
                ? "bg-slate-100 text-slate-900 border-b-2 border-cyan-500"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Circle size={18} />
            Mask
          </button>
          <button
            onClick={() => setActiveTab("adjust")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "adjust"
                ? "bg-slate-100 text-slate-900 border-b-2 border-cyan-500"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ZoomIn size={18} />
            Adjust
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex gap-6">
            {/* Preview */}
            <div className="flex-1">
              <div
                ref={containerRef}
                className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden"
              >
                <img
                  ref={imageRef}
                  src={block.url}
                  alt={block.alt}
                  className={`w-full h-full ${getMaskClass(mask)}`}
                  style={imageStyle}
                />
                
                {/* Crop overlay */}
                {activeTab === "crop" && (
                  <>
                    {/* Darkened areas outside crop */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 bg-black/50" />
                      <div
                        className="absolute bg-transparent"
                        style={{
                          left: `${cropArea.x}%`,
                          top: `${cropArea.y}%`,
                          width: `${cropArea.width}%`,
                          height: `${cropArea.height}%`,
                          boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                        }}
                      />
                    </div>
                    
                    {/* Crop handles */}
                    <div
                      className="absolute border-2 border-white cursor-move"
                      style={{
                        left: `${cropArea.x}%`,
                        top: `${cropArea.y}%`,
                        width: `${cropArea.width}%`,
                        height: `${cropArea.height}%`,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, "move")}
                    >
                      {/* Corner handles */}
                      <div
                        className="absolute -left-2 -top-2 w-4 h-4 bg-white rounded-full cursor-nw-resize"
                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, "resize-nw"); }}
                      />
                      <div
                        className="absolute -right-2 -top-2 w-4 h-4 bg-white rounded-full cursor-ne-resize"
                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, "resize-ne"); }}
                      />
                      <div
                        className="absolute -left-2 -bottom-2 w-4 h-4 bg-white rounded-full cursor-sw-resize"
                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, "resize-sw"); }}
                      />
                      <div
                        className="absolute -right-2 -bottom-2 w-4 h-4 bg-white rounded-full cursor-se-resize"
                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, "resize-se"); }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="w-64 space-y-6">
              {activeTab === "crop" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">Crop Area</h3>
                  <p className="text-xs text-slate-500">
                    Drag the corners or the center to adjust the crop area.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500">X Position</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.x)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, x: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Y Position</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.y)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, y: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Width %</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.width)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, width: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Height %</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.height)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, height: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "mask" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700">Shape Mask</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {maskOptions.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setMask(option.type)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                          mask === option.type
                            ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                      >
                        {option.icon}
                        <span className="text-xs">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "adjust" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">Adjustments</h3>
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Contrast</span>
                        <span>{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Saturation</span>
                        <span>{saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-600 mb-2">Object Fit</h4>
                    <div className="flex gap-2">
                      {(["cover", "contain", "fill"] as const).map((fit) => (
                        <button
                          key={fit}
                          onClick={() => setObjectFit(fit)}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                            objectFit === fit
                              ? "bg-cyan-100 text-cyan-700"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
