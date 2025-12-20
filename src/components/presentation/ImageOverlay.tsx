"use client";

import { useState } from "react";
import { Crop, Move, ZoomIn, Trash2, Replace, Settings2 } from "lucide-react";

interface ImageOverlayProps {
  imageUrl: string;
  alt: string;
  isOwner: boolean;
  isHovered: boolean;
  onReplace?: () => void;
  onRemove?: () => void;
  onEdit?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export default function ImageOverlay({
  imageUrl,
  alt,
  isOwner,
  isHovered,
  onReplace,
  onRemove,
  onEdit,
  className = "",
  children,
}: ImageOverlayProps) {
  const [showControls, setShowControls] = useState(false);

  const shouldShowControls = isOwner && (isHovered || showControls);

  return (
    <div 
      className={`relative group/image ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {children}
      
      {/* WYSIWYG Controls Overlay */}
      {shouldShowControls && (
        <>
          {/* Subtle border highlight */}
          <div className="absolute inset-0 ring-2 ring-cyan-500/50 ring-inset pointer-events-none rounded-inherit z-10" />
          
          {/* Control buttons */}
          <div className="absolute top-2 right-2 flex gap-1 z-20">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all shadow-lg"
                title="Edit Image"
              >
                <Settings2 size={16} />
              </button>
            )}
            {onReplace && (
              <button
                onClick={(e) => { e.stopPropagation(); onReplace(); }}
                className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all shadow-lg"
                title="Replace Image"
              >
                <Replace size={16} />
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-2 rounded-lg bg-black/60 hover:bg-red-600/80 text-white backdrop-blur-sm transition-all shadow-lg"
                title="Remove Image"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Drag handle indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs z-20">
            <Move size={12} />
            <span>Drag to reposition</span>
          </div>

          {/* Corner resize handles */}
          <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-20">
            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full shadow-md" />
          </div>
          <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-20">
            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-md" />
          </div>
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-20">
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-white rounded-full shadow-md" />
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20">
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-white rounded-full shadow-md" />
          </div>
        </>
      )}
    </div>
  );
}

// Simpler version for inline use
export function ImageEditButton({
  onClick,
  position = "top-right",
}: {
  onClick: () => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}) {
  const positionClasses = {
    "top-right": "top-2 right-2",
    "top-left": "top-2 left-2",
    "bottom-right": "bottom-2 right-2",
    "bottom-left": "bottom-2 left-2",
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`absolute ${positionClasses[position]} p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all shadow-lg opacity-0 group-hover:opacity-100 z-20`}
      title="Edit Image"
    >
      <Settings2 size={16} />
    </button>
  );
}
