"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Check, Crop, ZoomIn, RotateCcw } from "lucide-react";
import type { ImageBlock } from "./types";
import type { Theme } from "~/lib/themes";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";

interface ImageEditorProps {
  block: ImageBlock;
  onSave: (block: ImageBlock) => void;
  onCancel: () => void;
  theme?: Theme;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Helper to determine if a color is dark
function isColorDark(hexColor: string): boolean {
  if (!hexColor || !hexColor.startsWith("#")) return true;
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export default function ImageEditor({ block, onSave, onCancel, theme }: ImageEditorProps) {
  const [activeTab, setActiveTab] = useState<"crop" | "adjust">("crop");
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

  const imageStyle: React.CSSProperties = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    objectFit,
  };

  // Theme-aware colors using the helper
  const modalColors = theme ? getModalColors(theme) : null;
  const isDark = modalColors?.isDark ?? (theme ? isColorDark(theme.colors.background) : false);
  const colors = {
    bg: modalColors?.bg || theme?.colors.background || "#ffffff",
    surface: modalColors?.surface || theme?.colors.surface || "#f8fafc",
    border: modalColors?.border || theme?.colors.border || "#e2e8f0",
    text: modalColors?.text || theme?.colors.text || "#0f172a",
    textMuted: modalColors?.textMuted || theme?.colors.textMuted || "#64748b",
    primary: theme?.colors.primary || "#0891b2",
    accent: theme?.colors.accent || "#06b6d4",
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ 
          background: colors.bg,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>Edit Image</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{ 
                color: colors.textMuted,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.surface}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              <Check size={18} />
              Save
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <button
            onClick={() => setActiveTab("crop")}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors"
            style={{
              backgroundColor: activeTab === "crop" ? colors.surface : "transparent",
              color: activeTab === "crop" ? colors.text : colors.textMuted,
              borderBottom: activeTab === "crop" ? `2px solid ${colors.primary}` : "2px solid transparent",
            }}
          >
            <Crop size={18} />
            Crop
          </button>
          <button
            onClick={() => setActiveTab("adjust")}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors"
            style={{
              backgroundColor: activeTab === "adjust" ? colors.surface : "transparent",
              color: activeTab === "adjust" ? colors.text : colors.textMuted,
              borderBottom: activeTab === "adjust" ? `2px solid ${colors.primary}` : "2px solid transparent",
            }}
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
                className="relative aspect-video rounded-xl overflow-hidden"
                style={{ backgroundColor: colors.surface }}
              >
                <img
                  ref={imageRef}
                  src={block.url}
                  alt={block.alt}
                  className="w-full h-full"
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
                  <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Crop Area</h3>
                  <p className="text-xs" style={{ color: colors.textMuted }}>
                    Drag the corners or the center to adjust the crop area.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs" style={{ color: colors.textMuted }}>X Position</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.x)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, x: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ 
                          backgroundColor: colors.surface, 
                          border: `1px solid ${colors.border}`,
                          color: colors.text,
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: colors.textMuted }}>Y Position</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.y)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, y: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ 
                          backgroundColor: colors.surface, 
                          border: `1px solid ${colors.border}`,
                          color: colors.text,
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: colors.textMuted }}>Width %</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.width)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, width: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ 
                          backgroundColor: colors.surface, 
                          border: `1px solid ${colors.border}`,
                          color: colors.text,
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs" style={{ color: colors.textMuted }}>Height %</label>
                      <input
                        type="number"
                        value={Math.round(cropArea.height)}
                        onChange={(e) => setCropArea(prev => ({ ...prev, height: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ 
                          backgroundColor: colors.surface, 
                          border: `1px solid ${colors.border}`,
                          color: colors.text,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "adjust" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Adjustments</h3>
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                      style={{ color: colors.textMuted }}
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: colors.textMuted }}>
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full"
                        style={{ accentColor: colors.primary }}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: colors.textMuted }}>
                        <span>Contrast</span>
                        <span>{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full"
                        style={{ accentColor: colors.primary }}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: colors.textMuted }}>
                        <span>Saturation</span>
                        <span>{saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full"
                        style={{ accentColor: colors.primary }}
                      />
                    </div>
                  </div>

                  <div className="pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                    <h4 className="text-xs font-semibold mb-2" style={{ color: colors.textMuted }}>Object Fit</h4>
                    <div className="flex gap-2">
                      {(["cover", "contain", "fill"] as const).map((fit) => (
                        <button
                          key={fit}
                          onClick={() => setObjectFit(fit)}
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors"
                          style={{
                            backgroundColor: objectFit === fit ? `${colors.primary}20` : colors.surface,
                            color: objectFit === fit ? colors.primary : colors.textMuted,
                          }}
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
