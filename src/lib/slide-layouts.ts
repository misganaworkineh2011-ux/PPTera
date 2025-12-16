// Slide Layout Definitions
// Each layout defines how content is arranged on a slide

export type LayoutType = 
  | "title-center"
  | "title-left"
  | "content-left-image-right"
  | "content-right-image-left"
  | "content-grid-2"
  | "content-grid-3"
  | "content-grid-4"
  | "content-cards-2"
  | "content-cards-3"
  | "content-full-image"
  | "content-split-diagonal"
  | "content-timeline"
  | "content-comparison"
  | "content-quote"
  | "content-stats"
  | "content-centered-image"
  | "content-feature-showcase";

export interface LayoutDefinition {
  id: LayoutType;
  name: string;
  description: string;
  icon: string;
  category: "title" | "content" | "media" | "data";
  preview: string; // ASCII art preview
}

export const slideLayouts: LayoutDefinition[] = [
  // Title Layouts
  {
    id: "title-center",
    name: "Centered Title",
    description: "Title and subtitle centered on the slide",
    icon: "⬜",
    category: "title",
    preview: `
    ┌─────────────────┐
    │                 │
    │     TITLE       │
    │    subtitle     │
    │                 │
    └─────────────────┘
    `,
  },
  {
    id: "title-left",
    name: "Left Title",
    description: "Title aligned to the left with image on right",
    icon: "◧",
    category: "title",
    preview: `
    ┌─────────────────┐
    │ TITLE    │ IMG │
    │ subtitle │     │
    └─────────────────┘
    `,
  },

  // Content Layouts
  {
    id: "content-left-image-right",
    name: "Side Line Boxes",
    description: "Content on left, image on right",
    icon: "◧",
    category: "content",
    preview: `
    ┌─────────────────┐
    │ Title           │
    │ ┌───┐ ┌───┐     │
    │ │ • │ │IMG│     │
    │ │ • │ │   │     │
    │ └───┘ └───┘     │
    └─────────────────┘
    `,
  },
  {
    id: "content-right-image-left",
    name: "Image Left",
    description: "Image on left, content on right",
    icon: "◨",
    category: "content",
    preview: `
    ┌─────────────────┐
    │ Title           │
    │ ┌───┐ ┌───┐     │
    │ │IMG│ │ • │     │
    │ │   │ │ • │     │
    │ └───┘ └───┘     │
    └─────────────────┘
    `,
  },
  {
    id: "content-grid-2",
    name: "Two Column Grid",
    description: "Content in 2 columns",
    icon: "▥",
    category: "content",
    preview: `
    ┌─────────────────┐
    │     Title       │
    │ ┌─────┐ ┌─────┐ │
    │ │  •  │ │  •  │ │
    │ │  •  │ │  •  │ │
    │ └─────┘ └─────┘ │
    └─────────────────┘
    `,
  },
  {
    id: "content-grid-3",
    name: "Three Column Grid",
    description: "Content in 3 columns with icons",
    icon: "▦",
    category: "content",
    preview: `
    ┌─────────────────┐
    │     Title       │
    │ ┌───┐┌───┐┌───┐ │
    │ │ ◉ ││ ◉ ││ ◉ │ │
    │ │txt││txt││txt│ │
    │ └───┘└───┘└───┘ │
    └─────────────────┘
    `,
  },
  {
    id: "content-grid-4",
    name: "Four Card Grid",
    description: "Content in 2x2 grid",
    icon: "⊞",
    category: "content",
    preview: `
    ┌─────────────────┐
    │     Title       │
    │ ┌───┐ ┌───┐     │
    │ │ 1 │ │ 2 │     │
    │ ├───┤ ├───┤     │
    │ │ 3 │ │ 4 │     │
    │ └───┘ └───┘     │
    └─────────────────┘
    `,
  },
  {
    id: "content-cards-2",
    name: "Two Cards",
    description: "Two content cards side by side",
    icon: "▭▭",
    category: "content",
    preview: `
    ┌─────────────────┐
    │     Title       │
    │ ╔═════╗ ╔═════╗ │
    │ ║ ◉   ║ ║ ◉   ║ │
    │ ║ txt ║ ║ txt ║ │
    │ ╚═════╝ ╚═════╝ │
    └─────────────────┘
    `,
  },
  {
    id: "content-cards-3",
    name: "Three Cards",
    description: "Three content cards in a row",
    icon: "▭▭▭",
    category: "content",
    preview: `
    ┌─────────────────┐
    │     Title       │
    │ ╔═══╗╔═══╗╔═══╗ │
    │ ║ ◉ ║║ ◉ ║║ ◉ ║ │
    │ ║txt║║txt║║txt║ │
    │ ╚═══╝╚═══╝╚═══╝ │
    └─────────────────┘
    `,
  },

  // Media Layouts
  {
    id: "content-full-image",
    name: "Full Image",
    description: "Full-bleed image with text overlay",
    icon: "🖼",
    category: "media",
    preview: `
    ┌─────────────────┐
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    │▓▓▓ TITLE ▓▓▓▓▓▓▓│
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    └─────────────────┘
    `,
  },
  {
    id: "content-split-diagonal",
    name: "Diagonal Split",
    description: "Diagonal split between image and content",
    icon: "◢",
    category: "media",
    preview: `
    ┌─────────────────┐
    │▓▓▓▓▓▓▓▓▓│       │
    │▓▓▓▓▓▓▓│  Title  │
    │▓▓▓▓▓│    •      │
    │▓▓▓│      •      │
    └─────────────────┘
    `,
  },

  // Data Layouts
  {
    id: "content-timeline",
    name: "Timeline",
    description: "Horizontal timeline with points",
    icon: "━●━",
    category: "data",
    preview: `
    ┌─────────────────┐
    │     Title       │
    │  ●───●───●───●  │
    │  │   │   │   │  │
    │  1   2   3   4  │
    └─────────────────┘
    `,
  },
  {
    id: "content-comparison",
    name: "Comparison",
    description: "Side by side comparison",
    icon: "⚖",
    category: "data",
    preview: `
    ┌─────────────────┐
    │     Title       │
    │ ┌─────┬─────┐   │
    │ │  A  │  B  │   │
    │ │ ✓ x │ x ✓ │   │
    │ └─────┴─────┘   │
    └─────────────────┘
    `,
  },
  {
    id: "content-quote",
    name: "Quote",
    description: "Large quote with attribution",
    icon: "❝",
    category: "content",
    preview: `
    ┌─────────────────┐
    │                 │
    │  ❝ Quote text   │
    │    goes here ❞  │
    │      — Author   │
    └─────────────────┘
    `,
  },
  {
    id: "content-stats",
    name: "Statistics",
    description: "Big numbers with labels",
    icon: "📊",
    category: "data",
    preview: `
    ┌─────────────────┐
    │     Title       │
    │  ┌───┐ ┌───┐    │
    │  │99%│ │50K│    │
    │  │lbl│ │lbl│    │
    │  └───┘ └───┘    │
    └─────────────────┘
    `,
  },
  {
    id: "content-centered-image",
    name: "Centered Image",
    description: "Image centered with content cards below",
    icon: "🎯",
    category: "media",
    preview: `
    ┌─────────────────┐
    │     Title       │
    │    ┌─────┐      │
    │    │ IMG │      │
    │    └─────┘      │
    │ ┌───┐ ┌───┐     │
    │ │ 1 │ │ 2 │     │
    │ └───┘ └───┘     │
    └─────────────────┘
    `,
  },
  {
    id: "content-feature-showcase",
    name: "Feature Showcase",
    description: "Large image header with feature cards",
    icon: "✨",
    category: "media",
    preview: `
    ┌─────────────────┐
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    │▓▓▓ TITLE ▓▓▓▓▓▓▓│
    │─────────────────│
    │ ┌───┐┌───┐┌───┐ │
    │ │ 1 ││ 2 ││ 3 │ │
    │ └───┘└───┘└───┘ │
    └─────────────────┘
    `,
  },
];

export const getLayoutById = (id: LayoutType): LayoutDefinition | undefined => {
  return slideLayouts.find((layout) => layout.id === id);
};

export const getLayoutsByCategory = (category: LayoutDefinition["category"]): LayoutDefinition[] => {
  return slideLayouts.filter((layout) => layout.category === category);
};
