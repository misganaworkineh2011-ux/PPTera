"use client";

import { useState } from "react";
import { GripVertical, Trash2, Edit3, Check, X } from "lucide-react";
import type { Slide } from "~/lib/dashboard/hooks/useOutlineStream";

// Bullets should be strings, but the model occasionally returns structured
// objects (e.g. { label, text }). Coerce to a readable string so React never
// gets handed an object to render.
function bulletToString(bullet: unknown): string {
  if (typeof bullet === "string") return bullet;
  if (bullet && typeof bullet === "object") {
    const o = bullet as { label?: string; text?: string; description?: string };
    const body = o.text ?? o.description ?? "";
    if (o.label) return body ? `${o.label}: ${body}` : o.label;
    return body;
  }
  return String(bullet ?? "");
}

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
  const [editedBullets, setEditedBullets] = useState((slide.bulletPoints ?? []).map(bulletToString).join("\n"));

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
    setEditedBullets((slide.bulletPoints ?? []).map(bulletToString).join("\n"));
    setIsEditing(false);
  };

  const isTitle = slide.type === "title";

  return (
    <div
      draggable={!isStreaming && !isTitle && !isEditing}
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e)}
      onDrop={(e) => onDrop && onDrop(e, index)}
      className={`rounded-lg border bg-white/95 backdrop-blur-sm p-4 shadow-sm transition-all hover:shadow-md ${isDraggedOver ? "border-[#14b8a6] ring-2 ring-[#14b8a6]/20 shadow-lg" : "border-slate-200 hover:border-[#14b8a6]/40"
        } ${isTitle ? "bg-gradient-to-br from-[#0f766e]/5 to-[#14b8a6]/5 border-[#0f766e]/20" : ""}`}
    >
      <div className="flex items-start gap-3">
        {!isTitle && !isStreaming && (
          <div className="cursor-grab text-slate-300 hover:text-slate-500 mt-0.5">
            <GripVertical size={16} />
          </div>
        )}

        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isTitle
            ? "bg-gradient-to-br from-[#0f766e] to-[#14b8a6] text-white shadow-sm"
            : "bg-[#0f766e]/10 text-[#0f766e] font-semibold"
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
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]"
              />
              {!isTitle && (
                <textarea
                  value={editedBullets}
                  onChange={(e) => setEditedBullets(e.target.value)}
                  rows={3}
                  placeholder="One bullet point per line..."
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6] resize-none"
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#14b8a6] text-white text-xs font-medium hover:bg-[#0d9488] transition-colors"
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
              <h3 className={`font-semibold text-[#0f766e] mb-1.5 leading-tight ${isTitle ? "text-base" : "text-sm"}`}>
                {slide.title}
              </h3>
              {isTitle && slide.subtitle && (
                <p className="text-sm text-slate-500 italic mt-1">{slide.subtitle}</p>
              )}
              {!isTitle && slide.bulletPoints && (
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {slide.bulletPoints.map((bullet, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-[#14b8a6] flex-shrink-0">•</span>
                      <span>{bulletToString(bullet)}</span>
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
              className="p-1.5 rounded-md text-slate-400 hover:text-[#14b8a6] hover:bg-[#14b8a6]/10 transition-colors"
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
