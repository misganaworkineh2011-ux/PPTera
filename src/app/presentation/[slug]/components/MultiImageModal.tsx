"use client";

import { useState } from "react";
import { X, ImagePlus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
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
}: MultiImageModalProps) {
  const themeType = getThemeType(theme);
  const isDark = themeType !== "light";
  const isEditing = editingIndex !== null;
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
        className={`w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? "bg-zinc-900 border border-zinc-700" : "bg-white border border-slate-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${isDark ? "border-zinc-700" : "border-slate-200"}`}
        >
          <h3
            className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Manage Images {images.length > 0 && `(${images.length})`}
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Existing images grid with drag-and-drop */}
          {images.length > 0 && (
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? "text-zinc-300" : "text-slate-700"}`}
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
                    className={`relative group rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing transition-all ${
                      editingIndex === idx ? "ring-2" : ""
                    } ${draggedIndex === idx ? "opacity-50 scale-95" : ""} ${
                      dragOverIndex === idx ? "ring-2 ring-cyan-500 scale-105" : ""
                    } ${isDark ? "border-zinc-700" : "border-slate-200"}`}
                    style={
                      editingIndex === idx
                        ? { borderColor: theme.colors.primary }
                        : {}
                    }
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
                      <button
                        onClick={() => onEditImage(idx)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Edit"
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
                      className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium ${isDark ? "bg-black/60 text-white" : "bg-white/80 text-slate-700"}`}
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
            className={`p-4 rounded-lg border ${isDark ? "border-zinc-700 bg-zinc-800/50" : "border-slate-200 bg-slate-50"}`}
          >
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? "text-zinc-300" : "text-slate-700"}`}
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
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isDark
                  ? "bg-zinc-800 border-zinc-600 text-white placeholder-zinc-500 focus:border-amber-500"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-500"
              } focus:outline-none focus:ring-2 focus:ring-opacity-20`}
              style={
                { ["--tw-ring-color" as string]: theme.colors.primary } as React.CSSProperties
              }
            />
            <p
              className={`mt-2 text-xs ${isDark ? "text-zinc-500" : "text-slate-500"}`}
            >
              Paste a direct link to an image (JPG, PNG, WebP). Add multiple
              images for gallery layouts.
            </p>

            {imageUrl && (
              <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-zinc-800 border border-dashed border-zinc-600 max-w-xs">
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
                    className={`px-4 py-2 rounded-lg transition-colors ${isDark ? "text-zinc-400 hover:bg-zinc-700" : "text-slate-600 hover:bg-slate-200"}`}
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
          className={`flex items-center justify-end p-4 border-t ${isDark ? "border-zinc-700" : "border-slate-200"}`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors ${isDark ? "text-zinc-400 hover:bg-zinc-800" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
