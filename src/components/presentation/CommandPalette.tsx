"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import type { Theme } from "~/lib/themes";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";

export interface Command {
  id: string;
  label: string;
  hint?: string;
  group?: string;
  icon?: ReactNode;
  keywords?: string;
  run: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  commands: Command[];
}

/**
 * ⌘K / Ctrl+K launcher: search and run any editor action, or jump to a slide.
 */
export default function CommandPalette({ isOpen, onClose, theme, commands }: CommandPaletteProps) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActive(0);
    }
  }, [isOpen]);

  const c = getModalColors(theme);
  const accent = c.accent || "#6366f1";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) =>
      `${cmd.label} ${cmd.keywords || ""} ${cmd.group || ""}`.toLowerCase().includes(q),
    );
  }, [query, commands]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!isOpen || !mounted) return null;

  const run = (cmd?: Command) => {
    if (!cmd) return;
    onClose();
    cmd.run();
  };

  const node = (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        style={{ background: c.bg, borderColor: c.border }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: c.border }}>
          <Search size={18} style={{ color: c.textMuted }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search slides…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: c.text }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                run(filtered[active]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
          />
          <kbd className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: c.hoverBg, color: c.textMuted }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm" style={{ color: c.textMuted }}>
              No matching commands
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => run(cmd)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
                style={{ backgroundColor: i === active ? c.hoverBg : "transparent" }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: accent + "1f", color: accent }}
                >
                  {cmd.icon}
                </span>
                <span className="flex-1 truncate text-sm" style={{ color: c.text }}>
                  {cmd.label}
                </span>
                {cmd.hint && (
                  <span className="shrink-0 text-xs tabular-nums" style={{ color: c.textMuted }}>
                    {cmd.hint}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
