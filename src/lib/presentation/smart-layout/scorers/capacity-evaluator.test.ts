/**
 * Tests for Capacity Evaluator
 * 
 * Tests the capacity enforcement property.
 * 
 * **Feature: smart-layout-selection, Property 4: Capacity Enforcement**
 * **Validates: Requirements 3.6**
 */

import { describe, it, expect } from "vitest";
import { evaluateCapacity, isDensityCompatible, calculateContentDensity } from "./capacity-evaluator";
import type { LayoutCapacity, ContentAnalysis } from "../types";
import { BulletPattern, ContentType } from "../types";

describe("Capacity Evaluator", () => {
  describe("Property 4: Capacity Enforcement", () => {
    it("should reject when utilization exceeds 90%", () => {
      /**
       * Property: The capacity evaluator must reject (fits=false) with reason containing
       * "utilization" when calculated utilization exceeds 90%
       */
      const capacity: LayoutCapacity = {
        bulletCount: { min: 2, max: 4 },
        avgBulletLength: { min: 10, max: 20 },
        maxBulletLength: { min: 20, max: 40 },
        density: "medium",
        supportsImage: true,
        spaceRequirement: "narrow-compatible",
      };

      // Create content that will have > 90% utilization
      // bulletCount: 4 out of 2-4 range = 100% utilization
      // avgBulletLength: 20 out of 10-20 range = 100% utilization
      // maxBulletLength: 40 out of 40 max = 100% utilization
      // Overall: 0.5 * 1.0 + 0.3 * 1.0 + 0.2 * 1.0 = 1.0 = 100% > 90%
      const content: ContentAnalysis = {
        pattern: BulletPattern.SIMPLE_LIST,
        semanticMarkers: [],
        contentType: ContentType.GENERIC,
        contentTypeConfidence: 50,
        bulletCount: 4,
        avgBulletLength: 20,
        maxBulletLength: 40,
        totalWordCount: 80,
        hasSequence: false,
        hasDistinctConcepts: false,
        hasHierarchy: false,
      };

      const result = evaluateCapacity(capacity, content);

      expect(result.fits).toBe(false);
      expect(result.utilization).toBeGreaterThan(0.9);
      expect(result.reason).toContain("utilization");
    });

    it("should accept content well within capacity bounds", () => {
      const capacity: LayoutCapacity = {
        bulletCount: { min: 2, max: 10 },
        avgBulletLength: { min: 10, max: 50 },
        maxBulletLength: { min: 20, max: 100 },
        density: "medium",
        supportsImage: true,
        spaceRequirement: "narrow-compatible",
      };

      // Content at ~30% utilization
      const content: ContentAnalysis = {
        pattern: BulletPattern.SIMPLE_LIST,
        semanticMarkers: [],
        contentType: ContentType.GENERIC,
        contentTypeConfidence: 50,
        bulletCount: 4,  // 25% of range
        avgBulletLength: 20,  // 25% of range
        maxBulletLength: 30,  // 30% of max
        totalWordCount: 80,
        hasSequence: false,
        hasDistinctConcepts: false,
        hasHierarchy: false,
      };

      const result = evaluateCapacity(capacity, content);

      expect(result.fits).toBe(true);
      expect(result.utilization).toBeLessThan(0.5);
      expect(result.reason).toBeUndefined();
    });

    it("should reject content with too many bullets", () => {
      const capacity: LayoutCapacity = {
        bulletCount: { min: 2, max: 6 },
        avgBulletLength: { min: 10, max: 50 },
        maxBulletLength: { min: 20, max: 100 },
        density: "medium",
        supportsImage: true,
        spaceRequirement: "narrow-compatible",
      };

      const content: ContentAnalysis = {
        pattern: BulletPattern.SIMPLE_LIST,
        semanticMarkers: [],
        contentType: ContentType.GENERIC,
        contentTypeConfidence: 50,
        bulletCount: 10,  // Way over max of 6
        avgBulletLength: 15,  // Keep other factors low
        maxBulletLength: 25,
        totalWordCount: 150,
        hasSequence: false,
        hasDistinctConcepts: false,
        hasHierarchy: false,
      };

      const result = evaluateCapacity(capacity, content);

      expect(result.fits).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it("should reject content with bullets that are too long", () => {
      const capacity: LayoutCapacity = {
        bulletCount: { min: 2, max: 6 },
        avgBulletLength: { min: 10, max: 30 },
        maxBulletLength: { min: 20, max: 60 },
        density: "medium",
        supportsImage: true,
        spaceRequirement: "narrow-compatible",
      };

      const content: ContentAnalysis = {
        pattern: BulletPattern.SIMPLE_LIST,
        semanticMarkers: [],
        contentType: ContentType.GENERIC,
        contentTypeConfidence: 50,
        bulletCount: 3,  // Keep low
        avgBulletLength: 50,  // Way over max of 30
        maxBulletLength: 70,
        totalWordCount: 150,
        hasSequence: false,
        hasDistinctConcepts: false,
        hasHierarchy: false,
      };

      const result = evaluateCapacity(capacity, content);

      expect(result.fits).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe("Unit Tests", () => {
    it("should calculate utilization correctly", () => {
      const capacity: LayoutCapacity = {
        bulletCount: { min: 2, max: 6 },
        avgBulletLength: { min: 10, max: 30 },
        maxBulletLength: { min: 20, max: 60 },
        density: "medium",
        supportsImage: true,
        spaceRequirement: "narrow-compatible",
      };

      const content: ContentAnalysis = {
        pattern: BulletPattern.SIMPLE_LIST,
        semanticMarkers: [],
        contentType: ContentType.GENERIC,
        contentTypeConfidence: 50,
        bulletCount: 4, // Middle of range (2-6)
        avgBulletLength: 20, // Middle of range (10-30)
        maxBulletLength: 40, // Middle of range (20-60)
        totalWordCount: 80,
        hasSequence: false,
        hasDistinctConcepts: false,
        hasHierarchy: false,
      };

      const result = evaluateCapacity(capacity, content);

      expect(result.fits).toBe(true);
      expect(result.utilization).toBeGreaterThan(0);
      expect(result.utilization).toBeLessThan(1);
    });

    it("should handle missing avgBulletLength constraint", () => {
      const capacity: LayoutCapacity = {
        bulletCount: { min: 2, max: 6 },
        density: "medium",
        supportsImage: true,
        spaceRequirement: "narrow-compatible",
      };

      const content: ContentAnalysis = {
        pattern: BulletPattern.SIMPLE_LIST,
        semanticMarkers: [],
        contentType: ContentType.GENERIC,
        contentTypeConfidence: 50,
        bulletCount: 4,
        avgBulletLength: 50, // No constraint, so this should be fine
        maxBulletLength: 80,
        totalWordCount: 200,
        hasSequence: false,
        hasDistinctConcepts: false,
        hasHierarchy: false,
      };

      const result = evaluateCapacity(capacity, content);

      expect(result.fits).toBe(true);
    });
  });

  describe("Density Compatibility", () => {
    it("should match exact density levels", () => {
      expect(isDensityCompatible("low", "low")).toBe(true);
      expect(isDensityCompatible("medium", "medium")).toBe(true);
      expect(isDensityCompatible("high", "high")).toBe(true);
    });

    it("should allow medium layouts to handle any density", () => {
      expect(isDensityCompatible("medium", "low")).toBe(true);
      expect(isDensityCompatible("medium", "medium")).toBe(true);
      expect(isDensityCompatible("medium", "high")).toBe(true);
    });

    it("should allow low layouts to handle low and medium content", () => {
      expect(isDensityCompatible("low", "low")).toBe(true);
      expect(isDensityCompatible("low", "medium")).toBe(true);
      expect(isDensityCompatible("low", "high")).toBe(false);
    });

    it("should allow high layouts to handle medium and high content", () => {
      expect(isDensityCompatible("high", "low")).toBe(false);
      expect(isDensityCompatible("high", "medium")).toBe(true);
      expect(isDensityCompatible("high", "high")).toBe(true);
    });
  });

  describe("Content Density Calculation", () => {
    it("should classify low density content", () => {
      const content: ContentAnalysis = {
        pattern: BulletPattern.SIMPLE_LIST,
        semanticMarkers: [],
        contentType: ContentType.GENERIC,
        contentTypeConfidence: 50,
        bulletCount: 2,
        avgBulletLength: 10,
        maxBulletLength: 15,
        totalWordCount: 20,
        hasSequence: false,
        hasDistinctConcepts: false,
        hasHierarchy: false,
      };

      expect(calculateContentDensity(content)).toBe("low");
    });

    it("should classify medium density content", () => {
      const content: ContentAnalysis = {
        pattern: BulletPattern.SIMPLE_LIST,
        semanticMarkers: [],
        contentType: ContentType.GENERIC,
        contentTypeConfidence: 50,
        bulletCount: 4,
        avgBulletLength: 30,
        maxBulletLength: 50,
        totalWordCount: 120,
        hasSequence: false,
        hasDistinctConcepts: false,
        hasHierarchy: false,
      };

      expect(calculateContentDensity(content)).toBe("medium");
    });

    it("should classify high density content", () => {
      const content: ContentAnalysis = {
        pattern: BulletPattern.SIMPLE_LIST,
        semanticMarkers: [],
        contentType: ContentType.GENERIC,
        contentTypeConfidence: 50,
        bulletCount: 8,
        avgBulletLength: 50,
        maxBulletLength: 80,
        totalWordCount: 400,
        hasSequence: false,
        hasDistinctConcepts: false,
        hasHierarchy: false,
      };

      expect(calculateContentDensity(content)).toBe("high");
    });
  });
});
