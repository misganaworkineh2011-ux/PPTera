/**
 * Property-Based Tests for Layout Scorer
 * 
 * Tests the scoring consistency property using property-based testing
 * with fast-check.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { scoreLayout } from "./layout-scorer";
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
import { evaluateCapacity } from "./capacity-evaluator";
import { LAYOUT_DEFINITIONS } from "../registry/layout-definitions";
import type {
  LayoutDefinition,
  LayoutScoringInput,
  ContentAnalysis,
  BulletPattern,
  ContentType,
  VisualStrategy,
} from "../types";

/**
 * **Feature: smart-layout-selection, Property 5: Scoring Consistency**
 * 
 * For any layout and scoring input, the total score must equal the sum of all
 * individual factor scores (contentType + pattern + capacity + semanticIntent +
 * visualStrategy + density + media + bulletLength + priority + confidence +
 * repetitionPenalty), and each factor must contribute its defined weight when
 * conditions are met.
 * 
 * **Validates: Requirements 4.1-4.10**
 */
describe("Property 5: Scoring Consistency", () => {
  // Arbitrary generators for test data
  
  /**
   * Generates arbitrary content analysis objects
   */
  const arbitraryContentAnalysis: fc.Arbitrary<ContentAnalysis> = fc.record({
    pattern: fc.constantFrom(
      "numbered-steps" as BulletPattern,
      "quoted-text" as BulletPattern,
      "numeric" as BulletPattern,
      "sequential" as BulletPattern,
      "instructional" as BulletPattern,
      "distinct-concepts" as BulletPattern,
      "comparison" as BulletPattern,
      "categorical" as BulletPattern,
      "simple-list" as BulletPattern
    ),
    semanticMarkers: fc.array(
      fc.constantFrom(
        "timeline", "process", "statistics", "quotes", "comparisons",
        "instructions", "categories", "features", "steps", "cycle"
      )
    ),
    contentType: fc.constantFrom(
      "TIMELINE" as ContentType,
      "PROCESS" as ContentType,
      "FEATURES" as ContentType,
      "STATISTICS" as ContentType,
      "HOW_TO" as ContentType,
      "COMPARISON" as ContentType,
      "TESTIMONIAL" as ContentType,
      "CATEGORIES" as ContentType,
      "STEPS" as ContentType,
      "CYCLE" as ContentType,
      "GENERIC" as ContentType
    ),
    contentTypeConfidence: fc.integer({ min: 0, max: 100 }),
    bulletCount: fc.integer({ min: 1, max: 10 }),
    avgBulletLength: fc.integer({ min: 5, max: 50 }),
    maxBulletLength: fc.integer({ min: 10, max: 100 }),
    totalWordCount: fc.integer({ min: 10, max: 500 }),
    hasSequence: fc.boolean(),
    hasDistinctConcepts: fc.boolean(),
    hasHierarchy: fc.boolean(),
  });
  
  /**
   * Generates arbitrary visual strategy objects
   */
  const arbitraryVisualStrategy: fc.Arbitrary<VisualStrategy> = fc.record({
    primary: fc.constantFrom("diagram", "image", "mixed", "text-focused"),
    pattern: fc.constantFrom("cards", "grid", "flow", "split", "spotlight", "pyramid", "timeline"),
    emphasis: fc.constantFrom("progression", "contrast", "relationship", "scale", "hierarchy", "clarity"),
  });
  
  /**
   * Generates arbitrary layout scoring inputs
   */
  const arbitraryScoringInput: fc.Arbitrary<LayoutScoringInput> = fc.record({
    semanticIntent: fc.constantFrom("inform", "compare", "instruct", "emphasize", "narrate"),
    visualStrategy: arbitraryVisualStrategy,
    contentLayoutHint: fc.option(fc.constantFrom(
      "boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers"
    )),
    hasImage: fc.boolean(),
    hasIcon: fc.option(fc.boolean()),
    analysis: arbitraryContentAnalysis,
    slidePosition: fc.constantFrom("first", "middle", "last"),
    previousLayouts: fc.array(
      fc.constantFrom("boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers", "images"),
      { maxLength: 5 }
    ),
    isNarrowSpace: fc.boolean(),
  });
  
  /**
   * Generates arbitrary layout definitions from the registry
   */
  const arbitraryLayout = fc.constantFrom(...LAYOUT_DEFINITIONS);
  
  it("property: total score equals sum of all factor scores", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // If layout doesn't fit (capacity overflow), score should be 0
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            expect(match.score).toBe(0);
            return; // Skip further checks for rejected layouts
          }
          
          // Calculate expected total from breakdown
          const breakdown = match.scoreBreakdown;
          const expectedTotal =
            breakdown.contentType +
            breakdown.pattern +
            breakdown.capacity +
            breakdown.semanticIntent +
            breakdown.visualStrategy +
            breakdown.density +
            breakdown.media +
            breakdown.bulletLength +
            breakdown.priority +
            breakdown.confidenceBonus +
            breakdown.repetitionPenalty +
            breakdown.hintBonus;
          
          // Total score should equal sum of all factors
          expect(match.score).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: each factor score matches individual scoring function", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          const breakdown = match.scoreBreakdown;
          
          // Verify each factor matches its individual scoring function
          expect(breakdown.contentType).toBe(scoreContentType(layout, input));
          expect(breakdown.pattern).toBe(scorePattern(layout, input));
          expect(breakdown.capacity).toBe(scoreCapacity(capacityEval.utilization));
          expect(breakdown.semanticIntent).toBe(scoreSemanticIntent(layout, input));
          expect(breakdown.visualStrategy).toBe(scoreVisualStrategy(layout, input));
          expect(breakdown.density).toBe(scoreDensity(layout, input.analysis));
          
          const mediaScores = scoreMediaConstraints(layout, input);
          expect(breakdown.media).toBe(mediaScores.image + mediaScores.space);
          
          expect(breakdown.bulletLength).toBe(scoreBulletLength(layout, input.analysis));
          expect(breakdown.priority).toBe(calculatePriorityBonus(layout));
          expect(breakdown.confidenceBonus).toBe(calculateConfidenceBonus(input.analysis.contentTypeConfidence));
          expect(breakdown.repetitionPenalty).toBe(calculateRepetitionPenalty(layout.category, input.previousLayouts));
          expect(breakdown.hintBonus).toBe(calculateHintBonus(layout.category, input.contentLayoutHint));
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: content type factor contributes correct weight (40 points base)", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          const contentType = input.analysis.contentType;
          // Mirror scoreContentType: undeclared affinity gets a 0.7 floor for
          // GENERIC content (so no layout is locked out of typical slides),
          // and 0 for specific content types.
          const affinity =
            layout.contentTypeAffinity[contentType] ??
            (contentType === ("GENERIC" as typeof contentType) ? 0.7 : 0);
          const expectedScore = 40 * affinity;

          expect(match.scoreBreakdown.contentType).toBe(expectedScore);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: pattern factor contributes correct weight (35 points base)", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          const pattern = input.analysis.pattern;
          const affinity = layout.patternAffinity[pattern] || 0;
          const expectedScore = 35 * affinity;
          
          expect(match.scoreBreakdown.pattern).toBe(expectedScore);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: capacity factor contributes correct weight (30 points max)", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          // Capacity score should be between 0 and 30
          expect(match.scoreBreakdown.capacity).toBeGreaterThanOrEqual(0);
          expect(match.scoreBreakdown.capacity).toBeLessThanOrEqual(30);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: semantic intent factor contributes correct weight (25 points)", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          const isCompatible = layout.semanticIntentCompatibility.includes(input.semanticIntent);
          const expectedScore = isCompatible ? 25 : 0;
          
          expect(match.scoreBreakdown.semanticIntent).toBe(expectedScore);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: visual strategy factor contributes correct weight (25 points max)", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          // Visual strategy score should be between 0 and 25
          expect(match.scoreBreakdown.visualStrategy).toBeGreaterThanOrEqual(0);
          expect(match.scoreBreakdown.visualStrategy).toBeLessThanOrEqual(25);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: density factor contributes correct weight (20 points max)", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          // Density score should be 0, 15, or 20
          expect([0, 15, 20]).toContain(match.scoreBreakdown.density);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: priority bonus contributes correct values", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          // Priority bonus should match layout priority
          const expectedBonus = 
            layout.priority === "high" ? 15 :
            layout.priority === "medium" ? 5 :
            layout.priority === "low" ? 0 :
            layout.priority === "fallback" ? -10 : 0;
          
          expect(match.scoreBreakdown.priority).toBe(expectedBonus);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: confidence bonus contributes correct values", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          const confidence = input.analysis.contentTypeConfidence;
          const expectedBonus = 
            confidence >= 70 ? 10 :
            confidence >= 40 ? 5 : 0;
          
          expect(match.scoreBreakdown.confidenceBonus).toBe(expectedBonus);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: repetition penalty contributes correct values", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Skip if layout doesn't fit
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          if (!capacityEval.fits) {
            return;
          }
          
          // Count consecutive occurrences at end of previousLayouts
          let consecutiveCount = 0;
          for (let i = input.previousLayouts.length - 1; i >= 0; i--) {
            if (input.previousLayouts[i] === layout.category) {
              consecutiveCount++;
            } else {
              break;
            }
          }

          // Mirror calculateRepetitionPenalty: deck-wide usage (-7/use, cap 4)
          // plus a consecutive extra (-8 for one, -15 for two-or-more).
          let expectedPenalty = 0;
          if (input.previousLayouts.length > 0) {
            const totalUses = input.previousLayouts.filter(
              (c) => c === layout.category
            ).length;
            expectedPenalty = totalUses > 0 ? -7 * Math.min(totalUses, 4) : 0;
            if (consecutiveCount >= 2) {
              expectedPenalty -= 15;
            } else if (consecutiveCount === 1) {
              expectedPenalty -= 8;
            }
          }

          expect(match.scoreBreakdown.repetitionPenalty).toBe(expectedPenalty);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: rejected layouts (capacity overflow) have zero score", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
          const match = scoreLayout(layout, input);
          
          if (!capacityEval.fits) {
            // If capacity check fails, score must be 0
            expect(match.score).toBe(0);
            expect(match.confidence).toBe("low");
            
            // All breakdown factors should be 0
            Object.values(match.scoreBreakdown).forEach(score => {
              expect(score).toBe(0);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it("property: confidence level matches score thresholds", () => {
    fc.assert(
      fc.property(
        arbitraryLayout,
        arbitraryScoringInput,
        (layout, input) => {
          const match = scoreLayout(layout, input);
          
          // Verify confidence level matches score
          if (match.score >= 80) {
            expect(match.confidence).toBe("high");
          } else if (match.score >= 50) {
            expect(match.confidence).toBe("medium");
          } else {
            expect(match.confidence).toBe("low");
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
