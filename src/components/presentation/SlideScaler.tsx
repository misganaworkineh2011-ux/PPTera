"use client";

import { useRef, useState, useLayoutEffect, type ReactNode, type CSSProperties } from "react";

/**
 * Fixed slide canvas with shrink-to-fit. Every slide is laid out at this exact
 * size and then uniformly scaled to fit its container — the approach every real
 * slide tool uses (and what the deck thumbnails already do).
 *
 * Two scales are applied:
 *  - displayScale: maps the fixed 16:9 canvas onto the on-screen box, so the
 *    editor view and the fullscreen view are pixel-identical (just scaled) and
 *    every slide is exactly the same size.
 *  - fitScale: if a slide's content is intrinsically taller than the canvas
 *    (dense AI slides — big top image + several steps), the content is scaled
 *    down so nothing is ever clipped. Most slides fit and get fitScale = 1.
 *
 * Fonts in slide content use cqw (container-query width) which resolves against
 * this fixed-width canvas, so text is sized for the slide, not the browser window.
 */
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

export default function SlideScaler({
  children,
  className = "",
  overlay,
}: {
  children: ReactNode;
  className?: string;
  /**
   * Rendered inside the fixed 1280x720 canvas as a sibling of the content, so it
   * scales with the slide (displayScale) but is NOT shrunk by content fit-scaling.
   * Used for master-slide elements (logo, footer, slide numbers).
   */
  overlay?: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [displayScale, setDisplayScale] = useState(0);
  const [fitScale, setFitScale] = useState(1);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;

    const measure = () => {
      const { width, height } = box.getBoundingClientRect();
      if (width > 0 && height > 0) {
        const ds = Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT);
        setDisplayScale((prev) => (Math.abs(prev - ds) > 0.001 ? ds : prev));
      }
      // Natural content height at the fixed canvas width. A CSS transform does
      // not affect scrollHeight, so reading it while fitScale is applied is
      // stable (no feedback loop). Content roots vertically center their
      // children (justify-center), so when the content is taller than the
      // canvas it overflows symmetrically and scrollHeight counts only the lower
      // half — reconstruct the true height as (2 * overflowed - canvas) so the
      // shrink-to-fit accounts for the hidden top half and nothing is clipped.
      const measured = content.scrollHeight;
      const natural =
        measured > CANVAS_HEIGHT ? 2 * measured - CANVAS_HEIGHT : measured;
      const fs = natural > CANVAS_HEIGHT ? CANVAS_HEIGHT / natural : 1;
      setFitScale((prev) => (Math.abs(prev - fs) > 0.001 ? fs : prev));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  const canvasStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    transform: `translate(-50%, -50%) scale(${displayScale})`,
    transformOrigin: "center center",
    // Establish a query container so cqw font sizes resolve against the fixed
    // canvas width instead of the window.
    containerType: "size",
  };

  const contentStyle: CSSProperties = {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    transform: `scale(${fitScale})`,
    transformOrigin: "center center",
  };

  return (
    <div ref={boxRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <div style={canvasStyle}>
        <div ref={contentRef} style={contentStyle}>
          {children}
        </div>
        {overlay}
      </div>
    </div>
  );
}
