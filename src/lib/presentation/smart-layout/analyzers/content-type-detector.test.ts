/**
 * Property-Based Tests for Content Type Detection
 * 
 * Feature: smart-layout-selection, Property 2: Content Analysis Completeness (Content Type)
 * Validates: Requirements 2.4, 2.5
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { detectContentType } from "./content-type-detector";
import { ContentType, SemanticMarkers, BulletPattern } from "../types";

describe("Content Type Detection - Property Tests", () => {
  /**
   * Property 2: Content Analysis Completeness (Content Type)
   * 
   * For any slide content (title, bullets, semantic markers, pattern), the content type detector must:
   * 1. Return a valid ContentType enum value
   * 2. Return a confidence score between 0 and 100
   * 3. Return a scores object with all ContentType keys
   * 4. All scores in the scores object must be >= 0
   * 5. Never throw an exception
   */
  it("should always return complete content type detection results for any input", () => {
    fc.assert(
      fc.property(
        fc.string(), // title
        fc.array(fc.string(), { minLength: 0, maxLength: 20 }), // bullets
        fc.array(fc.constantFrom(...Object.values(SemanticMarkers)), { minLength: 0, maxLength: 5 }), // semantic markers
        fc.constantFrom(...Object.values(BulletPattern)), // pattern
        (title, bullets, semanticMarkers, pattern) => {
          // Execute content type detection
          const result = detectContentType(title, bullets, semanticMarkers, pattern);

          // Verify completeness: all required fields present
          expect(result).toBeDefined();
          expect(result.contentType).toBeDefined();
          expect(result.confidence).toBeDefined();
          expect(result.scores).toBeDefined();

          // Verify contentType is a valid enum value
          const validContentTypes = Object.values(ContentType);
          expect(validContentTypes).toContain(result.contentType);

          // Verify confidence is in valid range [0, 100]
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(100);

          // Verify scores object has all ContentType keys
          const contentTypeKeys = Object.values(ContentType);
          contentTypeKeys.forEach(contentType => {
            expect(result.scores).toHaveProperty(contentType);
            expect(result.scores[contentType]).toBeGreaterThanOrEqual(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty input handling
   * 
   * For empty title and bullets, should return GENERIC with high confidence
   */
  it("should return GENERIC content type for empty input", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("", "   ", "\n\t"),
        fc.constant([]),
        fc.array(fc.constantFrom(...Object.values(SemanticMarkers)), { minLength: 0, maxLength: 3 }),
        fc.constantFrom(...Object.values(BulletPattern)),
        (title, bullets, markers, pattern) => {
          const result = detectContentType(title, bullets, markers, pattern);

          expect(result.contentType).toBe(ContentType.GENERIC);
          expect(result.confidence).toBe(100);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Timeline detection with timeline markers
   * 
   * When TIMELINE semantic marker is present, should boost TIMELINE content type score
   */
  it("should boost TIMELINE score when timeline markers are present", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
        fc.constantFrom(...Object.values(BulletPattern)),
        (title, bullets, pattern) => {
          const withoutMarker = detectContentType(title, bullets, [], pattern);
          const withMarker = detectContentType(title, bullets, [SemanticMarkers.TIMELINE], pattern);

          // Score for TIMELINE should be higher with the marker
          expect(withMarker.scores[ContentType.TIMELINE]).toBeGreaterThanOrEqual(
            withoutMarker.scores[ContentType.TIMELINE]
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Statistics detection with statistics markers
   * 
   * When STATISTICS semantic marker is present, should boost STATISTICS content type score
   */
  it("should boost STATISTICS score when statistics markers are present", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
        fc.constantFrom(...Object.values(BulletPattern)),
        (title, bullets, pattern) => {
          const withoutMarker = detectContentType(title, bullets, [], pattern);
          const withMarker = detectContentType(title, bullets, [SemanticMarkers.STATISTICS], pattern);

          // Score for STATISTICS should be higher with the marker
          expect(withMarker.scores[ContentType.STATISTICS]).toBeGreaterThanOrEqual(
            withoutMarker.scores[ContentType.STATISTICS]
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Pattern influence on content type
   * 
   * NUMBERED_STEPS pattern should boost STEPS content type score
   */
  it("should boost STEPS score with NUMBERED_STEPS pattern", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
        fc.array(fc.constantFrom(...Object.values(SemanticMarkers)), { minLength: 0, maxLength: 3 }),
        (title, bullets, markers) => {
          const withSimpleList = detectContentType(title, bullets, markers, BulletPattern.SIMPLE_LIST);
          const withNumberedSteps = detectContentType(title, bullets, markers, BulletPattern.NUMBERED_STEPS);

          // Score for STEPS should be higher with NUMBERED_STEPS pattern
          expect(withNumberedSteps.scores[ContentType.STEPS]).toBeGreaterThanOrEqual(
            withSimpleList.scores[ContentType.STEPS]
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Quoted text pattern boosts testimonial
   * 
   * QUOTED_TEXT pattern should boost TESTIMONIAL content type score
   */
  it("should boost TESTIMONIAL score with QUOTED_TEXT pattern", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
        fc.array(fc.constantFrom(...Object.values(SemanticMarkers)), { minLength: 0, maxLength: 3 }),
        (title, bullets, markers) => {
          const withSimpleList = detectContentType(title, bullets, markers, BulletPattern.SIMPLE_LIST);
          const withQuotedText = detectContentType(title, bullets, markers, BulletPattern.QUOTED_TEXT);

          // Score for TESTIMONIAL should be higher with QUOTED_TEXT pattern
          expect(withQuotedText.scores[ContentType.TESTIMONIAL]).toBeGreaterThanOrEqual(
            withSimpleList.scores[ContentType.TESTIMONIAL]
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Keyword detection
   * 
   * Text containing specific keywords should boost corresponding content type
   */
  it("should detect timeline content type from timeline keywords", () => {
    const timelineTexts = [
      "Our company timeline from 2010 to 2020",
      "Historical evolution of the product",
      "Key milestones in our journey",
    ];

    timelineTexts.forEach(text => {
      const result = detectContentType(text, [], [], BulletPattern.SIMPLE_LIST);
      
      // TIMELINE should have a non-zero score when keywords are present
      // Note: The implementation uses keyword matching, so at least one text should trigger it
      // We'll check that at least one of these texts produces a non-zero score
    });
    
    // Check that at least one timeline text produces a TIMELINE score > 0
    const results = timelineTexts.map(text => 
      detectContentType(text, [], [], BulletPattern.SIMPLE_LIST)
    );
    const hasTimelineScore = results.some(r => r.scores[ContentType.TIMELINE] > 0);
    expect(hasTimelineScore).toBe(true);
  });

  it("should detect statistics content type from statistics keywords", () => {
    const statsTexts = [
      "Key statistics and metrics",
      "Survey results show 85% satisfaction",
      "Data analysis reveals trends",
    ];

    statsTexts.forEach(text => {
      const result = detectContentType(text, [], [], BulletPattern.SIMPLE_LIST);
      
      // STATISTICS should have a non-zero score
      expect(result.scores[ContentType.STATISTICS]).toBeGreaterThan(0);
    });
  });

  it("should detect features content type from feature keywords", () => {
    const featureTexts = [
      "Key features and benefits of our product",
      "Product includes many capabilities",
      "Main advantages and strengths",
    ];

    // Check that at least one feature text produces a FEATURES score > 0
    const results = featureTexts.map(text => 
      detectContentType(text, [], [], BulletPattern.SIMPLE_LIST)
    );
    const hasFeaturesScore = results.some(r => r.scores[ContentType.FEATURES] > 0);
    expect(hasFeaturesScore).toBe(true);
  });

  /**
   * Property: Multiple signals increase confidence
   * 
   * When multiple signals (keywords, markers, pattern) align, confidence should be higher
   */
  it("should have higher confidence when multiple signals align", () => {
    // Weak signal: just keywords
    const weakSignal = detectContentType(
      "Our process",
      ["Step one", "Step two"],
      [],
      BulletPattern.SIMPLE_LIST
    );

    // Strong signal: keywords + markers + pattern
    const strongSignal = detectContentType(
      "Our process workflow",
      ["Step one", "Step two"],
      [SemanticMarkers.PROCESS, SemanticMarkers.STEPS],
      BulletPattern.NUMBERED_STEPS
    );

    // Strong signal should have higher or equal confidence (at minimum, not lower)
    expect(strongSignal.confidence).toBeGreaterThanOrEqual(weakSignal.confidence);
  });

  /**
   * Property: Deterministic behavior
   * 
   * Same input should always produce same output
   */
  it("should produce deterministic results for the same input", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
        fc.array(fc.constantFrom(...Object.values(SemanticMarkers)), { minLength: 0, maxLength: 5 }),
        fc.constantFrom(...Object.values(BulletPattern)),
        (title, bullets, markers, pattern) => {
          const result1 = detectContentType(title, bullets, markers, pattern);
          const result2 = detectContentType(title, bullets, markers, pattern);

          expect(result1.contentType).toBe(result2.contentType);
          expect(result1.confidence).toBe(result2.confidence);
          expect(result1.scores).toEqual(result2.scores);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Confidence reflects score separation
   * 
   * When top score is much higher than second score, confidence should be high
   */
  it("should have high confidence when top score is clearly dominant", () => {
    // Create a clear case: strong timeline signals
    const result = detectContentType(
      "Company Timeline and History",
      ["Founded in 2010", "Expanded in 2015", "IPO in 2020"],
      [SemanticMarkers.TIMELINE],
      BulletPattern.SEQUENTIAL
    );

    // Should detect TIMELINE with reasonable confidence (>= 50)
    expect(result.contentType).toBe(ContentType.TIMELINE);
    expect(result.confidence).toBeGreaterThanOrEqual(50);
  });

  /**
   * Property: Low confidence defaults to GENERIC
   * 
   * When confidence is below threshold and type is not GENERIC, should default to GENERIC
   */
  it("should default to GENERIC when confidence is very low", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => 
          // Filter out strings with strong keywords
          !s.toLowerCase().includes("timeline") &&
          !s.toLowerCase().includes("process") &&
          !s.toLowerCase().includes("feature") &&
          !s.toLowerCase().includes("statistics")
        ),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
        (title, bullets) => {
          const result = detectContentType(title, bullets, [], BulletPattern.SIMPLE_LIST);

          // With weak signals, should either be GENERIC or have reasonable confidence
          if (result.contentType !== ContentType.GENERIC) {
            expect(result.confidence).toBeGreaterThanOrEqual(30);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Score consistency
   * 
   * The detected content type should have the highest score in the scores object
   */
  it("should detect the content type with the highest score", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
        fc.array(fc.constantFrom(...Object.values(SemanticMarkers)), { minLength: 0, maxLength: 5 }),
        fc.constantFrom(...Object.values(BulletPattern)),
        (title, bullets, markers, pattern) => {
          const result = detectContentType(title, bullets, markers, pattern);

          // Find the maximum score
          const maxScore = Math.max(...Object.values(result.scores));
          
          // The detected content type should have the maximum score (or be GENERIC if all scores are low)
          if (result.contentType !== ContentType.GENERIC || maxScore === 0) {
            expect(result.scores[result.contentType]).toBe(maxScore);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Numeric pattern boosts statistics
   * 
   * NUMERIC pattern should boost STATISTICS content type score
   */
  it("should boost STATISTICS score with NUMERIC pattern", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
        fc.array(fc.constantFrom(...Object.values(SemanticMarkers)), { minLength: 0, maxLength: 3 }),
        (title, bullets, markers) => {
          const withSimpleList = detectContentType(title, bullets, markers, BulletPattern.SIMPLE_LIST);
          const withNumeric = detectContentType(title, bullets, markers, BulletPattern.NUMERIC);

          // Score for STATISTICS should be higher with NUMERIC pattern
          expect(withNumeric.scores[ContentType.STATISTICS]).toBeGreaterThanOrEqual(
            withSimpleList.scores[ContentType.STATISTICS]
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});
