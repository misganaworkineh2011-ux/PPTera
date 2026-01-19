/**
 * Unit Tests for Layout Registry Utilities
 */

import { describe, it, expect } from "vitest";
import {
  LAYOUT_REGISTRY,
  getAllLayouts,
  getLayoutByCategory,
  getLayoutStyles,
  getStyleById,
  getImageSupportingLayouts,
  getImageRequiringLayouts,
  getLayoutsByPriority,
  getNarrowCompatibleLayouts,
  getFullWidthLayouts,
  getLayoutsByDensity,
  hasLayoutCategory,
  getFallbackLayout,
  getLayoutCategoriesByPriority,
} from "./layout-registry";

describe("Layout Registry Utilities", () => {
  describe("getAllLayouts", () => {
    it("should return all layout definitions", () => {
      const layouts = getAllLayouts();
      expect(layouts).toBe(LAYOUT_REGISTRY);
      expect(layouts.length).toBe(8);
    });
  });

  describe("getLayoutByCategory", () => {
    it("should return layout for valid category", () => {
      const layout = getLayoutByCategory("boxes");
      expect(layout).toBeDefined();
      expect(layout?.category).toBe("boxes");
    });

    it("should return undefined for invalid category", () => {
      const layout = getLayoutByCategory("invalid" as any);
      expect(layout).toBeUndefined();
    });

    it("should return correct layout for each category", () => {
      const categories = ["boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers", "images"] as const;
      
      categories.forEach(category => {
        const layout = getLayoutByCategory(category);
        expect(layout).toBeDefined();
        expect(layout?.category).toBe(category);
      });
    });
  });

  describe("getLayoutStyles", () => {
    it("should return styles for valid category", () => {
      const styles = getLayoutStyles("boxes");
      expect(styles).toBeDefined();
      expect(styles.length).toBeGreaterThan(0);
    });

    it("should return empty array for invalid category", () => {
      const styles = getLayoutStyles("invalid" as any);
      expect(styles).toEqual([]);
    });

    it("should return all styles for each category", () => {
      const categories = ["boxes", "bullets", "sequence", "steps", "quotes", "circles", "numbers", "images"] as const;
      
      categories.forEach(category => {
        const styles = getLayoutStyles(category);
        expect(styles.length).toBeGreaterThan(0);
        styles.forEach(style => {
          expect(style.id).toBeDefined();
          expect(style.name).toBeDefined();
        });
      });
    });
  });

  describe("getStyleById", () => {
    it("should return style for valid category and style ID", () => {
      const style = getStyleById("boxes", "box-style-1");
      expect(style).toBeDefined();
      expect(style?.id).toBe("box-style-1");
    });

    it("should return undefined for invalid style ID", () => {
      const style = getStyleById("boxes", "invalid-style");
      expect(style).toBeUndefined();
    });

    it("should return undefined for invalid category", () => {
      const style = getStyleById("invalid" as any, "box-style-1");
      expect(style).toBeUndefined();
    });
  });

  describe("getImageSupportingLayouts", () => {
    it("should return layouts that support images", () => {
      const layouts = getImageSupportingLayouts();
      expect(layouts.length).toBeGreaterThan(0);
      layouts.forEach(layout => {
        expect(layout.capacity.supportsImage).toBe(true);
      });
    });

    it("should include boxes, bullets, steps, quotes, and images", () => {
      const layouts = getImageSupportingLayouts();
      const categories = layouts.map(l => l.category);
      
      expect(categories).toContain("boxes");
      expect(categories).toContain("bullets");
      expect(categories).toContain("steps");
      expect(categories).toContain("quotes");
      expect(categories).toContain("images");
    });
  });

  describe("getImageRequiringLayouts", () => {
    it("should return layouts that require images", () => {
      const layouts = getImageRequiringLayouts();
      layouts.forEach(layout => {
        expect(layout.capacity.requiresImage).toBe(true);
      });
    });

    it("should include images category", () => {
      const layouts = getImageRequiringLayouts();
      const categories = layouts.map(l => l.category);
      expect(categories).toContain("images");
    });
  });

  describe("getLayoutsByPriority", () => {
    it("should return high priority layouts", () => {
      const layouts = getLayoutsByPriority("high");
      expect(layouts.length).toBeGreaterThan(0);
      layouts.forEach(layout => {
        expect(layout.priority).toBe("high");
      });
    });

    it("should return fallback layouts", () => {
      const layouts = getLayoutsByPriority("fallback");
      expect(layouts.length).toBeGreaterThan(0);
      layouts.forEach(layout => {
        expect(layout.priority).toBe("fallback");
      });
    });

    it("should include bullets as fallback", () => {
      const layouts = getLayoutsByPriority("fallback");
      const categories = layouts.map(l => l.category);
      expect(categories).toContain("bullets");
    });
  });

  describe("getNarrowCompatibleLayouts", () => {
    it("should return narrow-compatible layouts", () => {
      const layouts = getNarrowCompatibleLayouts();
      expect(layouts.length).toBeGreaterThan(0);
      layouts.forEach(layout => {
        expect(layout.capacity.spaceRequirement).toBe("narrow-compatible");
      });
    });
  });

  describe("getFullWidthLayouts", () => {
    it("should return full-width layouts", () => {
      const layouts = getFullWidthLayouts();
      expect(layouts.length).toBeGreaterThan(0);
      layouts.forEach(layout => {
        expect(layout.capacity.spaceRequirement).toBe("full-width-only");
      });
    });
  });

  describe("getLayoutsByDensity", () => {
    it("should return low density layouts", () => {
      const layouts = getLayoutsByDensity("low");
      expect(layouts.length).toBeGreaterThan(0);
      layouts.forEach(layout => {
        expect(layout.capacity.density).toBe("low");
      });
    });

    it("should return medium density layouts", () => {
      const layouts = getLayoutsByDensity("medium");
      expect(layouts.length).toBeGreaterThan(0);
      layouts.forEach(layout => {
        expect(layout.capacity.density).toBe("medium");
      });
    });

    it("should return high density layouts", () => {
      const layouts = getLayoutsByDensity("high");
      expect(layouts.length).toBeGreaterThan(0);
      layouts.forEach(layout => {
        expect(layout.capacity.density).toBe("high");
      });
    });
  });

  describe("hasLayoutCategory", () => {
    it("should return true for valid categories", () => {
      expect(hasLayoutCategory("boxes")).toBe(true);
      expect(hasLayoutCategory("bullets")).toBe(true);
      expect(hasLayoutCategory("sequence")).toBe(true);
    });

    it("should return false for invalid categories", () => {
      expect(hasLayoutCategory("invalid")).toBe(false);
      expect(hasLayoutCategory("")).toBe(false);
    });
  });

  describe("getFallbackLayout", () => {
    it("should return bullets layout", () => {
      const fallback = getFallbackLayout();
      expect(fallback).toBeDefined();
      expect(fallback.category).toBe("bullets");
    });

    it("should have at least one style", () => {
      const fallback = getFallbackLayout();
      expect(fallback.styles.length).toBeGreaterThan(0);
    });
  });

  describe("getLayoutCategoriesByPriority", () => {
    it("should return categories in priority order", () => {
      const categories = getLayoutCategoriesByPriority();
      expect(categories.length).toBe(8);
      
      // Find indices of different priority levels
      const highPriorityIndices = categories
        .map((cat, idx) => ({ cat, idx }))
        .filter(({ cat }) => {
          const layout = getLayoutByCategory(cat);
          return layout?.priority === "high";
        })
        .map(({ idx }) => idx);
      
      const fallbackIndices = categories
        .map((cat, idx) => ({ cat, idx }))
        .filter(({ cat }) => {
          const layout = getLayoutByCategory(cat);
          return layout?.priority === "fallback";
        })
        .map(({ idx }) => idx);
      
      // High priority should come before fallback
      if (highPriorityIndices.length > 0 && fallbackIndices.length > 0) {
        expect(Math.max(...highPriorityIndices)).toBeLessThan(
          Math.min(...fallbackIndices)
        );
      }
    });
  });

  describe("Registry Validation", () => {
    it("should have exactly 8 layouts", () => {
      expect(LAYOUT_REGISTRY.length).toBe(8);
    });

    it("should have unique categories", () => {
      const categories = LAYOUT_REGISTRY.map(l => l.category);
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });

    it("should have at least one fallback layout", () => {
      const fallbackLayouts = getLayoutsByPriority("fallback");
      expect(fallbackLayouts.length).toBeGreaterThan(0);
    });

    it("should have bullets as a category", () => {
      expect(hasLayoutCategory("bullets")).toBe(true);
    });

    it("all layouts should have at least one style", () => {
      LAYOUT_REGISTRY.forEach(layout => {
        expect(layout.styles.length).toBeGreaterThan(0);
      });
    });
  });
});
