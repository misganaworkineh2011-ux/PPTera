/**
 * Content Type Detection Module
 * 
 * Detects the type of content being presented using multi-signal scoring.
 * Content type helps determine which layout categories are most appropriate.
 */

import { ContentType, SemanticMarkers, BulletPattern } from "../types";

/**
 * Content type detection result
 */
export interface ContentTypeDetectionResult {
  contentType: ContentType;
  confidence: number; // 0-100
  scores: Record<ContentType, number>; // Individual scores for debugging
}

/**
 * Signal weights for content type detection
 */
interface ContentTypeSignals {
  semanticMarkers: SemanticMarkers[];
  pattern: BulletPattern;
  keywordMatches: Record<ContentType, number>;
}

/**
 * Keyword patterns for each content type
 */
const CONTENT_TYPE_KEYWORDS = {
  [ContentType.TIMELINE]: [
    /\b(timeline|history|evolution|chronology|era|period|year|decade|century)\b/i,
    /\b(from \d+ to \d+|since \d+|until \d+|in \d+)\b/i,
    /\b(past|present|future|historical|ancient|modern)\b/i,
  ],
  
  [ContentType.PROCESS]: [
    /\b(process|workflow|procedure|method|approach|system|mechanism)\b/i,
    /\b(operation|flow|pipeline|sequence|routine|protocol)\b/i,
    /\b(how it works|how we|our approach|our method)\b/i,
  ],
  
  [ContentType.FEATURES]: [
    /\b(feature|capability|function|benefit|advantage|characteristic)\b/i,
    /\b(attribute|property|aspect|quality|strength|offering)\b/i,
    /\b(includes|provides|offers|delivers|enables)\b/i,
  ],
  
  [ContentType.STATISTICS]: [
    /\b(statistics|data|metrics|numbers|figures|results|findings)\b/i,
    /\b(analysis|survey|study|research|report|insights)\b/i,
    /\d+%|\$\d+|€\d+|£\d+|\d+x|\d+\+/,
    /\b(\d+ (users|customers|sales|revenue|growth|increase|decrease))\b/i,
  ],
  
  [ContentType.HOW_TO]: [
    /\b(how to|learn|discover|tutorial|guide|instruction)\b/i,
    /\b(step by step|getting started|quick start|walkthrough)\b/i,
    /\b(configure|setup|install|implement|create|build|make)\b/i,
  ],
  
  [ContentType.COMPARISON]: [
    /\b(compare|comparison|versus|vs\.?|difference|contrast)\b/i,
    /\b(alternative|option|choice|between|against)\b/i,
    /\b(better than|worse than|more than|less than|superior|inferior)\b/i,
  ],
  
  [ContentType.TESTIMONIAL]: [
    /["'].*["']|testimonial|review|feedback|comment/i,
    /\b(said|stated|according to|quote|customer|client)\b/i,
    /\b(experience|satisfaction|recommendation|endorsement)\b/i,
  ],
  
  [ContentType.CATEGORIES]: [
    /\b(category|type|kind|class|group|classification)\b/i,
    /\b(segment|division|section|variety|range|collection)\b/i,
    /\b(types of|kinds of|categories of|classes of)\b/i,
  ],
  
  [ContentType.STEPS]: [
    /\b(step|stage|phase|level|tier|milestone)\b/i,
    /\b(checkpoint|point|part|section)\b/i,
    /^(\d+[\.\):]|\b(first|second|third|fourth|fifth)\b)/i,
  ],
  
  [ContentType.CYCLE]: [
    /\b(cycle|loop|iteration|repeat|recurring|circular)\b/i,
    /\b(continuous|ongoing|perpetual|cyclical|iterative)\b/i,
    /\b(feedback loop|lifecycle|rotation|revolution)\b/i,
  ],
};

/**
 * Score content type based on keyword matches
 * 
 * @param text - Combined text from title and bullets
 * @returns Keyword match scores for each content type
 */
function scoreKeywordMatches(text: string): Record<ContentType, number> {
  const scores: Record<ContentType, number> = {
    [ContentType.TIMELINE]: 0,
    [ContentType.PROCESS]: 0,
    [ContentType.FEATURES]: 0,
    [ContentType.STATISTICS]: 0,
    [ContentType.HOW_TO]: 0,
    [ContentType.COMPARISON]: 0,
    [ContentType.TESTIMONIAL]: 0,
    [ContentType.CATEGORIES]: 0,
    [ContentType.STEPS]: 0,
    [ContentType.CYCLE]: 0,
    [ContentType.GENERIC]: 0,
  };

  const lowerText = text.toLowerCase();

  // Check each content type's keywords
  for (const [contentType, patterns] of Object.entries(CONTENT_TYPE_KEYWORDS)) {
    let matchCount = 0;
    
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        matchCount++;
      }
    }
    
    // Score based on number of pattern matches
    scores[contentType as ContentType] = matchCount * 10; // 10 points per pattern match
  }

  return scores;
}

/**
 * Score content type based on semantic markers
 * 
 * @param markers - Detected semantic markers
 * @returns Scores for each content type based on markers
 */
function scoreSemanticMarkers(markers: SemanticMarkers[]): Record<ContentType, number> {
  const scores: Record<ContentType, number> = {
    [ContentType.TIMELINE]: 0,
    [ContentType.PROCESS]: 0,
    [ContentType.FEATURES]: 0,
    [ContentType.STATISTICS]: 0,
    [ContentType.HOW_TO]: 0,
    [ContentType.COMPARISON]: 0,
    [ContentType.TESTIMONIAL]: 0,
    [ContentType.CATEGORIES]: 0,
    [ContentType.STEPS]: 0,
    [ContentType.CYCLE]: 0,
    [ContentType.GENERIC]: 0,
  };

  // Map semantic markers to content types with weights
  const markerToContentType: Record<SemanticMarkers, Array<{ type: ContentType; weight: number }>> = {
    [SemanticMarkers.TIMELINE]: [
      { type: ContentType.TIMELINE, weight: 30 },
    ],
    [SemanticMarkers.PROCESS]: [
      { type: ContentType.PROCESS, weight: 25 },
      { type: ContentType.HOW_TO, weight: 10 },
    ],
    [SemanticMarkers.STATISTICS]: [
      { type: ContentType.STATISTICS, weight: 30 },
    ],
    [SemanticMarkers.QUOTES]: [
      { type: ContentType.TESTIMONIAL, weight: 30 },
    ],
    [SemanticMarkers.COMPARISONS]: [
      { type: ContentType.COMPARISON, weight: 30 },
    ],
    [SemanticMarkers.INSTRUCTIONS]: [
      { type: ContentType.HOW_TO, weight: 25 },
      { type: ContentType.STEPS, weight: 15 },
    ],
    [SemanticMarkers.CATEGORIES]: [
      { type: ContentType.CATEGORIES, weight: 30 },
    ],
    [SemanticMarkers.FEATURES]: [
      { type: ContentType.FEATURES, weight: 30 },
    ],
    [SemanticMarkers.STEPS]: [
      { type: ContentType.STEPS, weight: 25 },
      { type: ContentType.HOW_TO, weight: 10 },
    ],
    [SemanticMarkers.CYCLE]: [
      { type: ContentType.CYCLE, weight: 30 },
    ],
  };

  // Add scores based on detected markers
  for (const marker of markers) {
    const mappings = markerToContentType[marker];
    if (mappings) {
      for (const { type, weight } of mappings) {
        scores[type] += weight;
      }
    }
  }

  return scores;
}

/**
 * Score content type based on bullet pattern
 * 
 * @param pattern - Detected bullet pattern
 * @returns Scores for each content type based on pattern
 */
function scoreBulletPattern(pattern: BulletPattern): Record<ContentType, number> {
  const scores: Record<ContentType, number> = {
    [ContentType.TIMELINE]: 0,
    [ContentType.PROCESS]: 0,
    [ContentType.FEATURES]: 0,
    [ContentType.STATISTICS]: 0,
    [ContentType.HOW_TO]: 0,
    [ContentType.COMPARISON]: 0,
    [ContentType.TESTIMONIAL]: 0,
    [ContentType.CATEGORIES]: 0,
    [ContentType.STEPS]: 0,
    [ContentType.CYCLE]: 0,
    [ContentType.GENERIC]: 0,
  };

  // Map patterns to content types with weights
  const patternMapping: Record<BulletPattern, Array<{ type: ContentType; weight: number }>> = {
    [BulletPattern.NUMBERED_STEPS]: [
      { type: ContentType.STEPS, weight: 25 },
      { type: ContentType.HOW_TO, weight: 15 },
      { type: ContentType.PROCESS, weight: 10 },
    ],
    [BulletPattern.QUOTED_TEXT]: [
      { type: ContentType.TESTIMONIAL, weight: 30 },
    ],
    [BulletPattern.NUMERIC]: [
      { type: ContentType.STATISTICS, weight: 25 },
    ],
    [BulletPattern.SEQUENTIAL]: [
      { type: ContentType.PROCESS, weight: 20 },
      { type: ContentType.TIMELINE, weight: 15 },
      { type: ContentType.STEPS, weight: 10 },
    ],
    [BulletPattern.INSTRUCTIONAL]: [
      { type: ContentType.HOW_TO, weight: 25 },
      { type: ContentType.STEPS, weight: 15 },
    ],
    [BulletPattern.DISTINCT_CONCEPTS]: [
      { type: ContentType.FEATURES, weight: 20 },
      { type: ContentType.CATEGORIES, weight: 15 },
    ],
    [BulletPattern.COMPARISON]: [
      { type: ContentType.COMPARISON, weight: 30 },
    ],
    [BulletPattern.CATEGORICAL]: [
      { type: ContentType.CATEGORIES, weight: 25 },
    ],
    [BulletPattern.SIMPLE_LIST]: [
      { type: ContentType.GENERIC, weight: 10 },
    ],
  };

  const mappings = patternMapping[pattern];
  if (mappings) {
    for (const { type, weight } of mappings) {
      scores[type] += weight;
    }
  }

  return scores;
}

/**
 * Detect content type using multi-signal scoring
 * 
 * @param title - Slide title
 * @param bullets - Array of bullet points
 * @param semanticMarkers - Detected semantic markers
 * @param pattern - Detected bullet pattern
 * @returns Content type with confidence score
 */
export function detectContentType(
  title: string,
  bullets: string[],
  semanticMarkers: SemanticMarkers[],
  pattern: BulletPattern
): ContentTypeDetectionResult {
  // Handle empty input
  if ((!title || title.trim().length === 0) && (!bullets || bullets.length === 0)) {
    return {
      contentType: ContentType.GENERIC,
      confidence: 100,
      scores: {
        [ContentType.TIMELINE]: 0,
        [ContentType.PROCESS]: 0,
        [ContentType.FEATURES]: 0,
        [ContentType.STATISTICS]: 0,
        [ContentType.HOW_TO]: 0,
        [ContentType.COMPARISON]: 0,
        [ContentType.TESTIMONIAL]: 0,
        [ContentType.CATEGORIES]: 0,
        [ContentType.STEPS]: 0,
        [ContentType.CYCLE]: 0,
        [ContentType.GENERIC]: 100,
      },
    };
  }

  // Combine title and bullets for keyword analysis
  const combinedText = [title, ...bullets].join(" ");

  // Get scores from each signal
  const keywordScores = scoreKeywordMatches(combinedText);
  const markerScores = scoreSemanticMarkers(semanticMarkers);
  const patternScores = scoreBulletPattern(pattern);

  // Combine scores with weights
  // Keywords: 40%, Markers: 40%, Pattern: 20%
  const finalScores: Record<ContentType, number> = {
    [ContentType.TIMELINE]: 0,
    [ContentType.PROCESS]: 0,
    [ContentType.FEATURES]: 0,
    [ContentType.STATISTICS]: 0,
    [ContentType.HOW_TO]: 0,
    [ContentType.COMPARISON]: 0,
    [ContentType.TESTIMONIAL]: 0,
    [ContentType.CATEGORIES]: 0,
    [ContentType.STEPS]: 0,
    [ContentType.CYCLE]: 0,
    [ContentType.GENERIC]: 0,
  };

  for (const contentType of Object.values(ContentType)) {
    finalScores[contentType] = 
      keywordScores[contentType] * 0.4 +
      markerScores[contentType] * 0.4 +
      patternScores[contentType] * 0.2;
  }

  // Find content type with highest score
  let maxScore = 0;
  let detectedType = ContentType.GENERIC;
  const tiedTypes: ContentType[] = [];

  for (const [type, score] of Object.entries(finalScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedType = type as ContentType;
      tiedTypes.length = 0; // Clear ties
      tiedTypes.push(type as ContentType);
    } else if (score === maxScore && score > 0) {
      tiedTypes.push(type as ContentType);
    }
  }

  // Tie-breaking: If multiple types have the same score, prefer the one that matches the pattern
  let usedTieBreaking = false;
  if (tiedTypes.length > 1) {
    // Map patterns to preferred content types for tie-breaking
    const patternPreference: Record<BulletPattern, ContentType[]> = {
      [BulletPattern.NUMBERED_STEPS]: [ContentType.STEPS, ContentType.HOW_TO, ContentType.PROCESS],
      [BulletPattern.QUOTED_TEXT]: [ContentType.TESTIMONIAL],
      [BulletPattern.NUMERIC]: [ContentType.STATISTICS],
      [BulletPattern.SEQUENTIAL]: [ContentType.PROCESS, ContentType.TIMELINE, ContentType.STEPS],
      [BulletPattern.INSTRUCTIONAL]: [ContentType.HOW_TO, ContentType.STEPS],
      [BulletPattern.DISTINCT_CONCEPTS]: [ContentType.FEATURES, ContentType.CATEGORIES],
      [BulletPattern.COMPARISON]: [ContentType.COMPARISON],
      [BulletPattern.CATEGORICAL]: [ContentType.CATEGORIES],
      [BulletPattern.SIMPLE_LIST]: [ContentType.GENERIC],
    };

    const preferences = patternPreference[pattern] || [];
    
    // Find the first preference that's in the tied types
    for (const preferredType of preferences) {
      if (tiedTypes.includes(preferredType)) {
        detectedType = preferredType;
        usedTieBreaking = true;
        break;
      }
    }
  }

  // Calculate confidence (0-100)
  // Confidence is based on:
  // 1. How much higher the top score is compared to others
  // 2. The absolute value of the top score
  // 3. Whether tie-breaking was used (adds confidence)
  
  const sortedScores = Object.values(finalScores).sort((a, b) => b - a);
  const topScore = sortedScores[0] || 0;
  const secondScore = sortedScores[1] || 0;
  
  // Score separation (0-50 points): How much better is the top score?
  const separation = topScore - secondScore;
  let separationConfidence = Math.min(separation * 2, 50);
  
  // If we used tie-breaking, add confidence boost (pattern helped us decide)
  if (usedTieBreaking) {
    separationConfidence = Math.min(separationConfidence + 40, 50);
  }
  
  // Absolute score (0-50 points): Is the top score high enough?
  const absoluteConfidence = Math.min(topScore / 2, 50);
  
  const confidence = Math.round(separationConfidence + absoluteConfidence);

  // If confidence is too low, default to GENERIC
  if (confidence < 30 && detectedType !== ContentType.GENERIC) {
    return {
      contentType: ContentType.GENERIC,
      confidence: 50,
      scores: finalScores,
    };
  }

  return {
    contentType: detectedType,
    confidence: Math.min(confidence, 100),
    scores: finalScores,
  };
}
