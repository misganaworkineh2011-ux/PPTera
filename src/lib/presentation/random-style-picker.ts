/**
 * Random style picker — once generation has decided a slide's content-layout
 * FAMILY, the specific layout inside that family is chosen at random (user
 * preference: variety over deterministic scoring). Random still respects the
 * only hard constraint that matters visually: the style's item capacity —
 * a 1-quote hero layout must not receive four testimonials, a 2x2 matrix
 * wants exactly four items. The immediately preceding slide's style is
 * excluded so decks never show the same style twice in a row.
 */

import { stylesForCategory, type StyleCatalogEntry } from "~/lib/layouts/style-catalog";

export interface RandomStyleOptions {
  /** How many content items the slide carries (sections/bullets). */
  itemCount?: number;
  /** Style id to avoid (e.g. the previous slide's style). */
  exclude?: string;
  /** Injectable RNG for tests; defaults to Math.random. */
  rng?: () => number;
}

/**
 * Pick a random style id within a family. Returns null when the family has no
 * registered styles (caller keeps its existing choice).
 */
export function pickRandomStyle(category: string, opts: RandomStyleOptions = {}): string | null {
  const { itemCount, exclude, rng = Math.random } = opts;
  const all = stylesForCategory(category);
  if (all.length === 0) return null;

  // Keep styles whose capacity fits the slide's item count. If nothing fits
  // exactly, relax to the styles closest to fitting rather than failing.
  let candidates: StyleCatalogEntry[] = all;
  if (typeof itemCount === "number" && itemCount > 0) {
    const fits = all.filter((s) => itemCount >= s.minItems && itemCount <= s.maxItems);
    if (fits.length > 0) {
      candidates = fits;
    } else {
      const distance = (s: StyleCatalogEntry) =>
        itemCount < s.minItems ? s.minItems - itemCount : itemCount - s.maxItems;
      const best = Math.min(...all.map(distance));
      candidates = all.filter((s) => distance(s) === best);
    }
  }

  // Avoid repeating the previous style when there is any alternative.
  if (exclude && candidates.length > 1) {
    const without = candidates.filter((s) => s.id !== exclude);
    if (without.length > 0) candidates = without;
  }

  const idx = Math.min(candidates.length - 1, Math.floor(rng() * candidates.length));
  return candidates[idx]!.id;
}
