/**
 * Block-based content system for Gamma-like presentation editing
 * This provides a flexible, recursive content model similar to Notion/Gamma
 */

// Block types supported by the system
export type BlockType = 
  | "heading"
  | "paragraph" 
  | "image"
  | "columns"
  | "list"
  | "code"
  | "embed"
  | "divider"
  | "quote"
  | "callout"
  | "chart";

// Base block interface - all blocks extend this
export interface BaseBlock {
  id: string;
  type: BlockType;
  style?: BlockStyle;
  metadata?: Record<string, unknown>;
}

// Style options for blocks
export interface BlockStyle {
  alignment?: "left" | "center" | "right";
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  width?: string | number;
  height?: string | number;
  opacity?: number;
}

// Text-based blocks (heading, paragraph)
export interface TextBlock extends BaseBlock {
  type: "heading" | "paragraph";
  content: string; // HTML or Markdown content
  level?: 1 | 2 | 3 | 4; // For headings
  format?: TextFormat;
}

export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  highlight?: string;
  link?: string;
}

// List block
export interface ListBlock extends BaseBlock {
  type: "list";
  items: ListItem[];
  listType: "bullet" | "ordered" | "checkbox";
  startNumber?: number; // For ordered lists
}

export interface ListItem {
  id: string;
  content: string;
  checked?: boolean; // For checkbox lists
  children?: ListItem[]; // Nested lists
}

// Image block with WYSIWYG features
export interface ImageBlock extends BaseBlock {
  type: "image";
  url: string;
  alt: string;
  caption?: string;
  // Position and size (for drag-and-drop placement)
  position?: {
    x: number; // percentage or pixels
    y: number;
    anchor?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  };
  size?: {
    width: number | string; // percentage or pixels
    height: number | string;
    aspectRatio?: number;
  };
  // Image editing features
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mask?: "none" | "circle" | "rounded" | "blob" | "hexagon";
  filter?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    grayscale?: boolean;
  };
  objectFit?: "cover" | "contain" | "fill" | "none";
  objectPosition?: string;
}

// Column layout block (recursive - can contain other blocks)
export interface ColumnBlock extends BaseBlock {
  type: "columns";
  columns: Column[];
  gap?: string;
  verticalAlign?: "top" | "center" | "bottom" | "stretch";
}

export interface Column {
  id: string;
  width: number; // percentage (all columns should sum to 100)
  blocks: ContentBlock[];
}

// Code block
export interface CodeBlock extends BaseBlock {
  type: "code";
  content: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  filename?: string;
}

// Embed block (videos, iframes, etc.)
export interface EmbedBlock extends BaseBlock {
  type: "embed";
  url: string;
  embedType: "youtube" | "vimeo" | "twitter" | "figma" | "codepen" | "generic";
  aspectRatio?: number;
  allowFullscreen?: boolean;
}

// Divider block
export interface DividerBlock extends BaseBlock {
  type: "divider";
  variant?: "solid" | "dashed" | "dotted" | "gradient";
  thickness?: number;
  color?: string;
}

// Quote block
export interface QuoteBlock extends BaseBlock {
  type: "quote";
  content: string;
  author?: string;
  source?: string;
  variant?: "simple" | "bordered" | "highlighted";
}

// Callout block (info boxes, warnings, etc.)
export interface CalloutBlock extends BaseBlock {
  type: "callout";
  content: string;
  icon?: string;
  variant?: "info" | "warning" | "success" | "error" | "tip";
  title?: string;
}

// Chart block
export interface ChartBlock extends BaseBlock {
  type: "chart";
  chartType: "bar" | "line" | "pie" | "donut" | "area";
  data: ChartData;
  options?: ChartOptions;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface ChartOptions {
  showLegend?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  animate?: boolean;
}

// Union type for all content blocks
export type ContentBlock = 
  | TextBlock 
  | ListBlock 
  | ImageBlock 
  | ColumnBlock 
  | CodeBlock 
  | EmbedBlock 
  | DividerBlock 
  | QuoteBlock 
  | CalloutBlock
  | ChartBlock;

// Extended SlideData with block support
export interface BlockSlideData {
  id: string;
  title?: string;
  blocks: ContentBlock[];
  layoutMode: "flow" | "canvas"; // flow = Gamma-style, canvas = free positioning
  background?: SlideBackground;
  transition?: SlideTransition;
}

export interface SlideBackground {
  type: "solid" | "gradient" | "image";
  value: string; // color, gradient CSS, or image URL
  overlay?: string; // optional overlay color with opacity
}

export interface SlideTransition {
  type: "fade" | "slide" | "zoom" | "none";
  duration?: number;
  direction?: "left" | "right" | "up" | "down";
}

// Helper functions
export function createBlock<T extends ContentBlock>(type: T["type"], data: Partial<T>): T {
  return {
    id: generateBlockId(),
    type,
    ...data,
  } as T;
}

export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

// Type guards
export function isTextBlock(block: ContentBlock): block is TextBlock {
  return block.type === "heading" || block.type === "paragraph";
}

export function isListBlock(block: ContentBlock): block is ListBlock {
  return block.type === "list";
}

export function isImageBlock(block: ContentBlock): block is ImageBlock {
  return block.type === "image";
}

export function isColumnBlock(block: ContentBlock): block is ColumnBlock {
  return block.type === "columns";
}

export function isCodeBlock(block: ContentBlock): block is CodeBlock {
  return block.type === "code";
}

export function isEmbedBlock(block: ContentBlock): block is EmbedBlock {
  return block.type === "embed";
}

export function isChartBlock(block: ContentBlock): block is ChartBlock {
  return block.type === "chart";
}
