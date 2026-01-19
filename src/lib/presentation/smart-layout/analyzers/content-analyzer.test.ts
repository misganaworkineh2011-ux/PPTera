/**
 * Property-Based Tests for Content Analyzer
 * 
 * Feature: smart-layout-selection, Property 2: Content Analysis Completeness
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { analyzeContent, analyzeSlideContent } from "./content-analyzer";
import { BulletPattern, ContentType, SemanticMarkers } from "../types";

describe("Content Analyzer - Property Tests", () => {
  /**
   * Property 2: Content Analysis Completeness
   * 
   * For any slide content (title + bullets), the content analyzer must:
   * 1. Return a complete ContentAnalysis object with all required fields
   * 2. All metrics must be non-negative numbers
   * 3. Pattern must be a valid BulletPattern enum value
   * 4. ContentType must be a valid ContentType enum value
   * 5. SemanticMarkers must be an array of valid SemanticMarkers enum values
   * 6. Confidence must be between 0-100
   * 7. Structural flags must be boolean values
   * 8. Never throw an exception
   */
  it("should always return complete content analysis for any slide content", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary slide content
        fc.record({
          title: fc.string(),
          bullets: fc.array(fc.string(), { minLength: 0, maxLength: 20 }),
        }),
        (slide) => {
          // Execute content analysis
          const result = analyzeContent(slide.title, slide.bullets);

          // Verify completeness: all required fields present
          expect(result).toBeDefined();
          expect(result.pattern).toBeDefined();
          expect(result.semanticMarkers).toBeDefined();
          expect(result.contentType).toBeDefined();
          expect(result.contentTypeConfidence).toBeDefined();
          expect(result.bulletCount).toBeDefined();
          expect(result.avgBulletLength).toBeDefined();
          expect(result.maxBulletLength).toBeDefined();
          expect(result.totalWordCount).toBeDefined();
          expect(result.hasSequence).toBeDefined();
          expect(result.hasDistinctConcepts).toBeDefined();
          expect(result.hasHierarchy).toBeDefined();

          // Verify pattern is a valid enum value
          const validPatterns = Object.values(BulletPattern);
          expect(validPatterns).toContain(result.pattern);

          // Verify content type is a valid enum value
          const validContentTypes = Object.values(ContentType);
          expect(validContentTypes).toContain(result.contentType);

          // Verify semantic markers are valid enum values
          expect(Array.isArray(result.semanticMarkers)).toBe(true);
          const validMarkers = Object.values(SemanticMarkers);
          result.semanticMarkers.forEach((marker) => {
            expect(validMarkers).toContain(marker);
          });

          // Verify metrics are non-negative
          expect(result.bulletCount).toBeGreaterThanOrEqual(0);
          expect(result.avgBulletLength).toBeGreaterThanOrEqual(0);
          expect(result.maxBulletLength).toBeGreaterThanOrEqual(0);
          expect(result.totalWordCount).toBeGreaterThanOrEqual(0);

          // Verify confidence is in valid range [0, 100]
          expect(result.contentTypeConfidence).toBeGreaterThanOrEqual(0);
          expect(result.contentTypeConfidence).toBeLessThanOrEqual(100);

          // Verify structural flags are boolean
          expect(typeof result.hasSequence).toBe("boolean");
          expect(typeof result.hasDistinctConcepts).toBe("boolean");
          expect(typeof result.hasHierarchy).toBe("boolean");

          // Verify bullet count matches input
          expect(result.bulletCount).toBe(slide.bullets.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty input handling
   * 
   * For empty slide content, should return valid analysis with zero metrics
   */
  it("should handle empty slide content gracefully", () => {
    fc.assert(
      fc.property(
        fc.constant({ title: "", bullets: [] }),
        (slide) => {
          const result = analyzeContent(slide.title, slide.bullets);

          expect(result.pattern).toBe(BulletPattern.SIMPLE_LIST);
          expect(result.contentType).toBe(ContentType.GENERIC);
          expect(result.contentTypeConfidence).toBe(100);
          expect(result.bulletCount).toBe(0);
          expect(result.avgBulletLength).toBe(0);
          expect(result.maxBulletLength).toBe(0);
          expect(result.totalWordCount).toBe(0);
          expect(result.semanticMarkers).toEqual([]);
          expect(result.hasSequence).toBe(false);
          expect(result.hasDistinctConcepts).toBe(false);
          expect(result.hasHierarchy).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property: Bullet count accuracy
   * 
   * For any slide, bulletCount should match the number of bullets provided
   */
  it("should accurately count bullets", () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string(),
          bullets: fc.array(fc.string(), { minLength: 0, maxLength: 20 }),
        }),
        (slide) => {
          const result = analyzeContent(slide.title, slide.bullets);
          expect(result.bulletCount).toBe(slide.bullets.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Deterministic behavior
   * 
   * Same input should always produce same output
   */
  it("should produce deterministic results for the same input", () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string(),
          bullets: fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
        }),
        (slide) => {
          const result1 = analyzeContent(slide.title, slide.bullets);
          const result2 = analyzeContent(slide.title, slide.bullets);

          // All fields should be identical
          expect(result1.pattern).toBe(result2.pattern);
          expect(result1.contentType).toBe(result2.contentType);
          expect(result1.contentTypeConfidence).toBe(result2.contentTypeConfidence);
          expect(result1.bulletCount).toBe(result2.bulletCount);
          expect(result1.avgBulletLength).toBe(result2.avgBulletLength);
          expect(result1.maxBulletLength).toBe(result2.maxBulletLength);
          expect(result1.totalWordCount).toBe(result2.totalWordCount);
          expect(result1.hasSequence).toBe(result2.hasSequence);
          expect(result1.hasDistinctConcepts).toBe(result2.hasDistinctConcepts);
          expect(result1.hasHierarchy).toBe(result2.hasHierarchy);
          expect(result1.semanticMarkers).toEqual(result2.semanticMarkers);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Timeline content detection
   * 
   * For content with timeline keywords, should detect timeline-related markers
   */
  it("should detect timeline content", () => {
    const timelineSlides = [
      {
        title: "Company History Timeline",
        bullets: [
          "Founded in 2010",
          "Expanded to Europe in 2015",
          "Reached 1M users in 2020",
          "IPO in 2023",
        ],
      },
      {
        title: "Evolution of Technology",
        bullets: [
          "Early era: 1990-2000",
          "Modern period: 2000-2010",
          "Current decade: 2010-2020",
        ],
      },
    ];

    timelineSlides.forEach((slide) => {
      const result = analyzeContent(slide.title, slide.bullets);

      // Should detect timeline content type or have timeline semantic marker
      const isTimelineRelated =
        result.contentType === ContentType.TIMELINE ||
        result.semanticMarkers.includes(SemanticMarkers.TIMELINE);

      expect(isTimelineRelated).toBe(true);
    });
  });

  /**
   * Property: Process content detection
   * 
   * For content with process keywords, should detect process-related markers
   */
  it("should detect process content", () => {
    const processSlides = [
      {
        title: "Our Workflow Process",
        bullets: [
          "First, gather requirements",
          "Then, design the solution",
          "Next, implement the features",
          "Finally, test and deploy",
        ],
      },
      {
        title: "Development Methodology",
        bullets: [
          "Planning phase",
          "Development phase",
          "Testing phase",
          "Deployment phase",
        ],
      },
    ];

    processSlides.forEach((slide) => {
      const result = analyzeContent(slide.title, slide.bullets);

      // Should detect process content type or have process/steps semantic marker
      const isProcessRelated =
        result.contentType === ContentType.PROCESS ||
        result.contentType === ContentType.STEPS ||
        result.contentType === ContentType.HOW_TO ||
        result.semanticMarkers.includes(SemanticMarkers.PROCESS) ||
        result.semanticMarkers.includes(SemanticMarkers.STEPS);

      expect(isProcessRelated).toBe(true);
    });
  });

  /**
   * Property: Statistics content detection
   * 
   * For content with numeric data, should detect statistics-related markers
   */
  it("should detect statistics content", () => {
    const statsSlides = [
      {
        title: "Key Metrics and Statistics",
        bullets: [
          "Revenue grew by 150%",
          "Customer satisfaction: 95%",
          "$10M in annual sales",
          "50,000+ active users",
        ],
      },
      {
        title: "Survey Results",
        bullets: [
          "80% prefer option A",
          "15% prefer option B",
          "5% have no preference",
        ],
      },
    ];

    statsSlides.forEach((slide) => {
      const result = analyzeContent(slide.title, slide.bullets);

      // Should detect statistics content type or have statistics semantic marker
      const isStatsRelated =
        result.contentType === ContentType.STATISTICS ||
        result.semanticMarkers.includes(SemanticMarkers.STATISTICS) ||
        result.pattern === BulletPattern.NUMERIC;

      expect(isStatsRelated).toBe(true);
    });
  });

  /**
   * Property: Features content detection
   * 
   * For content describing features, should detect feature-related markers
   */
  it("should detect features content", () => {
    const featureSlides = [
      {
        title: "Product Features",
        bullets: [
          "Real-time collaboration feature",
          "Advanced analytics capability",
          "Secure encryption feature",
          "Mobile support functionality",
        ],
      },
      {
        title: "Key Benefits and Features",
        bullets: [
          "Feature: Saves time and money",
          "Benefit: Improves productivity",
          "Advantage: Enhances security",
        ],
      },
    ];

    featureSlides.forEach((slide) => {
      const result = analyzeContent(slide.title, slide.bullets);

      // Should detect features content type or have features semantic marker
      const isFeaturesRelated =
        result.contentType === ContentType.FEATURES ||
        result.semanticMarkers.includes(SemanticMarkers.FEATURES);

      expect(isFeaturesRelated).toBe(true);
    });
  });

  /**
   * Property: Convenience function consistency
   * 
   * analyzeSlideContent should produce same results as analyzeContent
   */
  it("should have consistent results between analyzeContent and analyzeSlideContent", () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string(),
          bulletPoints: fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
        }),
        (slide) => {
          const result1 = analyzeContent(slide.title, slide.bulletPoints);
          const result2 = analyzeSlideContent(slide);

          // Results should be identical
          expect(result1).toEqual(result2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Sequence detection
   * 
   * For numbered or sequential content, hasSequence should be true
   */
  it("should detect sequence in numbered content", () => {
    const sequentialSlides = [
      {
        title: "Steps to Success",
        bullets: [
          "1. Define your goals",
          "2. Create a plan",
          "3. Execute the plan",
          "4. Measure results",
        ],
      },
      {
        title: "Installation Guide",
        bullets: [
          "First, download the software",
          "Then, run the installer",
          "Next, configure settings",
          "Finally, restart your computer",
        ],
      },
    ];

    sequentialSlides.forEach((slide) => {
      const result = analyzeContent(slide.title, slide.bullets);
      expect(result.hasSequence).toBe(true);
    });
  });

  /**
   * Property: Distinct concepts detection
   * 
   * For short, distinct bullets, hasDistinctConcepts should be true
   */
  it("should detect distinct concepts in short bullet lists", () => {
    const distinctSlides = [
      {
        title: "Core Values",
        bullets: [
          "Innovation",
          "Integrity",
          "Excellence",
          "Collaboration",
        ],
      },
      {
        title: "Product Categories",
        bullets: [
          "Software",
          "Hardware",
          "Services",
        ],
      },
    ];

    distinctSlides.forEach((slide) => {
      const result = analyzeContent(slide.title, slide.bullets);
      expect(result.hasDistinctConcepts).toBe(true);
    });
  });
});
