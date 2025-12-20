"use client";

import { useState, useRef, useEffect } from "react";
import { Link2, ExternalLink, X, Check } from "lucide-react";

interface LinkEditorProps {
  initialUrl?: string;
  initialText?: string;
  onSave: (url: string, text: string) => void;
  onCancel: () => void;
  position?: { top: number; left: number };
}

export default function LinkEditor({
  initialUrl = "",
  initialText = "",
  onSave,
  onCancel,
  position,
}: LinkEditorProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (url.trim()) {
      // Add https:// if no protocol specified
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }
      onSave(finalUrl, text.trim() || finalUrl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 w-80 overflow-hidden"
      style={position ? { top: position.top, left: position.left } : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Link2 size={18} className="text-cyan-600" />
          <span className="font-semibold text-slate-900">Insert Link</span>
        </div>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            URL
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
            <ExternalLink size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Display Text Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Display Text (optional)
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Link text"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
          />
        </div>

        {/* Preview */}
        {url && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Preview</p>
            <a
              href={url.startsWith("http") ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-1"
            >
              {text || url}
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!url.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={16} />
          Insert Link
        </button>
      </div>
    </div>
  );
}

// Inline link popover for editing existing links
export function LinkPopover({
  url,
  onEdit,
  onRemove,
  onClose,
  position,
}: {
  url: string;
  onEdit: () => void;
  onRemove: () => void;
  onClose: () => void;
  position: { top: number; left: number };
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-2 flex items-center gap-2"
        style={{ top: position.top, left: position.left }}
      >
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline max-w-[200px] truncate flex items-center gap-1 px-2"
        >
          {url}
          <ExternalLink size={12} />
        </a>
        <div className="w-px h-5 bg-slate-200" />
        <button
          onClick={onEdit}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 text-xs font-medium"
        >
          Edit
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded hover:bg-red-50 text-red-500 text-xs font-medium"
        >
          Remove
        </button>
      </div>
    </>
  );
}
