import { describe, it, expect } from "vitest";
import {
  LAYOUT_CATALOG,
  getLayoutCatalogJson,
  familyById,
  isValidFamily,
  isKnownStyle,
  defaultStyleFor,
  catalogFamilies,
} from "../layout-catalog";
import { getLayoutCategory } from "~/components/presentation/slide-layout-utils";

describe("layout-catalog integrity", () => {
  it("has unique family ids", () => {
    const ids = LAYOUT_CATALOG.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every family's styles map back to that family via getLayoutCategory", () => {
    // getLayoutCategory is the real render-dispatch: slide.contentLayout (a
    // style id) → family. A typo'd style id would resolve to the wrong family
    // (or fall through to "boxes"), so this catches dead style ids.
    for (const fam of LAYOUT_CATALOG) {
      expect(fam.styles.length).toBeGreaterThan(0);
      for (const style of fam.styles) {
        expect(getLayoutCategory(style.id)).toBe(fam.id);
      }
    }
  });

  it("each family's default style is its first listed style", () => {
    for (const fam of LAYOUT_CATALOG) {
      expect(defaultStyleFor(fam.id)).toBe(fam.styles[0]!.id);
      expect(getLayoutCategory(defaultStyleFor(fam.id))).toBe(fam.id);
    }
  });

  it("item ranges are coherent (min ≤ ideal ≤ max, all ≥ 1)", () => {
    for (const fam of LAYOUT_CATALOG) {
      expect(fam.minItems).toBeGreaterThanOrEqual(1);
      expect(fam.minItems).toBeLessThanOrEqual(fam.idealItems);
      expect(fam.idealItems).toBeLessThanOrEqual(fam.maxItems);
    }
  });

  it("has a non-empty itemFormat and bestFor for every family", () => {
    for (const fam of LAYOUT_CATALOG) {
      expect(fam.itemFormat.trim().length).toBeGreaterThan(0);
      expect(fam.bestFor.trim().length).toBeGreaterThan(0);
    }
  });

  it("lookups behave", () => {
    const first = LAYOUT_CATALOG[0]!;
    expect(isValidFamily(first.id)).toBe(true);
    expect(isValidFamily("not-a-family")).toBe(false);
    expect(familyById(first.id)?.id).toBe(first.id);
    expect(isKnownStyle(first.id, first.styles[0]!.id)).toBe(true);
    expect(isKnownStyle(first.id, "bogus-style")).toBe(false);
  });

  it("getLayoutCatalogJson is valid JSON and honors the image filter", () => {
    const all = JSON.parse(getLayoutCatalogJson()) as Array<{ family: string; supportsImage: boolean }>;
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBe(LAYOUT_CATALOG.length);

    const imageOnly = JSON.parse(getLayoutCatalogJson({ hasImage: true })) as Array<{ family: string }>;
    expect(imageOnly.length).toBe(catalogFamilies({ hasImage: true }).length);
    expect(imageOnly.length).toBeLessThan(all.length);
    // Every family in the image-filtered catalog must support images.
    for (const fam of imageOnly) {
      expect(familyById(fam.family)?.supportsImage).toBe(true);
    }
  });
});
