/**
 * Deck-Level Diversity Tests
 *
 * Regression guard for the "every deck looks the same" failure mode: layout
 * selection used to converge on boxes/bullets because the LLM's
 * contentLayoutHint carried no scoring weight, the repetition penalty only
 * looked at a 4-slide window, and categories without a GENERIC affinity were
 * mathematically locked out of typical content.
 *
 * These tests simulate a full deck the same way the create-presentation route
 * does (threading previousLayouts/categoryUsage across slides) and assert the
 * aggregate behavior: variety across the deck and hints being honored.
 */

import { describe, it, expect } from "vitest";
import { selectLayout } from "../layout-selection";
import type { LayoutSelectionContext } from "../types";

// Typical AI-expanded content: label-style bullets with medium-length text,
// which classifies as GENERIC/SIMPLE_LIST — the exact shape that used to
// collapse every deck onto the same two layouts.
const GENERIC_BULLETS = [
  "Strong fundamentals: build a reliable base before scaling anything",
  "Clear communication: keep every stakeholder aligned on progress",
  "Steady iteration: ship small improvements on a regular cadence",
  "Honest measurement: track outcomes, not activity, to stay honest",
];

function makeSlide(index: number, contentLayoutHint?: string) {
  return {
    type: "content" as const,
    title: `Slide ${index + 1}: Key considerations`,
    bulletPoints: GENERIC_BULLETS,
    semanticIntent: "inform",
    visualStrategy: {
      primary: "text-focused",
      pattern: "cards",
      emphasis: "clarity",
    },
    contentLayoutHint,
  };
}

async function simulateDeck(hints: Array<string | undefined>) {
  const context: LayoutSelectionContext = {
    slideIndex: 0,
    totalSlides: hints.length,
    previousLayouts: [],
    categoryUsage: new Map(),
    styleUsage: new Map(),
  };

  const selected: string[] = [];
  for (let i = 0; i < hints.length; i++) {
    context.slideIndex = i;
    const result = await selectLayout({
      slide: makeSlide(i, hints[i]),
      context,
      // Generous timeout so slow CI machines never fall back to the
      // fallback layout and fake a diversity failure.
      options: { timeout: 2000 },
    });

    selected.push(result.category);
    context.previousLayouts.push({
      slideIndex: i,
      category: result.category,
      style: result.style,
      slideLayout: result.slideLayout,
    });
    const used = context.categoryUsage.get(result.category) ?? 0;
    context.categoryUsage.set(result.category, used + 1);
  }
  return selected;
}

describe("Deck-level layout diversity", () => {
  it("a 10-slide deck with NO hints uses at least 4 distinct categories and never repeats consecutively", async () => {
    const selected = await simulateDeck(new Array(10).fill(undefined));

    // Never two identical layouts back to back
    for (let i = 1; i < selected.length; i++) {
      expect(selected[i]).not.toBe(selected[i - 1]);
    }

    // Real deck-wide variety, not an A-B-A-B oscillation
    const distinct = new Set(selected);
    expect(distinct.size).toBeGreaterThanOrEqual(4);
  });

  it("honors the LLM's diverse hints for the majority of slides", async () => {
    // Hints the outline LLM could plausibly emit for generic list content
    const hints = [
      "boxes",
      "editorial",
      "checklist",
      "icongrid",
      "agenda",
      "definitionlist",
      "bullets",
      "zigzag",
      "editorial",
      "bento",
    ];
    const selected = await simulateDeck(hints);

    const honored = selected.filter((cat, i) => cat === hints[i]).length;
    // The hint bonus should make hinted categories win most of the time
    // (a few may lose to capacity/affinity mismatches — that's fine).
    expect(honored).toBeGreaterThanOrEqual(6);
  });
});
