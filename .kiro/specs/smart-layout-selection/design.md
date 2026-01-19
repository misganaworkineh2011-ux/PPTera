# Design Document: Smart Layout Selection System

## Overview

This document describes the architecture and design of an intelligent layout selection system that automatically chooses optimal presentation layouts based on comprehensive content analysis. The system uses a hybrid approach combining LLM-generated metadata with deterministic scoring algorithms to achieve Gamma-like smart layout selection.

### Key Design Principles

1. **Hybrid Intelligence**: Combine LLM semantic understanding with deterministic scoring for reliability
2. **Multi-Factor Decision Making**: Consider content type, structure, density, media, context, and flow
3. **Performance First**: Sub-50ms layout selection per slide to maintain streaming responsiveness
4. **Explainability**: Every layout decision is traceable and debuggable
5. **Graceful Degradation**: Always have fallback options when optimal selection fails
6. **User Control**: Automatic selection with manual override capability

### System Context

The layout selection system integrates into the existing presentation generation pipeline:

```
User Input → Outline Generation (LLM) → Content Transformation (LLM) → Layout Selection → Rendering
                    ↓                              ↓                           ↓
              Rich Metadata                 Transformed Content          Layout Assignment
```

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Generation Pipeline              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Smart Layout Selection System                   │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Metadata   │  │   Content    │  │   Context    │          │
│  │  Extractor   │  │   Analyzer   │  │   Tracker    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                 ↓                  ↓                   │
│  ┌──────────────────────────────────────────────────┐          │
│  │          Layout Scoring Engine                    │          │
│  │  - Capacity Evaluator                             │          │
│  │  - Content Type Matcher                           │          │
│  │  - Pattern Matcher                                │          │
│  │  - Density Analyzer                               │          │
│  │  - Media Constraint Checker                       │          │
│  │  - Flow Optimizer                                 │          │
│  └──────────────────────────────────────────────────┘          │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────┐          │
│  │          Layout Selector                          │          │
│  │  - Score Aggregator                               │          │
│  │  - Confidence Calculator                          │          │
│  │  - Fallback Handler                               │          │
│  └──────────────────────────────────────────────────┘          │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────┐          │
│  │          Style Selector                           │          │
│  │  - Style Matcher                                  │          │
│  │  - Variety Optimizer                              │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Slide Renderer                              │
└─────────────────────────────────────────────────────────────────┘
```


### Component Breakdown

#### 1. Metadata Extractor
**Purpose**: Extract and normalize metadata from LLM-generated outline

**Inputs**:
- Outline slide data (from LLM)
- Transformed slide content (from LLM)

**Outputs**:
- Normalized metadata object with all required fields
- Confidence scores for LLM-provided classifications

**Key Functions**:
- `extractSlideMetadata(slide)`: Extract all metadata fields
- `normalizeSemanticIntent(intent)`: Normalize semantic intent strings
- `normalizeVisualStrategy(strategy)`: Normalize visual strategy objects
- `validateMetadata(metadata)`: Ensure all required fields present with fallbacks

#### 2. Content Analyzer
**Purpose**: Deterministic analysis of slide content structure and patterns

**Inputs**:
- Slide title
- Bullet points (transformed)
- Sections (if present)

**Outputs**:
- Content analysis object with detected patterns and metrics

**Key Functions**:
- `analyzeBulletPatterns(bullets)`: Detect structural patterns (numbered, quoted, numeric, etc.)
- `extractSemanticMarkers(text)`: Extract semantic indicators (timeline, process, stats, etc.)
- `calculateContentDensity(slide)`: Calculate word counts and density metrics
- `detectContentType(slide)`: Classify content type with confidence score
- `analyzeContentStructure(slide)`: Identify hierarchical and sequential relationships

#### 3. Context Tracker
**Purpose**: Track presentation flow and maintain variety

**State**:
- Previous 3 slide layouts
- Current slide position (first, middle, last)
- Presentation section boundaries
- Layout usage statistics

**Key Functions**:
- `trackLayoutUsage(layout)`: Record layout selection
- `calculateRepetitionPenalty(layout)`: Calculate penalty for repeated layouts
- `detectPresentationSection()`: Identify thematic sections
- `getPositionContext(slideIndex, totalSlides)`: Determine slide position context

#### 4. Layout Scoring Engine
**Purpose**: Score all available layouts based on multiple factors

**Inputs**:
- Metadata (from extractor)
- Content analysis (from analyzer)
- Context (from tracker)
- Available layouts (from layout registry)

**Outputs**:
- Scored layout matches with breakdown

**Scoring Factors** (weights in parentheses):
1. Content Type Match (40 points)
2. Pattern Match (35 points)
3. Capacity Fit (30 points)
4. Semantic Intent Alignment (25 points)
5. Visual Strategy Alignment (25 points)
6. Density Compatibility (20 points)
7. Media Constraints (15 points each)
8. Bullet Length Fit (10 points)
9. Priority Bonus (high: +15, medium: +5, fallback: -10)
10. Confidence Bonus (70%+: +10, 40-69%: +5)
11. Repetition Penalty (2 consecutive: -5, 3 consecutive: -15)

**Key Functions**:
- `scoreLayout(layout, input)`: Calculate total score for a layout
- `evaluateCapacity(layout, content)`: Check if content fits in layout
- `matchContentType(layout, contentType)`: Score content type compatibility
- `matchPattern(layout, pattern)`: Score structural pattern match
- `checkMediaConstraints(layout, media)`: Validate media requirements


#### 5. Layout Selector
**Purpose**: Select the best layout from scored options

**Inputs**:
- Scored layout matches (from scoring engine)

**Outputs**:
- Selected layout category
- Confidence level (high/medium/low)
- Runner-up layouts (for debugging)

**Selection Logic**:
1. Filter out layouts with score < 30 (too poor fit)
2. Sort by score (descending)
3. If top score >= 80: high confidence
4. If top score >= 50: medium confidence
5. If top score < 50: low confidence, use fallback
6. Return top match with metadata

**Key Functions**:
- `selectBestLayout(matches)`: Choose optimal layout
- `calculateConfidence(score)`: Determine confidence level
- `getFallbackLayout(content)`: Safe fallback selection
- `explainSelection(match)`: Generate explanation for debugging

#### 6. Style Selector
**Purpose**: Choose specific style within selected layout category

**Inputs**:
- Selected layout category
- Content structure (bullet count, sections, etc.)
- Space constraints (narrow/full width)
- Previous style usage

**Outputs**:
- Specific layout style (e.g., "box-style-2", "sequence-style-3")

**Selection Rules**:
- 2 items → 2-column style
- 3 items → 3-column or triangle style
- 4 items → 2x2 grid or 4-column style
- 5+ items → grid or list style
- Narrow space → vertical stack styles
- Full width → horizontal grid styles
- Rotate styles to avoid repetition

**Key Functions**:
- `selectStyle(category, content, constraints)`: Choose specific style
- `matchStyleToStructure(category, bulletCount)`: Match style to content count
- `applySpaceConstraints(styles, isNarrow)`: Filter by space requirements
- `optimizeStyleVariety(styles, previousStyles)`: Avoid repetition

## Components and Interfaces

### Core Interfaces

```typescript
// Slide metadata from LLM (outline generation)
interface SlideMetadata {
  semanticIntent: string; // "inform", "compare", "instruct", "emphasize", "narrate"
  visualStrategy: {
    primary: string; // "diagram", "image", "mixed", "text-focused"
    pattern: string; // "cards", "grid", "flow", "split", "spotlight"
    emphasis: string; // "progression", "contrast", "relationship", "scale"
  };
  contentLayoutHint?: string; // "boxes", "bullets", "sequence", etc.
  assets: {
    image?: {
      required: boolean;
      orientation: "landscape" | "portrait";
      pexelsPromptHint: string;
      aiPromptHint: string;
    };
  };
}

// Content analysis output
interface ContentAnalysis {
  // Patterns
  pattern: BulletPattern;
  semanticMarkers: SemanticMarkers;
  
  // Content type classification
  contentType: ContentType;
  contentTypeConfidence: number; // 0-100
  
  // Metrics
  bulletCount: number;
  avgBulletLength: number;
  maxBulletLength: number;
  totalWordCount: number;
  
  // Structure
  hasSequence: boolean;
  hasDistinctConcepts: boolean;
  hasHierarchy: boolean;
}

// Layout capacity constraints
interface LayoutCapacity {
  bulletCount: { min: number; max: number };
  avgBulletLength?: { min: number; max: number };
  maxBulletLength?: { min: number; max: number };
  density: "low" | "medium" | "high";
  requiresImage?: boolean;
  supportsImage: boolean;
  spaceRequirement: "narrow-compatible" | "full-width-only";
}

// Layout scoring input
interface LayoutScoringInput {
  // From metadata
  semanticIntent: string;
  visualStrategy: VisualStrategy;
  contentLayoutHint?: string;
  hasImage: boolean;
  
  // From content analysis
  analysis: ContentAnalysis;
  
  // From context
  slidePosition: "first" | "middle" | "last";
  previousLayouts: ContentLayoutCategory[];
  isNarrowSpace: boolean;
}

// Layout match result
interface LayoutMatch {
  category: ContentLayoutCategory;
  score: number;
  confidence: "high" | "medium" | "low";
  scoreBreakdown: {
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
  recommendedStyle?: string;
}

// Final layout selection
interface LayoutSelection {
  // Layout category
  category: ContentLayoutCategory;
  style: string; // Specific style within category
  
  // Slide layout (image position)
  slideLayout: SlideLayoutType;
  imageSize?: ImageSize;
  imageShape?: ImageShape;
  
  // Metadata
  confidence: "high" | "medium" | "low";
  score: number;
  runnerUps: LayoutMatch[];
  
  // Debugging
  explanation: string;
  factors: string[];
}
```


### Layout Registry

Each layout category must be registered with its constraints and scoring rules:

```typescript
interface LayoutDefinition {
  category: ContentLayoutCategory;
  name: string;
  description: string;
  
  // Capacity constraints
  capacity: LayoutCapacity;
  
  // Content type affinity (which content types work well)
  contentTypeAffinity: {
    [key in ContentType]?: number; // Score multiplier (0-2)
  };
  
  // Pattern affinity (which patterns work well)
  patternAffinity: {
    [key in BulletPattern]?: number; // Score multiplier (0-2)
  };
  
  // Semantic intent compatibility
  semanticIntentCompatibility: string[]; // Compatible intent values
  
  // Visual strategy compatibility
  visualStrategyCompatibility: {
    primary?: string[];
    pattern?: string[];
    emphasis?: string[];
  };
  
  // Priority level
  priority: "high" | "medium" | "low" | "fallback";
  
  // Available styles
  styles: LayoutStyleDefinition[];
}

interface LayoutStyleDefinition {
  id: string; // e.g., "box-style-1", "sequence-style-2"
  name: string;
  description: string;
  
  // Structure requirements
  idealBulletCount?: number;
  bulletCountRange?: { min: number; max: number };
  
  // Space requirements
  spaceRequirement: "narrow-compatible" | "full-width-only";
  
  // Visual characteristics
  visualWeight: "light" | "medium" | "heavy";
  formality: "casual" | "professional" | "formal";
}
```

## Data Models

### Enhanced Outline Slide (from LLM)

```typescript
interface OutlineSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  
  // NEW: Rich metadata from LLM
  semanticIntent?: string;
  visualStrategy?: {
    primary: string;
    pattern: string;
    emphasis: string;
  };
  contentLayoutHint?: string;
  
  // Image metadata
  image?: {
    required: boolean;
    orientation: "landscape" | "portrait";
    pexelsPromptHint: string;
    aiPromptHint: string;
  };
  
  // Assets (for content slides)
  assets?: {
    image?: {
      required: boolean;
      orientation: "landscape" | "portrait";
      pexelsPromptHint: string;
      aiPromptHint: string;
    };
  };
}
```

### Presentation Slide (final output)

```typescript
interface PresentationSlide {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  sections?: Array<{ heading: string; description: string }>;
  speakerNotes?: string[];
  
  // Layout selection results
  slideLayout: SlideLayoutType; // Image position
  imageSize?: ImageSize;
  imageShape?: ImageShape;
  contentLayout: string; // Specific style
  contentLayoutCategory: ContentLayoutCategory; // Category
  
  // Original metadata (for debugging)
  semanticIntent?: string;
  visualStrategy?: VisualStrategy;
  
  // Images
  image?: SlideImage;
  images?: SlideImage[]; // For gallery layouts
  
  // Legacy compatibility
  layout?: string;
}
```

### Layout Selection Context

```typescript
interface LayoutSelectionContext {
  // Current slide
  slideIndex: number;
  totalSlides: number;
  
  // Previous selections
  previousLayouts: Array<{
    slideIndex: number;
    category: ContentLayoutCategory;
    style: string;
  }>;
  
  // Presentation-level context
  presentationTone: string;
  presentationLanguage: string;
  themeStyle: "minimal" | "professional" | "creative";
  
  // Statistics
  categoryUsage: Map<ContentLayoutCategory, number>;
  styleUsage: Map<string, number>;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Metadata Completeness
*For any* outline slide generated by the system, all required metadata fields (semanticIntent, visualStrategy, contentLayoutHint, assets) must be present with either LLM-provided values or system-generated fallback values.
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

### Property 2: Content Analysis Completeness
*For any* slide content (title, bullets, sections), the content analyzer must produce a complete ContentAnalysis object with all metrics calculated (bulletCount, avgBulletLength, maxBulletLength, totalWordCount, pattern, semanticMarkers, contentType with confidence, structural flags).
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 3: Layout Definition Completeness
*For any* registered layout category, the layout definition must include complete capacity constraints (bulletCount range, density, image support, space requirement) and compatibility rules (contentTypeAffinity, patternAffinity, semanticIntentCompatibility, visualStrategyCompatibility).
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 4: Capacity Enforcement
*For any* layout evaluation where content exceeds 90% of layout capacity (based on bullet count, word count, or density), the layout must be rejected (score = 0) to prevent overflow.
**Validates: Requirements 3.6**

### Property 5: Scoring Consistency
*For any* layout and scoring input, the total score must equal the sum of all individual factor scores (contentType + pattern + capacity + semanticIntent + visualStrategy + density + media + bulletLength + priority + confidence + repetitionPenalty), and each factor must contribute its defined weight when conditions are met.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10**

### Property 6: Fallback Guarantee
*For any* slide where all layouts score below 30 points, the system must select a safe fallback layout (bullets or boxes) rather than failing or selecting a poor-fit layout.
**Validates: Requirements 4.11**

### Property 7: Context Tracking Accuracy
*For any* multi-slide presentation, the context tracker must accurately maintain the previous 3 slide layouts and correctly calculate repetition penalties (-5 for 2 consecutive, -15 for 3 consecutive) when the same layout category appears repeatedly.
**Validates: Requirements 5.1, 5.2, 5.3**

### Property 8: Position-Based Preferences
*For any* slide at position 0 (first slide), emphasis layouts (boxes, circles) should receive higher scores than list layouts (bullets), and for any slide at the last position, summary layouts (boxes, bullets) should receive higher scores than process layouts (steps, sequence).
**Validates: Requirements 5.4, 5.5, 5.6**

### Property 9: Style-Structure Alignment
*For any* selected layout category and content structure, the style selector must choose a style that matches the bullet count (2 items → 2-column, 3 items → 3-column/triangle, 4 items → 2x2 grid, 5+ items → grid/list) and space constraints (narrow → vertical, full-width → horizontal).
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

### Property 10: Image-Layout Compatibility
*For any* slide with hasImage=true, layouts that support images must receive score boosts (+30 for image category, +15 for image-compatible layouts), and for any slide with hasImage=false, image-required layouts must be rejected (score = 0).
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

### Property 11: Selection Before Rendering
*For any* slide in the presentation generation stream, layout selection must complete and produce a LayoutSelection object before the slide is passed to the renderer.
**Validates: Requirements 8.1**

### Property 12: Performance Bound
*For any* single slide, layout selection (metadata extraction + content analysis + scoring + selection) must complete within 50 milliseconds to maintain stream responsiveness.
**Validates: Requirements 8.2**

### Property 13: Graceful Failure
*For any* layout selection that fails (exception thrown, timeout exceeded, invalid input), the system must return a safe fallback layout (bullets or boxes) without throwing an exception or blocking the presentation stream.
**Validates: Requirements 8.3**

### Property 14: Selection Metadata Completeness
*For any* completed layout selection, the output must include all metadata fields (category, style, slideLayout, confidence, score, runnerUps, explanation, factors) to enable debugging and user understanding.
**Validates: Requirements 8.4, 8.5**

### Property 15: Batch Processing Consistency
*For any* presentation with N slides processed in batch, each slide's layout selection must be independent (not affected by processing order) except for context-based penalties which depend only on previous slides' selections.
**Validates: Requirements 11.6**


## Error Handling

### Error Scenarios and Responses

1. **Missing LLM Metadata**
   - Scenario: Outline slide lacks semanticIntent or visualStrategy
   - Response: Use fallback values based on content analysis
   - Fallback: semanticIntent="inform", visualStrategy={primary:"text-focused", pattern:"cards", emphasis:"clarity"}

2. **Invalid Content Type**
   - Scenario: LLM returns unrecognized content type
   - Response: Run deterministic content type detection
   - Fallback: Use "GENERIC" content type

3. **No Layouts Score Above Threshold**
   - Scenario: All layouts score < 30 points
   - Response: Select safe fallback (bullets for text-heavy, boxes for short content)
   - Log: Warning with content analysis for review

4. **Capacity Overflow**
   - Scenario: Content exceeds all layout capacities
   - Response: Select most flexible layout (bullets) and log warning
   - Future: Suggest content splitting to user

5. **Performance Timeout**
   - Scenario: Layout selection exceeds 50ms
   - Response: Return current best match immediately
   - Log: Performance warning with timing data

6. **Invalid Layout Registry**
   - Scenario: Layout definition missing required fields
   - Response: Skip invalid layout, log error
   - Fallback: Continue with valid layouts only

### Error Recovery Strategy

```typescript
async function selectLayoutWithErrorHandling(
  slide: OutlineSlide,
  context: LayoutSelectionContext
): Promise<LayoutSelection> {
  try {
    // Set timeout for performance guarantee
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 50)
    );
    
    const selectionPromise = selectLayout(slide, context);
    
    const result = await Promise.race([selectionPromise, timeoutPromise]);
    return result as LayoutSelection;
    
  } catch (error) {
    // Log error for debugging
    console.error("[layout-selection] Error:", error);
    
    // Return safe fallback
    return {
      category: slide.bulletPoints && slide.bulletPoints.length > 4 ? "bullets" : "boxes",
      style: "default",
      slideLayout: "no-image",
      confidence: "low",
      score: 0,
      runnerUps: [],
      explanation: "Fallback due to error",
      factors: ["error-recovery"],
    };
  }
}
```

## Testing Strategy

### Unit Testing

**Content Analyzer Tests**:
- Test pattern detection with known patterns (numbered, quoted, numeric, etc.)
- Test semantic marker extraction with keyword-rich text
- Test content density calculations with various bullet counts
- Test content type detection with labeled examples
- Edge cases: empty content, single bullet, very long bullets

**Layout Scoring Tests**:
- Test each scoring factor independently
- Test score aggregation with known inputs
- Test capacity evaluation with edge cases (exactly at limit, 1 over limit)
- Test penalty calculations (repetition, low confidence)
- Edge cases: all factors zero, all factors max, negative penalties

**Layout Selector Tests**:
- Test selection with clear winner (score > 80)
- Test selection with close scores (within 5 points)
- Test fallback when all scores < 30
- Test confidence calculation at boundaries (50, 80)
- Edge cases: single layout, no layouts, tied scores

**Style Selector Tests**:
- Test style matching for each bullet count (2, 3, 4, 5+)
- Test space constraint filtering
- Test variety optimization with previous styles
- Edge cases: no matching styles, all styles used recently

### Property-Based Testing

We will use **fast-check** (JavaScript/TypeScript property-based testing library) for property tests.

**Property Test 1: Metadata Completeness** (Property 1)
- Generate: Random outline slides with partial metadata
- Test: All required fields present after extraction
- Validates: Requirements 1.1-1.6

**Property Test 2: Content Analysis Completeness** (Property 2)
- Generate: Random slide content (titles, bullets, sections)
- Test: ContentAnalysis object has all required fields
- Validates: Requirements 2.1-2.6

**Property Test 3: Scoring Consistency** (Property 5)
- Generate: Random layout definitions and scoring inputs
- Test: Total score equals sum of factor scores
- Validates: Requirements 4.1-4.10

**Property Test 4: Capacity Enforcement** (Property 4)
- Generate: Random content with varying sizes
- Test: Layouts reject content exceeding 90% capacity
- Validates: Requirements 3.6

**Property Test 5: Fallback Guarantee** (Property 6)
- Generate: Random slides that score poorly
- Test: System always returns a valid layout (never null/undefined)
- Validates: Requirements 4.11

**Property Test 6: Context Tracking** (Property 7)
- Generate: Random sequences of layout selections
- Test: Repetition penalties calculated correctly
- Validates: Requirements 5.1-5.3

**Property Test 7: Performance Bound** (Property 12)
- Generate: Random slides with varying complexity
- Test: Selection completes within 50ms
- Validates: Requirements 8.2

**Property Test 8: Graceful Failure** (Property 13)
- Generate: Invalid inputs (null, malformed, missing fields)
- Test: System returns fallback without throwing
- Validates: Requirements 8.3

### Integration Testing

**End-to-End Flow Tests**:
1. Outline generation → Layout selection → Rendering
2. Test with real presentation examples (10-20 slides)
3. Verify layout variety across presentation
4. Verify image-layout compatibility
5. Verify performance across full presentation

**LLM Integration Tests**:
1. Test with actual LLM responses (OpenAI, Gemini)
2. Verify metadata extraction from real responses
3. Test fallback when LLM omits fields
4. Test with various presentation topics and tones

**Streaming Integration Tests**:
1. Test layout selection in streaming context
2. Verify no blocking or delays
3. Test error recovery during stream
4. Verify context tracking across stream

### Performance Testing

**Benchmarks**:
- Single slide selection: < 50ms (target: 20-30ms)
- 20-slide presentation: < 1 second total
- Content analysis: < 20ms per slide
- Layout scoring: < 30ms per slide

**Load Testing**:
- 100 concurrent presentations
- Verify no performance degradation
- Verify memory usage stays constant
- Test with various slide counts (5, 10, 20, 50)

### Test Coverage Goals

- Unit tests: 90%+ code coverage
- Property tests: All 15 correctness properties
- Integration tests: All major user flows
- Performance tests: All timing requirements
- Edge case tests: All error scenarios


## Implementation Details

### Phase 1: LLM Metadata Enhancement

**Modify Outline Generator Prompt**:
```typescript
// Add to system prompt
const METADATA_INSTRUCTIONS = `
For each CONTENT slide, you MUST include:

1. "semanticIntent": A label describing the slide's purpose
   Examples: "inform", "compare", "instruct", "emphasize", "narrate", "analyze", "demonstrate"

2. "visualStrategy": An object describing visual presentation
   {
     "primary": "diagram" | "image" | "mixed" | "text-focused",
     "pattern": "cards" | "grid" | "flow" | "split" | "spotlight" | "pyramid" | "timeline",
     "emphasis": "progression" | "contrast" | "relationship" | "scale" | "hierarchy"
   }

3. "contentLayoutHint": Suggested layout category
   Choose from: "boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers"
   - "boxes": Distinct concepts, features, benefits
   - "bullets": Lists, supporting details
   - "sequence": Sequential processes, timelines
   - "steps": Step-by-step instructions
   - "quotes": Testimonials, statements
   - "circles": Interconnected concepts, cycles
   - "numbers": Statistics, metrics
`;
```

**Validate and Normalize LLM Response**:
```typescript
function normalizeSlideMetadata(slide: any): SlideMetadata {
  return {
    semanticIntent: slide.semanticIntent || "inform",
    visualStrategy: {
      primary: slide.visualStrategy?.primary || "text-focused",
      pattern: slide.visualStrategy?.pattern || "cards",
      emphasis: slide.visualStrategy?.emphasis || "clarity",
    },
    contentLayoutHint: slide.contentLayoutHint || undefined,
    assets: {
      image: slide.assets?.image || slide.image,
    },
  };
}
```

### Phase 2: Content Analyzer Implementation

**File**: `src/lib/presentation/content-analyzer-v2.ts`

Key functions to implement:
1. `analyzeBulletPatterns()` - Pattern detection with regex
2. `extractSemanticMarkers()` - Keyword-based marker extraction
3. `calculateContentDensity()` - Word count and metrics
4. `detectContentType()` - Multi-signal content type detection
5. `analyzeContentStructure()` - Hierarchy and sequence detection
6. `analyzeContent()` - Main entry point combining all analysis

### Phase 3: Layout Registry

**File**: `src/lib/presentation/layout-registry.ts`

Define all layouts with constraints:
```typescript
export const LAYOUT_REGISTRY: LayoutDefinition[] = [
  {
    category: "boxes",
    name: "Boxes",
    description: "Card-based layout for distinct concepts",
    capacity: {
      bulletCount: { min: 2, max: 6 },
      avgBulletLength: { min: 5, max: 25 },
      density: "medium",
      supportsImage: true,
      spaceRequirement: "narrow-compatible",
    },
    contentTypeAffinity: {
      FEATURES: 1.5,
      CATEGORIES: 1.5,
      COMPARISON: 1.3,
      GENERIC: 1.0,
    },
    patternAffinity: {
      "distinct-concepts": 1.5,
      "categorical": 1.4,
      "simple-list": 1.0,
    },
    semanticIntentCompatibility: ["inform", "emphasize", "compare"],
    visualStrategyCompatibility: {
      pattern: ["cards", "grid", "split"],
    },
    priority: "high",
    styles: [
      {
        id: "box-style-1",
        name: "2-Column Grid",
        idealBulletCount: 2,
        spaceRequirement: "narrow-compatible",
        visualWeight: "medium",
        formality: "professional",
      },
      // ... more styles
    ],
  },
  // ... more layouts
];
```

### Phase 4: Layout Scoring Engine

**File**: `src/lib/presentation/layout-scorer.ts`

Implement scoring algorithm:
```typescript
export function scoreLayout(
  layout: LayoutDefinition,
  input: LayoutScoringInput,
  context: LayoutSelectionContext
): LayoutMatch {
  let score = 0;
  const breakdown = {
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

  // 1. Content Type Match (40 points)
  const contentTypeMultiplier = layout.contentTypeAffinity[input.analysis.contentType] || 0;
  if (contentTypeMultiplier > 0) {
    breakdown.contentType = 40 * contentTypeMultiplier;
    score += breakdown.contentType;
  }

  // 2. Pattern Match (35 points)
  const patternMultiplier = layout.patternAffinity[input.analysis.pattern] || 0;
  if (patternMultiplier > 0) {
    breakdown.pattern = 35 * patternMultiplier;
    score += breakdown.pattern;
  }

  // 3. Capacity Fit (30 points)
  const capacityFit = evaluateCapacity(layout.capacity, input.analysis);
  if (capacityFit.fits) {
    breakdown.capacity = 30 * (1 - capacityFit.utilization);
    score += breakdown.capacity;
  } else {
    // Reject if over capacity
    return {
      category: layout.category,
      score: 0,
      confidence: "low",
      scoreBreakdown: breakdown,
    };
  }

  // 4-11. Other factors...
  // (Implementation continues with all scoring factors)

  return {
    category: layout.category,
    score: Math.round(score),
    confidence: score >= 80 ? "high" : score >= 50 ? "medium" : "low",
    scoreBreakdown: breakdown,
  };
}
```

### Phase 5: Layout Selector

**File**: `src/lib/presentation/layout-selector.ts`

Main selection logic:
```typescript
export function selectLayout(
  slide: OutlineSlide,
  transformedSlide: TransformedSlide,
  context: LayoutSelectionContext
): LayoutSelection {
  // 1. Extract metadata
  const metadata = extractMetadata(slide);
  
  // 2. Analyze content
  const analysis = analyzeContent(
    transformedSlide.bulletPoints || [],
    metadata.semanticIntent,
    metadata.visualStrategy
  );
  
  // 3. Build scoring input
  const scoringInput: LayoutScoringInput = {
    semanticIntent: metadata.semanticIntent,
    visualStrategy: metadata.visualStrategy,
    contentLayoutHint: metadata.contentLayoutHint,
    hasImage: metadata.assets?.image?.required || false,
    analysis,
    slidePosition: getSlidePosition(context.slideIndex, context.totalSlides),
    previousLayouts: context.previousLayouts.map(l => l.category),
    isNarrowSpace: false, // Determined later based on slide layout
  };
  
  // 4. Score all layouts
  const matches = LAYOUT_REGISTRY.map(layout =>
    scoreLayout(layout, scoringInput, context)
  ).filter(match => match.score > 0);
  
  // 5. Sort by score
  matches.sort((a, b) => b.score - a.score);
  
  // 6. Select best or fallback
  const best = matches[0];
  if (!best || best.score < 30) {
    return getFallbackLayout(analysis);
  }
  
  // 7. Select style within category
  const style = selectStyle(best.category, analysis, scoringInput);
  
  // 8. Determine slide layout (image position)
  const slideLayout = determineSlideLayout(best.category, metadata.hasImage);
  
  return {
    category: best.category,
    style,
    slideLayout,
    confidence: best.confidence,
    score: best.score,
    runnerUps: matches.slice(1, 4),
    explanation: generateExplanation(best, analysis),
    factors: getTopFactors(best.scoreBreakdown),
  };
}
```

### Phase 6: Integration with Presentation Stream

**Modify**: `src/app/api/create-presentation/stream/route.ts`

Replace current layout planning with new system:
```typescript
// OLD: const layoutPlan = await planSlideLayout(plannerInput);

// NEW:
const layoutSelection = selectLayout(
  originalSlide,
  transformedSlide,
  {
    slideIndex,
    totalSlides: slides.length,
    previousLayouts: previousSelections,
    presentationTone: metadata.tone,
    presentationLanguage: metadata.language,
    themeStyle: "professional",
    categoryUsage: new Map(),
    styleUsage: new Map(),
  }
);

// Track selection for context
previousSelections.push({
  slideIndex,
  category: layoutSelection.category,
  style: layoutSelection.style,
});

// Apply to slide
const presentationSlide: PresentationSlide = {
  // ... other fields
  slideLayout: layoutSelection.slideLayout,
  imageSize: layoutSelection.imageSize,
  imageShape: layoutSelection.imageShape,
  contentLayout: layoutSelection.style,
  contentLayoutCategory: layoutSelection.category,
};
```

### Phase 7: Debugging and Monitoring

**Add Debug Endpoint**: `src/app/api/debug/layout-selection/route.ts`

```typescript
export async function POST(request: Request) {
  const { slide, context } = await request.json();
  
  const selection = selectLayout(slide, slide, context);
  
  // Return detailed breakdown
  return Response.json({
    selection,
    allScores: LAYOUT_REGISTRY.map(layout => ({
      category: layout.category,
      score: scoreLayout(layout, /* ... */).score,
      breakdown: scoreLayout(layout, /* ... */).scoreBreakdown,
    })),
    contentAnalysis: analyzeContent(slide.bulletPoints || []),
    metadata: extractMetadata(slide),
  });
}
```

**Add Logging**:
```typescript
function logLayoutSelection(selection: LayoutSelection, slideIndex: number) {
  console.log(`[layout-selection] Slide ${slideIndex}:`, {
    category: selection.category,
    style: selection.style,
    confidence: selection.confidence,
    score: selection.score,
    topFactors: selection.factors.slice(0, 3),
  });
  
  if (selection.confidence === "low") {
    console.warn(`[layout-selection] Low confidence for slide ${slideIndex}`, {
      runnerUps: selection.runnerUps.map(r => ({ category: r.category, score: r.score })),
    });
  }
}
```

## Performance Optimization

### Caching Strategy

1. **Layout Registry**: Load once at startup, cache in memory
2. **Pattern Regex**: Compile regex patterns once, reuse
3. **Content Analysis**: Cache analysis results per slide (keyed by content hash)
4. **Scoring Results**: No caching (fast enough, context-dependent)

### Optimization Techniques

1. **Early Rejection**: Check capacity first, reject immediately if over
2. **Lazy Evaluation**: Only calculate expensive factors if needed
3. **Parallel Scoring**: Score all layouts in parallel (Promise.all)
4. **Minimal Allocations**: Reuse objects where possible
5. **Fast Path**: If contentLayoutHint matches and scores high, skip other evaluations

### Performance Monitoring

```typescript
function measurePerformance<T>(fn: () => T, label: string): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (duration > 50) {
    console.warn(`[performance] ${label} took ${duration.toFixed(2)}ms (threshold: 50ms)`);
  }
  
  return result;
}

// Usage
const selection = measurePerformance(
  () => selectLayout(slide, transformedSlide, context),
  `layout-selection-slide-${slideIndex}`
);
```

## Migration Strategy

### Phase 1: Parallel Implementation (Week 1-2)
- Implement new system alongside existing
- Add feature flag to switch between old/new
- Test with subset of users

### Phase 2: A/B Testing (Week 3)
- 50% users on new system
- Collect metrics: selection quality, performance, user satisfaction
- Compare layout variety and appropriateness

### Phase 3: Full Rollout (Week 4)
- 100% users on new system
- Monitor for issues
- Keep old system as fallback

### Phase 4: Cleanup (Week 5)
- Remove old layout selection code
- Remove feature flags
- Update documentation

### Rollback Plan

If issues arise:
1. Flip feature flag to old system
2. Investigate issues with debug endpoint
3. Fix and redeploy
4. Gradual rollout again

