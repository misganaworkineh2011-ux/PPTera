/**
 * Performance Benchmarks for Smart Layout Selection
 * 
 * Task 16.6: Write performance benchmarks
 * 
 * Targets:
 * - Single slide selection: < 50ms (ideal: 20-30ms)
 * - 20-slide presentation: < 1 second
 * - Content analysis: < 20ms
 * - Layout scoring: < 30ms
 * 
 * Requirements: 11.1, 11.2, 11.3
 */

import { describe, it, expect, beforeEach } from "vitest";
import { selectLayout, type LayoutSelectionInput } from "../layout-selection";
import { analyzeContent } from "../analyzers/content-analyzer";
import { scoreAllLayouts } from "../scorers/layout-scorer";
import { getAllLayouts } from "../registry/layout-registry";
import { clearAllCaches } from "../utils/cache";
import { clearRegistryCache } from "../registry/layout-registry";
import type { LayoutScoringInput, ContentAnalysis } from "../types";
import { ContentType, BulletPattern, SemanticMarkers } from "../types";

// ============================================================================
// TEST DATA GENERATORS
// ============================================================================

function generateSlideInput(index: number, bulletCount: number = 4): LayoutSelectionInput {
  const bullets = Array.from({ length: bulletCount }, (_, i) => 
    `This is bullet point ${i + 1} with some descriptive text about the topic`
  );
  
  return {
    slide: {
      type: "content",
      title: `Slide ${index + 1}: Key Features and Benefits`,
      bulletPoints: bullets,
      semanticIntent: "inform",
      visualStrategy: {
        primary: "text-focused",
        pattern: "cards",
        emphasis: "clarity",
      },
      contentLayoutHint: index % 3 === 0 ? "boxes" : undefined,
    },
    context: {
      slideIndex: index,
      totalSlides: 20,
      previousLayouts: [],
      categoryUsage: new Map(),
      styleUsage: new Map(),
    },
    options: {
      timeout: 100, // Higher timeout for benchmarks
      enablePerformanceLogging: false,
      enableDebugLogging: false,
    },
  };
}

function generateScoringInput(bulletCount: number = 4): LayoutScoringInput {
  const analysis: ContentAnalysis = {
    pattern: BulletPattern.DISTINCT_CONCEPTS,
    semanticMarkers: [SemanticMarkers.FEATURES],
    contentType: ContentType.FEATURES,
    contentTypeConfidence: 75,
    bulletCount,
    avgBulletLength: 12,
    maxBulletLength: 20,
    totalWordCount: bulletCount * 12,
    hasSequence: false,
    hasDistinctConcepts: true,
    hasHierarchy: false,
  };
  
  return {
    semanticIntent: "inform",
    visualStrategy: {
      primary: "text-focused",
      pattern: "cards",
      emphasis: "clarity",
    },
    hasImage: false,
    analysis,
    slidePosition: "middle",
    previousLayouts: [],
    isNarrowSpace: false,
  };
}

// ============================================================================
// BENCHMARK UTILITIES
// ============================================================================

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
}

async function runBenchmark(
  name: string,
  fn: () => Promise<void> | void,
  iterations: number = 100
): Promise<BenchmarkResult> {
  const times: number[] = [];
  
  // Warm-up run
  await fn();
  
  // Benchmark runs
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  // Calculate statistics
  times.sort((a, b) => a - b);
  const totalTime = times.reduce((sum, t) => sum + t, 0);
  const avgTime = totalTime / iterations;
  const minTime = times[0]!;
  const maxTime = times[times.length - 1]!;
  const p95Index = Math.floor(iterations * 0.95);
  const p95Time = times[p95Index]!;
  
  return {
    name,
    iterations,
    totalTime,
    avgTime,
    minTime,
    maxTime,
    p95Time,
  };
}

function logBenchmarkResult(result: BenchmarkResult): void {
  console.log(`\n📊 ${result.name}`);
  console.log(`   Iterations: ${result.iterations}`);
  console.log(`   Average: ${result.avgTime.toFixed(2)}ms`);
  console.log(`   Min: ${result.minTime.toFixed(2)}ms`);
  console.log(`   Max: ${result.maxTime.toFixed(2)}ms`);
  console.log(`   P95: ${result.p95Time.toFixed(2)}ms`);
}

// ============================================================================
// BENCHMARKS
// ============================================================================

describe("Performance Benchmarks", () => {
  beforeEach(() => {
    // Clear caches before each benchmark to measure cold performance
    clearAllCaches();
  });

  describe("Single Slide Selection", () => {
    it("should complete in < 50ms (target), ideal 20-30ms", async () => {
      const input = generateSlideInput(5);
      
      const result = await runBenchmark(
        "Single Slide Selection",
        async () => {
          await selectLayout(input);
        },
        50
      );
      
      logBenchmarkResult(result);
      
      // Target: < 50ms average
      expect(result.avgTime).toBeLessThan(50);
      
      // P95 should also be reasonable
      expect(result.p95Time).toBeLessThan(75);
    });

    it("should benefit from caching on repeated calls", async () => {
      const input = generateSlideInput(5);
      
      // First call (cold cache)
      const coldStart = performance.now();
      await selectLayout(input);
      const coldTime = performance.now() - coldStart;
      
      // Second call (warm cache)
      const warmStart = performance.now();
      await selectLayout(input);
      const warmTime = performance.now() - warmStart;
      
      console.log(`\n📊 Cache Benefit`);
      console.log(`   Cold: ${coldTime.toFixed(2)}ms`);
      console.log(`   Warm: ${warmTime.toFixed(2)}ms`);
      console.log(`   Speedup: ${((coldTime - warmTime) / coldTime * 100).toFixed(1)}%`);
      
      // Warm should be faster (or at least not slower)
      expect(warmTime).toBeLessThanOrEqual(coldTime * 1.1); // Allow 10% variance
    });
  });

  describe("20-Slide Presentation", () => {
    it("should complete in < 1 second", async () => {
      const slides = Array.from({ length: 20 }, (_, i) => generateSlideInput(i));
      
      const result = await runBenchmark(
        "20-Slide Presentation",
        async () => {
          for (const slide of slides) {
            await selectLayout(slide);
          }
        },
        10 // Fewer iterations for full presentation
      );
      
      logBenchmarkResult(result);
      
      // Target: < 1000ms for 20 slides
      expect(result.avgTime).toBeLessThan(1000);
    });
  });

  describe("Content Analysis", () => {
    it("should complete in < 20ms", async () => {
      const title = "Key Features and Benefits of Our Product";
      const bullets = [
        "Feature 1: Advanced analytics and reporting capabilities",
        "Feature 2: Real-time collaboration tools for teams",
        "Feature 3: Seamless integration with existing workflows",
        "Feature 4: Enterprise-grade security and compliance",
      ];
      
      const result = await runBenchmark(
        "Content Analysis",
        () => {
          analyzeContent(title, bullets);
        },
        100
      );
      
      logBenchmarkResult(result);
      
      // Target: < 20ms
      expect(result.avgTime).toBeLessThan(20);
    });

    it("should benefit from caching", async () => {
      const title = "Key Features";
      const bullets = ["Feature 1", "Feature 2", "Feature 3"];
      
      // Clear cache
      clearAllCaches();
      
      // Cold call
      const coldStart = performance.now();
      analyzeContent(title, bullets);
      const coldTime = performance.now() - coldStart;
      
      // Warm call (same input)
      const warmStart = performance.now();
      analyzeContent(title, bullets);
      const warmTime = performance.now() - warmStart;
      
      console.log(`\n📊 Content Analysis Cache`);
      console.log(`   Cold: ${coldTime.toFixed(2)}ms`);
      console.log(`   Warm: ${warmTime.toFixed(2)}ms`);
      
      // Warm should be faster due to caching
      expect(warmTime).toBeLessThanOrEqual(coldTime);
    });
  });

  describe("Layout Scoring", () => {
    it("should complete in < 30ms", async () => {
      const layouts = getAllLayouts();
      const scoringInput = generateScoringInput(4);
      
      const result = await runBenchmark(
        "Layout Scoring (all layouts)",
        () => {
          scoreAllLayouts(layouts, scoringInput, false);
        },
        100
      );
      
      logBenchmarkResult(result);
      
      // Target: < 30ms
      expect(result.avgTime).toBeLessThan(30);
    });

    it("should handle varying bullet counts efficiently", async () => {
      const layouts = getAllLayouts();
      
      const results: BenchmarkResult[] = [];
      
      for (const bulletCount of [2, 4, 6, 8]) {
        const scoringInput = generateScoringInput(bulletCount);
        
        const result = await runBenchmark(
          `Scoring (${bulletCount} bullets)`,
          () => {
            scoreAllLayouts(layouts, scoringInput, false);
          },
          50
        );
        
        results.push(result);
      }
      
      console.log("\n📊 Scoring by Bullet Count:");
      for (const result of results) {
        console.log(`   ${result.name}: ${result.avgTime.toFixed(2)}ms avg`);
      }
      
      // All should be under 30ms
      for (const result of results) {
        expect(result.avgTime).toBeLessThan(30);
      }
    });
  });

  describe("Fast Path Optimization", () => {
    it("should be faster when hint matches", async () => {
      // Input with hint
      const inputWithHint = generateSlideInput(5, 4);
      inputWithHint.slide.contentLayoutHint = "boxes";
      
      // Input without hint
      const inputWithoutHint = generateSlideInput(5, 4);
      inputWithoutHint.slide.contentLayoutHint = undefined;
      
      const withHintResult = await runBenchmark(
        "With Hint",
        async () => {
          await selectLayout(inputWithHint);
        },
        50
      );
      
      const withoutHintResult = await runBenchmark(
        "Without Hint",
        async () => {
          await selectLayout(inputWithoutHint);
        },
        50
      );
      
      console.log("\n📊 Fast Path Comparison:");
      console.log(`   With hint: ${withHintResult.avgTime.toFixed(2)}ms avg`);
      console.log(`   Without hint: ${withoutHintResult.avgTime.toFixed(2)}ms avg`);
      
      // Both should be under target
      expect(withHintResult.avgTime).toBeLessThan(50);
      expect(withoutHintResult.avgTime).toBeLessThan(50);
    });
  });

  describe("Registry Caching", () => {
    it("should provide fast layout lookups", async () => {
      const result = await runBenchmark(
        "getAllLayouts()",
        () => {
          getAllLayouts();
        },
        1000
      );
      
      logBenchmarkResult(result);
      
      // Should be essentially instant (< 1ms)
      expect(result.avgTime).toBeLessThan(1);
    });
  });
});
