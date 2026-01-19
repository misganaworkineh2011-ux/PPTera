/**
 * Tests for layout selection explainability
 * 
 * Verifies that explanation functions generate human-readable output
 * and include all required information.
 * 
 * Requirements: 10.1, 10.2, 10.3
 */

import { describe, it, expect } from "vitest";
import {
  generateExplanation,
  explainSelection,
  getTopFactors,
} from "../selectors/layout-selector";
import type { LayoutMatch, ContentAnalysis } from "../types";

describe("Layout Selection Explainability", () => {
  // Sample data for testing
  const sampleMatch: LayoutMatch = {
    category: "boxes",
    score: 145,
    confidence: "high",
    scoreBreakdown: {
      contentType: 40,
      pattern: 35,
      capacity: 30,
      semanticIntent: 25,
      visualStrategy: 20,
      density: 15,
      media: 10,
      bulletLength: 5,
      priority: 15,
      confidenceBonus: 10,
      repetitionPenalty: -10,
    },
  };
  
  const sampleAnalysis: ContentAnalysis = {
    pattern: "distinct-concepts",
    semanticMarkers: ["features", "benefits"],
    contentType: "FEATURES",
    contentTypeConfidence: 85,
    bulletCount: 4,
    avgBulletLength: 12,
    maxBulletLength: 18,
    totalWordCount: 48,
    hasSequence: false,
    hasDistinctConcepts: true,
    hasHierarchy: false,
  };
  
  const runnerUps: LayoutMatch[] = [
    {
      category: "bullets",
      score: 120,
      confidence: "high",
      scoreBreakdown: {
        contentType: 30,
        pattern: 25,
        capacity: 30,
        semanticIntent: 20,
        visualStrategy: 15,
        density: 10,
        media: 5,
        bulletLength: 5,
        priority: 5,
        confidenceBonus: 10,
        repetitionPenalty: -5,
      },
    },
    {
      category: "circles",
      score: 95,
      confidence: "medium",
      scoreBreakdown: {
        contentType: 25,
        pattern: 20,
        capacity: 25,
        semanticIntent: 15,
        visualStrategy: 10,
        density: 10,
        media: 5,
        bulletLength: 5,
        priority: 0,
        confidenceBonus: 10,
        repetitionPenalty: -10,
      },
    },
  ];
  
  describe("generateExplanation", () => {
    it("should generate a basic explanation with score and confidence", () => {
      const explanation = generateExplanation(sampleMatch, sampleAnalysis);
      
      expect(explanation).toContain("boxes");
      expect(explanation).toContain("145");
      expect(explanation).toContain("high confidence");
    });
    
    it("should include top contributing factors", () => {
      const explanation = generateExplanation(sampleMatch, sampleAnalysis);
      
      expect(explanation).toContain("content type");
      expect(explanation).toContain("pattern");
      expect(explanation).toContain("capacity");
    });
    
    it("should include confidence reasoning", () => {
      const explanation = generateExplanation(sampleMatch, sampleAnalysis);
      
      expect(explanation).toContain("Strong alignment");
    });
    
    it("should handle medium confidence", () => {
      const mediumMatch = { ...sampleMatch, score: 65, confidence: "medium" as const };
      const explanation = generateExplanation(mediumMatch, sampleAnalysis);
      
      expect(explanation).toContain("medium confidence");
      expect(explanation).toContain("Good fit");
    });
    
    it("should handle low confidence", () => {
      const lowMatch = { ...sampleMatch, score: 35, confidence: "low" as const };
      const explanation = generateExplanation(lowMatch, sampleAnalysis);
      
      expect(explanation).toContain("low confidence");
      expect(explanation).toContain("Acceptable fit");
    });
  });
  
  describe("explainSelection", () => {
    it("should generate comprehensive explanation with all sections", () => {
      const explanation = explainSelection(sampleMatch, runnerUps, sampleAnalysis);
      
      // Should have all major sections
      expect(explanation).toContain("SELECTED LAYOUT:");
      expect(explanation).toContain("TOP CONTRIBUTING FACTORS:");
      expect(explanation).toContain("RUNNER-UPS");
      expect(explanation).toContain("CONTENT ANALYSIS:");
    });
    
    it("should list contributing factors in order of impact", () => {
      const explanation = explainSelection(sampleMatch, runnerUps, sampleAnalysis);
      
      // Should list factors with scores (note: capitalized in output)
      expect(explanation).toContain("Content Type: +40 points");
      expect(explanation).toContain("Pattern: +35 points");
      expect(explanation).toContain("Capacity: +30 points");
    });
    
    it("should explain why runner-ups were not selected", () => {
      const explanation = explainSelection(sampleMatch, runnerUps, sampleAnalysis);
      
      // Should mention runner-ups
      expect(explanation).toContain("bullets");
      expect(explanation).toContain("circles");
      
      // Should explain score differences
      expect(explanation).toContain("Scored");
      expect(explanation).toContain("points lower");
    });
    
    it("should include content analysis summary", () => {
      const explanation = explainSelection(sampleMatch, runnerUps, sampleAnalysis);
      
      expect(explanation).toContain("Content type: FEATURES");
      expect(explanation).toContain("85% confidence");
      expect(explanation).toContain("Pattern: distinct-concepts");
      expect(explanation).toContain("Bullet count: 4");
    });
    
    it("should handle negative scores (penalties)", () => {
      const explanation = explainSelection(sampleMatch, runnerUps, sampleAnalysis);
      
      // Should show negative scores (note: capitalized in output)
      expect(explanation).toContain("Repetition Penalty: -10 points");
    });
    
    it("should work with empty runner-ups", () => {
      const explanation = explainSelection(sampleMatch, [], sampleAnalysis);
      
      // Should still have main sections
      expect(explanation).toContain("SELECTED LAYOUT:");
      expect(explanation).toContain("TOP CONTRIBUTING FACTORS:");
      expect(explanation).toContain("CONTENT ANALYSIS:");
      
      // Should not have runner-ups section
      expect(explanation).not.toContain("RUNNER-UPS");
    });
  });
  
  describe("getTopFactors", () => {
    it("should return factors sorted by score", () => {
      const factors = getTopFactors(sampleMatch.scoreBreakdown);
      
      // Should be in descending order
      expect(factors[0]).toBe("contentType");
      expect(factors[1]).toBe("pattern");
      expect(factors[2]).toBe("capacity");
    });
    
    it("should only include positive scores", () => {
      const factors = getTopFactors(sampleMatch.scoreBreakdown);
      
      // Should not include repetitionPenalty (negative)
      expect(factors).not.toContain("repetitionPenalty");
    });
    
    it("should respect the limit parameter", () => {
      const factors = getTopFactors(sampleMatch.scoreBreakdown, 3);
      
      expect(factors).toHaveLength(3);
    });
    
    it("should handle all zero scores", () => {
      const zeroBreakdown = {
        contentType: 0,
        pattern: 0,
        capacity: 0,
        semanticIntent: 0,
        visualStrategy: 0,
        density: 0,
        media: 0,
        bulletLength: 0,
        priority: 0,
        confidenceBonus: 0,
        repetitionPenalty: 0,
      };
      
      const factors = getTopFactors(zeroBreakdown);
      
      expect(factors).toHaveLength(0);
    });
  });
});
