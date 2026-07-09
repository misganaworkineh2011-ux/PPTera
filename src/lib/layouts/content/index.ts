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
  | "comparison"
  | "bento"
  | "timeline"
  | "spotlight"
  | "agenda"
  | "pyramid"
  | "matrix"
  | "callout"
  | "table"
  | "dashboard"
  | "team"
  | "icongrid"
  | "hubspoke"
  | "cycle"
  | "showcase"
  | "checklist"
  | "roadmap"
  | "zigzag"
  | "definitionlist"
  | "editorial"
  | "orbit"
  | "pricing"
  | "featurematrix"
  | "kanban"
  | "orgchart";

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
  {
    id: "bento",
    name: "Bento Grid",
    description: "Asymmetric card mosaic with a hero card",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Horizontal roadmap with milestones on a spine",
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "One bold key-insight statement",
  },
  {
    id: "agenda",
    name: "Agenda",
    description: "Numbered agenda or table of contents",
  },
  {
    id: "pyramid",
    name: "Pyramid",
    description: "Layered hierarchy from apex to base",
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "2x2 quadrant matrix split by axes",
  },
  {
    id: "callout",
    name: "Callout",
    description: "Highlighted key-note callout boxes",
  },
  {
    id: "table",
    name: "Table",
    description: "Clean data table",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "KPI metric cards with values",
  },
  {
    id: "team",
    name: "Team",
    description: "People cards with avatars and roles",
  },
  {
    id: "icongrid",
    name: "Icon Grid",
    description: "Feature grid with icon chips",
  },
  {
    id: "hubspoke",
    name: "Hub & Spoke",
    description: "Central hub with radiating spokes",
  },
  {
    id: "cycle",
    name: "Cycle",
    description: "Circular loop process diagram",
  },
  {
    id: "showcase",
    name: "Showcase",
    description: "Split editorial feature showcase",
  },
  {
    id: "checklist",
    name: "Checklist",
    description: "Check items for takeaways or requirements",
  },
  {
    id: "roadmap",
    name: "Roadmap",
    description: "Vertical timeline of milestones",
  },
  {
    id: "zigzag",
    name: "Zigzag",
    description: "Alternating left/right flow cards",
  },
  {
    id: "definitionlist",
    name: "Definition List",
    description: "Term and definition rows",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Magazine-style numbered rows and header-band cards",
  },
  {
    id: "orbit",
    name: "Orbit",
    description: "Relationship diagrams: rings, overlaps, phases, spectrum",
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

// Export bento layouts
export * from "./bento";

// Export timeline layouts
export * from "./timeline";

// Export spotlight layouts
export * from "./spotlight";

// Export agenda layouts
export * from "./agenda";

// Export pyramid layouts
export * from "./pyramid";

// Export matrix layouts
export * from "./matrix";

// Export callout layouts
export * from "./callout";

// Export table layouts
export * from "./table";

// Export dashboard layouts
export * from "./dashboard";

// Export team layouts
export * from "./team";

// Export icon grid layouts
export * from "./icongrid";

// Export hub & spoke layouts
export * from "./hubspoke";

// Export cycle layouts
export * from "./cycle";

// Export showcase layouts
export * from "./showcase";

// Export checklist layouts
export * from "./checklist";

// Export roadmap layouts
export * from "./roadmap";

// Export zigzag layouts
export * from "./zigzag";

// Export definition list layouts
export * from "./definitionlist";

// Export editorial layouts
export * from "./editorial";

// Export orbit layouts
export * from "./orbit";
