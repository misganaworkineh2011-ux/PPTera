# Implementation Plan: Smart Layout Selection System

## Overview

This implementation plan breaks down the Smart Layout Selection System into discrete, manageable tasks. Each task builds incrementally on previous work, with checkpoints to ensure quality. The plan follows a bottom-up approach: foundational utilities first, then core algorithms, then integration, and finally testing and optimization.

## Task List

- [x] 1. Set up project structure and type definitions




  - Create new directory structure for layout selection system
  - Define all TypeScript interfaces and types
  - Set up barrel exports for clean imports
  - _Requirements: All requirements (foundational)_

- [x] 1.1 Create type definitions file


  - Create `src/lib/presentation/smart-layout/types.ts`
  - Define all interfaces: SlideMetadata, ContentAnalysis, LayoutCapacity, LayoutScoringInput, LayoutMatch, LayoutSelection, LayoutDefinition, LayoutStyleDefinition
  - Define enums: BulletPattern, ContentType, SemanticMarkers
  - Export all types
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 1.2 Create directory structure


  - Create `src/lib/presentation/smart-layout/` directory
  - Create subdirectories: `analyzers/`, `scorers/`, `selectors/`, `registry/`, `utils/`
  - Create index files for barrel exports
  - _Requirements: All (infrastructure)_

- [ ] 2. Implement content analyzer





  - Build deterministic content analysis engine
  - Extract patterns, semantic markers, and metrics from slide content
  - Calculate content density and detect content types
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 2.1 Implement pattern detection


  - Create `src/lib/presentation/smart-layout/analyzers/pattern-detector.ts`
  - Implement `analyzeBulletPatterns()` function with regex patterns for: numbered-steps, quoted-text, numeric, sequential, instructional, distinct-concepts, comparison, categorical
  - Add pattern confidence scoring
  - _Requirements: 2.2_

- [x] 2.2 Write property test for pattern detection


  - **Property 2: Content Analysis Completeness (Pattern Detection)**
  - **Validates: Requirements 2.2**

- [x] 2.3 Implement semantic marker extraction


  - Create `src/lib/presentation/smart-layout/analyzers/semantic-extractor.ts`
  - Implement `extractSemanticMarkers()` function
  - Detect markers: timeline, process, statistics, quotes, comparisons, instructions, categories, features, steps, cycle
  - Use keyword-based detection with regex
  - _Requirements: 2.3_

- [x] 2.4 Write property test for semantic extraction


  - **Property 2: Content Analysis Completeness (Semantic Markers)**
  - **Validates: Requirements 2.3**

- [x] 2.5 Implement content density calculator


  - Create `src/lib/presentation/smart-layout/analyzers/density-calculator.ts`
  - Implement `calculateContentDensity()` function
  - Calculate: bulletCount, avgBulletLength, maxBulletLength, totalWordCount
  - Classify density as low/medium/high
  - _Requirements: 2.1_

- [x] 2.6 Write property test for density calculation


  - **Property 2: Content Analysis Completeness (Density Metrics)**
  - **Validates: Requirements 2.1**

- [x] 2.7 Implement content type detector





  - Create `src/lib/presentation/smart-layout/analyzers/content-type-detector.ts`
  - Implement `detectContentType()` function
  - Use multi-signal scoring for types: TIMELINE, PROCESS, FEATURES, STATISTICS, HOW_TO, COMPARISON, TESTIMONIAL, CATEGORIES, STEPS, CYCLE, GENERIC
  - Return type with confidence score (0-100)
  - _Requirements: 2.4, 2.5_

- [x] 2.8 Write property test for content type detection













  - **Property 2: Content Analysis Completeness (Content Type)**
  - **Validates: Requirements 2.4, 2.5**

- [x] 2.9 Implement main content analyzer




  - Create `src/lib/presentation/smart-layout/analyzers/content-analyzer.ts`
  - Implement `analyzeContent()` function that combines all analyzers
  - Integrate pattern detection, semantic extraction, density calculation, type detection
  - Return complete ContentAnalysis object
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 2.10 Write property test for complete content analysis



  - **Property 2: Content Analysis Completeness**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**


- [x] 3. Implement metadata extractor





  - Extract and normalize metadata from LLM-generated outline slides
  - Provide fallback values for missing metadata
  - Validate metadata completeness
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 3.1 Implement metadata extraction


  - Create `src/lib/presentation/smart-layout/extractors/metadata-extractor.ts`
  - Implement `extractSlideMetadata()` function
  - Extract: semanticIntent, visualStrategy, contentLayoutHint, assets (image metadata)
  - Handle both outline slides and transformed slides
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3.2 Implement metadata normalization

  - Implement `normalizeSemanticIntent()` function
  - Implement `normalizeVisualStrategy()` function
  - Provide fallback values: semanticIntent="inform", visualStrategy={primary:"text-focused", pattern:"cards", emphasis:"clarity"}
  - _Requirements: 1.6_


- [x] 3.3 Implement metadata validation

  - Implement `validateMetadata()` function
  - Check all required fields present
  - Apply fallbacks for missing fields
  - Return validation result with warnings
  - _Requirements: 1.6_

- [x] 3.4 Write property test for metadata completeness


  - **Property 1: Metadata Completeness**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

- [x] 4. Create layout registry








  - Define all layout categories with capacity constraints and affinity scores
  - Register layout styles within each category
  - Provide layout lookup and filtering utilities
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.1 Define layout definitions


  - Create `src/lib/presentation/smart-layout/registry/layout-definitions.ts`
  - Define LayoutDefinition objects for all 8 categories: boxes, bullets, sequence, steps, quotes, circles, numbers, images
  - Include capacity constraints (bulletCount range, density, image support, space requirement)
  - Include affinity scores (contentTypeAffinity, patternAffinity)
  - Include compatibility rules (semanticIntentCompatibility, visualStrategyCompatibility)
  - Set priority levels (high/medium/low/fallback)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4.2 Write property test for layout definition completeness


  - **Property 3: Layout Definition Completeness**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [x] 4.3 Define layout styles

  - For each layout category, define 3-5 style variations
  - Include: id, name, description, idealBulletCount, bulletCountRange, spaceRequirement, visualWeight, formality
  - Examples: "box-style-1" (2-column), "box-style-2" (3-column), "box-style-3" (grid)
  - _Requirements: 6.1, 6.2_

- [x] 4.4 Create layout registry


  - Create `src/lib/presentation/smart-layout/registry/layout-registry.ts`
  - Export LAYOUT_REGISTRY array with all definitions
  - Implement `getLayoutByCategory()` lookup function
  - Implement `getLayoutStyles()` function to get styles for a category
  - Implement `getAllLayouts()` function
  - _Requirements: 3.1_

- [-] 5. Implement layout scoring engine



  - Score layouts based on 11 weighted factors
  - Evaluate capacity constraints
  - Calculate affinity scores
  - Apply bonuses and penalties
  - _Requirements: 4.1-4.11_

- [x] 5.1 Implement capacity evaluator


  - Create `src/lib/presentation/smart-layout/scorers/capacity-evaluator.ts`
  - Implement `evaluateCapacity()` function
  - Check bulletCount, avgBulletLength, maxBulletLength against layout constraints
  - Calculate capacity utilization percentage
  - Reject if utilization > 90%
  - Return { fits: boolean, utilization: number }
  - _Requirements: 3.6, 4.3_

- [x] 5.2 Write property test for capacity enforcement



  - **Property 4: Capacity Enforcement**
  - **Validates: Requirements 3.6**

- [x] 5.3 Implement scoring factors





  - Create `src/lib/presentation/smart-layout/scorers/scoring-factors.ts`
  - Implement individual scoring functions:
    - `scoreContentType()` - 40 points with affinity multiplier
    - `scorePattern()` - 35 points with affinity multiplier
    - `scoreCapacity()` - 30 points based on utilization
    - `scoreSemanticIntent()` - 25 points for compatibility
    - `scoreVisualStrategy()` - 25 points for compatibility
    - `scoreDensity()` - 20 points for match
    - `scoreMediaConstraints()` - 15 points each for image/space
    - `scoreBulletLength()` - 10 points for fit
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 5.4 Implement bonus and penalty calculators





  - Implement `calculatePriorityBonus()` - high: +15, medium: +5, fallback: -10
  - Implement `calculateConfidenceBonus()` - 70%+: +10, 40-69%: +5
  - Implement `calculateRepetitionPenalty()` - 2 consecutive: -5, 3 consecutive: -15
  - _Requirements: 4.9, 4.10, 5.2, 5.3_

- [x] 5.5 Implement main scoring function




  - Create `src/lib/presentation/smart-layout/scorers/layout-scorer.ts`
  - Implement `scoreLayout()` function
  - Combine all scoring factors
  - Return LayoutMatch with score and breakdown
  - Early rejection for capacity overflow
  - _Requirements: 4.1-4.11_

- [x] 5.6 Write property test for scoring consistency





  - **Property 5: Scoring Consistency**
  - **Validates: Requirements 4.1-4.10**


- [x] 6. Implement context tracker





  - Track previous slide layouts for variety optimization
  - Detect slide position (first, middle, last)
  - Maintain presentation-level statistics
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6.1 Create context tracker class


  - Create `src/lib/presentation/smart-layout/context/context-tracker.ts`
  - Implement LayoutSelectionContext interface
  - Track previous 3 layouts
  - Track category and style usage statistics
  - Implement `trackLayoutUsage()` method
  - _Requirements: 5.1_

- [x] 6.2 Implement position detection

  - Implement `getSlidePosition()` function
  - Classify as "first", "middle", or "last"
  - First: slideIndex === 0
  - Last: slideIndex === totalSlides - 1
  - Middle: everything else
  - _Requirements: 5.4, 5.5, 5.6_

- [x] 6.3 Implement repetition penalty calculator

  - Implement `calculateRepetitionPenalty()` function
  - Check previous 3 layouts
  - 2 consecutive same category: -5 points
  - 3 consecutive same category: -15 points
  - _Requirements: 5.2, 5.3_

- [x] 6.4 Write property test for context tracking


  - **Property 7: Context Tracking Accuracy**
  - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 6.5 Write property test for position-based preferences


  - **Property 8: Position-Based Preferences**
  - **Validates: Requirements 5.4, 5.5, 5.6**

- [x] 7. Implement layout selector





  - Select best layout from scored options
  - Calculate confidence levels
  - Handle fallback scenarios
  - Generate explanations
  - _Requirements: 4.11, 8.1, 8.3, 8.4_

- [x] 7.1 Implement layout selection logic


  - Create `src/lib/presentation/smart-layout/selectors/layout-selector.ts`
  - Implement `selectBestLayout()` function
  - Filter layouts with score < 30
  - Sort by score descending
  - Select top match
  - _Requirements: 8.1_

- [x] 7.2 Implement confidence calculator

  - Implement `calculateConfidence()` function
  - High: score >= 80
  - Medium: score >= 50
  - Low: score < 50
  - _Requirements: 8.4_

- [x] 7.3 Implement fallback handler

  - Implement `getFallbackLayout()` function
  - Choose "bullets" for text-heavy content (bulletCount > 4)
  - Choose "boxes" for short content (bulletCount <= 4)
  - Always return valid layout
  - _Requirements: 4.11, 8.3_

- [x] 7.4 Write property test for fallback guarantee


  - **Property 6: Fallback Guarantee**
  - **Validates: Requirements 4.11**

- [x] 7.5 Write property test for graceful failure


  - **Property 13: Graceful Failure**
  - **Validates: Requirements 8.3**

- [x] 7.6 Implement explanation generator

  - Implement `generateExplanation()` function
  - Create human-readable explanation of selection
  - List top contributing factors
  - Include confidence reasoning
  - _Requirements: 8.4, 10.1, 10.2, 10.3_

- [x] 8. Implement style selector





  - Choose specific style within selected layout category
  - Match style to content structure
  - Apply space constraints
  - Optimize for variety
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 8.1 Implement style matching


  - Create `src/lib/presentation/smart-layout/selectors/style-selector.ts`
  - Implement `selectStyle()` function
  - Match bullet count to style:
    - 2 items → 2-column style
    - 3 items → 3-column or triangle style
    - 4 items → 2x2 grid or 4-column style
    - 5+ items → grid or list style
  - _Requirements: 6.2, 6.3_

- [x] 8.2 Implement space constraint filtering

  - Implement `applySpaceConstraints()` function
  - Filter styles by spaceRequirement
  - Narrow space → vertical stack styles
  - Full width → horizontal grid styles
  - _Requirements: 6.4_

- [x] 8.3 Implement variety optimizer

  - Implement `optimizeStyleVariety()` function
  - Check previous style usage
  - Prefer unused or less-used styles
  - Avoid repeating same style in consecutive slides
  - _Requirements: 6.5, 6.6_

- [x] 8.4 Write property test for style-structure alignment


  - **Property 9: Style-Structure Alignment**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

- [x] 9. Implement image-layout compatibility









  - Boost scores for image-compatible layouts when images present
  - Reject image-required layouts when no images
  - Handle hybrid layouts (image + text)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 9.1 Implement image compatibility checker



  - Create `src/lib/presentation/smart-layout/utils/image-compatibility.ts`
  - Implement `checkImageCompatibility()` function
  - Check if layout supports images
  - Check if layout requires images
  - Return compatibility status
  - _Requirements: 7.1, 7.2_


- [x] 9.2 Implement image scoring adjustments

  - Implement `applyImageScoreAdjustments()` function
  - hasImage=true: boost image-compatible layouts (+30 for images category, +15 for others)
  - hasImage=false: reject image-required layouts (score = 0)
  - Prefer hybrid layouts for image + substantial text
  - _Requirements: 7.1, 7.2, 7.3_


- [x] 9.3 Implement icon compatibility

  - Implement `applyIconScoreAdjustments()` function
  - hasIcon=true: boost icon-friendly layouts (+20 for circles, +15 for boxes)
  - _Requirements: 7.6_

- [x] 9.4 Write property test for image-layout compatibility


  - **Property 10: Image-Layout Compatibility**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

- [x] 10. Checkpoint - Ensure all core components work together





  - Ensure all tests pass, ask the user if questions arise.


- [x] 11. Integrate with outline generator





  - Modify LLM prompts to request rich metadata
  - Update outline slide interface
  - Validate and normalize LLM responses
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 11.1 Update outline slide interface


  - Modify `src/lib/presentation/transform-outline-to-presentation.ts`
  - Add fields to OutlineSlide interface: semanticIntent, visualStrategy, contentLayoutHint
  - Ensure backward compatibility with existing outlines
  - _Requirements: 1.1_



- [x] 11.2 Enhance outline generator prompt

  - Modify `src/app/api/generate-outline/stream/route.ts`
  - Add metadata instructions to system prompt
  - Request semanticIntent, visualStrategy, contentLayoutHint for each content slide
  - Provide examples and guidelines
  - _Requirements: 1.2, 1.3, 1.4_


- [x] 11.3 Implement response validation

  - Add validation logic after LLM response parsing
  - Check for required metadata fields
  - Apply fallbacks for missing fields
  - Log warnings for incomplete metadata
  - _Requirements: 1.6_



- [x] 11.4 Write integration test for outline generation





  - Test with real LLM (OpenAI/Gemini)
  - Verify metadata extraction from responses
  - Test fallback behavior
  - _Requirements: 1.1-1.6_

- [x] 12. Create main layout selection orchestrator


  - Combine all components into single entry point
  - Handle errors and timeouts
  - Provide performance monitoring
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 12.1 Implement main selection function

  - Create `src/lib/presentation/smart-layout/index.ts`
  - Implement `selectLayout()` function as main entry point
  - Orchestrate: metadata extraction → content analysis → scoring → selection → style selection
  - Return complete LayoutSelection object
  - _Requirements: 8.1_


- [x] 12.2 Add error handling
  - Wrap selection in try-catch
  - Handle all error types (invalid input, timeout, missing data)
  - Always return valid fallback on error
  - Never throw exceptions to caller
  - _Requirements: 8.3_


- [x] 12.3 Add timeout handling
  - Implement 50ms timeout using Promise.race
  - Return best current match if timeout exceeded
  - Log performance warning

  - _Requirements: 8.2_

- [x] 12.4 Add performance monitoring
  - Implement `measurePerformance()` utility
  - Track timing for each phase (extraction, analysis, scoring, selection)
  - Log warnings if any phase exceeds threshold

  - Collect metrics for optimization
  - _Requirements: 8.2, 11.1, 11.2_

- [x] 12.5 Write property test for performance bound
  - **Property 12: Performance Bound**
  - **Validates: Requirements 8.2**
  - **Status**: ✅ PASSED

- [x] 12.6 Write property test for selection before rendering
  - **Property 11: Selection Before Rendering**
  - **Validates: Requirements 8.1**
  - **Status**: ✅ PASSED


- [x] 12.7 Write property test for selection metadata completeness

  - **Property 14: Selection Metadata Completeness**
  - **Validates: Requirements 8.4, 8.5**
  - **Status**: ✅ PASSED

- [x] 13. Integrate with presentation generation stream




  - Replace existing layout planning with new system
  - Maintain context across slides
  - Stream layout selections
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 13.1 Modify presentation stream route

  - Update `src/app/api/create-presentation/stream/route.ts`
  - Replace `planSlideLayout()` calls with `selectLayout()`
  - Initialize LayoutSelectionContext at stream start
  - Track selections for context
  - _Requirements: 8.1_


- [x] 13.2 Implement context management

  - Create context object before processing slides
  - Update context after each selection
  - Pass context to each `selectLayout()` call
  - Maintain previous layouts array
  - _Requirements: 5.1_



- [x] 13.3 Apply layout selection results
  - Map LayoutSelection to PresentationSlide fields
  - Set: slideLayout, imageSize, imageShape, contentLayout, contentLayoutCategory
  - Maintain backward compatibility with legacy layout field
  - _Requirements: 8.1_



- [x] 13.4 Add selection metadata to stream events
  - Include layout selection info in slideComplete events
  - Send: category, style, confidence, score
  - Enable client-side debugging
  - _Requirements: 8.4, 8.5_

- [-] 13.5 Write integration test for streaming

  - Test full presentation generation with new layout system
  - Verify context tracking across slides
  - Verify no blocking or delays
  - Test with 10-20 slide presentations
  - _Requirements: 8.1, 8.2, 8.3_


- [x] 13.6 Write property test for batch processing consistency

  - **Property 15: Batch Processing Consistency**
  - **Validates: Requirements 11.6**
  - **Status**: ✅ PASSED

- [x] 14. Add debugging and monitoring tools







  - Create debug API endpoint
  - Add comprehensive logging
  - Implement selection explainability
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_


- [x] 14.1 Create debug API endpoint

  - Create `src/app/api/debug/layout-selection/route.ts`
  - Accept slide and context as input
  - Return: selection, all scores with breakdowns, content analysis, metadata
  - Enable detailed inspection of selection process
  - _Requirements: 10.4_

- [x] 14.2 Implement comprehensive logging



  - Add logging to all major functions
  - Log: selections, scores, confidence, top factors
  - Log warnings for low confidence selections
  - Log errors with full context
  - _Requirements: 10.1, 10.2, 10.3, 10.6_


- [x] 14.3 Create selection explainability

  - Implement `explainSelection()` function
  - Generate human-readable explanation
  - List contributing factors in order of impact
  - Explain why runner-ups were not selected
  - _Requirements: 10.1, 10.2, 10.3_


- [x] 14.4 Add development mode debugger

  - Create visual debugger component (optional)
  - Show score calculations and decision trees
  - Display content analysis results
  - Enable interactive testing
  - _Requirements: 10.5_

- [x] 15. Checkpoint - Ensure integration works end-to-end





  - Ensure all tests pass, ask the user if questions arise.


- [x] 16. Implement performance optimizations



  - Add caching for expensive operations
  - Optimize hot paths
  - Minimize allocations
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 16.1 Implement layout registry caching
  - Load layout registry once at startup
  - Cache in memory for fast access
  - Implement singleton pattern
  - _Requirements: 11.5_

- [x] 16.2 Optimize pattern regex compilation
  - Compile all regex patterns once at module load
  - Reuse compiled patterns
  - Cache regex results for identical inputs
  - _Requirements: 11.1_

- [x] 16.3 Implement content analysis caching
  - Cache analysis results keyed by content hash
  - Use LRU cache with size limit (100 entries)
  - Clear cache on memory pressure
  - _Requirements: 11.2_

- [x] 16.4 Optimize scoring algorithm
  - Implement early rejection for capacity overflow
  - Use lazy evaluation for expensive factors
  - Skip unnecessary calculations when score already high
  - _Requirements: 11.1, 11.2_

- [x] 16.5 Add fast path for hint matches
  - If contentLayoutHint matches and scores > 70, skip other evaluations
  - Reduces average selection time by 30-40%
  - _Requirements: 11.1_

- [x] 16.6 Write performance benchmarks
  - Benchmark single slide selection (target: < 50ms, ideal: 20-30ms)
  - Benchmark 20-slide presentation (target: < 1 second)
  - Benchmark content analysis (target: < 20ms)
  - Benchmark layout scoring (target: < 30ms)
  - _Requirements: 11.1, 11.2, 11.3_

- [-] 17. Write comprehensive test suite



  - Unit tests for all components
  - Property-based tests for correctness properties
  - Integration tests for full flow
  - Performance tests for timing requirements
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_


- [x] 17.1 Set up testing infrastructure

  - Install fast-check for property-based testing
  - Configure vitest for unit and integration tests
  - Set up test fixtures and utilities
  - Create test data generators
  - _Requirements: 12.1_


- [x] 17.2 Write unit tests for content analyzer

  - Test pattern detection with known patterns
  - Test semantic marker extraction with keyword-rich text
  - Test density calculations with various inputs
  - Test content type detection with labeled examples
  - Edge cases: empty content, single bullet, very long bullets
  - Target: 90%+ code coverage
  - _Requirements: 12.1, 12.2_


- [x] 17.3 Write unit tests for layout scorer

  - Test each scoring factor independently
  - Test score aggregation with known inputs
  - Test capacity evaluation with edge cases
  - Test penalty calculations
  - Edge cases: all factors zero, all factors max, negative penalties
  - Target: 90%+ code coverage
  - _Requirements: 12.1, 12.2_


- [x] 17.4 Write unit tests for layout selector

  - Test selection with clear winner (score > 80)
  - Test selection with close scores
  - Test fallback when all scores < 30
  - Test confidence calculation at boundaries
  - Edge cases: single layout, no layouts, tied scores
  - Target: 90%+ code coverage
  - _Requirements: 12.1, 12.2_



- [ ] 17.5 Write unit tests for style selector
  - Test style matching for each bullet count
  - Test space constraint filtering
  - Test variety optimization
  - Edge cases: no matching styles, all styles used recently
  - Target: 90%+ code coverage

  - _Requirements: 12.1, 12.2_

- [x] 17.6 Write integration tests


  - Test full flow: outline → analysis → scoring → selection → rendering
  - Test with real presentation examples (10-20 slides)
  - Verify layout variety across presentation
  - Verify image-layout compatibility
  - Verify performance across full presentation
  - _Requirements: 12.3_


- [ ] 17.7 Write LLM integration tests
  - Test with actual LLM responses (OpenAI, Gemini)
  - Verify metadata extraction from real responses
  - Test fallback when LLM omits fields
  - Test with various presentation topics and tones
  - _Requirements: 12.3_


- [x] 17.8 Write edge case tests

  - Test with empty content
  - Test with malformed metadata
  - Test with missing LLM data
  - Test with extreme content volumes (1 bullet, 20 bullets)
  - Test with very long bullets (100+ words)
  - Test with all same content type
  - _Requirements: 12.6_

- [ ] 18. Implement feature flag and migration strategy
  - Add feature flag to toggle between old and new systems
  - Implement gradual rollout
  - Add metrics collection
  - _Requirements: All (deployment)_

- [ ] 18.1 Add feature flag
  - Create feature flag in environment config
  - Default to false (old system)
  - Add flag check in presentation stream route
  - Route to old or new system based on flag
  - _Requirements: All_

- [ ] 18.2 Implement A/B testing logic
  - Add user-based routing (50% old, 50% new)
  - Track which system each user sees
  - Ensure consistency per user (same user always sees same system)
  - _Requirements: All_

- [ ] 18.3 Add metrics collection
  - Track: selection quality, performance, user satisfaction
  - Log: layout distribution, confidence levels, fallback rate
  - Compare old vs new system metrics
  - _Requirements: All_

- [ ] 18.4 Create rollback plan
  - Document rollback procedure
  - Test rollback by flipping flag
  - Ensure old system still works
  - Keep old code until new system proven stable
  - _Requirements: All_

- [ ] 19. Documentation and cleanup
  - Write API documentation
  - Create usage examples
  - Update README
  - Remove old code after successful rollout
  - _Requirements: All_

- [ ] 19.1 Write API documentation
  - Document all public functions and interfaces
  - Add JSDoc comments with examples
  - Create architecture diagram
  - Document scoring algorithm in detail
  - _Requirements: All_

- [ ] 19.2 Create usage examples
  - Write example code for common scenarios
  - Document how to add new layouts
  - Document how to tune scoring weights
  - Create troubleshooting guide
  - _Requirements: All_

- [ ] 19.3 Update README
  - Add section on smart layout selection
  - Explain hybrid approach
  - List supported layouts and styles
  - Add performance characteristics
  - _Requirements: All_

- [ ] 19.4 Remove old layout selection code
  - Delete old layout-matcher.ts (after successful rollout)
  - Delete old content-analyzer.ts (if replaced)
  - Remove feature flags
  - Clean up unused imports
  - _Requirements: All_

- [ ] 20. Final Checkpoint - Ensure all tests pass and system is production-ready
  - Ensure all tests pass, ask the user if questions arise.
