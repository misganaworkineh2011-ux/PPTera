import { type LayoutType } from "~/lib/slide-layouts";
import type { 
  TransformedContent, 
  IconPlaceholder,
  VisualStrategy 
} from "~/lib/presentation/types";

export interface SlideImage {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  source: string;
}

// Slide Element Types
export type ElementType = 
  | "shape" 
  | "icon" 
  | "callout" 
  | "divider" 
  | "badge" 
  | "quote-box" 
  | "stat-card" 
  | "highlight-box"
  | "arrow"
  | "bracket";

export type ShapeVariant = 
  | "rectangle" 
  | "rounded-rectangle" 
  | "circle" 
  | "oval" 
  | "triangle" 
  | "diamond" 
  | "hexagon" 
  | "star";

export type DividerVariant = 
  | "solid" 
  | "dashed" 
  | "dotted" 
  | "gradient" 
  | "double" 
  | "wave";

export type CalloutVariant = 
  | "info" 
  | "success" 
  | "warning" 
  | "tip" 
  | "note" 
  | "important";

export type BadgeVariant = 
  | "solid" 
  | "outline" 
  | "gradient" 
  | "pill" 
  | "tag";

export interface SlideElement {
  id: string;
  type: ElementType;
  // Position (percentage-based for responsiveness)
  x: number; // 0-100
  y: number; // 0-100
  width: number; // percentage
  height: number; // percentage
  // Content
  content?: string;
  icon?: string; // Lucide icon name
  // Styling
  variant?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  opacity?: number;
  rotation?: number;
  // Additional properties
  fontSize?: "xs" | "sm" | "md" | "lg" | "xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: "left" | "center" | "right";
  zIndex?: number;
}

// Flexible chart data type that accepts both legacy and new formats
export interface SlideChartData {
  type: string;
  title?: string;
  data: Array<{ label: string; value: number; color?: string }>;
  labels?: string[];
  config: Record<string, unknown>;
  css?: string;
}

export interface SlideData {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  // Support both single image (legacy) and multiple images
  image?: SlideImage | null;
  images?: SlideImage[];
  layout?: LayoutType;
  // Enhanced content from visual metadata transformations
  transformedContent?: TransformedContent;
  // Chart data - use flexible type
  chart?: SlideChartData | null;
  icons?: IconPlaceholder[];
  // Slide elements (shapes, callouts, badges, etc.)
  elements?: SlideElement[];
  // Visual metadata for reference
  semanticIntent?: string;
  visualStrategy?: VisualStrategy;
}

export interface PresentationData {
  id: string;
  title: string;
  description: string | null;
  slides: SlideData[];
  content: {
    theme?: string;
    themeConfig?: Record<string, unknown>;
    imageSource?: string;
    metadata?: Record<string, unknown>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EditingState {
  slideIndex: number;
  field: string;
  bulletIndex?: number;
}
