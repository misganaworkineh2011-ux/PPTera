/**
 * Property-Based Tests for Layout Definitions
 * 
 * **Feature: smart-layout-selection, Property 3: Layout Definition Completeness**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * Tests that all layout definitions have complete capacity constraints,
 * affinity scores, and compatibility rules.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { LAYOUT_DEFINITIONS } from "./layout-definitions";
import { ContentType, BulletPattern } from "../types";

describe("Layout Definition Completeness", () => {
  /**
   * Property 3: Layout Definition Completeness
   * 
   * For any registered layout category, the layout definition must include:
   * - Complete capacity constraints (bulletCount range, density, image support, space requirement)
   * - Compatibility rules (contentTypeAffinity, patternAffinity, semanticIntentCompatibility, visualStrategyCompatibility)
   */
  
  it("should include the 8 core layout categories with no duplicates", () => {
    // The registry has grown well beyond the original 8 — assert the core set
    // is still present and every category is defined exactly once, rather
    // than pinning a total count that goes stale with each new category.
    const coreCategories = [
      "boxes",
      "bullets",
      "sequence",
      "steps",
      "quotes",
      "circles",
      "numbers",
      "images",
    ];

    const actualCategories = LAYOUT_DEFINITIONS.map(def => def.category);

    expect(actualCategories.length).toBeGreaterThanOrEqual(coreCategories.length);
    expect(new Set(actualCategories).size).toBe(actualCategories.length);
    coreCategories.forEach(category => {
      expect(actualCategories).toContain(category);
    });
  });

  it("property: all layouts have complete capacity constraints", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          // Requirement 3.1: Must specify bullet count range
          expect(layout.capacity.bulletCount).toBeDefined();
          expect(layout.capacity.bulletCount.min).toBeGreaterThanOrEqual(1);
          expect(layout.capacity.bulletCount.max).toBeGreaterThanOrEqual(layout.capacity.bulletCount.min);
          
          // Requirement 3.2: Must specify density
          expect(layout.capacity.density).toBeDefined();
          expect(["low", "medium", "high"]).toContain(layout.capacity.density);
          
          // Requirement 3.3: Must specify image support
          expect(layout.capacity.supportsImage).toBeDefined();
          expect(typeof layout.capacity.supportsImage).toBe("boolean");
          
          // Requirement 3.4: Must specify space requirement
          expect(layout.capacity.spaceRequirement).toBeDefined();
          expect(["narrow-compatible", "full-width-only"]).toContain(
            layout.capacity.spaceRequirement
          );
          
          // If avgBulletLength is specified, it must be valid
          if (layout.capacity.avgBulletLength) {
            expect(layout.capacity.avgBulletLength.min).toBeGreaterThan(0);
            expect(layout.capacity.avgBulletLength.max).toBeGreaterThanOrEqual(
              layout.capacity.avgBulletLength.min
            );
          }
          
          // If maxBulletLength is specified, it must be valid
          if (layout.capacity.maxBulletLength) {
            expect(layout.capacity.maxBulletLength.min).toBeGreaterThan(0);
            expect(layout.capacity.maxBulletLength.max).toBeGreaterThanOrEqual(
              layout.capacity.maxBulletLength.min
            );
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: all layouts have valid content type affinity scores", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          // Requirement 3.5: Must have contentTypeAffinity
          expect(layout.contentTypeAffinity).toBeDefined();
          expect(typeof layout.contentTypeAffinity).toBe("object");
          
          // All affinity scores must be between 0 and 2
          Object.entries(layout.contentTypeAffinity).forEach(([type, score]) => {
            expect(Object.values(ContentType)).toContain(type);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(2);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: all layouts have valid pattern affinity scores", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          // Requirement 3.5: Must have patternAffinity
          expect(layout.patternAffinity).toBeDefined();
          expect(typeof layout.patternAffinity).toBe("object");
          
          // All affinity scores must be between 0 and 2
          Object.entries(layout.patternAffinity).forEach(([pattern, score]) => {
            expect(Object.values(BulletPattern)).toContain(pattern);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(2);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: all layouts have semantic intent compatibility", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          // Requirement 3.5: Must have semanticIntentCompatibility
          expect(layout.semanticIntentCompatibility).toBeDefined();
          expect(Array.isArray(layout.semanticIntentCompatibility)).toBe(true);
          expect(layout.semanticIntentCompatibility.length).toBeGreaterThan(0);
          
          // All intents must be valid strings
          layout.semanticIntentCompatibility.forEach(intent => {
            expect(typeof intent).toBe("string");
            expect(intent.length).toBeGreaterThan(0);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: all layouts have visual strategy compatibility", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          // Requirement 3.5: Must have visualStrategyCompatibility
          expect(layout.visualStrategyCompatibility).toBeDefined();
          expect(typeof layout.visualStrategyCompatibility).toBe("object");
          
          // If primary is specified, it must be an array of strings
          if (layout.visualStrategyCompatibility.primary) {
            expect(Array.isArray(layout.visualStrategyCompatibility.primary)).toBe(true);
            layout.visualStrategyCompatibility.primary.forEach(p => {
              expect(typeof p).toBe("string");
            });
          }
          
          // If pattern is specified, it must be an array of strings
          if (layout.visualStrategyCompatibility.pattern) {
            expect(Array.isArray(layout.visualStrategyCompatibility.pattern)).toBe(true);
            layout.visualStrategyCompatibility.pattern.forEach(p => {
              expect(typeof p).toBe("string");
            });
          }
          
          // If emphasis is specified, it must be an array of strings
          if (layout.visualStrategyCompatibility.emphasis) {
            expect(Array.isArray(layout.visualStrategyCompatibility.emphasis)).toBe(true);
            layout.visualStrategyCompatibility.emphasis.forEach(e => {
              expect(typeof e).toBe("string");
            });
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: all layouts have valid priority levels", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          expect(layout.priority).toBeDefined();
          expect(["high", "medium", "low", "fallback"]).toContain(layout.priority);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: all layouts have at least one style definition", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          // Requirement 6.1, 6.2: Must have styles
          expect(layout.styles).toBeDefined();
          expect(Array.isArray(layout.styles)).toBe(true);
          expect(layout.styles.length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: all style definitions are complete", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          layout.styles.forEach(style => {
            // Must have id, name, description
            expect(style.id).toBeDefined();
            expect(typeof style.id).toBe("string");
            expect(style.id.length).toBeGreaterThan(0);
            
            expect(style.name).toBeDefined();
            expect(typeof style.name).toBe("string");
            expect(style.name.length).toBeGreaterThan(0);
            
            expect(style.description).toBeDefined();
            expect(typeof style.description).toBe("string");
            
            // Must have space requirement
            expect(style.spaceRequirement).toBeDefined();
            expect(["narrow-compatible", "full-width-only"]).toContain(
              style.spaceRequirement
            );
            
            // Must have visual weight
            expect(style.visualWeight).toBeDefined();
            expect(["light", "medium", "heavy"]).toContain(style.visualWeight);
            
            // Must have formality
            expect(style.formality).toBeDefined();
            expect(["casual", "professional", "formal"]).toContain(style.formality);
            
            // If bulletCountRange is specified, it must be valid
            if (style.bulletCountRange) {
              expect(style.bulletCountRange.min).toBeGreaterThanOrEqual(1);
              expect(style.bulletCountRange.max).toBeGreaterThanOrEqual(
                style.bulletCountRange.min
              );
            }
            
            // If idealBulletCount is specified, it must be positive
            if (style.idealBulletCount !== undefined) {
              expect(style.idealBulletCount).toBeGreaterThanOrEqual(1);
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: image-required layouts must have requiresImage set", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          // Images category should require images
          if (layout.category === "images") {
            expect(layout.capacity.requiresImage).toBe(true);
          }
          
          // If requiresImage is true, supportsImage must also be true
          if (layout.capacity.requiresImage) {
            expect(layout.capacity.supportsImage).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: all layouts have unique categories", () => {
    const categories = LAYOUT_DEFINITIONS.map(def => def.category);
    const uniqueCategories = new Set(categories);
    
    expect(uniqueCategories.size).toBe(categories.length);
  });

  it("property: all style IDs are unique within each layout", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          const styleIds = layout.styles.map(s => s.id);
          const uniqueStyleIds = new Set(styleIds);
          
          expect(uniqueStyleIds.size).toBe(styleIds.length);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("property: bullet count ranges are consistent with layout capacity", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_DEFINITIONS),
        (layout) => {
          layout.styles.forEach(style => {
            if (style.bulletCountRange) {
              // Style bullet count range should be within layout capacity
              expect(style.bulletCountRange.min).toBeGreaterThanOrEqual(
                layout.capacity.bulletCount.min
              );
              expect(style.bulletCountRange.max).toBeLessThanOrEqual(
                layout.capacity.bulletCount.max
              );
            }
            
            if (style.idealBulletCount !== undefined) {
              // Ideal bullet count should be within layout capacity
              expect(style.idealBulletCount).toBeGreaterThanOrEqual(
                layout.capacity.bulletCount.min
              );
              expect(style.idealBulletCount).toBeLessThanOrEqual(
                layout.capacity.bulletCount.max
              );
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
