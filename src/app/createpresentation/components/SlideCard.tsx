"use client";

import { useState } from "react";
import { GripVertical, Trash2, Edit3, Check, X } from "lucide-react";
import type { Slide } from "~/lib/dashboard/hooks/useOutlineStream";

interface SlideCardProps {
  slide: Slide;
  index: number;
  isStreaming: boolean;
  onEdit?: (index: number, slide: Slide) => void;
  onDelete?: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  isDraggedOver?: boolean;
  canDelete?: boolean;
}

export default function SlideCard({
  slide,
  index,
  isStreaming,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDraggedOver,
  canDelete,
}: SlideCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(slide.title);
  const [editedBullets, setEditedBullets] = useState(slide.bulletPoints?.join("\n") || "");

  const handleSave = () => {
    if (onEdit) {
      onEdit(index, {
        ...slide,
        title: editedTitle,
        bulletPoints: slide.type === "content" ? editedBullets.split("\n").filter((b) => b.trim()) : undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(slide.title);
    setEditedBullets(slide.bulletPoints?.join("\n") || "");
    setIsEditing(false);
  };

  const isTitle = slide.type === "title";

  return (
    <div
      draggable={!isStreaming && !isTitle && !isEditing}
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e)}
      onDrop={(e) => onDrop && onDrop(e, index)}
      className={`rounded-lg border bg-white/95 backdrop-blur-sm p-4 shadow-sm transition-all hover:shadow-md ${isDraggedOver ? "border-[#06b6d4] ring-2 ring-[#06b6d4]/20 shadow-lg" : "border-slate-200 hover:border-[#06b6d4]/40"
        } ${isTitle ? "bg-gradient-to-br from-[#1e3a8a]/5 to-[#06b6d4]/5 border-[#1e3a8a]/20" : ""}`}
    >
      <div className="flex items-start gap-3">
        {!isTitle && !isStreaming && (
          <div className="cursor-grab text-slate-300 hover:text-slate-500 mt-0.5">
            <GripVertical size={16} />
          </div>
        )}

        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isTitle
            ? "bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] text-white shadow-sm"
            : "bg-[#1e3a8a]/10 text-[#1e3a8a] font-semibold"
            }`}
        >
          <span className="text-xs font-bold">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2.5">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4]"
              />
              {!isTitle && (
                <textarea
                  value={editedBullets}
                  onChange={(e) => setEditedBullets(e.target.value)}
                  rows={3}
                  placeholder="One bullet point per line..."
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20 focus:border-[#06b6d4] resize-none"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#06b6d4] text-white text-xs font-medium hover:bg-[#0891b2] transition-colors"
                >
                  <Check size={13} /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className={`font-semibold text-[#1e3a8a] mb-1.5 leading-tight ${isTitle ? "text-base" : "text-sm"}`}>
                {slide.title}
              </h3>
              {isTitle && slide.subtitle && (
                <p className="text-sm text-slate-500 italic mt-1">{slide.subtitle}</p>
              )}
              {!isTitle && slide.bulletPoints && (
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {slide.bulletPoints.map((bullet, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-[#06b6d4] flex-shrink-0">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {!isStreaming && !isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-md text-slate-400 hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 transition-colors"
              title="Edit slide"
            >
              <Edit3 size={13} />
            </button>
            {canDelete && !isTitle && (
              <button
                onClick={() => onDelete && onDelete(index)}
                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete slide"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
