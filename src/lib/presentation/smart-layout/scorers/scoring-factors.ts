/**
 * Scoring Factors
 * 
 * Individual scoring functions for evaluating layout suitability.
 * Each function calculates a score for a specific factor based on
 * the layout definition and scoring input.
 */

import type {
  LayoutDefinition,
  LayoutScoringInput,
  ContentAnalysis,
  VisualStrategy,
} from "../types";
import { calculateContentDensity, isDensityCompatible } from "./capacity-evaluator";

/**
 * Score content type compatibility (45 points max)
 * 
 * Uses the layout's contentTypeAffinity to determine how well
 * the layout matches the detected content type. Multiplies base
 * score by affinity multiplier (0-2).
 * 
 * Increased from 40 to 45 to give more weight to content type matching,
 * reducing reliance on bullets as default.
 * 
 * @param layout - Layout definition with content type affinity scores
 * @param input - Scoring input with content analysis
 * @returns Score 0-90 (45 * affinity multiplier up to 2.0)
 */
export function scoreContentType(
  layout: LayoutDefinition,
  input: LayoutScoringInput
): number {
  const contentType = input.analysis.contentType;
  const affinity = layout.contentTypeAffinity[contentType] || 0;
  
  // Base score is 45 points, multiplied by affinity
  return 45 * affinity;
}

/**
 * Score structural pattern match (40 points max)
 * 
 * Uses the layout's patternAffinity to determine how well
 * the layout matches the detected bullet pattern. Multiplies
 * base score by affinity multiplier (0-2).
 * 
 * Increased from 35 to 40 to give more weight to pattern matching,
 * helping specialized layouts (steps, sequence, quotes) score higher.
 * 
 * @param layout - Layout definition with pattern affinity scores
 * @param input - Scoring input with content analysis
 * @returns Score 0-80 (40 * affinity multiplier up to 2.0)
 */
export function scorePattern(
  layout: LayoutDefinition,
  input: LayoutScoringInput
): number {
  const pattern = input.analysis.pattern;
  const affinity = layout.patternAffinity[pattern] || 0;
  
  // Base score is 40 points, multiplied by affinity
  return 40 * affinity;
}

/**
 * Score capacity fit (35 points max)
 * 
 * Scores based on how well the content utilizes the layout's
 * capacity. Optimal utilization (40-80%) gets full points.
 * More lenient than before to allow borderline cases.
 * 
 * GAMMA-STYLE: More forgiving, allows layouts to compete even
 * if capacity isn't perfect.
 * 
 * @param utilization - Capacity utilization (0-1)
 * @returns Score 0-35 based on utilization
 */
export function scoreCapacity(utilization: number): number {
  // Optimal utilization is 40-80% (wider range than before)
  // Below 40%: content is sparse but acceptable
  // Above 80%: content is cramped but acceptable
  // Only extreme cases get penalized heavily
  
  if (utilization >= 0.4 && utilization <= 0.8) {
    // Optimal range: full 35 points
    return 35;
  } else if (utilization < 0.4) {
    // Too sparse: scale linearly from 15 to 35
    // 0% utilization = 15 points (still some credit)
    // 40% utilization = 35 points
    return 15 + (20 * (utilization / 0.4));
  } else {
    // Too cramped: scale linearly from 35 to 15
    // 80% utilization = 35 points
    // 100% utilization = 15 points (still some credit)
    return 35 - (20 * ((utilization - 0.8) / 0.2));
  }
}

/**
 * Score semantic intent alignment (30 points max)
 * 
 * Checks if the slide's semantic intent is compatible with
 * the layout. Returns full points if compatible, partial if close.
 * 
 * GAMMA-STYLE: More lenient - give partial credit for close matches
 * instead of all-or-nothing.
 * 
 * @param layout - Layout definition with semantic intent compatibility
 * @param input - Scoring input with semantic intent
 * @returns Score 0-30
 */
export function scoreSemanticIntent(
  layout: LayoutDefinition,
  input: LayoutScoringInput
): number {
  const isCompatible = layout.semanticIntentCompatibility.includes(
    input.semanticIntent
  );
  
  if (isCompatible) {
    return 30; // Full points for exact match
  }
  
  // Partial credit for common semantic intent pairs
  // e.g., "inform" and "emphasize" are often compatible
  const intentGroups: Record<string, string[]> = {
    "inform": ["emphasize", "analyze", "compare"],
    "instruct": ["demonstrate", "inform"],
    "emphasize": ["inform", "narrate"],
    "compare": ["analyze", "inform"],
    "narrate": ["inform", "emphasize"],
  };
  
  const compatibleIntents = intentGroups[input.semanticIntent] || [];
  if (compatibleIntents.some(intent => layout.semanticIntentCompatibility.includes(intent))) {
    return 15; // Partial credit for compatible intent
  }
  
  return 0; // No match
}

/**
 * Score visual strategy alignment (30 points max)
 * 
 * Checks if the slide's visual strategy matches the layout's
 * compatible strategies. Scores based on how many strategy
 * components match (primary, pattern, emphasis).
 * 
 * GAMMA-STYLE: Pattern match gets extra weight since it's
 * the strongest indicator of layout suitability.
 * 
 * @param layout - Layout definition with visual strategy compatibility
 * @param input - Scoring input with visual strategy
 * @returns Score 0-30 based on strategy match
 */
export function scoreVisualStrategy(
  layout: LayoutDefinition,
  input: LayoutScoringInput
): number {
  const strategy = input.visualStrategy;
  const compatibility = layout.visualStrategyCompatibility;
  
  let matchCount = 0;
  let totalChecks = 0;
  let patternMatch = false;
  
  // Check primary strategy
  if (compatibility.primary) {
    totalChecks++;
    if (compatibility.primary.includes(strategy.primary)) {
      matchCount++;
    }
  }
  
  // Check pattern strategy (most important - gets extra weight)
  if (compatibility.pattern) {
    totalChecks++;
    if (compatibility.pattern.includes(strategy.pattern)) {
      matchCount++;
      patternMatch = true; // Track pattern match separately
    }
  }
  
  // Check emphasis strategy
  if (compatibility.emphasis) {
    totalChecks++;
    if (compatibility.emphasis.includes(strategy.emphasis)) {
      matchCount++;
    }
  }
  
  // If no compatibility rules defined, give partial credit
  if (totalChecks === 0) {
    return 15;
  }
  
  // Base score proportional to matches
  let baseScore = 30 * (matchCount / totalChecks);
  
  // Bonus for pattern match (strong indicator)
  if (patternMatch) {
    baseScore += 5; // Extra 5 points for pattern match
  }
  
  return Math.min(30, baseScore); // Cap at 30
}

/**
 * Score density compatibility (20 points max)
 * 
 * Checks if the content density matches the layout's density
 * requirement. Returns full points if compatible, reduced
 * points if close, zero if incompatible.
 * 
 * @param layout - Layout definition with density requirement
 * @param content - Content analysis with metrics
 * @returns Score 0-20 based on density match
 */
export function scoreDensity(
  layout: LayoutDefinition,
  content: ContentAnalysis
): number {
  const layoutDensity = layout.capacity.density;
  const contentDensity = calculateContentDensity(content);
  
  // Exact match: full points
  if (layoutDensity === contentDensity) {
    return 20;
  }
  
  // Compatible but not exact: partial points
  if (isDensityCompatible(layoutDensity, contentDensity)) {
    return 15;
  }
  
  // Incompatible: no points
  return 0;
}

/**
 * Score media constraints (15 points each for image and space)
 * 
 * Evaluates image presence and space requirements:
 * - Image scoring: boost if layout supports images when present,
 *   apply light penalty (not rejection) if layout doesn't support images
 * - Space scoring: check if layout's space requirement matches
 *   available space
 * 
 * GAMMA-STYLE: More lenient - layouts without image support get
 * light penalty instead of zero score, allowing them to compete.
 * 
 * @param layout - Layout definition with media constraints
 * @param input - Scoring input with media flags
 * @returns Object with image and space scores (0-15 each, can be negative)
 */
export function scoreMediaConstraints(
  layout: LayoutDefinition,
  input: LayoutScoringInput
): { image: number; space: number } {
  let imageScore = 0;
  let spaceScore = 0;
  
  // Image scoring - more lenient approach
  if (input.hasImage) {
    // Has image: boost layouts that support images
    if (layout.capacity.supportsImage) {
      imageScore = 15;
      
      // Extra boost for image-focused layouts
      if (layout.category === "images") {
        imageScore = 30; // Double points for image layouts
      }
    } else {
      // Layout doesn't support images: light penalty instead of zero
      // This allows sequence/timeline layouts to still compete
      imageScore = -10; // Light penalty, not rejection
    }
  } else {
    // No image: penalize layouts that require images
    if (layout.capacity.requiresImage) {
      imageScore = -50; // Heavy penalty for image-required layouts
    } else {
      // No image and layout doesn't require it: neutral
      imageScore = 15;
    }
  }
  
  // Space scoring - more lenient
  if (input.isNarrowSpace) {
    // Narrow space: prefer narrow-compatible layouts
    if (layout.capacity.spaceRequirement === "narrow-compatible") {
      spaceScore = 15;
    } else {
      // Full-width-only in narrow space: light penalty instead of zero
      spaceScore = 5; // Reduced but not zero
    }
  } else {
    // Full width available: all layouts work, slight preference for full-width
    if (layout.capacity.spaceRequirement === "full-width-only") {
      spaceScore = 15;
    } else {
      spaceScore = 12; // Narrow-compatible works but not optimal
    }
  }
  
  return { image: imageScore, space: spaceScore };
}

/**
 * Score bullet length fit (10 points max)
 * 
 * Checks if bullet lengths are within the layout's preferred range.
 * Considers both average and maximum bullet lengths.
 * 
 * @param layout - Layout definition with length constraints
 * @param content - Content analysis with length metrics
 * @returns Score 0-10 based on length fit
 */
export function scoreBulletLength(
  layout: LayoutDefinition,
  content: ContentAnalysis
): number {
  let score = 10;
  
  // Check average bullet length
  if (layout.capacity.avgBulletLength) {
    const { min, max } = layout.capacity.avgBulletLength;
    const avg = content.avgBulletLength;
    
    if (avg < min || avg > max) {
      // Outside range: reduce score
      score -= 5;
    }
  }
  
  // Check maximum bullet length
  if (layout.capacity.maxBulletLength) {
    const { max } = layout.capacity.maxBulletLength;
    const maxLength = content.maxBulletLength;
    
    if (maxLength > max) {
      // Exceeds max: reduce score
      score -= 5;
    }
  }
  
  return Math.max(0, score);
}

/**
 * Calculate priority bonus
 * 
 * Applies bonus or penalty based on layout priority level:
 * - high: +15 points
 * - medium: +5 points
 * - low: 0 points
 * - fallback: -10 points
 * 
 * @param layout - Layout definition with priority level
 * @returns Bonus/penalty points
 */
export function calculatePriorityBonus(layout: LayoutDefinition): number {
  switch (layout.priority) {
    case "high":
      return 15;
    case "medium":
      return 5;
    case "low":
      return 0;
    case "fallback":
      return -10;
    default:
      return 0;
  }
}

/**
 * Calculate confidence bonus
 * 
 * Applies bonus based on content type detection confidence:
 * - 70%+ confidence: +10 points
 * - 40-69% confidence: +5 points
 * - Below 40%: 0 points
 * 
 * @param confidence - Content type confidence (0-100)
 * @returns Bonus points
 */
export function calculateConfidenceBonus(confidence: number): number {
  if (confidence >= 70) {
    return 10;
  } else if (confidence >= 40) {
    return 5;
  } else {
    return 0;
  }
}

/**
 * Calculate repetition penalty
 * 
 * Applies penalty if the same layout category appears in
 * consecutive slides:
 * - 2 consecutive: -5 points
 * - 3+ consecutive: -15 points
 * 
 * @param layoutCategory - Current layout category being scored
 * @param previousLayouts - Array of previous layout categories
 * @returns Penalty points (negative)
 */
export function calculateRepetitionPenalty(
  layoutCategory: string,
  previousLayouts: string[]
): number {
  if (previousLayouts.length === 0) {
    return 0;
  }
  
  // Count consecutive occurrences of this layout at the end of previous layouts
  let consecutiveCount = 0;
  for (let i = previousLayouts.length - 1; i >= 0; i--) {
    if (previousLayouts[i] === layoutCategory) {
      consecutiveCount++;
    } else {
      break;
    }
  }
  
  // Apply penalty based on consecutive count
  if (consecutiveCount >= 2) {
    return -15; // 3+ consecutive (2 previous + current)
  } else if (consecutiveCount === 1) {
    return -5; // 2 consecutive (1 previous + current)
  } else {
    return 0; // No repetition
  }
}

/**
 * Score content layout hint from LLM (50-60 points max)
 * 
 * Gives significant weight to the LLM's contentLayoutHint suggestion,
 * but allows rules to override if the hint doesn't fit capacity or other constraints.
 * 
 * Scoring strategy:
 * - Exact match: +60 points (strong preference for LLM suggestion)
 * - Partial match (e.g., "box" matches "boxes"): +50 points
 * - No hint provided: 0 points
 * - Hint doesn't match: 0 points (allows rules to override)
 * 
 * This ensures the LLM hint has strong influence but can still be overridden
 * by capacity constraints, image requirements, or other critical rules.
 * 
 * @param layout - Layout definition being scored
 * @param input - Scoring input with contentLayoutHint
 * @returns Score 0-60 based on hint match
 */
export function scoreContentLayoutHint(
  layout: LayoutDefinition,
  input: LayoutScoringInput
): number {
  const hint = input.contentLayoutHint;
  
  // No hint provided - neutral
  if (!hint) {
    return 0;
  }
  
  // Normalize hint to lowercase for comparison
  const normalizedHint = hint.toLowerCase().trim();
  const layoutCategory = layout.category.toLowerCase();
  
  // Exact match: full bonus
  if (normalizedHint === layoutCategory) {
    return 60;
  }
  
  // Partial match: check if hint contains category or vice versa
  // e.g., "box" matches "boxes", "step" matches "steps"
  if (normalizedHint.includes(layoutCategory) || layoutCategory.includes(normalizedHint)) {
    return 50;
  }
  
  // Check for common aliases/variations
  const hintAliases: Record<string, string[]> = {
    "boxes": ["box", "card", "cards", "grid"],
    "bullets": ["bullet", "list", "points"],
    "sequence": ["sequence", "timeline", "ordered", "numbered"],
    "steps": ["step", "process", "flow", "procedure"],
    "quotes": ["quote", "testimonial", "testimonials"],
    "circles": ["circle", "cycle", "circular"],
    "images": ["image", "gallery", "photo", "photos"],
    "numbers": ["number", "stat", "stats", "statistics", "metrics"],
  };
  
  const aliases = hintAliases[layoutCategory];
  if (aliases && aliases.some(alias => normalizedHint.includes(alias) || alias.includes(normalizedHint))) {
    return 50;
  }
  
  // No match - return 0 (allows other factors to determine score)
  return 0;
}