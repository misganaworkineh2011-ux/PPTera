"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Sparkles, Send, Loader2, X, Image, LayoutGrid } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { getThemeType } from "./types";

interface AddSlideButtonsProps {
  onAddSlide: () => void;
  onAddAISlide: (prompt: string) => Promise<void>;
  presentationContext?: string;
  theme?: Theme;
}

export function AddSlideButtons({ onAddSlide, onAddAISlide, presentationContext, theme }: AddSlideButtonsProps) {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Theme-aware styling
  const themeType = theme ? getThemeType(theme) : "light";
  const isLight = themeType === "light" || themeType === "corporate";
  
  // Theme-aware colors for the panel
  const panelBg = theme?.pageBackground || (isLight ? "#ffffff" : theme?.colors.background || "#18181b");
  const panelBorder = isLight ? "#e2e8f0" : theme?.colors.border || "#3f3f46";
  const textColor = isLight ? "#1e293b" : theme?.colors.text || "#fafafa";
  const mutedColor = isLight ? "#94a3b8" : theme?.colors.textMuted || "#a1a1aa";
  const surfaceColor = isLight ? "#f1f5f9" : theme?.colors.surface || "#27272a";

  // Calculate panel position when opening
  const openAIPanel = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
    setShowAIPanel(true);
    setError(null);
  };

  // Focus textarea when panel opens
  useEffect(() => {
    if (showAIPanel && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showAIPanel]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        if (!isLoading) {
          setShowAIPanel(false);
        }
      }
    };
    if (showAIPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAIPanel, isLoading]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onAddAISlide(prompt.trim());
      setPrompt("");
      setShowAIPanel(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate slide");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Add a summary slide",
    "Create a comparison slide",
    "Add key takeaways",
    "Create a timeline slide",
  ];

  return (
    <div className="flex items-center justify-center py-2 group/add">
      {/* Horizontal line with buttons in center */}
      <div className="flex items-center gap-2 opacity-0 group-hover/add:opacity-100 transition-opacity duration-200">
        {/* Add blank slide button */}
        <button
          onClick={onAddSlide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-slate-50 text-slate-600 hover:text-slate-800 shadow-md border border-slate-200 ring-1 ring-black/5 transition-all text-xs font-medium"
          title="Add blank slide"
        >
          <Plus size={14} />
          <span>Add Slide</span>
        </button>

        {/* Add AI slide button */}
        <button
          ref={buttonRef}
          onClick={() => showAIPanel ? setShowAIPanel(false) : openAIPanel()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md border transition-all text-xs font-medium ${
            showAIPanel
              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-violet-400"
              : "bg-white/95 hover:bg-violet-50 text-slate-600 hover:text-violet-600 border-slate-200 ring-1 ring-black/5"
          }`}
          title="Add slide with AI (4 credits)"
        >
          <Sparkles size={14} />
          <span>+AI</span>
        </button>
      </div>

      {/* AI Panel - rendered via portal */}
      {showAIPanel &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[99999] rounded-xl shadow-2xl ring-1 ring-black/5 p-4 w-[340px]"
            style={{
              top: panelPosition.top,
              left: panelPosition.left,
              transform: "translateX(-50%)",
              background: panelBg,
              border: `1px solid ${panelBorder}`,
            }}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: textColor }}>Generate Slide with AI</p>
                  <p className="text-xs" style={{ color: mutedColor }}>4 credits per slide</p>
                </div>
              </div>
              <button
                onClick={() => !isLoading && setShowAIPanel(false)}
                disabled={isLoading}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                style={{ color: mutedColor }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Features hint */}
            <div 
              className="flex items-center gap-3 mb-3 px-2 py-1.5 rounded-lg"
              style={{ backgroundColor: surfaceColor }}
            >
              <div className="flex items-center gap-1 text-xs" style={{ color: mutedColor }}>
                <Image size={12} />
                <span>Pexels images</span>
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: mutedColor }}>
                <LayoutGrid size={12} />
                <span>Smart layout</span>
              </div>
            </div>

            {error && (
              <div className="mb-3 px-3 py-2 text-xs text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Describe the slide you want to create..."
                className="w-full px-3 py-2.5 pr-11 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
                style={{ 
                  backgroundColor: surfaceColor,
                  color: textColor,
                  border: `1px solid ${panelBorder}`,
                }}
                rows={3}
                disabled={isLoading}
              />
              <button
                className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? (
                  <Loader2 size={14} className="text-white animate-spin" />
                ) : (
                  <Send size={14} className="text-white" />
                )}
              </button>
            </div>

            {/* Suggestions */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-xs rounded-full transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: surfaceColor,
                    color: mutedColor,
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <p className="text-[11px] mt-3 text-center" style={{ color: mutedColor }}>
              Press Enter to generate • Includes image from Pexels
            </p>
          </div>,
          document.body
        )}
    </div>
  );
}
