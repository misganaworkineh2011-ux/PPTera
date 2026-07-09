"use client";

import { useEffect, useState } from "react";
import { X, BarChart3, Loader2, Eye, Clock } from "lucide-react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "~/components/presentation/types";
import { getModalColors } from "./ui-colors";

interface EngagementRow {
  slideIndex: number;
  views: number;
  totalMs: number;
}

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  presentationId: string;
  slides: SlideData[];
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

/**
 * Viewer analytics for shared decks: total views plus per-slide reads and
 * watch time (fed by public-view beacons), with a drop-off bar per slide.
 */
export function InsightsModal({
  isOpen,
  onClose,
  theme,
  presentationId,
  slides,
}: InsightsModalProps) {
  const [rows, setRows] = useState<EngagementRow[]>([]);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = getModalColors(theme);
  const accent = theme.colors.accent || theme.colors.primary || "#6366f1";

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    fetch(`/api/presentations/${presentationId}/engagement`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setRows(data.slides ?? []);
        setTotalViews(data.totalViews ?? 0);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [isOpen, presentationId]);

  if (!isOpen) return null;

  const maxViews = Math.max(1, ...rows.map((r) => r.views));
  const byIndex = new Map(rows.map((r) => [r.slideIndex, r]));

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[80vh] w-[560px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: colors.bg, borderColor: colors.border }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-3.5"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={16} style={{ color: accent }} />
            <h2 className="text-sm font-bold" style={{ color: colors.text }}>
              Viewer analytics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:opacity-70"
            style={{ color: colors.textMuted }}
            aria-label="Close analytics"
          >
            <X size={16} />
          </button>
        </div>

        {/* Summary */}
        <div
          className="flex items-center gap-6 border-b px-5 py-3"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-2">
            <Eye size={14} style={{ color: accent }} />
            <span className="text-sm font-bold tabular-nums" style={{ color: colors.text }}>
              {totalViews}
            </span>
            <span className="text-xs" style={{ color: colors.textMuted }}>
              total views
            </span>
          </div>
          <p className="text-[0.65rem] leading-snug" style={{ color: colors.textMuted }}>
            Per-slide numbers come from public share links (deck + web page views).
          </p>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div
              className="flex items-center justify-center gap-2 py-10 text-xs"
              style={{ color: colors.textMuted }}
            >
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : error ? (
            <p className="py-8 text-center text-xs" style={{ color: "#ef4444" }}>
              {error}
            </p>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-xs" style={{ color: colors.textMuted }}>
              No engagement yet. Share the deck publicly — per-slide reads and
              watch time will appear here.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {slides.map((slide, idx) => {
                const row = byIndex.get(idx);
                const views = row?.views ?? 0;
                const avgMs = row && row.views > 0 ? row.totalMs / row.views : 0;
                return (
                  <div key={idx}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span
                        className="min-w-0 flex-1 truncate text-xs font-semibold"
                        style={{ color: colors.text }}
                      >
                        {idx + 1}. {slide.title || "Untitled"}
                      </span>
                      <span
                        className="flex shrink-0 items-center gap-2 text-[0.65rem] tabular-nums"
                        style={{ color: colors.textMuted }}
                      >
                        <span className="flex items-center gap-1">
                          <Eye size={10} /> {views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {formatDuration(avgMs)} avg
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full"
                      style={{ backgroundColor: `${accent}1f` }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(views / maxViews) * 100}%`,
                          background: `linear-gradient(90deg, ${accent}cc, ${accent})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
