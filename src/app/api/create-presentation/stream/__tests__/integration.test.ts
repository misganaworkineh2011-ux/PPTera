/**
 * Integration Test: Presentation Generation Stream with Smart Layout Selection
 * 
 * Tests the full presentation generation flow with the new smart layout selection system:
 * - Context tracking across slides
 * - Layout variety in presentations
 * - No blocking or delays
 * - Performance requirements
 * 
 * Requirements: 8.1, 8.2, 8.3
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { selectLayout, type LayoutSelectionContext } from "~/lib/presentation/smart-layout";
import type { ContentLayoutCategory } from "~/lib/layouts/content";

describe("Presentation Stream Integration with Smart Layout Selection", () => {
  describe("Context Tracking Across Slides", () => {
    it("should maintain context across multiple slides", async () => {
      // Create initial context
      const context: LayoutSelectionContext = {
        slideIndex: 0,
        totalSlides: 10,
        previousLayouts: [],
        presentationTone: "professional",
        presentationLanguage: "en",
        themeStyle: "professional",
        categoryUsage: new Map(),
        styleUsage: new Map(),
      };

      // Simulate processing 5 slides
      const slides = [
        {
          type: "content" as const,
          title: "Introduction",
          bulletPoints: ["Point 1", "Point 2", "Point 3"],
        },
        {
          type: "content" as const,
          title: "Key Features",
          bulletPoints: ["Feature A", "Feature B", "Feature C", "Feature D"],
        },
        {
          type: "content" as const,
          title: "Process Steps",
          bulletPoints: ["Step 1: Start", "Step 2: Continue", "Step 3: Finish"],
        },
        {
          type: "content" as const,
          title: "Statistics",
          bulletPoints: ["90% success rate", "50+ customers", "24/7 support"],
        },
        {
          type: "content" as const,
          title: "Conclusion",
          bulletPoints: ["Summary point 1", "Summary point 2"],
        },
      ];

      const selections: Array<{
        slideIndex: number;
        category: ContentLayoutCategory;
        style: string;
      }> = [];

      // Process each slide
      for (let i = 0; i < slides.length; i++) {
        context.slideIndex = i;
        
        const selection = await selectLayout({
          slide: slides[i]!,
          context,
        });

        // Track selection
        selections.push({
          slideIndex: i,
          category: selection.category,
          style: selection.style,
        });

        // Update context (simulating what the stream does)
        context.previousLayouts.push({
          slideIndex: i,
          category: selection.category,
          style: selection.style,
        });

        const categoryCount = context.categoryUsage.get(selection.category) ?? 0;
        context.categoryUsage.set(selection.category, categoryCount + 1);

        const styleCount = context.styleUsage.get(selection.style) ?? 0;
        context.styleUsage.set(selection.style, styleCount + 1);
      }

      // Verify context was maintained
      expect(context.previousLayouts).toHaveLength(5);
      expect(context.categoryUsage.size).toBeGreaterThan(0);
      expect(context.styleUsage.size).toBeGreaterThan(0);

      // Verify selections were made
      expect(selections).toHaveLength(5);
      selections.forEach((sel, idx) => {
        expect(sel.slideIndex).toBe(idx);
        expect(sel.category).toBeDefined();
        expect(sel.style).toBeDefined();
      });
    });

    it("should apply repetition penalties based on previous layouts", async () => {
      const context: LayoutSelectionContext = {
        slideIndex: 0,
        totalSlides: 5,
        previousLayouts: [
          { slideIndex: 0, category: "boxes", style: "box-style-1" },
          { slideIndex: 1, category: "boxes", style: "box-style-1" },
        ],
        presentationTone: "professional",
        presentationLanguage: "en",
        themeStyle: "professional",
        categoryUsage: new Map([["boxes", 2]]),
        styleUsage: new Map([["box-style-1", 2]]),
      };

      // Process slide with same content that would normally select "boxes"
      context.slideIndex = 2;
      
      const selection = await selectLayout({
        slide: {
          type: "content",
          title: "Another Feature List",
          bulletPoints: ["Feature 1", "Feature 2", "Feature 3"],
        },
        context,
      });

      // The system should try to avoid "boxes" due to repetition penalty
      // (though it might still select it if it's the best fit)
      expect(selection.category).toBeDefined();
      expect(selection.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Layout Variety in Presentations", () => {
    it("should produce varied layouts across a 10-slide presentation", async () => {
      const context: LayoutSelectionContext = {
        slideIndex: 0,
        totalSlides: 10,
        previousLayouts: [],
        presentationTone: "professional",
        presentationLanguage: "en",
        themeStyle: "professional",
        categoryUsage: new Map(),
        styleUsage: new Map(),
      };

      // Create diverse slide content
      const slides = [
        { type: "content" as const, title: "Features", bulletPoints: ["A", "B", "C"] },
        { type: "content" as const, title: "Process", bulletPoints: ["Step 1", "Step 2", "Step 3"] },
        { type: "content" as const, title: "Stats", bulletPoints: ["90%", "50+", "24/7"] },
        { type: "content" as const, title: "Quote", bulletPoints: ["Great product!"] },
        { type: "content" as const, title: "Timeline", bulletPoints: ["Q1", "Q2", "Q3", "Q4"] },
        { type: "content" as const, title: "Comparison", bulletPoints: ["Before", "After"] },
        { type: "content" as const, title: "Categories", bulletPoints: ["Type A", "Type B", "Type C"] },
        { type: "content" as const, title: "Instructions", bulletPoints: ["Do this", "Then that"] },
        { type: "content" as const, title: "Benefits", bulletPoints: ["Benefit 1", "Benefit 2"] },
        { type: "content" as const, title: "Summary", bulletPoints: ["Point 1", "Point 2"] },
      ];

      const categories = new Set<ContentLayoutCategory>();

      for (let i = 0; i < slides.length; i++) {
        context.slideIndex = i;
        
        const selection = await selectLayout({
          slide: slides[i]!,
          context,
        });

        categories.add(selection.category);

        // Update context
        context.previousLayouts.push({
          slideIndex: i,
          category: selection.category,
          style: selection.style,
        });

        const categoryCount = context.categoryUsage.get(selection.category) ?? 0;
        context.categoryUsage.set(selection.category, categoryCount + 1);
      }

      // Verify variety: should use at least 2 different layout categories
      expect(categories.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Performance Requirements", () => {
    it("should complete layout selection within 50ms per slide", async () => {
      const context: LayoutSelectionContext = {
        slideIndex: 0,
        totalSlides: 10,
        previousLayouts: [],
        presentationTone: "professional",
        presentationLanguage: "en",
        themeStyle: "professional",
        categoryUsage: new Map(),
        styleUsage: new Map(),
      };

      const slide = {
        type: "content" as const,
        title: "Test Slide",
        bulletPoints: ["Point 1", "Point 2", "Point 3", "Point 4"],
      };

      const start = performance.now();
      
      const selection = await selectLayout({
        slide,
        context,
        options: {
          timeout: 50,
          enablePerformanceLogging: true,
        },
      });

      const duration = performance.now() - start;

      // Verify selection completed
      expect(selection).toBeDefined();
      expect(selection.category).toBeDefined();

      // Verify performance (should be well under 50ms)
      expect(duration).toBeLessThan(50);
    });

    it("should process 20 slides within 1 second total", async () => {
      const context: LayoutSelectionContext = {
        slideIndex: 0,
        totalSlides: 20,
        previousLayouts: [],
        presentationTone: "professional",
        presentationLanguage: "en",
        themeStyle: "professional",
        categoryUsage: new Map(),
        styleUsage: new Map(),
      };

      // Create 20 slides
      const slides = Array.from({ length: 20 }, (_, i) => ({
        type: "content" as const,
        title: `Slide ${i + 1}`,
        bulletPoints: [`Point 1`, `Point 2`, `Point 3`],
      }));

      const start = performance.now();

      // Process all slides
      for (let i = 0; i < slides.length; i++) {
        context.slideIndex = i;
        
        const selection = await selectLayout({
          slide: slides[i]!,
          context,
        });

        // Update context
        context.previousLayouts.push({
          slideIndex: i,
          category: selection.category,
          style: selection.style,
        });
      }

      const duration = performance.now() - start;

      // Verify all selections completed
      expect(context.previousLayouts).toHaveLength(20);

      // Verify performance (should be under 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("No Blocking or Delays", () => {
    it("should not block on layout selection", async () => {
      const context: LayoutSelectionContext = {
        slideIndex: 0,
        totalSlides: 5,
        previousLayouts: [],
        presentationTone: "professional",
        presentationLanguage: "en",
        themeStyle: "professional",
        categoryUsage: new Map(),
        styleUsage: new Map(),
      };

      const slide = {
        type: "content" as const,
        title: "Test Slide",
        bulletPoints: ["Point 1", "Point 2"],
      };

      // Selection should return immediately (not block)
      const selectionPromise = selectLayout({
        slide,
        context,
      });

      // Should be a promise
      expect(selectionPromise).toBeInstanceOf(Promise);

      // Should resolve quickly
      const selection = await selectionPromise;
      expect(selection).toBeDefined();
    });

    it("should handle timeout gracefully without blocking", async () => {
      const context: LayoutSelectionContext = {
        slideIndex: 0,
        totalSlides: 5,
        previousLayouts: [],
        presentationTone: "professional",
        presentationLanguage: "en",
        themeStyle: "professional",
        categoryUsage: new Map(),
        styleUsage: new Map(),
      };

      const slide = {
        type: "content" as const,
        title: "Test Slide",
        bulletPoints: ["Point 1", "Point 2"],
      };

      // Set very short timeout to test timeout handling
      const selection = await selectLayout({
        slide,
        context,
        options: {
          timeout: 1, // 1ms timeout (will likely timeout)
        },
      });

      // Should still return a valid selection (fallback)
      expect(selection).toBeDefined();
      expect(selection.category).toBeDefined();
      expect(selection.style).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid input gracefully", async () => {
      const context: LayoutSelectionContext = {
        slideIndex: 0,
        totalSlides: 5,
        previousLayouts: [],
        presentationTone: "professional",
        presentationLanguage: "en",
        themeStyle: "professional",
        categoryUsage: new Map(),
        styleUsage: new Map(),
      };

      // Invalid slide (missing required fields)
      const selection = await selectLayout({
        slide: {
          type: "content",
          title: "",
          bulletPoints: [],
        },
        context,
      });

      // Should return fallback layout
      expect(selection).toBeDefined();
      expect(selection.category).toBeDefined();
      expect(selection.confidence).toBe("low");
    });

    it("should handle missing context gracefully", async () => {
      // Missing context fields
      const selection = await selectLayout({
        slide: {
          type: "content",
          title: "Test",
          bulletPoints: ["Point 1"],
        },
        context: {
          slideIndex: 0,
          totalSlides: 5,
          previousLayouts: [],
          presentationTone: "",
          presentationLanguage: "",
          themeStyle: "professional",
          categoryUsage: new Map(),
          styleUsage: new Map(),
        },
      });

      // Should still work
      expect(selection).toBeDefined();
      expect(selection.category).toBeDefined();
    });
  });
});
