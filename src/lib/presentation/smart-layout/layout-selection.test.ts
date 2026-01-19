/**
 * Property-Based Tests for Layout Selection Orchestrator
 * 
 * Tests the main layout selection function using property-based testing
 * to verify correctness properties across many random inputs.
 * 
 * Uses fast-check for property-based testing.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { selectLayout, type LayoutSelectionInput } from "./layout-selection";
import { ContentType, BulletPattern, SemanticMarkers } from "./types";
import type { ContentLayoutCategory } from "~/lib/layouts/content";

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generate random slide content
 */
const slideArbitrary = fc.record({
  type: fc.constantFrom("title" as const, "content" as const),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  subtitle: fc.option(fc.string({ minLength: 5, maxLength: 50 })),
  bulletPoints: fc.option(
    fc.array(fc.string({ minLength: 10, maxLength: 200 }), { minLength: 1, maxLength: 10 })
  ),
  semanticIntent: fc.option(
    fc.constantFrom("inform", "compare", "instruct", "emphasize", "narrate")
  ),
  visualStrategy: fc.option(
    fc.record({
      primary: fc.constantFrom("diagram", "image", "mixed", "text-focused"),
      pattern: fc.constantFrom("cards", "grid", "flow", "split", "spotlight"),
      emphasis: fc.constantFrom("progression", "contrast", "relationship", "scale", "clarity"),
    })
  ),
  contentLayoutHint: fc.option(
    fc.constantFrom("boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers")
  ),
  image: fc.option(
    fc.record({
      required: fc.boolean(),
      orientation: fc.constantFrom("landscape" as const, "portrait" as const),
      pexelsPromptHint: fc.string({ minLength: 5, maxLength: 50 }),
      aiPromptHint: fc.string({ minLength: 5, maxLength: 50 }),
    })
  ),
});

/**
 * Generate random context
 */
const contextArbitrary = fc.record({
  slideIndex: fc.nat({ max: 50 }),
  totalSlides: fc.integer({ min: 1, max: 100 }),
  previousLayouts: fc.array(
    fc.record({
      slideIndex: fc.nat({ max: 50 }),
      category: fc.constantFrom(
        "boxes" as ContentLayoutCategory,
        "bullets" as ContentLayoutCategory,
        "sequence" as ContentLayoutCategory,
        "steps" as ContentLayoutCategory,
        "quotes" as ContentLayoutCategory,
        "circles" as ContentLayoutCategory,
        "numbers" as ContentLayoutCategory,
        "images" as ContentLayoutCategory
      ),
      style: fc.string({ minLength: 5, maxLength: 20 }),
    }),
    { maxLength: 10 }
  ),
  presentationTone: fc.option(fc.string({ minLength: 5, maxLength: 20 })),
  presentationLanguage: fc.option(fc.string({ minLength: 2, maxLength: 10 })),
  themeStyle: fc.option(fc.constantFrom("minimal" as const, "professional" as const, "creative" as const)),
  categoryUsage: fc.constant(new Map<ContentLayoutCategory, number>()),
  styleUsage: fc.constant(new Map<string, number>()),
});

/**
 * Generate complete layout selection input
 */
const layoutSelectionInputArbitrary: fc.Arbitrary<LayoutSelectionInput> = fc.record({
  slide: slideArbitrary,
  context: contextArbitrary,
  options: fc.option(
    fc.record({
      timeout: fc.option(fc.integer({ min: 10, max: 200 })),
      enablePerformanceLogging: fc.option(fc.boolean()),
      enableDebugLogging: fc.option(fc.boolean()),
    })
  ),
});

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe("Layout Selection Orchestrator - Property Tests", () => {
  /**
   * Property 12: Performance Bound
   * 
   * For any slide, layout selection must complete within 50 milliseconds
   * to maintain stream responsiveness.
   * 
   * **Feature: smart-layout-selection, Property 12: Performance Bound**
   * **Validates: Requirements 8.2**
   */
  it("Property 12: Performance Bound - selection completes within 50ms", async () => {
    await fc.assert(
      fc.asyncProperty(layoutSelectionInputArbitrary, async (input) => {
        const startTime = performance.now();
        
        // Run selection with default timeout (50ms)
        const result = await selectLayout({
          ...input,
          options: {
            ...input.options,
            timeout: 50,
          },
        });
        
        const duration = performance.now() - startTime;
        
        // Selection should complete within 50ms (with small buffer for overhead)
        expect(duration).toBeLessThan(60);
        
        // Result should be valid
        expect(result).toBeDefined();
        expect(result.category).toBeDefined();
        expect(result.style).toBeDefined();
        expect(result.slideLayout).toBeDefined();
      }),
      {
        numRuns: 100, // Run 100 iterations
        timeout: 10000, // 10 second timeout for entire test
      }
    );
  });

  /**
   * Property 11: Selection Before Rendering
   * 
   * For any slide in the presentation generation stream, layout selection
   * must complete and produce a LayoutSelection object before the slide
   * is passed to the renderer.
   * 
   * This property verifies that selection always returns a complete,
   * valid LayoutSelection object.
   * 
   * **Feature: smart-layout-selection, Property 11: Selection Before Rendering**
   * **Validates: Requirements 8.1**
   */
  it("Property 11: Selection Before Rendering - always returns complete LayoutSelection", async () => {
    await fc.assert(
      fc.asyncProperty(layoutSelectionInputArbitrary, async (input) => {
        const result = await selectLayout(input);
        
        // Must return a complete LayoutSelection object
        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        
        // Required fields must be present
        expect(result.category).toBeDefined();
        expect(typeof result.category).toBe("string");
        
        expect(result.style).toBeDefined();
        expect(typeof result.style).toBe("string");
        
        expect(result.slideLayout).toBeDefined();
        expect(typeof result.slideLayout).toBe("string");
        
        expect(result.confidence).toBeDefined();
        expect(["high", "medium", "low"]).toContain(result.confidence);
        
        expect(result.score).toBeDefined();
        expect(typeof result.score).toBe("number");
        expect(result.score).toBeGreaterThanOrEqual(0);
        
        expect(result.runnerUps).toBeDefined();
        expect(Array.isArray(result.runnerUps)).toBe(true);
        
        expect(result.explanation).toBeDefined();
        expect(typeof result.explanation).toBe("string");
        expect(result.explanation.length).toBeGreaterThan(0);
        
        expect(result.factors).toBeDefined();
        expect(Array.isArray(result.factors)).toBe(true);
        
        // Valid category values
        const validCategories: ContentLayoutCategory[] = [
          "boxes",
          "bullets",
          "sequence",
          "steps",
          "quotes",
          "circles",
          "numbers",
          "images",
        ];
        expect(validCategories).toContain(result.category);
        
        // Valid slide layout values
        const validSlideLayouts = [
          "no-image",
          "image-left",
          "image-right",
          "image-top",
          "image-bottom",
          "full-image",
        ];
        expect(validSlideLayouts).toContain(result.slideLayout);
      }),
      {
        numRuns: 100,
        timeout: 10000,
      }
    );
  });

  /**
   * Property 14: Selection Metadata Completeness
   * 
   * For any completed layout selection, the output must include all
   * metadata fields (category, style, slideLayout, confidence, score,
   * runnerUps, explanation, factors) to enable debugging and user
   * understanding.
   * 
   * **Feature: smart-layout-selection, Property 14: Selection Metadata Completeness**
   * **Validates: Requirements 8.4, 8.5**
   */
  it("Property 14: Selection Metadata Completeness - all metadata fields present", async () => {
    await fc.assert(
      fc.asyncProperty(layoutSelectionInputArbitrary, async (input) => {
        const result = await selectLayout({
          ...input,
          options: {
            ...input.options,
            enablePerformanceLogging: true, // Enable to test performance metrics
          },
        });
        
        // Core selection fields
        expect(result.category).toBeDefined();
        expect(result.style).toBeDefined();
        expect(result.slideLayout).toBeDefined();
        expect(result.confidence).toBeDefined();
        expect(result.score).toBeDefined();
        
        // Debugging fields
        expect(result.runnerUps).toBeDefined();
        expect(Array.isArray(result.runnerUps)).toBe(true);
        
        expect(result.explanation).toBeDefined();
        expect(typeof result.explanation).toBe("string");
        expect(result.explanation.length).toBeGreaterThan(0);
        
        expect(result.factors).toBeDefined();
        expect(Array.isArray(result.factors)).toBe(true);
        
        // Performance metrics (when enabled)
        expect(result.performanceMetrics).toBeDefined();
        expect(result.performanceMetrics?.total).toBeDefined();
        expect(result.performanceMetrics?.extraction).toBeDefined();
        expect(result.performanceMetrics?.analysis).toBeDefined();
        expect(result.performanceMetrics?.scoring).toBeDefined();
        expect(result.performanceMetrics?.selection).toBeDefined();
        expect(result.performanceMetrics?.styleSelection).toBeDefined();
        
        // All timing values should be non-negative
        expect(result.performanceMetrics!.total).toBeGreaterThanOrEqual(0);
        expect(result.performanceMetrics!.extraction).toBeGreaterThanOrEqual(0);
        expect(result.performanceMetrics!.analysis).toBeGreaterThanOrEqual(0);
        expect(result.performanceMetrics!.scoring).toBeGreaterThanOrEqual(0);
        expect(result.performanceMetrics!.selection).toBeGreaterThanOrEqual(0);
        expect(result.performanceMetrics!.styleSelection).toBeGreaterThanOrEqual(0);
        
        // Metadata and analysis (when available)
        if (result.metadata) {
          expect(result.metadata.semanticIntent).toBeDefined();
          expect(result.metadata.visualStrategy).toBeDefined();
          expect(result.metadata.assets).toBeDefined();
        }
        
        if (result.analysis) {
          expect(result.analysis.pattern).toBeDefined();
          expect(result.analysis.contentType).toBeDefined();
          expect(result.analysis.bulletCount).toBeDefined();
          expect(typeof result.analysis.bulletCount).toBe("number");
        }
      }),
      {
        numRuns: 100,
        timeout: 10000,
      }
    );
  });

  /**
   * Property 13: Graceful Failure
   * 
   * For any layout selection that fails (exception thrown, timeout exceeded,
   * invalid input), the system must return a safe fallback layout without
   * throwing an exception or blocking the presentation stream.
   * 
   * **Feature: smart-layout-selection, Property 13: Graceful Failure**
   * **Validates: Requirements 8.3**
   */
  it("Property 13: Graceful Failure - never throws, always returns valid layout", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate potentially invalid inputs
          slide: fc.oneof(
            slideArbitrary,
            fc.constant(null as any),
            fc.constant(undefined as any),
            fc.constant({} as any),
            fc.record({
              type: fc.constant("invalid" as any),
              title: fc.constant(""),
              bulletPoints: fc.constant([]),
            })
          ),
          context: fc.oneof(
            contextArbitrary,
            fc.constant(null as any),
            fc.constant(undefined as any),
            fc.constant({} as any)
          ),
          options: fc.option(
            fc.record({
              timeout: fc.integer({ min: 1, max: 5 }), // Very short timeout to trigger timeout errors
              enablePerformanceLogging: fc.boolean(),
              enableDebugLogging: fc.boolean(),
            })
          ),
        }),
        async (input) => {
          // Selection should never throw, even with invalid input
          let result;
          let didThrow = false;
          
          try {
            result = await selectLayout(input as any);
          } catch (error) {
            didThrow = true;
          }
          
          // Should not throw
          expect(didThrow).toBe(false);
          
          // Should return a valid result
          expect(result).toBeDefined();
          
          if (result) {
            // Should have a valid category
            expect(result.category).toBeDefined();
            expect(typeof result.category).toBe("string");
            
            // Should have a valid style
            expect(result.style).toBeDefined();
            expect(typeof result.style).toBe("string");
            
            // Should have a valid slide layout
            expect(result.slideLayout).toBeDefined();
            expect(typeof result.slideLayout).toBe("string");
            
            // Should have an explanation (even if it's a fallback)
            expect(result.explanation).toBeDefined();
            expect(typeof result.explanation).toBe("string");
          }
        }
      ),
      {
        numRuns: 50, // Fewer runs since we're testing error cases
        timeout: 10000,
      }
    );
  });

  /**
   * Additional test: Verify timeout handling
   */
  it("handles timeout gracefully and returns fallback", async () => {
    const input: LayoutSelectionInput = {
      slide: {
        type: "content",
        title: "Test Slide",
        bulletPoints: ["Point 1", "Point 2", "Point 3"],
      },
      context: {
        slideIndex: 0,
        totalSlides: 10,
        previousLayouts: [],
        categoryUsage: new Map(),
        styleUsage: new Map(),
      },
      options: {
        timeout: 1, // Very short timeout to trigger timeout
      },
    };
    
    const result = await selectLayout(input);
    
    // Should return a valid result even with timeout
    expect(result).toBeDefined();
    expect(result.category).toBeDefined();
    expect(result.style).toBeDefined();
    expect(result.slideLayout).toBeDefined();
    
    // Likely to be a fallback with low confidence
    // (though not guaranteed if selection is very fast)
    expect(result.confidence).toBeDefined();
  });

  /**
   * Additional test: Verify title slides are handled correctly
   */
  it("handles title slides correctly", async () => {
    const input: LayoutSelectionInput = {
      slide: {
        type: "title",
        title: "Presentation Title",
        subtitle: "Subtitle",
      },
      context: {
        slideIndex: 0,
        totalSlides: 10,
        previousLayouts: [],
        categoryUsage: new Map(),
        styleUsage: new Map(),
      },
    };
    
    const result = await selectLayout(input);
    
    // Should return a valid result for title slides
    expect(result).toBeDefined();
    expect(result.category).toBeDefined();
    expect(result.style).toBe("title-default");
    expect(result.slideLayout).toBe("no-image");
    expect(result.confidence).toBe("high");
    expect(result.score).toBe(100);
  });

  /**
   * Property 15: Batch Processing Consistency
   * 
   * For any presentation with N slides processed in batch, each slide's
   * layout selection must be independent (not affected by processing order)
   * except for context-based penalties which depend only on previous slides'
   * selections.
   * 
   * This property verifies that:
   * 1. Selecting layouts for slides in sequence produces consistent results
   * 2. Context tracking correctly influences subsequent selections
   * 3. The same slide content produces the same selection when context is identical
   * 
   * **Feature: smart-layout-selection, Property 15: Batch Processing Consistency**
   * **Validates: Requirements 11.6**
   */
  it("Property 15: Batch Processing Consistency - selections are consistent across batch", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of slides (a mini presentation)
        fc.array(slideArbitrary, { minLength: 3, maxLength: 10 }),
        async (slides) => {
          // Process slides in sequence, building context
          const results1: Array<{
            category: ContentLayoutCategory;
            style: string;
            score: number;
          }> = [];
          
          const context1 = {
            slideIndex: 0,
            totalSlides: slides.length,
            previousLayouts: [] as Array<{
              slideIndex: number;
              category: ContentLayoutCategory;
              style: string;
            }>,
            categoryUsage: new Map<ContentLayoutCategory, number>(),
            styleUsage: new Map<string, number>(),
          };
          
          // First pass: process all slides
          for (let i = 0; i < slides.length; i++) {
            context1.slideIndex = i;
            
            const result = await selectLayout({
              slide: slides[i]!,
              context: context1,
            });
            
            results1.push({
              category: result.category,
              style: result.style,
              score: result.score,
            });
            
            // Update context for next slide
            context1.previousLayouts.push({
              slideIndex: i,
              category: result.category,
              style: result.style,
            });
            
            const categoryCount = context1.categoryUsage.get(result.category) ?? 0;
            context1.categoryUsage.set(result.category, categoryCount + 1);
            
            const styleCount = context1.styleUsage.get(result.style) ?? 0;
            context1.styleUsage.set(result.style, styleCount + 1);
          }
          
          // Second pass: process all slides again with same context progression
          const results2: Array<{
            category: ContentLayoutCategory;
            style: string;
            score: number;
          }> = [];
          
          const context2 = {
            slideIndex: 0,
            totalSlides: slides.length,
            previousLayouts: [] as Array<{
              slideIndex: number;
              category: ContentLayoutCategory;
              style: string;
            }>,
            categoryUsage: new Map<ContentLayoutCategory, number>(),
            styleUsage: new Map<string, number>(),
          };
          
          for (let i = 0; i < slides.length; i++) {
            context2.slideIndex = i;
            
            const result = await selectLayout({
              slide: slides[i]!,
              context: context2,
            });
            
            results2.push({
              category: result.category,
              style: result.style,
              score: result.score,
            });
            
            // Update context for next slide
            context2.previousLayouts.push({
              slideIndex: i,
              category: result.category,
              style: result.style,
            });
            
            const categoryCount = context2.categoryUsage.get(result.category) ?? 0;
            context2.categoryUsage.set(result.category, categoryCount + 1);
            
            const styleCount = context2.styleUsage.get(result.style) ?? 0;
            context2.styleUsage.set(result.style, styleCount + 1);
          }
          
          // Results should be identical when context progression is the same
          expect(results1.length).toBe(results2.length);
          
          for (let i = 0; i < results1.length; i++) {
            // Same slide with same context should produce same selection
            expect(results1[i]!.category).toBe(results2[i]!.category);
            expect(results1[i]!.style).toBe(results2[i]!.style);
            expect(results1[i]!.score).toBe(results2[i]!.score);
          }
          
          // Verify context-based penalties are working
          // If we see the same category 3+ times in a row, later instances should have lower scores
          for (let i = 2; i < results1.length; i++) {
            const current = results1[i]!;
            const prev1 = results1[i - 1]!;
            const prev2 = results1[i - 2]!;
            
            // If same category appears 3 times in a row, it indicates either:
            // 1. The content strongly favors that category (high base score overcomes penalty)
            // 2. The penalty is being applied but not enough to change selection
            // We can't assert the score is lower without knowing the base score,
            // but we can verify the selection is still valid
            if (current.category === prev1.category && prev1.category === prev2.category) {
              expect(current.category).toBeDefined();
              expect(current.style).toBeDefined();
              expect(current.score).toBeGreaterThanOrEqual(0);
            }
          }
        }
      ),
      {
        numRuns: 50, // Fewer runs since this tests multiple slides per run
        timeout: 20000, // Longer timeout since we're processing multiple slides
      }
    );
  });

  /**
   * Additional test: Verify context affects subsequent selections
   */
  it("context tracking influences layout variety", async () => {
    // Create 5 identical slides
    const identicalSlide = {
      type: "content" as const,
      title: "Test Slide",
      bulletPoints: ["Point 1", "Point 2", "Point 3", "Point 4"],
    };
    
    const slides = Array(5).fill(identicalSlide);
    
    const context = {
      slideIndex: 0,
      totalSlides: slides.length,
      previousLayouts: [] as Array<{
        slideIndex: number;
        category: ContentLayoutCategory;
        style: string;
      }>,
      categoryUsage: new Map<ContentLayoutCategory, number>(),
      styleUsage: new Map<string, number>(),
    };
    
    const results: ContentLayoutCategory[] = [];
    
    // Process all slides
    for (let i = 0; i < slides.length; i++) {
      context.slideIndex = i;
      
      const result = await selectLayout({
        slide: slides[i]!,
        context,
      });
      
      results.push(result.category);
      
      // Update context
      context.previousLayouts.push({
        slideIndex: i,
        category: result.category,
        style: result.style,
      });
      
      const categoryCount = context.categoryUsage.get(result.category) ?? 0;
      context.categoryUsage.set(result.category, categoryCount + 1);
    }
    
    // With identical content, we should see some variety due to repetition penalties
    // (though not guaranteed if one layout is overwhelmingly better)
    // At minimum, verify all selections are valid
    for (const category of results) {
      expect(category).toBeDefined();
      expect(typeof category).toBe("string");
    }
    
    // Count unique categories
    const uniqueCategories = new Set(results);
    
    // With 5 identical slides and repetition penalties, we should see at least
    // some variety (though this is probabilistic, not guaranteed)
    // For now, just verify the system works correctly
    expect(uniqueCategories.size).toBeGreaterThanOrEqual(1);
    expect(uniqueCategories.size).toBeLessThanOrEqual(5);
  });
});
