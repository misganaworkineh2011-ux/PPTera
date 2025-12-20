"use client";

import { useState } from "react";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Link2, 
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  CheckSquare,
  Type,
  ChevronDown
} from "lucide-react";

interface TextToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onLink: () => void;
  onHighlight: (color: string) => void;
  onAlign: (align: "left" | "center" | "right") => void;
  onListType: (type: "bullet" | "ordered" | "checkbox") => void;
  onHeadingLevel: (level: 1 | 2 | 3 | 4) => void;
  activeFormats?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    link?: boolean;
    alignment?: "left" | "center" | "right";
  };
  position?: { top: number; left: number };
  theme?: "light" | "dark";
}

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Purple", value: "#ddd6fe" },
];

export default function TextToolbar({
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onLink,
  onHighlight,
  onAlign,
  onListType,
  onHeadingLevel,
  activeFormats = {},
  position,
  theme = "light",
}: TextToolbarProps) {
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-slate-800" : "bg-white";
  const borderClass = isDark ? "border-slate-700" : "border-slate-200";
  const textClass = isDark ? "text-slate-300" : "text-slate-600";
  const hoverClass = isDark ? "hover:bg-slate-700" : "hover:bg-slate-100";
  const activeClass = isDark ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-900";

  const ToolbarButton = ({ 
    onClick, 
    active, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${active ? activeClass : `${textClass} ${hoverClass}`}`}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div className={`w-px h-6 ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
  );

  return (
    <div
      className={`flex items-center gap-1 p-1.5 rounded-xl shadow-xl border ${bgClass} ${borderClass}`}
      style={position ? { position: "fixed", top: position.top, left: position.left, zIndex: 50 } : {}}
    >
      {/* Heading dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowHeadingMenu(!showHeadingMenu)}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${textClass} ${hoverClass}`}
        >
          <Type size={16} />
          <ChevronDown size={14} />
        </button>
        {showHeadingMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowHeadingMenu(false)} />
            <div className={`absolute top-full left-0 mt-1 ${bgClass} ${borderClass} border rounded-lg shadow-lg z-50 py-1 min-w-[120px]`}>
              {[1, 2, 3, 4].map((level) => (
                <button
                  key={level}
                  onClick={() => { onHeadingLevel(level as 1 | 2 | 3 | 4); setShowHeadingMenu(false); }}
                  className={`w-full text-left px-3 py-1.5 ${textClass} ${hoverClass}`}
                  style={{ fontSize: `${1.5 - level * 0.15}rem` }}
                >
                  Heading {level}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Divider />

      {/* Text formatting */}
      <ToolbarButton onClick={onBold} active={activeFormats.bold} title="Bold (Ctrl+B)">
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={onItalic} active={activeFormats.italic} title="Italic (Ctrl+I)">
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={onUnderline} active={activeFormats.underline} title="Underline (Ctrl+U)">
        <Underline size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={onStrikethrough} active={activeFormats.strikethrough} title="Strikethrough">
        <Strikethrough size={16} />
      </ToolbarButton>

      <Divider />

      {/* Highlight */}
      <div className="relative">
        <button
          onClick={() => setShowHighlightMenu(!showHighlightMenu)}
          className={`flex items-center gap-1 p-2 rounded-lg ${textClass} ${hoverClass}`}
          title="Highlight"
        >
          <Highlighter size={16} />
          <ChevronDown size={12} />
        </button>
        {showHighlightMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowHighlightMenu(false)} />
            <div className={`absolute top-full left-0 mt-1 ${bgClass} ${borderClass} border rounded-lg shadow-lg z-50 p-2`}>
              <div className="grid grid-cols-3 gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => { onHighlight(color.value); setShowHighlightMenu(false); }}
                    className="w-8 h-8 rounded-lg border border-slate-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <button
                onClick={() => { onHighlight(""); setShowHighlightMenu(false); }}
                className={`w-full mt-2 px-2 py-1 text-xs ${textClass} ${hoverClass} rounded`}
              >
                Remove highlight
              </button>
            </div>
          </>
        )}
      </div>

      {/* Link */}
      <ToolbarButton onClick={onLink} active={activeFormats.link} title="Insert Link (Ctrl+K)">
        <Link2 size={16} />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
      <ToolbarButton onClick={() => onAlign("left")} active={activeFormats.alignment === "left"} title="Align Left">
        <AlignLeft size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAlign("center")} active={activeFormats.alignment === "center"} title="Align Center">
        <AlignCenter size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onAlign("right")} active={activeFormats.alignment === "right"} title="Align Right">
        <AlignRight size={16} />
      </ToolbarButton>

      <Divider />

      {/* List types */}
      <div className="relative">
        <button
          onClick={() => setShowListMenu(!showListMenu)}
          className={`flex items-center gap-1 p-2 rounded-lg ${textClass} ${hoverClass}`}
          title="List"
        >
          <List size={16} />
          <ChevronDown size={12} />
        </button>
        {showListMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowListMenu(false)} />
            <div className={`absolute top-full right-0 mt-1 ${bgClass} ${borderClass} border rounded-lg shadow-lg z-50 py-1 min-w-[140px]`}>
              <button
                onClick={() => { onListType("bullet"); setShowListMenu(false); }}
                className={`flex items-center gap-2 w-full px-3 py-2 ${textClass} ${hoverClass}`}
              >
                <List size={16} />
                Bullet List
              </button>
              <button
                onClick={() => { onListType("ordered"); setShowListMenu(false); }}
                className={`flex items-center gap-2 w-full px-3 py-2 ${textClass} ${hoverClass}`}
              >
                <ListOrdered size={16} />
                Numbered List
              </button>
              <button
                onClick={() => { onListType("checkbox"); setShowListMenu(false); }}
                className={`flex items-center gap-2 w-full px-3 py-2 ${textClass} ${hoverClass}`}
              >
                <CheckSquare size={16} />
                Checkbox List
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
