"use client";

import {
  MoreHorizontal,
  LayoutGrid,
  Copy,
  MoveUp,
  MoveDown,
  Trash2,
  PlusCircle,
  ImagePlus,
} from "lucide-react";

interface SlideMenuProps {
  index: number;
  totalSlides: number;
  showMenu: boolean;
  imageCount: number;
  onToggleMenu: () => void;
  onChangeLayout: () => void;
  onDuplicate: () => void;
  onAddSlide: () => void;
  onAddImage: () => void;
  onManageImages: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function SlideMenu({
  index,
  totalSlides,
  showMenu,
  imageCount,
  onToggleMenu,
  onChangeLayout,
  onDuplicate,
  onAddSlide,
  onAddImage,
  onMoveUp,
  onMoveDown,
  onDelete,
}: SlideMenuProps) {
  const handleAction =
    (action: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      action();
    };

  return (
    <div
      data-slide-menu
      className="absolute top-4 right-4 z-30"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={handleAction(onToggleMenu)}
        className="p-2 rounded-lg bg-zinc-900/90 backdrop-blur-sm shadow-lg hover:bg-zinc-800 transition-all border border-zinc-700"
      >
        <MoreHorizontal size={18} className="text-zinc-300" />
      </button>
      {showMenu && (
        <div
          data-slide-menu
          className="absolute top-full right-0 mt-2 w-52 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-700 py-2 z-50"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleAction(onAddSlide)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-emerald-400 hover:bg-emerald-900/30"
          >
            <PlusCircle size={16} />
            Add Slide After
          </button>
          <div className="border-t border-zinc-700 my-1" />
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleAction(onAddImage)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-cyan-400 hover:bg-cyan-900/30"
          >
            <ImagePlus size={16} />
            {imageCount > 0 ? `Manage Images (${imageCount})` : "Add Image"}
          </button>
          <div className="border-t border-zinc-700 my-1" />
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleAction(onChangeLayout)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <LayoutGrid size={16} />
            Change Layout
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleAction(onDuplicate)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
          >
            <Copy size={16} />
            Duplicate Slide
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleAction(onMoveUp)}
            disabled={index === 0}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MoveUp size={16} />
            Move Up
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleAction(onMoveDown)}
            disabled={index === totalSlides - 1}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MoveDown size={16} />
            Move Down
          </button>
          <div className="border-t border-zinc-700 my-1" />
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleAction(onDelete)}
            disabled={totalSlides <= 1}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            Delete Slide
          </button>
        </div>
      )}
    </div>
  );
}
