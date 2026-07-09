"use client";

import { useCallback, useEffect, useState } from "react";
import { X, History, Loader2, RotateCcw, Camera, Clock } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "~/components/presentation/types";
import { getModalColors } from "./ui-colors";

interface VersionMeta {
  id: string;
  title: string;
  label: string | null;
  createdAt: string;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  presentationId: string;
  /** Called with the restored slides + title after a successful restore. */
  onRestored: (slides: SlideData[], title: string) => void;
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function HistoryPanel({
  isOpen,
  onClose,
  theme,
  presentationId,
  onRestored,
}: HistoryPanelProps) {
  const [versions, setVersions] = useState<VersionMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const colors = getModalColors(theme);

  const loadVersions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/versions`);
      const data = await res.json();
      if (res.ok) {
        setVersions(data.versions ?? []);
      } else {
        setError(data.error || "Failed to load history");
      }
    } catch {
      setError("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, [presentationId]);

  useEffect(() => {
    if (isOpen) {
      void loadVersions();
      setConfirmingId(null);
    }
  }, [isOpen, loadVersions]);

  const handleSnapshot = async () => {
    setIsSnapshotting(true);
    setError(null);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Manual snapshot" }),
      });
      if (res.ok) {
        await loadVersions();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save snapshot");
      }
    } catch {
      setError("Failed to save snapshot");
    } finally {
      setIsSnapshotting(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    setBusyId(versionId);
    setError(null);
    try {
      const res = await fetch(
        `/api/presentations/${presentationId}/versions/${versionId}/restore`,
        { method: "POST" },
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.slides)) {
        onRestored(data.slides as SlideData[], data.title as string);
        await loadVersions();
        setConfirmingId(null);
      } else {
        setError(data.error || "Failed to restore version");
      }
    } catch {
      setError("Failed to restore version");
    } finally {
      setBusyId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l shadow-2xl animate-in slide-in-from-right duration-300"
        style={{ background: colors.bg, borderColor: colors.border }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-2">
            <History size={16} style={{ color: theme.colors.primary }} />
            <h2 className="text-sm font-bold" style={{ color: colors.text }}>
              Version history
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:opacity-70"
            style={{ color: colors.textMuted }}
            aria-label="Close history"
          >
            <X size={16} />
          </button>
        </div>

        {/* Save snapshot */}
        <div className="border-b px-4 py-3" style={{ borderColor: colors.border }}>
          <button
            onClick={handleSnapshot}
            disabled={isSnapshotting}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: theme.colors.primary }}
          >
            {isSnapshotting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Camera size={13} />
            )}
            Save snapshot now
          </button>
          <p className="mt-2 text-[0.65rem] leading-snug" style={{ color: colors.textMuted }}>
            Snapshots are also saved automatically while you edit and before AI
            deck edits. The last 30 are kept.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 pt-3">
            <p className="text-xs" style={{ color: "#ef4444" }}>
              {error}
            </p>
          </div>
        )}

        {/* Versions list */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {isLoading ? (
            <div
              className="flex items-center justify-center gap-2 py-8 text-xs"
              style={{ color: colors.textMuted }}
            >
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : versions.length === 0 ? (
            <div
              className="flex flex-col items-center gap-2 py-10 text-center text-xs"
              style={{ color: colors.textMuted }}
            >
              <Clock size={20} />
              <p>
                No versions yet. Snapshots appear here as you edit — or save
                one now.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="rounded-xl border px-3 py-2.5"
                  style={{ borderColor: colors.border, background: colors.surface }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-xs font-bold"
                        style={{ color: colors.text }}
                      >
                        {v.label || "Snapshot"}
                      </div>
                      <div className="text-[0.65rem]" style={{ color: colors.textMuted }}>
                        {relativeTime(v.createdAt)} · {v.title}
                      </div>
                    </div>
                    {confirmingId === v.id ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => handleRestore(v.id)}
                          disabled={busyId === v.id}
                          className="rounded-lg px-2 py-1 text-[0.65rem] font-bold text-white disabled:opacity-50"
                          style={{ background: theme.colors.primary }}
                        >
                          {busyId === v.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            "Confirm"
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="rounded-lg px-2 py-1 text-[0.65rem] font-semibold"
                          style={{ color: colors.textMuted }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(v.id)}
                        className="flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[0.65rem] font-semibold transition-colors hover:opacity-80"
                        style={{ borderColor: colors.border, color: colors.text }}
                        title="Restore this version"
                      >
                        <RotateCcw size={11} /> Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
