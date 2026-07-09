"use client";

import { useCallback, useEffect, useState } from "react";
import {
  X,
  MessageSquare,
  Loader2,
  Send,
  Check,
  Trash2,
  CircleDot,
} from "lucide-react";
import type { Theme } from "~/lib/themes";
import { getModalColors } from "./ui-colors";

interface DeckComment {
  id: string;
  slideIndex: number;
  authorId: string;
  authorName: string;
  body: string;
  resolved: boolean;
  createdAt: string;
}

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  presentationId: string;
  currentSlide: number;
  totalSlides: number;
  /** Jump the editor to a slide when a comment is clicked. */
  onGoToSlide?: (index: number) => void;
}

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/** Review comments anchored to slides, with resolve + delete. */
export function CommentsPanel({
  isOpen,
  onClose,
  theme,
  presentationId,
  currentSlide,
  totalSlides,
  onGoToSlide,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<DeckComment[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<"slide" | "all">("all");
  const [showResolved, setShowResolved] = useState(false);

  const colors = getModalColors(theme);
  const accent = theme.colors.accent || theme.colors.primary || "#6366f1";

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/comments`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments ?? []);
        setIsOwner(Boolean(data.isOwner));
      } else {
        setError(data.error || "Failed to load comments");
      }
    } catch {
      setError("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [presentationId]);

  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen, load]);

  const post = async () => {
    const text = draft.trim();
    if (!text || isPosting) return;
    setIsPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/presentations/${presentationId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideIndex: currentSlide, body: text }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setDraft("");
      } else {
        setError(data.error || "Failed to post comment");
      }
    } catch {
      setError("Failed to post comment");
    } finally {
      setIsPosting(false);
    }
  };

  const toggleResolve = async (comment: DeckComment) => {
    const res = await fetch(
      `/api/presentations/${presentationId}/comments/${comment.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: !comment.resolved }),
      },
    );
    if (res.ok) {
      const data = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? data.comment : c)),
      );
    }
  };

  const remove = async (comment: DeckComment) => {
    const res = await fetch(
      `/api/presentations/${presentationId}/comments/${comment.id}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    }
  };

  if (!isOpen) return null;

  const visible = comments
    .filter((c) => (scope === "slide" ? c.slideIndex === currentSlide : true))
    .filter((c) => (showResolved ? true : !c.resolved));
  const openCount = comments.filter((c) => !c.resolved).length;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
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
            <MessageSquare size={16} style={{ color: accent }} />
            <h2 className="text-sm font-bold" style={{ color: colors.text }}>
              Comments
            </h2>
            {openCount > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold tabular-nums"
                style={{ backgroundColor: `${accent}1f`, color: accent }}
              >
                {openCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:opacity-70"
            style={{ color: colors.textMuted }}
            aria-label="Close comments"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filters */}
        <div
          className="flex items-center gap-2 border-b px-4 py-2"
          style={{ borderColor: colors.border }}
        >
          {(["all", "slide"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className="rounded-full px-2.5 py-1 text-[0.65rem] font-semibold transition"
              style={{
                backgroundColor: scope === s ? `${accent}1f` : "transparent",
                color: scope === s ? accent : colors.textMuted,
                border: `1px solid ${scope === s ? `${accent}3d` : colors.border}`,
              }}
            >
              {s === "all" ? "All slides" : `Slide ${currentSlide + 1}`}
            </button>
          ))}
          <label
            className="ml-auto flex cursor-pointer items-center gap-1.5 text-[0.65rem]"
            style={{ color: colors.textMuted }}
          >
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
            />
            Resolved
          </label>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {isLoading ? (
            <div
              className="flex items-center justify-center gap-2 py-8 text-xs"
              style={{ color: colors.textMuted }}
            >
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : visible.length === 0 ? (
            <p
              className="px-2 py-10 text-center text-xs leading-relaxed"
              style={{ color: colors.textMuted }}
            >
              No comments {scope === "slide" ? "on this slide" : ""} yet. Write
              the first one below — it anchors to the slide you're viewing.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border px-3 py-2.5"
                  style={{
                    borderColor: colors.border,
                    background: colors.surface,
                    opacity: c.resolved ? 0.6 : 1,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onGoToSlide?.(c.slideIndex)}
                      className="flex min-w-0 items-center gap-1.5 text-[0.65rem] font-bold hover:underline"
                      style={{ color: accent }}
                      title="Go to slide"
                    >
                      <CircleDot size={10} />
                      Slide {Math.min(c.slideIndex + 1, totalSlides)}
                    </button>
                    <span className="text-[0.6rem]" style={{ color: colors.textMuted }}>
                      {relativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold" style={{ color: colors.text }}>
                    {c.authorName}
                  </p>
                  <p
                    className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed"
                    style={{
                      color: colors.text,
                      textDecoration: c.resolved ? "line-through" : "none",
                    }}
                  >
                    {c.body}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => toggleResolve(c)}
                      className="flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[0.6rem] font-semibold transition hover:opacity-80"
                      style={{
                        borderColor: c.resolved ? colors.border : `${accent}3d`,
                        color: c.resolved ? colors.textMuted : accent,
                      }}
                    >
                      <Check size={10} />
                      {c.resolved ? "Reopen" : "Resolve"}
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => remove(c)}
                        className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[0.6rem] font-semibold transition hover:opacity-80"
                        style={{ color: colors.textMuted }}
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t px-3 py-3" style={{ borderColor: colors.border }}>
          {error && (
            <p className="mb-2 text-[0.65rem]" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void post();
                }
              }}
              rows={2}
              placeholder={`Comment on slide ${currentSlide + 1}…`}
              className="min-h-[40px] flex-1 resize-none rounded-xl border px-3 py-2 text-xs focus:outline-none"
              style={{
                background: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              }}
            />
            <button
              onClick={post}
              disabled={!draft.trim() || isPosting}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: accent }}
              aria-label="Post comment"
            >
              {isPosting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
