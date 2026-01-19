/**
 * Property-Based Tests for Semantic Marker Extraction
 * 
 * Feature: smart-layout-selection, Property 2: Content Analysis Completeness (Semantic Markers)
 * Validates: Requirements 2.3
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { extractSemanticMarkers, extractSemanticMarkersFromSlide } from "./semantic-extractor";
import { SemanticMarkers } from "../types";

describe("Semantic Marker Extraction - Property Tests", () => {
  /**
   * Property 2: Content Analysis Completeness (Semantic Markers)
   * 
   * For any text input, the semantic extractor must:
   * 1. Return an array (possibly empty)
   * 2. Only contain valid SemanticMarkers enum values
   * 3. Not contain duplicates
   * 4. Never throw an exception
   */
  it("should always return valid semantic markers array for any text input", () => {
    fc.assert(
      fc.property(
        fc.string(),
        (text) => {
          // Execute semantic extraction
          const markers = extractSemanticMarkers(text);

          // Verify result is an array
          expect(Array.isArray(markers)).toBe(true);

          // Verify all markers are valid enum values
          const validMarkers = Object.values(SemanticMarkers);
          markers.forEach(marker => {
            expect(validMarkers).toContain(marker);
          });

          // Verify no duplicates
          const uniqueMarkers = new Set(markers);
          expect(uniqueMarkers.size).toBe(markers.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty input handling
   * 
   * For empty or whitespace-only text, should return empty array
   */
  it("should return empty array for empty or whitespace text", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(""),
          fc.constant("   "),
          fc.constant("\n\t"),
        ),
        (text) => {
          const markers = extractSemanticMarkers(text);
          expect(markers).toEqual([]);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Timeline marker detection
   * 
   * Text containing timeline keywords should include TIMELINE marker
   */
  it("should detect timeline markers in text with timeline keywords", () => {
    const timelineKeywords = ["timeline", "history", "evolution", "year 2020", "since 2015"];
    
    timelineKeywords.forEach(keyword => {
      fc.assert(
        fc.property(
          fc.string().map(text => `${text} ${keyword} ${text}`),
          (text) => {
            const markers = extractSemanticMarkers(text);
            expect(markers).toContain(SemanticMarkers.TIMELINE);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property: Process marker detection
   * 
   * Text containing process keywords should include PROCESS marker
   */
  it("should detect process markers in text with process keywords", () => {
    const processKeywords = ["process", "workflow", "procedure", "method", "approach"];
    
    processKeywords.forEach(keyword => {
      fc.assert(
        fc.property(
          fc.string().map(text => `${text} ${keyword} ${text}`),
          (text) => {
            const markers = extractSemanticMarkers(text);
            expect(markers).toContain(SemanticMarkers.PROCESS);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property: Statistics marker detection
   * 
   * Text containing statistics keywords should include STATISTICS marker
   */
  it("should detect statistics markers in text with statistics keywords", () => {
    const statsKeywords = ["statistics", "data", "metrics", "numbers", "survey"];
    
    statsKeywords.forEach(keyword => {
      fc.assert(
        fc.property(
          fc.string().map(text => `${text} ${keyword} ${text}`),
          (text) => {
            const markers = extractSemanticMarkers(text);
            expect(markers).toContain(SemanticMarkers.STATISTICS);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property: Multiple markers detection
   * 
   * Text with multiple keywords should detect multiple markers
   */
  it("should detect multiple markers when text contains multiple keyword types", () => {
    const text = "Our process timeline shows statistics from the survey";
    const markers = extractSemanticMarkers(text);

    expect(markers.length).toBeGreaterThan(1);
    expect(markers).toContain(SemanticMarkers.PROCESS);
    expect(markers).toContain(SemanticMarkers.TIMELINE);
    expect(markers).toContain(SemanticMarkers.STATISTICS);
  });

  /**
   * Property: Case insensitivity
   * 
   * Detection should work regardless of text case
   */
  it("should detect markers regardless of text case", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("timeline", "TIMELINE", "Timeline", "TiMeLiNe"),
        (keyword) => {
          const markers = extractSemanticMarkers(keyword);
          expect(markers).toContain(SemanticMarkers.TIMELINE);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Slide extraction combines title and bullets
   * 
   * extractSemanticMarkersFromSlide should find markers in both title and bullets
   */
  it("should extract markers from both title and bullets", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
        (title, bullets) => {
          const markers = extractSemanticMarkersFromSlide(title, bullets);

          // Should return an array
          expect(Array.isArray(markers)).toBe(true);

          // All markers should be valid
          const validMarkers = Object.values(SemanticMarkers);
          markers.forEach(marker => {
            expect(validMarkers).toContain(marker);
          });
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
        fc.string(),
        (text) => {
          const markers1 = extractSemanticMarkers(text);
          const markers2 = extractSemanticMarkers(text);

          expect(markers1).toEqual(markers2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: No duplicates in results
   * 
   * Even if keywords appear multiple times, each marker should appear once
   */
  it("should not return duplicate markers even with repeated keywords", () => {
    const text = "timeline timeline timeline process process";
    const markers = extractSemanticMarkers(text);

    const uniqueMarkers = new Set(markers);
    expect(uniqueMarkers.size).toBe(markers.length);
  });
});
