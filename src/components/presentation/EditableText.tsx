"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Type, Trash2 } from "lucide-react";

interface EditableTextProps {
  value: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onChange: (value: string) => void;
  onFinish: () => void;
  className?: string;
  style?: React.CSSProperties;
  isOwner: boolean;
  isHovered: boolean;
  onDelete?: () => void;
}

export default function EditableText({
  value,
  isEditing,
  onStartEdit,
  onChange,
  onFinish,
  className,
  style,
  isOwner,
  isHovered,
  onDelete,
}: EditableTextProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Use local state for editing to prevent re-render issues
  const [localValue, setLocalValue] = useState(value);
  
  // Sync local value when value prop changes and not editing
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // Initialize local value when starting to edit
  useEffect(() => {
    if (isEditing) {
      setLocalValue(value);
      // Focus and move cursor to end after a small delay to ensure the element is rendered
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Move cursor to end instead of selecting all text
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      });
    }
  }, [isEditing, value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  }, [onChange]);

  const handleFinish = useCallback(() => {
    onFinish();
  }, [onFinish]);

  if (isEditing) {
    return (
      <div className="relative">
        <textarea
          ref={inputRef}
          value={localValue}
          onChange={handleChange}
          onBlur={handleFinish}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleFinish();
            }
            if (e.key === "Escape") handleFinish();
          }}
          className={`${className} bg-white/90 backdrop-blur-sm rounded-lg p-3 resize-none w-full border-2 border-[#06b6d4] shadow-lg focus:outline-none`}
          style={{ ...style, minHeight: "60px", color: "#1e293b" }}
          rows={3}
        />
      </div>
    );
  }

  return (
    <div className="relative group/text" data-editable>
      <div
        className={`${className} cursor-pointer transition-all ${
          isOwner && isHovered
            ? "hover:bg-white/10 hover:ring-2 hover:ring-white/30 rounded-lg px-2 py-1 -mx-2 -my-1"
            : ""
        }`}
        style={style}
        onClick={isOwner ? onStartEdit : undefined}
      >
        {value}
      </div>
      {isOwner && isHovered && (
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/text:opacity-100 transition-opacity flex flex-col gap-1">
          <button
            onClick={onStartEdit}
            className="p-1.5 rounded-lg bg-white/90 shadow-md hover:bg-white transition-colors"
            title="Edit"
          >
            <Type size={12} className="text-slate-700" />
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-lg bg-white/90 shadow-md hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 size={12} className="text-red-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
