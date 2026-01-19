/**
 * Property-Based Tests for Context Tracker
 * 
 * Tests correctness properties:
 * - Property 7: Context Tracking Accuracy
 * 
 * Validates: Requirements 5.1, 5.2, 5.3
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { ContentLayoutCategory } from "~/lib/layouts/content";
import {
  createLayoutSelectionContext,
  trackLayoutUsage,
  getSlidePosition,
  calculateRepetitionPenalty,
  getRecentLayouts,
  wasUsedRecently,
  getCategoryUsageCount,
  getStyleUsageCount,
} from "./context-tracker";

// Arbitrary for ContentLayoutCategory
const contentLayoutCategoryArb = fc.constantFrom(
  "boxes",
  "bullets",
  "sequence",
  "steps",
  "quotes",
  "circles",
  "numbers",
  "images"
) as fc.Arbitrary<ContentLayoutCategory>;

// Arbitrary for style strings
const styleArb = fc.constantFrom(
  "box-style-1",
  "box-style-2",
  "bullet-style-1",
  "sequence-style-1",
  "steps-style-1",
  "quotes-style-1",
  "circles-style-1",
  "numbers-style-1",
  "images-style-1"
);

// Arbitrary for layout selection
const layoutSelectionArb = fc.record({
  slideIndex: fc.integer({ min: 0, max: 100 }),
  category: contentLayoutCategoryArb,
  style: styleArb,
});

describe("Context Tracker - Property Tests", () => {
  /**
   * Property 7: Context Tracking Accuracy
   * 
   * For any multi-slide presentation, the context tracker must accurately maintain
   * the previous 3 slide layouts and correctly calculate repetition penalties
   * (-5 for 2 consecutive, -15 for 3 consecutive) when the same layout category
   * appears repeatedly.
   * 
   * Validates: Requirements 5.1, 5.2, 5.3
   */
  describe("Property 7: Context Tracking Accuracy", () => {
    it("should maintain at most 3 previous layouts", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }), // totalSlides
          fc.array(layoutSelectionArb, { minLength: 1, maxLength: 20 }), // selections
          (totalSlides, selections) => {
            const context = createLayoutSelectionContext(0, totalSlides);
            
            // Track all selections
            selections.forEach((selection) => {
              trackLayoutUsage(
                context,
                selection.slideIndex,
                selection.category,
                selection.style
              );
            });
            
            // Should maintain at most 3 previous layouts
            expect(context.previousLayouts.length).toBeLessThanOrEqual(3);
            
            // If we tracked more than 3, should have the last 3
            if (selections.length > 3) {
              const lastThree = selections.slice(-3);
              expect(context.previousLayouts).toHaveLength(3);
              expect(context.previousLayouts[0].category).toBe(lastThree[0].category);
              expect(context.previousLayouts[1].category).toBe(lastThree[1].category);
              expect(context.previousLayouts[2].category).toBe(lastThree[2].category);
            } else {
              // Should have exactly as many as we tracked
              expect(context.previousLayouts).toHaveLength(selections.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should correctly calculate repetition penalty for 2 consecutive same category", () => {
      fc.assert(
        fc.property(
          contentLayoutCategoryArb,
          contentLayoutCategoryArb,
          (cat1, cat2) => {
            fc.pre(cat1 !== cat2); // Ensure they're different
            
            // Create a sequence where the last 2 are the same (cat2)
            const previousLayouts = [
              { slideIndex: 0, category: cat1, style: "style-1" },
              { slideIndex: 1, category: cat2, style: "style-2" },
              { slideIndex: 2, category: cat2, style: "style-3" },
            ];
            
            // Check penalty for cat2 (appears in last 2 positions only)
            const penalty = calculateRepetitionPenalty(cat2, previousLayouts);
            
            // Should be -5 for exactly 2 consecutive
            expect(penalty).toBe(-5);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should correctly calculate repetition penalty for 3 consecutive same category", () => {
      fc.assert(
        fc.property(
          contentLayoutCategoryArb,
          (category) => {
            // Create a sequence where all 3 are the same
            const previousLayouts = [
              { slideIndex: 0, category, style: "style-1" },
              { slideIndex: 1, category, style: "style-2" },
              { slideIndex: 2, category, style: "style-3" },
            ];
            
            // Check penalty for this category
            const penalty = calculateRepetitionPenalty(category, previousLayouts);
            
            // Should be -15 for 3 consecutive
            expect(penalty).toBe(-15);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return 0 penalty when category not in previous layouts", () => {
      fc.assert(
        fc.property(
          contentLayoutCategoryArb,
          contentLayoutCategoryArb,
          (cat1, cat2) => {
            fc.pre(cat1 !== cat2); // Ensure they're different
            
            const previousLayouts = [
              { slideIndex: 0, category: cat1, style: "style-1" },
              { slideIndex: 1, category: cat1, style: "style-2" },
            ];
            
            // Check penalty for cat2 (not in previous)
            const penalty = calculateRepetitionPenalty(cat2, previousLayouts);
            
            // Should be 0 (no penalty)
            expect(penalty).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return 0 penalty for empty previous layouts", () => {
      fc.assert(
        fc.property(
          contentLayoutCategoryArb,
          (category) => {
            const penalty = calculateRepetitionPenalty(category, []);
            expect(penalty).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should accurately track category usage counts", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }), // totalSlides
          fc.array(layoutSelectionArb, { minLength: 1, maxLength: 20 }), // selections
          (totalSlides, selections) => {
            const context = createLayoutSelectionContext(0, totalSlides);
            
            // Count expected occurrences
            const expectedCounts = new Map<ContentLayoutCategory, number>();
            selections.forEach((selection) => {
              const current = expectedCounts.get(selection.category) || 0;
              expectedCounts.set(selection.category, current + 1);
              
              trackLayoutUsage(
                context,
                selection.slideIndex,
                selection.category,
                selection.style
              );
            });
            
            // Verify all counts match
            expectedCounts.forEach((expectedCount, category) => {
              const actualCount = getCategoryUsageCount(category, context);
              expect(actualCount).toBe(expectedCount);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should accurately track style usage counts", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }), // totalSlides
          fc.array(layoutSelectionArb, { minLength: 1, maxLength: 20 }), // selections
          (totalSlides, selections) => {
            const context = createLayoutSelectionContext(0, totalSlides);
            
            // Count expected occurrences
            const expectedCounts = new Map<string, number>();
            selections.forEach((selection) => {
              const current = expectedCounts.get(selection.style) || 0;
              expectedCounts.set(selection.style, current + 1);
              
              trackLayoutUsage(
                context,
                selection.slideIndex,
                selection.category,
                selection.style
              );
            });
            
            // Verify all counts match
            expectedCounts.forEach((expectedCount, style) => {
              const actualCount = getStyleUsageCount(style, context);
              expect(actualCount).toBe(expectedCount);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should correctly identify recent layout usage", () => {
      fc.assert(
        fc.property(
          fc.array(layoutSelectionArb, { minLength: 4, maxLength: 10 }),
          (selections) => {
            const context = createLayoutSelectionContext(0, selections.length);
            
            // Track all selections
            selections.forEach((selection) => {
              trackLayoutUsage(
                context,
                selection.slideIndex,
                selection.category,
                selection.style
              );
            });
            
            // Get last 3 categories
            const lastThree = selections.slice(-3);
            const lastThreeCategories = lastThree.map(s => s.category);
            
            // Check that categories in last 3 are identified as recent
            lastThreeCategories.forEach((category) => {
              expect(wasUsedRecently(category, context, 3)).toBe(true);
            });
            
            // If there's a category not in last 3, it should not be recent
            const allCategories = new Set(selections.map(s => s.category));
            const lastThreeSet = new Set(lastThreeCategories);
            
            allCategories.forEach((category) => {
              if (!lastThreeSet.has(category)) {
                // This category is not in the last 3
                // It should not be identified as recent
                expect(wasUsedRecently(category, context, 3)).toBe(false);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return correct recent layouts in order", () => {
      fc.assert(
        fc.property(
          fc.array(layoutSelectionArb, { minLength: 4, maxLength: 10 }),
          (selections) => {
            const context = createLayoutSelectionContext(0, selections.length);
            
            // Track all selections
            selections.forEach((selection) => {
              trackLayoutUsage(
                context,
                selection.slideIndex,
                selection.category,
                selection.style
              );
            });
            
            // Get recent layouts
            const recent = getRecentLayouts(context, 3);
            
            // Should have at most 3
            expect(recent.length).toBeLessThanOrEqual(3);
            
            // Should match the last N selections
            const lastN = selections.slice(-3);
            expect(recent).toHaveLength(Math.min(3, selections.length));
            
            recent.forEach((category, index) => {
              expect(category).toBe(lastN[index].category);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Position Detection", () => {
    it("should correctly identify first slide", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // totalSlides
          (totalSlides) => {
            const position = getSlidePosition(0, totalSlides);
            expect(position).toBe("first");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should correctly identify last slide", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 100 }), // totalSlides (at least 2 to have distinct first and last)
          (totalSlides) => {
            const position = getSlidePosition(totalSlides - 1, totalSlides);
            expect(position).toBe("last");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should correctly identify middle slides", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 100 }), // totalSlides (at least 3 to have a middle)
          (totalSlides) => {
            // Pick a middle index (not 0, not last)
            // For totalSlides >= 3, index 1 is always middle
            const middleIndex = 1;
            const position = getSlidePosition(middleIndex, totalSlides);
            expect(position).toBe("middle");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle single slide presentation", () => {
      // Single slide is both first and last, should be "first"
      const position = getSlidePosition(0, 1);
      expect(position).toBe("first");
    });

    it("should handle two slide presentation", () => {
      const firstPosition = getSlidePosition(0, 2);
      const lastPosition = getSlidePosition(1, 2);
      
      expect(firstPosition).toBe("first");
      expect(lastPosition).toBe("last");
    });
  });
});
