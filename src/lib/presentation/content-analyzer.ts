/**
 * Content Analyzer - Semantic analysis and pattern detection for layout selection
 * 
 * Analyzes bullet points to understand:
 * - Content patterns (timeline, process, features, etc.)
 * - Semantic meaning and intent
 * - Content structure and relationships
 * - Type classification
 */

export type BulletPattern =
  | "numbered-steps"
  | "quoted-text"
  | "numeric"
  | "sequential"
  | "instructional"
  | "distinct-concepts"
  | "comparison"
  | "categorical"
  | "simple-list";

export interface SemanticMarkers {
  hasTimeline: boolean;
  hasProcess: boolean;
  hasStatistics: boolean;
  hasQuotes: boolean;
  hasComparisons: boolean;
  hasInstructions: boolean;
  hasCategories: boolean;
  hasFeatures: boolean;
  hasSteps: boolean;
  hasCycle: boolean;
}

export interface ContentAnalysis {
  pattern: BulletPattern;
  semanticMarkers: SemanticMarkers;
  contentType: ContentType;
  contentTypeConfidence: number;
  bulletCount: number;
  avgBulletLength: number;
  maxBulletLength: number;
  hasSequence: boolean;
  hasDistinctConcepts: boolean;
}

export type ContentType =
  | "TIMELINE"
  | "PROCESS"
  | "FEATURES"
  | "STATISTICS"
  | "HOW_TO"
  | "COMPARISON"
  | "TESTIMONIAL"
  | "CATEGORIES"
  | "STEPS"
  | "CYCLE"
  | "GENERIC";

/**
 * Analyze bullet points to detect patterns
 */
export function analyzeBulletPattern(bullets: string[]): BulletPattern {
  if (bullets.length === 0) return "simple-list";

  const text = bullets.join(" ").toLowerCase();

  // Check for numbered steps
  const numberedStepPattern = /^(step\s*\d+|step|#\d+|\d+\.|first|second|third|fourth|fifth|1st|2nd|3rd)/i;
  if (bullets.some(b => numberedStepPattern.test(b.trim()))) {
    return "numbered-steps";
  }

  // Check for quoted text - MUST have actual quotation marks (very strict)
  const quotePattern = /^["'"].*["'"]$|^["'].*["']$|["'].*["']/;
  const hasQuotes = bullets.some(b => quotePattern.test(b.trim()));
  // Also check for testimonial context (said, stated, according to, etc.)
  const hasTestimonialContext = bullets.some(b => 
    /(said|stated|according to|testimonial|quote|endorsement)/i.test(b)
  );
  // Only mark as quoted-text if BOTH quotes AND testimonial context exist
  if (hasQuotes && hasTestimonialContext) {
    return "quoted-text";
  }
  // Or if quotes are very explicit (multiple quotes in text)
  if (hasQuotes && bullets.filter(b => quotePattern.test(b.trim())).length >= 2) {
    return "quoted-text";
  }

  // Check for numeric content (stats, percentages, data)
  const numericPattern = /\d+%|\d+\s*(million|billion|thousand|percent|%)|statistics?|data|metrics?|kpi/i;
  if (bullets.some(b => numericPattern.test(b))) {
    return "numeric";
  }

  // Check for comparison indicators
  const comparisonPattern = /\b(vs|versus|compared to|difference|better than|worse than|instead of|rather than)\b/i;
  if (bullets.some(b => comparisonPattern.test(b))) {
    return "comparison";
  }

  // Check for sequential/timeline indicators
  const sequentialPattern = /^(first|second|third|then|next|finally|after|before|initially|subsequently|in \d{4}|during|while|when)/i;
  if (bullets.some(b => sequentialPattern.test(b.trim()))) {
    return "sequential";
  }

  // Check for instructional language (how-to, imperative verbs)
  const instructionalPattern = /^(do|make|create|build|set|configure|install|add|remove|enable|disable|how to|how-to|tutorial|guide)/i;
  if (bullets.some(b => instructionalPattern.test(b.trim()))) {
    return "instructional";
  }

  // Check for categorical language
  const categoricalPattern = /\b(types?|categories?|kinds?|varieties?|classifications?|groups?)\b/i;
  if (bullets.some(b => categoricalPattern.test(b))) {
    return "categorical";
  }

  // Check for distinct concepts (short bullets, independent ideas)
  const avgLength = bullets.reduce((sum, b) => sum + b.split(/\s+/).length, 0) / bullets.length;
  if (bullets.length >= 2 && bullets.length <= 6 && avgLength < 15) {
    // Check if bullets are independent (no sequential markers, no verbs indicating process)
    const hasIndependentStructure = !bullets.some(b => 
      /^(then|next|after|before|step|process)/i.test(b.trim())
    );
    if (hasIndependentStructure) {
      return "distinct-concepts";
    }
  }

  return "simple-list";
}

/**
 * Extract semantic markers from bullet points
 */
export function extractSemanticMarkers(bullets: string[]): SemanticMarkers {
  const text = bullets.join(" ").toLowerCase();

  return {
    hasTimeline: /(timeline|chronological|history|evolution|progression|in \d{4}|year|decade|era|period)/i.test(text),
    hasProcess: /(process|workflow|pipeline|procedure|method|approach|system)/i.test(text),
    hasStatistics: /(statistic|data|percentage|metric|kpi|number|figure|survey|research|study)/i.test(text),
    hasQuotes: /(["'"]|quote|testimonial|said|stated|according to|endorsement)/i.test(text),
    hasComparisons: /(vs|versus|compared to|difference|better|worse|advantage|disadvantage|pros|cons)/i.test(text),
    hasInstructions: /(how to|how-to|tutorial|guide|instruction|step|do|make|create|build)/i.test(text),
    hasCategories: /(type|category|kind|variety|classification|group|class)/i.test(text),
    hasFeatures: /(feature|benefit|advantage|capability|function|characteristic|attribute)/i.test(text),
    hasSteps: /(step|stage|phase|level|tier|rank)/i.test(text),
    hasCycle: /(cycle|loop|circular|repeat|recurring|rotation|round)/i.test(text),
  };
}

/**
 * Detect content type from analysis
 */
export function detectContentType(
  bullets: string[],
  semanticIntent?: string,
  visualStrategy?: string
): { type: ContentType; confidence: number } {
  const pattern = analyzeBulletPattern(bullets);
  const markers = extractSemanticMarkers(bullets);
  const semanticLower = semanticIntent?.toLowerCase() || "";
  const visualLower = visualStrategy?.toLowerCase() || "";

  // Combine all signals
  const allText = bullets.join(" ").toLowerCase();
  const combinedText = `${allText} ${semanticLower} ${visualLower}`;

  // Scoring system - higher score = better match
  const scores: Record<ContentType, number> = {
    TIMELINE: 0,
    PROCESS: 0,
    FEATURES: 0,
    STATISTICS: 0,
    HOW_TO: 0,
    COMPARISON: 0,
    TESTIMONIAL: 0,
    CATEGORIES: 0,
    STEPS: 0,
    CYCLE: 0,
    GENERIC: 0,
  };

  // Timeline detection
  if (markers.hasTimeline || pattern === "sequential") {
    scores.TIMELINE += 40;
  }
  if (/(timeline|chronological|history|evolution|progression)/i.test(combinedText)) {
    scores.TIMELINE += 30;
  }
  if (/\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(allText)) {
    scores.TIMELINE += 20;
  }

  // Process detection
  if (markers.hasProcess || /(process|workflow|pipeline)/i.test(combinedText)) {
    scores.PROCESS += 40;
  }
  if (pattern === "sequential" && !markers.hasTimeline) {
    scores.PROCESS += 30;
  }

  // Statistics detection
  if (markers.hasStatistics || pattern === "numeric") {
    scores.STATISTICS += 50;
  }
  if (/(statistic|data|metric|kpi|percentage)/i.test(combinedText)) {
    scores.STATISTICS += 30;
  }
  if (/\d+%/.test(allText)) {
    scores.STATISTICS += 20;
  }

  // How-to detection
  if (markers.hasInstructions || pattern === "instructional" || pattern === "numbered-steps") {
    scores.HOW_TO += 50;
  }
  if (/(how to|how-to|tutorial|guide)/i.test(combinedText)) {
    scores.HOW_TO += 30;
  }

  // Comparison detection
  if (markers.hasComparisons || pattern === "comparison") {
    scores.COMPARISON += 50;
  }
  if (/(vs|versus|compared|difference)/i.test(combinedText)) {
    scores.COMPARISON += 30;
  }

  // Testimonial detection
  if (markers.hasQuotes || pattern === "quoted-text") {
    scores.TESTIMONIAL += 50;
  }
  if (/(testimonial|quote|endorsement)/i.test(combinedText)) {
    scores.TESTIMONIAL += 30;
  }

  // Categories detection
  if (markers.hasCategories || pattern === "categorical") {
    scores.CATEGORIES += 40;
  }
  if (/(type|category|kind|variety)/i.test(combinedText)) {
    scores.CATEGORIES += 30;
  }

  // Features detection
  if (markers.hasFeatures || pattern === "distinct-concepts") {
    scores.FEATURES += 40;
  }
  if (/(feature|benefit|advantage|capability)/i.test(combinedText)) {
    scores.FEATURES += 30;
  }

  // Steps detection
  if (markers.hasSteps || pattern === "numbered-steps") {
    scores.STEPS += 40;
  }
  if (/(step|stage|phase)/i.test(combinedText)) {
    scores.STEPS += 30;
  }

  // Cycle detection
  if (markers.hasCycle) {
    scores.CYCLE += 50;
  }
  if (/(cycle|loop|circular|repeat)/i.test(combinedText)) {
    scores.CYCLE += 30;
  }

  // Find best match
  const maxScore = Math.max(...Object.values(scores));
  const bestType = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as ContentType || "GENERIC";
  
  // Calculate confidence (0-100)
  const confidence = maxScore > 0 ? Math.min(100, (maxScore / 50) * 100) : 20;

  return {
    type: bestType,
    confidence: Math.round(confidence),
  };
}

/**
 * Analyze content structure and relationships
 */
export function analyzeContentStructure(bullets: string[]): {
  hasSequence: boolean;
  hasDistinctConcepts: boolean;
  hasHierarchy: boolean;
} {
  const pattern = analyzeBulletPattern(bullets);
  
  return {
    hasSequence: pattern === "sequential" || pattern === "numbered-steps" || pattern === "instructional",
    hasDistinctConcepts: pattern === "distinct-concepts" || pattern === "categorical",
    hasHierarchy: bullets.length > 3 && bullets.some((b, i) => {
      // Check for hierarchical indicators (indentation, sub-bullets, etc.)
      return b.trim().startsWith("  ") || b.trim().startsWith("- ") || b.trim().startsWith("• ");
    }),
  };
}

/**
 * Complete content analysis
 */
export function analyzeContent(
  bullets: string[],
  semanticIntent?: string,
  visualStrategy?: string
): ContentAnalysis {
  const pattern = analyzeBulletPattern(bullets);
  const markers = extractSemanticMarkers(bullets);
  const { type: contentType, confidence: contentTypeConfidence } = detectContentType(
    bullets,
    semanticIntent,
    visualStrategy
  );
  const structure = analyzeContentStructure(bullets);
  
  const bulletLengths = bullets.map(b => b.split(/\s+/).filter(Boolean).length);
  const avgBulletLength = bulletLengths.length > 0
    ? bulletLengths.reduce((a, b) => a + b, 0) / bulletLengths.length
    : 0;
  const maxBulletLength = bulletLengths.length > 0
    ? Math.max(...bulletLengths)
    : 0;

  return {
    pattern,
    semanticMarkers: markers,
    contentType,
    contentTypeConfidence,
    bulletCount: bullets.length,
    avgBulletLength,
    maxBulletLength,
    hasSequence: structure.hasSequence,
    hasDistinctConcepts: structure.hasDistinctConcepts,
  };
}

