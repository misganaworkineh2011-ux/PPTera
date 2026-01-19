/**
 * Property-Based Tests for Style Selection
 * 
 * Feature: smart-layout-selection, Property 9: Style-Structure Alignment
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  selectStyle,
  matchStyleToStructure,
  applySpaceConstraints,
  optimizeStyleVariety,
  getDefaultStyle,
} from "./style-selector";
import type { 
  ContentAnalysis, 
  LayoutStyleDefinition, 
  LayoutSelectionContext,
  ContentLayoutCategory 
} from "../types";
import { BulletPattern, ContentType, SemanticMarkers } from "../types";
import { getLayoutStyles } from "../registry/layout-registry";
import { createLayoutSelectionContext } from "../context/context-tracker";

// Helper to create a mock content analysis
function createMockAnalysis(bulletCount: number): ContentAnalysis {
  return {
    pattern: BulletPattern.SIMPLE_LIST,
    semanticMarkers: [],
    contentType: ContentType.GENERIC,
    contentTypeConfidence: 50,
    bulletCount,
    avgBulletLength: 10,
    maxBulletLength: 20,
    totalWordCount: bulletCount * 10,
    hasSequence: false,
    hasDistinctConcepts: true,
    hasHierarchy: false,
  };
}

// Helper to create mock styles
function createMockStyles(count: number): LayoutStyleDefinition[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `test-style-${i + 1}`,
    name: `Test Style ${i + 1}`,
    description: `Test style ${i + 1}`,
    idealBulletCount: i + 2, // 2, 3, 4, 5, etc.
    bulletCountRange: { min: i + 1, max: i + 4 },
    spaceRequirement: i % 2 === 0 ? "narrow-compatible" : "full-width-only",
    visualWeight: "medium",
    formality: "professional",
  }));
}

describe("Style Selection - Property Tests", () => {
  /**
   * Property 9: Style-Structure Alignment
   * 
   * For any layout category and content analysis, the style selector must:
   * 1. Return a valid style ID (non-empty string)
   * 2. Return a style that exists in the category's style definitions
   * 3. Never throw an exception
   * 4. Prefer styles that match the bullet count structure
   */
  it("should always return a valid style ID for any category and content", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary bullet counts
        fc.integer({ min: 1, max: 20 }),
        // Generate arbitrary space constraints
        fc.boolean(),
        (bulletCount, isNarrowSpace) => {
          // Test with all available layout categories
          const categories: ContentLayoutCategory[] = [
            "boxes",
            "bullets",
            "sequence",
            "steps",
            "quotes",
            "circles",
            "numbers",
            "images",
          ];

          categories.forEach((category) => {
            const analysis = createMockAnalysis(bulletCount);
            const context = createLayoutSelectionContext(0, 10);

            // Execute style selection
            const selectedStyle = selectStyle(
              category,
              analysis,
              isNarrowSpace,
              context
            );

            // Verify result is a valid style ID
            expect(selectedStyle).toBeDefined();
            expect(typeof selectedStyle).toBe("string");
            expect(selectedStyle.length).toBeGreaterThan(0);

            // Verify style exists in the category (or is default format)
            const availableStyles = getLayoutStyles(category);
            if (availableStyles.length > 0) {
              const styleIds = availableStyles.map((s) => s.id);
              expect(styleIds).toContain(selectedStyle);
            } else {
              // Should return default format: {category}-style-1
              expect(selectedStyle).toMatch(new RegExp(`^${category}-style-\\d+$`));
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Structure matching prefers ideal bullet counts
   * 
   * For styles with ideal bullet counts, the matcher should prefer
   * styles where bulletCount matches idealBulletCount
   */
  it("should prefer styles with matching ideal bullet counts", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }),
        (bulletCount) => {
          // Create styles with different ideal counts
          const styles: LayoutStyleDefinition[] = [
            {
              id: "style-2",
              name: "2-column",
              description: "2-column layout",
              idealBulletCount: 2,
              bulletCountRange: { min: 2, max: 3 },
              spaceRequirement: "narrow-compatible",
              visualWeight: "medium",
              formality: "professional",
            },
            {
              id: "style-3",
              name: "3-column",
              description: "3-column layout",
              idealBulletCount: 3,
              bulletCountRange: { min: 3, max: 4 },
              spaceRequirement: "narrow-compatible",
              visualWeight: "medium",
              formality: "professional",
            },
            {
              id: "style-4",
              name: "4-grid",
              description: "4-item grid",
              idealBulletCount: 4,
              bulletCountRange: { min: 4, max: 5 },
              spaceRequirement: "narrow-compatible",
              visualWeight: "medium",
              formality: "professional",
            },
            {
              id: "style-5",
              name: "5-grid",
              description: "5-item grid",
              idealBulletCount: 5,
              bulletCountRange: { min: 5, max: 6 },
              spaceRequirement: "narrow-compatible",
              visualWeight: "medium",
              formality: "professional",
            },
          ];

          const matched = matchStyleToStructure(styles, bulletCount);

          // Should return at least one style
          expect(matched.length).toBeGreaterThan(0);

          // If there's a style with matching ideal count, it should be first
          const perfectMatch = styles.find(
            (s) => s.idealBulletCount === bulletCount
          );
          if (perfectMatch && matched.length > 0) {
            expect(matched[0].id).toBe(perfectMatch.id);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Space constraints filter correctly
   * 
   * For narrow spaces, only narrow-compatible styles should be returned
   */
  it("should filter styles by space constraints correctly", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (isNarrowSpace) => {
          const styles = createMockStyles(6);

          const filtered = applySpaceConstraints(styles, isNarrowSpace);

          // Should return at least one style (fallback to all if none match)
          expect(filtered.length).toBeGreaterThan(0);

          if (isNarrowSpace) {
            // For narrow spaces, prefer narrow-compatible styles
            const hasNarrowCompatible = styles.some(
              (s) => s.spaceRequirement === "narrow-compatible"
            );

            if (hasNarrowCompatible) {
              // All filtered styles should be narrow-compatible
              filtered.forEach((style) => {
                expect(style.spaceRequirement).toBe("narrow-compatible");
              });
            }
          } else {
            // For full width, all styles are acceptable
            expect(filtered.length).toBe(styles.length);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Variety optimization avoids consecutive repetition
   * 
   * When the same style was used in the previous slide,
   * variety optimizer should prefer a different style if available
   */
  it("should avoid repeating the same style consecutively when possible", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4 }),
        (lastStyleIndex) => {
          const styles = createMockStyles(5);
          const lastStyle = styles[lastStyleIndex];

          // Create context with last style used
          const context = createLayoutSelectionContext(1, 10);
          context.previousLayouts = [
            {
              slideIndex: 0,
              category: "boxes",
              style: lastStyle.id,
            },
          ];

          const optimized = optimizeStyleVariety(styles, context);

          // Should return a style
          expect(optimized).toBeDefined();

          // If there are other styles available, should prefer different one
          if (styles.length > 1) {
            expect(optimized!.id).not.toBe(lastStyle.id);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Variety optimization prefers least used styles
   * 
   * Among available styles, should prefer the one with lowest usage count
   */
  it("should prefer least used styles for variety", () => {
    const styles = createMockStyles(3);

    // Create context with usage statistics
    const context = createLayoutSelectionContext(5, 10);
    context.styleUsage.set(styles[0].id, 5); // Most used
    context.styleUsage.set(styles[1].id, 2); // Medium used
    context.styleUsage.set(styles[2].id, 0); // Least used

    const optimized = optimizeStyleVariety(styles, context);

    // Should prefer the least used style
    expect(optimized).toBeDefined();
    expect(optimized!.id).toBe(styles[2].id);
  });

  /**
   * Property: Deterministic behavior without context
   * 
   * Same inputs should produce same outputs when no context is provided
   */
  it("should produce deterministic results for the same inputs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.boolean(),
        (bulletCount, isNarrowSpace) => {
          const category: ContentLayoutCategory = "boxes";
          const analysis = createMockAnalysis(bulletCount);

          const result1 = selectStyle(category, analysis, isNarrowSpace);
          const result2 = selectStyle(category, analysis, isNarrowSpace);

          expect(result1).toBe(result2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Handles empty style lists gracefully
   * 
   * When a category has no styles defined, should return default format
   */
  it("should handle categories with no styles gracefully", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.boolean(),
        (bulletCount, isNarrowSpace) => {
          // Mock a category that might not have styles
          const category: ContentLayoutCategory = "bullets";
          const analysis = createMockAnalysis(bulletCount);

          const result = selectStyle(category, analysis, isNarrowSpace);

          // Should return a valid style ID
          expect(result).toBeDefined();
          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Structure matching respects bullet count ranges
   * 
   * Styles should be matched when bullet count falls within their range
   */
  it("should match styles within their bullet count ranges", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (bulletCount) => {
          const styles: LayoutStyleDefinition[] = [
            {
              id: "small-range",
              name: "Small Range",
              description: "For 1-3 items",
              bulletCountRange: { min: 1, max: 3 },
              spaceRequirement: "narrow-compatible",
              visualWeight: "light",
              formality: "casual",
            },
            {
              id: "medium-range",
              name: "Medium Range",
              description: "For 4-6 items",
              bulletCountRange: { min: 4, max: 6 },
              spaceRequirement: "narrow-compatible",
              visualWeight: "medium",
              formality: "professional",
            },
            {
              id: "large-range",
              name: "Large Range",
              description: "For 7+ items",
              bulletCountRange: { min: 7, max: 20 },
              spaceRequirement: "narrow-compatible",
              visualWeight: "heavy",
              formality: "formal",
            },
          ];

          const matched = matchStyleToStructure(styles, bulletCount);

          // Should return at least one style
          expect(matched.length).toBeGreaterThan(0);

          // First matched style should have bullet count in its range
          const firstMatch = matched[0];
          if (firstMatch.bulletCountRange) {
            const { min, max } = firstMatch.bulletCountRange;
            expect(bulletCount).toBeGreaterThanOrEqual(min);
            expect(bulletCount).toBeLessThanOrEqual(max);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Default style is always available
   * 
   * Every category should have a default style that can be retrieved
   */
  it("should always provide a default style for any category", () => {
    const categories: ContentLayoutCategory[] = [
      "boxes",
      "bullets",
      "sequence",
      "steps",
      "quotes",
      "circles",
      "numbers",
      "images",
    ];

    categories.forEach((category) => {
      const defaultStyle = getDefaultStyle(category);

      expect(defaultStyle).toBeDefined();
      expect(typeof defaultStyle).toBe("string");
      expect(defaultStyle.length).toBeGreaterThan(0);
    });
  });

  /**
   * Property: Integration test - full style selection pipeline
   * 
   * Tests the complete flow: structure matching → space filtering → variety optimization
   */
  it("should handle the complete style selection pipeline", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        fc.boolean(),
        fc.integer({ min: 0, max: 5 }),
        (bulletCount, isNarrowSpace, slideIndex) => {
          const category: ContentLayoutCategory = "boxes";
          const analysis = createMockAnalysis(bulletCount);
          const context = createLayoutSelectionContext(slideIndex, 10);

          // Add some previous selections
          if (slideIndex > 0) {
            context.previousLayouts.push({
              slideIndex: slideIndex - 1,
              category: "boxes",
              style: "box-style-1",
            });
          }

          const result = selectStyle(category, analysis, isNarrowSpace, context);

          // Should return a valid style
          expect(result).toBeDefined();
          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);

          // Should be a valid style for the category
          const availableStyles = getLayoutStyles(category);
          if (availableStyles.length > 0) {
            const styleIds = availableStyles.map((s) => s.id);
            expect(styleIds).toContain(result);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
