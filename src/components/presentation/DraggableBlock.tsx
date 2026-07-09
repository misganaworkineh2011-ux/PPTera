"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Move, RotateCcw } from "lucide-react";

export interface BlockOffset {
  x: number;
  y: number;
  /** Explicit width in canvas px (1280x720 space). Missing = natural size. */
  w?: number;
  /** Explicit height in canvas px (1280x720 space). Missing = natural size. */
  h?: number;
}

const MIN_W = 60;
const MIN_H = 36;

// Content-fit zoom bounds: don't shrink text into illegibility or blow it up
// absurdly when a block is dragged far beyond its content.
const MIN_FIT = 0.4;
const MAX_FIT = 3;

type ResizeAxis = "x" | "y" | "xy";

/**
 * One step of the content-fit loop: scale the current zoom by how far the
 * rendered content height is from the block's target height. Snaps to 1 when
 * the correction is negligible (avoids pointless sub-pixel zoom blur).
 */
export function computeFitZoom(currentZoom: number, targetH: number, renderedH: number): number {
  if (!targetH || !renderedH || !currentZoom) return 1;
  let k = currentZoom * (targetH / renderedH);
  if (!Number.isFinite(k) || k <= 0) return 1;
  k = Math.min(MAX_FIT, Math.max(MIN_FIT, k));
  if (Math.abs(k - 1) < 0.04) return 1;
  return Math.round(k * 1000) / 1000;
}

/**
 * Wraps a slide block (title / content / image) so the owner can drag it to a
 * new spot and resize it on top of the automatic layout. Offsets and sizes are
 * stored in canvas pixels (the fixed 1280x720 space); pointer deltas are divided
 * by the live render scale so dragging tracks the cursor 1:1 at any zoom.
 *
 * With `fitContent`, a block that has an explicit height scales everything
 * inside it (text, cards, icons) to fill that height: growing content when the
 * bottom resizer makes room for it, shrinking it when the content would
 * otherwise overflow and hide. Uses CSS zoom so text reflows instead of
 * cropping, and converges over a few measure/adjust passes.
 *
 * It renders nothing extra when the block hasn't been moved/resized and isn't
 * editable, so existing slides and present/thumbnail views are unaffected.
 */
export default function DraggableBlock({
  blockId,
  offset,
  editable = false,
  fill = false,
  fitContent = false,
  onMove,
  children,
}: {
  blockId: string;
  offset?: BlockOffset;
  /** True only in the owner's editor view. */
  editable?: boolean;
  /** Stretch the wrapper to fill its region (for the content block). */
  fill?: boolean;
  /** Scale inner content to fill an explicitly-resized height (text blocks). */
  fitContent?: boolean;
  onMove?: (blockId: string, offset: BlockOffset) => void;
  children: ReactNode;
}) {
  const base: BlockOffset = offset ?? { x: 0, y: 0 };
  const [live, setLive] = useState<BlockOffset | null>(null);
  const [interacting, setInteracting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const current = live ?? base;
  const moved = current.x !== 0 || current.y !== 0;
  const sized = current.w != null || current.h != null;
  const canEditBlock = editable && !!onMove;
  const fitActive = fitContent && current.h != null;

  // Last applied fit: target height/width plus the content's scrollHeight at
  // the applied zoom. While these are unchanged the fit is settled and re-runs
  // are zero-write no-ops — this is what prevents any feedback loop with
  // SlideScaler's fitScale observer.
  const fitSig = useRef<{ h: number; w?: number; scroll: number } | null>(null);

  // Scale the content to the block's explicit height — deterministically, in
  // one shot: measure the natural height at zoom 1 (inside the layout effect,
  // so nothing paints in between), derive k = target/natural, apply, and do a
  // single wrap-correction pass. All math uses offsetHeight/scrollHeight and
  // the stored canvas-px height, which are immune to ancestor transforms, so
  // SlideScaler's displayScale/fitScale never enter the equation.
  const applyFit = useCallback(() => {
    const inner = innerRef.current;
    if (!inner) return;
    if (!fitActive || current.h == null) {
      fitSig.current = null;
      if (inner.style.getPropertyValue("zoom")) inner.style.removeProperty("zoom");
      return;
    }
    const target = current.h;
    const sig = fitSig.current;
    if (sig && sig.h === target && sig.w === current.w && sig.scroll === inner.scrollHeight) {
      return; // settled — nothing changed since the last fit
    }

    inner.style.removeProperty("zoom");
    const natural = inner.offsetHeight; // layout px at zoom 1
    if (!natural) {
      fitSig.current = null;
      return;
    }
    const k = computeFitZoom(1, target, natural);
    if (k !== 1) {
      inner.style.setProperty("zoom", String(k));
      // Zooming narrows the local wrap width, which can add/remove text lines.
      // Correct once from the re-measured height, then stop — never iterate,
      // so discrete wrap jumps can't oscillate.
      const rewrapped = inner.offsetHeight;
      if (rewrapped) {
        const k2 = computeFitZoom(1, target, rewrapped);
        if (k2 === 1) inner.style.removeProperty("zoom");
        else if (k2 !== k) inner.style.setProperty("zoom", String(k2));
      }
    }
    fitSig.current = { h: target, w: current.w, scroll: inner.scrollHeight };
  }, [fitActive, current.h, current.w]);

  // Re-fit after every render (content edits re-render the slide; live resize
  // renders per pointermove). The signature guard makes settled runs free.
  useLayoutEffect(() => {
    applyFit();
  });

  // Zero-impact passthrough: don't add any DOM when there's nothing to show/do.
  if (!canEditBlock && !moved && !sized) return <>{children}</>;

  // Total on-screen scale (displayScale * fitScale) = renderedWidth / layoutWidth.
  const getScale = () => {
    const el = ref.current;
    return el && el.offsetWidth
      ? el.getBoundingClientRect().width / el.offsetWidth
      : 1;
  };

  const startDrag = (e: ReactPointerEvent) => {
    if (!canEditBlock) return;
    e.preventDefault();
    e.stopPropagation();

    const scale = getScale();
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...current };
    setInteracting(true);

    const handleMove = (ev: PointerEvent) => {
      setLive({
        ...start,
        x: start.x + (ev.clientX - startX) / scale,
        y: start.y + (ev.clientY - startY) / scale,
      });
    };
    const handleUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      const final = {
        ...start,
        x: Math.round(start.x + (ev.clientX - startX) / scale),
        y: Math.round(start.y + (ev.clientY - startY) / scale),
      };
      setLive(null);
      setInteracting(false);
      onMove?.(blockId, final);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const startResize = (axis: ResizeAxis) => (e: ReactPointerEvent) => {
    if (!canEditBlock) return;
    e.preventDefault();
    e.stopPropagation();

    const el = ref.current;
    if (!el) return;
    const scale = getScale();
    const startX = e.clientX;
    const startY = e.clientY;
    // Capture the block's current rendered size in layout px so the first
    // resize starts from what the user sees, not from an arbitrary default.
    const startW = current.w ?? el.offsetWidth;
    const startH = current.h ?? el.offsetHeight;
    const start = { ...current };
    setInteracting(true);

    const compute = (ev: PointerEvent): BlockOffset => {
      const next: BlockOffset = { ...start };
      if (axis === "x" || axis === "xy") {
        next.w = Math.max(MIN_W, startW + (ev.clientX - startX) / scale);
      }
      if (axis === "y" || axis === "xy") {
        next.h = Math.max(MIN_H, startH + (ev.clientY - startY) / scale);
      }
      return next;
    };

    const handleMove = (ev: PointerEvent) => setLive(compute(ev));
    const handleUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      const raw = compute(ev);
      const final: BlockOffset = {
        ...raw,
        w: raw.w != null ? Math.round(raw.w) : undefined,
        h: raw.h != null ? Math.round(raw.h) : undefined,
      };
      setLive(null);
      setInteracting(false);
      onMove?.(blockId, final);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const handleBase =
    "absolute z-20 touch-none rounded-full border border-slate-200 bg-white shadow-md opacity-0 transition-opacity group-hover/drag:opacity-100 hover:!opacity-100";

  return (
    <div
      ref={ref}
      className={`group/drag relative ${fill ? "h-full w-full" : ""}`}
      style={{
        transform: moved ? `translate(${current.x}px, ${current.y}px)` : undefined,
        width: current.w != null ? `${current.w}px` : undefined,
        height: current.h != null ? `${current.h}px` : undefined,
        maxWidth: current.w != null ? "none" : undefined,
        zIndex: live ? 50 : undefined,
        outline: interacting ? "1.5px dashed rgba(59,130,246,0.75)" : undefined,
        outlineOffset: interacting ? "2px" : undefined,
      }}
    >
      {/* Content wrapper: auto-height while fitting (so natural size is
          measurable), full-height otherwise to preserve fill layouts. */}
      <div ref={innerRef} className={`w-full ${fill && !fitActive ? "h-full" : ""}`}>
        {children}
      </div>

      {canEditBlock && (
        <>
          <button
            type="button"
            onPointerDown={startDrag}
            title="Drag to move"
            aria-label={`Move ${blockId}`}
            className="absolute -left-3 -top-3 z-20 flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 opacity-0 shadow-md transition-opacity hover:text-slate-800 active:cursor-grabbing group-hover/drag:opacity-100"
          >
            <Move size={14} />
          </button>
          {(moved || sized) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLive(null);
                onMove?.(blockId, { x: 0, y: 0 });
              }}
              title="Reset position & size"
              aria-label={`Reset ${blockId} position and size`}
              className="absolute -left-3 top-5 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 opacity-0 shadow-md transition-opacity hover:text-slate-800 group-hover/drag:opacity-100"
            >
              <RotateCcw size={12} />
            </button>
          )}

          {/* Resize handles: right edge (width), bottom edge (height), corner (both) */}
          <button
            type="button"
            onPointerDown={startResize("x")}
            title="Resize width"
            aria-label={`Resize ${blockId} width`}
            className={`${handleBase} top-1/2 -right-1.5 h-8 w-2.5 -translate-y-1/2 cursor-ew-resize`}
          />
          <button
            type="button"
            onPointerDown={startResize("y")}
            title="Resize height (content scales to fit)"
            aria-label={`Resize ${blockId} height`}
            className={`${handleBase} left-1/2 -bottom-1.5 h-2.5 w-8 -translate-x-1/2 cursor-ns-resize`}
          />
          <button
            type="button"
            onPointerDown={startResize("xy")}
            title="Resize"
            aria-label={`Resize ${blockId}`}
            className={`${handleBase} -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize border-blue-300 ring-1 ring-blue-400/40`}
          />
        </>
      )}
    </div>
  );
}
