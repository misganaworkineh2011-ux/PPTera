"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Type,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Code,
  Highlighter,
  Palette,
  ChevronDown,
  Undo,
  Redo,
  RemoveFormatting,
  Sparkles,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface EditableTextProps {
  value: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onChange: (value: string) => void;
  onFinish: () => void;
  className?: string;
  style?: React.CSSProperties;
  isOwner: boolean;
  isHovered?: boolean;
  onDelete?: () => void;
}

interface ToolbarPosition {
  top: number;
  left: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TEXT_COLORS = [
  { name: "Default", value: "" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", value: "" },
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Purple", value: "#ddd6fe" },
];

const HEADING_OPTIONS = [
  { label: "H1", tag: "h1" },
  { label: "H2", tag: "h2" },
  { label: "H3", tag: "h3" },
  { label: "P", tag: "p" },
];

const TOOLBAR_HEIGHT = 44;
const TOOLBAR_GAP = 8;

// ============================================================================
// TOOLBAR BUTTON
// ============================================================================

const ToolbarButton = ({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    title={title}
    className="p-1.5 rounded transition-colors hover:bg-slate-100 text-slate-600"
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-5 bg-slate-200 mx-1" />;

// ============================================================================
// FLOATING TOOLBAR
// ============================================================================

interface FloatingToolbarProps {
  position: ToolbarPosition;
  onCommand: (cmd: string, value?: string) => void;
}

function FloatingToolbar({ position, onCommand }: FloatingToolbarProps) {
  const [activeMenu, setActiveMenu] = useState<"heading" | "color" | "highlight" | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menu: "heading" | "color" | "highlight") => {
    if (activeMenu === menu) {
      setActiveMenu(null);
      return;
    }
    const button = buttonRefs.current[menu];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
    setActiveMenu(menu);
  };

  const renderDropdown = (content: React.ReactNode) => {
    if (!activeMenu) return null;
    return createPortal(
      <div
        className="fixed z-[999999] bg-white rounded-lg shadow-xl border border-slate-200 p-2"
        style={{ top: menuPosition.top, left: menuPosition.left }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {content}
      </div>,
      document.body
    );
  };

  return (
    <div
      ref={toolbarRef}
      className="fixed z-[99999] flex items-center gap-0.5 px-2 py-1 bg-white rounded-lg shadow-xl border border-slate-200"
      style={{ top: position.top, left: position.left, transform: "translateX(-50%)" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Heading */}
      <button
        ref={(el) => { buttonRefs.current["heading"] = el; }}
        type="button"
        onMouseDown={(e) => { e.preventDefault(); toggleMenu("heading"); }}
        className="flex items-center gap-0.5 px-2 py-1 rounded hover:bg-slate-100 text-slate-600 text-sm font-medium"
      >
        <span className="w-6">H</span>
        <ChevronDown size={12} />
      </button>

      {activeMenu === "heading" && renderDropdown(
        <div className="min-w-[80px]">
          {HEADING_OPTIONS.map((opt) => (
            <button
              key={opt.tag}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onCommand("formatBlock", opt.tag); setActiveMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-sm rounded"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <ToolbarDivider />

      {/* Text Color */}
      <button
        ref={(el) => { buttonRefs.current["color"] = el; }}
        type="button"
        onMouseDown={(e) => { e.preventDefault(); toggleMenu("color"); }}
        className="flex items-center gap-0.5 p-1.5 rounded hover:bg-slate-100 text-slate-600"
        title="Text Color"
      >
        <Palette size={15} />
        <ChevronDown size={10} />
      </button>

      {activeMenu === "color" && renderDropdown(
        <div className="grid grid-cols-5 gap-1">
          {TEXT_COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onCommand("foreColor", c.value || "#000000"); setActiveMenu(null); }}
              title={c.name}
              className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: c.value || "#fff" }}
            />
          ))}
        </div>
      )}

      <ToolbarDivider />

      <ToolbarButton onClick={() => onCommand("bold")} title="Bold"><Bold size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => onCommand("italic")} title="Italic"><Italic size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => onCommand("underline")} title="Underline"><Underline size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => onCommand("strikeThrough")} title="Strikethrough"><Strikethrough size={15} /></ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onCommand("code")} title="Code"><Code size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => onCommand("removeFormat")} title="Clear"><RemoveFormatting size={15} /></ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onCommand("createLink")} title="Link"><Link2 size={15} /></ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onCommand("insertUnorderedList")} title="Bullet List"><List size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => onCommand("insertOrderedList")} title="Numbered List"><ListOrdered size={15} /></ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => onCommand("justifyLeft")} title="Left"><AlignLeft size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => onCommand("justifyCenter")} title="Center"><AlignCenter size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => onCommand("justifyRight")} title="Right"><AlignRight size={15} /></ToolbarButton>

      <ToolbarDivider />

      {/* Highlight */}
      <button
        ref={(el) => { buttonRefs.current["highlight"] = el; }}
        type="button"
        onMouseDown={(e) => { e.preventDefault(); toggleMenu("highlight"); }}
        className="flex items-center gap-0.5 p-1.5 rounded hover:bg-slate-100 text-slate-600"
        title="Highlight"
      >
        <Highlighter size={15} />
        <ChevronDown size={10} />
      </button>

      {activeMenu === "highlight" && renderDropdown(
        <div className="grid grid-cols-3 gap-1">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onCommand("hiliteColor", c.value || "transparent"); setActiveMenu(null); }}
              title={c.name}
              className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: c.value || "#fff" }}
            />
          ))}
        </div>
      )}

      <ToolbarDivider />

      <ToolbarButton onClick={() => onCommand("undo")} title="Undo"><Undo size={15} /></ToolbarButton>
      <ToolbarButton onClick={() => onCommand("redo")} title="Redo"><Redo size={15} /></ToolbarButton>

      <ToolbarDivider />

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        title="AI Visualize"
        className="flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:opacity-90"
      >
        <Sparkles size={12} />
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EditableText({
  value,
  isEditing,
  onStartEdit,
  onChange,
  onFinish,
  className = "",
  style,
  isOwner,
  onDelete,
}: EditableTextProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ top: 0, left: 0 });
  const initializedRef = useRef(false);

  // Initialize editor content ONLY when editing starts (not on every render)
  useEffect(() => {
    if (isEditing && editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = value;
      editorRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      initializedRef.current = true;
    }
    if (!isEditing) {
      setShowToolbar(false);
      initializedRef.current = false;
    }
  }, [isEditing, value]);

  // Calculate toolbar position
  const updateToolbarPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const centerX = rect.left + rect.width / 2;
    let top = rect.top - TOOLBAR_HEIGHT - TOOLBAR_GAP;
    if (top < 10) top = rect.bottom + TOOLBAR_GAP;

    const left = Math.max(200, Math.min(centerX, window.innerWidth - 200));
    return { top, left };
  }, []);

  // Handle selection changes
  const handleSelectionChange = useCallback(() => {
    if (!isEditing || !editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const isInEditor = editorRef.current.contains(selection.anchorNode);
    const hasText = !selection.isCollapsed && selection.toString().trim().length > 0;

    if (isInEditor && hasText) {
      const pos = updateToolbarPosition();
      if (pos) {
        setToolbarPosition(pos);
        setShowToolbar(true);
      }
    } else {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.toString().trim().length === 0) {
          setShowToolbar(false);
        }
      }, 100);
    }
  }, [isEditing, updateToolbarPosition]);

  // Listen for selection changes
  useEffect(() => {
    if (!isEditing) return;
    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("scroll", handleSelectionChange, true);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("scroll", handleSelectionChange, true);
    };
  }, [isEditing, handleSelectionChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleFinish = useCallback(() => {
    setShowToolbar(false);
    onFinish();
  }, [onFinish]);

  const handleCommand = useCallback((cmd: string, cmdValue?: string) => {
    if (cmd === "createLink") {
      const url = prompt("Enter URL:");
      if (url) document.execCommand("createLink", false, url);
    } else if (cmd === "code") {
      const sel = window.getSelection();
      const text = sel?.toString() || "code";
      document.execCommand("insertHTML", false, `<code class="bg-slate-200 px-1 rounded text-sm font-mono">${text}</code>`);
    } else {
      document.execCommand(cmd, false, cmdValue);
    }
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Don't interfere with normal typing - only handle special keys
    if (e.key === "Escape") { handleFinish(); return; }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFinish(); return; }
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b": e.preventDefault(); handleCommand("bold"); break;
        case "i": e.preventDefault(); handleCommand("italic"); break;
        case "u": e.preventDefault(); handleCommand("underline"); break;
        case "k": e.preventDefault(); handleCommand("createLink"); break;
        case "z": e.preventDefault(); handleCommand(e.shiftKey ? "redo" : "undo"); break;
      }
    }
    // Let all other keys (including backspace, delete, arrows) work normally
  }, [handleFinish, handleCommand]);

  // Non-editing: show static content
  if (!isEditing) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`${className} ${isOwner && isHovered ? "cursor-pointer ring-2 ring-white/30 ring-offset-2 ring-offset-transparent rounded" : ""}`}
          style={style}
          onClick={isOwner ? onStartEdit : undefined}
          dangerouslySetInnerHTML={{ __html: value }}
        />
        {isOwner && isHovered && (
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
              title="Edit"
              className="p-1.5 rounded-lg bg-white shadow-lg hover:bg-slate-50 transition-colors"
            >
              <Type size={14} className="text-slate-700" />
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                title="Delete"
                className="p-1.5 rounded-lg bg-white shadow-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Editing: show contentEditable
  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleFinish}
        onKeyDown={handleKeyDown}
        onMouseUp={handleSelectionChange}
        className={`${className} outline-none ring-2 ring-cyan-400/60 rounded`}
        style={style}
      />
      {showToolbar && createPortal(
        <FloatingToolbar position={toolbarPosition} onCommand={handleCommand} />,
        document.body
      )}
    </div>
  );
}
