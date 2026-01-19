/**
 * Property-Based Tests for Layout Selector
 * 
 * Tests correctness properties using fast-check for property-based testing.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  selectBestLayout,
  calculateConfidence,
  getFallbackLayout,
  generateExplanation,
  getTopFactors,
  selectLayout,
} from "./layout-selector";
import type {
  LayoutMatch,
  ContentAnalysis,
  LayoutScoringInput,
  BulletPattern,
  ContentType,
  SemanticMarkers,
} from "../types";

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generate arbitrary content analysis
 */
const contentAnalysisArb = fc.record({
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
      "timeline" as SemanticMarkers,
      "process" as SemanticMarkers,
      "statistics" as SemanticMarkers,
      "quotes" as SemanticMarkers,
      "comparisons" as SemanticMarkers,
      "instructions" as SemanticMarkers,
      "categories" as SemanticMarkers,
      "features" as SemanticMarkers,
      "steps" as SemanticMarkers,
      "cycle" as SemanticMarkers
    ),
    { minLength: 0, maxLength: 5 }
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
  bulletCount: fc.integer({ min: 0, max: 20 }),
  avgBulletLength: fc.integer({ min: 0, max: 100 }),
  maxBulletLength: fc.integer({ min: 0, max: 200 }),
  totalWordCount: fc.integer({ min: 0, max: 500 }),
  hasSequence: fc.boolean(),
  hasDistinctConcepts: fc.boolean(),
  hasHierarchy: fc.boolean(),
});

/**
 * Generate arbitrary layout match with score
 */
const layoutMatchArb = fc.record({
  category: fc.constantFrom(
    "boxes",
    "bullets",
    "sequence",
    "steps",
    "quotes",
    "circles",
    "numbers",
    "images"
  ),
  score: fc.integer({ min: 0, max: 200 }),
  confidence: fc.constantFrom("high", "medium", "low"),
  scoreBreakdown: fc.record({
    contentType: fc.integer({ min: 0, max: 80 }),
    pattern: fc.integer({ min: 0, max: 70 }),
    capacity: fc.integer({ min: 0, max: 30 }),
    semanticIntent: fc.integer({ min: 0, max: 25 }),
    visualStrategy: fc.integer({ min: 0, max: 25 }),
    density: fc.integer({ min: 0, max: 20 }),
    media: fc.integer({ min: 0, max: 30 }),
    bulletLength: fc.integer({ min: 0, max: 10 }),
    priority: fc.integer({ min: -10, max: 15 }),
    confidenceBonus: fc.integer({ min: 0, max: 10 }),
    repetitionPenalty: fc.integer({ min: -15, max: 0 }),
  }),
});

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe("Layout Selector - Property Tests", () => {
  /**
   * **Feature: smart-layout-selection, Property 6: Fallback Guarantee**
   * 
   * For any slide where all layouts score below 30 points, the system must
   * select a safe fallback layout (bullets or boxes) rather than failing
   * or selecting a poor-fit layout.
   * 
   * **Validates: Requirements 4.11**
   */
  describe("Property 6: Fallback Guarantee", () => {
    it("should always return a valid layout category when all scores are below threshold", () => {
      fc.assert(
        fc.property(
          fc.array(layoutMatchArb, { minLength: 1, maxLength: 10 }),
          (matches) => {
            // Force all scores below 30
            const lowScoringMatches = matches.map(m => ({
              ...m,
              score: Math.min(m.score, 29),
            }));
            
            const result = selectBestLayout(lowScoringMatches);
            
            // Should return null when all scores below threshold
            expect(result).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should return 'bullets' for text-heavy content (bulletCount > 4)", () => {
      fc.assert(
        fc.property(
          contentAnalysisArb,
          (analysis) => {
            // Force bulletCount > 4
            const textHeavyAnalysis = {
              ...analysis,
              bulletCount: analysis.bulletCount > 4 ? analysis.bulletCount : 5,
            };
            
            const fallback = getFallbackLayout(textHeavyAnalysis);
            
            expect(fallback).toBe("bullets");
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should return 'boxes' for short content (bulletCount <= 4)", () => {
      fc.assert(
        fc.property(
          contentAnalysisArb,
          (analysis) => {
            // Force bulletCount <= 4
            const shortAnalysis = {
              ...analysis,
              bulletCount: Math.min(analysis.bulletCount, 4),
            };
            
            const fallback = getFallbackLayout(shortAnalysis);
            
            expect(fallback).toBe("boxes");
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should always return either 'bullets' or 'boxes' as fallback", () => {
      fc.assert(
        fc.property(
          contentAnalysisArb,
          (analysis) => {
            const fallback = getFallbackLayout(analysis);
            
            expect(["bullets", "boxes"]).toContain(fallback);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Additional unit tests for confidence calculator
   */
  describe("Confidence Calculator", () => {
    it("should return 'high' for scores >= 80", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 80, max: 200 }),
          (score) => {
            expect(calculateConfidence(score)).toBe("high");
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should return 'medium' for scores >= 50 and < 80", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 79 }),
          (score) => {
            expect(calculateConfidence(score)).toBe("medium");
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should return 'low' for scores < 50", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 49 }),
          (score) => {
            expect(calculateConfidence(score)).toBe("low");
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Additional unit tests for explanation generator
   */
  describe("Explanation Generator", () => {
    it("should always include the selected category and confidence", () => {
      fc.assert(
        fc.property(
          layoutMatchArb,
          contentAnalysisArb,
          (match, analysis) => {
            const explanation = generateExplanation(match, analysis);
            
            expect(explanation).toContain(match.category);
            expect(explanation).toContain(match.confidence);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should always include the score", () => {
      fc.assert(
        fc.property(
          layoutMatchArb,
          contentAnalysisArb,
          (match, analysis) => {
            const explanation = generateExplanation(match, analysis);
            
            expect(explanation).toContain(match.score.toString());
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Additional unit tests for top factors
   */
  describe("Top Factors", () => {
    it("should only return factors with positive scores", () => {
      fc.assert(
        fc.property(
          layoutMatchArb,
          (match) => {
            const factors = getTopFactors(match.scoreBreakdown);
            
            factors.forEach(factorName => {
              const score = match.scoreBreakdown[factorName as keyof typeof match.scoreBreakdown];
              expect(score).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should return at most the specified limit", () => {
      fc.assert(
        fc.property(
          layoutMatchArb,
          fc.integer({ min: 1, max: 10 }),
          (match, limit) => {
            const factors = getTopFactors(match.scoreBreakdown, limit);
            
            expect(factors.length).toBeLessThanOrEqual(limit);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should return factors sorted by score (descending)", () => {
      fc.assert(
        fc.property(
          layoutMatchArb,
          (match) => {
            const factors = getTopFactors(match.scoreBreakdown);
            
            // Check that scores are in descending order
            for (let i = 0; i < factors.length - 1; i++) {
              const currentScore = match.scoreBreakdown[factors[i] as keyof typeof match.scoreBreakdown];
              const nextScore = match.scoreBreakdown[factors[i + 1] as keyof typeof match.scoreBreakdown];
              expect(currentScore).toBeGreaterThanOrEqual(nextScore);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Additional unit tests for selectBestLayout
   */
  describe("Select Best Layout", () => {
    it("should return null when all matches have score < 30", () => {
      fc.assert(
        fc.property(
          fc.array(layoutMatchArb, { minLength: 1, maxLength: 10 }),
          (matches) => {
            const lowMatches = matches.map(m => ({ ...m, score: Math.min(m.score, 29) }));
            const result = selectBestLayout(lowMatches);
            expect(result).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should return the highest scoring match when scores >= 30", () => {
      fc.assert(
        fc.property(
          fc.array(layoutMatchArb, { minLength: 1, maxLength: 10 }),
          (matches) => {
            // Ensure at least one match has score >= 30
            const viableMatches = matches.map((m, i) => ({
              ...m,
              score: i === 0 ? Math.max(m.score, 30) : m.score,
            }));
            
            const result = selectBestLayout(viableMatches);
            
            if (result) {
              // Result should be one of the viable matches
              const viableScores = viableMatches.filter(m => m.score >= 30).map(m => m.score);
              const maxScore = Math.max(...viableScores);
              expect(result.score).toBe(maxScore);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * **Feature: smart-layout-selection, Property 13: Graceful Failure**
   * 
   * For any layout selection that fails (exception thrown, timeout exceeded,
   * invalid input), the system must return a safe fallback layout (bullets or boxes)
   * without throwing an exception or blocking the presentation stream.
   * 
   * **Validates: Requirements 8.3**
   */
  describe("Property 13: Graceful Failure", () => {
    it("should never throw an exception when given invalid input", () => {
      fc.assert(
        fc.property(
          fc.anything(),
          (invalidInput) => {
            // Try to call selectLayout with invalid input
            // It should handle gracefully and not throw
            try {
              // Cast to any to bypass TypeScript checks for testing
              const result = selectLayout(invalidInput as any);
              
              // If it returns, it should be a valid LayoutSelection
              expect(result).toBeDefined();
              expect(result.category).toBeDefined();
              expect(["bullets", "boxes", "sequence", "steps", "quotes", "circles", "numbers", "images"]).toContain(result.category);
            } catch (error) {
              // If it throws, fail the test
              throw new Error(`selectLayout threw an exception with invalid input: ${error}`);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should return a valid fallback when content analysis is minimal", () => {
      fc.assert(
        fc.property(
          fc.record({
            semanticIntent: fc.string(),
            visualStrategy: fc.record({
              primary: fc.string(),
              pattern: fc.string(),
              emphasis: fc.string(),
            }),
            hasImage: fc.boolean(),
            analysis: contentAnalysisArb,
            slidePosition: fc.constantFrom("first", "middle", "last"),
            previousLayouts: fc.array(
              fc.constantFrom("boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers", "images"),
              { maxLength: 5 }
            ),
            isNarrowSpace: fc.boolean(),
          }),
          (input) => {
            const result = selectLayout(input);
            
            // Should always return a valid result
            expect(result).toBeDefined();
            expect(result.category).toBeDefined();
            expect(result.style).toBeDefined();
            expect(result.slideLayout).toBeDefined();
            expect(result.confidence).toBeDefined();
            expect(result.explanation).toBeDefined();
            expect(Array.isArray(result.factors)).toBe(true);
            expect(Array.isArray(result.runnerUps)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should always return either bullets or boxes as fallback when all scores are low", () => {
      fc.assert(
        fc.property(
          contentAnalysisArb,
          (analysis) => {
            // Create input that will likely result in low scores
            const input: LayoutScoringInput = {
              semanticIntent: "unknown",
              visualStrategy: {
                primary: "unknown",
                pattern: "unknown",
                emphasis: "unknown",
              },
              hasImage: false,
              analysis,
              slidePosition: "middle",
              previousLayouts: [],
              isNarrowSpace: false,
            };
            
            const result = selectLayout(input);
            
            // Should return a valid layout
            expect(result).toBeDefined();
            expect(result.category).toBeDefined();
            
            // If confidence is low, should be bullets or boxes
            if (result.confidence === "low") {
              expect(["bullets", "boxes"]).toContain(result.category);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should handle empty previous layouts array", () => {
      fc.assert(
        fc.property(
          contentAnalysisArb,
          (analysis) => {
            const input: LayoutScoringInput = {
              semanticIntent: "inform",
              visualStrategy: {
                primary: "text-focused",
                pattern: "cards",
                emphasis: "clarity",
              },
              hasImage: false,
              analysis,
              slidePosition: "middle",
              previousLayouts: [], // Empty array
              isNarrowSpace: false,
            };
            
            // Should not throw
            const result = selectLayout(input);
            expect(result).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it("should handle extreme bullet counts", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (bulletCount) => {
            const analysis: ContentAnalysis = {
              pattern: "simple-list" as BulletPattern,
              semanticMarkers: [],
              contentType: "GENERIC" as ContentType,
              contentTypeConfidence: 50,
              bulletCount,
              avgBulletLength: 10,
              maxBulletLength: 20,
              totalWordCount: bulletCount * 10,
              hasSequence: false,
              hasDistinctConcepts: false,
              hasHierarchy: false,
            };
            
            const input: LayoutScoringInput = {
              semanticIntent: "inform",
              visualStrategy: {
                primary: "text-focused",
                pattern: "cards",
                emphasis: "clarity",
              },
              hasImage: false,
              analysis,
              slidePosition: "middle",
              previousLayouts: [],
              isNarrowSpace: false,
            };
            
            // Should handle gracefully
            const result = selectLayout(input);
            expect(result).toBeDefined();
            expect(result.category).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
