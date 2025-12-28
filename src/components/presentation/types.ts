import { type LayoutType } from "~/lib/slide-layouts";
import type {
  TransformedContent,
  IconPlaceholder,
  VisualStrategy
} from "~/lib/presentation/types";
import type { ContentBlock } from "~/lib/blocks/types";
import type { BoxLayoutType } from "~/lib/layouts/content/boxes";
import type { SlideLayoutType, ImageSize } from "~/lib/layouts/slide";

export interface SlideImage {
  url: string;
  alt: string;
  photographer?: string;
  photographerUrl?: string;
  source: string;
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
  // New: sections for card-style layouts (from LLM transformation)
  sections?: Array<{
    heading: string;
    description: string;
  }>;
  // New: intro text before content
  introText?: string;
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
  // Content layout for box arrangements
  contentLayout?: BoxLayoutType;
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
