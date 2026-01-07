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
  Wand2,
  Minimize2,
  Maximize2,
  Briefcase,
  MessageCircle,
  CheckCircle,
  Zap,
  Smile,
  Languages,
  Loader2,
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

type AIAction = 
  | "improve"
  | "shorten"
  | "expand"
  | "professional"
  | "casual"
  | "fix-grammar"
  | "simplify"
  | "make-bold"
  | "add-emoji"
  | "translate";

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
  { label: "H1", tag: "h1", size: "2em" },
  { label: "H2", tag: "h2", size: "1.5em" },
  { label: "H3", tag: "h3", size: "1.17em" },
  { label: "P", tag: "p", size: "1em" },
];

const AI_ACTIONS: { action: AIAction; label: string; icon: React.ReactNode; description: string }[] = [
  { action: "improve", label: "Improve Writing", icon: <Wand2 size={14} />, description: "Make it clearer and more engaging" },
  { action: "shorten", label: "Make Shorter", icon: <Minimize2 size={14} />, description: "Condense to key points" },
  { action: "expand", label: "Make Longer", icon: <Maximize2 size={14} />, description: "Add more details" },
  { action: "professional", label: "Professional Tone", icon: <Briefcase size={14} />, description: "Formal business style" },
  { action: "casual", label: "Casual Tone", icon: <MessageCircle size={14} />, description: "Friendly and relaxed" },
  { action: "fix-grammar", label: "Fix Grammar", icon: <CheckCircle size={14} />, description: "Correct errors" },
  { action: "simplify", label: "Simplify", icon: <Zap size={14} />, description: "Easier to understand" },
  { action: "make-bold", label: "Make Bold", icon: <Sparkles size={14} />, description: "More impactful" },
  { action: "add-emoji", label: "Add Emoji", icon: <Smile size={14} />, description: "Visual appeal" },
  { action: "translate", label: "Translate/Improve", icon: <Languages size={14} />, description: "To English" },
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
  onAIAction: (action: AIAction, selectedText: string) => Promise<string | null>;
}

function FloatingToolbar({ position, onCommand, onAIAction }: FloatingToolbarProps) {
  const [activeMenu, setActiveMenu] = useState<"heading" | "color" | "highlight" | "ai" | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
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

  const toggleMenu = (menu: "heading" | "color" | "highlight" | "ai") => {
    if (activeMenu === menu) {
      setActiveMenu(null);
      return;
    }
    setAiError(null);
    const button = buttonRefs.current[menu];
    if (button) {
      const rect = button.getBoundingClientRect();
      // For AI menu, position it to the left to avoid going off-screen
      const leftPos = menu === "ai" ? Math.max(10, rect.left - 150) : rect.left;
      setMenuPosition({ top: rect.bottom + 4, left: leftPos });
    }
    setActiveMenu(menu);
  };

  const handleAIAction = async (action: AIAction) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || "";
    
    if (!selectedText) {
      setAiError("Please select some text first");
      return;
    }

    setIsAILoading(true);
    setAiError(null);

    try {
      const result = await onAIAction(action, selectedText);
      if (result) {
        // Replace selected text with AI result
        document.execCommand("insertText", false, result);
        setActiveMenu(null);
      } else {
        setAiError("No result returned from AI");
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI enhancement failed");
    } finally {
      setIsAILoading(false);
    }
  };

  const renderDropdown = (content: React.ReactNode, isAI = false) => {
    if (!activeMenu) return null;
    return createPortal(
      <div
        data-toolbar="true"
        className={`fixed z-[999999] bg-white rounded-lg shadow-xl border border-slate-200 ${isAI ? "p-1" : "p-2"}`}
        style={{ top: menuPosition.top, left: menuPosition.left, maxHeight: "400px", overflowY: "auto" }}
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
      data-toolbar="true"
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
              onMouseDown={(e) => { e.preventDefault(); onCommand("fontSize", opt.size); setActiveMenu(null); }}
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-sm rounded"
              style={{ fontSize: opt.size }}
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

      {/* AI Actions */}
      <button
        ref={(el) => { buttonRefs.current["ai"] = el; }}
        type="button"
        onMouseDown={(e) => { e.preventDefault(); toggleMenu("ai"); }}
        title="AI Enhance"
        className="flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:opacity-90 transition-opacity"
      >
        {isAILoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
        <span className="hidden sm:inline">AI</span>
        <ChevronDown size={10} />
      </button>

      {activeMenu === "ai" && renderDropdown(
        <div className="min-w-[220px]">
          {aiError && (
            <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded mb-1">
              {aiError}
            </div>
          )}
          <div className="text-xs text-slate-500 px-3 py-1.5 font-medium uppercase tracking-wide">
            AI Actions (1 credit each)
          </div>
          {AI_ACTIONS.map((item) => (
            <button
              key={item.action}
              type="button"
              disabled={isAILoading}
              onMouseDown={(e) => { e.preventDefault(); handleAIAction(item.action); }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 text-slate-700 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-purple-500">{item.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-slate-400">{item.description}</div>
              </div>
            </button>
          ))}
        </div>,
        true
      )}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ top: 0, left: 0 });
  const initializedRef = useRef(false);
  const clickPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastValueRef = useRef<string>(value);
  const editingSessionRef = useRef<number>(0); // Track editing sessions to prevent re-initialization
  const contentChangedRef = useRef(false); // Track if content changed during editing
  const latestContentRef = useRef<string>(value); // Store the latest content as backup

  // Initialize editor content ONLY when editing starts (not on every render)
  useEffect(() => {
    if (isEditing && editorRef.current && !initializedRef.current) {
      // Start a new editing session
      editingSessionRef.current += 1;
      const currentSession = editingSessionRef.current;
      
      // Reset content changed flag for new session
      contentChangedRef.current = false;
      
      // Only set content once when editing starts
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
      latestContentRef.current = value; // Initialize latest content ref
      initializedRef.current = true;
      
      // Position cursor at click position if available
      const clickPos = clickPositionRef.current;
      clickPositionRef.current = null;
      
      // Focus the editor without scrolling
      editorRef.current.focus({ preventScroll: true });
      
      if (clickPos) {
        // Use setTimeout to ensure DOM is fully rendered and positioned
        setTimeout(() => {
          // Only proceed if we're still in the same editing session
          if (editingSessionRef.current !== currentSession) return;
          if (editorRef.current) {
            try {
              // Try to get caret position from click coordinates
              const range = document.caretRangeFromPoint?.(clickPos.x, clickPos.y);
              if (range && editorRef.current.contains(range.startContainer)) {
                const sel = window.getSelection();
                if (sel) {
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              } else {
                // Fallback: put cursor at end of content
                const sel = window.getSelection();
                if (sel && editorRef.current) {
                  const range = document.createRange();
                  range.selectNodeContents(editorRef.current);
                  range.collapse(false); // Collapse to end
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              }
            } catch {
              // If anything fails, cursor stays at start (from focus)
            }
          }
        }, 10); // Small delay to ensure DOM is ready
      }
    }
    
    // Only reset when truly leaving editing mode
    if (!isEditing && initializedRef.current) {
      setShowToolbar(false);
      setIsHovered(false);
      initializedRef.current = false;
      lastValueRef.current = value;
      latestContentRef.current = value; // Update latest content ref with new value
    }
  }, [isEditing]); // Only depend on isEditing - NOT value, to prevent cursor reset when typing

  // Sync content and finish editing
  const finishWithSync = useCallback(() => {
    // Always sync content when finishing, before calling onFinish
    // This ensures the parent state is updated before exiting edit mode
    let currentContent: string;
    
    if (editorRef.current) {
      // Get the current content from the editor (most accurate)
      currentContent = editorRef.current.innerHTML;
      // Update the backup ref
      latestContentRef.current = currentContent;
    } else {
      // Fallback to stored content if editor ref is not available
      currentContent = latestContentRef.current;
    }
    
    // Call onChange synchronously to save the content BEFORE onFinish
    onChange(currentContent);
    contentChangedRef.current = false;
    setShowToolbar(false);
    // Call onFinish after onChange to exit edit mode
    onFinish();
  }, [onFinish, onChange]);

  // Handle clicks outside to finish editing
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // Check if click is outside the editor and not on toolbar
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(target as Element).closest?.('[data-toolbar="true"]')
      ) {
        finishWithSync();
      }
    };

    // Use mousedown to catch clicks before they trigger other elements
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, finishWithSync]);

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
    // Don't listen to scroll events - this causes the snap-back issue
    // The toolbar position is updated on selection change which is sufficient
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [isEditing, handleSelectionChange]);

  const handleInput = useCallback(() => {
    // Mark that content has changed, but DON'T call onChange during typing
    // This prevents React re-renders that can reset cursor position
    contentChangedRef.current = true;
    // Store the latest content for backup
    if (editorRef.current) {
      latestContentRef.current = editorRef.current.innerHTML;
    }
  }, []);

  const handleFinish = useCallback(() => {
    finishWithSync();
  }, [finishWithSync]);

  const handleCommand = useCallback((cmd: string, cmdValue?: string) => {
    if (cmd === "createLink") {
      const url = prompt("Enter URL:");
      if (url) document.execCommand("createLink", false, url);
    } else if (cmd === "code") {
      const sel = window.getSelection();
      const text = sel?.toString() || "code";
      document.execCommand("insertHTML", false, `<code class="bg-slate-200 px-1 rounded text-sm font-mono">${text}</code>`);
    } else if (cmd === "fontSize") {
      // Apply font-size using a span with inline style
      const sel = window.getSelection();
      const text = sel?.toString() || "";
      if (text && cmdValue) {
        document.execCommand("insertHTML", false, `<span style="font-size: ${cmdValue}">${text}</span>`);
      }
    } else {
      document.execCommand(cmd, false, cmdValue);
    }
    editorRef.current?.focus({ preventScroll: true });
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

  // AI Action Handler
  const handleAIAction = useCallback(async (action: AIAction, selectedText: string): Promise<string | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch("/api/ai/enhance-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, action }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = "AI enhancement failed";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.success && data.text) {
        // Update the editor content after AI replacement
        setTimeout(() => handleInput(), 0);
        return data.text;
      }
      throw new Error("No enhanced text returned");
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  }, [handleInput]);

  // Non-editing: show static content
  if (!isEditing) {
    return (
      <div
        key="static-container"
        ref={containerRef}
        className="relative group/editable"
        onMouseEnter={() => isOwner && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          key="static-content"
          className={`${className} ${isOwner && isHovered ? "cursor-text ring-2 ring-white/30 ring-offset-2 ring-offset-transparent rounded" : ""} ${!isOwner ? "pointer-events-none select-none" : ""}`}
          style={style}
          onMouseDown={isOwner ? (e) => { 
            e.stopPropagation();
            // Capture click position for cursor placement
            clickPositionRef.current = { x: e.clientX, y: e.clientY };
            onStartEdit(); 
          } : undefined}
          dangerouslySetInnerHTML={{ __html: value }}
        />
        {/* Show edit/delete icons only when hovering over THIS element and onDelete is provided */}
        {isOwner && onDelete && isHovered && (
          <div className="absolute top-0 right-0 flex gap-1 z-30">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStartEdit(); }}
              title="Edit"
              className="p-1 rounded bg-white/95 shadow-md hover:bg-blue-50 transition-colors border border-slate-200/50"
            >
              <Type size={12} className="text-slate-600" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              title="Delete"
              className="p-1 rounded bg-white/95 shadow-md hover:bg-red-50 transition-colors border border-slate-200/50"
            >
              <Trash2 size={12} className="text-red-500" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Editing: show contentEditable
  return (
    <div key="editor-container" ref={containerRef} className="relative">
      <div
        key="editor-content"
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={handleSelectionChange}
        className={`${className} outline-none ring-2 ring-cyan-400/60 rounded`}
        style={style}
      />
      {showToolbar && createPortal(
        <FloatingToolbar position={toolbarPosition} onCommand={handleCommand} onAIAction={handleAIAction} />,
        document.body
      )}
    </div>
  );
}
