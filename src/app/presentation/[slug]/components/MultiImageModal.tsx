"use client";

import { useState } from "react";
import { X, ImagePlus, Trash2, CheckCircle2, Loader2, Settings2 } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideImage } from "~/components/presentation/types";
import { getThemeType } from "./types";

interface MultiImageModalProps {
  images: SlideImage[];
  imageUrl: string;
  editingIndex: number | null;
  isLoading: boolean;
  theme: Theme;
  onUrlChange: (url: string) => void;
  onAddImage: () => void;
  onUpdateImage: (idx: number) => void;
  onRemoveImage: (idx: number) => void;
  onReorderImages: (from: number, to: number) => void;
  onEditImage: (idx: number) => void;
  onCancelEdit: () => void;
  onClose: () => void;
  onOpenWysiwygEditor?: (idx: number) => void;
}

export function MultiImageModal({
  images,
  imageUrl,
  editingIndex,
  isLoading,
  theme,
  onUrlChange,
  onAddImage,
  onUpdateImage,
  onRemoveImage,
  onReorderImages,
  onEditImage,
  onCancelEdit,
  onClose,
  onOpenWysiwygEditor,
}: MultiImageModalProps) {
  const themeType = getThemeType(theme);
  const isDark = themeType !== "light" && themeType !== "corporate" && themeType !== "custom-light";
  const isEditing = editingIndex !== null;
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Theme-aware colors
  const colors = isDark ? {
    bg: theme.pageBackground || theme.colors.background,
    surface: theme.colors.surface,
    border: theme.colors.border,
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    hoverBg: theme.colors.surfaceHover || "rgba(255,255,255,0.1)",
  } : {
    bg: "#ffffff",
    surface: "#f8fafc",
    border: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
    hoverBg: "#f1f5f9",
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onReorderImages(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl"
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <h3
            className="text-lg font-semibold"
            style={{ color: colors.text }}
          >
            Manage Images {images.length > 0 && `(${images.length})`}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Existing images grid with drag-and-drop */}
          {images.length > 0 && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                Current Images{" "}
                <span className="text-xs font-normal opacity-70">
                  (drag to reorder)
                </span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`relative group rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                      editingIndex === idx ? "ring-2" : ""
                    } ${draggedIndex === idx ? "opacity-50 scale-95" : ""} ${
                      dragOverIndex === idx ? "ring-2 ring-cyan-500 scale-105" : ""
                    }`}
                    style={{
                      border: `1px solid ${editingIndex === idx ? theme.colors.primary : colors.border}`,
                    }}
                  >
                    <div className="aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {onOpenWysiwygEditor && (
                        <button
                          onClick={() => onOpenWysiwygEditor(idx)}
                          className="p-2 rounded-lg bg-cyan-500/80 hover:bg-cyan-500 text-white transition-colors"
                          title="Edit Image (Crop, Mask, Adjust)"
                        >
                          <Settings2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onEditImage(idx)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Replace URL"
                      >
                        <ImagePlus size={16} />
                      </button>
                      <button
                        onClick={() => onRemoveImage(idx)}
                        className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div
                      className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)",
                        color: isDark ? "#ffffff" : colors.text,
                      }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit image form */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
            }}
          >
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text }}
            >
              {isEditing
                ? `Edit Image ${editingIndex! + 1}`
                : "Add New Image"}
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{
                backgroundColor: isDark ? theme.colors.background : "#ffffff",
                borderColor: colors.border,
                color: colors.text,
                ["--tw-ring-color" as string]: theme.colors.primary,
              } as React.CSSProperties}
            />
            <p
              className="mt-2 text-xs"
              style={{ color: colors.textMuted }}
            >
              Paste a direct link to an image (JPG, PNG, WebP). Add multiple
              images for gallery layouts.
            </p>

            {imageUrl && (
              <div 
                className="mt-3 aspect-video rounded-lg overflow-hidden border border-dashed max-w-xs"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => onUpdateImage(editingIndex!)}
                    disabled={!imageUrl || isLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Update
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-4 py-2 rounded-lg transition-colors"
                    style={{ color: colors.textMuted }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={onAddImage}
                  disabled={!imageUrl || isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ImagePlus size={16} />
                  )}
                  Add Image
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-end p-4"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
