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
import type { SequenceLayoutType } from "~/lib/layouts/content/sequence";
import type { CascadingLayoutType } from "~/lib/layouts/content/cascading";
import type { ChevronLayoutType } from "~/lib/layouts/content/chevron";
import type { FunnelLayoutType } from "~/lib/layouts/content/funnel";
import type { ProsConsLayoutType } from "~/lib/layouts/content/proscons";
import type { BeforeAfterLayoutType } from "~/lib/layouts/content/beforeafter";
import type { ComparisonLayoutType } from "~/lib/layouts/content/comparison";
import type { BentoLayoutType } from "~/lib/layouts/content/bento";
import type { TimelineLayoutType } from "~/lib/layouts/content/timeline";
import type { SpotlightLayoutType } from "~/lib/layouts/content/spotlight";
import type { AgendaLayoutType } from "~/lib/layouts/content/agenda";
import type { PyramidLayoutType } from "~/lib/layouts/content/pyramid";
import type { MatrixLayoutType } from "~/lib/layouts/content/matrix";
import type { CalloutLayoutType } from "~/lib/layouts/content/callout";
import type { TableLayoutType } from "~/lib/layouts/content/table";
import type { DashboardLayoutType } from "~/lib/layouts/content/dashboard";
import type { TeamLayoutType } from "~/lib/layouts/content/team";
import type { IconGridLayoutType } from "~/lib/layouts/content/icongrid";
import type { HubSpokeLayoutType } from "~/lib/layouts/content/hubspoke";
import type { CycleLayoutType } from "~/lib/layouts/content/cycle";
import type { ShowcaseLayoutType } from "~/lib/layouts/content/showcase";
import type { ChecklistLayoutType } from "~/lib/layouts/content/checklist";
import type { RoadmapLayoutType } from "~/lib/layouts/content/roadmap";
import type { ZigzagLayoutType } from "~/lib/layouts/content/zigzag";
import type { DefinitionListLayoutType } from "~/lib/layouts/content/definitionlist";
import type { EditorialLayoutType } from "~/lib/layouts/content/editorial";
import type { OrbitLayoutType } from "~/lib/layouts/content/orbit";
import type { SlideLayoutType, ImageSize, ImageShape } from "~/lib/layouts/slide";
import type { ChartData, ChartConfig } from "~/lib/charts/types";

// Animation type for slides
export type SlideAnimationType = string; // Animation preset ID from ~/lib/animations

// Combined content layout type for all categories
export type ContentLayoutType = 
  | BoxLayoutType 
  | StepsLayoutType 
  | BulletLayoutType 
  | QuotesLayoutType 
  | ImageLayoutType 
  | CircleLayoutType
  | SequenceLayoutType
  | CascadingLayoutType
  | ChevronLayoutType
  | FunnelLayoutType
  | ProsConsLayoutType
  | BeforeAfterLayoutType
  | ComparisonLayoutType
  | BentoLayoutType
  | TimelineLayoutType
  | SpotlightLayoutType
  | AgendaLayoutType
  | PyramidLayoutType
  | MatrixLayoutType
  | CalloutLayoutType
  | TableLayoutType
  | DashboardLayoutType
  | TeamLayoutType
  | IconGridLayoutType
  | HubSpokeLayoutType
  | CycleLayoutType
  | ShowcaseLayoutType
  | ChecklistLayoutType
  | RoadmapLayoutType
  | ZigzagLayoutType
  | DefinitionListLayoutType
  | EditorialLayoutType
  | OrbitLayoutType;

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

export type EmbedProvider = "youtube" | "vimeo" | "loom" | "figma" | "generic";

// An embedded interactive element (video, web page, prototype) shown on a slide.
export interface SlideEmbed {
  url: string; // the original URL the user pasted
  provider?: EmbedProvider;
  caption?: string;
}

// Cover (title-slide) composition. "signature" (or unset) renders the theme's
// own hero design; the rest are theme-aware compositions the user can pick in
// the Cover style panel.
export type CoverLayoutId =
  | "signature"
  | "editorial"
  | "band"
  | "minimal"
  | "frame"
  | "angle"
  | "glasscard"
  | "rail"
  | "poster"
  | "swiss"
  | "wash"
  | "portal";

// Covers that keep the title image as a full-bleed backdrop rendered OUTSIDE
// TitleSlide (editor, present and export all consult this). The others draw
// their own image treatment (side panel, clipped slant, circle...) or are
// deliberately image-free.
const FULL_BLEED_COVERS: ReadonlyArray<CoverLayoutId> = [
  "signature",
  "band",
  "frame",
  "glasscard",
  "poster",
  "wash",
];

export function coverUsesFullBleed(cover?: CoverLayoutId): boolean {
  return !cover || FULL_BLEED_COVERS.includes(cover);
}

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
  // Short uppercase kicker/eyebrow label shown above a content slide's heading
  // (e.g. "STEP 2", "KEY INSIGHT"). 1–3 words.
  kicker?: string;
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
  // Embedded media (YouTube, Vimeo, Loom, Figma, or any iframe-able URL)
  embed?: SlideEmbed | null;
  icons?: IconPlaceholder[];
  // Visual metadata for reference
  semanticIntent?: string;
  visualStrategy?: VisualStrategy;
  // Block-based content (Gamma-style)
  blocks?: ContentBlock[];
  layoutMode?: "legacy" | "flow" | "canvas";
  // Animation for present mode
  animation?: SlideAnimationType;
  // Enable/disable content animations (bullets, boxes, etc.)
  contentAnimation?: boolean;
  // Entrance style for content items while presenting (see item-animations.ts).
  // Unset = "fade-up".
  itemAnimation?: string;
  // When true, items are revealed one by one on Next while presenting
  // (PowerPoint-style builds) instead of auto-staggering in.
  itemBuild?: boolean;
  // Manual drag offsets and sizes (in canvas px, 1280x720 space) for blocks,
  // keyed by block id ("title" | "content" | "image"). x/y apply as a translate
  // and w/h as an explicit width/height on top of the auto-layout so a user can
  // nudge and resize components without leaving the layout system. Missing w/h
  // means natural (auto) size.
  blockOffsets?: Record<string, { x: number; y: number; w?: number; h?: number }>;
  // Cover composition for title slides (ignored on content slides).
  coverLayout?: CoverLayoutId;
}

export type MasterCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type MasterPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
export type FooterAlign = "left" | "center" | "right";
export type BarPosition = "top" | "bottom";
export type NumberFormat = "plain" | "fraction" | "padded" | "labeled";
export type MasterTextSize = "sm" | "md" | "lg";

/**
 * Presentation-wide "master slide" settings. These render as a consistent
 * overlay on every slide (editor + present), the way a master slide / slide
 * template works in PowerPoint or Keynote. Colors that accept "auto" (or are
 * omitted) derive from the active theme.
 */
export interface MasterSlideSettings {
  logo?: {
    url: string;
    position: MasterPosition;
    size: number; // logo height in canvas px (canvas is 1280x720)
    opacity: number; // 0..1
  } | null;
  footer?: {
    text: string;
    show: boolean;
    align: FooterAlign;
    color?: string; // "auto" | hex
    size?: MasterTextSize; // legacy; superseded by fontSize
    fontSize?: number; // px (canvas space)
  } | null;
  slideNumbers?: {
    show: boolean;
    align: FooterAlign;
    format?: NumberFormat; // "plain" | "fraction" | "padded" | "labeled"
    startAt?: number; // number shown on the first slide (default 1)
    color?: string; // "auto" | hex
    fontSize?: number; // px (canvas space)
  } | null;
  date?: {
    show: boolean;
    align: FooterAlign;
    mode: "auto" | "custom"; // auto = today's date, custom = fixed text
    text?: string; // used when mode === "custom"
    color?: string; // "auto" | hex
    fontSize?: number; // px (canvas space)
  } | null;
  accentBar?: {
    show: boolean;
    position: BarPosition; // top | bottom edge strip
    color?: string; // "auto" | hex
    thickness?: number; // px (canvas space)
  } | null;
  statusTag?: {
    show: boolean;
    text: string; // e.g. "Confidential", "Draft"
    position: MasterPosition;
    color?: string; // badge fill, "auto" => theme accent
  } | null;
  /** Distance (px, canvas space) of master elements from the slide edges. */
  margin?: number;
  /** Keep the title (first) slide clean — don't paint master elements on it. */
  hideOnTitle?: boolean;
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
    masterSlide?: MasterSlideSettings;
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
