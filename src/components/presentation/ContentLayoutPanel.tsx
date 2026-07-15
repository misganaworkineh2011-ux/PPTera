"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import {
  X, LayoutGrid, CheckCircle2, ChevronDown,
  List, ListOrdered, ListChecks, Quote, Image as ImageIcon, Circle, ChevronsRight,
  Layers, Filter, Scale, ArrowLeftRight, Newspaper, Orbit, LayoutDashboard, Clock,
  Sparkles, Triangle, MessageSquare, Table, Gauge, Users, Share2, RefreshCw, Star,
  CheckSquare, Map as MapIcon, Zap, BookOpen,
  DollarSign, Grid3x3, Columns3, Network,
} from "lucide-react";
import type { Theme } from "~/lib/themes";
import { getThemeType } from "~/app/presentation/[slug]/components/types";
import { getModalColors } from "~/app/presentation/[slug]/components/ui-colors";
import { ALL_STYLE_CATEGORIES } from "~/lib/layouts/style-catalog";
import type { ContentLayoutType, CoverLayoutId } from "./types";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

// Import actual layout renderers
import BoxLayoutRenderer from "./BoxLayoutRenderer";
import { BulletLayoutRenderer } from "~/components/layouts/BulletLayoutRenderer";
import { StepsLayoutRenderer } from "~/components/layouts/StepsLayoutRenderer";
import { QuotesLayoutRenderer } from "~/components/layouts/QuotesLayoutRenderer";
import { CircleLayoutRenderer } from "~/components/layouts/CircleLayoutRenderer";
import SequenceLayoutRenderer from "./SequenceLayoutRenderer";
import { CascadingWorkflowRenderer } from "~/components/layouts/CascadingWorkflowRenderer";
import { ChevronFlowRenderer } from "~/components/layouts/ChevronFlowRenderer";
import { FunnelStepsRenderer } from "~/components/layouts/FunnelStepsRenderer";
import { ProsConsRenderer } from "~/components/layouts/ProsConsRenderer";
import { BeforeAfterRenderer } from "~/components/layouts/BeforeAfterRenderer";
import { ComparisonRenderer } from "~/components/layouts/ComparisonRenderer";
import { BentoGridRenderer } from "~/components/layouts/BentoGridRenderer";
import { TimelineRoadmapRenderer } from "~/components/layouts/TimelineRoadmapRenderer";
import { SpotlightStatementRenderer } from "~/components/layouts/SpotlightStatementRenderer";
import { AgendaListRenderer } from "~/components/layouts/AgendaListRenderer";
import { PyramidRenderer } from "~/components/layouts/PyramidRenderer";
import { QuadrantMatrixRenderer } from "~/components/layouts/QuadrantMatrixRenderer";
import { CalloutBoxRenderer } from "~/components/layouts/CalloutBoxRenderer";
import { PricingRenderer } from "~/components/layouts/PricingRenderer";
import { FeatureMatrixRenderer } from "~/components/layouts/FeatureMatrixRenderer";
import { KanbanRenderer } from "~/components/layouts/KanbanRenderer";
import { OrgChartRenderer } from "~/components/layouts/OrgChartRenderer";
import { DataTableRenderer } from "~/components/layouts/DataTableRenderer";
import { StatDashboardRenderer } from "~/components/layouts/StatDashboardRenderer";
import { TeamGridRenderer } from "~/components/layouts/TeamGridRenderer";
import { IconGridRenderer } from "~/components/layouts/IconGridRenderer";
import { HubSpokeRenderer } from "~/components/layouts/HubSpokeRenderer";
import { CycleDiagramRenderer } from "~/components/layouts/CycleDiagramRenderer";
import { FeatureShowcaseRenderer } from "~/components/layouts/FeatureShowcaseRenderer";
import { ChecklistRenderer } from "~/components/layouts/ChecklistRenderer";
import { RoadmapRenderer } from "~/components/layouts/RoadmapRenderer";
import { ZigzagRenderer } from "~/components/layouts/ZigzagRenderer";
import { DefinitionListRenderer } from "~/components/layouts/DefinitionListRenderer";
import { EditorialListRenderer } from "~/components/layouts/EditorialListRenderer";
import { OrbitDiagramRenderer } from "~/components/layouts/OrbitDiagramRenderer";
import type { EditorialLayoutType } from "~/lib/layouts/content/editorial";
import type { OrbitLayoutType } from "~/lib/layouts/content/orbit";

import type { BoxLayoutType, BoxContentItem } from "~/lib/layouts/content/boxes";
import type { BulletLayoutType, BulletContentItem } from "~/lib/layouts/content/bullets";
import type { StepsLayoutType, StepContentItem } from "~/lib/layouts/content/steps";
import type { QuotesLayoutType, QuoteContentItem } from "~/lib/layouts/content/quotes";
import type { CircleLayoutType, CircleContentItem } from "~/lib/layouts/content/circles";
import type { SequenceLayoutType, SequenceContentItem } from "~/lib/layouts/content/sequence";
import type { CascadingLayoutType, CascadingContentItem } from "~/lib/layouts/content/cascading";
import type { ChevronLayoutType, ChevronContentItem } from "~/lib/layouts/content/chevron";
import type { FunnelLayoutType, FunnelContentItem } from "~/lib/layouts/content/funnel";
import type { ProsConsLayoutType, ProsConsContentItem } from "~/lib/layouts/content/proscons";
import type { BeforeAfterLayoutType, BeforeAfterContentItem } from "~/lib/layouts/content/beforeafter";
import type { ComparisonLayoutType, ComparisonContentItem } from "~/lib/layouts/content/comparison";

// Panel width constant - used for both panel and main content offset
export const CONTENT_LAYOUT_PANEL_WIDTH = 420;
// Header height - panel starts below the header
const HEADER_HEIGHT = 53;

// Re-export the type for convenience
export type ContentLayoutId = ContentLayoutType;

// Layout category definition
type LayoutCategory =
  | "boxes" | "steps" | "bullets" | "quotes" | "images" | "circles" | "sequence"
  | "cascading" | "chevron" | "funnel" | "proscons" | "beforeafter" | "comparison"
  | "editorial" | "orbit" | "bento" | "timeline" | "spotlight" | "agenda"
  | "pyramid" | "matrix" | "callout" | "table" | "dashboard" | "team"
  | "icongrid" | "hubspoke" | "cycle" | "showcase" | "checklist" | "roadmap"
  | "zigzag" | "definitionlist" | "pricing" | "featurematrix" | "kanban" | "orgchart";

interface LayoutCategoryConfig {
  id: LayoutCategory;
  name: string;
  description: string;
  layouts: Array<{
    id: string;
    name: string;
    description: string;
    minItems: number;
    maxItems: number;
    idealItems: number;
    supportsIcons?: boolean;
  }>;
}

// Get category from layout ID
function getCategoryFromLayoutId(layoutId: string): LayoutCategory {
  if (layoutId.startsWith("box-")) return "boxes";
  if (layoutId.startsWith("steps-")) return "steps";
  if (layoutId.startsWith("bullet-")) return "bullets";
  if (layoutId.startsWith("quote-")) return "quotes";
  if (layoutId.startsWith("image-")) return "images";
  if (layoutId.startsWith("circle-")) return "circles";
  if (layoutId.startsWith("sequence-")) return "sequence";
  if (layoutId.startsWith("cascading-")) return "cascading";
  if (layoutId.startsWith("chevron-")) return "chevron";
  if (layoutId.startsWith("funnel-")) return "funnel";
  if (layoutId.startsWith("proscons-")) return "proscons";
  if (layoutId.startsWith("beforeafter-")) return "beforeafter";
  if (layoutId.startsWith("comparison-")) return "comparison";
  if (layoutId.startsWith("editorial-")) return "editorial";
  if (layoutId.startsWith("orbit-")) return "orbit";
  if (layoutId.startsWith("bento-")) return "bento";
  if (layoutId.startsWith("timeline-")) return "timeline";
  if (layoutId.startsWith("spotlight-")) return "spotlight";
  if (layoutId.startsWith("agenda-")) return "agenda";
  if (layoutId.startsWith("pyramid-")) return "pyramid";
  if (layoutId.startsWith("matrix-")) return "matrix";
  if (layoutId.startsWith("callout-")) return "callout";
  if (layoutId.startsWith("table-")) return "table";
  if (layoutId.startsWith("dashboard-")) return "dashboard";
  if (layoutId.startsWith("team-")) return "team";
  if (layoutId.startsWith("icongrid-")) return "icongrid";
  if (layoutId.startsWith("hubspoke-")) return "hubspoke";
  if (layoutId.startsWith("cycle-")) return "cycle";
  if (layoutId.startsWith("showcase-")) return "showcase";
  if (layoutId.startsWith("checklist-")) return "checklist";
  if (layoutId.startsWith("roadmap-")) return "roadmap";
  if (layoutId.startsWith("zigzag-")) return "zigzag";
  if (layoutId.startsWith("definitionlist-")) return "definitionlist";
  if (layoutId.startsWith("pricing-")) return "pricing";
  if (layoutId.startsWith("featurematrix-")) return "featurematrix";
  if (layoutId.startsWith("kanban-")) return "kanban";
  if (layoutId.startsWith("orgchart-")) return "orgchart";
  return "boxes";
}
// Style metadata for every family lives in the shared style catalog —
// generation's random style picker uses the exact same source.
const allCategories = ALL_STYLE_CATEGORIES as unknown as LayoutCategoryConfig[];

// Super-groups so the 33 categories read as organized families instead of a
// flat wall. Every category must appear in exactly one group.
const CATEGORY_GROUPS: Array<{ name: string; categories: LayoutCategory[] }> = [
  { name: "Cards & Grids", categories: ["boxes", "bento", "icongrid", "showcase", "zigzag", "team", "pricing"] },
  { name: "Lists & Text", categories: ["editorial", "bullets", "agenda", "checklist", "definitionlist", "callout", "spotlight", "quotes"] },
  { name: "Process & Flow", categories: ["steps", "sequence", "timeline", "roadmap", "cascading", "chevron", "funnel", "cycle", "kanban"] },
  { name: "Diagrams & Relationships", categories: ["orbit", "circles", "hubspoke", "pyramid", "matrix", "proscons", "beforeafter", "comparison", "orgchart"] },
  { name: "Data & Numbers", categories: ["dashboard", "table", "featurematrix"] },
  { name: "Images & Media", categories: ["images"] },
];

interface ContentLayoutPanelProps {
  isOpen: boolean;
  currentContentLayout: ContentLayoutId;
  contentItems: Array<{ label?: string; text: string }>;
  theme: Theme;
  onSelectContentLayout: (layoutId: ContentLayoutId) => void;
  onClose: () => void;
  // Cover mode: when the active slide is the title slide the panel offers
  // cover compositions instead of content layouts.
  coverSlide?: boolean;
  currentCoverLayout?: CoverLayoutId;
  onSelectCoverLayout?: (layoutId: CoverLayoutId) => void;
}

// ---------------------------------------------------------------------------
// Family icons for the accordion headers (fallback: LayoutGrid)
// ---------------------------------------------------------------------------
const CATEGORY_ICONS: Partial<Record<LayoutCategory, typeof LayoutGrid>> = {
  boxes: LayoutGrid,
  steps: ListOrdered,
  bullets: List,
  quotes: Quote,
  images: ImageIcon,
  circles: Circle,
  sequence: ChevronsRight,
  cascading: Layers,
  chevron: ChevronsRight,
  funnel: Filter,
  proscons: Scale,
  beforeafter: ArrowLeftRight,
  comparison: ArrowLeftRight,
  editorial: Newspaper,
  orbit: Orbit,
  bento: LayoutDashboard,
  timeline: Clock,
  spotlight: Sparkles,
  agenda: ListChecks,
  pyramid: Triangle,
  matrix: LayoutGrid,
  callout: MessageSquare,
  table: Table,
  dashboard: Gauge,
  team: Users,
  icongrid: LayoutGrid,
  hubspoke: Share2,
  cycle: RefreshCw,
  showcase: Star,
  checklist: CheckSquare,
  roadmap: MapIcon,
  zigzag: Zap,
  definitionlist: BookOpen,
  pricing: DollarSign,
  featurematrix: Grid3x3,
  kanban: Columns3,
  orgchart: Network,
};

// ---------------------------------------------------------------------------
// Cover (title slide) styles
// ---------------------------------------------------------------------------
const COVER_STYLES: Array<{ id: CoverLayoutId; name: string; description: string }> = [
  {
    id: "signature",
    name: "Theme Signature",
    description: "Each theme's own hero design — centered title with the theme's decorative identity.",
  },
  {
    id: "editorial",
    name: "Editorial Split",
    description: "Left-aligned masthead with a full-height image panel on the right.",
  },
  {
    id: "band",
    name: "Cinematic Band",
    description: "Full-bleed image with a glass title band anchored along the bottom.",
  },
  {
    id: "glasscard",
    name: "Glass Card",
    description: "Full-bleed image with a floating frosted-glass title card.",
  },
  {
    id: "angle",
    name: "Angle Split",
    description: "Dynamic diagonal split — the image is cropped on a slant with an accent edge.",
  },
  {
    id: "portal",
    name: "Portal",
    description: "Circular image portal with an accent orbit ring beside the masthead.",
  },
  {
    id: "wash",
    name: "Accent Wash",
    description: "Cinematic duotone wash in your theme's accent over the cover image.",
  },
  {
    id: "poster",
    name: "Poster Type",
    description: "Oversized poster typography between hairline bars, over a deep image wash.",
  },
  {
    id: "rail",
    name: "Vertical Rail",
    description: "Editorial side rail with vertical meta type and a framed image column.",
  },
  {
    id: "minimal",
    name: "Minimal Type",
    description: "Pure typography — oversized ghost numeral, hairlines, no image.",
  },
  {
    id: "frame",
    name: "Framed Classic",
    description: "Centered composition inside a fine double frame with accent corners.",
  },
  {
    id: "swiss",
    name: "Swiss Grid",
    description: "Bottom-anchored Swiss typography with a crosshair grid cluster.",
  },
];

/** Tiny abstract mock of each cover composition for the picker cards. */
function CoverStylePreview({ id, accent, ink, hairline }: { id: CoverLayoutId; accent: string; ink: string; hairline: string }) {
  const bar = (w: string, h = 5, color = ink, opacity = 0.55) => (
    <div style={{ width: w, height: h, background: color, opacity, borderRadius: 2 }} />
  );
  const imageBlock = (
    <div className="w-full h-full relative" style={{ background: `linear-gradient(135deg, ${accent}4D, ${accent}1A)` }}>
      <div className="absolute rounded-full" style={{ width: 8, height: 8, background: accent, opacity: 0.8, top: 6, right: 8 }} />
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "40%", background: `linear-gradient(to top right, ${accent}40, transparent)` }} />
    </div>
  );

  return (
    <div className="w-full rounded-lg overflow-hidden relative" style={{ aspectRatio: "16/9", border: `1px solid ${hairline}` }}>
      {id === "signature" && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
          {bar("55%", 6)}
          {bar("38%", 4, ink, 0.3)}
          <div className="mt-1.5 rotate-45" style={{ width: 5, height: 5, background: accent }} />
        </div>
      )}
      {id === "editorial" && (
        <div className="w-full h-full flex">
          <div className="h-full flex flex-col justify-center gap-1.5 pl-3" style={{ width: "58%" }}>
            <div style={{ width: 16, height: 2, background: accent, borderRadius: 2 }} />
            {bar("80%", 6)}
            {bar("60%", 4, ink, 0.3)}
          </div>
          <div className="h-full" style={{ width: "42%", borderLeft: `2px solid ${accent}` }}>{imageBlock}</div>
        </div>
      )}
      {id === "band" && (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1">{imageBlock}</div>
          <div className="flex flex-col justify-center gap-1 px-3" style={{ height: "42%", borderTop: `1px solid ${hairline}` }}>
            <div style={{ width: 14, height: 2.5, background: accent, borderRadius: 2 }} />
            {bar("65%", 5)}
            {bar("45%", 3, ink, 0.3)}
          </div>
        </div>
      )}
      {id === "minimal" && (
        <div className="w-full h-full relative flex flex-col justify-center gap-1.5 pl-3">
          <span className="absolute font-bold select-none" style={{ fontSize: 44, lineHeight: 1, color: ink, opacity: 0.08, right: 4, top: -4 }}>01</span>
          <div style={{ width: 14, height: 2, background: accent, borderRadius: 2 }} />
          {bar("70%", 7)}
          <div className="flex items-center gap-1.5">
            <div style={{ width: 12, height: 2.5, background: accent, borderRadius: 2 }} />
            <div style={{ width: 28, height: 1, background: hairline }} />
          </div>
          {bar("50%", 3.5, ink, 0.3)}
        </div>
      )}
      {id === "frame" && (
        <div className="w-full h-full relative flex flex-col items-center justify-center gap-1.5">
          <div className="absolute" style={{ inset: 5, border: `1px solid ${hairline}` }} />
          <div className="absolute" style={{ inset: 8, border: `1px solid ${accent}40` }} />
          <div className="absolute" style={{ top: 5, left: 5, width: 7, height: 7, borderTop: `1.5px solid ${accent}`, borderLeft: `1.5px solid ${accent}` }} />
          <div className="absolute" style={{ bottom: 5, right: 5, width: 7, height: 7, borderBottom: `1.5px solid ${accent}`, borderRight: `1.5px solid ${accent}` }} />
          {bar("50%", 6)}
          {bar("34%", 3.5, ink, 0.3)}
        </div>
      )}
      {id === "angle" && (
        <div className="w-full h-full relative">
          <div className="absolute inset-y-0 right-0" style={{ width: "56%", clipPath: "polygon(24% 0, 100% 0, 100% 100%, 0 100%)", background: accent, transform: "translateX(-3px)" }} />
          <div className="absolute inset-y-0 right-0" style={{ width: "56%", clipPath: "polygon(24% 0, 100% 0, 100% 100%, 0 100%)" }}>{imageBlock}</div>
          <div className="absolute inset-y-0 left-0 flex flex-col justify-center gap-1.5 pl-3" style={{ width: "46%" }}>
            <div style={{ width: 14, height: 2, background: accent, borderRadius: 2 }} />
            {bar("90%", 6)}
            {bar("65%", 3.5, ink, 0.3)}
          </div>
        </div>
      )}
      {id === "glasscard" && (
        <div className="w-full h-full relative">
          <div className="absolute inset-0">{imageBlock}</div>
          <div className="absolute rounded-md flex flex-col justify-center gap-1 px-2" style={{ left: 8, top: "18%", bottom: "18%", width: "52%", background: `${ink}12`, border: `1px solid ${hairline}`, backdropFilter: "blur(2px)" }}>
            <div style={{ width: 12, height: 2.5, background: accent, borderRadius: 2 }} />
            {bar("85%", 5)}
            {bar("60%", 3, ink, 0.3)}
          </div>
        </div>
      )}
      {id === "rail" && (
        <div className="w-full h-full relative flex">
          <div className="h-full" style={{ width: 4, background: accent }} />
          <div className="h-full" style={{ width: 10, borderRight: `1px solid ${hairline}` }} />
          <div className="flex-1 h-full flex flex-col justify-center gap-1.5 pl-2.5">
            <div style={{ width: 14, height: 2, background: accent, borderRadius: 2 }} />
            {bar("80%", 5.5)}
            {bar("55%", 3.5, ink, 0.3)}
          </div>
          <div className="h-full py-2 pr-2" style={{ width: "30%" }}>
            <div className="w-full h-full" style={{ border: `1px solid ${hairline}` }}>{imageBlock}</div>
          </div>
        </div>
      )}
      {id === "poster" && (
        <div className="w-full h-full relative flex flex-col justify-center gap-1.5 px-3">
          <div className="absolute left-3 right-3" style={{ top: 8, height: 1, background: hairline }} />
          <div className="absolute left-3 right-3" style={{ bottom: 8, height: 1, background: hairline }} />
          {bar("92%", 9)}
          {bar("70%", 9)}
          <div style={{ width: 24, height: 4, background: accent }} />
        </div>
      )}
      {id === "swiss" && (
        <div className="w-full h-full relative flex flex-col justify-end gap-1.5 p-3">
          <div className="absolute grid grid-cols-3 gap-1" style={{ top: 8, right: 10 }}>
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} style={{ width: 3, height: 3, background: i === 4 ? accent : hairline, borderRadius: 1 }} />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <div style={{ width: 5, height: 5, background: accent }} />
            <div style={{ width: 14, height: 2, background: ink, opacity: 0.3, borderRadius: 2 }} />
          </div>
          {bar("75%", 6.5)}
          {bar("45%", 3.5, ink, 0.3)}
        </div>
      )}
      {id === "wash" && (
        <div className="w-full h-full relative flex flex-col justify-end gap-1.5 p-3" style={{ background: `linear-gradient(125deg, ${accent}E6, ${accent}66 55%, ${accent}26)` }}>
          <span className="absolute font-bold select-none" style={{ fontSize: 40, lineHeight: 1, color: "#ffffff", opacity: 0.14, right: 5, top: -3 }}>01</span>
          {bar("70%", 6, "#ffffff", 0.95)}
          {bar("45%", 3.5, "#ffffff", 0.6)}
        </div>
      )}
      {id === "portal" && (
        <div className="w-full h-full relative">
          <div className="absolute rounded-full overflow-hidden" style={{ top: "12%", bottom: "12%", right: -18, aspectRatio: "1/1", border: `1.5px solid ${accent}66` }}>{imageBlock}</div>
          <div className="absolute rounded-full" style={{ width: 5, height: 5, background: accent, top: "16%", right: 38 }} />
          <div className="absolute inset-y-0 left-0 flex flex-col justify-center gap-1.5 pl-3" style={{ width: "55%" }}>
            <div style={{ width: 14, height: 2, background: accent, borderRadius: 2 }} />
            {bar("85%", 6)}
            {bar("60%", 3.5, ink, 0.3)}
          </div>
        </div>
      )}
    </div>
  );
}

// Scaled preview component that renders actual layouts
function ScaledLayoutPreview({
  category,
  layoutId,
  contentItems,
  theme,
}: {
  category: LayoutCategory;
  layoutId: string;
  contentItems: Array<{ label?: string; text: string }>;
  theme: Theme;
}) {
  const accentColor = theme.colors.accent || "#06b6d4";
  
  // Use actual content or fallback to sample content
  const items = contentItems.length > 0 
    ? contentItems 
    : [
        { label: "First Point", text: "Description of the first key point" },
        { label: "Second Point", text: "Description of the second key point" },
        { label: "Third Point", text: "Description of the third key point" },
      ];

  // Scale factor for the preview (renders at full size then scales down)
  // Card width is roughly 180px, so scale = 180/800 ≈ 0.225
  const scale = 0.22;
  const previewWidth = 800; // Virtual width for rendering
  const previewHeight = 450; // Virtual height for rendering

  const renderLayout = () => {
    switch (category) {
      case "boxes":
        return (
          <BoxLayoutRenderer
            layoutId={layoutId as BoxLayoutType}
            items={items as BoxContentItem[]}
            theme={theme}
            compact={false}
          />
        );
      
      case "bullets":
        return (
          <BulletLayoutRenderer
            layoutId={layoutId as BulletLayoutType}
            items={items as BulletContentItem[]}
            accentColor={accentColor}
          />
        );
      
      case "steps":
        return (
          <StepsLayoutRenderer
            layoutId={layoutId as StepsLayoutType}
            items={items as StepContentItem[]}
            accentColor={accentColor}
          />
        );
      
      case "quotes":
        return (
          <QuotesLayoutRenderer
            layoutId={layoutId as QuotesLayoutType}
            items={items as QuoteContentItem[]}
            accentColor={accentColor}
          />
        );
      
      case "circles":
        return (
          <CircleLayoutRenderer
            layoutId={layoutId as CircleLayoutType}
            items={items as CircleContentItem[]}
            theme={theme}
            accentColor={accentColor}
          />
        );
      
      case "sequence":
        return (
          <SequenceLayoutRenderer
            layoutId={layoutId as SequenceLayoutType}
            items={items as SequenceContentItem[]}
            theme={theme}
          />
        );
      
      case "cascading":
        return (
          <CascadingWorkflowRenderer
            layoutId={layoutId}
            items={items as CascadingContentItem[]}
            theme={theme}
            accentColor={accentColor}
          />
        );
      
      case "chevron":
        return (
          <ChevronFlowRenderer
            layoutId={layoutId}
            items={items as ChevronContentItem[]}
            theme={theme}
            accentColor={accentColor}
          />
        );
      
      case "funnel":
        return (
          <FunnelStepsRenderer
            layoutId={layoutId}
            items={items as FunnelContentItem[]}
            theme={theme}
            accentColor={accentColor}
          />
        );
      
      case "proscons":
        return (
          <ProsConsRenderer
            layoutId={layoutId}
            items={items as ProsConsContentItem[]}
            theme={theme}
            accentColor={accentColor}
          />
        );

      case "beforeafter":
        return (
          <BeforeAfterRenderer
            layoutId={layoutId}
            items={items as BeforeAfterContentItem[]}
            theme={theme}
            accentColor={accentColor}
          />
        );
      
      case "comparison":
        return (
          <ComparisonRenderer
            layoutId={layoutId}
            items={items as ComparisonContentItem[]}
            theme={theme}
            accentColor={accentColor}
          />
        );
      
      case "editorial":
        return (
          <EditorialListRenderer
            layoutId={layoutId as EditorialLayoutType}
            items={items as BoxContentItem[]}
            theme={theme}
            accentColor={accentColor}
          />
        );

      case "orbit":
        return (
          <OrbitDiagramRenderer
            layoutId={layoutId as OrbitLayoutType}
            items={items as BoxContentItem[]}
            theme={theme}
            accentColor={accentColor}
            centerText="Core idea"
          />
        );

      case "bento":
        return <BentoGridRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "timeline":
        return <TimelineRoadmapRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "spotlight":
        return <SpotlightStatementRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "agenda":
        return <AgendaListRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "pyramid":
        return <PyramidRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "matrix":
        return <QuadrantMatrixRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "callout":
        return <CalloutBoxRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "table":
        return <DataTableRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "dashboard":
        return <StatDashboardRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "team":
        return <TeamGridRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "icongrid":
        return <IconGridRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "hubspoke":
        return <HubSpokeRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "cycle":
        return <CycleDiagramRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "showcase":
        return <FeatureShowcaseRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "checklist":
        return <ChecklistRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "roadmap":
        return <RoadmapRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "zigzag":
        return <ZigzagRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "definitionlist":
        return <DefinitionListRenderer layoutId={layoutId} items={items as BoxContentItem[]} theme={theme} accentColor={accentColor} />;

      case "images": {
        // Distinct placeholder mock per gallery style so each card previews
        // its real anatomy (no actual images available in the picker).
        const imgGlyph = (cls: string) => (
          <div
            className={`flex items-center justify-center ${cls}`}
            style={{ backgroundColor: `${accentColor}1a`, border: `1px solid ${accentColor}33` }}
          >
            <svg className="h-8 w-8 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        );
        const three = items.slice(0, 3);

        if (layoutId === "image-style-2") {
          // Card Gallery: framed cards, image top + label + caption
          return (
            <div className="flex gap-4 p-4">
              {three.map((item, i) => (
                <div key={i} className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {imgGlyph("aspect-video")}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-slate-800">{item.label}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        }
        if (layoutId === "image-style-3") {
          // Circle Gallery: circular images + centered labels
          return (
            <div className="flex items-start justify-center gap-8 p-6">
              {three.map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center" style={{ width: 150 }}>
                  {imgGlyph("h-28 w-28 rounded-full")}
                  <h3 className="mt-3 text-sm font-bold text-slate-800">{item.label}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.text}</p>
                </div>
              ))}
            </div>
          );
        }
        if (layoutId === "image-style-4") {
          // Feature Gallery: hero image left + stacked supporting images right
          return (
            <div className="flex gap-4 p-4" style={{ height: 380 }}>
              <div className="flex flex-[2] flex-col">
                {imgGlyph("flex-1 rounded-xl")}
                <h3 className="mt-2 text-base font-bold text-slate-800">{three[0]?.label}</h3>
                <p className="text-xs text-slate-500">{three[0]?.text}</p>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {three.slice(1).map((item, i) => (
                  <div key={i} className="flex flex-1 flex-col">
                    {imgGlyph("flex-1 rounded-lg")}
                    <h3 className="mt-1.5 text-xs font-bold text-slate-800">{item.label}</h3>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        // image-style-5: Masonry — varied-height columns
        if (layoutId === "image-style-5") {
          const ars = [["aspect-[3/4]", "aspect-square"], ["aspect-square", "aspect-[3/4]"], ["aspect-[4/5]", "aspect-square"]];
          return (
            <div className="grid grid-cols-3 items-start gap-3 p-4">
              {ars.map((col, c) => (
                <div key={c} className="flex flex-col gap-3">{col.map((a, r) => <div key={r}>{imgGlyph(`${a} rounded-lg`)}</div>)}</div>
              ))}
            </div>
          );
        }
        // image-style-6: Film Reel — sprocketed strip
        if (layoutId === "image-style-6") {
          const holes = (
            <div className="flex justify-around px-2">
              {Array.from({ length: 14 }).map((_, s) => <span key={s} className="h-2.5 w-3.5 rounded-[2px]" style={{ background: "rgba(255,255,255,0.22)" }} />)}
            </div>
          );
          return (
            <div className="flex items-center p-4">
              <div className="w-full rounded-lg py-2.5" style={{ background: "#161616" }}>
                {holes}
                <div className="my-2 flex gap-2 px-3">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="flex-1" style={{ border: "2px solid rgba(255,255,255,0.14)" }}>{imgGlyph("aspect-[4/5]")}</div>)}</div>
                {holes}
              </div>
            </div>
          );
        }
        // image-style-7: Polaroid Scatter — overlapping tilted photos
        if (layoutId === "image-style-7") {
          return (
            <div className="flex items-center justify-center p-6">
              {three.map((_, i) => (
                <div key={i} className="w-40 bg-white p-2 pb-6 shadow-xl" style={{ transform: `rotate(${[-8, 4, -3][i]}deg)`, marginLeft: i ? -22 : 0, marginTop: i % 2 ? 14 : 0, zIndex: i }}>{imgGlyph("aspect-square")}</div>
              ))}
            </div>
          );
        }
        // image-style-8: Cinematic Overlay — scrim captions
        if (layoutId === "image-style-8") {
          return (
            <div className="flex gap-4 p-4">
              {three.map((item, i) => (
                <div key={i} className="relative flex-1 overflow-hidden rounded-xl">
                  {imgGlyph("aspect-[3/4]")}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6"><h3 className="text-xs font-bold text-white">{item.label}</h3></div>
                </div>
              ))}
            </div>
          );
        }
        // image-style-9: Hero Feature — wide hero + thumb strip
        if (layoutId === "image-style-9") {
          return (
            <div className="p-4">
              <div className="relative overflow-hidden rounded-xl">
                {imgGlyph("aspect-[21/9]")}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8"><h3 className="text-base font-bold text-white">{three[0]?.label}</h3></div>
              </div>
              <div className="mt-3 flex gap-3">{[0, 1, 2].map((i) => <div key={i} className="flex-1">{imgGlyph("aspect-video rounded-lg")}</div>)}</div>
            </div>
          );
        }
        // image-style-10: Portrait Circles
        if (layoutId === "image-style-10") {
          return (
            <div className="flex items-start justify-center gap-8 p-6">
              {three.map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center" style={{ width: 140 }}>
                  <div className="rounded-full p-1" style={{ background: accentColor }}>{imgGlyph("h-24 w-24 rounded-full")}</div>
                  <h3 className="mt-2.5 text-sm font-bold text-slate-800">{item.label}</h3>
                </div>
              ))}
            </div>
          );
        }
        // image-style-11: Passe-partout — matted frames
        if (layoutId === "image-style-11") {
          return (
            <div className="flex gap-5 p-4">
              {three.map((item, i) => (
                <div key={i} className="flex-1 p-3.5 pb-2.5" style={{ background: "#f7f6f2", boxShadow: "0 10px 20px -10px rgba(0,0,0,0.45)" }}>
                  <div style={{ border: "1px solid rgba(0,0,0,0.15)", padding: 2 }}>{imgGlyph("aspect-square")}</div>
                  <h3 className="mt-2 text-center text-xs font-bold text-slate-800">{item.label}</h3>
                </div>
              ))}
            </div>
          );
        }
        // image-style-12: Editorial Bands — full-width alternating
        if (layoutId === "image-style-12") {
          return (
            <div className="flex flex-col gap-3 p-4">
              {three.map((item, i) => {
                const flip = i % 2 === 1;
                return (
                  <div key={i} className={`flex items-stretch overflow-hidden rounded-xl ${flip ? "flex-row-reverse" : ""}`} style={{ background: `${accentColor}0d` }}>
                    <div className="w-2/5" style={{ minHeight: 72 }}>{imgGlyph("h-full w-full")}</div>
                    <div className={`flex flex-1 flex-col justify-center p-3 ${flip ? "text-right" : ""}`}><h3 className="text-sm font-bold text-slate-800">{item.label}</h3><p className="text-xs text-slate-500 line-clamp-1">{item.text}</p></div>
                  </div>
                );
              })}
            </div>
          );
        }
        // image-style-13: Photo Stack — overlapping pile + caption list
        if (layoutId === "image-style-13") {
          return (
            <div className="flex items-center gap-8 p-6">
              <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
                {[0, 1, 2].map((i) => <div key={i} className="absolute inset-0 bg-white p-2 pb-5 shadow-xl" style={{ transform: `rotate(${[7, -2, -8][i]}deg)`, zIndex: i }}>{imgGlyph("h-full w-full")}</div>)}
              </div>
              <div className="flex flex-1 flex-col gap-2.5">
                {three.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5"><span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: accentColor }}>{i + 1}</span><h3 className="text-sm font-bold text-slate-800">{item.label}</h3></div>
                ))}
              </div>
            </div>
          );
        }
        // image-style-14: Bento Mosaic — asymmetric tile wall
        if (layoutId === "image-style-14") {
          return (
            <div className="grid grid-cols-3 grid-rows-2 gap-2 p-4" style={{ height: 320 }}>
              <div className="col-span-2 row-span-2">{imgGlyph("h-full w-full rounded-lg")}</div>
              {imgGlyph("h-full w-full rounded-lg")}
              {imgGlyph("h-full w-full rounded-lg")}
            </div>
          );
        }
        // image-style-1 (default): Compact Gallery — tight thumbnail strip
        return (
          <div className="flex gap-3 p-4">
            {three.map((item, i) => (
              <div key={i} className="flex flex-1 flex-col">
                {imgGlyph("aspect-[4/3] rounded-lg")}
                <h3 className="mt-2 text-sm font-semibold text-slate-800">{item.label}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{item.text}</p>
              </div>
            ))}
          </div>
        );
      }
      
      case "pricing": {
        const plans: BoxContentItem[] = [
          { label: "Starter", text: "$0/mo\nUp to 3 projects\nCommunity support" },
          { label: "Pro", text: "$29/mo\nUnlimited projects\nPriority support\nAdvanced analytics" },
          { label: "Enterprise", text: "$99/mo\nEverything in Pro\nSSO & audit logs\nDedicated manager" },
        ];
        return <PricingRenderer layoutId={layoutId} items={plans} theme={theme} accentColor={accentColor} className="p-4" />;
      }
      case "featurematrix": {
        const rows: BoxContentItem[] = [
          { label: "", text: "Basic | Pro | Enterprise" },
          { label: "Projects", text: "3 | ∞ | ∞" },
          { label: "Analytics", text: "✗ | ✓ | ✓" },
          { label: "SSO", text: "✗ | ~ | ✓" },
          { label: "Support", text: "Community | Priority | Dedicated" },
        ];
        return <FeatureMatrixRenderer layoutId={layoutId} items={rows} theme={theme} accentColor={accentColor} className="p-4" />;
      }
      case "kanban": {
        const cards: BoxContentItem[] = [
          { label: "To Do: Research users", text: "Interview 5 customers" },
          { label: "To Do: Draft spec", text: "" },
          { label: "In Progress: Build API", text: "Auth + endpoints" },
          { label: "In Progress: Design UI", text: "" },
          { label: "Done: Kickoff", text: "Aligned on scope" },
          { label: "Done: Setup repo", text: "" },
        ];
        return <KanbanRenderer layoutId={layoutId} items={cards} theme={theme} accentColor={accentColor} className="p-4" />;
      }
      case "orgchart": {
        const nodes: BoxContentItem[] = [
          { label: "Alex Rivera", text: "CEO" },
          { label: "- Sam Chen", text: "VP Engineering" },
          { label: "-- Jordan Lee", text: "Backend" },
          { label: "-- Priya Nair", text: "Frontend" },
          { label: "- Maya Ford", text: "VP Design" },
        ];
        return <OrgChartRenderer layoutId={layoutId} items={nodes} theme={theme} accentColor={accentColor} className="p-4" />;
      }

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <LayoutGrid size={32} className="text-slate-300" />
          </div>
        );
    }
  };

  // Calculate the scaled dimensions to center properly
  const scaledWidth = previewWidth * scale;
  const scaledHeight = previewHeight * scale;

  return (
    <div 
      className="w-full h-full overflow-hidden rounded flex items-center justify-center"
      style={{ 
        backgroundColor: theme.colors.backgroundAlt || "#f8fafc",
      }}
    >
      <div
        className="pointer-events-none"
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            padding: "16px",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <div className="[&_*]:!transition-none [&_*]:hover:!transform-none [&_*]:hover:!shadow-none">
            {renderLayout()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentLayoutPanel({
  isOpen,
  currentContentLayout,
  contentItems,
  theme,
  onSelectContentLayout,
  onClose,
  coverSlide = false,
  currentCoverLayout,
  onSelectCoverLayout,
}: ContentLayoutPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const currentCategory = getCategoryFromLayoutId(currentContentLayout);
  
  // Get translations
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // Category names with translations
  const categoryNames: Record<LayoutCategory, string> = {
    boxes: t.boxCards || "Box Cards",
    steps: t.stepsProcess || "Steps & Process",
    bullets: t.bulletPointsLayout || "Bullet Points",
    quotes: t.quotesTestimonials || "Quotes & Testimonials",
    images: t.imageGallery || "Image Gallery",
    circles: t.circularLayouts || "Circular Layouts",
    // Renamed from "Sequence & Timeline" so it doesn't read as a duplicate of
    // the Timeline family: Sequence = ordered process flow, Timeline = dated
    // milestones. They stay separate categories (distinct AI affinities).
    sequence: t.sequenceFlow || "Sequence Flow",
    cascading: t.cascadingWorkflow || "Cascading Workflow",
    chevron: t.chevronFlow || "Chevron Flow",
    funnel: t.funnelSteps || "Funnel Steps",
    proscons: t.prosCons || "Pros & Cons",
    beforeafter: t.beforeAfter || "Before & After",
    comparison: t.comparison || "VS Comparison",
    editorial: "Editorial",
    orbit: "Orbit Diagrams",
    bento: "Bento Grid",
    timeline: "Timeline",
    spotlight: "Spotlight",
    agenda: "Agenda",
    pyramid: "Pyramid",
    matrix: "2×2 Matrix",
    callout: "Callout",
    table: "Data Table",
    dashboard: "KPI Dashboard",
    team: "Team Cards",
    icongrid: "Icon Grid",
    hubspoke: "Hub & Spoke",
    cycle: "Cycle",
    showcase: "Feature Showcase",
    checklist: "Checklist",
    roadmap: "Roadmap",
    zigzag: "Zigzag Story",
    definitionlist: "Definition List",
    pricing: "Pricing & Plans",
    featurematrix: "Feature Matrix",
    kanban: "Kanban Board",
    orgchart: "Org Chart",
  };

  // Build a grouped render list: group headers interleaved with their
  // categories. The group containing the slide's CURRENT layout floats to
  // the top, with the current category first inside it.
  const renderList = useMemo(() => {
    type Entry =
      | { kind: "header"; name: string }
      | { kind: "category"; category: LayoutCategoryConfig };

    const byId = new Map(allCategories.map((c) => [c.id, c]));
    const groups = CATEGORY_GROUPS.map((g) => ({
      name: g.name,
      items: g.categories
        .map((id) => byId.get(id))
        .filter((c): c is LayoutCategoryConfig => Boolean(c)),
    })).filter((g) => g.items.length > 0);

    groups.sort(
      (a, b) =>
        Number(b.items.some((c) => c.id === currentCategory)) -
        Number(a.items.some((c) => c.id === currentCategory)),
    );

    const list: Entry[] = [];
    for (const g of groups) {
      const items = [...g.items].sort((a, b) =>
        a.id === currentCategory ? -1 : b.id === currentCategory ? 1 : 0,
      );
      list.push({ kind: "header", name: g.name });
      items.forEach((c) => list.push({ kind: "category", category: c }));
    }
    return list;
  }, [currentCategory]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Accordion: only the active slide's family starts expanded. Navigating to
  // another slide (currentCategory changes) collapses everything else, brings
  // the new family to the top (renderList already floats it first) and
  // resets the scroll position. Users can still open extra families manually.
  const [expandedCategories, setExpandedCategories] = useState<Set<LayoutCategory>>(
    () => new Set([currentCategory]),
  );
  const listScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    setExpandedCategories(new Set([currentCategory]));
    listScrollRef.current?.scrollTo({ top: 0 });
  }, [currentCategory, isOpen]);

  const sectionRefs = useRef<Partial<Record<LayoutCategory, HTMLDivElement | null>>>({});
  const toggleCategory = (id: LayoutCategory) => {
    const willExpand = !expandedCategories.has(id);
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Bring a freshly expanded family to the top of the list so its styles
    // are immediately in view (after the expanded body has rendered).
    if (willExpand) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }
  };

  // Find current layout name
  const currentLayoutName = useMemo(() => {
    for (const category of allCategories) {
      const layout = category.layouts.find(l => l.id === currentContentLayout);
      if (layout) return layout.name;
    }
    return "Unknown";
  }, [currentContentLayout]);

  // Theme-aware colors using the helper
  const themeType = getThemeType(theme);
  const isLight = themeType === "light" || themeType === "corporate" || themeType === "custom-light";
  const modalColors = getModalColors(theme);
  
  // Use modalColors for panel background
  const panelBg = modalColors.bg;
  const headerBg = isLight ? "#f8fafc" : modalColors.surface;
  
  // Always take the accent from the ACTIVE theme so the panel chrome, the
  // "Current" highlight and every preview tint match the deck's identity.
  const themeAccent =
    theme.colors.accent || theme.colors.primary || (isLight ? "#06b6d4" : "#a78bfa");

  const colors = isLight ? {
    bg: "#ffffff",
    headerBg: "#f8fafc",
    border: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
    accent: themeAccent,
    hoverBg: "#f1f5f9",
    categoryBg: "#f8fafc",
    currentBg: `${themeAccent}0D`,
    infoBg: "#f8fafc",
  } : {
    bg: panelBg,
    headerBg: headerBg,
    border: modalColors.border,
    text: modalColors.text,
    textMuted: modalColors.textMuted,
    accent: themeAccent,
    hoverBg: modalColors.hoverBg || "#27272a",
    categoryBg: modalColors.surface || "rgba(39, 39, 42, 0.5)",
    currentBg: `${themeAccent}15`,
    infoBg: modalColors.surface || "#27272a",
  };

  if (!isOpen) return null;

  // -------------------------------------------------------------------------
  // COVER MODE — the title slide picks a hero composition, not a content
  // layout. Compositions are theme-aware: colors/fonts follow the theme.
  // -------------------------------------------------------------------------
  if (coverSlide) {
    return (
      <div
        ref={panelRef}
        className="fixed right-0 z-40 shadow-2xl animate-slide-in-right flex flex-col"
        style={{
          width: `${CONTENT_LAYOUT_PANEL_WIDTH}px`,
          top: `${HEADER_HEIGHT}px`,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          background: colors.bg,
          borderLeft: `1px solid ${colors.border}`,
        }}
      >
        <div
          className="flex items-center justify-between p-4 shrink-0"
          style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.headerBg }}
        >
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} style={{ color: colors.accent }} />
            <h3 className="font-semibold" style={{ color: colors.text }}>{t.coverStyleTitle || "Cover Style"}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 text-xs leading-relaxed shrink-0" style={{ color: colors.textMuted, background: colors.infoBg, borderBottom: `1px solid ${colors.border}` }}>
          {currentCoverLayout
            ? "Pick a composition for your cover — colors and fonts always follow the active theme. Title, subtitle and tagline stay editable in every style."
            : "This cover currently uses an image-split layout. Pick a style below to switch it to a cover composition — colors and fonts follow the active theme."}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {COVER_STYLES.map((style) => {
            const isCurrent = style.id === currentCoverLayout;
            return (
              <button
                key={style.id}
                onClick={() => onSelectCoverLayout?.(style.id)}
                className="w-full text-left rounded-xl p-3 transition-all"
                style={{
                  border: `1px solid ${isCurrent ? colors.accent : colors.border}`,
                  background: isCurrent ? colors.currentBg : colors.categoryBg,
                  boxShadow: isCurrent ? `0 0 0 1px ${colors.accent}` : "none",
                }}
                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = colors.hoverBg; }}
                onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = colors.categoryBg; }}
              >
                <CoverStylePreview id={style.id} accent={colors.accent} ink={colors.text} hairline={colors.border} />
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-sm font-semibold" style={{ color: colors.text }}>{style.name}</span>
                  {isCurrent && <CheckCircle2 size={15} style={{ color: colors.accent }} />}
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: colors.textMuted }}>{style.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Accordion body entrance */}
      <style>{`
        @keyframes clpAccFade {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: none; }
        }
        .clp-acc-body { animation: clpAccFade 0.22s cubic-bezier(0.25, 0.1, 0.25, 1); }
      `}</style>
      {/* Panel - fixed at right edge */}
      <div
        ref={panelRef}
        className="fixed right-0 z-40 shadow-2xl animate-slide-in-right"
        style={{ 
          width: `${CONTENT_LAYOUT_PANEL_WIDTH}px`,
          top: `${HEADER_HEIGHT}px`,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          background: colors.bg,
          borderLeft: `1px solid ${colors.border}`,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ 
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.headerBg,
          }}
        >
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} style={{ color: colors.accent }} />
            <h3 className="font-semibold" style={{ color: colors.text }}>{t.contentLayoutTitle || "Content Layout"}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hoverBg;
              e.currentTarget.style.color = colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.textMuted;
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content - visible scrollbar on right edge */}
        <div
          ref={listScrollRef}
          className="overflow-y-auto scrollbar-thin"
          style={{ height: "calc(100% - 57px)" }}
        >
          <div>
            <div className="p-3">
              <p className="text-xs mb-1" style={{ color: colors.textMuted }}>
                {t.chooseLayoutStyle || "Choose a layout style. Changes apply instantly."}
              </p>
              {contentItems.length > 0 && (
                <p className="text-[10px]" style={{ color: colors.textMuted }}>
                  {t.previewsShowContent || "Previews show your actual content"} ({contentItems.length} {contentItems.length !== 1 ? (t.itemsCount || "items") : "item"})
                </p>
              )}
            </div>

            {/* Categories - grouped into families, all expanded */}
            {renderList.map((entry) => {
              if (entry.kind === "header") {
                return (
                  <div
                    key={`group-${entry.name}`}
                    className="flex items-center gap-2 px-4 pb-1.5 pt-4"
                  >
                    <span
                      className="text-[10px] font-black uppercase tracking-[0.14em]"
                      style={{ color: colors.accent }}
                    >
                      {entry.name}
                    </span>
                    <span className="h-px flex-1" style={{ backgroundColor: colors.border }} />
                  </div>
                );
              }
              const category = entry.category;
              const isCurrentCategory = category.id === currentCategory;
              const isExpanded = expandedCategories.has(category.id);
              const FamilyIcon = CATEGORY_ICONS[category.id] || LayoutGrid;

              return (
                <div
                  key={category.id}
                  ref={(el) => { sectionRefs.current[category.id] = el; }}
                  className="mx-3 mb-2 overflow-hidden rounded-xl transition-all"
                  style={{
                    scrollMarginTop: 8,
                    border: `1px solid ${isCurrentCategory && isExpanded ? `${colors.accent}66` : colors.border}`,
                    background: colors.bg,
                    boxShadow: isExpanded ? `0 4px 16px ${colors.accent}0d` : "none",
                  }}
                >
                  {/* Category Header — accordion toggle */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="group w-full px-3 py-2.5 text-left transition-colors"
                    style={{
                      backgroundColor: isCurrentCategory ? colors.currentBg : colors.categoryBg,
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentCategory) e.currentTarget.style.backgroundColor = colors.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentCategory) e.currentTarget.style.backgroundColor = colors.categoryBg;
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Family glyph */}
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
                        style={{
                          background: isCurrentCategory ? colors.accent : `${colors.accent}14`,
                          color: isCurrentCategory ? "#ffffff" : colors.accent,
                          boxShadow: isCurrentCategory ? `0 2px 8px ${colors.accent}40` : "none",
                        }}
                      >
                        <FamilyIcon size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className="truncate text-[13px] font-semibold tracking-tight"
                            style={{ color: isCurrentCategory ? colors.accent : colors.text }}
                          >
                            {categoryNames[category.id] || category.name}
                          </h4>
                          {isCurrentCategory && (
                            <span
                              className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white"
                              style={{ backgroundColor: colors.accent }}
                            >
                              {t.currentLabel || "Current"}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Style count pill */}
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums"
                        style={{
                          color: isCurrentCategory ? colors.accent : colors.textMuted,
                          background: isCurrentCategory ? `${colors.accent}1a` : colors.hoverBg,
                        }}
                      >
                        {category.layouts.length}
                      </span>
                      <ChevronDown
                        size={15}
                        className="shrink-0"
                        style={{
                          color: isExpanded ? colors.accent : colors.textMuted,
                          transform: isExpanded ? "rotate(180deg)" : "none",
                          transition: "transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)",
                        }}
                      />
                    </div>
                  </button>

                  {/* Category Layouts - visible when the family is expanded */}
                  {isExpanded && (
                  <div
                    className="clp-acc-body grid grid-cols-2 gap-2 px-2.5 pb-2.5 pt-2"
                    style={{ borderTop: `1px solid ${colors.border}` }}
                  >
                    {category.layouts.map((layout) => {
                      const isSelected = currentContentLayout === layout.id;
                      const isSuitable =
                        contentItems.length === 0 ||
                        (contentItems.length >= layout.minItems && contentItems.length <= layout.maxItems);

                      const isBlocked = !isSuitable && contentItems.length > 0;
                      const fitLabel =
                        layout.minItems === layout.maxItems
                          ? `Needs exactly ${layout.minItems} items`
                          : `Needs ${layout.minItems}–${layout.maxItems} items`;

                      return (
                        <button
                          key={layout.id}
                          onClick={() => onSelectContentLayout(layout.id as ContentLayoutId)}
                          disabled={isBlocked}
                          title={
                            isBlocked
                              ? `${fitLabel} — this slide has ${contentItems.length}. Add or remove items to use it.`
                              : layout.description
                          }
                          className="relative p-1.5 rounded-lg border-2 transition-all"
                          style={{
                            opacity: isBlocked ? 0.55 : 1,
                            cursor: isBlocked ? "not-allowed" : "pointer",
                            borderColor: isSelected ? colors.accent : colors.border,
                            backgroundColor: isSelected ? colors.currentBg : "transparent",
                            boxShadow: isSelected ? `0 0 0 2px ${colors.accent}33` : "none",
                          }}
                        >
                          {/* Layout Preview with actual content */}
                          <div
                            className="aspect-[4/3] rounded overflow-hidden flex items-center justify-center"
                            style={{ backgroundColor: theme.colors.backgroundAlt || "#f8fafc" }}
                          >
                            <ScaledLayoutPreview
                              category={category.id}
                              layoutId={layout.id}
                              contentItems={contentItems}
                              theme={theme}
                            />
                          </div>

                          {/* Why this card is blocked — visible, not just a dim card */}
                          {isBlocked && (
                            <div
                              className="absolute inset-x-1.5 bottom-1.5 rounded px-1.5 py-1 text-center text-[9px] font-bold leading-tight"
                              style={{
                                backgroundColor: colors.infoBg,
                                border: `1px solid ${colors.border}`,
                                color: colors.textMuted,
                              }}
                            >
                              {fitLabel} · you have {contentItems.length}
                            </div>
                          )}

                          {isSelected && (
                            <div
                              className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: colors.accent }}
                            >
                              <CheckCircle2 size={8} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  )}
                </div>
              );
            })}

            {/* Current selection info */}
            <div className="p-3">
              <div 
                className="p-3 rounded-lg"
                style={{ 
                  backgroundColor: colors.infoBg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="text-xs" style={{ color: colors.textMuted }}>
                  <span className="font-medium">{t.currentLabel || "Current"}:</span>{" "}
                  <span style={{ color: colors.text }}>{currentLayoutName}</span>
                </div>
                {contentItems.length > 0 && (
                  <div className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
                    {contentItems.length} {t.contentItemsCount || "content items"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
