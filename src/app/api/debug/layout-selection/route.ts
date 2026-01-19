/**
 * Debug API Endpoint for Layout Selection
 * 
 * This endpoint provides detailed inspection of the layout selection process.
 * It accepts a slide and context as input and returns:
 * - The selected layout with full details
 * - All layout scores with complete breakdowns
 * - Content analysis results
 * - Extracted metadata
 * 
 * This is intended for development and debugging purposes only.
 * 
 * Requirements: 10.4
 */

import { NextRequest, NextResponse } from "next/server";
import { selectLayout } from "~/lib/presentation/smart-layout/layout-selection";
import { getAllLayouts } from "~/lib/presentation/smart-layout/registry/layout-registry";
import { scoreAllLayouts } from "~/lib/presentation/smart-layout/scorers/layout-scorer";
import { analyzeContent } from "~/lib/presentation/smart-layout/analyzers/content-analyzer";
import { extractSlideMetadata } from "~/lib/presentation/smart-layout/extractors/metadata-extractor";
import { getSlidePosition } from "~/lib/presentation/smart-layout/context/context-tracker";
import { explainSelection } from "~/lib/presentation/smart-layout/selectors/layout-selector";
import type { 
  LayoutSelectionInput,
  LayoutScoringInput,
} from "~/lib/presentation/smart-layout/layout-selection";

/**
 * Debug response structure
 */
interface DebugResponse {
  // The final selection
  selection: {
    category: string;
    style: string;
    slideLayout: string;
    confidence: string;
    score: number;
    explanation: string;
    detailedExplanation: string; // Comprehensive explanation with runner-ups
    factors: string[];
    runnerUps: Array<{
      category: string;
      score: number;
      confidence: string;
    }>;
  };
  
  // All layout scores with breakdowns
  allScores: Array<{
    category: string;
    score: number;
    confidence: string;
    breakdown: {
      contentType: number;
      pattern: number;
      capacity: number;
      semanticIntent: number;
      visualStrategy: number;
      density: number;
      media: number;
      bulletLength: number;
      priority: number;
      confidenceBonus: number;
      repetitionPenalty: number;
    };
    rejected: boolean;
    rejectionReason?: string;
  }>;
  
  // Content analysis
  contentAnalysis: {
    pattern: string;
    semanticMarkers: string[];
    contentType: string;
    contentTypeConfidence: number;
    bulletCount: number;
    avgBulletLength: number;
    maxBulletLength: number;
    totalWordCount: number;
    hasSequence: boolean;
    hasDistinctConcepts: boolean;
    hasHierarchy: boolean;
  };
  
  // Extracted metadata
  metadata: {
    semanticIntent: string;
    visualStrategy: {
      primary: string;
      pattern: string;
      emphasis: string;
    };
    contentLayoutHint?: string;
    hasImage: boolean;
    imageOrientation?: string;
  };
  
  // Performance metrics
  performanceMetrics?: {
    total: number;
    extraction: number;
    analysis: number;
    scoring: number;
    selection: number;
    styleSelection: number;
  };
  
  // Context information
  context: {
    slideIndex: number;
    totalSlides: number;
    slidePosition: string;
    previousLayouts: string[];
  };
}

/**
 * POST /api/debug/layout-selection
 * 
 * Debug endpoint for layout selection inspection
 * 
 * Request body:
 * ```json
 * {
 *   "slide": {
 *     "type": "content",
 *     "title": "Key Features",
 *     "bulletPoints": ["Feature 1", "Feature 2", "Feature 3"],
 *     "semanticIntent": "inform",
 *     "visualStrategy": { "primary": "text-focused", "pattern": "cards", "emphasis": "clarity" }
 *   },
 *   "context": {
 *     "slideIndex": 2,
 *     "totalSlides": 10,
 *     "previousLayouts": [
 *       { "slideIndex": 0, "category": "bullets", "style": "bullets-style-1" },
 *       { "slideIndex": 1, "category": "boxes", "style": "box-style-2" }
 *     ],
 *     "categoryUsage": {},
 *     "styleUsage": {}
 *   }
 * }
 * ```
 * 
 * Response: DebugResponse with complete selection details
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { slide, context } = body;
    
    // Validate input
    if (!slide || !context) {
      return NextResponse.json(
        { error: "Missing required fields: slide and context" },
        { status: 400 }
      );
    }
    
    // Ensure context has required fields with defaults
    const fullContext = {
      slideIndex: context.slideIndex ?? 0,
      totalSlides: context.totalSlides ?? 1,
      previousLayouts: context.previousLayouts ?? [],
      categoryUsage: context.categoryUsage ? new Map(Object.entries(context.categoryUsage)) : new Map(),
      styleUsage: context.styleUsage ? new Map(Object.entries(context.styleUsage)) : new Map(),
    };
    
    // Build selection input
    const selectionInput: LayoutSelectionInput = {
      slide,
      context: fullContext,
      options: {
        enablePerformanceLogging: true,
        enableDebugLogging: true,
      },
    };
    
    // ========================================================================
    // PERFORM LAYOUT SELECTION
    // ========================================================================
    
    const selection = await selectLayout(selectionInput);
    
    // ========================================================================
    // EXTRACT DETAILED INFORMATION
    // ========================================================================
    
    // Extract metadata
    const metadata = extractSlideMetadata(slide);
    
    // Analyze content
    const bullets = slide.bulletPoints || 
      slide.sections?.map((s: { heading: string; description: string }) => 
        `${s.heading}: ${s.description}`
      ) || 
      [];
    const analysis = analyzeContent(slide.title, bullets);
    
    // Build scoring input
    const scoringInput: LayoutScoringInput = {
      semanticIntent: metadata.semanticIntent,
      visualStrategy: metadata.visualStrategy,
      contentLayoutHint: metadata.contentLayoutHint,
      hasImage: metadata.assets.image?.required ?? false,
      hasIcon: false,
      analysis,
      slidePosition: getSlidePosition(fullContext.slideIndex, fullContext.totalSlides),
      previousLayouts: fullContext.previousLayouts.map(l => l.category),
      isNarrowSpace: false,
    };
    
    // Score all layouts
    const layouts = getAllLayouts();
    const allMatches = scoreAllLayouts(layouts, scoringInput);
    
    // Sort by score
    const sortedMatches = [...allMatches].sort((a, b) => b.score - a.score);
    
    // ========================================================================
    // BUILD DEBUG RESPONSE
    // ========================================================================
    
    // Get the best match for detailed explanation
    const bestMatch = sortedMatches.find(m => m.category === selection.category);
    const detailedExplanation = bestMatch 
      ? explainSelection(bestMatch, selection.runnerUps, analysis)
      : selection.explanation;
    
    const debugResponse: DebugResponse = {
      // Selection
      selection: {
        category: selection.category,
        style: selection.style,
        slideLayout: selection.slideLayout,
        confidence: selection.confidence,
        score: selection.score,
        explanation: selection.explanation,
        detailedExplanation,
        factors: selection.factors,
        runnerUps: selection.runnerUps.map(r => ({
          category: r.category,
          score: r.score,
          confidence: r.confidence,
        })),
      },
      
      // All scores
      allScores: sortedMatches.map(match => ({
        category: match.category,
        score: match.score,
        confidence: match.confidence,
        breakdown: match.scoreBreakdown,
        rejected: match.score === 0,
        rejectionReason: match.score === 0 ? "Capacity exceeded or incompatible" : undefined,
      })),
      
      // Content analysis
      contentAnalysis: {
        pattern: analysis.pattern,
        semanticMarkers: analysis.semanticMarkers,
        contentType: analysis.contentType,
        contentTypeConfidence: analysis.contentTypeConfidence,
        bulletCount: analysis.bulletCount,
        avgBulletLength: analysis.avgBulletLength,
        maxBulletLength: analysis.maxBulletLength,
        totalWordCount: analysis.totalWordCount,
        hasSequence: analysis.hasSequence,
        hasDistinctConcepts: analysis.hasDistinctConcepts,
        hasHierarchy: analysis.hasHierarchy,
      },
      
      // Metadata
      metadata: {
        semanticIntent: metadata.semanticIntent,
        visualStrategy: metadata.visualStrategy,
        contentLayoutHint: metadata.contentLayoutHint,
        hasImage: metadata.assets.image?.required ?? false,
        imageOrientation: metadata.assets.image?.orientation,
      },
      
      // Performance metrics
      performanceMetrics: selection.performanceMetrics,
      
      // Context
      context: {
        slideIndex: fullContext.slideIndex,
        totalSlides: fullContext.totalSlides,
        slidePosition: scoringInput.slidePosition,
        previousLayouts: fullContext.previousLayouts.map(l => l.category),
      },
    };
    
    return NextResponse.json(debugResponse);
    
  } catch (error) {
    console.error("[debug/layout-selection] Error:", error);
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/debug/layout-selection
 * 
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/debug/layout-selection",
    method: "POST",
    description: "Debug endpoint for detailed layout selection inspection",
    usage: {
      request: {
        slide: {
          type: "content",
          title: "string",
          bulletPoints: ["string"],
          semanticIntent: "string (optional)",
          visualStrategy: {
            primary: "string (optional)",
            pattern: "string (optional)",
            emphasis: "string (optional)",
          },
          contentLayoutHint: "string (optional)",
        },
        context: {
          slideIndex: "number",
          totalSlides: "number",
          previousLayouts: [
            {
              slideIndex: "number",
              category: "string",
              style: "string",
            },
          ],
        },
      },
      response: {
        selection: "Final layout selection with details",
        allScores: "All layout scores with breakdowns",
        contentAnalysis: "Content analysis results",
        metadata: "Extracted metadata",
        performanceMetrics: "Performance timing data",
        context: "Context information",
      },
    },
    example: {
      request: {
        slide: {
          type: "content",
          title: "Key Features",
          bulletPoints: [
            "Advanced AI-powered layout selection",
            "Real-time content analysis",
            "Intelligent style matching",
          ],
          semanticIntent: "inform",
          visualStrategy: {
            primary: "text-focused",
            pattern: "cards",
            emphasis: "clarity",
          },
        },
        context: {
          slideIndex: 2,
          totalSlides: 10,
          previousLayouts: [],
        },
      },
    },
  });
}
