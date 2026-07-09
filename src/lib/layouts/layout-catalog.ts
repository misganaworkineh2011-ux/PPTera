/**
 * Layout Catalog — a compact, server-safe, machine-readable description of
 * every content-layout FAMILY and its capabilities, meant to be handed to an
 * LLM so it can choose the most suitable layout for a slide and shape the
 * slide's items to match that layout's content model.
 *
 * Family-level (not every style): each family lists a few representative
 * styles; the first is the family's default. The generator applies
 * `<family>-style-1` (or a listed style) — the exact visual variant is a
 * cosmetic detail the picker/panel can further refine.
 */

export interface CatalogStyle {
  id: string;
  name: string;
}

export interface CatalogFamily {
  /** Family id — also the ContentLayoutCategory. */
  id: string;
  name: string;
  /** Super-group the family belongs to (for the LLM's mental model). */
  group: "Cards & Grids" | "Lists & Text" | "Process & Flow" | "Diagrams & Relationships" | "Data & Numbers" | "Images & Media";
  /** What the family looks like. */
  description: string;
  /** When the LLM should pick this family. */
  bestFor: string;
  minItems: number;
  maxItems: number;
  idealItems: number;
  /** Whether items can carry an optional leading emoji/icon. */
  supportsIcons: boolean;
  /** Whether the family reads well beside a slide image. */
  supportsImage: boolean;
  /**
   * How to shape each item's { label, text } for this family. Most families
   * use the default (label = heading, text = detail). Convention families
   * encode structure into label/text — the LLM must follow these exactly.
   */
  itemFormat: string;
  /** A few representative styles; styles[0] is the default applied. */
  styles: CatalogStyle[];
}

const DEFAULT_FORMAT = "label = a short heading (2–5 words); text = a 1–2 sentence detail.";

export const LAYOUT_CATALOG: CatalogFamily[] = [
  // ---- Cards & Grids ----
  { id: "boxes", name: "Box Cards", group: "Cards & Grids", description: "Content in styled card boxes with a heading and description.", bestFor: "distinct features, benefits or categories (2–6).", minItems: 2, maxItems: 6, idealItems: 3, supportsIcons: true, supportsImage: true, itemFormat: DEFAULT_FORMAT, styles: [{ id: "box-style-1", name: "Side Accent" }, { id: "box-style-3", name: "Icon Focus" }, { id: "box-style-4", name: "Header Accent" }] },
  { id: "bento", name: "Bento Grid", group: "Cards & Grids", description: "An asymmetric mosaic with one hero tile and supporting tiles.", bestFor: "a set of features where one is most important.", minItems: 3, maxItems: 6, idealItems: 5, supportsIcons: true, supportsImage: true, itemFormat: DEFAULT_FORMAT + " The first item is the hero.", styles: [{ id: "bento-style-1", name: "Bento Mosaic" }, { id: "bento-style-2", name: "Banner Hero" }] },
  { id: "icongrid", name: "Icon Grid", group: "Cards & Grids", description: "A balanced grid of icon chips with bold titles.", bestFor: "feature lists where each point has an icon (3–6).", minItems: 3, maxItems: 6, idealItems: 6, supportsIcons: true, supportsImage: true, itemFormat: DEFAULT_FORMAT + " icon = a relevant emoji.", styles: [{ id: "icongrid-style-1", name: "Feature Grid" }, { id: "icongrid-style-4", name: "Ring Badges" }] },
  { id: "showcase", name: "Feature Showcase", group: "Cards & Grids", description: "An editorial split: a big lead idea plus supporting feature points.", bestFor: "one headline idea with 2–5 supporting points.", minItems: 2, maxItems: 6, idealItems: 4, supportsIcons: true, supportsImage: true, itemFormat: DEFAULT_FORMAT + " The first item is the lead.", styles: [{ id: "showcase-style-1", name: "Magazine Split" }, { id: "showcase-style-2", name: "Spotlight Panel" }] },
  { id: "zigzag", name: "Zigzag Story", group: "Cards & Grids", description: "Cards weaving left and right down the slide.", bestFor: "a short narrative or flow of 3–5 beats.", minItems: 3, maxItems: 5, idealItems: 4, supportsIcons: true, supportsImage: true, itemFormat: DEFAULT_FORMAT, styles: [{ id: "zigzag-style-1", name: "Alternating Flow" }, { id: "zigzag-style-2", name: "Center Spine" }] },
  { id: "team", name: "Team Cards", group: "Cards & Grids", description: "People cards with avatar initials, a name and a role.", bestFor: "introducing team members or contributors.", minItems: 2, maxItems: 8, idealItems: 4, supportsIcons: false, supportsImage: true, itemFormat: "label = the person's name; text = their role or a short bio.", styles: [{ id: "team-style-1", name: "Team Grid" }, { id: "team-style-2", name: "Roster Rows" }] },
  { id: "pricing", name: "Pricing & Plans", group: "Cards & Grids", description: "Tiered plan cards with price, feature list and a call to action.", bestFor: "pricing tiers or package/plan comparisons (2–4).", minItems: 2, maxItems: 4, idealItems: 3, supportsIcons: false, supportsImage: false, itemFormat: "label = the plan name; text = the price on the FIRST line, then ONE feature per line. The 2nd plan is auto-highlighted as popular.", styles: [{ id: "pricing-style-1", name: "Plan Cards" }, { id: "pricing-style-3", name: "Gradient Hero" }] },

  // ---- Lists & Text ----
  { id: "bullets", name: "Bullet Points", group: "Lists & Text", description: "Traditional bullet lists in cards, columns or checks.", bestFor: "general lists or dense information (default fallback).", minItems: 2, maxItems: 8, idealItems: 4, supportsIcons: true, supportsImage: true, itemFormat: DEFAULT_FORMAT, styles: [{ id: "bullet-style-1", name: "Card Bullets" }, { id: "bullet-style-5", name: "Accent Bullets" }] },
  { id: "editorial", name: "Editorial", group: "Lists & Text", description: "Magazine-style numbered lists with oversized numerals and rules.", bestFor: "a refined numbered list of 3–6 points.", minItems: 3, maxItems: 6, idealItems: 4, supportsIcons: false, supportsImage: true, itemFormat: DEFAULT_FORMAT, styles: [{ id: "editorial-numbers", name: "Ghost Numerals" }, { id: "editorial-ledger", name: "Ledger Rows" }] },
  { id: "agenda", name: "Agenda", group: "Lists & Text", description: "Numbered agendas and tables of contents.", bestFor: "an agenda, table of contents or session list.", minItems: 3, maxItems: 8, idealItems: 5, supportsIcons: false, supportsImage: true, itemFormat: DEFAULT_FORMAT, styles: [{ id: "agenda-style-1", name: "Numbered Agenda" }, { id: "agenda-style-2", name: "Dotted Contents" }] },
  { id: "checklist", name: "Checklist", group: "Lists & Text", description: "Check items for takeaways or requirements.", bestFor: "requirements, takeaways or done/to-do items.", minItems: 3, maxItems: 8, idealItems: 5, supportsIcons: false, supportsImage: true, itemFormat: DEFAULT_FORMAT, styles: [{ id: "checklist-style-1", name: "Check Cards" }, { id: "checklist-style-2", name: "Square Ticks" }] },
  { id: "definitionlist", name: "Definition List", group: "Lists & Text", description: "Term-and-definition pairs.", bestFor: "glossaries, term:definition pairs or FAQ-style content.", minItems: 3, maxItems: 12, idealItems: 5, supportsIcons: false, supportsImage: true, itemFormat: "label = the term; text = its definition.", styles: [{ id: "definitionlist-style-1", name: "Definitions" }] },
  { id: "callout", name: "Callout", group: "Lists & Text", description: "Highlighted key-note boxes that demand attention.", bestFor: "1–3 important notes, warnings or takeaways.", minItems: 1, maxItems: 3, idealItems: 2, supportsIcons: true, supportsImage: true, itemFormat: DEFAULT_FORMAT, styles: [{ id: "callout-style-1", name: "Key Notes" }, { id: "callout-style-2", name: "Alert Banner" }] },
  { id: "spotlight", name: "Spotlight", group: "Lists & Text", description: "One bold centered statement, front and center.", bestFor: "a single hero statement or key insight.", minItems: 1, maxItems: 2, idealItems: 1, supportsIcons: false, supportsImage: true, itemFormat: "the FIRST item's text is the big statement; its label is an optional kicker.", styles: [{ id: "spotlight-style-1", name: "Big Statement" }, { id: "spotlight-style-3", name: "Gradient Glow" }] },
  { id: "quotes", name: "Quotes & Testimonials", group: "Lists & Text", description: "Quote and testimonial cards.", bestFor: "ONLY actual quotes, testimonials or endorsements.", minItems: 1, maxItems: 6, idealItems: 3, supportsIcons: false, supportsImage: false, itemFormat: "text = the quote itself; label = the attribution (person / company).", styles: [{ id: "quote-marks", name: "Quote Cards" }, { id: "quote-style-4", name: "Author Card" }] },

  // ---- Process & Flow ----
  { id: "steps", name: "Steps & Process", group: "Process & Flow", description: "Step-by-step process flows.", bestFor: "how-to guides, tutorials or numbered instructions.", minItems: 3, maxItems: 6, idealItems: 4, supportsIcons: true, supportsImage: true, itemFormat: DEFAULT_FORMAT + " Items are in order.", styles: [{ id: "steps-pyramid", name: "Inverted Pyramid" }, { id: "steps-arrows", name: "Arrow Flow" }, { id: "steps-cards", name: "Step Cards" }] },
  { id: "sequence", name: "Sequence Flow", group: "Process & Flow", description: "An ordered horizontal or vertical process flow.", bestFor: "a workflow or ordered sequence of stages.", minItems: 3, maxItems: 6, idealItems: 4, supportsIcons: true, supportsImage: false, itemFormat: DEFAULT_FORMAT + " Items are in order.", styles: [{ id: "sequence-style-1", name: "Process Flow" }, { id: "sequence-style-5", name: "Numbered Flow" }] },
  { id: "timeline", name: "Timeline", group: "Process & Flow", description: "Dated milestones in time order — spines, metro lines, eras.", bestFor: "chronological milestones or dated events.", minItems: 3, maxItems: 6, idealItems: 4, supportsIcons: false, supportsImage: true, itemFormat: "label = the date or milestone; text = what happened.", styles: [{ id: "timeline-style-1", name: "Milestone Spine" }, { id: "timeline-style-6", name: "Arc Journey" }] },
  { id: "roadmap", name: "Roadmap", group: "Process & Flow", description: "Phases or releases along a forward-looking path.", bestFor: "a roadmap of phases, quarters or releases.", minItems: 3, maxItems: 6, idealItems: 4, supportsIcons: false, supportsImage: false, itemFormat: "label = the phase/quarter; text = its goals.", styles: [{ id: "roadmap-style-1", name: "Milestone Road" }] },
  { id: "cascading", name: "Cascading Workflow", group: "Process & Flow", description: "Staggered numbered items cascading down the slide.", bestFor: "a workflow that reads as a descending cascade.", minItems: 3, maxItems: 6, idealItems: 4, supportsIcons: true, supportsImage: false, itemFormat: DEFAULT_FORMAT + " Items are in order.", styles: [{ id: "cascading-workflow", name: "Cascading Workflow" }] },
  { id: "chevron", name: "Chevron Flow", group: "Process & Flow", description: "Interlocking arrow/chevron segments flowing forward.", bestFor: "a directional process where momentum matters.", minItems: 3, maxItems: 6, idealItems: 5, supportsIcons: true, supportsImage: false, itemFormat: DEFAULT_FORMAT + " Items are in order.", styles: [{ id: "chevron-flow", name: "Chevron Flow" }, { id: "chevron-style-2", name: "Solid Arrow Row" }] },
  { id: "funnel", name: "Funnel Steps", group: "Process & Flow", description: "Stages narrowing from top to bottom.", bestFor: "conversion funnels or narrowing stages.", minItems: 3, maxItems: 6, idealItems: 4, supportsIcons: true, supportsImage: false, itemFormat: DEFAULT_FORMAT + " Items go widest→narrowest.", styles: [{ id: "funnel-steps", name: "Funnel Steps" }, { id: "funnel-style-2", name: "Centered Funnel" }] },
  { id: "cycle", name: "Cycle", group: "Process & Flow", description: "A circular loop of stages that repeats.", bestFor: "cyclical or repeating processes.", minItems: 3, maxItems: 6, idealItems: 4, supportsIcons: true, supportsImage: false, itemFormat: DEFAULT_FORMAT + " Items loop in order.", styles: [{ id: "cycle-style-1", name: "Loop" }, { id: "cycle-style-2", name: "Segment Ring" }] },
  { id: "kanban", name: "Kanban Board", group: "Process & Flow", description: "Columns of status cards (To Do / In Progress / Done).", bestFor: "project status, workstreams or task boards.", minItems: 3, maxItems: 12, idealItems: 6, supportsIcons: false, supportsImage: false, itemFormat: "label = \"Column: Card title\" (e.g. \"Doing: Build the API\"); text = an optional description. Cards group by the text before the colon.", styles: [{ id: "kanban-style-1", name: "Classic Board" }, { id: "kanban-style-3", name: "Accent Headers" }] },

  // ---- Diagrams & Relationships ----
  { id: "orbit", name: "Orbit Diagrams", group: "Diagrams & Relationships", description: "Relationship diagrams built from circles, rings and spectra.", bestFor: "a core concept surrounded by related parts.", minItems: 3, maxItems: 6, idealItems: 5, supportsIcons: true, supportsImage: false, itemFormat: DEFAULT_FORMAT, styles: [{ id: "orbit-rings", name: "Concentric Rings" }, { id: "orbit-style-5", name: "Satellites" }] },
  { id: "circles", name: "Circular Layouts", group: "Diagrams & Relationships", description: "Content arranged around circles, arcs, pies and wheels.", bestFor: "interconnected concepts shown in a circular form.", minItems: 3, maxItems: 8, idealItems: 5, supportsIcons: true, supportsImage: false, itemFormat: DEFAULT_FORMAT, styles: [{ id: "circle-ring", name: "Ring Cycle" }, { id: "circle-style-7", name: "Pie Segments" }] },
  { id: "hubspoke", name: "Hub & Spoke", group: "Diagrams & Relationships", description: "A central hub connected to radiating spokes.", bestFor: "one core idea connected to several parts.", minItems: 3, maxItems: 7, idealItems: 5, supportsIcons: true, supportsImage: false, itemFormat: "the FIRST item is the central hub; the rest are the spokes.", styles: [{ id: "hubspoke-style-1", name: "Radial Hub" }, { id: "hubspoke-style-3", name: "Sun Rays" }] },
  { id: "pyramid", name: "Pyramid", group: "Diagrams & Relationships", description: "A layered hierarchy from apex to base.", bestFor: "a hierarchy, priority stack or maturity model.", minItems: 3, maxItems: 5, idealItems: 4, supportsIcons: false, supportsImage: false, itemFormat: "items go from the apex (most important, first) down to the base.", styles: [{ id: "pyramid-style-1", name: "Hierarchy Pyramid" }, { id: "pyramid-style-2", name: "Triangle Split" }] },
  { id: "matrix", name: "2×2 Matrix", group: "Diagrams & Relationships", description: "A four-quadrant grid split by two axes.", bestFor: "exactly four quadrants of a strategic trade-off.", minItems: 4, maxItems: 4, idealItems: 4, supportsIcons: true, supportsImage: false, itemFormat: DEFAULT_FORMAT + " Provide exactly 4 items (the quadrants).", styles: [{ id: "matrix-style-1", name: "Quadrants" }, { id: "matrix-style-2", name: "Axis Matrix" }] },
  { id: "orgchart", name: "Org Chart", group: "Diagrams & Relationships", description: "A hierarchy tree with reporting lines.", bestFor: "org structures or any parent→child hierarchy.", minItems: 3, maxItems: 12, idealItems: 6, supportsIcons: false, supportsImage: false, itemFormat: "label encodes depth with leading dashes: \"Name\" = root, \"- Name\" = a report, \"-- Name\" = their report; text = the role.", styles: [{ id: "orgchart-style-1", name: "Top-Down Chart" }, { id: "orgchart-style-2", name: "Indented Tree" }] },
  { id: "proscons", name: "Pros & Cons", group: "Diagrams & Relationships", description: "Two sides weighing pros against cons.", bestFor: "advantages vs disadvantages of one thing.", minItems: 4, maxItems: 12, idealItems: 6, supportsIcons: true, supportsImage: false, itemFormat: "list all the PROS first, then all the CONS; keep them balanced in count.", styles: [{ id: "proscons-split", name: "Pros & Cons" }, { id: "proscons-style-2", name: "Two Columns" }] },
  { id: "comparison", name: "VS Comparison", group: "Diagrams & Relationships", description: "Two options compared side by side.", bestFor: "comparing two options, tools or approaches.", minItems: 4, maxItems: 12, idealItems: 6, supportsIcons: true, supportsImage: false, itemFormat: "list all points for option A first, then all points for option B.", styles: [{ id: "comparison-split", name: "VS Comparison" }, { id: "comparison-style-4", name: "Head to Head" }] },
  { id: "beforeafter", name: "Before & After", group: "Diagrams & Relationships", description: "A transformation from a before state to an after state.", bestFor: "showing change or transformation over time.", minItems: 4, maxItems: 12, idealItems: 6, supportsIcons: true, supportsImage: false, itemFormat: "list the BEFORE points first, then the AFTER points; keep them paired in order.", styles: [{ id: "beforeafter-circle", name: "Before & After" }, { id: "beforeafter-style-2", name: "Split Panel" }] },
  { id: "featurematrix", name: "Feature Matrix", group: "Diagrams & Relationships", description: "A ✓/✗ comparison grid across options.", bestFor: "comparing features across 2–4 options/plans.", minItems: 3, maxItems: 8, idealItems: 5, supportsIcons: false, supportsImage: false, itemFormat: "the FIRST item is the header: its text = the column names joined by \"|\" (e.g. \"Basic | Pro | Enterprise\"). Every following item is a feature row: label = the feature; text = the per-column cells joined by \"|\" using ✓ / ✗ / ~ or short values (e.g. \"✗ | ✓ | ✓\").", styles: [{ id: "featurematrix-style-1", name: "Check Grid" }, { id: "featurematrix-style-3", name: "Winner Column" }] },

  // ---- Data & Numbers ----
  { id: "dashboard", name: "KPI Dashboard", group: "Data & Numbers", description: "Headline metrics shown as stat cards, gauges and bars.", bestFor: "key statistics, KPIs or metrics.", minItems: 2, maxItems: 6, idealItems: 4, supportsIcons: false, supportsImage: false, itemFormat: "label = the metric value (e.g. \"92%\", \"$1.2M\"); text = what it measures.", styles: [{ id: "dashboard-style-1", name: "Metric Cards" }, { id: "dashboard-style-6", name: "Ring Gauges" }] },
  { id: "table", name: "Data Table", group: "Data & Numbers", description: "Data rows in editorial table treatments.", bestFor: "structured rows of label:value data.", minItems: 3, maxItems: 7, idealItems: 5, supportsIcons: false, supportsImage: false, itemFormat: "label = the row label; text = the row's value(s).", styles: [{ id: "table-style-1", name: "Editorial Table" }, { id: "table-style-9", name: "Spec Sheet" }] },

  // ---- Images & Media ----
  { id: "images", name: "Image Gallery", group: "Images & Media", description: "Image-forward gallery layouts.", bestFor: "content that is primarily about images/photos.", minItems: 1, maxItems: 6, idealItems: 3, supportsIcons: false, supportsImage: true, itemFormat: "label = the caption title; text = a short caption. Requires images.", styles: [{ id: "image-style-1", name: "Compact Gallery" }, { id: "image-style-8", name: "Cinematic Overlay" }] },
];

const FAMILY_BY_ID = new Map(LAYOUT_CATALOG.map((f) => [f.id, f]));

export function familyById(id: string): CatalogFamily | undefined {
  return FAMILY_BY_ID.get(id);
}

export function isValidFamily(id: string): boolean {
  return FAMILY_BY_ID.has(id);
}

/** The default style id applied for a family (first listed, else `<id>-style-1`). */
export function defaultStyleFor(id: string): string {
  const fam = FAMILY_BY_ID.get(id);
  return fam?.styles[0]?.id ?? `${id}-style-1`;
}

/** True if `styleId` is one of the family's catalog styles. */
export function isKnownStyle(familyId: string, styleId: string): boolean {
  return !!FAMILY_BY_ID.get(familyId)?.styles.some((s) => s.id === styleId);
}

/** Families the LLM may choose from, optionally excluding image-incompatible ones. */
export function catalogFamilies(opts: { hasImage?: boolean } = {}): CatalogFamily[] {
  return opts.hasImage ? LAYOUT_CATALOG.filter((f) => f.supportsImage) : LAYOUT_CATALOG;
}

/**
 * The catalog as compact JSON for an LLM prompt. One line per family with the
 * fields the model needs to choose and to shape the slide's items.
 */
export function getLayoutCatalogJson(opts: { hasImage?: boolean } = {}): string {
  const families = catalogFamilies(opts).map((f) => ({
    family: f.id,
    name: f.name,
    group: f.group,
    bestFor: f.bestFor,
    items: `${f.minItems}-${f.maxItems} (ideal ${f.idealItems})`,
    supportsImage: f.supportsImage,
    itemFormat: f.itemFormat,
    defaultStyle: f.styles[0]?.id,
    styles: f.styles.map((s) => s.id),
  }));
  return JSON.stringify(families);
}
