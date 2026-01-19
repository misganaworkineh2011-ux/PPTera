/**
 * Main Content Analyzer Module
 * 
 * Combines all individual analyzers to produce a complete content analysis.
 * This is the main entry point for content analysis in the layout selection system.
 * 
 * Performance Optimizations (Task 16.3):
 * - Content analysis results cached by content hash
 * - LRU cache with 100 entry limit
 */

import { ContentAnalysis, BulletPattern, SemanticMarkers, ContentType } from "../types";
import { analyzeBulletPatterns } from "./pattern-detector";
import { extractSemanticMarkersFromSlide } from "./semantic-extractor";
import { calculateContentDensityFromSlide } from "./density-calculator";
import { detectContentType } from "./content-type-detector";
import { contentAnalysisCache, generateContentHash } from "../utils/cache";

/**
 * Analyze slide content to extract patterns, metrics, and classifications
 * Uses caching for performance (Task 16.3)
 * 
 * This function combines all individual analyzers:
 * - Pattern detection (numbered steps, quotes, etc.)
 * - Semantic marker extraction (timeline, process, etc.)
 * - Content density calculation (word counts, metrics)
 * - Content type detection (timeline, features, etc.)
 * - Structural analysis (sequence, hierarchy, etc.)
 * 
 * @param title - Slide title
 * @param bullets - Array of bullet points
 * @returns Complete content analysis object
 */
export function analyzeContent(
  title: string,
  bullets: string[]
): ContentAnalysis {
  // Handle empty input
  if ((!title || title.trim().length === 0) && (!bullets || bullets.length === 0)) {
    return {
      pattern: BulletPattern.SIMPLE_LIST,
      semanticMarkers: [],
      contentType: ContentType.GENERIC,
      contentTypeConfidence: 100,
      bulletCount: 0,
      avgBulletLength: 0,
      maxBulletLength: 0,
      totalWordCount: 0,
      hasSequence: false,
      hasDistinctConcepts: false,
      hasHierarchy: false,
    };
  }

  // Normalize inputs
  const normalizedTitle = title || "";
  const normalizedBullets = bullets || [];

  // Check cache first (Task 16.3)
  const cacheKey = generateContentHash(normalizedTitle, normalizedBullets);
  const cached = contentAnalysisCache.get(cacheKey);
  if (cached !== undefined) {
    return cached as ContentAnalysis;
  }

  // 1. Detect bullet patterns
  const patternResult = analyzeBulletPatterns(normalizedBullets);
  const pattern = patternResult.pattern;

  // 2. Extract semantic markers
  const semanticMarkers = extractSemanticMarkersFromSlide(normalizedTitle, normalizedBullets);

  // 3. Calculate content density
  const densityMetrics = calculateContentDensityFromSlide(normalizedTitle, normalizedBullets);

  // 4. Detect content type (uses pattern and semantic markers)
  const contentTypeResult = detectContentType(
    normalizedTitle,
    normalizedBullets,
    semanticMarkers,
    pattern
  );

  // 5. Analyze structure
  const structuralAnalysis = analyzeStructure(
    normalizedTitle,
    normalizedBullets,
    pattern,
    semanticMarkers
  );

  // Combine all analysis results
  const result: ContentAnalysis = {
    // Patterns
    pattern,
    semanticMarkers,
    
    // Content type classification
    contentType: contentTypeResult.contentType,
    contentTypeConfidence: contentTypeResult.confidence,
    
    // Metrics from density calculator
    bulletCount: densityMetrics.bulletCount,
    avgBulletLength: densityMetrics.avgBulletLength,
    maxBulletLength: densityMetrics.maxBulletLength,
    totalWordCount: densityMetrics.totalWordCount,
    
    // Structural flags
    hasSequence: structuralAnalysis.hasSequence,
    hasDistinctConcepts: structuralAnalysis.hasDistinctConcepts,
    hasHierarchy: structuralAnalysis.hasHierarchy,
  };

  // Cache the result (Task 16.3)
  contentAnalysisCache.set(cacheKey, result);

  return result;
}

/**
 * Analyze structural characteristics of content
 * 
 * @param title - Slide title
 * @param bullets - Array of bullet points
 * @param pattern - Detected bullet pattern
 * @param markers - Detected semantic markers
 * @returns Structural analysis flags
 */
function analyzeStructure(
  title: string,
  bullets: string[],
  pattern: BulletPattern,
  markers: SemanticMarkers[]
): {
  hasSequence: boolean;
  hasDistinctConcepts: boolean;
  hasHierarchy: boolean;
} {
  // Detect sequence
  // Content has sequence if:
  // - Pattern is numbered steps, sequential, or instructional
  // - Semantic markers include timeline, process, steps, or instructions
  const hasSequence = 
    pattern === BulletPattern.NUMBERED_STEPS ||
    pattern === BulletPattern.SEQUENTIAL ||
    pattern === BulletPattern.INSTRUCTIONAL ||
    markers.includes(SemanticMarkers.TIMELINE) ||
    markers.includes(SemanticMarkers.PROCESS) ||
    markers.includes(SemanticMarkers.STEPS) ||
    markers.includes(SemanticMarkers.INSTRUCTIONS);

  // Detect distinct concepts
  // Content has distinct concepts if:
  // - Pattern is distinct concepts or categorical
  // - Bullets are relatively short (< 100 chars avg)
  // - Bullet count is between 2-6
  const avgBulletLength = bullets.length > 0 
    ? bullets.reduce((sum, b) => sum + b.length, 0) / bullets.length 
    : 0;
  
  const hasDistinctConcepts = 
    pattern === BulletPattern.DISTINCT_CONCEPTS ||
    pattern === BulletPattern.CATEGORICAL ||
    (bullets.length >= 2 && bullets.length <= 6 && avgBulletLength < 100);

  // Detect hierarchy
  // Content has hierarchy if:
  // - Bullets have varying lengths (some short, some long)
  // - Title suggests categorization or organization
  // - Semantic markers include categories or features
  const bulletLengths = bullets.map(b => b.length);
  const minLength = Math.min(...bulletLengths, 0);
  const maxLength = Math.max(...bulletLengths, 0);
  const lengthVariation = maxLength - minLength;
  
  const hasHierarchy = 
    lengthVariation > 50 || // Significant length variation
    markers.includes(SemanticMarkers.CATEGORIES) ||
    markers.includes(SemanticMarkers.FEATURES) ||
    /\b(overview|summary|breakdown|structure|organization)\b/i.test(title);

  return {
    hasSequence,
    hasDistinctConcepts,
    hasHierarchy,
  };
}

/**
 * Analyze content from a slide object (convenience function)
 * 
 * @param slide - Slide object with title and bulletPoints
 * @returns Complete content analysis object
 */
export function analyzeSlideContent(slide: {
  title: string;
  bulletPoints?: string[];
}): ContentAnalysis {
  return analyzeContent(slide.title, slide.bulletPoints || []);
}
