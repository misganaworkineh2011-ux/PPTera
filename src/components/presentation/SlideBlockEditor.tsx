"use client";

import { useState, useCallback } from "react";
import { Plus, Layers, LayoutGrid, Type, Image, List, Minus, Quote, Code, BarChart3, GripVertical, Trash2, Settings2 } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "./types";
import type { ContentBlock, BlockType } from "~/lib/blocks/types";
import { generateBlockId, isBlockBasedSlide, convertSlideToBlocks } from "~/lib/blocks";
import BlockRenderer from "~/lib/blocks/BlockRenderer";
import ImageEditor from "~/lib/blocks/ImageEditor";
import type { ImageBlock } from "~/lib/blocks/types";

interface SlideBlockEditorProps {
  slide: SlideData;
  theme: Theme;
  isOwner: boolean;
  isEditing: boolean;
  onUpdateSlide: (slide: SlideData) => void;
}

interface BlockMenuItem {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
}

const BLOCK_MENU_ITEMS: BlockMenuItem[] = [
  { type: "heading", label: "Heading", icon: <Type size={16} /> },
  { type: "paragraph", label: "Text", icon: <Type size={16} /> },
  { type: "list", label: "List", icon: <List size={16} /> },
  { type: "image", label: "Image", icon: <Image size={16} /> },
  { type: "columns", label: "Columns", icon: <LayoutGrid size={16} /> },
  { type: "quote", label: "Quote", icon: <Quote size={16} /> },
  { type: "code", label: "Code", icon: <Code size={16} /> },
  { type: "divider", label: "Divider", icon: <Minus size={16} /> },
  { type: "chart", label: "Chart", icon: <BarChart3 size={16} /> },
];

export default function SlideBlockEditor({
  slide,
  theme,
  isOwner,
  isEditing,
  onUpdateSlide,
}: SlideBlockEditorProps) {
  // Get or convert blocks
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    if (isBlockBasedSlide(slide) && slide.blocks) {
      return slide.blocks;
    }
    return convertSlideToBlocks(slide);
  });

  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null); // block id to insert after, or "start"
  const [editingImageBlock, setEditingImageBlock] = useState<ImageBlock | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  // Update parent when blocks change
  const updateBlocks = useCallback((newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
    onUpdateSlide({
      ...slide,
      blocks: newBlocks,
      layoutMode: "flow",
    });
  }, [slide, onUpdateSlide]);

  // Create a new block
  const createBlock = useCallback((type: BlockType): ContentBlock => {
    const id = generateBlockId();
    
    switch (type) {
      case "heading":
        return { id, type: "heading", content: "New Heading", level: 2 };
      case "paragraph":
        return { id, type: "paragraph", content: "Start typing..." };
      case "list":
        return { id, type: "list", items: [{ id: generateBlockId(), content: "List item" }], listType: "bullet" };
      case "image":
        return { id, type: "image", url: "", alt: "Image" };
      case "columns":
        return { 
          id, 
          type: "columns", 
          columns: [
            { id: generateBlockId(), width: 50, blocks: [] },
            { id: generateBlockId(), width: 50, blocks: [] }
          ]
        };
      case "quote":
        return { id, type: "quote", content: "Enter quote..." };
      case "code":
        return { id, type: "code", content: "// Your code here", language: "javascript" };
      case "divider":
        return { id, type: "divider", variant: "solid" };
      case "callout":
        return { id, type: "callout", content: "Callout text", variant: "info" };
      case "chart":
        return { 
          id, 
          type: "chart", 
          chartType: "bar",
          data: { labels: ["A", "B", "C"], datasets: [{ label: "Data", data: [10, 20, 30] }] }
        };
      case "embed":
        return { id, type: "embed", url: "", embedType: "generic" };
      default:
        return { id, type: "paragraph", content: "" };
    }
  }, []);

  // Insert block
  const insertBlock = useCallback((type: BlockType, afterBlockId: string | null) => {
    const newBlock = createBlock(type);
    
    if (afterBlockId === null || afterBlockId === "start") {
      updateBlocks([newBlock, ...blocks]);
    } else {
      const index = blocks.findIndex(b => b.id === afterBlockId);
      if (index !== -1) {
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        updateBlocks(newBlocks);
      }
    }
    
    setShowAddMenu(null);
  }, [blocks, createBlock, updateBlocks]);

  // Delete block
  const deleteBlock = useCallback((blockId: string) => {
    updateBlocks(blocks.filter(b => b.id !== blockId));
  }, [blocks, updateBlocks]);

  // Update block
  const updateBlock = useCallback((updatedBlock: ContentBlock) => {
    updateBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  }, [blocks, updateBlocks]);

  // Drag and drop
  const handleDragStart = useCallback((blockId: string) => {
    setDraggedBlockId(blockId);
  }, []);

  const handleDrop = useCallback((targetBlockId: string) => {
    if (!draggedBlockId || draggedBlockId === targetBlockId) {
      setDraggedBlockId(null);
      return;
    }

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlockId);
    const targetIndex = blocks.findIndex(b => b.id === targetBlockId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newBlocks = [...blocks];
      const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
      if (draggedBlock) {
        newBlocks.splice(targetIndex, 0, draggedBlock);
        updateBlocks(newBlocks);
      }
    }
    
    setDraggedBlockId(null);
  }, [blocks, draggedBlockId, updateBlocks]);

  const canEdit = isOwner && isEditing;

  return (
    <div className="relative h-full w-full p-8 overflow-auto">
      {/* Add block at start */}
      {canEdit && blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: theme.colors.primary + "20" }}>
            <Layers size={32} style={{ color: theme.colors.primary }} />
          </div>
          <p className="text-lg mb-4" style={{ color: theme.colors.textMuted }}>
            This slide is empty
          </p>
          <button
            onClick={() => setShowAddMenu("start")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: theme.colors.primary,
              color: "#fff"
            }}
          >
            <Plus size={18} />
            Add content
          </button>
        </div>
      )}

      {/* Blocks */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`group relative ${draggedBlockId === block.id ? "opacity-50" : ""}`}
            onMouseEnter={() => setHoveredBlockId(block.id)}
            onMouseLeave={() => setHoveredBlockId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(block.id)}
          >
            {/* Block controls - left side */}
            {canEdit && hoveredBlockId === block.id && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  draggable
                  onDragStart={() => handleDragStart(block.id)}
                  className="p-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
                  style={{ backgroundColor: theme.colors.backgroundAlt }}
                  title="Drag to reorder"
                >
                  <GripVertical size={14} style={{ color: theme.colors.textMuted }} />
                </button>
                <button
                  onClick={() => setShowAddMenu(block.id)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: theme.colors.backgroundAlt }}
                  title="Add block below"
                >
                  <Plus size={14} style={{ color: theme.colors.textMuted }} />
                </button>
              </div>
            )}

            {/* Block controls - right side */}
            {canEdit && hoveredBlockId === block.id && (
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {block.type === "image" && (
                  <button
                    onClick={() => setEditingImageBlock(block as ImageBlock)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: theme.colors.backgroundAlt }}
                    title="Edit image"
                  >
                    <Settings2 size={14} style={{ color: theme.colors.textMuted }} />
                  </button>
                )}
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
                  title="Delete block"
                >
                  <Trash2 size={14} className="text-red-400 hover:text-red-500" />
                </button>
              </div>
            )}

            {/* Block content */}
            <div
              className={`rounded-lg transition-all ${
                hoveredBlockId === block.id && canEdit 
                  ? "ring-2" 
                  : ""
              }`}
              style={{
                boxShadow: hoveredBlockId === block.id && canEdit 
                  ? `0 0 0 2px ${theme.colors.primary}40` 
                  : "none",
              }}
            >
              <BlockRenderer
                block={block}
                theme={theme}
                isEditing={canEdit}
                isHovered={hoveredBlockId === block.id}
                onUpdate={updateBlock}
              />
            </div>

            {/* Add block menu (inline) */}
            {showAddMenu === block.id && (
              <div 
                className="absolute left-0 right-0 mt-2 z-20"
                style={{ top: "100%" }}
              >
                <AddBlockMenu
                  theme={theme}
                  onSelect={(type) => insertBlock(type, block.id)}
                  onClose={() => setShowAddMenu(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add block at start menu */}
      {showAddMenu === "start" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <AddBlockMenu
            theme={theme}
            onSelect={(type) => insertBlock(type, null)}
            onClose={() => setShowAddMenu(null)}
          />
        </div>
      )}

      {/* Floating add button when there are blocks */}
      {canEdit && blocks.length > 0 && !showAddMenu && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAddMenu(blocks[blocks.length - 1]?.id || "start")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all opacity-50 hover:opacity-100"
            style={{ 
              backgroundColor: theme.colors.backgroundAlt,
              color: theme.colors.textMuted
            }}
          >
            <Plus size={14} />
            Add block
          </button>
        </div>
      )}

      {/* Image Editor Modal */}
      {editingImageBlock && (
        <ImageEditor
          block={editingImageBlock}
          onSave={(updatedBlock) => {
            updateBlock(updatedBlock);
            setEditingImageBlock(null);
          }}
          onCancel={() => setEditingImageBlock(null)}
        />
      )}
    </div>
  );
}

// Add Block Menu Component
function AddBlockMenu({
  theme,
  onSelect,
  onClose,
}: {
  theme: Theme;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-10" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <div 
        className="relative z-20 w-64 rounded-xl shadow-2xl border overflow-hidden"
        style={{ 
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border
        }}
      >
        <div className="p-2 border-b" style={{ borderColor: theme.colors.border }}>
          <p className="text-xs font-semibold uppercase tracking-wide px-2" style={{ color: theme.colors.textMuted }}>
            Add Block
          </p>
        </div>
        <div className="p-1 max-h-64 overflow-y-auto">
          {BLOCK_MENU_ITEMS.map((item) => (
            <button
              key={item.type}
              onClick={() => onSelect(item.type)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left"
              style={{ color: theme.colors.text }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.backgroundAlt}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.colors.primary + "20" }}
              >
                <span style={{ color: theme.colors.primary }}>{item.icon}</span>
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
