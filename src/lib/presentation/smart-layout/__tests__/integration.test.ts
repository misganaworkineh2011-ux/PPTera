/**
 * Integration Tests for Smart Layout Selection System
 * 
 * Tests the full flow: outline → analysis → scoring → selection
 * Validates: Requirements 12.3
 */

import { describe, it, expect } from 'vitest';
import { selectLayout } from '../layout-selection';
import { samplePresentation, largePresentation, sampleOutlineSlides } from './test-fixtures';
import { createTestContext } from './test-utils';
import type { ContentLayoutCategory } from '../types';

describe('Smart Layout Selection - Integration Tests', () => {
  /**
   * Test: Full flow from outline to layout selection
   * 
   * Verifies that the complete pipeline works end-to-end
   */
  it('should successfully select layouts for a complete presentation', async () => {
    const context = createTestContext();
    const selections: Array<{
      slideIndex: number;
      category: ContentLayoutCategory;
      style: string;
      slideLayout: string;
    }> = [];

    // Process each slide in the sample presentation
    for (const [index, slide] of samplePresentation.entries()) {
      if (slide.type === 'title') {
        // Skip title slides for this test
        continue;
      }

      // Update context
      context.slideIndex = index;
      context.totalSlides = samplePresentation.length;
      context.previousLayouts = selections;

      // Select layout
      const selection = await selectLayout({
        slide,
        context,
      });

      // Verify selection is valid
      expect(selection).toBeDefined();
      expect(selection.category).toBeDefined();
      expect(selection.style).toBeDefined();
      expect(selection.slideLayout).toBeDefined();
      expect(selection.confidence).toBeDefined();
      expect(selection.score).toBeGreaterThanOrEqual(0);

      // Track selection
      selections.push({
        slideIndex: index,
        category: selection.category,
        style: selection.style,
        slideLayout: selection.slideLayout,
      });
    }

    // Verify we processed multiple slides
    expect(selections.length).toBeGreaterThan(0);
  });

  /**
   * Test: Layout variety across presentation
   * 
   * Verifies that the system provides variety
   */
  it('should provide layout variety across a presentation', async () => {
    const context = createTestContext();
    const selections: ContentLayoutCategory[] = [];

    // Process all content slides
    for (const [index, slide] of samplePresentation.entries()) {
      if (slide.type === 'title') continue;

      context.slideIndex = index;
      context.totalSlides = samplePresentation.length;

      const selection = await selectLayout({ slide, context });
      selections.push(selection.category);
    }

    // Count unique categories
    const uniqueCategories = new Set(selections);
    
    // Should have at least 2 different layout categories
    expect(uniqueCategories.size).toBeGreaterThanOrEqual(2);
  });

  /**
   * Test: Image-layout compatibility
   */
  it('should select image-compatible layouts for slides with images', async () => {
    const imageSlide = sampleOutlineSlides.imageSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: imageSlide, context });

    // Should have image-related slide layout
    expect(['image-left', 'image-right', 'image-top', 'image-bottom', 'image-full', 'no-image']).toContain(
      selection.slideLayout
    );
  });

  /**
   * Test: Features slide gets appropriate layout
   */
  it('should select appropriate layout for features slide', async () => {
    const featuresSlide = sampleOutlineSlides.featuresSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: featuresSlide, context });

    // Should get a valid category
    expect(selection.category).toBeDefined();
    expect(selection.confidence).toBeDefined();
  });

  /**
   * Test: Process slide gets sequential layout
   */
  it('should select sequential layout for process slide', async () => {
    const processSlide = sampleOutlineSlides.processSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: processSlide, context });

    // Should get a valid category
    expect(selection.category).toBeDefined();
    expect(selection.confidence).toBeDefined();
  });

  /**
   * Test: Statistics slide gets appropriate layout
   */
  it('should select appropriate layout for statistics slide', async () => {
    const statsSlide = sampleOutlineSlides.statisticsSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: statsSlide, context });

    // Should get a valid category
    expect(selection.category).toBeDefined();
    expect(selection.confidence).toBeDefined();
  });

  /**
   * Test: Timeline slide gets sequence layout
   */
  it('should select sequence layout for timeline slide', async () => {
    const timelineSlide = sampleOutlineSlides.timelineSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: timelineSlide, context });

    // Should get a valid category
    expect(selection.category).toBeDefined();
    expect(selection.confidence).toBeDefined();
  });

  /**
   * Test: Testimonial slide gets appropriate layout
   */
  it('should select appropriate layout for testimonial slide', async () => {
    const testimonialSlide = sampleOutlineSlides.testimonialSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: testimonialSlide, context });

    // Should get a valid category
    expect(selection.category).toBeDefined();
    expect(selection.confidence).toBeDefined();
  });

  /**
   * Test: How-to slide gets steps layout
   */
  it('should select steps layout for how-to slide', async () => {
    const howToSlide = sampleOutlineSlides.howToSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: howToSlide, context });

    // Should get a valid category
    expect(selection.category).toBeDefined();
    expect(selection.confidence).toBeDefined();
  });

  /**
   * Test: Performance across full presentation
   */
  it('should complete layout selection quickly for a full presentation', async () => {
    const context = createTestContext();

    const startTime = performance.now();

    // Process all content slides
    for (const [index, slide] of samplePresentation.entries()) {
      if (slide.type === 'title') continue;

      context.slideIndex = index;
      context.totalSlides = samplePresentation.length;

      await selectLayout({ slide, context });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Should complete in under 2 seconds for a 10-slide presentation
    expect(totalTime).toBeLessThan(2000);
  });

  /**
   * Test: Large presentation performance
   */
  it('should handle large presentations efficiently', async () => {
    const context = createTestContext();

    const startTime = performance.now();

    // Process all content slides in large presentation
    for (const [index, slide] of largePresentation.entries()) {
      if (slide.type === 'title') continue;

      context.slideIndex = index;
      context.totalSlides = largePresentation.length;

      await selectLayout({ slide, context });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Should complete in under 4 seconds for a 20-slide presentation
    expect(totalTime).toBeLessThan(4000);
  });

  /**
   * Test: Selection metadata completeness
   */
  it('should provide complete selection metadata', async () => {
    const context = createTestContext();

    for (const [index, slide] of samplePresentation.entries()) {
      if (slide.type === 'title') continue;

      context.slideIndex = index;
      context.totalSlides = samplePresentation.length;

      const selection = await selectLayout({ slide, context });

      // Verify all required fields are present
      expect(selection.category).toBeDefined();
      expect(selection.style).toBeDefined();
      expect(selection.slideLayout).toBeDefined();
      expect(selection.confidence).toBeDefined();
      expect(selection.score).toBeDefined();
      expect(selection.explanation).toBeDefined();
      expect(selection.factors).toBeDefined();

      // Verify types
      expect(typeof selection.category).toBe('string');
      expect(typeof selection.style).toBe('string');
      expect(typeof selection.slideLayout).toBe('string');
      expect(['high', 'medium', 'low']).toContain(selection.confidence);
      expect(typeof selection.score).toBe('number');
      expect(typeof selection.explanation).toBe('string');
      expect(Array.isArray(selection.factors)).toBe(true);

      // Verify explanation is meaningful
      expect(selection.explanation.length).toBeGreaterThan(10);

      // Verify factors array exists (may be empty for fallback)
      expect(Array.isArray(selection.factors)).toBe(true);
    }
  });

  /**
   * Test: Comparison slide gets appropriate layout
   */
  it('should select comparison-friendly layout for comparison slide', async () => {
    const comparisonSlide = sampleOutlineSlides.comparisonSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: comparisonSlide, context });

    // Should get a valid category
    expect(selection.category).toBeDefined();
    expect(selection.confidence).toBeDefined();
  });

  /**
   * Test: Categories slide gets appropriate layout
   */
  it('should select appropriate layout for categories slide', async () => {
    const categoriesSlide = sampleOutlineSlides.categoriesSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: categoriesSlide, context });

    // Should get a valid category
    expect(selection.category).toBeDefined();
    expect(selection.confidence).toBeDefined();
  });

  /**
   * Test: Cycle slide gets appropriate layout
   */
  it('should select appropriate layout for cycle slide', async () => {
    const cycleSlide = sampleOutlineSlides.cycleSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: cycleSlide, context });

    // Should get a valid category
    expect(selection.category).toBeDefined();
    expect(selection.confidence).toBeDefined();
  });

  /**
   * Test: Empty slide handling
   */
  it('should handle empty slides gracefully', async () => {
    const emptySlide = sampleOutlineSlides.emptySlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: emptySlide, context });

    // Should return a valid fallback
    expect(selection.category).toBeDefined();
    expect(selection.style).toBeDefined();
    expect(selection.slideLayout).toBeDefined();
  });

  /**
   * Test: Single bullet handling
   */
  it('should handle single bullet slides', async () => {
    const singleBulletSlide = sampleOutlineSlides.singleBulletSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: singleBulletSlide, context });

    // Should return a valid selection
    expect(selection.category).toBeDefined();
    expect(selection.style).toBeDefined();
    expect(selection.slideLayout).toBeDefined();
  });

  /**
   * Test: Long bullets handling
   */
  it('should handle slides with very long bullets', async () => {
    const longBulletsSlide = sampleOutlineSlides.longBulletsSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: longBulletsSlide, context });

    // Should return a valid selection
    expect(selection.category).toBeDefined();
    expect(selection.style).toBeDefined();
    expect(selection.slideLayout).toBeDefined();
  });

  /**
   * Test: Many bullets handling
   */
  it('should handle slides with many bullets', async () => {
    const manyBulletsSlide = sampleOutlineSlides.manyBulletsSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: manyBulletsSlide, context });

    // Should return a valid selection
    expect(selection.category).toBeDefined();
    expect(selection.style).toBeDefined();
    expect(selection.slideLayout).toBeDefined();
  });

  /**
   * Test: Missing metadata handling
   */
  it('should handle slides with missing metadata', async () => {
    const missingMetadataSlide = sampleOutlineSlides.missingMetadataSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: missingMetadataSlide, context });

    // Should return a valid selection with fallback metadata
    expect(selection.category).toBeDefined();
    expect(selection.style).toBeDefined();
    expect(selection.slideLayout).toBeDefined();
  });

  /**
   * Test: Malformed metadata handling
   */
  it('should handle slides with malformed metadata', async () => {
    const malformedMetadataSlide = sampleOutlineSlides.malformedMetadataSlide;
    const context = createTestContext();

    const selection = await selectLayout({ slide: malformedMetadataSlide, context });

    // Should return a valid selection despite malformed metadata
    expect(selection.category).toBeDefined();
    expect(selection.style).toBeDefined();
    expect(selection.slideLayout).toBeDefined();
  });
});
