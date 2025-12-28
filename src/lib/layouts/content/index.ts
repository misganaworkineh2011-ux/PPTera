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
  | "steps";

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
