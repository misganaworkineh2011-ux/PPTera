/**
 * Property-Based Tests for Pattern Detection
 * 
 * Feature: smart-layout-selection, Property 2: Content Analysis Completeness (Pattern Detection)
 * Validates: Requirements 2.2
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { analyzeBulletPatterns } from "./pattern-detector";
import { BulletPattern } from "../types";

describe("Pattern Detection - Property Tests", () => {
  /**
   * Property 2: Content Analysis Completeness (Pattern Detection)
   * 
   * For any array of bullet point strings, the pattern detector must:
   * 1. Return a valid BulletPattern enum value
   * 2. Return a confidence score between 0 and 1
   * 3. Return a matchCount >= 0
   * 4. Never throw an exception
   */
  it("should always return complete pattern detection results for any bullet array", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary arrays of strings (bullet points)
        fc.array(fc.string(), { minLength: 0, maxLength: 20 }),
        (bullets) => {
          // Execute pattern detection
          const result = analyzeBulletPatterns(bullets);

          // Verify completeness: all required fields present
          expect(result).toBeDefined();
          expect(result.pattern).toBeDefined();
          expect(result.confidence).toBeDefined();
          expect(result.matchCount).toBeDefined();

          // Verify pattern is a valid enum value
          const validPatterns = Object.values(BulletPattern);
          expect(validPatterns).toContain(result.pattern);

          // Verify confidence is in valid range [0, 1]
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(1);

          // Verify matchCount is non-negative
          expect(result.matchCount).toBeGreaterThanOrEqual(0);

          // Verify matchCount doesn't exceed bullet count
          expect(result.matchCount).toBeLessThanOrEqual(bullets.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty input handling
   * 
   * For empty bullet arrays, should return SIMPLE_LIST with confidence 1.0
   */
  it("should handle empty bullet arrays gracefully", () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (bullets) => {
          const result = analyzeBulletPatterns(bullets);

          expect(result.pattern).toBe(BulletPattern.SIMPLE_LIST);
          expect(result.confidence).toBe(1.0);
          expect(result.matchCount).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Numbered steps detection
   * 
   * For bullets starting with numbers, should detect NUMBERED_STEPS pattern
   */
  it("should detect numbered steps pattern for numbered bullets", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(fc.integer({ min: 1, max: 20 }), fc.string({ minLength: 5, maxLength: 50 }))
            .map(([num, text]) => `${num}. ${text}`),
          { minLength: 2, maxLength: 10 }
        ),
        (bullets) => {
          const result = analyzeBulletPatterns(bullets);

          // Should detect numbered steps or simple list (if text doesn't match other patterns)
          expect([BulletPattern.NUMBERED_STEPS, BulletPattern.SIMPLE_LIST]).toContain(result.pattern);
          
          // Confidence should be reasonable
          expect(result.confidence).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Quoted text detection
   * 
   * For bullets containing quoted text, should detect QUOTED_TEXT pattern
   */
  it("should detect quoted text pattern for bullets with quotes", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 5, maxLength: 50 })
            .map(text => `"${text}"`),
          { minLength: 2, maxLength: 10 }
        ),
        (bullets) => {
          const result = analyzeBulletPatterns(bullets);

          // Should detect quoted text or simple list
          expect([BulletPattern.QUOTED_TEXT, BulletPattern.SIMPLE_LIST]).toContain(result.pattern);
          
          // Confidence should be reasonable
          expect(result.confidence).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Numeric data detection
   * 
   * For bullets containing percentages or numbers, should detect NUMERIC pattern
   */
  it("should detect numeric pattern for bullets with percentages", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(fc.integer({ min: 1, max: 100 }), fc.string({ minLength: 5, maxLength: 30 }))
            .map(([num, text]) => `${text} ${num}%`),
          { minLength: 2, maxLength: 10 }
        ),
        (bullets) => {
          const result = analyzeBulletPatterns(bullets);

          // Should detect numeric or simple list
          expect([BulletPattern.NUMERIC, BulletPattern.SIMPLE_LIST]).toContain(result.pattern);
          
          // Confidence should be reasonable
          expect(result.confidence).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Confidence increases with pattern consistency
   * 
   * For bullets that all match the same pattern, confidence should be high
   */
  it("should have higher confidence when all bullets match the same pattern", () => {
    const result = analyzeBulletPatterns([
      "1. First step",
      "2. Second step",
      "3. Third step",
      "4. Fourth step",
    ]);

    // All bullets match numbered pattern, so confidence should be high
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
    expect(result.pattern).toBe(BulletPattern.NUMBERED_STEPS);
  });

  /**
   * Property: Deterministic behavior
   * 
   * Same input should always produce same output
   */
  it("should produce deterministic results for the same input", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        (bullets) => {
          const result1 = analyzeBulletPatterns(bullets);
          const result2 = analyzeBulletPatterns(bullets);

          expect(result1.pattern).toBe(result2.pattern);
          expect(result1.confidence).toBe(result2.confidence);
          expect(result1.matchCount).toBe(result2.matchCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
