import { describe, it, expect } from "vitest";
import { pickRandomStyle } from "../random-style-picker";
import { ALL_STYLE_CATEGORIES, stylesForCategory } from "~/lib/layouts/style-catalog";
import { getLayoutCategory } from "~/components/presentation/slide-layout-utils";

describe("style catalog integrity (shared panel/generation source)", () => {
  it("has styles for every listed category, with coherent capacities", () => {
    for (const cat of ALL_STYLE_CATEGORIES) {
      expect(cat.layouts.length, `${cat.id} has no styles`).toBeGreaterThan(0);
      for (const s of cat.layouts) {
        expect(s.minItems, `${s.id} min>max`).toBeLessThanOrEqual(s.maxItems);
        expect(s.idealItems, `${s.id} ideal<min`).toBeGreaterThanOrEqual(s.minItems);
        expect(s.idealItems, `${s.id} ideal>max`).toBeLessThanOrEqual(s.maxItems);
      }
    }
  });

  it("every style id dispatches back to its own category at render time", () => {
    // getLayoutCategory is the real render dispatch (prefix-based); a typo'd id
    // would render under the wrong family or fall back to boxes.
    for (const cat of ALL_STYLE_CATEGORIES) {
      for (const s of cat.layouts) {
        expect(getLayoutCategory(s.id), `${s.id} dispatches to wrong family`).toBe(cat.id);
      }
    }
  });

  it("has no duplicate style ids anywhere", () => {
    const ids = ALL_STYLE_CATEGORIES.flatMap((c) => c.layouts.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("pickRandomStyle", () => {
  it("returns null for unknown categories (caller keeps its choice)", () => {
    expect(pickRandomStyle("not-a-family")).toBeNull();
  });

  it("is uniform-random across the family via the injected rng", () => {
    const quotes = stylesForCategory("quotes");
    const first = pickRandomStyle("quotes", { rng: () => 0 });
    const last = pickRandomStyle("quotes", { rng: () => 0.999999 });
    expect(first).toBe(quotes[0]!.id);
    expect(last).toBe(quotes[quotes.length - 1]!.id);
  });

  it("only picks styles whose capacity fits the item count", () => {
    // One quote: styles requiring 2+ items must never be picked.
    for (let i = 0; i < 25; i++) {
      const id = pickRandomStyle("quotes", { itemCount: 1, rng: () => i / 25 });
      const style = stylesForCategory("quotes").find((s) => s.id === id)!;
      expect(style.minItems, `${id} needs ${style.minItems}+ items`).toBeLessThanOrEqual(1);
      expect(style.maxItems).toBeGreaterThanOrEqual(1);
    }
  });

  it("relaxes to the closest-capacity styles when nothing fits exactly", () => {
    // 40 items fits nothing; the pick must be among the largest-capacity styles.
    const id = pickRandomStyle("quotes", { itemCount: 40, rng: () => 0 });
    const styles = stylesForCategory("quotes");
    const maxCap = Math.max(...styles.map((s) => s.maxItems));
    const picked = styles.find((s) => s.id === id)!;
    expect(picked.maxItems).toBe(maxCap);
  });

  it("never repeats the excluded (previous) style when alternatives exist", () => {
    const styles = stylesForCategory("boxes");
    expect(styles.length).toBeGreaterThan(1);
    const excluded = styles[0]!.id;
    for (let i = 0; i < 30; i++) {
      const id = pickRandomStyle("boxes", { exclude: excluded, rng: () => i / 30 });
      expect(id).not.toBe(excluded);
    }
  });

  it("weights the draw toward styles whose idealItems match the item count", () => {
    // Deterministic LCG so the distribution is reproducible.
    const lcg = (seed: number) => {
      let s = seed >>> 0;
      return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 2 ** 32;
      };
    };

    const itemCount = 3;
    const all = stylesForCategory("quotes").filter(
      (s) => itemCount >= s.minItems && itemCount <= s.maxItems
    );
    const weight = (s: (typeof all)[number]) => Math.pow(0.5, Math.abs(s.idealItems - itemCount));
    const maxW = Math.max(...all.map(weight));
    const minW = Math.min(...all.map(weight));
    // The quotes family has styles at different ideals for 3 items — if this
    // ever becomes uniform the assertion below would be vacuous.
    expect(maxW).toBeGreaterThan(minW);

    const bestId = all.find((s) => weight(s) === maxW)!.id;
    const worstId = all.find((s) => weight(s) === minW)!.id;

    const rng = lcg(42);
    const counts = new Map<string, number>();
    const draws = 6000;
    for (let i = 0; i < draws; i++) {
      const id = pickRandomStyle("quotes", { itemCount, rng })!;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    const bestCount = counts.get(bestId) ?? 0;
    const worstCount = counts.get(worstId) ?? 0;
    // Ideal-matching style must be drawn far more often than the farthest one
    // (weight ratio is >= 2x; require >= 1.5x to keep the test robust).
    expect(bestCount).toBeGreaterThan(worstCount * 1.5);
    // But the far style must still be POSSIBLE — weighting, not elimination.
    expect(worstCount).toBeGreaterThan(0);

    // Empirical share of the best style should be near its expected share.
    const totalW = all.reduce((a, s) => a + weight(s), 0);
    const expectedShare = maxW / totalW;
    const empiricalShare = bestCount / draws;
    expect(Math.abs(empiricalShare - expectedShare)).toBeLessThan(expectedShare * 0.35);
  });

  it("still returns the excluded style when it is the only candidate", () => {
    // matrix with exactly 4 items: if filtering leaves a single style, exclusion must not empty the pool.
    const styles = stylesForCategory("matrix");
    if (styles.length === 1) {
      expect(pickRandomStyle("matrix", { exclude: styles[0]!.id })).toBe(styles[0]!.id);
    } else {
      // Family grew: exclusion simply avoids the excluded id.
      const id = pickRandomStyle("matrix", { exclude: styles[0]!.id, rng: () => 0 });
      expect(id).not.toBe(styles[0]!.id);
    }
  });
});
