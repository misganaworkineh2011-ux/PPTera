/**
 * Property-Based Tests for Content Density Calculator
 * 
 * Feature: smart-layout-selection, Property 2: Content Analysis Completeness (Density Metrics)
 * Validates: Requirements 2.1
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { calculateContentDensity, calculateContentDensityFromSlide } from "./density-calculator";

describe("Content Density Calculator - Property Tests", () => {
  /**
   * Property 2: Content Analysis Completeness (Density Metrics)
   * 
   * For any array of bullet points, the density calculator must:
   * 1. Return all required metrics (bulletCount, avgBulletLength, maxBulletLength, totalWordCount, density)
   * 2. bulletCount must equal the input array length
   * 3. avgBulletLength must be >= 0
   * 4. maxBulletLength must be >= avgBulletLength (or both 0)
   * 5. totalWordCount must be >= 0
   * 6. density must be one of: "low", "medium", "high"
   * 7. Never throw an exception
   */
  it("should always return complete density metrics for any bullet array", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 0, maxLength: 20 }),
        (bullets) => {
          // Execute density calculation
          const metrics = calculateContentDensity(bullets);

          // Verify completeness: all required fields present
          expect(metrics).toBeDefined();
          expect(metrics.bulletCount).toBeDefined();
          expect(metrics.avgBulletLength).toBeDefined();
          expect(metrics.maxBulletLength).toBeDefined();
          expect(metrics.totalWordCount).toBeDefined();
          expect(metrics.density).toBeDefined();

          // Verify bulletCount matches input length
          expect(metrics.bulletCount).toBe(bullets.length);

          // Verify avgBulletLength is non-negative
          expect(metrics.avgBulletLength).toBeGreaterThanOrEqual(0);

          // Verify maxBulletLength is >= avgBulletLength (or both 0)
          if (bullets.length > 0) {
            expect(metrics.maxBulletLength).toBeGreaterThanOrEqual(metrics.avgBulletLength);
          }

          // Verify totalWordCount is non-negative
          expect(metrics.totalWordCount).toBeGreaterThanOrEqual(0);

          // Verify density is valid
          expect(["low", "medium", "high"]).toContain(metrics.density);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty input handling
   * 
   * For empty bullet arrays, all metrics should be 0 and density should be "low"
   */
  it("should return zero metrics for empty bullet array", () => {
    const metrics = calculateContentDensity([]);

    expect(metrics.bulletCount).toBe(0);
    expect(metrics.avgBulletLength).toBe(0);
    expect(metrics.maxBulletLength).toBe(0);
    expect(metrics.totalWordCount).toBe(0);
    expect(metrics.density).toBe("low");
  });

  /**
   * Property: Single bullet handling
   * 
   * For single bullet, avgBulletLength should equal maxBulletLength
   */
  it("should have avgBulletLength equal to maxBulletLength for single bullet", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (bullet) => {
          const metrics = calculateContentDensity([bullet]);

          expect(metrics.bulletCount).toBe(1);
          expect(metrics.avgBulletLength).toBe(metrics.maxBulletLength);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Word count accuracy
   * 
   * Total word count should equal sum of words in all bullets
   */
  it("should accurately count total words across all bullets", () => {
    const bullets = ["one two three", "four five", "six"];
    const metrics = calculateContentDensity(bullets);

    expect(metrics.totalWordCount).toBe(6);
    expect(metrics.bulletCount).toBe(3);
    expect(metrics.avgBulletLength).toBe(2);
    expect(metrics.maxBulletLength).toBe(3);
  });

  /**
   * Property: Low density classification
   * 
   * Few bullets with short text should be classified as low density
   */
  it("should classify few short bullets as low density", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 30 }).map(s => s.split(" ").slice(0, 5).join(" ")),
          { minLength: 1, maxLength: 3 }
        ),
        (bullets) => {
          const metrics = calculateContentDensity(bullets);

          // With 1-3 bullets and short text, should be low or medium density
          expect(["low", "medium"]).toContain(metrics.density);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: High density classification
   * 
   * Many bullets or long text should be classified as high density
   */
  it("should classify many bullets as high density", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 10, maxLength: 50 }),
          { minLength: 7, maxLength: 15 }
        ),
        (bullets) => {
          const metrics = calculateContentDensity(bullets);

          // With 7+ bullets, should be high density
          expect(metrics.density).toBe("high");
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Max bullet length correctness
   * 
   * maxBulletLength should be the length of the longest bullet
   */
  it("should correctly identify the longest bullet", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        (bullets) => {
          const metrics = calculateContentDensity(bullets);

          // Calculate expected max manually
          const wordCounts = bullets.map(b => 
            b.trim().length === 0 ? 0 : b.trim().split(/\s+/).filter(w => w.length > 0).length
          );
          const expectedMax = Math.max(...wordCounts, 0);

          expect(metrics.maxBulletLength).toBe(expectedMax);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Average calculation correctness
   * 
   * avgBulletLength should be totalWordCount / bulletCount
   */
  it("should correctly calculate average bullet length", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
        (bullets) => {
          const metrics = calculateContentDensity(bullets);

          const expectedAvg = metrics.totalWordCount / metrics.bulletCount;
          
          // Allow small rounding difference (we round to 1 decimal)
          expect(Math.abs(metrics.avgBulletLength - expectedAvg)).toBeLessThan(0.1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Deterministic behavior
   * 
   * Same input should always produce same output
   */
  it("should produce deterministic results for the same input", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
        (bullets) => {
          const metrics1 = calculateContentDensity(bullets);
          const metrics2 = calculateContentDensity(bullets);

          expect(metrics1).toEqual(metrics2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Slide calculation ignores title
   * 
   * calculateContentDensityFromSlide should only consider bullets, not title
   */
  it("should calculate density from bullets only, ignoring title", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
        (title, bullets) => {
          const slideMetrics = calculateContentDensityFromSlide(title, bullets);
          const bulletMetrics = calculateContentDensity(bullets);

          // Should be identical since title is ignored
          expect(slideMetrics).toEqual(bulletMetrics);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Whitespace handling
   * 
   * Multiple spaces should be treated as single separator
   */
  it("should handle multiple spaces correctly", () => {
    const bullets = ["one  two   three", "four     five"];
    const metrics = calculateContentDensity(bullets);

    expect(metrics.totalWordCount).toBe(5);
    expect(metrics.bulletCount).toBe(2);
  });
});
