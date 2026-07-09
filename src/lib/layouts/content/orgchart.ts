// Org chart / hierarchy tree content layout — nodes with reporting lines
// Convention: depth is encoded by leading dashes (or ">") in the label —
// "Name" = level 0 (root), "- Name" = level 1, "-- Name" = level 2, etc.
// label = the node's name (dashes stripped), text = an optional role/subtitle.
// orgchart-style-1: Top-Down Chart — root on top, children in a connected row
// orgchart-style-2: Indented Tree — file-explorer style with guide lines
// orgchart-style-3: Left-to-Right — a horizontal tree flowing rightward
// orgchart-style-4: Bracket Tree — nodes joined by bracket connectors
// orgchart-style-5: Nested Cards — children nested inside their parent's card
// orgchart-style-6: Reporting Rail — a vertical rail with tiered role badges
// orgchart-style-7: Avatar Tree — an indented tree with initial-avatar nodes
// orgchart-style-8: Chip Cascade — nodes as connected pills cascading down-right
// orgchart-style-9: Band Levels — depth grouped into labelled horizontal bands
export type OrgChartLayoutType =
  | "orgchart-style-1"
  | "orgchart-style-2"
  | "orgchart-style-3"
  | "orgchart-style-4"
  | "orgchart-style-5"
  | "orgchart-style-6"
  | "orgchart-style-7"
  | "orgchart-style-8"
  | "orgchart-style-9";
