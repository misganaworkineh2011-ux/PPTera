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
  // Share settings
  isPublic?: boolean;
  shareToken?: string | null;
}

export interface EditingState {
  slideIndex: number;
  field: string;
  bulletIndex?: number;
}
