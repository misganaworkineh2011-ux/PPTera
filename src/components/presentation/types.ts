import { type LayoutType } from "~/lib/slide-layouts";
import type {
  TransformedContent,
  IconPlaceholder,
  VisualStrategy
} from "~/lib/presentation/types";
import type { ContentBlock } from "~/lib/blocks/types";
import type { BoxLayoutType } from "~/lib/layouts/content/boxes";
import type { StepsLayoutType } from "~/lib/layouts/content/steps";
import type { BulletLayoutType } from "~/lib/layouts/content/bullets";
import type { QuotesLayoutType } from "~/lib/layouts/content/quotes";
import type { ImageLayoutType } from "~/lib/layouts/content/images";
import type { CircleLayoutType } from "~/lib/layouts/content/circles";
import type { SlideLayoutType, ImageSize, ImageShape } from "~/lib/layouts/slide";
import type { ChartData, ChartConfig } from "~/lib/charts/types";

// Combined content layout type for all categories
export type ContentLayoutType = 
  | BoxLayoutType 
  | StepsLayoutType 
  | BulletLayoutType 
  | QuotesLayoutType 
  | ImageLayoutType 
  | CircleLayoutType;

export interface SlideImage {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  source: string;
  // Image editing properties
  filter?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  objectFit?: "cover" | "contain" | "fill" | "none";
}

// Re-export ChartData for use in slides - this ensures type compatibility
export type SlideChartData = ChartData;

export interface SlideData {
  type: "title" | "content";
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  // Speaker notes - detailed explanations for the presenter (one per bullet)
  speakerNotes?: string[];
  // New: sections for card-style layouts (from LLM transformation)
  sections?: Array<{
    heading: string;
    description: string;
  }>;
  // New: intro text before content
  introText?: string;
  // New: slide description - simple 2-line description between title and content
  slideDescription?: string;
  // New: tagline for title slides
  tagline?: string;
  // Support both single image (legacy) and multiple images
  image?: SlideImage | null;
  images?: SlideImage[];
  layout?: LayoutType;
  // New slide layout system (image position)
  slideLayout?: SlideLayoutType;
  // Image size for slide layout
  imageSize?: ImageSize;
  // Image shape for slide layout (rectangle, rounded, circle)
  imageShape?: ImageShape;
  // Content layout for box arrangements
  contentLayout?: ContentLayoutType;
  // Enhanced content from visual metadata transformations
  transformedContent?: TransformedContent;
  // Chart data - use flexible type
  chart?: SlideChartData | null;
  icons?: IconPlaceholder[];
  // Visual metadata for reference
  semanticIntent?: string;
  visualStrategy?: VisualStrategy;
  // Block-based content (Gamma-style)
  blocks?: ContentBlock[];
  layoutMode?: "legacy" | "flow" | "canvas";
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
  // Share settings
  isPublic?: boolean;
  shareToken?: string | null;
}

export interface EditingState {
  slideIndex: number;
  field: string;
  bulletIndex?: number;
}
