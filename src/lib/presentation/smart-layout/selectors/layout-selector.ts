/**
 * Layout Selector
 * 
 * Selects the best layout from scored options, calculates confidence levels,
 * handles fallback scenarios, and generates explanations.
 */

import type {
  LayoutMatch,
  LayoutSelection,
  LayoutScoringInput,
  ContentAnalysis,
} from "../types";
import type { ContentLayoutCategory } from "~/lib/layouts/content";
import type { SlideLayoutType } from "~/lib/layouts/slide";
import { getAllLayouts } from "../registry/layout-registry";
import { scoreAllLayouts } from "../scorers/layout-scorer";

/**
 * Select the best layout from scored options
 * 
 * Filters layouts with score < 30, sorts by score descending,
 * and selects the top match. Returns null if no suitable layout found.
 * 
 * @param matches - Array of scored layout matches
 * @returns Best layout match or null if all scores too low
 * 
 * @example
 * ```typescript
 * const matches = scoreAllLayouts(layouts, input);
 * const best = selectBestLayout(matches);
 * 
 * if (best) {
 *   console.log(`Selected: ${best.category} (score: ${best.score})`);
 * } else {
 *   console.log("No suitable layout found, use fallback");
 * }
 * ```
 */
export function selectBestLayout(matches: LayoutMatch[]): LayoutMatch | null {
  // Filter out layouts with score < 30 (too poor fit)
  const viableMatches = matches.filter(match => match.score >= 30);
  
  if (viableMatches.length === 0) {
    return null;
  }
  
  // Sort by score descending (highest first)
  viableMatches.sort((a, b) => b.score - a.score);
  
  // Return top match (guaranteed to exist since we checked length > 0)
  return viableMatches[0] ?? null;
}

/**
 * Calculate confidence level based on score
 * 
 * - High: score >= 80
 * - Medium: score >= 50
 * - Low: score < 50
 * 
 * @param score - The layout score
 * @returns Confidence level
 * 
 * @example
 * ```typescript
 * calculateConfidence(85); // "high"
 * calculateConfidence(65); // "medium"
 * calculateConfidence(40); // "low"
 * ```
 */
export function calculateConfidence(score: number): "high" | "medium" | "low" {
  if (score >= 80) {
    return "high";
  } else if (score >= 50) {
    return "medium";
  } else {
    return "low";
  }
}

/**
 * Get fallback layout based on content characteristics
 * 
 * Smart fallback selection that considers multiple factors:
 * - Content type (prefer specialized layouts when detected)
 * - Bullet count (use appropriate capacity layouts)
 * - Pattern detection (match structural patterns)
 * - Less biased toward bullets - considers all layout types
 * 
 * @param analysis - Content analysis with content type, pattern, and bullet count
 * @returns Fallback layout category
 * 
 * @example
 * ```typescript
 * const analysis = { contentType: "TIMELINE", bulletCount: 4, ... };
 * getFallbackLayout(analysis); // "sequence" (matches content type)
 * 
 * const analysis2 = { contentType: "STEPS", bulletCount: 3, ... };
 * getFallbackLayout(analysis2); // "steps" (matches content type)
 * ```
 */
export function getFallbackLayout(analysis: ContentAnalysis): ContentLayoutCategory {
  // Content type-based fallback (prefer specialized layouts)
  switch (analysis.contentType) {
    case "TIMELINE":
    case "PROCESS":
      return "sequence";
    case "STEPS":
    case "HOW_TO":
      return analysis.bulletCount <= 5 ? "steps" : "sequence";
    case "TESTIMONIAL":
      return "quotes";
    case "STATISTICS":
      return analysis.bulletCount <= 4 ? "numbers" : "boxes";
    case "CYCLE":
      return "circles";
    case "FEATURES":
    case "CATEGORIES":
    case "COMPARISON":
      return analysis.bulletCount <= 6 ? "boxes" : "bullets";
    default:
      // Generic content - use smart selection based on pattern and count
      break;
  }
  
  // Pattern-based fallback
  if (analysis.pattern === "numbered-steps" || analysis.pattern === "sequential") {
    return analysis.bulletCount <= 5 ? "steps" : "sequence";
  }
  if (analysis.pattern === "quoted-text") {
    return "quotes";
  }
  if (analysis.pattern === "numeric") {
    return "numbers";
  }
  if (analysis.pattern === "distinct-concepts" || analysis.pattern === "categorical") {
    return analysis.bulletCount <= 6 ? "boxes" : "bullets";
  }
  
  // Bullet count-based fallback (less biased, considers all options)
  if (analysis.bulletCount === 1) {
    return "quotes"; // Single item works well as quote
  } else if (analysis.bulletCount === 2) {
    return "boxes"; // Two items work well in boxes
  } else if (analysis.bulletCount >= 3 && analysis.bulletCount <= 6) {
    // Medium count - prefer boxes for visual appeal, bullets for text-heavy
    return analysis.avgBulletLength > 20 ? "bullets" : "boxes";
  } else {
    // High count (7+) - bullets is most appropriate
    return "bullets";
  }
}

/**
 * Generate human-readable explanation of layout selection
 * 
 * Creates an explanation that includes:
 * - Selected layout and confidence
 * - Top contributing factors
 * - Confidence reasoning
 * 
 * @param match - The selected layout match
 * @param analysis - Content analysis
 * @returns Human-readable explanation string
 * 
 * @example
 * ```typescript
 * const explanation = generateExplanation(match, analysis);
 * console.log(explanation);
 * // "Selected 'boxes' layout with high confidence (score: 145).
 * //  Top factors: content type match (40 pts), pattern match (35 pts), capacity fit (30 pts)."
 * ```
 */
export function generateExplanation(
  match: LayoutMatch,
  analysis: ContentAnalysis
): string {
  const parts: string[] = [];
  
  // Main selection statement
  parts.push(
    `Selected '${match.category}' layout with ${match.confidence} confidence (score: ${match.score}).`
  );
  
  // Get top contributing factors (positive scores only)
  const factors = Object.entries(match.scoreBreakdown)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (factors.length > 0) {
    const factorStrings = factors.map(([name, score]) => {
      const formattedName = name
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()
        .trim();
      return `${formattedName} (${score} pts)`;
    });
    
    parts.push(`Top factors: ${factorStrings.join(", ")}.`);
  }
  
  // Add confidence reasoning
  if (match.confidence === "high") {
    parts.push("Strong alignment with content characteristics.");
  } else if (match.confidence === "medium") {
    parts.push("Good fit with some trade-offs.");
  } else {
    parts.push("Acceptable fit but consider alternatives.");
  }
  
  return parts.join(" ");
}

/**
 * Generate comprehensive explanation of layout selection
 * 
 * Creates a detailed explanation that includes:
 * - Selected layout with score and confidence
 * - Top contributing factors in order of impact
 * - Why runner-ups were not selected
 * - Content analysis summary
 * 
 * This function satisfies Requirements 10.1, 10.2, 10.3 for explainability.
 * 
 * @param selectedMatch - The selected layout match
 * @param runnerUps - Array of runner-up matches
 * @param analysis - Content analysis
 * @returns Detailed human-readable explanation
 * 
 * @example
 * ```typescript
 * const explanation = explainSelection(bestMatch, runnerUps, analysis);
 * console.log(explanation);
 * // "SELECTED LAYOUT: boxes (score: 145, high confidence)
 * //  
 * //  TOP CONTRIBUTING FACTORS:
 * //  1. Content type match: 40 points - Content type 'features' strongly matches 'boxes' layout
 * //  2. Pattern match: 35 points - Detected 'distinct-concepts' pattern aligns with boxes
 * //  3. Capacity fit: 30 points - Content fits well within layout capacity (65% utilization)
 * //  ..."
 * ```
 * 
 * Requirements: 10.1, 10.2, 10.3
 */
export function explainSelection(
  selectedMatch: LayoutMatch,
  runnerUps: LayoutMatch[],
  analysis: ContentAnalysis
): string {
  const lines: string[] = [];
  
  // ========================================================================
  // SECTION 1: SELECTED LAYOUT
  // ========================================================================
  
  lines.push("SELECTED LAYOUT:");
  lines.push(
    `  ${selectedMatch.category} (score: ${selectedMatch.score}, ${selectedMatch.confidence} confidence)`
  );
  lines.push("");
  
  // ========================================================================
  // SECTION 2: TOP CONTRIBUTING FACTORS (in order of impact)
  // ========================================================================
  
  lines.push("TOP CONTRIBUTING FACTORS:");
  
  // Get all factors sorted by absolute value (highest impact first)
  const factors = Object.entries(selectedMatch.scoreBreakdown)
    .filter(([_, score]) => score !== 0) // Include both positive and negative
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  
  factors.forEach(([name, score], index) => {
    const formattedName = name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase())
      .trim();
    
    const sign = score > 0 ? "+" : "";
    const explanation = getFactorExplanation(name, score, analysis);
    
    lines.push(`  ${index + 1}. ${formattedName}: ${sign}${score} points`);
    if (explanation) {
      lines.push(`     ${explanation}`);
    }
  });
  
  lines.push("");
  
  // ========================================================================
  // SECTION 3: WHY RUNNER-UPS WERE NOT SELECTED
  // ========================================================================
  
  if (runnerUps.length > 0) {
    lines.push("RUNNER-UPS (not selected because):");
    
    runnerUps.forEach((runnerUp, index) => {
      const scoreDiff = selectedMatch.score - runnerUp.score;
      lines.push(
        `  ${index + 1}. ${runnerUp.category} (score: ${runnerUp.score}, ${runnerUp.confidence} confidence)`
      );
      lines.push(`     Scored ${scoreDiff} points lower than selected layout`);
      
      // Find the biggest differences in factors
      const factorDiffs = Object.entries(selectedMatch.scoreBreakdown)
        .map(([name, selectedScore]) => ({
          name,
          diff: selectedScore - (runnerUp.scoreBreakdown[name as keyof typeof runnerUp.scoreBreakdown] ?? 0),
        }))
        .filter(f => Math.abs(f.diff) > 5) // Only show significant differences
        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
        .slice(0, 2);
      
      if (factorDiffs.length > 0) {
        factorDiffs.forEach(({ name, diff }) => {
          const formattedName = name
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()
            .trim();
          const sign = diff > 0 ? "+" : "";
          lines.push(`     - Weaker ${formattedName} (${sign}${diff} pts difference)`);
        });
      }
    });
    
    lines.push("");
  }
  
  // ========================================================================
  // SECTION 4: CONTENT ANALYSIS SUMMARY
  // ========================================================================
  
  lines.push("CONTENT ANALYSIS:");
  lines.push(`  Content type: ${analysis.contentType} (${analysis.contentTypeConfidence}% confidence)`);
  lines.push(`  Pattern: ${analysis.pattern}`);
  lines.push(`  Bullet count: ${analysis.bulletCount}`);
  lines.push(`  Avg bullet length: ${analysis.avgBulletLength} words`);
  lines.push(`  Semantic markers: ${analysis.semanticMarkers.join(", ") || "none"}`);
  
  return lines.join("\n");
}

/**
 * Get human-readable explanation for a specific scoring factor
 * 
 * Provides context about why a factor contributed to the score.
 * 
 * @param factorName - Name of the scoring factor
 * @param score - The score value
 * @param analysis - Content analysis
 * @returns Explanation string or empty if no specific explanation
 */
function getFactorExplanation(
  factorName: string,
  score: number,
  analysis: ContentAnalysis
): string {
  switch (factorName) {
    case "contentType":
      if (score > 30) {
        return `Content type '${analysis.contentType}' strongly matches this layout`;
      } else if (score > 15) {
        return `Content type '${analysis.contentType}' moderately matches this layout`;
      } else if (score > 0) {
        return `Content type '${analysis.contentType}' weakly matches this layout`;
      }
      return "";
      
    case "pattern":
      if (score > 25) {
        return `Detected '${analysis.pattern}' pattern aligns well with layout`;
      } else if (score > 10) {
        return `Detected '${analysis.pattern}' pattern somewhat aligns with layout`;
      }
      return "";
      
    case "capacity":
      if (score > 20) {
        return `Content fits well within layout capacity`;
      } else if (score > 10) {
        return `Content fits adequately within layout capacity`;
      }
      return "";
      
    case "semanticIntent":
      if (score > 15) {
        return `Semantic intent aligns with layout purpose`;
      }
      return "";
      
    case "visualStrategy":
      if (score > 15) {
        return `Visual strategy matches layout presentation style`;
      }
      return "";
      
    case "density":
      if (score > 15) {
        return `Content density is optimal for this layout`;
      }
      return "";
      
    case "media":
      if (score > 20) {
        return `Media requirements (images/icons) well supported`;
      } else if (score < 0) {
        return `Layout requires media that is not present`;
      }
      return "";
      
    case "priority":
      if (score > 10) {
        return `High-priority layout for this content type`;
      } else if (score < 0) {
        return `Fallback layout with lower priority`;
      }
      return "";
      
    case "confidenceBonus":
      if (score > 5) {
        return `High confidence in content type detection`;
      }
      return "";
      
    case "repetitionPenalty":
      if (score < 0) {
        return `Layout used recently in previous slides`;
      }
      return "";
      
    case "hintBonus":
      if (score >= 50) {
        return `LLM suggested this layout type (strong match)`;
      } else if (score > 0) {
        return `LLM suggested similar layout type (partial match)`;
      }
      return "";
      
    default:
      return "";
  }
}

/**
 * Get top contributing factors from score breakdown
 * 
 * Returns an array of factor names sorted by contribution (highest first).
 * Only includes factors with positive scores.
 * 
 * @param scoreBreakdown - The score breakdown object
 * @param limit - Maximum number of factors to return (default: 5)
 * @returns Array of factor names
 * 
 * @example
 * ```typescript
 * const factors = getTopFactors(match.scoreBreakdown);
 * // ["contentType", "pattern", "capacity", "semanticIntent", "visualStrategy"]
 * ```
 */
export function getTopFactors(
  scoreBreakdown: Record<string, number>,
  limit: number = 5
): string[] {
  return Object.entries(scoreBreakdown)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

/**
 * Determine slide layout (image position) based on category and image presence
 * 
 * Maps layout category to appropriate slide layout type.
 * 
 * @param category - The selected layout category
 * @param hasImage - Whether the slide has an image
 * @returns Slide layout type
 */
export function determineSlideLayout(
  category: ContentLayoutCategory,
  hasImage: boolean
): SlideLayoutType {
  if (!hasImage) {
    return "no-image";
  }
  
  // Image-focused layouts use full image
  if (category === "images") {
    return "image-full";
  }
  
  // Default to image on right for most layouts
  return "image-right";
}

/**
 * Main layout selection function
 * 
 * Orchestrates the complete layout selection process:
 * 1. Score all available layouts
 * 2. Select best match or fallback
 * 3. Calculate confidence
 * 4. Generate explanation
 * 5. Return complete LayoutSelection
 * 
 * This function handles errors gracefully and always returns a valid layout,
 * even with invalid or incomplete input.
 * 
 * @param input - Layout scoring input with metadata, analysis, and context
 * @returns Complete layout selection with metadata
 * 
 * @example
 * ```typescript
 * const input: LayoutScoringInput = {
 *   semanticIntent: "inform",
 *   visualStrategy: { primary: "text-focused", pattern: "cards", emphasis: "clarity" },
 *   hasImage: false,
 *   analysis: contentAnalysis,
 *   slidePosition: "middle",
 *   previousLayouts: ["bullets"],
 *   isNarrowSpace: false,
 * };
 * 
 * const selection = selectLayout(input);
 * // {
 * //   category: "boxes",
 * //   style: "box-style-1",
 * //   slideLayout: "no-image",
 * //   confidence: "high",
 * //   score: 145,
 * //   runnerUps: [...],
 * //   explanation: "...",
 * //   factors: ["contentType", "pattern", ...]
 * // }
 * ```
 */
export function selectLayout(input: LayoutScoringInput): LayoutSelection {
  try {
    // Validate input has required fields
    if (!input || !input.analysis) {
      // Return safe fallback for invalid input
      return createFallbackSelection("boxes", "Invalid input provided");
    }
    
    // Get all available layouts
    const layouts = getAllLayouts();
    
    // Score all layouts
    const matches = scoreAllLayouts(layouts, input);
    
    // Select best match
    const bestMatch = selectBestLayout(matches);
  
  // Handle fallback if no suitable match
  let selectedCategory: ContentLayoutCategory;
  let selectedScore: number;
  let selectedConfidence: "high" | "medium" | "low";
  let selectedBreakdown: LayoutMatch["scoreBreakdown"];
  
  if (!bestMatch) {
    // Use fallback
    selectedCategory = getFallbackLayout(input.analysis);
    selectedScore = 0;
    selectedConfidence = "low";
    selectedBreakdown = {
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
  } else {
    selectedCategory = bestMatch.category;
    selectedScore = bestMatch.score;
    selectedConfidence = bestMatch.confidence;
    selectedBreakdown = bestMatch.scoreBreakdown;
  }
  
  // Get runner-ups (top 3 after the selected one)
  const runnerUps = matches
    .filter(m => m.category !== selectedCategory && m.score > 0)
    .slice(0, 3);
  
  // Generate explanation
  const explanation = bestMatch
    ? generateExplanation(bestMatch, input.analysis)
    : `Using fallback layout '${selectedCategory}' (no layouts scored above threshold).`;
  
  // Get top factors
  const factors = getTopFactors(selectedBreakdown as unknown as Record<string, number>);
  
  // Determine slide layout
  const slideLayout = determineSlideLayout(selectedCategory, input.hasImage);
  
  // For now, use default style (will be enhanced in style selector task)
  const style = `${selectedCategory}-style-1`;
  
  return {
    category: selectedCategory,
    style,
    slideLayout,
    confidence: selectedConfidence,
    score: selectedScore,
    runnerUps,
    explanation,
    factors,
  };
  } catch (error) {
    // Graceful failure - return safe fallback
    console.error("[layout-selector] Error during layout selection:", error);
    
    // Determine fallback based on available data
    const fallbackCategory = input?.analysis?.bulletCount > 4 ? "bullets" : "boxes";
    return createFallbackSelection(
      fallbackCategory,
      `Error during selection: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Create a fallback layout selection
 * 
 * Used when layout selection fails or encounters errors.
 * Always returns a valid LayoutSelection with safe defaults.
 * 
 * @param category - The fallback category to use
 * @param reason - Reason for using fallback
 * @returns Complete fallback LayoutSelection
 */
function createFallbackSelection(
  category: ContentLayoutCategory,
  reason: string
): LayoutSelection {
  return {
    category,
    style: `${category}-style-1`,
    slideLayout: "no-image",
    confidence: "low",
    score: 0,
    runnerUps: [],
    explanation: `Using fallback layout '${category}': ${reason}`,
    factors: [],
  };
}
