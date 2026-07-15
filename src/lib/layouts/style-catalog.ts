/**
 * Style catalog — the complete per-style metadata for EVERY content-layout
 * family (id, display name, description, item capacity). Extracted from
 * ContentLayoutPanel so that server code (generation's random style picker)
 * and the editor panel share one source of truth.
 *
 * Families with lib-exported arrays map them directly; the newer single-type
 * families get their metadata from styleEntry(...) rows below.
 */
import type { ContentLayoutCategory } from "~/lib/layouts/content";
import { boxLayouts } from "~/lib/layouts/content/boxes";
import { stepsLayouts } from "~/lib/layouts/content/steps";
import { bulletLayouts } from "~/lib/layouts/content/bullets";
import { quotesLayouts } from "~/lib/layouts/content/quotes";
import { imageLayouts } from "~/lib/layouts/content/images";
import { circleLayouts } from "~/lib/layouts/content/circles";
import { sequenceLayouts } from "~/lib/layouts/content/sequence";
import { cascadingLayouts } from "~/lib/layouts/content/cascading";
import { chevronLayouts } from "~/lib/layouts/content/chevron";
import { funnelLayouts } from "~/lib/layouts/content/funnel";
import { prosConsLayouts } from "~/lib/layouts/content/proscons";
import { beforeAfterLayouts } from "~/lib/layouts/content/beforeafter";
import { comparisonLayouts } from "~/lib/layouts/content/comparison";

export interface StyleCatalogEntry {
  id: string;
  name: string;
  description: string;
  minItems: number;
  maxItems: number;
  idealItems: number;
  supportsIcons?: boolean;
}

export interface StyleCatalogCategory {
  id: ContentLayoutCategory;
  name: string;
  description: string;
  layouts: StyleCatalogEntry[];
}


// Compact metadata builder for the newer single-style categories (their lib
// files export only a type — the panel supplies display metadata here).
const styleEntry = (
  id: string,
  name: string,
  description: string,
  minItems: number,
  maxItems: number,
  idealItems: number,
) => ({ id, name, description, minItems, maxItems, idealItems, supportsIcons: true });

// All layout categories with their layouts
export const ALL_STYLE_CATEGORIES: StyleCatalogCategory[] = [
  {
    id: "boxes",
    name: "Box Cards",
    description: "Content in styled card boxes",
    layouts: boxLayouts.map(l => ({ ...l, id: l.id })),
  },
  {
    id: "steps",
    name: "Steps & Process",
    description: "Step-by-step process flows",
    layouts: stepsLayouts.map(l => ({ ...l, id: l.id })),
  },
  {
    id: "bullets",
    name: "Bullet Points",
    description: "Traditional bullet lists",
    // "Checklist" style dropped: it duplicates the dedicated Checklist category
    layouts: bulletLayouts.filter(l => l.name !== "Checklist").map(l => ({ ...l, id: l.id })),
  },
  {
    id: "quotes",
    name: "Quotes & Testimonials",
    description: "Quote and testimonial styles",
    layouts: quotesLayouts.map(l => ({ ...l, id: l.id })),
  },
  {
    id: "images",
    name: "Image Gallery",
    description: "Image-focused layouts",
    layouts: imageLayouts.map(l => ({ ...l, id: l.id })),
  },
  {
    id: "circles",
    name: "Circular Layouts",
    description: "Circular and arc arrangements",
    // "Iterative Cycle" style dropped: it duplicates the dedicated Cycle category
    layouts: circleLayouts.filter(l => l.name !== "Iterative Cycle").map(l => ({ ...l, id: l.id, supportsIcons: true })),
  },
  {
    id: "sequence",
    name: "Sequence & Timeline",
    description: "Sequential process and timeline flows",
    // "Timeline" style dropped: it duplicates the dedicated Timeline category
    layouts: sequenceLayouts.filter(l => l.name !== "Timeline").map(l => ({ ...l, id: l.id, supportsIcons: true })),
  },
  {
    id: "cascading",
    name: "Cascading Workflow",
    description: "Staggered workflow with numbered items",
    layouts: cascadingLayouts.map(l => ({ ...l, id: l.id, supportsIcons: true })),
  },
  {
    id: "chevron",
    name: "Chevron Flow",
    description: "Horizontal chevron arrows with numbered steps",
    layouts: chevronLayouts.map(l => ({ ...l, id: l.id, supportsIcons: true })),
  },
  {
    id: "funnel",
    name: "Funnel Steps",
    description: "Funnel-style bars with icons and side content",
    layouts: funnelLayouts.map(l => ({ ...l, id: l.id, supportsIcons: true })),
  },
  {
    id: "proscons",
    name: "Pros & Cons",
    description: "Split circle diagram with pros and cons",
    layouts: prosConsLayouts.map(l => ({ ...l, id: l.id, supportsIcons: true })),
  },
  {
    id: "beforeafter",
    name: "Before & After",
    description: "Circular comparison diagram showing transformation",
    layouts: beforeAfterLayouts.map(l => ({ ...l, id: l.id, supportsIcons: true })),
  },
  {
    id: "comparison",
    name: "VS Comparison",
    description: "Vertical split comparison with items on both sides",
    layouts: comparisonLayouts.map(l => ({ ...l, id: l.id, supportsIcons: true })),
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Magazine-style numbered rows and header-band cards",
    layouts: [
      styleEntry("editorial-numbers", "Ghost Numerals", "Oversized numerals with uppercase headings and hairline rules", 3, 5, 4),
      styleEntry("editorial-edge-cards", "Edge Badge Cards", "Stacked cards with the number badge overlapping the left edge", 3, 5, 4),
      styleEntry("editorial-split-cards", "Header-Band Cards", "Cards with a filled header band and quiet body", 2, 6, 4),
      styleEntry("editorial-cascade", "Cascade Bars", "Numbered bars widening step by step", 3, 5, 4),
      styleEntry("editorial-rule-grid", "Rule Grid", "Numbered columns with an accent rule under each index", 3, 6, 4),
      styleEntry("editorial-ledger", "Ledger Rows", "Headings with a hairline running to the right edge", 3, 6, 4),
      styleEntry("editorial-chips", "Takeaway Chips", "Soft accent-tinted chips with bold lead-ins", 2, 6, 4),
      styleEntry("editorial-dropcap", "Drop Cap Story", "Magazine columns opened by an oversized drop-cap numeral", 3, 4, 3),
      styleEntry("editorial-margin", "Margin Notes", "Book-style margin labels beside a continuous reading spine", 3, 6, 4),
      styleEntry("editorial-lede", "Lede & Deck", "A lead story with an accent bar, supporting points in a deck below", 3, 5, 4),
      styleEntry("editorial-verso", "Verso · Recto", "Alternating aligned entries across a center spine", 3, 5, 4),
      styleEntry("editorial-roman", "Roman Chapters", "Formal centered columns with italic roman numerals", 3, 5, 4),
    ],
  },
  {
    id: "orbit",
    name: "Orbit Diagrams",
    description: "Relationship diagrams built from circles and spectra",
    layouts: [
      styleEntry("orbit-rings", "Concentric Rings", "A core idea in outline rings with callouts at the compass points", 3, 4, 4),
      styleEntry("orbit-overlap", "Overlap Circles", "Three overlapping circles with the middle one emphasized", 3, 3, 3),
      styleEntry("orbit-phases", "Phase Circles", "Circle row where solid vs tint reads as status", 3, 4, 4),
      styleEntry("orbit-spectrum", "Spectrum Line", "Glow dots on a gradient line with labels above and below", 3, 5, 4),
      styleEntry("orbit-style-5", "Satellites", "A core node with small satellites orbiting on a ring", 3, 6, 5),
      styleEntry("orbit-style-6", "Solar System", "Nested orbit rings with a node on each ring", 3, 5, 4),
      styleEntry("orbit-style-7", "Molecule", "Bonded nodes radiating from a central atom", 3, 6, 5),
      styleEntry("orbit-style-8", "Gauge Orbit", "A semicircle dial of segments with a legend", 3, 5, 4),
      styleEntry("orbit-style-9", "Radar", "Concentric radar rings with plotted nodes", 3, 6, 5),
      styleEntry("orbit-style-10", "Halo", "A soft glowing ring of nodes around a core", 3, 6, 5),
      styleEntry("orbit-style-11", "Constellation", "Nodes linked by a connecting star path", 3, 6, 5),
      styleEntry("orbit-style-12", "Nucleus", "Overlapping translucent orbit ellipses with nodes", 3, 6, 5),
    ],
  },
  {
    id: "bento",
    name: "Bento Grid",
    description: "Asymmetric card mosaic with a hero card",
    layouts: [
      styleEntry("bento-style-1", "Bento Mosaic", "One hero card plus supporting tiles in a mosaic", 3, 6, 5),
      styleEntry("bento-style-2", "Banner Hero", "Hero spans the full top row with tiles beneath", 3, 6, 4),
      styleEntry("bento-style-3", "Even Quilt", "Uniform tiles with an alternating accent tint", 3, 6, 4),
      styleEntry("bento-style-4", "Right Hero", "Hero full-height on the right, tiles stacked left", 3, 6, 4),
      styleEntry("bento-style-5", "Pinwheel", "A center accent tile framed by surrounding tiles", 4, 6, 5),
      styleEntry("bento-style-6", "Stack Bento", "Full-width rows with the first as an accent hero", 3, 6, 4),
    ],
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Milestones in time order — spines, metro lines, flags, eras and arcs",
    layouts: [
      styleEntry("timeline-style-1", "Milestone Spine", "Alternating milestone cards on a horizontal spine", 3, 5, 4),
      styleEntry("timeline-style-2", "Metro Line", "Transit-style thick line with station rings and cards below", 3, 5, 4),
      styleEntry("timeline-style-3", "Vertical Spine", "Center spine with alternating left/right milestone cards", 3, 6, 4),
      styleEntry("timeline-style-4", "Milestone Flags", "Flag cards on poles rising step by step from a baseline", 3, 5, 4),
      styleEntry("timeline-style-5", "Era Columns", "Chapter columns with oversized period numerals and hairlines", 3, 5, 4),
      styleEntry("timeline-style-6", "Arc Journey", "Milestones climbing an ascending accent curve", 3, 5, 4),
      styleEntry("timeline-style-7", "Serpentine Path", "S-shaped path over two rows with a U-turn on the right", 4, 6, 5),
      styleEntry("timeline-style-8", "Phase Bars", "Gantt-style waterfall bars over a faint period grid", 3, 5, 4),
      styleEntry("timeline-style-9", "Progress Track", "Filled progress bar with numbered checkpoints and percent markers", 3, 5, 4),
      styleEntry("timeline-style-10", "Dotted Trail", "Dotted connector with period chips and a destination arrowhead", 3, 5, 4),
    ],
  },
  {
    id: "agenda",
    name: "Agenda",
    description: "Numbered agendas and tables of contents",
    layouts: [
      styleEntry("agenda-style-1", "Numbered Agenda", "Elegant numbered rows with squircle badges", 3, 8, 5),
      styleEntry("agenda-style-2", "Dotted Contents", "Classic table of contents with dotted leaders and page-style numbers", 3, 8, 5),
      styleEntry("agenda-style-3", "Session Cards", "Boarding-pass rows with an accent number block and chevron", 3, 6, 4),
      styleEntry("agenda-style-4", "Tab Stops", "Square number tabs on a continuous vertical line", 3, 8, 5),
      styleEntry("agenda-style-5", "Twin Columns", "Balanced two-column contents split by a center rule", 4, 8, 6),
      styleEntry("agenda-style-6", "Display Contents", "Oversized headline rows with superscript numbers", 3, 5, 4),
      styleEntry("agenda-style-7", "Corner Index", "Quiet cards with oversized ghost numerals in the corner", 3, 6, 4),
      styleEntry("agenda-style-8", "Ribbon Bookmarks", "Numbered bookmark ribbons hanging from a top rule", 3, 5, 4),
      styleEntry("agenda-style-9", "Up Next", "A highlighted first session with compact rows beneath", 3, 6, 4),
      styleEntry("agenda-style-10", "Folder Tabs", "Tabbed section columns with the first tab active", 3, 4, 3),
    ],
  },
  {
    id: "checklist",
    name: "Checklist",
    description: "Check items for takeaways or requirements",
    layouts: [
      styleEntry("checklist-style-1", "Check Cards", "Accent check badges on tidy cards", 3, 8, 5),
      styleEntry("checklist-style-2", "Square Ticks", "Crisp filled checkbox squares in an airy grid", 3, 8, 4),
      styleEntry("checklist-style-3", "Pill Checks", "Soft full-width pills with ring checks", 3, 6, 4),
      styleEntry("checklist-style-4", "Ledger Checks", "Hairline ledger rows with the check at the row end", 3, 8, 4),
      styleEntry("checklist-style-5", "Ring Checks", "Checks inside completed progress rings", 3, 6, 4),
      styleEntry("checklist-style-6", "Stamp Cards", "Cards with a rotated ghost check watermark", 3, 6, 4),
      styleEntry("checklist-style-7", "Check Rail", "Check nodes threaded on a vertical accent rail", 3, 6, 4),
      styleEntry("checklist-style-8", "Mono Checklist", "Terminal-style [x] markers with mono labels", 3, 8, 4),
      styleEntry("checklist-style-9", "Shield Checks", "Verification shields beside each requirement", 3, 6, 4),
      styleEntry("checklist-style-10", "Split Domino", "Rows split into a tinted check cell and a quiet text cell", 3, 6, 4),
    ],
  },
  {
    id: "icongrid",
    name: "Icon Grid",
    description: "Feature grid with premium icon chips",
    layouts: [
      styleEntry("icongrid-style-1", "Feature Grid", "Icon chips with bold titles in a balanced grid", 3, 6, 6),
      styleEntry("icongrid-style-2", "Icon Cards", "Each feature in a surface card with the chip on top", 3, 6, 4),
      styleEntry("icongrid-style-3", "Icon Rows", "Icon chip on the left, label and text on the right", 3, 6, 4),
      styleEntry("icongrid-style-4", "Ring Badges", "Icons inside gradient rings in a centered grid", 3, 6, 4),
      styleEntry("icongrid-style-5", "Top Accent Cards", "Cards with an accent top bar and a gradient chip", 3, 6, 4),
      styleEntry("icongrid-style-6", "Numbered Icons", "A big numeral paired with a small icon, editorial", 3, 6, 4),
    ],
  },
  {
    id: "dashboard",
    name: "KPI Dashboard",
    description: "Headline metrics in four premium treatments",
    layouts: [
      styleEntry("dashboard-style-1", "Metric Cards", "Key numbers shown as premium stat cards", 2, 6, 4),
      styleEntry("dashboard-style-2", "Stat Rail", "Open columns with huge gradient numerals", 2, 4, 3),
      styleEntry("dashboard-style-3", "Metric Pills", "Numerals in soft accent pills with captions", 2, 4, 3),
      styleEntry("dashboard-style-4", "Hero Metric", "One dominant KPI beside supporting stats", 2, 5, 4),
      styleEntry("dashboard-style-5", "Progress Bars", "Label + numeral rows with accent completion bars", 2, 5, 4),
      styleEntry("dashboard-style-6", "Ring Gauges", "Arc rings with the numeral centered", 2, 4, 3),
      styleEntry("dashboard-style-7", "Ticker Board", "Inverted contrast tiles like a market ticker", 2, 4, 3),
      styleEntry("dashboard-style-8", "Leaderboard", "Ranked rows with values and trend chips", 3, 6, 4),
      styleEntry("dashboard-style-9", "Dot Matrix", "Percentages as filled-vs-outline dot grids", 2, 3, 3),
      styleEntry("dashboard-style-10", "Corner Stats", "Quadrant crosshair with corner-anchored stats", 4, 4, 4),
      styleEntry("dashboard-style-11", "Sparkline Cards", "Trend cards with decorative mini area charts", 2, 4, 4),
      styleEntry("dashboard-style-12", "Badge Stack", "Numerals in gradient squircle badges", 2, 4, 3),
    ],
  },
  {
    id: "table",
    name: "Data Table",
    description: "Data rows in four editorial treatments",
    layouts: [
      styleEntry("table-style-1", "Editorial Table", "Zebra rows, uppercase headers, accent top rule", 3, 7, 5),
      styleEntry("table-style-2", "Numbered Ledger", "Open rows with big row numerals and hairlines", 3, 7, 5),
      styleEntry("table-style-3", "Split Panels", "Tinted label cell beside a plain definition cell", 2, 6, 4),
      styleEntry("table-style-4", "Accent Rail", "Solid accent label column with white text", 2, 6, 4),
      styleEntry("table-style-5", "Floating Rows", "Separated shadow rows with accent label chips", 2, 6, 4),
      styleEntry("table-style-6", "Print Minimal", "Right-aligned small-caps labels, luxury spacing", 2, 5, 4),
      styleEntry("table-style-7", "Duo Tone", "Alternating tinted row blocks with inline lead-ins", 3, 7, 5),
      styleEntry("table-style-8", "Grid Cells", "Two-column cell grid with shared hairline borders", 4, 6, 4),
      styleEntry("table-style-9", "Spec Sheet", "Dotted leader lines between mono labels and values", 3, 7, 5),
      styleEntry("table-style-10", "Hero Row", "First row as a bold accent block above quiet rows", 3, 6, 4),
    ],
  },
  {
    id: "team",
    name: "Team Cards",
    description: "People cards with avatar initials",
    layouts: [
      styleEntry("team-style-1", "Team Grid", "Name and role cards with avatar chips", 2, 8, 4),
      styleEntry("team-style-2", "Roster Rows", "Avatar left, name and role right, list with dividers", 2, 6, 5),
      styleEntry("team-style-3", "Banner Profiles", "Cards with an accent top banner and overlapping avatar", 2, 6, 4),
      styleEntry("team-style-4", "Ring Avatars", "Gradient-ring avatars with the role in an accent chip", 2, 6, 4),
      styleEntry("team-style-5", "Featured Lead", "One large featured member beside compact teammates", 3, 6, 4),
      styleEntry("team-style-6", "Avatar Strip", "A horizontal strip of avatars with names beneath", 3, 6, 6),
      styleEntry("team-style-7", "Quote Cards", "Avatar, name, role and a short bio on an accent rule", 2, 6, 4),
      styleEntry("team-style-8", "Mono Roster", "Chromeless roster with square initials and small-caps roles", 3, 6, 5),
    ],
  },
  {
    id: "showcase",
    name: "Feature Showcase",
    description: "Editorial split: big lead idea plus feature points",
    layouts: [
      styleEntry("showcase-style-1", "Magazine Split", "Lead headline on the left, numbered features on the right", 2, 6, 4),
      styleEntry("showcase-style-2", "Spotlight Panel", "An accent gradient lead panel beside a feature list", 3, 6, 4),
      styleEntry("showcase-style-3", "Headline Band", "A lead headline band on top with a feature grid below", 3, 6, 4),
      styleEntry("showcase-style-4", "Feature Cards", "Lead text on the left with feature mini-cards stacked right", 3, 6, 4),
      styleEntry("showcase-style-5", "Editorial Rail", "A vertical accent rail and eyebrow with flowing features", 3, 6, 4),
      styleEntry("showcase-style-6", "Quote Lead", "An oversized pull-quote lead with feature chips beneath", 3, 6, 4),
    ],
  },
  {
    id: "zigzag",
    name: "Zigzag Story",
    description: "Alternating left/right flow cards",
    layouts: [
      styleEntry("zigzag-style-1", "Alternating Flow", "Cards weaving left and right down the slide", 3, 5, 4),
      styleEntry("zigzag-style-2", "Center Spine", "A vertical spine with cards alternating on nodes", 3, 5, 4),
      styleEntry("zigzag-style-3", "Diagonal Steps", "Cards stepping down-right with arrow connectors", 3, 5, 4),
      styleEntry("zigzag-style-4", "Number Weave", "Oversized alternating-side numerals, chromeless", 3, 5, 4),
      styleEntry("zigzag-style-5", "Ribbon Panels", "Full-width panels with an alternating accent tint", 3, 5, 4),
      styleEntry("zigzag-style-6", "Connector Arrows", "Alternating cards joined by dashed S-curve arrows", 3, 5, 4),
      styleEntry("zigzag-style-7", "Split Rows", "A number cell and text that swap sides each row", 3, 5, 4),
      styleEntry("zigzag-style-8", "Ghost Weave", "Cards with a large ghost numeral and slight overlap", 3, 5, 4),
    ],
  },
  {
    id: "roadmap",
    name: "Roadmap",
    description: "Vertical timeline of milestones",
    layouts: [
      styleEntry("roadmap-style-1", "Vertical Roadmap", "Phases stacked on a vertical spine", 3, 6, 4),
      styleEntry("roadmap-style-2", "Summit Route", "Dashed route climbing a mountain ridge to a summit flag", 3, 5, 4),
      styleEntry("roadmap-style-3", "Runway", "Perspective runway with milestones alternating along the centerline", 3, 6, 4),
      styleEntry("roadmap-style-4", "Horizon Bands", "Stacked bands narrowing toward the horizon — now to later", 3, 5, 4),
      styleEntry("roadmap-style-5", "Signposts", "Sign boards pointing alternately off a central post", 3, 5, 4),
      styleEntry("roadmap-style-6", "Winding Road", "A curving road ribbon with numbered location pins", 3, 5, 4),
      styleEntry("roadmap-style-7", "Milestone Gates", "Checkpoint arches straddling a straight road", 3, 5, 4),
      styleEntry("roadmap-style-8", "Compass Legs", "Journey legs with turning compass dials", 3, 6, 4),
      styleEntry("roadmap-style-9", "Stepping Stones", "Numbered stones crossing a stream band", 3, 5, 4),
      styleEntry("roadmap-style-10", "Mile Markers", "Marker posts rising from a bottom road strip", 3, 6, 4),
      styleEntry("roadmap-style-11", "Destination Board", "Departure-board rows with mono type and status dots", 3, 6, 4),
      styleEntry("roadmap-style-12", "Journey Ticket", "One perforated ticket strip with text below each segment", 3, 5, 4),
    ],
  },
  {
    id: "definitionlist",
    name: "Definition List",
    description: "Term and definition rows",
    layouts: [
      styleEntry("definitionlist-style-1", "Glossary", "Bold terms with full-width definitions", 3, 6, 4),
      styleEntry("definitionlist-style-2", "Dictionary Entries", "Serif terms with hanging-indent definitions", 3, 6, 4),
      styleEntry("definitionlist-style-3", "Flash Cards", "Term band on top, definition below, card grid", 3, 6, 4),
      styleEntry("definitionlist-style-4", "Glossary Table", "Right-aligned small-caps terms beside a vertical rule", 3, 6, 4),
      styleEntry("definitionlist-style-5", "Brace Notes", "A large accent brace introducing each definition", 3, 5, 4),
      styleEntry("definitionlist-style-6", "Equals Notation", "Term = definition mapping rows", 3, 6, 4),
      styleEntry("definitionlist-style-7", "Highlight Terms", "Highlighted terms flowing inline with their definitions", 3, 6, 4),
      styleEntry("definitionlist-style-8", "Corner Tags", "Cards with the term in a folded corner tag", 3, 6, 4),
      styleEntry("definitionlist-style-9", "Numbered Lexicon", "Mono index, tracked-out terms and dotted leaders", 3, 6, 4),
      styleEntry("definitionlist-style-10", "Arrow Map", "Term mapped to definition along an accent arrow", 3, 6, 4),
      styleEntry("definitionlist-style-11", "Sticky Notes", "Tilted note cards with folded corners", 3, 6, 4),
      styleEntry("definitionlist-style-12", "Ghost Initials", "Cards backed by the term's oversized initial letter", 3, 6, 4),
    ],
  },
  {
    id: "pyramid",
    name: "Pyramid",
    description: "Layered hierarchy from apex to base",
    layouts: [
      styleEntry("pyramid-style-1", "Hierarchy Pyramid", "Stacked tiers narrowing to the top", 3, 5, 4),
      styleEntry("pyramid-style-2", "Triangle Split", "A solid triangle sliced into bands with captions", 3, 5, 4),
      styleEntry("pyramid-style-3", "Inverted Funnel", "Widest at the top, narrowing down", 3, 5, 4),
      styleEntry("pyramid-style-4", "Layer Cake", "Stacked 3D slabs with side captions", 3, 5, 4),
      styleEntry("pyramid-style-5", "Numbered Steps", "Ascending bars rising to a peak with badges", 3, 5, 4),
      styleEntry("pyramid-style-6", "Maslow Bands", "Full-width tiers labelled inside with captions right", 3, 5, 4),
      styleEntry("pyramid-style-7", "Nested Chevrons", "Concentric chevron tiers pointing up", 3, 5, 4),
      styleEntry("pyramid-style-8", "Apex Callouts", "An outline triangle with numbered caption lines", 3, 5, 4),
      styleEntry("pyramid-style-9", "Prism", "A gradient triangle with dividers and captions", 3, 5, 4),
      styleEntry("pyramid-style-10", "Ascending Rows", "Quiet rows growing in weight toward the base", 3, 5, 4),
    ],
  },
  {
    id: "matrix",
    name: "2×2 Matrix",
    description: "Quadrant grid split by two axes",
    layouts: [
      styleEntry("matrix-style-1", "Quadrants", "Four quadrants for strategic trade-offs", 4, 4, 4),
      styleEntry("matrix-style-2", "Axis Matrix", "Quadrants with labelled X and Y axis arrows", 4, 4, 4),
      styleEntry("matrix-style-3", "Quadrant Cards", "Four separated cards with ghost number badges", 4, 4, 4),
      styleEntry("matrix-style-4", "Plotted Bubbles", "A plotting field with a bubble per quadrant", 4, 4, 4),
      styleEntry("matrix-style-5", "Corner Numbers", "Quadrants with oversized ghost numerals", 4, 4, 4),
      styleEntry("matrix-style-6", "Header Bands", "Each quadrant with an accent header band", 4, 4, 4),
    ],
  },
  {
    id: "hubspoke",
    name: "Hub & Spoke",
    description: "Central hub with radiating spokes",
    layouts: [
      styleEntry("hubspoke-style-1", "Radial Hub", "One core idea connected to surrounding parts", 3, 7, 5),
      styleEntry("hubspoke-style-2", "Satellite Cards", "Hub with connector lines to circular satellite nodes", 3, 7, 5),
      styleEntry("hubspoke-style-3", "Sun Rays", "A glowing hub emitting rays to labelled nodes", 3, 7, 5),
      styleEntry("hubspoke-style-4", "Left Hub", "Hub on the left with spokes fanning to the right", 3, 7, 5),
      styleEntry("hubspoke-style-5", "Numbered Spokes", "Hub with numbered spoke chips around it", 3, 7, 5),
      styleEntry("hubspoke-style-6", "Gear Hub", "A hub framed by a cog with spoke cards", 3, 7, 5),
      styleEntry("hubspoke-style-7", "Bubble Cluster", "A hub bubble surrounded by size-varied bubbles", 3, 7, 5),
      styleEntry("hubspoke-style-8", "Mind Map", "A central node branching to left/right spokes", 3, 7, 5),
      styleEntry("hubspoke-style-9", "Orbit Hub", "A hub inside a ring with nodes docked on it", 3, 7, 5),
      styleEntry("hubspoke-style-10", "Spotlight Hub", "A hub card above a grid of spokes", 3, 7, 5),
    ],
  },
  {
    id: "cycle",
    name: "Cycle",
    description: "Circular loop process diagram",
    layouts: [
      styleEntry("cycle-style-1", "Loop", "Numbered nodes around a continuous circle", 3, 6, 4),
      styleEntry("cycle-style-2", "Segment Ring", "Bold colored arc segments form the loop", 3, 6, 4),
      styleEntry("cycle-style-3", "Stadium Track", "Cards docked around a rounded racetrack", 3, 6, 4),
      styleEntry("cycle-style-4", "Chevron Ring", "Accent nodes with chevrons circling between", 3, 6, 4),
      styleEntry("cycle-style-5", "Split Cycle", "Mini ring diagram beside a numbered list", 3, 6, 4),
      styleEntry("cycle-style-6", "Infinity Loop", "Stages riding a figure-eight path", 3, 5, 4),
      styleEntry("cycle-style-7", "Clock Face", "Tick ring with an accent hand sweeping the stages", 3, 6, 4),
      styleEntry("cycle-style-8", "Recycle Triad", "Triangular loop with curved corner arrows", 3, 4, 3),
      styleEntry("cycle-style-9", "Momentum Spiral", "Stages growing along an outward spiral", 3, 5, 4),
      styleEntry("cycle-style-10", "Dial Gauge", "Half-donut dial segments with a legend below", 3, 5, 4),
      styleEntry("cycle-style-11", "Loop Timeline", "Out along the top row, back along the bottom", 4, 6, 5),
      styleEntry("cycle-style-12", "Classic Cycle", "Glowing gradient nodes joined by arc arrows", 3, 6, 4),
    ],
  },
  {
    id: "callout",
    name: "Callout",
    description: "Highlighted key-note boxes",
    layouts: [
      styleEntry("callout-style-1", "Key Notes", "Accent callout boxes that demand attention", 1, 4, 2),
      styleEntry("callout-style-2", "Alert Banner", "Bold colored banner strips with an icon badge", 1, 3, 2),
      styleEntry("callout-style-3", "Sticky Notes", "Softly rotated sticky-note cards with tape", 1, 3, 2),
      styleEntry("callout-style-4", "Admonition", "Outlined cards with an accent header label", 1, 3, 2),
      styleEntry("callout-style-5", "Icon Spotlight", "A big centered icon above a statement", 1, 1, 1),
      styleEntry("callout-style-6", "Pull Callout", "A thick left accent bar with large text", 1, 1, 1),
      styleEntry("callout-style-7", "Gradient Panel", "A full accent-gradient panel with white text", 1, 1, 1),
      styleEntry("callout-style-8", "Double Rule", "A statement framed by top and bottom rules", 1, 1, 1),
      styleEntry("callout-style-9", "Tab Label", "A folder-tab accent label on top of the card", 1, 3, 2),
      styleEntry("callout-style-10", "Corner Fold", "Cards with a folded dog-ear corner accent", 1, 3, 2),
    ],
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "One bold centered statement",
    layouts: [
      styleEntry("spotlight-style-1", "Big Statement", "A single hero statement, front and center", 1, 2, 1),
      styleEntry("spotlight-style-2", "Quote Frame", "The statement bracketed by giant quote marks", 1, 2, 1),
      styleEntry("spotlight-style-3", "Gradient Glow", "A radial accent glow behind the statement", 1, 3, 1),
      styleEntry("spotlight-style-4", "Left Statement", "A left-aligned statement with a thick rule", 1, 3, 1),
      styleEntry("spotlight-style-5", "Stat Hero", "The label as a giant stat with a caption", 1, 3, 1),
      styleEntry("spotlight-style-6", "Framed Statement", "The statement inside an accent corner frame", 1, 2, 1),
      styleEntry("spotlight-style-7", "Accent Band", "The statement on a full-width accent band", 1, 2, 1),
      styleEntry("spotlight-style-8", "Underline Sweep", "A centered statement over a bold accent bar", 1, 3, 1),
      styleEntry("spotlight-style-9", "Side Rule", "A tall accent rule with a rotated kicker", 1, 2, 1),
      styleEntry("spotlight-style-10", "Mark Above", "A large decorative accent mark above the text", 1, 2, 1),
    ],
  },
  {
    id: "pricing",
    name: "Pricing & Plans",
    description: "Tiered plan cards with price, features and a call to action",
    layouts: [
      styleEntry("pricing-style-1", "Plan Cards", "Three tiers with the middle plan highlighted", 2, 4, 3),
      styleEntry("pricing-style-2", "Popular Ribbon", "Plan cards with a ribbon on the featured tier", 2, 4, 3),
      styleEntry("pricing-style-3", "Gradient Hero", "The featured plan enlarged beside the others", 2, 4, 3),
      styleEntry("pricing-style-4", "Minimal Tiers", "Typographic, hairline-separated plan columns", 2, 4, 3),
      styleEntry("pricing-style-5", "Stacked Rows", "Full-width plan rows with the price on the right", 2, 4, 3),
      styleEntry("pricing-style-6", "Toggle Cards", "Compact cards with a feature-dot summary", 2, 4, 3),
      styleEntry("pricing-style-7", "Segmented Toggle", "A monthly/annual pill header over the cards", 2, 4, 3),
      styleEntry("pricing-style-8", "Glass Tiers", "Frosted glassmorphic plan cards", 2, 4, 3),
      styleEntry("pricing-style-9", "Spotlight Offer", "One plan enlarged and centered", 1, 3, 1),
    ],
  },
  {
    id: "featurematrix",
    name: "Feature Matrix",
    description: "A ✓/✗ comparison grid across options",
    layouts: [
      styleEntry("featurematrix-style-1", "Check Grid", "Accent header, zebra rows, tick cells", 3, 8, 5),
      styleEntry("featurematrix-style-2", "Card Cells", "Each cell rendered as its own chip", 3, 8, 5),
      styleEntry("featurematrix-style-3", "Winner Column", "One highlighted recommended column", 3, 8, 5),
      styleEntry("featurematrix-style-4", "Minimal Rules", "A hairline print table with small-caps header", 3, 8, 5),
      styleEntry("featurematrix-style-5", "Tinted Columns", "Each option column softly accent-tinted", 3, 8, 5),
      styleEntry("featurematrix-style-6", "Column Cards", "Each option as a card listing its ✓ features", 3, 8, 5),
      styleEntry("featurematrix-style-7", "Score Ranking", "Options ranked by their ✓ count with bars", 3, 8, 5),
      styleEntry("featurematrix-style-8", "Inverse Header", "A bold dark header band over the grid", 3, 8, 5),
      styleEntry("featurematrix-style-9", "Dense Print", "A compact tight table for many rows", 3, 8, 5),
    ],
  },
  {
    id: "kanban",
    name: "Kanban Board",
    description: "Columns of status cards (To Do / Doing / Done)",
    layouts: [
      styleEntry("kanban-style-1", "Classic Board", "Titled columns of status cards", 3, 12, 6),
      styleEntry("kanban-style-2", "Swimlanes", "Horizontal status lanes of cards", 3, 12, 6),
      styleEntry("kanban-style-3", "Accent Headers", "Columns with bold colored header bars", 3, 12, 6),
      styleEntry("kanban-style-4", "Sticky Notes", "Cards as tinted sticky notes", 3, 12, 6),
      styleEntry("kanban-style-5", "Progress Columns", "Columns with a fill bar showing load", 3, 12, 6),
      styleEntry("kanban-style-6", "Minimal Board", "Chromeless columns with hairline dividers", 3, 12, 6),
      styleEntry("kanban-style-7", "Timeline Board", "A progress rail flowing across the columns", 3, 12, 6),
      styleEntry("kanban-style-8", "Glass Columns", "Frosted translucent column panels", 3, 12, 6),
      styleEntry("kanban-style-9", "Compact Chips", "Dense one-line card chips per column", 3, 12, 6),
    ],
  },
  {
    id: "orgchart",
    name: "Org Chart",
    description: "A hierarchy tree with reporting lines",
    layouts: [
      styleEntry("orgchart-style-1", "Top-Down Chart", "Root on top with a connected row of reports", 3, 12, 6),
      styleEntry("orgchart-style-2", "Indented Tree", "File-explorer style with guide lines", 3, 12, 6),
      styleEntry("orgchart-style-3", "Left-to-Right", "A horizontal tree by level", 3, 12, 6),
      styleEntry("orgchart-style-4", "Bracket Tree", "A top-down tree with square connectors", 3, 12, 6),
      styleEntry("orgchart-style-5", "Nested Cards", "Children nested inside their parent's card", 3, 12, 6),
      styleEntry("orgchart-style-6", "Reporting Rail", "A vertical rail with tiered role badges", 3, 12, 6),
      styleEntry("orgchart-style-7", "Avatar Tree", "An indented tree with initial-avatar nodes", 3, 12, 6),
      styleEntry("orgchart-style-8", "Chip Cascade", "Nodes as connected pills cascading down-right", 3, 12, 6),
      styleEntry("orgchart-style-9", "Band Levels", "Depth grouped into labelled horizontal bands", 3, 12, 6),
    ],
  },
];

/** All styles registered for a family (empty array for unknown categories). */
export function stylesForCategory(category: string): StyleCatalogEntry[] {
  return ALL_STYLE_CATEGORIES.find((c) => c.id === category)?.layouts ?? [];
}

// ============================================================================
// Column classification — generation's style picker uses this to honor the
// rule: slides with 4+ items use multi-column layouts, sparser slides use
// single-column ones. Families set the default; STYLE_COLUMN_OVERRIDES wins
// per style. Anything unclassified is adaptive (eligible for any count —
// its renderer adjusts columns to the item count itself).
// ============================================================================
export type ColumnClass = "single" | "multi";

const SINGLE_COLUMN_FAMILIES: string[] = [
  "editorial", "agenda", "checklist", "definitionlist", "cascading",
  "zigzag", "callout", "spotlight", "funnel", "pyramid",
];

const MULTI_COLUMN_FAMILIES: string[] = [
  "boxes", "icongrid", "bento", "team", "showcase", "images", "dashboard",
  "matrix", "comparison", "proscons", "beforeafter", "pricing", "kanban",
  "featurematrix",
];

const STYLE_COLUMN_OVERRIDES: Record<string, ColumnClass> = {
  // bullets: grid/column spreads vs vertical lists
  "bullet-style-1": "multi",  // cards arranged in a grid
  "bullet-style-2": "multi",  // arranged in columns
  "bullet-style-5": "multi",  // two-column spread
  "bullet-style-8": "multi",  // notch cards (grid)
  "bullet-style-4": "single", // vertical arrow list
  "bullet-style-6": "single", // highlight lines
  "bullet-style-7": "single", // lead-in dash lines
  "bullet-style-9": "single", // oversized keyword rows
  "bullet-style-10": "single", // slash list
  // sequence: horizontal flows vs vertical journeys
  "sequence-style-1": "multi",
  "sequence-style-2": "multi",
  "sequence-style-3": "single",
  "sequence-style-4": "single",
  // quotes: the lone hero pull-quote
  "quote-style-3": "single",
};

/** Column behavior of a style: "single", "multi", or null (adaptive). */
export function columnClassFor(category: string, styleId: string): ColumnClass | null {
  const override = STYLE_COLUMN_OVERRIDES[styleId];
  if (override) return override;
  if (SINGLE_COLUMN_FAMILIES.includes(category)) return "single";
  if (MULTI_COLUMN_FAMILIES.includes(category)) return "multi";
  return null;
}
