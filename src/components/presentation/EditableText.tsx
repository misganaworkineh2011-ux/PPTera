"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
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
  onDelete?: () => void;
  isHovered?: boolean; // Added but not used - prevents unmounting on hover changes
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
// TOOLBAR COMPONENTS
// ============================================================================

const ToolbarButton = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
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
  const [activeMenu, setActiveMenu] = useState<"heading" | "color" | "highlight" | "align" | "ai" | null>(null);
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

  const toggleMenu = (menu: "heading" | "color" | "highlight" | "align" | "ai") => {
    if (activeMenu === menu) { setActiveMenu(null); return; }
    setAiError(null);
    const button = buttonRefs.current[menu];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 4, left: menu === "ai" ? Math.max(10, rect.left - 150) : rect.left });
    }
    setActiveMenu(menu);
  };

  const handleAIAction = async (action: AIAction) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || "";
    if (!selectedText) { setAiError("Please select some text first"); return; }
    setIsAILoading(true);
    setAiError(null);
    try {
      const result = await onAIAction(action, selectedText);
      if (result) { document.execCommand("insertText", false, result); setActiveMenu(null); }
      else { setAiError("No result returned from AI"); }
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
      <button ref={(el) => { buttonRefs.current["heading"] = el; }} type="button" onMouseDown={(e) => { e.preventDefault(); toggleMenu("heading"); }} className="flex items-center gap-0.5 px-2 py-1 rounded hover:bg-slate-100 text-slate-600 text-sm font-medium">
        <span className="w-6">H</span><ChevronDown size={12} />
      </button>
      {activeMenu === "heading" && renderDropdown(
        <div className="min-w-[80px]">
          {HEADING_OPTIONS.map((opt) => (
            <button key={opt.tag} type="button" onMouseDown={(e) => { e.preventDefault(); onCommand("fontSize", opt.size); setActiveMenu(null); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-sm rounded" style={{ fontSize: opt.size }}>{opt.label}</button>
          ))}
        </div>
      )}
      <ToolbarDivider />
      <button ref={(el) => { buttonRefs.current["color"] = el; }} type="button" onMouseDown={(e) => { e.preventDefault(); toggleMenu("color"); }} className="flex items-center gap-0.5 p-1.5 rounded hover:bg-slate-100 text-slate-600" title="Text Color">
        <Palette size={15} /><ChevronDown size={10} />
      </button>
      {activeMenu === "color" && renderDropdown(
        <div className="grid grid-cols-5 gap-1">
          {TEXT_COLORS.map((c) => (<button key={c.name} type="button" onMouseDown={(e) => { e.preventDefault(); onCommand("foreColor", c.value || "#000000"); setActiveMenu(null); }} title={c.name} className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform" style={{ backgroundColor: c.value || "#fff" }} />))}
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
      <button ref={(el) => { buttonRefs.current["align"] = el; }} type="button" onMouseDown={(e) => { e.preventDefault(); toggleMenu("align"); }} className="flex items-center gap-0.5 p-1.5 rounded hover:bg-slate-100 text-slate-600" title="Text Alignment">
        <AlignLeft size={15} /><ChevronDown size={10} />
      </button>
      {activeMenu === "align" && renderDropdown(
        <div className="min-w-[100px]">
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onCommand("justifyLeft"); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-sm rounded"><AlignLeft size={14} /> Left</button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onCommand("justifyCenter"); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-sm rounded"><AlignCenter size={14} /> Center</button>
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onCommand("justifyRight"); setActiveMenu(null); }} className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-slate-700 text-sm rounded"><AlignRight size={14} /> Right</button>
        </div>
      )}
      <ToolbarDivider />
      <button ref={(el) => { buttonRefs.current["highlight"] = el; }} type="button" onMouseDown={(e) => { e.preventDefault(); toggleMenu("highlight"); }} className="flex items-center gap-0.5 p-1.5 rounded hover:bg-slate-100 text-slate-600" title="Highlight">
        <Highlighter size={15} /><ChevronDown size={10} />
      </button>
      {activeMenu === "highlight" && renderDropdown(
        <div className="grid grid-cols-3 gap-1">
          {HIGHLIGHT_COLORS.map((c) => (<button key={c.name} type="button" onMouseDown={(e) => { e.preventDefault(); onCommand("hiliteColor", c.value || "transparent"); setActiveMenu(null); }} title={c.name} className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform" style={{ backgroundColor: c.value || "#fff" }} />))}
        </div>
      )}
      <ToolbarDivider />
      <button ref={(el) => { buttonRefs.current["ai"] = el; }} type="button" onMouseDown={(e) => { e.preventDefault(); toggleMenu("ai"); }} title="AI Enhance" className="flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:opacity-90 transition-opacity">
        {isAILoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
        <span className="hidden sm:inline">AI</span><ChevronDown size={10} />
      </button>
      {activeMenu === "ai" && renderDropdown(
        <div className="min-w-[220px]">
          {aiError && <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded mb-1">{aiError}</div>}
          <div className="text-xs text-slate-500 px-3 py-1.5 font-medium uppercase tracking-wide">AI Actions (1 credit each)</div>
          {AI_ACTIONS.map((item) => (
            <button key={item.action} type="button" disabled={isAILoading} onMouseDown={(e) => { e.preventDefault(); handleAIAction(item.action); }} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 text-slate-700 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="text-purple-500">{item.icon}</span>
              <div className="flex-1 text-left"><div className="font-medium">{item.label}</div><div className="text-xs text-slate-400">{item.description}</div></div>
            </button>
          ))}
        </div>,
        true
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT - Completely Rewritten with Memo
// ============================================================================

function EditableTextComponent({
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
  // Editor refs
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hover state (using ref to avoid re-renders)
  const isHoveredRef = useRef(false);
  const [hoverTrigger, setHoverTrigger] = useState(0);
  
  // Toolbar state
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>({ top: 0, left: 0 });
  
  // Content management - track if we've ever edited
  const [displayContent, setDisplayContent] = useState(value);
  const savedContentRef = useRef(value);
  const isSavingRef = useRef(false);
  const isEditingRef = useRef(isEditing);
  const hasUnsavedChangesRef = useRef(false);
  
  // Track editing state changes
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);
  
  // Sync display content when value prop changes from parent
  // BUT ONLY if we're not editing AND we don't have unsaved changes
  useEffect(() => {
    if (!isEditingRef.current && !hasUnsavedChangesRef.current) {
      setDisplayContent(value);
      savedContentRef.current = value;
    }
  }, [value]);

  // Initialize editor when entering edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      // Mark that we have unsaved changes while editing
      hasUnsavedChangesRef.current = true;
      
      // Set content
      editorRef.current.innerHTML = displayContent;
      
      // Focus and place cursor at end
      editorRef.current.focus({ preventScroll: true });
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [isEditing, displayContent]);

  // Track content changes during editing to prevent parent overwrites
  useEffect(() => {
    if (!isEditing || !editorRef.current) return;

    const handleInput = () => {
      // Mark that content has changed
      hasUnsavedChangesRef.current = true;
      
      // Update display content in real-time to prevent reversion
      if (editorRef.current) {
        const currentContent = editorRef.current.innerHTML;
        setDisplayContent(currentContent);
      }
    };

    const editor = editorRef.current;
    editor.addEventListener('input', handleInput);
    
    return () => {
      editor.removeEventListener('input', handleInput);
    };
  }, [isEditing]);

  // Save function
  const saveContent = useCallback(() => {
    if (isSavingRef.current || !editorRef.current) return;
    
    isSavingRef.current = true;
    const content = editorRef.current.innerHTML;
    
    // Update local state immediately
    setDisplayContent(content);
    savedContentRef.current = content;
    
    // Clear unsaved changes flag
    hasUnsavedChangesRef.current = false;
    
    // Hide toolbar
    setShowToolbar(false);
    
    // Notify parent
    onChange(content);
    onFinish();
    
    // Reset saving flag after a short delay
    setTimeout(() => {
      isSavingRef.current = false;
    }, 100);
  }, [onChange, onFinish]);

  // Handle clicks outside editor
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      
      // Ignore clicks on toolbar or editor
      if (
        containerRef.current?.contains(target) ||
        target.closest('[data-toolbar="true"]') ||
        target.closest('[contenteditable="true"]')
      ) {
        return;
      }
      
      // Save and exit
      saveContent();
    };

    // Small delay to avoid immediate trigger
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, saveContent]);

  // Toolbar position calculation
  const updateToolbarPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return null;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) return null;
    
    const centerX = rect.left + rect.width / 2;
    let top = rect.top - TOOLBAR_HEIGHT - TOOLBAR_GAP;
    
    // If toolbar would be off-screen at top, show below selection
    if (top < 10) {
      top = rect.bottom + TOOLBAR_GAP;
    }
    
    return {
      top,
      left: Math.max(200, Math.min(centerX, window.innerWidth - 200))
    };
  }, []);

  // Selection change handler
  useEffect(() => {
    if (!isEditing) return;

    const handleSelectionChange = () => {
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (!selection) return;
      
      // Check if selection is within our editor
      const isInEditor = editorRef.current.contains(selection.anchorNode);
      const hasText = !selection.isCollapsed && selection.toString().trim().length > 0;
      
      if (isInEditor && hasText) {
        const pos = updateToolbarPosition();
        if (pos) {
          setToolbarPosition(pos);
          setShowToolbar(true);
        }
      } else if (!isInEditor) {
        // Only hide if selection moved outside editor
        setShowToolbar(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isEditing, updateToolbarPosition]);

  // Command handler
  const handleCommand = useCallback((cmd: string, cmdValue?: string) => {
    if (cmd === "createLink") {
      const url = prompt("Enter URL:");
      if (url) document.execCommand("createLink", false, url);
    } else if (cmd === "code") {
      const sel = window.getSelection();
      const text = sel?.toString() || "code";
      document.execCommand("insertHTML", false, `<code class="bg-slate-200 px-1 rounded text-sm font-mono">${text}</code>`);
    } else if (cmd === "fontSize") {
      const sel = window.getSelection();
      const text = sel?.toString() || "";
      if (text && cmdValue) {
        document.execCommand("insertHTML", false, `<span style="font-size: ${cmdValue}">${text}</span>`);
      }
    } else {
      document.execCommand(cmd, false, cmdValue);
    }
    editorRef.current?.focus({ preventScroll: true });
  }, []);

  // Key handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      saveContent();
      return;
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveContent();
      return;
    }
    
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          handleCommand("bold");
          break;
        case "i":
          e.preventDefault();
          handleCommand("italic");
          break;
        case "u":
          e.preventDefault();
          handleCommand("underline");
          break;
        case "k":
          e.preventDefault();
          handleCommand("createLink");
          break;
        case "z":
          e.preventDefault();
          handleCommand(e.shiftKey ? "redo" : "undo");
          break;
      }
    }
  }, [saveContent, handleCommand]);

  // AI handler
  const handleAIAction = useCallback(async (action: AIAction, selectedText: string): Promise<string | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch("/api/ai/enhance-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, action }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "AI enhancement failed");
      }
      
      const data = await response.json();
      if (data.success && data.text) return data.text;
      throw new Error("No enhanced text returned");
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  }, []);

  // Hover handlers (non-re-rendering)
  const handleMouseEnter = useCallback(() => {
    if (isOwner && !isEditing) {
      isHoveredRef.current = true;
      setHoverTrigger(prev => prev + 1);
    }
  }, [isOwner, isEditing]);

  const handleMouseLeave = useCallback(() => {
    if (!isEditing) {
      isHoveredRef.current = false;
      setHoverTrigger(prev => prev + 1);
    }
  }, [isEditing]);

  // Render editing mode
  if (isEditing) {
    return (
      <div ref={containerRef} className="relative z-[100]">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleKeyDown}
          onMouseUp={() => {
            // Trigger selection check on mouse up
            setTimeout(() => {
              const selection = window.getSelection();
              if (selection && !selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
                const pos = updateToolbarPosition();
                if (pos) {
                  setToolbarPosition(pos);
                  setShowToolbar(true);
                }
              }
            }, 10);
          }}
          className={`${className} outline-none ring-2 ring-blue-500 rounded px-2 py-1 bg-white/95 shadow-lg backdrop-blur-sm`}
          style={{
            ...style,
            minHeight: "1.5em",
            position: "relative",
            zIndex: 100,
          }}
        />
        {showToolbar && createPortal(
          <FloatingToolbar
            position={toolbarPosition}
            onCommand={handleCommand}
            onAIAction={handleAIAction}
          />,
          document.body
        )}
      </div>
    );
  }

  // Render display mode
  const isHovered = isHoveredRef.current;

  return (
    <div
      className="relative group/editable"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`${className} ${isOwner && isHovered ? "cursor-text ring-2 ring-white/30 ring-offset-2 ring-offset-transparent rounded" : ""} ${!isOwner ? "pointer-events-none select-none" : ""}`}
        style={style}
        onMouseDown={isOwner ? (e) => { e.stopPropagation(); onStartEdit(); } : undefined}
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
      {isOwner && onDelete && isHovered && (
        <div className="absolute top-0 right-0 flex gap-1 z-50">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onStartEdit(); }}
            title="Edit"
            className="p-1.5 rounded bg-white shadow-lg hover:bg-blue-50 transition-colors border border-slate-200"
          >
            <Type size={14} className="text-slate-600" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
            title="Delete"
            className="p-1.5 rounded bg-white shadow-lg hover:bg-red-50 transition-colors border border-slate-200"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}

// Memoize component with custom comparison to prevent unnecessary re-renders
// Memoize component with custom comparison to prevent unnecessary re-renders
// Return TRUE to SKIP re-render, FALSE to allow re-render
const EditableText = memo(EditableTextComponent, (prevProps, nextProps) => {
  // ALWAYS ignore isHovered prop changes - it should never cause re-render
  
  // If currently editing, don't re-render on value changes (prevents reversion)
  if (nextProps.isEditing) {
    // Return TRUE (skip re-render) if these props haven't changed
    return (
      prevProps.isEditing === nextProps.isEditing &&
      prevProps.className === nextProps.className &&
      prevProps.isOwner === nextProps.isOwner
    );
  }
  
  // If not editing, only re-render if value or critical props change
  // Return TRUE (skip re-render) if nothing important changed
  return (
    prevProps.value === nextProps.value &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.className === nextProps.className &&
    prevProps.isOwner === nextProps.isOwner
    // Note: isHovered is intentionally NOT checked - we never re-render for hover changes
  );
});

EditableText.displayName = "EditableText";

export default EditableText;
