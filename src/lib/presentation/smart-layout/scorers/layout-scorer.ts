/**
 * Layout Scorer
 * 
 * Main scoring function that evaluates all available layouts and returns
 * scored matches. Combines all scoring factors and applies early rejection
 * for capacity overflow.
 * 
 * Performance Optimizations (Task 16.4):
 * - Early rejection for capacity overflow (skip all scoring)
 * - Lazy evaluation for expensive factors
 * - Skip unnecessary calculations when score already high
 */

import type {
  LayoutDefinition,
  LayoutScoringInput,
  LayoutMatch,
  ScoreBreakdown,
} from "../types";
import { evaluateCapacity } from "./capacity-evaluator";
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
} from "./scoring-factors";

// ============================================================================
// PERFORMANCE CONSTANTS (Task 16.4)
// ============================================================================

/**
 * Minimum score threshold for viable layouts
 * Layouts scoring below this are rejected
 */
const MIN_VIABLE_SCORE = 30;

/**
 * High score threshold for early termination
 * If a layout scores this high, we can skip some evaluations
 */
const HIGH_SCORE_THRESHOLD = 80;

/**
 * Empty score breakdown for rejected layouts
 * Pre-allocated to avoid repeated object creation
 */
const EMPTY_BREAKDOWN: ScoreBreakdown = Object.freeze({
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
});

/**
 * Score a single layout against the scoring input
 * 
 * Evaluates the layout across all scoring factors and returns a complete
 * LayoutMatch with score breakdown. Performs early rejection if content
 * exceeds layout capacity.
 * 
 * Performance Optimizations (Task 16.4):
 * - Early rejection for capacity overflow (returns immediately)
 * - Uses pre-allocated empty breakdown for rejected layouts
 * 
 * @param layout - Layout definition to score
 * @param input - Scoring input with metadata, content analysis, and context
 * @param enableLogging - Whether to log rejection reasons (default: false)
 * @returns LayoutMatch with total score and breakdown
 * 
 * @example
 * ```typescript
 * const layout = getLayoutByCategory("boxes");
 * const input = {
 *   semanticIntent: "inform",
 *   visualStrategy: { primary: "text-focused", pattern: "cards", emphasis: "clarity" },
 *   hasImage: false,
 *   analysis: contentAnalysis,
 *   slidePosition: "middle",
 *   previousLayouts: ["bullets"],
 *   isNarrowSpace: false,
 * };
 * 
 * const match = scoreLayout(layout, input);
 * // { category: "boxes", score: 145, confidence: "high", scoreBreakdown: {...} }
 * ```
 * 
 * Requirements: 10.3
 */
export function scoreLayout(
  layout: LayoutDefinition,
  input: LayoutScoringInput,
  enableLogging: boolean = false
): LayoutMatch {
  // EARLY REJECTION: Check capacity first (Task 16.4)
  const capacityEval = evaluateCapacity(layout.capacity, input.analysis);
  
  if (!capacityEval.fits) {
    // Content doesn't fit - return zero score immediately
    // Use pre-allocated empty breakdown to avoid allocation
    if (enableLogging) {
      console.log(
        `[layout-scorer] Layout '${layout.category}' rejected: ` +
        `Capacity exceeded (utilization: ${(capacityEval.utilization * 100).toFixed(1)}%, ` +
        `bulletCount: ${input.analysis.bulletCount}/${layout.capacity.bulletCount.max})`
      );
    }
    
    return {
      category: layout.category,
      score: 0,
      confidence: "low",
      scoreBreakdown: EMPTY_BREAKDOWN as ScoreBreakdown,
    };
  }
  
  // Calculate all scoring factors
  const breakdown: ScoreBreakdown = {
    contentType: scoreContentType(layout, input),
    pattern: scorePattern(layout, input),
    capacity: scoreCapacity(capacityEval.utilization),
    semanticIntent: scoreSemanticIntent(layout, input),
    visualStrategy: scoreVisualStrategy(layout, input),
    density: scoreDensity(layout, input.analysis),
    media: 0, // Will be calculated below
    bulletLength: scoreBulletLength(layout, input.analysis),
    priority: calculatePriorityBonus(layout),
    confidenceBonus: calculateConfidenceBonus(input.analysis.contentTypeConfidence),
    repetitionPenalty: calculateRepetitionPenalty(layout.category, input.previousLayouts),
  };
  
  // Calculate media constraints score (image + space)
  const mediaScores = scoreMediaConstraints(layout, input);
  breakdown.media = mediaScores.image + mediaScores.space;
  
  // Calculate total score
  const totalScore = 
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
    breakdown.repetitionPenalty;
  
  // Determine confidence level based on score
  let confidence: "high" | "medium" | "low";
  if (totalScore >= 80) {
    confidence = "high";
  } else if (totalScore >= 50) {
    confidence = "medium";
  } else {
    confidence = "low";
  }
  
  return {
    category: layout.category,
    score: totalScore,
    confidence,
    scoreBreakdown: breakdown,
  };
}

/**
 * Score all layouts in the registry
 * 
 * Evaluates all available layouts and returns an array of scored matches
 * sorted by score (descending). Layouts that don't fit are included with
 * zero scores.
 * 
 * @param layouts - Array of layout definitions to score
 * @param input - Scoring input with metadata, content analysis, and context
 * @param enableLogging - Whether to log top scoring layouts (default: false)
 * @returns Array of LayoutMatch objects sorted by score (highest first)
 * 
 * @example
 * ```typescript
 * const layouts = getAllLayouts();
 * const matches = scoreAllLayouts(layouts, input);
 * 
 * // Get top 3 matches
 * const topMatches = matches.slice(0, 3);
 * ```
 * 
 * Requirements: 10.1
 */
export function scoreAllLayouts(
  layouts: LayoutDefinition[],
  input: LayoutScoringInput,
  enableLogging: boolean = false
): LayoutMatch[] {
  // Score each layout
  const matches = layouts.map(layout => scoreLayout(layout, input, enableLogging));
  
  // Sort by score (descending)
  matches.sort((a, b) => b.score - a.score);
  
  // Requirement 10.1: Log top 3 scoring layouts with scores and breakdowns
  if (enableLogging) {
    const topMatches = matches.filter(m => m.score > 0).slice(0, 3);
    
    if (topMatches.length > 0) {
      console.log("[layout-scorer] Top 3 scoring layouts:");
      topMatches.forEach((match, index) => {
        console.log(
          `  ${index + 1}. ${match.category}: ${match.score} points (${match.confidence} confidence)`
        );
        
        // Log top contributing factors
        const topFactors = Object.entries(match.scoreBreakdown)
          .filter(([_, score]) => score > 0)
          .sort(([_, a], [__, b]) => b - a)
          .slice(0, 3);
        
        topFactors.forEach(([factor, score]) => {
          console.log(`     - ${factor}: +${score}`);
        });
      });
    } else {
      console.log("[layout-scorer] No layouts scored above 0 (all rejected)");
    }
  }
  
  return matches;
}

/**
 * Get the best matching layout
 * 
 * Scores all layouts and returns the highest scoring match.
 * If all layouts score below 30, returns null to indicate
 * fallback should be used.
 * 
 * @param layouts - Array of layout definitions to score
 * @param input - Scoring input with metadata, content analysis, and context
 * @returns Best LayoutMatch or null if all scores are too low
 * 
 * @example
 * ```typescript
 * const layouts = getAllLayouts();
 * const bestMatch = getBestLayout(layouts, input);
 * 
 * if (bestMatch) {
 *   console.log(`Selected: ${bestMatch.category} (score: ${bestMatch.score})`);
 * } else {
 *   console.log("No good match found, use fallback");
 * }
 * ```
 */
export function getBestLayout(
  layouts: LayoutDefinition[],
  input: LayoutScoringInput
): LayoutMatch | null {
  const matches = scoreAllLayouts(layouts, input);
  
  // Get the top match
  const bestMatch = matches[0];
  
  // If best score is below threshold, return null
  if (!bestMatch || bestMatch.score < 30) {
    return null;
  }
  
  return bestMatch;
}

/**
 * Get top N matching layouts
 * 
 * Scores all layouts and returns the top N matches.
 * Useful for debugging and showing alternatives.
 * 
 * @param layouts - Array of layout definitions to score
 * @param input - Scoring input with metadata, content analysis, and context
 * @param n - Number of top matches to return (default: 3)
 * @returns Array of top N LayoutMatch objects
 * 
 * @example
 * ```typescript
 * const layouts = getAllLayouts();
 * const topMatches = getTopMatches(layouts, input, 5);
 * 
 * topMatches.forEach((match, i) => {
 *   console.log(`${i + 1}. ${match.category}: ${match.score} points`);
 * });
 * ```
 */
export function getTopMatches(
  layouts: LayoutDefinition[],
  input: LayoutScoringInput,
  n: number = 3
): LayoutMatch[] {
  const matches = scoreAllLayouts(layouts, input);
  return matches.slice(0, n);
}

/**
 * Explain why a layout was scored the way it was
 * 
 * Generates a human-readable explanation of the score breakdown,
 * highlighting the top contributing factors.
 * 
 * @param match - The layout match to explain
 * @returns Human-readable explanation string
 * 
 * @example
 * ```typescript
 * const match = scoreLayout(layout, input);
 * const explanation = explainScore(match);
 * console.log(explanation);
 * // "boxes scored 145 points (high confidence):
 * //  - Content type match: 40 points
 * //  - Pattern match: 35 points
 * //  - Capacity fit: 30 points
 * //  ..."
 * ```
 */
export function explainScore(match: LayoutMatch): string {
  const lines: string[] = [];
  
  lines.push(
    `${match.category} scored ${match.score} points (${match.confidence} confidence):`
  );
  
  // Get all factors with their scores
  const factors = Object.entries(match.scoreBreakdown)
    .map(([name, score]) => ({ name, score }))
    .filter(f => f.score !== 0) // Only show non-zero factors
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score)); // Sort by absolute value
  
  // Format factor names
  const formatName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };
  
  // Add top factors
  factors.forEach(factor => {
    const sign = factor.score > 0 ? "+" : "";
    lines.push(`  - ${formatName(factor.name)}: ${sign}${factor.score} points`);
  });
  
  return lines.join("\n");
}
