import { describe, expect, it } from "vitest";
import { CURATED_TEMPLATES } from "./curated";
import { ALL_STYLE_CATEGORIES } from "~/lib/layouts/style-catalog";

/**
 * Curated templates are structure-only skeletons the generation flow expands.
 * These tests keep the catalog honest: hints must point at REAL layout
 * families (an unknown hint silently loses its scoring bonus), and every
 * skeleton must be well-formed enough to become an outline.
 */
describe("curated templates", () => {
  const familyIds = new Set<string>(ALL_STYLE_CATEGORIES.map((c) => c.id));

  it("has unique ids", () => {
    const ids = CURATED_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("offers a broad catalog", () => {
    expect(CURATED_TEMPLATES.length).toBeGreaterThanOrEqual(24);
    const categories = new Set(CURATED_TEMPLATES.map((t) => t.category));
    expect(categories.size).toBeGreaterThanOrEqual(8);
  });

  it("every template opens with a title slide and has content slides", () => {
    for (const tpl of CURATED_TEMPLATES) {
      expect(tpl.slides.length, tpl.id).toBeGreaterThanOrEqual(6);
      expect(tpl.slides[0]!.type, tpl.id).toBe("title");
      expect(
        tpl.slides.filter((s) => s.type === "content").length,
        tpl.id,
      ).toBeGreaterThanOrEqual(5);
    }
  });

  it("every content slide is complete (kicker, hint, bullets)", () => {
    for (const tpl of CURATED_TEMPLATES) {
      for (const slide of tpl.slides) {
        if (slide.type !== "content") continue;
        const label = `${tpl.id} → ${slide.title}`;
        expect(slide.kicker, label).toBeTruthy();
        expect(slide.contentLayoutHint, label).toBeTruthy();
        expect(slide.bulletPoints?.length ?? 0, label).toBeGreaterThanOrEqual(1);
        for (const bullet of slide.bulletPoints ?? []) {
          expect(bullet.trim().length, label).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every contentLayoutHint targets a real layout family", () => {
    for (const tpl of CURATED_TEMPLATES) {
      for (const slide of tpl.slides) {
        if (!slide.contentLayoutHint) continue;
        expect(
          familyIds.has(slide.contentLayoutHint),
          `${tpl.id} → "${slide.title}" hints unknown family "${slide.contentLayoutHint}"`,
        ).toBe(true);
      }
    }
  });

  it("exercises a wide slice of the layout system", () => {
    const used = new Set(
      CURATED_TEMPLATES.flatMap((t) =>
        t.slides.map((s) => s.contentLayoutHint).filter(Boolean),
      ),
    );
    expect(used.size).toBeGreaterThanOrEqual(25);
  });
});
