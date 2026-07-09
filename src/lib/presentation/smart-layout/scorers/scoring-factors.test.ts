/**
 * Unit Tests for Scoring Factors
 * 
 * Tests individual scoring functions to ensure they calculate
 * scores correctly according to the requirements.
 */

import { describe, it, expect } from "vitest";
import {
  scoreContentType,
  scorePattern,
  scoreCapacity,
  scoreSemanticIntent,
  scoreVisualStrategy,
  scoreDensity,
  scoreMediaConstraints,
  scoreBulletLength,
  calculatePriorityBonus,
  calculateConfidenceBonus,
  calculateRepetitionPenalty,
  calculateHintBonus,
} from "./scoring-factors";
import { LAYOUT_DEFINITIONS } from "../registry/layout-definitions";
import { ContentType, BulletPattern } from "../types";
import type { LayoutScoringInput, ContentAnalysis } from "../types";

describe("Scoring Factors", () => {
  // Helper to create mock content analysis
  const createMockAnalysis = (overrides: Partial<ContentAnalysis> = {}): ContentAnalysis => ({
    pattern: BulletPattern.SIMPLE_LIST,
    semanticMarkers: [],
    contentType: ContentType.GENERIC,
    contentTypeConfidence: 50,
    bulletCount: 4,
    avgBulletLength: 20,
    maxBulletLength: 35,
    totalWordCount: 80,
    hasSequence: false,
    hasDistinctConcepts: false,
    hasHierarchy: false,
    ...overrides,
  });

  // Helper to create mock scoring input
  const createMockInput = (overrides: Partial<LayoutScoringInput> = {}): LayoutScoringInput => ({
    semanticIntent: "inform",
    visualStrategy: {
      primary: "text-focused",
      pattern: "cards",
      emphasis: "clarity",
    },
    hasImage: false,
    analysis: createMockAnalysis(),
    slidePosition: "middle",
    previousLayouts: [],
    isNarrowSpace: false,
    ...overrides,
  });

  describe("scoreContentType", () => {
    it("should return 40 * affinity for matching content type", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const input = createMockInput({
        analysis: createMockAnalysis({ contentType: ContentType.FEATURES }),
      });

      const score = scoreContentType(boxesLayout, input);
      
      // Boxes has 1.8 affinity for FEATURES
      expect(score).toBe(40 * 1.8);
    });

    it("should return 0 for content type with no affinity", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const input = createMockInput({
        analysis: createMockAnalysis({ contentType: ContentType.TIMELINE }),
      });

      const score = scoreContentType(boxesLayout, input);
      expect(score).toBe(0);
    });

    it("should apply the floor affinity for GENERIC content with no declared affinity", () => {
      // GENERIC means "no strong signal" — layouts without a GENERIC entry
      // get a 0.7 floor so they aren't mathematically locked out of typical
      // content (which previously collapsed every deck onto boxes/bullets).
      const layoutWithoutGeneric = LAYOUT_DEFINITIONS.find(
        l => l.contentTypeAffinity[ContentType.GENERIC] === undefined
      )!;
      const input = createMockInput({
        analysis: createMockAnalysis({ contentType: ContentType.GENERIC }),
      });

      const score = scoreContentType(layoutWithoutGeneric, input);
      expect(score).toBe(40 * 0.7);
    });
  });

  describe("scorePattern", () => {
    it("should return 35 * affinity for matching pattern", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const input = createMockInput({
        analysis: createMockAnalysis({ pattern: BulletPattern.DISTINCT_CONCEPTS }),
      });

      const score = scorePattern(boxesLayout, input);
      
      // Boxes has 1.8 affinity for DISTINCT_CONCEPTS
      expect(score).toBe(35 * 1.8);
    });

    it("should return 0 for pattern with no affinity", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const input = createMockInput({
        analysis: createMockAnalysis({ pattern: BulletPattern.NUMBERED_STEPS }),
      });

      const score = scorePattern(boxesLayout, input);
      expect(score).toBe(0);
    });
  });

  describe("scoreCapacity", () => {
    it("should return 30 for optimal utilization (50-70%)", () => {
      expect(scoreCapacity(0.5)).toBe(30);
      expect(scoreCapacity(0.6)).toBe(30);
      expect(scoreCapacity(0.7)).toBe(30);
    });

    it("should scale down for low utilization", () => {
      expect(scoreCapacity(0.25)).toBe(15); // 50% of optimal
      expect(scoreCapacity(0.1)).toBe(6); // 20% of optimal
    });

    it("should scale down for high utilization", () => {
      expect(scoreCapacity(0.8)).toBeCloseTo(15, 1); // Halfway between 70% and 90%
      expect(scoreCapacity(0.85)).toBeCloseTo(7.5, 1); // 75% of the way to 90%
    });
  });

  describe("scoreSemanticIntent", () => {
    it("should return 25 for compatible intent", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const input = createMockInput({ semanticIntent: "inform" });

      const score = scoreSemanticIntent(boxesLayout, input);
      expect(score).toBe(25);
    });

    it("should return 0 for incompatible intent", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const input = createMockInput({ semanticIntent: "narrate" });

      const score = scoreSemanticIntent(boxesLayout, input);
      expect(score).toBe(0);
    });
  });

  describe("scoreVisualStrategy", () => {
    it("should return 25 for full strategy match", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const input = createMockInput({
        visualStrategy: {
          primary: "text-focused",
          pattern: "cards",
          emphasis: "clarity",
        },
      });

      const score = scoreVisualStrategy(boxesLayout, input);
      expect(score).toBe(25);
    });

    it("should return partial score for partial match", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const input = createMockInput({
        visualStrategy: {
          primary: "text-focused",
          pattern: "flow", // Not compatible
          emphasis: "clarity",
        },
      });

      const score = scoreVisualStrategy(boxesLayout, input);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(25);
    });
  });

  describe("scoreDensity", () => {
    it("should return 20 for exact density match", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      // Boxes has "medium" density, so we need medium content
      // Medium density: 100-300 score (bulletCount * avgBulletLength)
      const content = createMockAnalysis({
        bulletCount: 5,
        avgBulletLength: 30, // 5 * 30 = 150 (medium)
      });

      const score = scoreDensity(boxesLayout, content);
      expect(score).toBe(20);
    });

    it("should return 15 for compatible but not exact match", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const content = createMockAnalysis({
        bulletCount: 3,
        avgBulletLength: 15, // Low density
      });

      const score = scoreDensity(boxesLayout, content);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("scoreMediaConstraints", () => {
    it("should boost image score when image present and supported", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const input = createMockInput({ hasImage: true });

      const { image, space } = scoreMediaConstraints(boxesLayout, input);
      expect(image).toBe(15);
    });

    it("should heavily penalize image-required layouts without image", () => {
      const imagesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "images")!;
      const input = createMockInput({ hasImage: false });

      const { image } = scoreMediaConstraints(imagesLayout, input);
      expect(image).toBe(-50);
    });

    it("should score space constraints correctly", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const narrowInput = createMockInput({ isNarrowSpace: true });
      const wideInput = createMockInput({ isNarrowSpace: false });

      const narrowResult = scoreMediaConstraints(boxesLayout, narrowInput);
      const wideResult = scoreMediaConstraints(boxesLayout, wideInput);

      expect(narrowResult.space).toBe(15); // Narrow-compatible
      expect(wideResult.space).toBe(12); // Works but not optimal
    });
  });

  describe("scoreBulletLength", () => {
    it("should return 10 for bullets within range", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const content = createMockAnalysis({
        avgBulletLength: 20,
        maxBulletLength: 35,
      });

      const score = scoreBulletLength(boxesLayout, content);
      expect(score).toBe(10);
    });

    it("should reduce score for bullets outside range", () => {
      const boxesLayout = LAYOUT_DEFINITIONS.find(l => l.category === "boxes")!;
      const content = createMockAnalysis({
        avgBulletLength: 60, // Too long
        maxBulletLength: 80, // Too long
      });

      const score = scoreBulletLength(boxesLayout, content);
      expect(score).toBeLessThan(10);
    });
  });

  describe("calculatePriorityBonus", () => {
    it("should return correct bonus for each priority level", () => {
      const highLayout = LAYOUT_DEFINITIONS.find(l => l.priority === "high")!;
      const mediumLayout = LAYOUT_DEFINITIONS.find(l => l.priority === "medium")!;
      const fallbackLayout = LAYOUT_DEFINITIONS.find(l => l.priority === "fallback")!;

      expect(calculatePriorityBonus(highLayout)).toBe(15);
      expect(calculatePriorityBonus(mediumLayout)).toBe(5);
      expect(calculatePriorityBonus(fallbackLayout)).toBe(-10);
    });
  });

  describe("calculateConfidenceBonus", () => {
    it("should return 10 for high confidence (70%+)", () => {
      expect(calculateConfidenceBonus(70)).toBe(10);
      expect(calculateConfidenceBonus(85)).toBe(10);
      expect(calculateConfidenceBonus(100)).toBe(10);
    });

    it("should return 5 for medium confidence (40-69%)", () => {
      expect(calculateConfidenceBonus(40)).toBe(5);
      expect(calculateConfidenceBonus(50)).toBe(5);
      expect(calculateConfidenceBonus(69)).toBe(5);
    });

    it("should return 0 for low confidence (<40%)", () => {
      expect(calculateConfidenceBonus(0)).toBe(0);
      expect(calculateConfidenceBonus(20)).toBe(0);
      expect(calculateConfidenceBonus(39)).toBe(0);
    });
  });

  describe("calculateRepetitionPenalty", () => {
    // Formula: -7 per prior use anywhere in the deck (capped at 4 uses),
    // plus -8 if the immediately-previous slide used it, or -15 for 2+
    // consecutive previous uses.
    it("should return 0 for no repetition", () => {
      const penalty = calculateRepetitionPenalty("boxes", []);
      expect(penalty).toBe(0);
    });

    it("should return 0 for different previous layout", () => {
      const penalty = calculateRepetitionPenalty("boxes", ["bullets"]);
      expect(penalty).toBe(0);
    });

    it("should return -15 for 2 consecutive (usage -7 + consecutive -8)", () => {
      const penalty = calculateRepetitionPenalty("boxes", ["boxes"]);
      expect(penalty).toBe(-15);
    });

    it("should return -29 for 3+ consecutive (usage -14 + consecutive -15)", () => {
      const penalty = calculateRepetitionPenalty("boxes", ["boxes", "boxes"]);
      expect(penalty).toBe(-29);
    });

    it("should keep the deck-wide usage penalty even outside the recent window", () => {
      // boxes was used once earlier in the deck — usage penalty persists (-7)
      const penalty = calculateRepetitionPenalty("boxes", ["boxes", "bullets", "sequence", "circles", "numbers"]);
      expect(penalty).toBe(-7);
    });

    it("should penalize non-consecutive recent repeat (A-B-A-B) via usage", () => {
      const penalty = calculateRepetitionPenalty("boxes", ["boxes", "bullets"]);
      expect(penalty).toBe(-7);
    });

    it("should stack usage and consecutive penalties", () => {
      const penalty = calculateRepetitionPenalty("boxes", ["bullets", "boxes"]);
      expect(penalty).toBe(-15);
    });

    it("should cap the usage penalty at 4 uses", () => {
      // 5 prior non-consecutive uses → capped at -28, no consecutive extra
      const penalty = calculateRepetitionPenalty("boxes", [
        "boxes", "bullets", "boxes", "sequence", "boxes", "circles", "boxes", "numbers", "boxes", "team",
      ]);
      expect(penalty).toBe(-28);
    });
  });

  describe("calculateHintBonus", () => {
    it("should award the bonus when the hint matches the category", () => {
      const bonus = calculateHintBonus("editorial", "editorial");
      expect(bonus).toBe(28);
    });

    it("should award nothing when the hint differs or is absent", () => {
      expect(calculateHintBonus("boxes", "editorial")).toBe(0);
      expect(calculateHintBonus("boxes", undefined)).toBe(0);
    });
  });
});
