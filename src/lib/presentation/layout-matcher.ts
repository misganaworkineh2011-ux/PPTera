/**
 * Layout Matcher - Multi-signal scoring and scenario matching
 * 
 * Scores scenarios against content to find the best layout match
 */

import type { ContentLayoutCategory, ContentLayoutStyle } from "~/lib/layouts/content";
import type { SlideLayoutType } from "~/lib/layouts/slide";
import type { ContentAnalysis, BulletPattern } from "./content-analyzer";
import type { ContentType } from "./content-types";
import type { LayoutScenario, ScenarioPriority } from "./layout-scenarios";
import { LAYOUT_SCENARIOS } from "./layout-scenarios";
import { contentTypeToCategory, isContentTypeSuitable } from "./content-types";

export interface LayoutMatch {
  category: ContentLayoutCategory;
  scenario: LayoutScenario | null;
  score: number;
  confidence: "high" | "medium" | "low";
  recommendedStyle?: ContentLayoutStyle;
}

export interface MatchingInput {
  analysis: ContentAnalysis;
  bulletCount: number;
  avgBulletLength: number;
  maxBulletLength: number;
  density: "low" | "medium" | "high";
  semanticIntent?: string;
  visualStrategy?: string;
  hasImage: boolean;
  isNarrowSpace?: boolean;
  contentLayoutHint?: string; // Outline hint as secondary signal
}

/**
 * Score a scenario against content
 * Now respects exclusion conditions and requireAll flag
 */
function scoreScenario(
  scenario: LayoutScenario,
  input: MatchingInput
): number {
  let score = 0;
  const conditions = scenario.conditions;
  const { analysis } = input;

  // CRITICAL: Check exclusion conditions first - if any match, return 0 (disqualify)
  if (conditions.excludeContentType && analysis.contentType) {
    if (conditions.excludeContentType.includes(analysis.contentType)) {
      return 0; // Disqualified
    }
  }

  if (conditions.excludePattern && analysis.pattern) {
    if (conditions.excludePattern.includes(analysis.pattern)) {
      return 0; // Disqualified
    }
  }

  if (conditions.excludeSemanticIntent && input.semanticIntent) {
    const semanticLower = input.semanticIntent.toLowerCase();
    if (conditions.excludeSemanticIntent.some(exclude => 
      semanticLower.includes(exclude.toLowerCase())
    )) {
      return 0; // Disqualified
    }
  }

  // Track which required conditions are met (for requireAll check)
  const metConditions: boolean[] = [];

  // 1. Content Type Match (40 points)
  if (conditions.contentType && analysis.contentType) {
    if (conditions.contentType.includes(analysis.contentType)) {
      score += 40;
      metConditions.push(true);
    } else {
      metConditions.push(false);
    }
  }

  // 2. Pattern Match (35 points)
  if (conditions.pattern && analysis.pattern) {
    if (conditions.pattern.includes(analysis.pattern)) {
      score += 35;
      metConditions.push(true);
    } else {
      metConditions.push(false);
    }
  }

  // 3. Bullet Count Fit (30 points)
  if (conditions.bulletCount) {
    const { min, max } = conditions.bulletCount;
    if (input.bulletCount >= min && input.bulletCount <= max) {
      score += 30;
      metConditions.push(true);
    } else {
      // Partial credit for close matches (only if requireAll is false)
      if (!conditions.requireAll) {
        const distance = Math.min(
          Math.abs(input.bulletCount - min),
          Math.abs(input.bulletCount - max)
        );
        if (distance <= 1) {
          score += 15;
        }
      }
      metConditions.push(false);
    }
  }

  // 4. Semantic Intent Match (25 points)
  if (conditions.semanticIntent && input.semanticIntent) {
    const semanticLower = input.semanticIntent.toLowerCase();
    if (conditions.semanticIntent.some(intent => 
      semanticLower.includes(intent.toLowerCase())
    )) {
      score += 25;
      metConditions.push(true);
    } else {
      metConditions.push(false);
    }
  }

  // 5. Visual Strategy Match (25 points)
  if (conditions.visualStrategy && input.visualStrategy) {
    const visualLower = input.visualStrategy.toLowerCase();
    if (conditions.visualStrategy.some(strategy => 
      visualLower.includes(strategy.toLowerCase())
    )) {
      score += 25;
      metConditions.push(true);
    } else {
      metConditions.push(false);
    }
  }

  // 6. Density Compatibility (20 points)
  if (conditions.density) {
    if (input.density === conditions.density) {
      score += 20;
      metConditions.push(true);
    } else {
      metConditions.push(false);
    }
  }

  // 7. Image/Space Constraints (15 points)
  if (conditions.hasImage !== undefined) {
    if (conditions.hasImage === input.hasImage) {
      score += 15;
      metConditions.push(true);
    } else {
      metConditions.push(false);
    }
  }
  if (conditions.isNarrowSpace !== undefined) {
    if (conditions.isNarrowSpace === input.isNarrowSpace) {
      score += 15;
      metConditions.push(true);
    } else {
      metConditions.push(false);
    }
  }

  // 8. Bullet Length Fit (10 points)
  if (conditions.avgBulletLength) {
    const { min, max } = conditions.avgBulletLength;
    if (input.avgBulletLength >= min && input.avgBulletLength <= max) {
      score += 10;
      metConditions.push(true);
    } else {
      metConditions.push(false);
    }
  }
  if (conditions.maxBulletLength) {
    const { min, max } = conditions.maxBulletLength;
    if (input.maxBulletLength >= min && input.maxBulletLength <= max) {
      score += 10;
      metConditions.push(true);
    } else {
      metConditions.push(false);
    }
  }

  // CRITICAL: If requireAll is true, ALL conditions must be met
  if (conditions.requireAll && metConditions.length > 0) {
    const allMet = metConditions.every(met => met === true);
    if (!allMet) {
      return 0; // Disqualified - not all required conditions met
    }
  }

  // 9. Priority Bonus (15 points for high, 5 for medium, -10 for fallback)
  if (scenario.priority === "high") {
    score += 15;
  } else if (scenario.priority === "medium") {
    score += 5;
  } else if (scenario.priority === "fallback") {
    score -= 10; // Penalize fallback scenarios
  }

  // 10. Content Type Confidence Bonus (up to 10 points)
  if (analysis.contentTypeConfidence >= 70) {
    score += 10;
  } else if (analysis.contentTypeConfidence >= 40) {
    score += 5;
  }

  return score;
}

/**
 * Match layout scenarios against content
 */
export function matchLayoutScenario(input: MatchingInput): LayoutMatch[] {
  const matches: LayoutMatch[] = [];
  const { analysis } = input;

  // Get primary category from content type
  const primaryCategory = contentTypeToCategory(analysis.contentType);
  
  // Also check outline hint as secondary signal
  const hintCategory = input.contentLayoutHint 
    ? (input.contentLayoutHint.toLowerCase() as ContentLayoutCategory)
    : null;

  // Categories to check (primary + hint + related)
  const categoriesToCheck = new Set<ContentLayoutCategory>([
    primaryCategory,
    ...(hintCategory ? [hintCategory] : []),
    // Add related categories for flexibility
    ...(isContentTypeSuitable(analysis.contentType, "boxes") ? ["boxes" as ContentLayoutCategory] : []),
    ...(isContentTypeSuitable(analysis.contentType, "bullets") ? ["bullets" as ContentLayoutCategory] : []),
  ]);

  // Score scenarios in each relevant category
  for (const category of categoriesToCheck) {
    const scenarios = LAYOUT_SCENARIOS[category] || [];
    
    for (const scenario of scenarios) {
      const score = scoreScenario(scenario, input);
      
      if (score > 0) {
        matches.push({
          category,
          scenario,
          score,
          confidence: score >= 80 ? "high" : score >= 50 ? "medium" : "low",
          recommendedStyle: scenario.recommendedStyle as ContentLayoutStyle | undefined,
        });
      }
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * Select best layout match
 */
export function selectBestLayout(
  input: MatchingInput,
  slideLayout: SlideLayoutType
): LayoutMatch {
  // Update narrow space flag based on slide layout
  const isNarrowSpace = slideLayout === "image-left" || slideLayout === "image-right";
  const updatedInput = { ...input, isNarrowSpace };

  const matches = matchLayoutScenario(updatedInput);

  if (matches.length === 0) {
    // Fallback to default
    return {
      category: "boxes",
      scenario: null,
      score: 0,
      confidence: "low",
    };
  }

  // Return best match
  return matches[0]!;
}

/**
 * Get confidence level from score
 */
export function getConfidenceFromScore(score: number): "high" | "medium" | "low" {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

