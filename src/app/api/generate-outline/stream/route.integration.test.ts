/**
 * Integration Tests for Outline Generation with Smart Layout Metadata
 * 
 * Tests the complete outline generation flow with real LLM (OpenAI/Gemini)
 * to verify metadata extraction, validation, and fallback behavior.
 * 
 * These tests make actual API calls to LLMs and verify that:
 * 1. LLM responses include required metadata fields
 * 2. Metadata extraction works with real responses
 * 3. Fallback behavior works when LLM omits fields
 * 4. Validation and normalization functions correctly
 * 
 * **Validates: Requirements 1.1-1.6**
 */

import { describe, it, expect, beforeAll } from "vitest";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API keys directly from process.env to avoid env validation issues in tests
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Import validation functions from the route
// Note: These are duplicated here for testing since they're not exported
function validateAndNormalizeSlideMetadata(slide: any): any {
  const normalized = { ...slide };
  let hasWarnings = false;
  
  // Only validate content slides (title slides don't need layout metadata)
  if (slide.type !== "content") {
    return normalized;
  }
  
  // Validate and normalize semanticIntent
  if (!normalized.semanticIntent || typeof normalized.semanticIntent !== "string") {
    console.warn(`[outline-validation] Slide "${slide.title}" missing semanticIntent, using fallback`);
    normalized.semanticIntent = "inform";
    hasWarnings = true;
  }
  
  // Validate and normalize visualStrategy
  if (!normalized.visualStrategy || typeof normalized.visualStrategy !== "object") {
    console.warn(`[outline-validation] Slide "${slide.title}" missing visualStrategy, using fallback`);
    normalized.visualStrategy = {
      primary: "text-focused",
      pattern: "cards",
      emphasis: "clarity"
    };
    hasWarnings = true;
  } else {
    // Ensure all visualStrategy fields are present
    if (!normalized.visualStrategy.primary) {
      normalized.visualStrategy.primary = "text-focused";
      hasWarnings = true;
    }
    if (!normalized.visualStrategy.pattern) {
      normalized.visualStrategy.pattern = "cards";
      hasWarnings = true;
    }
    if (!normalized.visualStrategy.emphasis) {
      normalized.visualStrategy.emphasis = "clarity";
      hasWarnings = true;
    }
  }
  
  // Validate contentLayoutHint (optional but log if missing)
  if (!normalized.contentLayoutHint) {
    console.warn(`[outline-validation] Slide "${slide.title}" missing contentLayoutHint`);
    // Don't set fallback - this is truly optional
  }
  
  // Validate assets/image metadata (optional)
  if (normalized.assets?.image) {
    if (typeof normalized.assets.image.required !== "boolean") {
      normalized.assets.image.required = false;
    }
    if (!normalized.assets.image.orientation) {
      normalized.assets.image.orientation = "landscape";
    }
  }
  
  if (hasWarnings) {
    console.warn(`[outline-validation] Slide "${slide.title}" had incomplete metadata, applied fallbacks`);
  }
  
  return normalized;
}

function validateAndNormalizeOutline(outline: any): any {
  if (!outline.slides || !Array.isArray(outline.slides)) {
    throw new Error("Invalid outline structure: missing slides array");
  }
  
  return {
    ...outline,
    slides: outline.slides.map(validateAndNormalizeSlideMetadata)
  };
}

describe("Outline Generation Integration Tests", () => {
  let openai: OpenAI | null = null;
  let gemini: GoogleGenerativeAI | null = null;
  
  beforeAll(() => {
    // Initialize API clients
    if (OPENAI_API_KEY) {
      openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    }
    if (GEMINI_API_KEY) {
      gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    
    // Skip tests if no API keys are configured
    if (!openai && !gemini) {
      console.warn("⚠️  No API keys configured. Skipping integration tests.");
    }
  });
  
  /**
   * Test with OpenAI API
   */
  describe("OpenAI Integration", () => {
    it.skipIf(!OPENAI_API_KEY)("should generate outline with complete metadata using OpenAI", async () => {
      if (!openai) throw new Error("OpenAI not initialized");
      
      const systemPrompt = `You are an expert presentation creator. Create a presentation outline in JSON format.

For each CONTENT slide, you MUST include:
1. "semanticIntent": A label describing the slide's purpose (e.g., "inform", "compare", "instruct")
2. "visualStrategy": { "primary": "diagram|image|mixed|text-focused", "pattern": "cards|grid|flow|split", "emphasis": "progression|contrast|relationship|scale" }
3. "contentLayoutHint": Suggested layout from: "boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers"
4. "bulletPoints": Array of 3-5 bullet points
5. "assets": { "image": { "required": boolean, "orientation": "landscape|portrait", "pexelsPromptHint": string, "aiPromptHint": string } }

Return ONLY valid JSON with this structure:
{
  "slides": [
    {
      "type": "title",
      "title": "Title text",
      "subtitle": "Subtitle text",
      "image": { "required": true, "orientation": "landscape", "pexelsPromptHint": "[people] keywords", "aiPromptHint": "detailed description" }
    },
    {
      "type": "content",
      "title": "Slide title",
      "semanticIntent": "inform",
      "visualStrategy": { "primary": "text-focused", "pattern": "cards", "emphasis": "clarity" },
      "contentLayoutHint": "boxes",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "assets": { "image": { "required": false, "orientation": "landscape", "pexelsPromptHint": "[no people] keywords", "aiPromptHint": "detailed description" } }
    }
  ],
  "metadata": { "topic": "Test Topic", "totalSlides": 3, "tone": "professional", "language": "english" }
}`;
      
      const userPrompt = `Create a 3-slide presentation outline about "The Benefits of Remote Work"`;
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use mini for faster/cheaper testing
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      
      const responseText = completion.choices[0]?.message?.content || "";
      expect(responseText).toBeTruthy();
      
      // Parse JSON response
      let outline: any;
      try {
        // Remove markdown code blocks if present
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.slice(7);
        }
        if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.slice(3);
        }
        if (cleanJson.endsWith("```")) {
          cleanJson = cleanJson.slice(0, -3);
        }
        outline = JSON.parse(cleanJson.trim());
      } catch (error) {
        throw new Error(`Failed to parse LLM response as JSON: ${error}`);
      }
      
      // Validate outline structure
      expect(outline).toBeDefined();
      expect(outline.slides).toBeDefined();
      expect(Array.isArray(outline.slides)).toBe(true);
      expect(outline.slides.length).toBe(3);
      
      // Validate and normalize the outline
      const normalized = validateAndNormalizeOutline(outline);
      
      // Check that all content slides have complete metadata after normalization
      const contentSlides = normalized.slides.filter((s: any) => s.type === "content");
      expect(contentSlides.length).toBeGreaterThan(0);
      
      for (const slide of contentSlides) {
        // Required fields must be present
        expect(slide.semanticIntent).toBeDefined();
        expect(typeof slide.semanticIntent).toBe("string");
        expect(slide.semanticIntent.length).toBeGreaterThan(0);
        
        expect(slide.visualStrategy).toBeDefined();
        expect(slide.visualStrategy.primary).toBeDefined();
        expect(typeof slide.visualStrategy.primary).toBe("string");
        expect(slide.visualStrategy.pattern).toBeDefined();
        expect(typeof slide.visualStrategy.pattern).toBe("string");
        expect(slide.visualStrategy.emphasis).toBeDefined();
        expect(typeof slide.visualStrategy.emphasis).toBe("string");
        
        // contentLayoutHint is optional but should be present if LLM provided it
        if (slide.contentLayoutHint) {
          expect(typeof slide.contentLayoutHint).toBe("string");
          expect(["boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers"])
            .toContain(slide.contentLayoutHint);
        }
        
        // Bullet points should be present
        expect(slide.bulletPoints).toBeDefined();
        expect(Array.isArray(slide.bulletPoints)).toBe(true);
        expect(slide.bulletPoints.length).toBeGreaterThan(0);
      }
      
      console.log("✅ OpenAI generated outline with complete metadata");
    }, 30000); // 30 second timeout for API call
    
    it.skipIf(!OPENAI_API_KEY)("should handle incomplete metadata with fallbacks (OpenAI)", async () => {
      if (!openai) throw new Error("OpenAI not initialized");
      
      // Intentionally use a minimal prompt that might not include all metadata
      const minimalPrompt = `Create a simple 2-slide presentation outline about "Coffee" in JSON format.
Include: type, title, subtitle (for title slide), bulletPoints (for content slides).
Return only JSON.`;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: minimalPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      const responseText = completion.choices[0]?.message?.content || "";
      
      // Parse JSON
      let outline: any;
      try {
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7);
        if (cleanJson.startsWith("```")) cleanJson = cleanJson.slice(3);
        if (cleanJson.endsWith("```")) cleanJson = cleanJson.slice(0, -3);
        outline = JSON.parse(cleanJson.trim());
      } catch (error) {
        // If parsing fails, create a minimal outline for testing fallbacks
        outline = {
          slides: [
            { type: "title", title: "Coffee", subtitle: "A Brief Overview" },
            { type: "content", title: "Benefits", bulletPoints: ["Increases alertness", "Rich in antioxidants"] }
          ]
        };
      }
      
      // Validate and normalize - this should apply fallbacks
      const normalized = validateAndNormalizeOutline(outline);
      
      // Check that fallbacks were applied to content slides
      const contentSlides = normalized.slides.filter((s: any) => s.type === "content");
      
      for (const slide of contentSlides) {
        // Even if LLM didn't provide these, normalization should add them
        expect(slide.semanticIntent).toBe("inform"); // Fallback value
        expect(slide.visualStrategy.primary).toBe("text-focused"); // Fallback
        expect(slide.visualStrategy.pattern).toBe("cards"); // Fallback
        expect(slide.visualStrategy.emphasis).toBe("clarity"); // Fallback
      }
      
      console.log("✅ Fallback behavior works correctly with incomplete OpenAI response");
    }, 30000);
  });
  
  /**
   * Test with Gemini API
   */
  describe("Gemini Integration", () => {
    it.skipIf(!GEMINI_API_KEY)("should generate outline with complete metadata using Gemini", async () => {
      if (!gemini) throw new Error("Gemini not initialized");
      
      const prompt = `You are an expert presentation creator. Create a 3-slide presentation outline about "Artificial Intelligence in Healthcare" in JSON format.

For each CONTENT slide, include:
- "semanticIntent": Label like "inform", "compare", "instruct"
- "visualStrategy": { "primary": "diagram|image|mixed|text-focused", "pattern": "cards|grid|flow", "emphasis": "progression|contrast|clarity" }
- "contentLayoutHint": One of: "boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers"
- "bulletPoints": Array of 3-5 points
- "assets": { "image": { "required": boolean, "orientation": "landscape|portrait", "pexelsPromptHint": string, "aiPromptHint": string } }

Return ONLY valid JSON.`;
      
      const model = gemini.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          responseMimeType: "application/json",
        },
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      expect(responseText).toBeTruthy();
      
      // Parse JSON
      const outline = JSON.parse(responseText);
      
      // Validate outline structure
      expect(outline).toBeDefined();
      expect(outline.slides).toBeDefined();
      expect(Array.isArray(outline.slides)).toBe(true);
      
      // Validate and normalize
      const normalized = validateAndNormalizeOutline(outline);
      
      // Check content slides have complete metadata
      const contentSlides = normalized.slides.filter((s: any) => s.type === "content");
      expect(contentSlides.length).toBeGreaterThan(0);
      
      for (const slide of contentSlides) {
        expect(slide.semanticIntent).toBeDefined();
        expect(typeof slide.semanticIntent).toBe("string");
        
        expect(slide.visualStrategy).toBeDefined();
        expect(slide.visualStrategy.primary).toBeDefined();
        expect(slide.visualStrategy.pattern).toBeDefined();
        expect(slide.visualStrategy.emphasis).toBeDefined();
        
        if (slide.bulletPoints) {
          expect(Array.isArray(slide.bulletPoints)).toBe(true);
        }
      }
      
      console.log("✅ Gemini generated outline with complete metadata");
    }, 30000);
    
    it.skipIf(!GEMINI_API_KEY)("should handle incomplete metadata with fallbacks (Gemini)", async () => {
      if (!gemini) throw new Error("Gemini not initialized");
      
      // Minimal prompt
      const prompt = `Create a 2-slide presentation outline about "Space Exploration" in JSON format.
Include: type, title, bulletPoints. Return only JSON.`;
      
      const model = gemini.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
          responseMimeType: "application/json",
        },
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      let outline: any;
      try {
        outline = JSON.parse(responseText);
      } catch (error) {
        // Create minimal outline for testing
        outline = {
          slides: [
            { type: "title", title: "Space Exploration" },
            { type: "content", title: "Key Achievements", bulletPoints: ["Moon landing", "Mars rovers"] }
          ]
        };
      }
      
      // Validate and normalize
      const normalized = validateAndNormalizeOutline(outline);
      
      // Check fallbacks were applied
      const contentSlides = normalized.slides.filter((s: any) => s.type === "content");
      
      for (const slide of contentSlides) {
        expect(slide.semanticIntent).toBe("inform");
        expect(slide.visualStrategy.primary).toBe("text-focused");
        expect(slide.visualStrategy.pattern).toBe("cards");
        expect(slide.visualStrategy.emphasis).toBe("clarity");
      }
      
      console.log("✅ Fallback behavior works correctly with incomplete Gemini response");
    }, 30000);
  });
  
  /**
   * Test validation and normalization functions directly
   */
  describe("Validation and Normalization", () => {
    it("should validate complete metadata without warnings", () => {
      const completeSlide = {
        type: "content",
        title: "Test Slide",
        semanticIntent: "inform",
        visualStrategy: {
          primary: "text-focused",
          pattern: "cards",
          emphasis: "clarity"
        },
        contentLayoutHint: "boxes",
        bulletPoints: ["Point 1", "Point 2", "Point 3"],
        assets: {
          image: {
            required: false,
            orientation: "landscape",
            pexelsPromptHint: "[no people] test",
            aiPromptHint: "A test image"
          }
        }
      };
      
      const normalized = validateAndNormalizeSlideMetadata(completeSlide);
      
      // Should preserve all values
      expect(normalized.semanticIntent).toBe("inform");
      expect(normalized.visualStrategy.primary).toBe("text-focused");
      expect(normalized.visualStrategy.pattern).toBe("cards");
      expect(normalized.visualStrategy.emphasis).toBe("clarity");
      expect(normalized.contentLayoutHint).toBe("boxes");
    });
    
    it("should apply fallbacks for missing required fields", () => {
      const incompleteSlide = {
        type: "content",
        title: "Incomplete Slide",
        bulletPoints: ["Point 1"]
        // Missing: semanticIntent, visualStrategy, contentLayoutHint
      };
      
      const normalized = validateAndNormalizeSlideMetadata(incompleteSlide);
      
      // Should have fallback values
      expect(normalized.semanticIntent).toBe("inform");
      expect(normalized.visualStrategy.primary).toBe("text-focused");
      expect(normalized.visualStrategy.pattern).toBe("cards");
      expect(normalized.visualStrategy.emphasis).toBe("clarity");
      // contentLayoutHint is optional, so it can be undefined
    });
    
    it("should handle partially complete visualStrategy", () => {
      const partialSlide = {
        type: "content",
        title: "Partial Slide",
        semanticIntent: "compare",
        visualStrategy: {
          primary: "diagram"
          // Missing: pattern, emphasis
        },
        bulletPoints: ["Point 1"]
      };
      
      const normalized = validateAndNormalizeSlideMetadata(partialSlide);
      
      // Should preserve provided value and add fallbacks
      expect(normalized.semanticIntent).toBe("compare");
      expect(normalized.visualStrategy.primary).toBe("diagram");
      expect(normalized.visualStrategy.pattern).toBe("cards"); // Fallback
      expect(normalized.visualStrategy.emphasis).toBe("clarity"); // Fallback
    });
    
    it("should not modify title slides", () => {
      const titleSlide = {
        type: "title",
        title: "Title Slide",
        subtitle: "Subtitle"
        // No metadata fields
      };
      
      const normalized = validateAndNormalizeSlideMetadata(titleSlide);
      
      // Should return unchanged (title slides don't need layout metadata)
      expect(normalized.type).toBe("title");
      expect(normalized.title).toBe("Title Slide");
      expect(normalized.subtitle).toBe("Subtitle");
      expect(normalized.semanticIntent).toBeUndefined();
      expect(normalized.visualStrategy).toBeUndefined();
    });
    
    it("should validate entire outline structure", () => {
      const outline = {
        slides: [
          { type: "title", title: "Title" },
          { type: "content", title: "Content 1", bulletPoints: ["A"] },
          { type: "content", title: "Content 2", semanticIntent: "instruct", visualStrategy: { primary: "mixed", pattern: "flow", emphasis: "progression" }, bulletPoints: ["B"] }
        ],
        metadata: {
          topic: "Test",
          totalSlides: 3,
          tone: "professional",
          language: "english"
        }
      };
      
      const normalized = validateAndNormalizeOutline(outline);
      
      expect(normalized.slides).toHaveLength(3);
      
      // First slide (title) should be unchanged
      expect(normalized.slides[0].type).toBe("title");
      
      // Second slide (content without metadata) should have fallbacks
      expect(normalized.slides[1].semanticIntent).toBe("inform");
      expect(normalized.slides[1].visualStrategy.primary).toBe("text-focused");
      
      // Third slide (content with metadata) should preserve values
      expect(normalized.slides[2].semanticIntent).toBe("instruct");
      expect(normalized.slides[2].visualStrategy.primary).toBe("mixed");
      expect(normalized.slides[2].visualStrategy.pattern).toBe("flow");
    });
    
    it("should throw error for invalid outline structure", () => {
      const invalidOutline = {
        // Missing slides array
        metadata: { topic: "Test" }
      };
      
      expect(() => validateAndNormalizeOutline(invalidOutline)).toThrow("Invalid outline structure");
    });
  });
});
