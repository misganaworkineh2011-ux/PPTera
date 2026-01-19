/**
 * Property-Based Tests for Image-Layout Compatibility
 * 
 * Feature: smart-layout-selection, Property 10: Image-Layout Compatibility
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  checkImageCompatibility,
  isImageFocusedLayout,
  isHybridLayout,
  isIconFriendlyLayout,
  hasSubstantialText,
  applyImageScoreAdjustments,
  applyIconScoreAdjustments,
} from "./image-compatibility";
import { LAYOUT_REGISTRY } from "../registry/layout-registry";
import type { LayoutDefinition } from "../types";

describe("Image-Layout Compatibility - Property Tests", () => {
  /**
   * Property 10: Image-Layout Compatibility
   * 
   * For any layout and image presence:
   * 1. Layouts that require images must be rejected when hasImage=false
   * 2. Layouts that support images must receive boosts when hasImage=true
   * 3. Image-focused layouts get +30 points when hasImage=true
   * 4. Hybrid layouts get +15 points (or +25 with substantial text) when hasImage=true
   * 5. Image-required layouts get -Infinity (rejection) when hasImage=false
   * 6. Icon-friendly layouts get boosts when hasIcon=true
   */
  it("should reject image-required layouts when no image is present", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 5, max: 30 }),
        (layout, bulletCount, avgBulletLength) => {
          // If layout requires image
          if (layout.capacity.requiresImage) {
            // Check compatibility with no image
            const compatibility = checkImageCompatibility(layout, false);
            
            // Should be incompatible
            expect(compatibility.isCompatible).toBe(false);
            expect(compatibility.requiresImage).toBe(true);
            expect(compatibility.reason).toBeDefined();
            
            // Score adjustment should reject (return -Infinity)
            const adjustment = applyImageScoreAdjustments(
              layout,
              false,
              bulletCount,
              avgBulletLength
            );
            expect(adjustment).toBe(-Infinity);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should boost image-compatible layouts when image is present", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 5, max: 30 }),
        (layout, bulletCount, avgBulletLength) => {
          // If layout supports images
          if (layout.capacity.supportsImage) {
            // Check compatibility with image
            const compatibility = checkImageCompatibility(layout, true);
            
            // Should be compatible
            expect(compatibility.isCompatible).toBe(true);
            expect(compatibility.supportsImage).toBe(true);
            
            // Score adjustment should be positive
            const adjustment = applyImageScoreAdjustments(
              layout,
              true,
              bulletCount,
              avgBulletLength
            );
            expect(adjustment).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should give image-focused layouts +30 boost (or +20 with substantial text)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 5, max: 30 }),
        (layout, bulletCount, avgBulletLength) => {
          // If layout is image-focused (images category)
          if (isImageFocusedLayout(layout)) {
            const adjustment = applyImageScoreAdjustments(
              layout,
              true,
              bulletCount,
              avgBulletLength
            );
            
            const substantial = hasSubstantialText(bulletCount, avgBulletLength);
            
            if (substantial) {
              // +30 - 10 = +20 for substantial text
              expect(adjustment).toBe(20);
            } else {
              // +30 for minimal text
              expect(adjustment).toBe(30);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should give hybrid layouts +15 boost (or +25 with substantial text)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 5, max: 30 }),
        (layout, bulletCount, avgBulletLength) => {
          // If layout is hybrid (supports images but doesn't require them, can handle 3+ bullets)
          if (isHybridLayout(layout) && !isImageFocusedLayout(layout)) {
            const adjustment = applyImageScoreAdjustments(
              layout,
              true,
              bulletCount,
              avgBulletLength
            );
            
            const substantial = hasSubstantialText(bulletCount, avgBulletLength);
            
            if (substantial) {
              // +15 + 10 = +25 for substantial text
              expect(adjustment).toBe(25);
            } else {
              // +15 for minimal text
              expect(adjustment).toBe(15);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not boost layouts when no image is present", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 5, max: 30 }),
        (layout, bulletCount, avgBulletLength) => {
          // If layout doesn't require images
          if (!layout.capacity.requiresImage) {
            const adjustment = applyImageScoreAdjustments(
              layout,
              false,
              bulletCount,
              avgBulletLength
            );
            
            // Should be 0 (no boost, no penalty)
            expect(adjustment).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should boost circles layout by +20 when icon is present", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        (layout) => {
          if (layout.category === "circles") {
            const adjustment = applyIconScoreAdjustments(layout, true);
            expect(adjustment).toBe(20);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should boost boxes layout by +15 when icon is present", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        (layout) => {
          if (layout.category === "boxes") {
            const adjustment = applyIconScoreAdjustments(layout, true);
            expect(adjustment).toBe(15);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should not boost layouts when no icon is present", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        (layout) => {
          const adjustment = applyIconScoreAdjustments(layout, false);
          expect(adjustment).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should correctly identify image-focused layouts", () => {
    LAYOUT_REGISTRY.forEach((layout) => {
      const isImageFocused = isImageFocusedLayout(layout);
      
      if (layout.category === "images") {
        expect(isImageFocused).toBe(true);
      } else {
        expect(isImageFocused).toBe(false);
      }
    });
  });

  it("should correctly identify hybrid layouts", () => {
    LAYOUT_REGISTRY.forEach((layout) => {
      const isHybrid = isHybridLayout(layout);
      
      if (isHybrid) {
        // Hybrid layouts must support images
        expect(layout.capacity.supportsImage).toBe(true);
        // Must not require images
        expect(layout.capacity.requiresImage ?? false).toBe(false);
        // Must handle 3+ bullets
        expect(layout.capacity.bulletCount.max).toBeGreaterThanOrEqual(3);
      }
    });
  });

  it("should correctly identify icon-friendly layouts", () => {
    LAYOUT_REGISTRY.forEach((layout) => {
      const isIconFriendly = isIconFriendlyLayout(layout);
      
      if (layout.category === "circles" || layout.category === "boxes") {
        expect(isIconFriendly).toBe(true);
      } else {
        expect(isIconFriendly).toBe(false);
      }
    });
  });

  it("should correctly determine substantial text", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 1, max: 50 }),
        (bulletCount, avgBulletLength) => {
          const substantial = hasSubstantialText(bulletCount, avgBulletLength);
          
          // Substantial if 3+ bullets OR 2+ bullets with avg length > 15
          const expected = 
            bulletCount >= 3 || 
            (bulletCount >= 2 && avgBulletLength > 15);
          
          expect(substantial).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle edge case: layout doesn't support images but slide has image", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 5, max: 30 }),
        (layout, bulletCount, avgBulletLength) => {
          // If layout doesn't support images
          if (!layout.capacity.supportsImage) {
            // Check compatibility with image
            const compatibility = checkImageCompatibility(layout, true);
            
            // Should be incompatible
            expect(compatibility.isCompatible).toBe(false);
            expect(compatibility.supportsImage).toBe(false);
            expect(compatibility.reason).toBeDefined();
            
            // Score adjustment should reject
            const adjustment = applyImageScoreAdjustments(
              layout,
              true,
              bulletCount,
              avgBulletLength
            );
            expect(adjustment).toBe(-Infinity);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle zero bullets gracefully", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        (layout) => {
          // Test with zero bullets
          const adjustment = applyImageScoreAdjustments(layout, true, 0, 0);
          
          // Should not throw and should return a valid number
          expect(typeof adjustment).toBe("number");
          expect(isNaN(adjustment)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should be deterministic for same inputs", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        fc.boolean(),
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 5, max: 30 }),
        (layout, hasImage, bulletCount, avgBulletLength) => {
          const adjustment1 = applyImageScoreAdjustments(
            layout,
            hasImage,
            bulletCount,
            avgBulletLength
          );
          const adjustment2 = applyImageScoreAdjustments(
            layout,
            hasImage,
            bulletCount,
            avgBulletLength
          );
          
          expect(adjustment1).toBe(adjustment2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should prefer hybrid layouts for image + substantial text", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        fc.integer({ min: 3, max: 10 }), // Substantial bullet count
        fc.integer({ min: 16, max: 30 }), // Substantial avg length
        (layout, bulletCount, avgBulletLength) => {
          if (isHybridLayout(layout) && !isImageFocusedLayout(layout)) {
            const adjustment = applyImageScoreAdjustments(
              layout,
              true,
              bulletCount,
              avgBulletLength
            );
            
            // Hybrid with substantial text should get +25
            expect(adjustment).toBe(25);
          } else if (isImageFocusedLayout(layout)) {
            const adjustment = applyImageScoreAdjustments(
              layout,
              true,
              bulletCount,
              avgBulletLength
            );
            
            // Image-focused with substantial text should get +20 (reduced from +30)
            expect(adjustment).toBe(20);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should prefer image-focused layouts for image + minimal text", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...LAYOUT_REGISTRY),
        fc.integer({ min: 0, max: 2 }), // Minimal bullet count
        fc.integer({ min: 5, max: 15 }), // Minimal avg length
        (layout, bulletCount, avgBulletLength) => {
          if (isImageFocusedLayout(layout)) {
            const adjustment = applyImageScoreAdjustments(
              layout,
              true,
              bulletCount,
              avgBulletLength
            );
            
            // Image-focused with minimal text should get full +30
            expect(adjustment).toBe(30);
          } else if (isHybridLayout(layout) && !isImageFocusedLayout(layout)) {
            const adjustment = applyImageScoreAdjustments(
              layout,
              true,
              bulletCount,
              avgBulletLength
            );
            
            // Hybrid with minimal text should get +15
            expect(adjustment).toBe(15);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle all layouts in registry without errors", () => {
    // Test every layout in the registry
    LAYOUT_REGISTRY.forEach((layout) => {
      // Test with various combinations
      const testCases = [
        { hasImage: true, hasIcon: true, bulletCount: 3, avgLength: 10 },
        { hasImage: true, hasIcon: false, bulletCount: 5, avgLength: 20 },
        { hasImage: false, hasIcon: true, bulletCount: 2, avgLength: 8 },
        { hasImage: false, hasIcon: false, bulletCount: 4, avgLength: 15 },
      ];

      testCases.forEach(({ hasImage, hasIcon, bulletCount, avgLength }) => {
        // Should not throw
        expect(() => {
          checkImageCompatibility(layout, hasImage);
          applyImageScoreAdjustments(layout, hasImage, bulletCount, avgLength);
          applyIconScoreAdjustments(layout, hasIcon);
        }).not.toThrow();
      });
    });
  });
});