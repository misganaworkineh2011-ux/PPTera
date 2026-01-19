/**
 * Semantic Marker Extraction Module
 * 
 * Extracts semantic markers from slide content using keyword-based detection.
 * Markers indicate the type of information being presented (timeline, process, statistics, etc.)
 */

import { SemanticMarkers } from "../types";

/**
 * Keyword patterns for each semantic marker type
 */
const SEMANTIC_PATTERNS = {
  // Timeline indicators
  timeline: /\b(timeline|history|evolution|chronology|era|period|year|decade|century|date|when|since|until|from \d+ to \d+)\b/i,
  
  // Process indicators
  process: /\b(process|workflow|procedure|method|approach|system|mechanism|operation|flow|pipeline)\b/i,
  
  // Statistics indicators
  statistics: /\b(statistics|data|metrics|numbers|figures|results|findings|analysis|survey|study|research|report)\b/i,
  
  // Quote indicators
  quotes: /["']|testimonial|review|feedback|comment|said|stated|according to|quote/i,
  
  // Comparison indicators
  comparisons: /\b(compare|comparison|versus|vs\.?|difference|contrast|alternative|option|choice|between)\b/i,
  
  // Instruction indicators
  instructions: /\b(how to|step|instruction|guide|tutorial|learn|teach|demonstrate|show|explain|configure|setup|install)\b/i,
  
  // Category indicators
  categories: /\b(category|type|kind|class|group|classification|segment|division|section)\b/i,
  
  // Feature indicators
  features: /\b(feature|capability|function|benefit|advantage|characteristic|attribute|property|aspect)\b/i,
  
  // Step indicators
  steps: /\b(step|stage|phase|level|tier|milestone|checkpoint|point)\b/i,
  
  // Cycle indicators
  cycle: /\b(cycle|loop|iteration|repeat|recurring|circular|continuous|ongoing|perpetual)\b/i,
};

/**
 * Extract semantic markers from text content
 * 
 * @param text - Combined text from title and bullets
 * @returns Array of detected semantic markers
 */
export function extractSemanticMarkers(text: string): SemanticMarkers[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const markers: SemanticMarkers[] = [];
  const lowerText = text.toLowerCase();

  // Check each pattern
  if (SEMANTIC_PATTERNS.timeline.test(lowerText)) {
    markers.push(SemanticMarkers.TIMELINE);
  }
  
  if (SEMANTIC_PATTERNS.process.test(lowerText)) {
    markers.push(SemanticMarkers.PROCESS);
  }
  
  if (SEMANTIC_PATTERNS.statistics.test(lowerText)) {
    markers.push(SemanticMarkers.STATISTICS);
  }
  
  if (SEMANTIC_PATTERNS.quotes.test(lowerText)) {
    markers.push(SemanticMarkers.QUOTES);
  }
  
  if (SEMANTIC_PATTERNS.comparisons.test(lowerText)) {
    markers.push(SemanticMarkers.COMPARISONS);
  }
  
  if (SEMANTIC_PATTERNS.instructions.test(lowerText)) {
    markers.push(SemanticMarkers.INSTRUCTIONS);
  }
  
  if (SEMANTIC_PATTERNS.categories.test(lowerText)) {
    markers.push(SemanticMarkers.CATEGORIES);
  }
  
  if (SEMANTIC_PATTERNS.features.test(lowerText)) {
    markers.push(SemanticMarkers.FEATURES);
  }
  
  if (SEMANTIC_PATTERNS.steps.test(lowerText)) {
    markers.push(SemanticMarkers.STEPS);
  }
  
  if (SEMANTIC_PATTERNS.cycle.test(lowerText)) {
    markers.push(SemanticMarkers.CYCLE);
  }

  return markers;
}

/**
 * Extract semantic markers from slide content (title + bullets)
 * 
 * @param title - Slide title
 * @param bullets - Array of bullet points
 * @returns Array of detected semantic markers
 */
export function extractSemanticMarkersFromSlide(
  title: string,
  bullets: string[]
): SemanticMarkers[] {
  // Combine title and bullets into single text
  const combinedText = [title, ...bullets].join(" ");
  return extractSemanticMarkers(combinedText);
}
