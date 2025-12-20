"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, GripVertical, Trash2, Type, Image, List, Code, Quote, Minus, LayoutGrid, BarChart3 } from "lucide-react";
import { type ContentBlock, type BlockType, generateBlockId } from "./types";
import BlockRenderer from "./BlockRenderer";
import type { Theme } from "~/lib/themes";

interface BlockEditorProps {
  blocks: ContentBlock[];
  theme: Theme;
  onChange: (blocks: ContentBlock[]) => void;
  isEditing?: boolean;
}

interface SlashMenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  { type: "heading", label: "Heading", description: "Large section heading", icon: <Type size={18} /> },
  { type: "paragraph", label: "Text", description: "Plain text paragraph", icon: <Type size={18} /> },
  { type: "list", label: "Bullet List", description: "Simple bullet list", icon: <List size={18} /> },
  { type: "image", label: "Image", description: "Upload or embed an image", icon: <Image size={18} /> },
  { type: "columns", label: "Columns", description: "Create a multi-column layout", icon: <LayoutGrid size={18} /> },
  { type: "quote", label: "Quote", description: "Capture a quote", icon: <Quote size={18} /> },
  { type: "code", label: "Code", description: "Code snippet with syntax highlighting", icon: <Code size={18} /> },
  { type: "divider", label: "Divider", description: "Visual separator", icon: <Minus size={18} /> },
  { type: "chart", label: "Chart", description: "Data visualization", icon: <BarChart3 size={18} /> },
];

export default function BlockEditor({ blocks, theme, onChange, isEditing = true }: BlockEditorProps) {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [insertAfterBlockId, setInsertAfterBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter slash menu items based on search
  const filteredMenuItems = SLASH_MENU_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create a new block of the specified type
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

  // Insert a block after the specified block ID
  const insertBlock = useCallback((type: BlockType, afterBlockId: string | null) => {
    const newBlock = createBlock(type);
    
    if (afterBlockId === null) {
      // Insert at the beginning
      onChange([newBlock, ...blocks]);
    } else {
      const index = blocks.findIndex(b => b.id === afterBlockId);
      if (index !== -1) {
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        onChange(newBlocks);
      }
    }
    
    setShowSlashMenu(false);
    setInsertAfterBlockId(null);
    setSearchQuery("");
  }, [blocks, onChange, createBlock]);

  // Delete a block
  const deleteBlock = useCallback((blockId: string) => {
    onChange(blocks.filter(b => b.id !== blockId));
  }, [blocks, onChange]);

  // Update a block
  const updateBlock = useCallback((updatedBlock: ContentBlock) => {
    onChange(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  }, [blocks, onChange]);

  // Handle drag and drop reordering
  const handleDragStart = useCallback((blockId: string) => {
    setDraggedBlockId(blockId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === targetBlockId) return;
  }, [draggedBlockId]);

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
        onChange(newBlocks);
      }
    }
    
    setDraggedBlockId(null);
  }, [blocks, draggedBlockId, onChange]);

  // Show slash menu
  const showAddMenu = useCallback((afterBlockId: string | null, position: { top: number; left: number }) => {
    setInsertAfterBlockId(afterBlockId);
    setSlashMenuPosition(position);
    setShowSlashMenu(true);
    setSearchQuery("");
  }, []);

  // Close slash menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSlashMenu && !(e.target as HTMLElement).closest('.slash-menu')) {
        setShowSlashMenu(false);
        setSearchQuery("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSlashMenu]);

  return (
    <div ref={containerRef} className="relative">
      {/* Add block button at the top */}
      {isEditing && (
        <div className="flex justify-center mb-4">
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              showAddMenu(null, { top: rect.bottom + 8, left: rect.left });
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Plus size={16} />
            Add block
          </button>
        </div>
      )}

      {/* Blocks */}
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`group relative ${draggedBlockId === block.id ? 'opacity-50' : ''}`}
            onMouseEnter={() => setHoveredBlockId(block.id)}
            onMouseLeave={() => setHoveredBlockId(null)}
            onDragOver={(e) => handleDragOver(e, block.id)}
            onDrop={() => handleDrop(block.id)}
          >
            {/* Block controls */}
            {isEditing && hoveredBlockId === block.id && (
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  draggable
                  onDragStart={() => handleDragStart(block.id)}
                  className="p-1 rounded hover:bg-slate-200 cursor-grab active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical size={16} className="text-slate-400" />
                </button>
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    showAddMenu(block.id, { top: rect.bottom + 8, left: rect.left });
                  }}
                  className="p-1 rounded hover:bg-slate-200"
                  title="Add block below"
                >
                  <Plus size={16} className="text-slate-400" />
                </button>
              </div>
            )}

            {/* Delete button */}
            {isEditing && hoveredBlockId === block.id && (
              <button
                onClick={() => deleteBlock(block.id)}
                className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete block"
              >
                <Trash2 size={16} className="text-red-400 hover:text-red-600" />
              </button>
            )}

            {/* Block content */}
            <BlockRenderer
              block={block}
              theme={theme}
              isEditing={isEditing}
              isHovered={hoveredBlockId === block.id}
              onUpdate={updateBlock}
            />
          </div>
        ))}
      </div>

      {/* Empty state */}
      {blocks.length === 0 && isEditing && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Plus size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-500 mb-2">No content yet</p>
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              showAddMenu(null, { top: rect.bottom + 8, left: rect.left - 100 });
            }}
            className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
          >
            Add your first block
          </button>
        </div>
      )}

      {/* Slash command menu */}
      {showSlashMenu && slashMenuPosition && (
        <div
          className="slash-menu fixed z-50 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocks..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border-0 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              autoFocus
            />
          </div>
          
          {/* Menu items */}
          <div className="max-h-64 overflow-y-auto p-1">
            {filteredMenuItems.map((item) => (
              <button
                key={item.type}
                onClick={() => insertBlock(item.type, insertAfterBlockId)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </button>
            ))}
            {filteredMenuItems.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No blocks found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
