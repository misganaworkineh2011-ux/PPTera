// Content Layout Types
// Defines how text/data is structured within a slide

export type ContentLayoutCategory =
  | "boxes"
  | "bullets"
  | "sequence"
  | "images"
  | "numbers"
  | "circles"
  | "quotes"
  | "steps"
  | "cascading"
  | "chevron"
  | "funnel"
  | "proscons"
  | "beforeafter"
  | "comparison";

export interface ContentLayoutCategoryDef {
  id: ContentLayoutCategory;
  name: string;
  description: string;
}

export const contentLayoutCategories: ContentLayoutCategoryDef[] = [
  {
    id: "boxes",
    name: "Boxes",
    description: "Content organized in box cards with headings and descriptions",
  },
  {
    id: "bullets",
    name: "Bullets",
    description: "Traditional bullet point list",
  },
  {
    id: "sequence",
    name: "Sequence",
    description: "Numbered sequence or timeline",
  },
  {
    id: "images",
    name: "Images",
    description: "Image gallery or grid layout",
  },
  {
    id: "numbers",
    name: "Numbers",
    description: "Big statistics or metrics display",
  },
  {
    id: "circles",
    name: "Circles",
    description: "Circular arrangement or icons",
  },
  {
    id: "quotes",
    name: "Quotes",
    description: "Quote or testimonial layout",
  },
  {
    id: "steps",
    name: "Steps",
    description: "Step-by-step process flow",
  },
  {
    id: "cascading",
    name: "Cascading",
    description: "Staggered workflow with numbered items",
  },
  {
    id: "chevron",
    name: "Chevron",
    description: "Horizontal chevron arrows with numbered steps",
  },
  {
    id: "funnel",
    name: "Funnel",
    description: "Funnel-style bars with icons and side content",
  },
  {
    id: "proscons",
    name: "Pros & Cons",
    description: "Split circle diagram with pros and cons",
  },
  {
    id: "beforeafter",
    name: "Before & After",
    description: "Circular comparison diagram showing transformation",
  },
  {
    id: "comparison",
    name: "VS Comparison",
    description: "Vertical split comparison with items on both sides",
  },
];

// Export box layouts
export * from "./boxes";

// Export sequence layouts
export * from "./sequence";

// Export circle layouts
export * from "./circles";

// Export image layouts
export * from "./images";

// Export bullet layouts
export * from "./bullets";

// Export steps layouts
export * from "./steps";

// Export quotes layouts
export * from "./quotes";

// Export cascading layouts
export * from "./cascading";

// Export chevron layouts
export * from "./chevron";

// Export funnel layouts
export * from "./funnel";

// Export pros/cons layouts
export * from "./proscons";

// Export before/after layouts
export * from "./beforeafter";

// Export comparison layouts
export * from "./comparison";
