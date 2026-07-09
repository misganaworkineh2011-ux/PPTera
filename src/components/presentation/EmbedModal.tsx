"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Video, Trash2, Youtube } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideEmbed } from "~/components/presentation/types";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";
import { detectProvider } from "~/components/presentation/EmbedSlideView";

interface EmbedModalProps {
  isOpen: boolean;
  theme: Theme;
  existingEmbed?: SlideEmbed | null;
  onClose: () => void;
  onInsert: (embed: SlideEmbed) => void;
  onRemove: () => void;
}

export default function EmbedModal({
  isOpen,
  theme,
  existingEmbed,
  onClose,
  onInsert,
  onRemove,
}: EmbedModalProps) {
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState(existingEmbed?.url || "");
  const [caption, setCaption] = useState(existingEmbed?.caption || "");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (isOpen) {
      setUrl(existingEmbed?.url || "");
      setCaption(existingEmbed?.caption || "");
    }
  }, [isOpen, existingEmbed]);

  const c = getModalColors(theme);
  const accent = c.accent || "#6366f1";

  if (!isOpen || !mounted) return null;

  const trimmed = url.trim();
  const valid = /^https?:\/\//i.test(trimmed);

  const submit = () => {
    if (!valid) return;
    onInsert({ url: trimmed, provider: detectProvider(trimmed), caption: caption.trim() || undefined });
  };

  const node = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: c.bg, borderColor: c.border }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
              <Video size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight" style={{ color: c.text }}>
                {existingEmbed ? "Edit embed" : "Embed media"}
              </h2>
              <p className="text-xs" style={{ color: c.textMuted }}>YouTube, Vimeo, Loom, Figma, or any link</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-black/10" style={{ color: c.textMuted }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: c.textMuted }}>URL</label>
            <input
              type="url"
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="https://youtube.com/watch?v=…"
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: c.inputBg, borderColor: c.border, color: c.text }}
            />
            <p className="flex items-center gap-1.5 text-xs" style={{ color: c.textMuted }}>
              <Youtube size={13} /> Paste a share link — we&apos;ll turn it into a player automatically.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: c.textMuted }}>Caption (optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Product demo"
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: c.inputBg, borderColor: c.border, color: c.text }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4" style={{ borderTop: `1px solid ${c.border}` }}>
          {existingEmbed ? (
            <button
              onClick={() => { onRemove(); onClose(); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
            >
              <Trash2 size={15} /> Remove
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={submit}
            disabled={!valid}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {existingEmbed ? "Update" : "Insert"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
