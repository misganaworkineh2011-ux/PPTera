import type { CSSProperties } from "react";

/**
 * Shared outer "safe-area" frame for the content-layout renderers. Every layout
 * uses the SAME frame — identical margins and the same fill-and-center behaviour
 * — so a slide's components land in a consistent place no matter which layout the
 * AI picked, while each renderer's inner grid/flex stays free to arrange its
 * items dynamically. Combine with the renderer's own alignment, e.g.
 *   `${SLIDE_FRAME} flex flex-col justify-center`  (most card/list layouts)
 *   `${SLIDE_FRAME} flex items-center justify-center`  (a centered block)
 */
export const SLIDE_FRAME = "w-full h-full px-10 py-6";

/**
 * Shared "premium tile" styling for the AI content-layout renderers. Gives every
 * card a subtle accent-tinted gradient, a soft theme border, and (optionally) an
 * accent bar — paired with the `.ppt-tile` class (depth + hover lift) so all the
 * added layouts read as polished and cohesive instead of flat.
 *
 * `accent` is expected to be a 6-digit hex (theme colors are), so we can append
 * an alpha channel (e.g. `${accent}14`) the same way the renderers already do.
 */
export function tileStyle(
  cardBg: string,
  border: string,
  accent: string,
  opts?: { bar?: "left" | "top" | "none"; strength?: number },
): CSSProperties {
  const bar = opts?.bar ?? "none";
  const a = opts?.strength ?? 0x14; // ~8% accent wash by default
  const alpha = Math.max(0, Math.min(255, a)).toString(16).padStart(2, "0");
  const isHex = /^#([0-9a-f]{6})$/i.test(accent);
  const sheen = isHex ? `${accent}${alpha}` : "transparent";
  // A fainter secondary wash for a soft diagonal falloff.
  const faint = isHex ? `${accent}08` : "transparent";

  return {
    // A corner glow + gentle diagonal wash over the card colour reads more
    // dimensional and premium than a single flat gradient.
    background: `radial-gradient(120% 115% at 0% 0%, ${sheen} 0%, transparent 46%), linear-gradient(160deg, ${faint} 0%, transparent 62%), ${cardBg}`,
    border: `1px solid ${border}`,
    ...(bar === "left" ? { borderLeft: `3px solid ${accent}` } : {}),
    ...(bar === "top" ? { borderTop: `3px solid ${accent}` } : {}),
  };
}
