/**
 * Pattern Detection Module
 * 
 * Detects structural patterns in bullet point content using regex-based analysis.
 * Patterns help determine which layout categories are most appropriate.
 * 
 * Performance Optimizations (Task 16.2):
 * - Regex patterns compiled once at module load
 * - Pattern match results cached for identical inputs
 */

import { BulletPattern } from "../types";
import { patternMatchCache, generatePatternHash } from "../utils/cache";

/**
 * Pattern detection result with confidence score
 */
interface PatternDetectionResult {
  pattern: BulletPattern;
  confidence: number; // 0-1
  matchCount: number;
}

// ============================================================================
// COMPILED REGEX PATTERNS (Task 16.2)
// Compiled once at module load for maximum performance
// ============================================================================

const PATTERNS = {
  // Numbered steps: "1. Step one", "Step 1:", "First,", etc.
  numberedSteps: /^(\d+[\.\):]|\b(first|second|third|fourth|fifth|step \d+|phase \d+)\b)/i,
  
  // Quoted text: Text in quotes
  quotedText: /["'].*["']/,
  
  // Numeric data: Contains numbers, percentages, currency
  numeric: /\d+%|\$\d+|€\d+|£\d+|\d+x|\d+\+|\d+ (users|customers|sales|revenue|growth)/i,
  
  // Sequential markers: "then", "next", "after", "before", "finally"
  sequential: /\b(then|next|after|before|finally|subsequently|following|preceding)\b/i,
  
  // Instructional language: "how to", "learn", "discover", "create", action verbs
  instructional: /\b(how to|learn|discover|create|build|make|develop|implement|configure|setup|install)\b/i,
  
  // Comparison indicators: "vs", "versus", "compared to", "better than"
  comparison: /\b(vs\.?|versus|compared to|better than|worse than|more than|less than|versus|against)\b/i,
  
  // Categorical markers: "type", "kind", "category", "class"
  categorical: /\b(type|kind|category|class|group|classification|variant)\b/i,
} as const;

// Pattern names for cache key generation
const PATTERN_NAMES = Object.keys(PATTERNS) as (keyof typeof PATTERNS)[];

/**
 * Test a pattern against text with caching
 * 
 * @param text - Text to test
 * @param patternName - Name of the pattern
 * @returns Whether the pattern matches
 */
function testPatternCached(text: string, patternName: keyof typeof PATTERNS): boolean {
  // Generate cache key
  const cacheKey = generatePatternHash(text, patternName);
  
  // Check cache first
  const cached = patternMatchCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  
  // Test pattern
  const result = PATTERNS[patternName].test(text);
  
  // Cache result
  patternMatchCache.set(cacheKey, result);
  
  return result;
}

/**
 * Analyze bullet points to detect structural patterns
 * Uses cached pattern matching for performance (Task 16.2)
 * 
 * @param bullets - Array of bullet point strings
 * @returns Detected pattern with confidence score
 */
export function analyzeBulletPatterns(bullets: string[]): PatternDetectionResult {
  if (!bullets || bullets.length === 0) {
    return {
      pattern: BulletPattern.SIMPLE_LIST,
      confidence: 1.0,
      matchCount: 0,
    };
  }

  // Count matches for each pattern
  const patternScores: Record<BulletPattern, number> = {
    [BulletPattern.NUMBERED_STEPS]: 0,
    [BulletPattern.QUOTED_TEXT]: 0,
    [BulletPattern.NUMERIC]: 0,
    [BulletPattern.SEQUENTIAL]: 0,
    [BulletPattern.INSTRUCTIONAL]: 0,
    [BulletPattern.DISTINCT_CONCEPTS]: 0,
    [BulletPattern.COMPARISON]: 0,
    [BulletPattern.CATEGORICAL]: 0,
    [BulletPattern.SIMPLE_LIST]: 0,
  };

  bullets.forEach((bullet) => {
    const text = bullet.trim();
    
    // Check each pattern using cached testing
    if (testPatternCached(text, "numberedSteps")) {
      patternScores[BulletPattern.NUMBERED_STEPS]++;
    }
    
    if (testPatternCached(text, "quotedText")) {
      patternScores[BulletPattern.QUOTED_TEXT]++;
    }
    
    if (testPatternCached(text, "numeric")) {
      patternScores[BulletPattern.NUMERIC]++;
    }
    
    if (testPatternCached(text, "sequential")) {
      patternScores[BulletPattern.SEQUENTIAL]++;
    }
    
    if (testPatternCached(text, "instructional")) {
      patternScores[BulletPattern.INSTRUCTIONAL]++;
    }
    
    if (testPatternCached(text, "comparison")) {
      patternScores[BulletPattern.COMPARISON]++;
    }
    
    if (testPatternCached(text, "categorical")) {
      patternScores[BulletPattern.CATEGORICAL]++;
    }
  });

  // Determine if bullets represent distinct concepts
  // Heuristic: If bullets are relatively short and don't match other patterns strongly
  const avgLength = bullets.reduce((sum, b) => sum + b.length, 0) / bullets.length;
  const hasStrongPattern = Object.values(patternScores).some(score => score >= bullets.length * 0.5);
  
  if (avgLength < 100 && !hasStrongPattern && bullets.length >= 2 && bullets.length <= 6) {
    patternScores[BulletPattern.DISTINCT_CONCEPTS] = bullets.length;
  }

  // Find pattern with highest score
  let maxScore = 0;
  let detectedPattern = BulletPattern.SIMPLE_LIST;
  
  for (const [pattern, score] of Object.entries(patternScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedPattern = pattern as BulletPattern;
    }
  }

  // Calculate confidence based on match percentage
  const confidence = Math.min(maxScore / bullets.length, 1.0);

  // If no strong pattern detected, default to SIMPLE_LIST
  if (confidence < 0.3) {
    return {
      pattern: BulletPattern.SIMPLE_LIST,
      confidence: 1.0,
      matchCount: bullets.length,
    };
  }

  return {
    pattern: detectedPattern,
    confidence,
    matchCount: maxScore,
  };
}
