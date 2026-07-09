"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { StickyNote, Send, X } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { getThemeType } from "./types";
import { getModalColors } from "./ui-colors";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface SlideNoteButtonProps {
  slideIndex: number;
  speakerNotes?: string[];
  onAddNote: (note: string) => void;
  onEditNote: (noteIndex: number, note: string) => void;
  onDeleteNote: (noteIndex: number) => void;
  theme?: Theme;
}

export function SlideNoteButton({
  slideIndex,
  speakerNotes = [],
  onAddNote,
  onEditNote,
  onDeleteNote,
  theme,
}: SlideNoteButtonProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Theme-aware styling using the helper
  const colors = theme ? getModalColors(theme) : null;
  const isLight = colors ? !colors.isDark : true;
  
  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  
  // Theme-aware colors
  const panelBg = colors?.bg || "#ffffff";
  const panelBorder = colors?.border || "#e2e8f0";
  const textColor = colors?.text || "#1e293b";
  const mutedColor = colors?.textMuted || "#94a3b8";
  const surfaceColor = isLight ? "#fef3c7" : (colors?.surface || "#27272a");
  const surfaceBorder = isLight ? "rgba(251, 191, 36, 0.5)" : (colors?.border || "#3f3f46");

  // Calculate panel position when opening
  const openPanel = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    setShowPanel(true);
  };

  // Focus textarea when panel opens
  useEffect(() => {
    if (showPanel && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showPanel]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowPanel(false);
      }
    };
    if (showPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPanel]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote.trim());
    setNewNote("");
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editingText.trim()) return;
    onEditNote(editingIndex, editingText.trim());
    setEditingIndex(null);
    setEditingText("");
  };

  const startEditing = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const noteCount = speakerNotes.length;

  return (
    <>
      {/* Button in top-left corner of slide */}
      <button
        ref={buttonRef}
        onClick={() => (showPanel ? setShowPanel(false) : openPanel())}
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 shadow-lg ${showPanel ? "" : "ring-1 ring-black/10"}`}
        style={
          showPanel
            ? { background: "#f59e0b", color: "#ffffff" }
            : { background: panelBg, color: mutedColor, border: `1px solid ${panelBorder}` }
        }
        onMouseEnter={(e) => {
          if (!showPanel) e.currentTarget.style.color = "#d97706";
        }}
        onMouseLeave={(e) => {
          if (!showPanel) e.currentTarget.style.color = mutedColor;
        }}
      >
        <StickyNote size={15} />
        <span className="text-xs font-medium">
          {noteCount > 0 ? `${noteCount} ${noteCount > 1 ? (t.notesCountPlural?.replace("{count}", "") || "Notes") : (t.notesCount?.replace("{count}", "") || "Note")}` : (t.addNote || "Add Note")}
        </span>
      </button>

      {/* Notes Panel - rendered via portal */}
      {showPanel &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[99999] rounded-xl shadow-2xl ring-1 ring-black/5 p-4 w-80 max-h-[420px] overflow-hidden flex flex-col"
            style={{
              top: panelPosition.top,
              left: panelPosition.left,
              background: panelBg,
              borderColor: panelBorder,
              border: `1px solid ${panelBorder}`,
            }}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <StickyNote size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: textColor }}>{t.speakerNotes || "Speaker Notes"}</p>
                  <p className="text-xs" style={{ color: mutedColor }}>{t.slideLabel || "Slide"} {slideIndex + 1}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: mutedColor }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Existing notes */}
            {speakerNotes.length > 0 && (
              <div className="flex-1 overflow-y-auto mb-3 space-y-2 max-h-[180px] pr-1">
                {speakerNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="group p-2.5 rounded-lg"
                    style={{ 
                      backgroundColor: surfaceColor,
                      border: `1px solid ${surfaceBorder}`,
                    }}
                  >
                    {editingIndex === idx ? (
                      <div>
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full px-2.5 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                          style={{ 
                            backgroundColor: isLight ? "#ffffff" : theme?.colors.backgroundAlt || "#27272a",
                            color: textColor,
                            borderColor: isLight ? "#fbbf24" : theme?.colors.border || "#3f3f46",
                            border: `1px solid ${isLight ? "#fbbf24" : theme?.colors.border || "#3f3f46"}`,
                          }}
                          rows={2}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter" && e.ctrlKey) handleSaveEdit();
                            if (e.key === "Escape") cancelEditing();
                          }}
                        />
                        <div className="flex justify-end gap-1.5 mt-2">
                          <button
                            onClick={cancelEditing}
                            className="px-2.5 py-1 text-xs rounded-md"
                            style={{ color: mutedColor }}
                          >
                            {t.cancelNote || "Cancel"}
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-2.5 py-1 text-xs text-amber-600 hover:text-amber-700 font-medium rounded-md"
                          >
                            {t.saveNote || "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: textColor }}>
                          {note}
                        </p>
                        <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(idx, note)}
                            className="text-xs font-medium"
                            style={{ color: mutedColor }}
                          >
                            {t.editNote || "Edit"}
                          </button>
                          <button
                            onClick={() => onDeleteNote(idx)}
                            className="text-xs text-red-500 font-medium"
                          >
                            {t.deleteNote || "Delete"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add new note */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter" && e.ctrlKey) handleAddNote();
                }}
                placeholder={t.addSpeakerNote || "Add a speaker note..."}
                className="w-full px-3 py-2.5 pr-11 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                style={{ 
                  backgroundColor: isLight ? "#ffffff" : theme?.colors.surface || "#27272a",
                  color: textColor,
                  borderColor: panelBorder,
                  border: `1px solid ${panelBorder}`,
                }}
                rows={2}
              />
              <button
                className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>

            <p className="text-[11px] mt-2.5 text-center" style={{ color: mutedColor }}>
              {t.ctrlEnterToAdd || "Ctrl+Enter to add • Visible in presenter view"}
            </p>
          </div>,
          document.body
        )}
    </>
  );
}
